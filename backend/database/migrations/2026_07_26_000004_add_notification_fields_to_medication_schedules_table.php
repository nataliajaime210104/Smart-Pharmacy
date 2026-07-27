<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medication_schedules', function (Blueprint $table) {
            $table->timestamp('reminder_notified_at')->nullable()->after('taken_at');
            $table->index(['status', 'scheduled_at', 'reminder_notified_at'], 'med_schedule_reminder_idx');
        });
    }

    public function down(): void
    {
        Schema::table('medication_schedules', function (Blueprint $table) {
            $table->dropIndex('med_schedule_reminder_idx');
            $table->dropColumn('reminder_notified_at');
        });
    }
};
