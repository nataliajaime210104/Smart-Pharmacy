<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $fillable = [
        'medicine_id',
        'lot_number',
        'stock',
        'min_stock',
        'location',
        'expiration_date',
        'status',
    ];

    protected $casts = [
        'expiration_date' => 'date',
    ];

    public function medicine()
    {
        return $this->belongsTo(Medicine::class);
    }
}