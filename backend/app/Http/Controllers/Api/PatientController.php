<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use Carbon\Carbon;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::orderBy('id', 'asc')->get()->map(function ($patient) {
            return [
                'id' => $patient->id,
                'recordNumber' => $patient->record_number,
                'name' => $patient->full_name,
                'age' => $patient->birth_date ? Carbon::parse($patient->birth_date)->age : null,
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