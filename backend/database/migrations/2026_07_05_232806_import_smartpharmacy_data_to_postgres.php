<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

return new class extends Migration
{
    public function up(): void
    {
        $path = database_path('imports/smartpharmacyDB1_postgres_render_import.sql');

        if (! File::exists($path)) {
            throw new RuntimeException("No se encontró el archivo: {$path}");
        }

        DB::unprepared(File::get($path));
    }

    public function down(): void
    {
        DB::statement('TRUNCATE TABLE "prescription_items", "prescriptions", "inventories", "patients", "medicines", "users" RESTART IDENTITY CASCADE');
    }
};