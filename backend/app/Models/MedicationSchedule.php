<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MedicationSchedule extends Model
{
    protected $fillable = [
        'patient_id',
        'prescription_id',
        'prescription_item_id',
        'scheduled_at',
        'status',
        'taken_at',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'taken_at' => 'datetime',
    ];

    public function prescription()
    {
        return $this->belongsTo(Prescription::class);
    }

    public function prescriptionItem()
    {
        return $this->belongsTo(PrescriptionItem::class);
    }

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}