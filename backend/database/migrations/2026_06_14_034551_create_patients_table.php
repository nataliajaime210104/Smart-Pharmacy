<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('record_number')->unique();
            $table->string('full_name');
            $table->date('birth_date')->nullable();
            $table->string('diagnosis')->nullable();
            $table->text('allergies')->nullable();
            $table->text('last_treatment')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};