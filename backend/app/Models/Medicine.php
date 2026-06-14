<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medicine extends Model
{
    protected $fillable = [
        'code',
        'name',
        'presentation',
        'concentration',
        'unit',
        'description',
        'status',
    ];

    public function inventories()
    {
        return $this->hasMany(Inventory::class);
    }
}