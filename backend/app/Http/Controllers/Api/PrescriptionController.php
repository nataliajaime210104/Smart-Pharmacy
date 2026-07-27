<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use App\Services\MedicationScheduleGenerator;
use App\Services\InventoryAlertService;
use App\Services\NotificationDispatcher;
use App\Notifications\SmartPharmacyNotification;
use Illuminate\Validation\ValidationException;

class PrescriptionController extends Controller
{
    public function index()
    {
        $prescriptions = Prescription::with([
            'patient',
            'doctor',
            'items.medicine',
        ])
            ->orderBy('id', 'desc')
            ->get()
            ->map(fn ($prescription) => $this->formatPrescription($prescription));

        return response()->json([
            'success' => true,
            'data' => $prescriptions,
        ]);
    }

    public function checkStock(Request $request)
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.medicineId' => ['required', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ]);

        $stockValidation = $this->validatePrescriptionStock($validated['items']);

        return response()->json([
            'success' => true,
            'canCreate' => $stockValidation['isValid'],
            'data' => $stockValidation['items'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'patientId' => ['required', 'exists:patients,id'],
            'doctorId' => ['required', 'exists:users,id'],
            'diagnosis' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],

            'items' => ['required', 'array', 'min:1'],
            'items.*.medicineId' => ['required', 'exists:medicines,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.dosage' => ['nullable', 'string', 'max:255'],
            'items.*.frequency' => ['nullable', 'string', 'max:255'],
            'items.*.duration' => ['nullable', 'string', 'max:255'],
            'items.*.startTime' => ['nullable', 'date_format:H:i'],
            'items.*.instructions' => ['nullable', 'string'],
        ]);

        $stockValidation = $this->validatePrescriptionStock($validated['items']);

        if (!$stockValidation['isValid']) {
            return response()->json([
                'success' => false,
                'message' => 'No hay inventario suficiente para uno o más medicamentos.',
                'data' => $stockValidation['items'],
            ], 422);
        }

        $prescription = DB::transaction(function () use ($validated) {
            $prescription = Prescription::create([
                'folio' => $this->generateFolio(),
                'patient_id' => $validated['patientId'],
                'doctor_id' => $validated['doctorId'],
                'diagnosis' => $validated['diagnosis'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'Borrador',
            ]);

            $generator = new MedicationScheduleGenerator();

                foreach ($validated['items'] as $item) {

                    $prescriptionItem = PrescriptionItem::create([
                        'prescription_id' => $prescription->id,
                        'medicine_id' => $item['medicineId'],
                        'quantity' => $item['quantity'],
                        'dosage' => $item['dosage'] ?? null,
                        'frequency' => $item['frequency'] ?? null,
                        'duration' => $item['duration'] ?? null,
                        'start_time' => $item['startTime'] ?? null,
                        'instructions' => $item['instructions'] ?? null,
                    ]);

                    $generator->generate(
                        $prescription,
                        $prescriptionItem
                    );
                }
            return $prescription;
            
        });

        $prescription->load([
            'patient',
            'doctor',
            'items.medicine',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Receta electrónica creada correctamente.',
            'data' => $this->formatPrescription($prescription),
        ], 201);
    }

    public function sign(
        Request $request,
        Prescription $prescription,
        InventoryAlertService $inventoryAlerts,
        NotificationDispatcher $dispatcher,
    )
    {
        $validated = $request->validate([
            'signatureDataUrl' => ['required', 'string'],
            'signerName' => ['required', 'string', 'max:255'],
        ]);

        if (!str_starts_with($validated['signatureDataUrl'], 'data:image/png;base64,')) {
            return response()->json([
                'success' => false,
                'message' => 'La firma debe enviarse en formato PNG base64.',
            ], 422);
        }

        $base64Signature = str_replace(
            'data:image/png;base64,',
            '',
            $validated['signatureDataUrl'],
        );

        $signatureBinary = base64_decode($base64Signature, true);

        if ($signatureBinary === false) {
            return response()->json([
                'success' => false,
                'message' => 'La firma enviada no contiene una imagen válida.',
            ], 422);
        }

        $signedAt = now();
        $verificationCode = 'SP-' . strtoupper(substr(
            hash('sha256', $prescription->folio . $signedAt->timestamp),
            0,
            10,
        ));

        $signatureFileName = 'signatures/prescription-' .
            $prescription->id . '-' .
            $signedAt->format('YmdHis') . '-' .
            Str::lower(Str::random(6)) . '.png';

        if (!Storage::disk('public')->put($signatureFileName, $signatureBinary)) {
            return response()->json([
                'success' => false,
                'message' => 'No fue posible guardar la firma digital.',
            ], 500);
        }

        try {
            $transactionResult = DB::transaction(function () use (
                $prescription,
                $validated,
                $signedAt,
                $verificationCode,
                $signatureFileName,
            ) {
                $lockedPrescription = Prescription::query()
                    ->whereKey($prescription->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                if ($lockedPrescription->status !== 'Borrador') {
                    throw ValidationException::withMessages([
                        'prescription' => 'Solo se pueden firmar recetas en estado Borrador.',
                    ]);
                }

                $lockedPrescription->load([
                    'patient.user',
                    'doctor',
                    'items.medicine',
                ]);

                $inventoryMovements = $lockedPrescription->inventory_deducted_at
                    ? []
                    : $this->deductInventoryForPrescription($lockedPrescription);

                $signaturePayload = [
                    'folio' => $lockedPrescription->folio,
                    'patientId' => $lockedPrescription->patient_id,
                    'patientName' => $lockedPrescription->patient?->full_name,
                    'doctorId' => $lockedPrescription->doctor_id,
                    'doctorName' => $lockedPrescription->doctor?->name,
                    'diagnosis' => $lockedPrescription->diagnosis,
                    'items' => $lockedPrescription->items->map(function ($item) {
                        return [
                            'medicineId' => $item->medicine_id,
                            'medicineName' => $item->medicine?->name,
                            'quantity' => $item->quantity,
                            'dosage' => $item->dosage,
                            'frequency' => $item->frequency,
                            'duration' => $item->duration,
                            'instructions' => $item->instructions,
                        ];
                    })->toArray(),
                    'signedAt' => $signedAt->toDateTimeString(),
                    'signedByName' => $validated['signerName'],
                    'verificationCode' => $verificationCode,
                ];

                $lockedPrescription->update([
                    'status' => 'Firmada',
                    'signed_at' => $signedAt,
                    'signed_by_name' => $validated['signerName'],
                    'signature_hash' => hash('sha256', json_encode($signaturePayload)),
                    'verification_code' => $verificationCode,
                    'signature_image_path' => $signatureFileName,
                    'inventory_deducted_at' => $signedAt,
                ]);

                return [
                    'inventoryMovements' => $inventoryMovements,
                ];
            });
        } catch (\Throwable $exception) {
            Storage::disk('public')->delete($signatureFileName);
            throw $exception;
        }

        $prescription->refresh();
        $prescription->load([
            'patient.user',
            'doctor',
            'items.medicine',
        ]);

        $inventoryMovements = $transactionResult['inventoryMovements'];

        if ($inventoryMovements !== []) {
            $inventoryAlerts->evaluateMany(
                $prescription->items->pluck('medicine_id')->all(),
            );

            $this->notifyPharmacyInventoryDeduction(
                $prescription,
                $inventoryMovements,
                $dispatcher,
            );
        }

        $patientUser = $prescription->patient?->user;

        if ($patientUser && $patientUser->status === 'Activo') {
            try {
                $dispatcher->send(
                    $patientUser,
                    new SmartPharmacyNotification(
                        notificationType: 'prescription_ready',
                        title: 'Nueva receta médica disponible',
                        body: "El Dr./Dra. {$prescription->doctor?->name} firmó la receta {$prescription->folio}.",
                        actionUrl: '/?section=prescriptions',
                        severity: 'info',
                        metadata: [
                            'prescriptionId' => $prescription->id,
                            'folio' => $prescription->folio,
                            'doctorName' => $prescription->doctor?->name,
                        ],
                        pushTitle: 'Nueva receta disponible',
                        pushBody: 'Tu médico generó una nueva receta. Abre SmartPharmacy para consultarla.',
                    ),
                );
            } catch (\Throwable $exception) {
                report($exception);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Receta firmada correctamente. El inventario fue descontado automáticamente.',
            'data' => $this->formatPrescription($prescription),
        ]);
    }

    public function pdf(Prescription $prescription)
    {
        try {
            $prescription->load([
                'patient',
                'doctor',
                'items.medicine',
            ]);

            $signatureImage = null;

            if (!empty($prescription->signature_image_path)) {
                $signaturePath = ltrim($prescription->signature_image_path, '/');

                $fullSignaturePath = storage_path('app/public/' . $signaturePath);

                if (file_exists($fullSignaturePath)) {
                    $signatureImage = 'data:image/png;base64,' . base64_encode(
                        file_get_contents($fullSignaturePath)
                    );
                }
            }

            $pdf = Pdf::loadView('pdf.prescription', [
                'prescription' => $prescription,
                'signatureImage' => $signatureImage,
            ])->setPaper('letter');

            return $pdf->stream($prescription->folio . '.pdf');
        } catch (\Throwable $e) {
            \Log::error('Error al generar PDF de receta', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'mensaje' => 'Error del servidor',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
    }

    private function validatePrescriptionStock(array $items)
    {
        $requestedByMedicine = [];

        foreach ($items as $item) {
            $medicineId = (int) $item['medicineId'];
            $quantity = (int) $item['quantity'];

            if (!isset($requestedByMedicine[$medicineId])) {
                $requestedByMedicine[$medicineId] = 0;
            }

            $requestedByMedicine[$medicineId] += $quantity;
        }

        $results = [];
        $isValid = true;

        foreach ($requestedByMedicine as $medicineId => $requestedQuantity) {
            $medicine = Medicine::find($medicineId);

            $availableStock = Inventory::where('medicine_id', $medicineId)
                ->where('status', 'Activo')
                ->sum('stock');

            $itemIsAvailable = $availableStock >= $requestedQuantity;

            if (!$itemIsAvailable) {
                $isValid = false;
            }

            $results[] = [
                'medicineId' => $medicineId,
                'medicineName' => $medicine?->name,
                'requestedQuantity' => $requestedQuantity,
                'availableStock' => (int) $availableStock,
                'isAvailable' => $itemIsAvailable,
            ];
        }

        return [
            'isValid' => $isValid,
            'items' => $results,
        ];
    }

    /**
     * Descuenta el inventario de una receta usando primero los lotes con
     * vencimiento más próximo. Debe ejecutarse dentro de una transacción.
     *
     * @return array<int, array<string, int|string|null>>
     */
    private function deductInventoryForPrescription(Prescription $prescription): array
    {
        $requestedByMedicine = [];

        foreach ($prescription->items as $item) {
            $medicineId = (int) $item->medicine_id;

            if (!isset($requestedByMedicine[$medicineId])) {
                $requestedByMedicine[$medicineId] = [
                    'quantity' => 0,
                    'medicineName' => $item->medicine?->name,
                ];
            }

            $requestedByMedicine[$medicineId]['quantity'] += (int) $item->quantity;
        }

        $movements = [];

        foreach ($requestedByMedicine as $medicineId => $requested) {
            $inventories = Inventory::query()
                ->where('medicine_id', $medicineId)
                ->where('status', 'Activo')
                ->where('stock', '>', 0)
                ->orderByRaw('expiration_date IS NULL')
                ->orderBy('expiration_date')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $availableStock = (int) $inventories->sum('stock');
            $requestedQuantity = (int) $requested['quantity'];

            if ($availableStock < $requestedQuantity) {
                throw ValidationException::withMessages([
                    'inventory' => 'No hay inventario suficiente para ' .
                        ($requested['medicineName'] ?? 'el medicamento seleccionado') .
                        '. Disponible: ' . $availableStock .
                        ', solicitado: ' . $requestedQuantity . '.',
                ]);
            }

            $remainingQuantity = $requestedQuantity;

            foreach ($inventories as $inventory) {
                if ($remainingQuantity <= 0) {
                    break;
                }

                $quantityToDiscount = min((int) $inventory->stock, $remainingQuantity);

                $inventory->decrement('stock', $quantityToDiscount);
                $remainingQuantity -= $quantityToDiscount;
            }

            $movements[] = [
                'medicineId' => (int) $medicineId,
                'medicineName' => $requested['medicineName'],
                'deductedQuantity' => $requestedQuantity,
                'previousStock' => $availableStock,
                'remainingStock' => $availableStock - $requestedQuantity,
            ];
        }

        return $movements;
    }

    /**
     * @param array<int, array<string, int|string|null>> $inventoryMovements
     */
    private function notifyPharmacyInventoryDeduction(
        Prescription $prescription,
        array $inventoryMovements,
        NotificationDispatcher $dispatcher,
    ): void {
        $movementLabels = array_map(
            fn (array $movement) =>
                ($movement['medicineName'] ?? 'Medicamento') .
                ': -' . $movement['deductedQuantity'] .
                ' (restan ' . $movement['remainingStock'] . ')',
            $inventoryMovements,
        );

        $visibleMovements = array_slice($movementLabels, 0, 3);
        $summary = implode(', ', $visibleMovements);

        if (count($movementLabels) > count($visibleMovements)) {
            $summary .= ' y ' . (count($movementLabels) - count($visibleMovements)) . ' medicamento(s) más';
        }

        User::query()
            ->where('status', 'Activo')
            ->where('role', 'Administrador Farmacia')
            ->each(function (User $user) use (
                $prescription,
                $inventoryMovements,
                $summary,
                $dispatcher,
            ): void {
                try {
                    $dispatcher->send(
                        $user,
                        new SmartPharmacyNotification(
                            notificationType: 'inventory_prescription_outflow',
                            title: 'Salida de inventario por receta',
                            body: "La receta {$prescription->folio} descontó {$summary}.",
                            actionUrl: '/?section=inventory',
                            severity: 'info',
                            metadata: [
                                'prescriptionId' => $prescription->id,
                                'folio' => $prescription->folio,
                                'patientName' => $prescription->patient?->full_name,
                                'doctorName' => $prescription->doctor?->name,
                                'movements' => $inventoryMovements,
                            ],
                            pushTitle: 'Inventario actualizado',
                            pushBody: "La receta {$prescription->folio} generó una salida de medicamentos.",
                        ),
                    );
                } catch (\Throwable $exception) {
                    report($exception);
                }
            });
    }

    private function generateFolio()
    {
        return 'RX-' . now()->format('YmdHis') . '-' . strtoupper(Str::random(4));
    }

    private function formatPrescription(Prescription $prescription)
    {
        return [
            'id' => $prescription->id,
            'folio' => $prescription->folio,
            'patientId' => $prescription->patient_id,
            'patientName' => $prescription->patient?->full_name,
            'doctorId' => $prescription->doctor_id,
            'doctorName' => $prescription->doctor?->name,
            'diagnosis' => $prescription->diagnosis,
            'notes' => $prescription->notes,
            'status' => $prescription->status,
            'signedAt' => $prescription->signed_at?->format('Y-m-d H:i:s'),
            'inventoryDeductedAt' => $prescription->inventory_deducted_at?->format('Y-m-d H:i:s'),
            'signatureHash' => $prescription->signature_hash,
            'createdAt' => $prescription->created_at?->format('Y-m-d H:i:s'),
            'signedByName' => $prescription->signed_by_name,
            'verificationCode' => $prescription->verification_code,
            'signatureImagePath' => $prescription->signature_image_path,
            'pdfUrl' => in_array($prescription->status, ['Firmada', 'Dispensada'], true)
                ? url('/api/prescriptions/' . $prescription->id . '/pdf')
                : null,
            'items' => $prescription->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'medicineId' => $item->medicine_id,
                    'medicineCode' => $item->medicine?->code,
                    'medicineName' => $item->medicine?->name,
                    'quantity' => $item->quantity,
                    'dosage' => $item->dosage,
                    'frequency' => $item->frequency,
                    'duration' => $item->duration,
                    'instructions' => $item->instructions,
                ];
            })->toArray(),
        ];
    }

    public function dispense(
        Prescription $prescription,
        InventoryAlertService $inventoryAlerts,
        NotificationDispatcher $dispatcher,
    )
    {
        $transactionResult = DB::transaction(function () use ($prescription) {
            $lockedPrescription = Prescription::query()
                ->whereKey($prescription->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedPrescription->status === 'Dispensada') {
                throw ValidationException::withMessages([
                    'prescription' => 'Esta receta ya fue dispensada anteriormente.',
                ]);
            }

            if ($lockedPrescription->status !== 'Firmada') {
                throw ValidationException::withMessages([
                    'prescription' => 'Solo se pueden dispensar recetas firmadas.',
                ]);
            }

            $lockedPrescription->load([
                'patient.user',
                'doctor',
                'items.medicine',
            ]);

            // Compatibilidad con recetas firmadas antes de agregar el descuento
            // automático: solo esas recetas descuentan al confirmar la entrega.
            $inventoryMovements = [];

            if (!$lockedPrescription->inventory_deducted_at) {
                $inventoryMovements = $this->deductInventoryForPrescription(
                    $lockedPrescription,
                );
            }

            $lockedPrescription->update([
                'status' => 'Dispensada',
                'inventory_deducted_at' => $lockedPrescription->inventory_deducted_at ?? now(),
            ]);

            return [
                'inventoryMovements' => $inventoryMovements,
            ];
        });

        $prescription->refresh();
        $prescription->load([
            'patient.user',
            'doctor',
            'items.medicine',
        ]);

        $inventoryMovements = $transactionResult['inventoryMovements'];

        if ($inventoryMovements !== []) {
            $inventoryAlerts->evaluateMany(
                $prescription->items->pluck('medicine_id')->all(),
            );

            $this->notifyPharmacyInventoryDeduction(
                $prescription,
                $inventoryMovements,
                $dispatcher,
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Entrega de receta confirmada correctamente.',
            'data' => $this->formatPrescription($prescription),
        ]);
    }
}
