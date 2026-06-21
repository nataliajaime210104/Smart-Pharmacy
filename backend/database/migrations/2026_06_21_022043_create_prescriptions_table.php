<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('prescriptions', function (Blueprint $table) {
            $table->id();
            $table->string('folio')->unique();

            $table->foreignId('patient_id')
                ->constrained('patients')
                ->restrictOnDelete();

            $table->foreignId('doctor_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->string('diagnosis')->nullable();
            $table->text('notes')->nullable();

            $table->string('status')->default('Borrador');

            $table->timestamp('signed_at')->nullable();
            $table->string('signature_hash')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prescriptions');
    }
};