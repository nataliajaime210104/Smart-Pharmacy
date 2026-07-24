<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use App\Models\Medicine;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use App\Services\MedicationScheduleGenerator;

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

    public function sign(Request $request, Prescription $prescription)
    {
        $validated = $request->validate([
            'signatureDataUrl' => ['required', 'string'],
            'signerName' => ['required', 'string', 'max:255'],
        ]);

        if ($prescription->status !== 'Borrador') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden firmar recetas en estado Borrador.',
            ], 422);
        }

        if (!str_starts_with($validated['signatureDataUrl'], 'data:image/png;base64,')) {
            return response()->json([
                'success' => false,
                'message' => 'La firma debe enviarse en formato PNG base64.',
            ], 422);
        }

        $prescription->load([
            'patient',
            'doctor',
            'items.medicine',
        ]);

        $itemsForValidation = $prescription->items->map(function ($item) {
            return [
                'medicineId' => $item->medicine_id,
                'quantity' => $item->quantity,
            ];
        })->toArray();

        $stockValidation = $this->validatePrescriptionStock($itemsForValidation);

        if (!$stockValidation['isValid']) {
            return response()->json([
                'success' => false,
                'message' => 'No hay inventario suficiente para firmar esta receta.',
                'data' => $stockValidation['items'],
            ], 422);
        }

        $base64Signature = str_replace('data:image/png;base64,', '', $validated['signatureDataUrl']);
        $signatureBinary = base64_decode($base64Signature);

        $signatureFileName = 'signatures/prescription-' . $prescription->id . '-' . now()->format('YmdHis') . '.png';

        Storage::disk('public')->put($signatureFileName, $signatureBinary);

        $signedAt = now();

        $verificationCode = 'SP-' . strtoupper(substr(hash('sha256', $prescription->folio . now()->timestamp), 0, 10));

        $signaturePayload = [
            'folio' => $prescription->folio,
            'patientId' => $prescription->patient_id,
            'patientName' => $prescription->patient?->full_name,
            'doctorId' => $prescription->doctor_id,
            'doctorName' => $prescription->doctor?->name,
            'diagnosis' => $prescription->diagnosis,
            'items' => $prescription->items->map(function ($item) {
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

        $signatureHash = hash('sha256', json_encode($signaturePayload));

        $prescription->update([
            'status' => 'Firmada',
            'signed_at' => $signedAt,
            'signed_by_name' => $validated['signerName'],
            'signature_hash' => $signatureHash,
            'verification_code' => $verificationCode,
            'signature_image_path' => $signatureFileName,
        ]);

        $prescription->load([
            'patient',
            'doctor',
            'items.medicine',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Receta firmada digitalmente correctamente.',
            'data' => $this->formatPrescription($prescription),
        ]);
    }

    public function pdf(Prescription $prescription)
    {
        $prescription->load([
            'patient',
            'doctor',
            'items.medicine',
        ]);

        $signatureImage = null;

        if (
            $prescription->signature_image_path &&
            Storage::disk('public')->exists($prescription->signature_image_path)
        ) {
            $signatureImage = 'data:image/png;base64,' . base64_encode(
                Storage::disk('public')->get($prescription->signature_image_path)
            );
        }

        $pdf = Pdf::loadView('pdf.prescription', [
            'prescription' => $prescription,
            'signatureImage' => $signatureImage,
        ])->setPaper('letter');

        return $pdf->stream($prescription->folio . '.pdf');
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
            'signatureHash' => $prescription->signature_hash,
            'createdAt' => $prescription->created_at?->format('Y-m-d H:i:s'),
            'signedByName' => $prescription->signed_by_name,
            'verificationCode' => $prescription->verification_code,
            'signatureImagePath' => $prescription->signature_image_path,
            'pdfUrl' => $prescription->status === 'Firmada' ? url('/api/prescriptions/' . $prescription->id . '/pdf') : null,
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

    public function dispense(Prescription $prescription)
    {
        if ($prescription->status === 'Dispensada') {
            return response()->json([
                'success' => false,
                'message' => 'Esta receta ya fue dispensada anteriormente.',
            ], 422);
        }

        if ($prescription->status !== 'Firmada') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden dispensar recetas firmadas.',
            ], 422);
        }

        $prescription->load([
            'patient.user',
            'doctor',
            'items.medicine',
        ]);

        DB::transaction(function () use ($prescription) {
            foreach ($prescription->items as $item) {
                $remainingQuantity = $item->quantity;

                $inventories = Inventory::where('medicine_id', $item->medicine_id)
                    ->where('status', 'Activo')
                    ->where('stock', '>', 0)
                    ->orderByRaw('expiration_date IS NULL')
                    ->orderBy('expiration_date', 'asc')
                    ->orderBy('id', 'asc')
                    ->lockForUpdate()
                    ->get();

                $availableStock = $inventories->sum('stock');

                if ($availableStock < $remainingQuantity) {
                    throw ValidationException::withMessages([
                        'inventory' => 'No hay inventario suficiente para dispensar ' .
                            ($item->medicine?->name ?? 'este medicamento') .
                            '. Disponible: ' . $availableStock .
                            ', solicitado: ' . $remainingQuantity . '.',
                    ]);
                }

                foreach ($inventories as $inventory) {
                    if ($remainingQuantity <= 0) {
                        break;
                    }

                    $quantityToDiscount = min($inventory->stock, $remainingQuantity);

                    $inventory->decrement('stock', $quantityToDiscount);

                    $remainingQuantity -= $quantityToDiscount;
                }
            }

            $prescription->update([
                'status' => 'Dispensada',
            ]);
        });

        $prescription->refresh();
        $prescription->load([
            'patient.user',
            'doctor',
            'items.medicine',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Receta dispensada correctamente. El inventario fue actualizado.',
            'data' => $this->formatPrescription($prescription),
        ]);
    }
}