<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Models\Prescription;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::with([
            'user',
            'prescriptions.doctor',
            'prescriptions.items.medicine',
        ])
            ->where(function ($query) {
                $query->whereNull('user_id')
                    ->orWhereHas('user', function ($userQuery) {
                        $userQuery->where('role', 'Paciente')
                            ->where('status', 'Activo');
                    });
            })
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($patient) {
                return $this->formatPatient($patient);
            });

        return response()->json([
            'success' => true,
            'data' => $patients,
        ]);
    }

    public function myPrescriptions($userId)
    {
        $patient = Patient::where('user_id', $userId)->first();

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Paciente no encontrado',
                'data' => [],
            ]);
        }

        $prescriptions = Prescription::where('patient_id', $patient->id)
            ->with([
                'doctor',
                'items.medicine',
            ])
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($prescription) {
                return [
                    'id' => $prescription->id,
                    'folio' => $prescription->folio,
                    'doctorName' => $prescription->doctor?->name,
                    'diagnosis' => $prescription->diagnosis,
                    'notes' => $prescription->notes,
                    'status' => $prescription->status,
                    'signedAt' => $prescription->signed_at?->format('Y-m-d H:i:s'),
                    'verificationCode' => $prescription->verification_code,
                    'pdfUrl' => $prescription->status === 'Firmada'
                        ? url('/api/prescriptions/' . $prescription->id . '/pdf')
                        : null,
                    'items' => $prescription->items->map(function ($item) {
                        return [
                            'medicineName' => $item->medicine?->name,
                            'quantity' => $item->quantity,
                            'dosage' => $item->dosage,
                            'frequency' => $item->frequency,
                            'duration' => $item->duration,
                            'instructions' => $item->instructions,
                        ];
                    })->toArray(),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $prescriptions,
        ]);
    }

    public function updateClinicalData(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'clinicalDiagnosis' => ['nullable', 'string', 'max:255'],
            'allergies' => ['nullable', 'string'],
            'medicalConditions' => ['nullable', 'string'],
            'clinicalNotes' => ['nullable', 'string'],
        ]);

        $patient->update([
            'age' => $validated['age'] ?? null,
            'diagnosis' => $validated['clinicalDiagnosis'] ?? 'Pendiente por registrarse',
            'allergies' => $validated['allergies'] ?? 'Pendiente por registrarse',
            'medical_conditions' => $validated['medicalConditions'] ?? null,
            'clinical_notes' => $validated['clinicalNotes'] ?? null,
        ]);

        $patient->load([
            'user',
            'prescriptions.doctor',
            'prescriptions.items.medicine',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Datos clínicos actualizados correctamente.',
            'data' => $this->formatPatient($patient),
        ]);
    }

    private function formatPatient(Patient $patient): array
    {
        $prescriptions = $patient->prescriptions
            ->sortByDesc('created_at')
            ->values();

        $latestPrescription = $prescriptions->first();

        return [
            'id' => $patient->id,
            'userId' => $patient->user_id,
            'recordNumber' => $patient->record_number,
            'name' => $patient->user?->name ?? $patient->full_name,
            'email' => $patient->user?->email,
            'age' => $patient->age ?? ($patient->birth_date ? Carbon::parse($patient->birth_date)->age : null),

            'clinicalDiagnosis' => $patient->diagnosis ?? 'Pendiente por registrarse',
            'latestConsultationDiagnosis' => $latestPrescription?->diagnosis ?? 'Sin receta registrada',
            'allergies' => $patient->allergies ?? 'Pendiente por registrarse',
            'medicalConditions' => $patient->medical_conditions,
            'clinicalNotes' => $patient->clinical_notes,
            'lastTreatment' => $this->buildLatestTreatment(
                $latestPrescription,
                $patient->last_treatment
            ),

            'prescriptions' => $prescriptions
                ->map(function ($prescription) {
                    return [
                        'id' => $prescription->id,
                        'folio' => $prescription->folio,
                        'doctorName' => $prescription->doctor?->name,
                        'diagnosis' => $prescription->diagnosis,
                        'notes' => $prescription->notes,
                        'status' => $prescription->status,
                        'signedAt' => $prescription->signed_at?->format('Y-m-d H:i:s'),
                        'signatureHash' => $prescription->signature_hash,
                        'verificationCode' => $prescription->verification_code,
                        'createdAt' => $prescription->created_at?->format('Y-m-d H:i:s'),
                        'pdfUrl' => $prescription->status === 'Firmada'
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
                })
                ->toArray(),
        ];
    }

    private function buildLatestTreatment($latestPrescription, ?string $fallbackTreatment): string
    {
        if (!$latestPrescription || $latestPrescription->items->isEmpty()) {
            return $fallbackTreatment ?? 'Pendiente por registrarse';
        }

        return $latestPrescription->items
            ->map(function ($item) {
                $medicine = $item->medicine?->name ?? 'Medicamento sin nombre';
                $quantity = $item->quantity;
                $dosage = $item->dosage ?? 'sin dosis';
                $frequency = $item->frequency ?? 'sin frecuencia';
                $duration = $item->duration ?? 'sin duración';

                return "{$medicine} x {$quantity} / {$dosage} / {$frequency} / {$duration}";
            })
            ->implode(' | ');
    }
}