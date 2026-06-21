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
        'last_treatment',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}