<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->constrained('medicines')->cascadeOnDelete();
            $table->string('lot_number')->nullable();
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(0);
            $table->string('location')->nullable();
            $table->date('expiration_date')->nullable();
            $table->string('status')->default('Activo');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventories');
    }
};