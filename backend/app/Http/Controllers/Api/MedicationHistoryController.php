<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicationSchedule;
use App\Models\Patient;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MedicationHistoryController extends Controller
{
    public function patients(int $doctorId)
    {
        $doctor = User::query()
            ->where('id', $doctorId)
            ->where('role', 'Medico')
            ->first();

        if (!$doctor) {
            return response()->json([
                'success' => false,
                'message' => 'Médico no encontrado.',
                'data' => [],
            ], 404);
        }

        $patients = Patient::query()
            ->with('user')
            ->whereHas('prescriptions', function ($query) use ($doctorId) {
                $query->where('doctor_id', $doctorId)
                    ->whereIn('status', ['Firmada', 'Dispensada'])
                    ->whereHas('items');
            })
            ->orderBy('full_name')
            ->get()
            ->map(function (Patient $patient) {
                return [
                    'id' => $patient->id,
                    'userId' => $patient->user_id,
                    'recordNumber' => $patient->record_number,
                    'name' => $patient->user?->name ?? $patient->full_name,
                    'email' => $patient->user?->email,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => $patients,
        ]);
    }

    public function index(Request $request)
    {
        $validated = $request->validate([
            'doctorId' => ['required', 'integer', 'exists:users,id'],
            'patientId' => ['required', 'integer', 'exists:patients,id'],
            'startDate' => ['required', 'date'],
            'endDate' => ['required', 'date', 'after_or_equal:startDate'],
        ]);

        $doctorId = (int) $validated['doctorId'];
        $patientId = (int) $validated['patientId'];
        $startDate = Carbon::parse($validated['startDate'])->startOfDay();
        $endDate = Carbon::parse($validated['endDate'])->endOfDay();

        if ($startDate->diffInDays($endDate) > 366) {
            return response()->json([
                'success' => false,
                'message' => 'El rango de consulta no puede ser mayor a 366 días.',
            ], 422);
        }

        $patient = Patient::query()
            ->with('user')
            ->where('id', $patientId)
            ->whereHas('prescriptions', function ($query) use ($doctorId) {
                $query->where('doctor_id', $doctorId)
                    ->whereIn('status', ['Firmada', 'Dispensada']);
            })
            ->first();

        if (!$patient) {
            return response()->json([
                'success' => false,
                'message' => 'El paciente no está relacionado con el médico seleccionado.',
            ], 404);
        }

        $now = now();

        $schedules = MedicationSchedule::query()
            ->with([
                'prescription:id,folio,doctor_id',
                'prescriptionItem:id,prescription_id,medicine_id,dosage,frequency,duration,instructions',
                'prescriptionItem.medicine:id,code,name',
            ])
            ->where('patient_id', $patientId)
            ->whereHas('prescription', function ($query) use ($doctorId) {
                $query->where('doctor_id', $doctorId)
                    ->whereIn('status', ['Firmada', 'Dispensada']);
            })
            ->whereBetween('scheduled_at', [$startDate, $endDate])
            ->orderBy('scheduled_at')
            ->get()
            ->map(function (MedicationSchedule $schedule) use ($now) {
                $scheduledAt = $schedule->scheduled_at;
                $isTaken = $schedule->status === 'Tomado';
                $isRegisteredMissed = $schedule->status === 'Omitido';
                $isEvaluated = ($scheduledAt?->lte($now) ?? false)
                    || $isTaken
                    || $isRegisteredMissed;
                $isMissed = $isRegisteredMissed
                    || ($schedule->status === 'Pendiente' && $isEvaluated);

                $effectiveStatus = $isTaken
                    ? 'Tomado'
                    : ($isMissed ? 'Omitido' : 'Pendiente');

                return [
                    'id' => $schedule->id,
                    'prescriptionId' => $schedule->prescription_id,
                    'prescriptionFolio' => $schedule->prescription?->folio,
                    'prescriptionItemId' => $schedule->prescription_item_id,
                    'medicineId' => $schedule->prescriptionItem?->medicine_id,
                    'medicineCode' => $schedule->prescriptionItem?->medicine?->code,
                    'medicineName' => $schedule->prescriptionItem?->medicine?->name ?? 'Medicamento sin nombre',
                    'dosage' => $schedule->prescriptionItem?->dosage,
                    'frequency' => $schedule->prescriptionItem?->frequency,
                    'duration' => $schedule->prescriptionItem?->duration,
                    'instructions' => $schedule->prescriptionItem?->instructions,
                    'scheduledAt' => $scheduledAt?->toIso8601String(),
                    'takenAt' => $schedule->taken_at?->toIso8601String(),
                    'registeredStatus' => $schedule->status,
                    'status' => $effectiveStatus,
                    'isEvaluated' => $isEvaluated,
                ];
            });

        $evaluatedSchedules = $schedules->where('isEvaluated', true);
        $takenDoses = $evaluatedSchedules->where('status', 'Tomado')->count();
        $missedDoses = $evaluatedSchedules->where('status', 'Omitido')->count();
        $evaluatedDoses = $evaluatedSchedules->count();
        $pendingDoses = $schedules->where('status', 'Pendiente')->count();

        $summary = [
            'totalScheduled' => $schedules->count(),
            'evaluatedDoses' => $evaluatedDoses,
            'takenDoses' => $takenDoses,
            'missedDoses' => $missedDoses,
            'pendingDoses' => $pendingDoses,
            'adherencePercentage' => $this->calculatePercentage($takenDoses, $evaluatedDoses),
        ];

        $daily = $schedules
            ->groupBy(function (array $schedule) {
                return Carbon::parse($schedule['scheduledAt'])->toDateString();
            })
            ->map(function ($daySchedules, string $date) {
                $evaluated = $daySchedules->where('isEvaluated', true);
                $taken = $evaluated->where('status', 'Tomado')->count();
                $missed = $evaluated->where('status', 'Omitido')->count();

                return [
                    'date' => $date,
                    'label' => Carbon::parse($date)->locale('es')->translatedFormat('d M'),
                    'scheduled' => $daySchedules->count(),
                    'evaluated' => $evaluated->count(),
                    'taken' => $taken,
                    'missed' => $missed,
                    'pending' => $daySchedules->where('status', 'Pendiente')->count(),
                    'adherencePercentage' => $this->calculatePercentage($taken, $evaluated->count()),
                ];
            })
            ->values();

        $byMedicine = $schedules
            ->groupBy(function (array $schedule) {
                return (string) ($schedule['medicineId'] ?? $schedule['medicineName']);
            })
            ->map(function ($medicineSchedules) {
                $first = $medicineSchedules->first();
                $evaluated = $medicineSchedules->where('isEvaluated', true);
                $taken = $evaluated->where('status', 'Tomado')->count();
                $missed = $evaluated->where('status', 'Omitido')->count();

                return [
                    'medicineId' => $first['medicineId'],
                    'medicineCode' => $first['medicineCode'],
                    'medicineName' => $first['medicineName'],
                    'scheduled' => $medicineSchedules->count(),
                    'evaluated' => $evaluated->count(),
                    'taken' => $taken,
                    'missed' => $missed,
                    'pending' => $medicineSchedules->where('status', 'Pendiente')->count(),
                    'adherencePercentage' => $this->calculatePercentage($taken, $evaluated->count()),
                ];
            })
            ->sortByDesc('adherencePercentage')
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'patient' => [
                    'id' => $patient->id,
                    'userId' => $patient->user_id,
                    'recordNumber' => $patient->record_number,
                    'name' => $patient->user?->name ?? $patient->full_name,
                    'email' => $patient->user?->email,
                ],
                'period' => [
                    'startDate' => $startDate->toDateString(),
                    'endDate' => $endDate->toDateString(),
                ],
                'summary' => $summary,
                'daily' => $daily,
                'byMedicine' => $byMedicine,
                'doses' => $schedules->sortByDesc('scheduledAt')->values(),
            ],
        ]);
    }

    private function calculatePercentage(int $taken, int $evaluated): float
    {
        if ($evaluated === 0) {
            return 0;
        }

        return round(($taken / $evaluated) * 100, 2);
    }
}
