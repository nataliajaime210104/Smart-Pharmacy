<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->text('medical_conditions')->nullable()->after('allergies');
            $table->text('clinical_notes')->nullable()->after('medical_conditions');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'medical_conditions',
                'clinical_notes',
            ]);
        });
    }
};