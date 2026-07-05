<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $now = now();

        $users = [
            [
                'name' => 'Dra. Natalia Jaime',
                'email' => 'natalia@hospital.com',
                'password' => Hash::make('12345678'),
                'role' => 'Medico',
                'status' => 'Activo',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Sebastian Torres',
                'email' => 'sebastian@hospital.com',
                'password' => Hash::make('12345678'),
                'role' => 'Administrador Sistema',
                'status' => 'Activo',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Alexa Martínez',
                'email' => 'alexa@hospital.com',
                'password' => Hash::make('12345678'),
                'role' => 'Paciente',
                'status' => 'Activo',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Victor Gómez',
                'email' => 'victor@hospital.com',
                'password' => Hash::make('12345678'),
                'role' => 'Administrador Farmacia',
                'status' => 'Activo',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                $user
            );
        }
    }

    public function down(): void
    {
        DB::table('users')
            ->whereIn('email', [
                'natalia@hospital.com',
                'sebastian@hospital.com',
                'alexa@hospital.com',
                'victor@hospital.com',
            ])
            ->delete();
    }
};