<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'user_id',
        'record_number',
        'full_name',
        'birth_date',
        'age',
        'diagnosis',
        'allergies',
        'medical_conditions',
        'clinical_notes',
        'last_treatment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function prescriptions()
    {
        return $this->hasMany(Prescription::class);
    }
}