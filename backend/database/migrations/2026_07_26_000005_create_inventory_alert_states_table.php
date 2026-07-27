<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_alert_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medicine_id')->unique()->constrained('medicines')->cascadeOnDelete();
            $table->string('state')->default('normal');
            $table->integer('current_stock')->default(0);
            $table->integer('minimum_stock')->default(0);
            $table->timestamp('last_notified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_alert_states');
    }
};
