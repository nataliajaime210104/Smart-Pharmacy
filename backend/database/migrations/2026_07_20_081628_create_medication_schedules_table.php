<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('medication_schedules', function (Blueprint $table) {
            $table->id();

            $table->foreignId('patient_id')
                ->constrained('patients')
                ->cascadeOnDelete();

            $table->foreignId('prescription_id')
                ->constrained('prescriptions')
                ->cascadeOnDelete();

            $table->foreignId('prescription_item_id')
                ->constrained('prescription_items')
                ->cascadeOnDelete();

            $table->dateTime('scheduled_at');

            $table->enum('status', [
                'Pendiente',
                'Tomado',
                'Omitido'
            ])->default('Pendiente');

            $table->dateTime('taken_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('medication_schedules');
    }
};