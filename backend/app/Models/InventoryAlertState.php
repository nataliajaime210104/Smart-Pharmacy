<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryAlertState extends Model
{
    protected $fillable = [
        'medicine_id',
        'state',
        'current_stock',
        'minimum_stock',
        'last_notified_at',
    ];

    protected $casts = [
        'last_notified_at' => 'datetime',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}
