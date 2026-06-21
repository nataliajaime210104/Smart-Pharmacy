<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->string('signed_by_name')->nullable()->after('signed_at');
            $table->string('verification_code')->nullable()->unique()->after('signature_hash');
            $table->string('signature_image_path')->nullable()->after('verification_code');
        });
    }

    public function down(): void
    {
        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropColumn([
                'signed_by_name',
                'verification_code',
                'signature_image_path',
            ]);
        });
    }
};