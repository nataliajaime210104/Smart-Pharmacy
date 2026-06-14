<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = [
        'record_number',
        'full_name',
        'birth_date',
        'diagnosis',
        'allergies',
        'last_treatment',
    ];
}