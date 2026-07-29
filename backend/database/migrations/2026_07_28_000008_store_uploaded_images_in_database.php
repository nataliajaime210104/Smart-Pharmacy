<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('users', 'profile_photo_data')) {
            Schema::table('users', function (Blueprint $table) {
                $table->longText('profile_photo_data')->nullable();
            });
        }

        if (!Schema::hasColumn('users', 'profile_photo_mime')) {
            Schema::table('users', function (Blueprint $table) {
                $table->string('profile_photo_mime', 100)->nullable();
            });
        }

        if (!Schema::hasColumn('prescriptions', 'signature_image_data')) {
            Schema::table('prescriptions', function (Blueprint $table) {
                $table->longText('signature_image_data')->nullable();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('prescriptions', 'signature_image_data')) {
            Schema::table('prescriptions', function (Blueprint $table) {
                $table->dropColumn('signature_image_data');
            });
        }

        if (Schema::hasColumn('users', 'profile_photo_mime')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('profile_photo_mime');
            });
        }

        if (Schema::hasColumn('users', 'profile_photo_data')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('profile_photo_data');
            });
        }
    }
};
