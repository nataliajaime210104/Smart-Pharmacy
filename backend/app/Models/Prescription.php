<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    protected $fillable = [
        'folio',
        'patient_id',
        'doctor_id',
        'diagnosis',
        'notes',
        'status',
        'signed_at',
        'signed_by_name',
        'signature_hash',
        'verification_code',
        'signature_image_path',
    ];

    protected $casts = [
        'signed_at' => 'datetime',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor()
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function items()
    {
        return $this->hasMany(PrescriptionItem::class);
    }
}