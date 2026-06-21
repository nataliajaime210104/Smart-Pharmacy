<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Carbon\Carbon;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::with('user')
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
                return [
                    'id' => $patient->id,
                    'userId' => $patient->user_id,
                    'recordNumber' => $patient->record_number,
                    'name' => $patient->user?->name ?? $patient->full_name,
                    'email' => $patient->user?->email,
                    'age' => $patient->age ?? ($patient->birth_date ? Carbon::parse($patient->birth_date)->age : null),
                    'diagnosis' => $patient->diagnosis,
                    'allergies' => $patient->allergies,
                    'lastTreatment' => $patient->last_treatment,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $patients,
        ]);
    }
}