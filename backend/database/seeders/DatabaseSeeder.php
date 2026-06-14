<?php

namespace Database\Seeders;

use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Dra. Natalia Jaime',
            'email' => 'natalia@hospital.com',
            'password' => Hash::make('12345678'),
            'role' => 'Medico',
            'status' => 'Activo',
        ]);

        User::create([
            'name' => 'Sebastian Torres',
            'email' => 'sebastian@hospital.com',
            'password' => Hash::make('12345678'),
            'role' => 'Administrador Sistema',
            'status' => 'Activo',
        ]);

        User::create([
            'name' => 'Alexa Martínez',
            'email' => 'alexa@hospital.com',
            'password' => Hash::make('12345678'),
            'role' => 'Paciente',
            'status' => 'Activo',
        ]);

        User::create([
            'name' => 'Victor Gómez',
            'email' => 'victor@hospital.com',
            'password' => Hash::make('12345678'),
            'role' => 'Administrador Farmacia',
            'status' => 'Activo',
        ]);

        Patient::create([
            'record_number' => 'EXP-2026-001',
            'full_name' => 'María Fernanda López',
            'birth_date' => '1992-04-18',
            'diagnosis' => 'Hipertensión arterial',
            'allergies' => 'Penicilina',
            'last_treatment' => 'Losartán 50 mg cada 24 horas',
        ]);

        Patient::create([
            'record_number' => 'EXP-2026-002',
            'full_name' => 'Carlos Alberto Ramírez',
            'birth_date' => '1984-09-11',
            'diagnosis' => 'Diabetes tipo 2',
            'allergies' => 'Sin alergias registradas',
            'last_treatment' => 'Metformina 850 mg cada 12 horas',
        ]);

        Patient::create([
            'record_number' => 'EXP-2026-003',
            'full_name' => 'Ana Sofía Hernández',
            'birth_date' => '1998-01-24',
            'diagnosis' => 'Infección respiratoria',
            'allergies' => 'Ibuprofeno',
            'last_treatment' => 'Paracetamol 500 mg cada 8 horas',
        ]);
    }
}