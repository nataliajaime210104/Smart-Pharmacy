<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicationSchedule;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'fullName' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'profilePhoto' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],

            'birthDate' => ['nullable', 'date'],
            'age' => ['nullable', 'integer', 'min:0', 'max:120'],
            'diagnosis' => ['nullable', 'string', 'max:255'],
            'allergies' => ['nullable', 'string'],
            'medicalConditions' => ['nullable', 'string'],
            'clinicalNotes' => ['nullable', 'string'],
            'lastTreatment' => ['nullable', 'string'],
        ]);

        try {
            $result = DB::transaction(function () use ($validated, $request) {
                $user = User::create([
                    'name' => $validated['fullName'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                    'role' => 'Paciente',
                    'status' => 'Activo',
                ]);

                if ($request->hasFile('profilePhoto')) {
                    $file = $request->file('profilePhoto');

                    $fileName = 'user-' . $user->id . '-' . now()->format('YmdHis') . '.' . $file->getClientOriginalExtension();

                    $photoPath = $file->storeAs(
                        'profile-photos',
                        $fileName,
                        'public'
                    );

                    $user->update([
                        'profile_photo_path' => $photoPath,
                    ]);

                    $user->refresh();
                }

                $patient = Patient::create([
                    'user_id' => $user->id,
                    'record_number' => 'EXP-' . str_pad($user->id, 6, '0', STR_PAD_LEFT),
                    'full_name' => $validated['fullName'],
                    'birth_date' => $validated['birthDate'] ?? null,
                    'age' => $validated['age'] ?? null,
                    'diagnosis' => $validated['diagnosis'] ?? null,
                    'allergies' => $validated['allergies'] ?? null,
                    'medical_conditions' => $validated['medicalConditions'] ?? null,
                    'clinical_notes' => $validated['clinicalNotes'] ?? null,
                    'last_treatment' => $validated['lastTreatment'] ?? null,
                ]);

                return [
                    'user' => $user,
                    'patient' => $patient,
                ];
            });

            $user = $result['user'];
            $patient = $result['patient'];

            return response()->json([
                'success' => true,
                'message' => 'Paciente registrado correctamente.',
                'data' => [
                    'id' => $patient->id,
                    'userId' => $patient->user_id,
                    'recordNumber' => $patient->record_number,
                    'fullName' => $patient->full_name,
                    'name' => $patient->full_name,
                    'email' => $user->email,
                    'birthDate' => $patient->birth_date,
                    'age' => $patient->age,
                    'diagnosis' => $patient->diagnosis,
                    'clinicalDiagnosis' => $patient->diagnosis,
                    'allergies' => $patient->allergies,
                    'medicalConditions' => $patient->medical_conditions,
                    'clinicalNotes' => $patient->clinical_notes,
                    'lastTreatment' => $patient->last_treatment,
                    'profilePhotoUrl' => $this->getProfilePhotoUrl($user),
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'status' => $user->status,
                        'profilePhotoUrl' => $this->getProfilePhotoUrl($user),
                    ],
                ],
            ], 201);
        } catch (\Throwable $e) {
            \Log::error('Error al registrar paciente desde médico', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Error al registrar paciente.',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ], 500);
        }
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

    public function mySchedules($userId)
    {
        $patient = Patient::where('user_id', $userId)->first();

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'Paciente no encontrado',
                'data' => [],
            ], 404);
        }

        $schedules = MedicationSchedule::where('patient_id', $patient->id)
            ->with('prescriptionItem.medicine')
            ->orderBy('scheduled_at')
            ->get()
            ->map(function (MedicationSchedule $schedule) {
                return [
                    'id' => $schedule->id,
                    'medicineName' => $schedule->prescriptionItem?->medicine?->name,
                    'dosage' => $schedule->prescriptionItem?->dosage,
                    'frequency' => $schedule->prescriptionItem?->frequency,
                    'scheduledAt' => $schedule->scheduled_at?->format('Y-m-d H:i:s'),
                    'status' => $schedule->status,
                    'takenAt' => $schedule->taken_at?->format('Y-m-d H:i:s'),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $schedules,
        ]);
    }

    public function markScheduleAsTaken($id)
    {
        $schedule = MedicationSchedule::find($id);

        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Horario no encontrado.',
            ], 404);
        }

        $schedule->update([
            'status' => 'Tomado',
            'taken_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Medicamento marcado como tomado.',
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
            'fullName' => $patient->full_name,
            'email' => $patient->user?->email,
            'birthDate' => $patient->birth_date,
            'age' => $patient->age ?? ($patient->birth_date ? Carbon::parse($patient->birth_date)->age : null),
            'profilePhotoUrl' => $patient->user ? $this->getProfilePhotoUrl($patient->user) : null,

            'clinicalDiagnosis' => $patient->diagnosis ?? 'Pendiente por registrarse',
            'latestConsultationDiagnosis' => $latestPrescription?->diagnosis ?? 'Sin receta registrada',
            'allergies' => $patient->allergies ?? 'Pendiente por registrarse',
            'medicalConditions' => $patient->medical_conditions,
            'clinicalNotes' => $patient->clinical_notes,
            'lastTreatment' => $this->buildLatestTreatment(
                $latestPrescription,
                $patient->last_treatment
            ),

            'user' => $patient->user ? [
                'id' => $patient->user->id,
                'name' => $patient->user->name,
                'email' => $patient->user->email,
                'role' => $patient->user->role,
                'status' => $patient->user->status,
                'profilePhotoUrl' => $this->getProfilePhotoUrl($patient->user),
            ] : null,

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

    private function getProfilePhotoUrl(User $user): ?string
    {
        if (empty($user->profile_photo_path)) {
            return null;
        }

        return '/api/profile-photos/' . basename($user->profile_photo_path);
    }
}