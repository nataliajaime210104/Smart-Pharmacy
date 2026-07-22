<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medication_schedules', function (Blueprint $table) {
            $table->index(
                ['patient_id', 'scheduled_at'],
                'med_sched_patient_date_idx'
            );

            $table->index(
                ['prescription_id', 'scheduled_at'],
                'med_sched_prescription_date_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('medication_schedules', function (Blueprint $table) {
            $table->dropIndex('med_sched_patient_date_idx');
            $table->dropIndex('med_sched_prescription_date_idx');
        });
    }
};
