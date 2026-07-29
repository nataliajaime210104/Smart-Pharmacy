<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Limpieza definitiva de datos de demostración en Render.
     *
     * Esta migración tiene un nombre nuevo para que Laravel la detecte como
     * pendiente aunque la migración anterior haya quedado registrada.
     * Conserva únicamente cuatro cuentas, crea el expediente mínimo del
     * paciente y vuelve a cargar el catálogo de 30 medicamentos.
     */
    public function up(): void
    {
        $reset = function (): void {
            $now = now();

            $accounts = [
                [
                    'fallback_name' => 'SuperAdmin',
                    'email' => 'correo.prueba@estoes.com',
                    'password' => '12345678',
                    'role' => 'Administrador Sistema',
                ],
                [
                    'fallback_name' => 'Paciente',
                    'email' => 'kiyoshijuarezmu@gmail.com',
                    'password' => '12345678',
                    'role' => 'Paciente',
                ],
                [
                    'fallback_name' => 'Admin Farmacia',
                    'email' => 'victor@hospital.com',
                    'password' => '12345678',
                    'role' => 'Administrador Farmacia',
                ],
                [
                    'fallback_name' => 'Medico',
                    'email' => 'natalia@hospital.com',
                    'password' => '12345678',
                    'role' => 'Medico',
                ],
            ];

            $targetEmails = array_column($accounts, 'email');

            // El orden evita conflictos con las llaves foráneas. En PostgreSQL
            // TRUNCATE ... CASCADE también limpia cualquier tabla dependiente.
            $this->clearApplicationTables([
                'medication_schedules',
                'prescription_items',
                'prescriptions',
                'inventory_alert_states',
                'inventories',
                'medicines',
                'patients',
                'notifications',
                'push_subscriptions',
                'personal_access_tokens',
                'password_reset_tokens',
                'sessions',
                'jobs',
                'job_batches',
                'failed_jobs',
                'cache_locks',
                'cache',
            ]);

            // Se eliminan todas las cuentas distintas de las cuatro autorizadas.
            DB::table('users')
                ->whereNotIn('email', $targetEmails)
                ->delete();

            $userIds = [];

            foreach ($accounts as $account) {
                $existing = DB::table('users')
                    ->where('email', $account['email'])
                    ->first();

                $values = [
                    'name' => $existing?->name ?: $account['fallback_name'],
                    'email' => $account['email'],
                    'password' => Hash::make($account['password']),
                    'role' => $account['role'],
                    'status' => 'Activo',
                    'email_verified_at' => $existing?->email_verified_at ?: $now,
                    'remember_token' => null,
                    'updated_at' => $now,
                ];

                if ($existing) {
                    DB::table('users')
                        ->where('id', $existing->id)
                        ->update($values);

                    $userIds[$account['email']] = (int) $existing->id;
                    continue;
                }

                $values['created_at'] = $now;

                $userIds[$account['email']] = (int) DB::table('users')
                    ->insertGetId($values);
            }

            $patientUserId = $userIds['kiyoshijuarezmu@gmail.com'];
            $patientName = DB::table('users')
                ->where('id', $patientUserId)
                ->value('name') ?: 'Paciente';

            DB::table('patients')->insert([
                'user_id' => $patientUserId,
                'record_number' => 'EXP-' . $now->format('Y') . '-001',
                'full_name' => $patientName,
                'birth_date' => null,
                'age' => null,
                'diagnosis' => 'Pendiente por registrar',
                'allergies' => 'Pendiente por registrar',
                'medical_conditions' => null,
                'clinical_notes' => null,
                'last_treatment' => 'Pendiente por registrar',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $medicines = [
                [
                    'code' => 'MED-001',
                    'name' => 'Ibuprofeno con paracetamol',
                    'presentation' => 'Tabletas',
                    'concentration' => '400 mg / 325 mg',
                    'unit' => 'tableta',
                    'description' => 'Analgésico y antipirético combinado para datos de demostración.',
                    'lot_number' => 'LOT-IBP-001',
                    'stock' => 500,
                    'min_stock' => 50,
                    'location' => 'Estante A-01',
                    'expiration_months' => 24,
                ],
                [
                    'code' => 'MED-002',
                    'name' => 'Metamizol Sódico',
                    'presentation' => 'Tabletas',
                    'concentration' => '500 mg',
                    'unit' => 'tableta',
                    'description' => 'Analgésico y antipirético para datos de demostración.',
                    'lot_number' => 'LOT-MET-001',
                    'stock' => 800,
                    'min_stock' => 80,
                    'location' => 'Estante A-02',
                    'expiration_months' => 24,
                ],
                [
                    'code' => 'MED-003',
                    'name' => 'Paracetamol',
                    'presentation' => 'Tabletas',
                    'concentration' => '500 mg',
                    'unit' => 'tableta',
                    'description' => 'Analgésico y antipirético de uso común para pruebas del sistema.',
                    'lot_number' => 'LOT-PAR-001',
                    'stock' => 1000,
                    'min_stock' => 100,
                    'location' => 'Estante A-03',
                    'expiration_months' => 30,
                ],
                [
                    'code' => 'MED-004',
                    'name' => 'Naproxeno',
                    'presentation' => 'Tabletas',
                    'concentration' => '500 mg',
                    'unit' => 'tableta',
                    'description' => 'Antiinflamatorio no esteroideo para datos de demostración.',
                    'lot_number' => 'LOT-NAP-001',
                    'stock' => 450,
                    'min_stock' => 45,
                    'location' => 'Estante A-04',
                    'expiration_months' => 24,
                ],
                [
                    'code' => 'MED-005',
                    'name' => 'Amoxicilina',
                    'presentation' => 'Cápsulas',
                    'concentration' => '500 mg',
                    'unit' => 'cápsula',
                    'description' => 'Antibiótico betalactámico incluido como dato de demostración.',
                    'lot_number' => 'LOT-AMX-001',
                    'stock' => 600,
                    'min_stock' => 60,
                    'location' => 'Estante B-01',
                    'expiration_months' => 18,
                ],
                [
                    'code' => 'MED-006',
                    'name' => 'Azitromicina',
                    'presentation' => 'Tabletas',
                    'concentration' => '500 mg',
                    'unit' => 'tableta',
                    'description' => 'Antibiótico macrólido incluido como dato de demostración.',
                    'lot_number' => 'LOT-AZI-001',
                    'stock' => 300,
                    'min_stock' => 30,
                    'location' => 'Estante B-02',
                    'expiration_months' => 18,
                ],
                [
                    'code' => 'MED-007',
                    'name' => 'Cefalexina',
                    'presentation' => 'Cápsulas',
                    'concentration' => '500 mg',
                    'unit' => 'cápsula',
                    'description' => 'Cefalosporina incluida como dato de demostración.',
                    'lot_number' => 'LOT-CEF-001',
                    'stock' => 400,
                    'min_stock' => 40,
                    'location' => 'Estante B-03',
                    'expiration_months' => 20,
                ],
                [
                    'code' => 'MED-008',
                    'name' => 'Omeprazol',
                    'presentation' => 'Cápsulas',
                    'concentration' => '20 mg',
                    'unit' => 'cápsula',
                    'description' => 'Protector gástrico para datos de demostración.',
                    'lot_number' => 'LOT-OME-001',
                    'stock' => 700,
                    'min_stock' => 70,
                    'location' => 'Estante C-01',
                    'expiration_months' => 28,
                ],
                [
                    'code' => 'MED-009',
                    'name' => 'Metformina',
                    'presentation' => 'Tabletas',
                    'concentration' => '850 mg',
                    'unit' => 'tableta',
                    'description' => 'Antidiabético oral para datos de demostración.',
                    'lot_number' => 'LOT-MTF-001',
                    'stock' => 900,
                    'min_stock' => 90,
                    'location' => 'Estante C-02',
                    'expiration_months' => 30,
                ],
                [
                    'code' => 'MED-010',
                    'name' => 'Losartán',
                    'presentation' => 'Tabletas',
                    'concentration' => '50 mg',
                    'unit' => 'tableta',
                    'description' => 'Antihipertensivo para datos de demostración.',
                    'lot_number' => 'LOT-LOS-001',
                    'stock' => 700,
                    'min_stock' => 70,
                    'location' => 'Estante C-03',
                    'expiration_months' => 30,
                ],
                [
                    'code' => 'MED-011',
                    'name' => 'Amlodipino',
                    'presentation' => 'Tabletas',
                    'concentration' => '5 mg',
                    'unit' => 'tableta',
                    'description' => 'Antihipertensivo bloqueador de canales de calcio para demostración.',
                    'lot_number' => 'LOT-AML-001',
                    'stock' => 500,
                    'min_stock' => 50,
                    'location' => 'Estante C-04',
                    'expiration_months' => 30,
                ],
                [
                    'code' => 'MED-012',
                    'name' => 'Loratadina',
                    'presentation' => 'Tabletas',
                    'concentration' => '10 mg',
                    'unit' => 'tableta',
                    'description' => 'Antihistamínico para datos de demostración.',
                    'lot_number' => 'LOT-LOR-001',
                    'stock' => 600,
                    'min_stock' => 60,
                    'location' => 'Estante D-01',
                    'expiration_months' => 26,
                ],
                [
                    'code' => 'MED-013',
                    'name' => 'Salbutamol',
                    'presentation' => 'Inhalador',
                    'concentration' => '100 mcg/dosis',
                    'unit' => 'inhalador',
                    'description' => 'Broncodilatador inhalado para datos de demostración.',
                    'lot_number' => 'LOT-SAL-001',
                    'stock' => 120,
                    'min_stock' => 15,
                    'location' => 'Estante D-02',
                    'expiration_months' => 20,
                ],
                [
                    'code' => 'MED-014',
                    'name' => 'Ambroxol',
                    'presentation' => 'Jarabe',
                    'concentration' => '30 mg/5 ml',
                    'unit' => 'frasco',
                    'description' => 'Mucolítico en presentación líquida para datos de demostración.',
                    'lot_number' => 'LOT-AMB-001',
                    'stock' => 180,
                    'min_stock' => 20,
                    'location' => 'Estante D-03',
                    'expiration_months' => 18,
                ],
                [
                    'code' => 'MED-015',
                    'name' => 'Dextrometorfano',
                    'presentation' => 'Jarabe',
                    'concentration' => '15 mg/5 ml',
                    'unit' => 'frasco',
                    'description' => 'Antitusivo en presentación líquida para datos de demostración.',
                    'lot_number' => 'LOT-DEX-001',
                    'stock' => 150,
                    'min_stock' => 15,
                    'location' => 'Estante D-04',
                    'expiration_months' => 18,
                ],
                [
                    'code' => 'MED-016',
                    'name' => 'Sales de rehidratación oral',
                    'presentation' => 'Sobres',
                    'concentration' => 'Fórmula de rehidratación oral',
                    'unit' => 'sobre',
                    'description' => 'Polvo para preparar solución de rehidratación; dato de demostración.',
                    'lot_number' => 'LOT-SRO-001',
                    'stock' => 500,
                    'min_stock' => 50,
                    'location' => 'Estante E-01',
                    'expiration_months' => 24,
                ],
                [
                    'code' => 'MED-017',
                    'name' => 'Diclofenaco',
                    'presentation' => 'Gel',
                    'concentration' => '1%',
                    'unit' => 'tubo',
                    'description' => 'Antiinflamatorio tópico para datos de demostración.',
                    'lot_number' => 'LOT-DIC-001',
                    'stock' => 200,
                    'min_stock' => 20,
                    'location' => 'Estante E-02',
                    'expiration_months' => 24,
                ],
                [
                    'code' => 'MED-018',
                    'name' => 'Clotrimazol',
                    'presentation' => 'Crema',
                    'concentration' => '1%',
                    'unit' => 'tubo',
                    'description' => 'Antimicótico tópico para datos de demostración.',
                    'lot_number' => 'LOT-CLO-001',
                    'stock' => 220,
                    'min_stock' => 25,
                    'location' => 'Estante E-03',
                    'expiration_months' => 22,
                ],
                [
                    'code' => 'MED-019',
                    'name' => 'Mupirocina',
                    'presentation' => 'Ungüento',
                    'concentration' => '2%',
                    'unit' => 'tubo',
                    'description' => 'Antibiótico tópico para datos de demostración.',
                    'lot_number' => 'LOT-MUP-001',
                    'stock' => 150,
                    'min_stock' => 15,
                    'location' => 'Estante E-04',
                    'expiration_months' => 20,
                ],
                [
                    'code' => 'MED-020',
                    'name' => 'Ciprofloxacino oftálmico',
                    'presentation' => 'Gotas',
                    'concentration' => '0.3%',
                    'unit' => 'frasco',
                    'description' => 'Solución oftálmica incluida como dato de demostración.',
                    'lot_number' => 'LOT-CIP-001',
                    'stock' => 140,
                    'min_stock' => 15,
                    'location' => 'Estante F-01',
                    'expiration_months' => 18,
                ],
                [
                    'code' => 'MED-021',
                    'name' => 'Insulina NPH',
                    'presentation' => 'Suspensión inyectable',
                    'concentration' => '100 UI/ml',
                    'unit' => 'vial',
                    'description' => 'Insulina de acción intermedia para datos de demostración.',
                    'lot_number' => 'LOT-INP-001',
                    'stock' => 90,
                    'min_stock' => 10,
                    'location' => 'Refrigerador R-01',
                    'expiration_months' => 15,
                ],
                [
                    'code' => 'MED-022',
                    'name' => 'Insulina glargina',
                    'presentation' => 'Solución inyectable',
                    'concentration' => '100 UI/ml',
                    'unit' => 'pluma',
                    'description' => 'Insulina de acción prolongada para datos de demostración.',
                    'lot_number' => 'LOT-ING-001',
                    'stock' => 80,
                    'min_stock' => 10,
                    'location' => 'Refrigerador R-02',
                    'expiration_months' => 18,
                ],
                [
                    'code' => 'MED-023',
                    'name' => 'Ácido fólico',
                    'presentation' => 'Tabletas',
                    'concentration' => '5 mg',
                    'unit' => 'tableta',
                    'description' => 'Suplemento vitamínico para datos de demostración.',
                    'lot_number' => 'LOT-AFO-001',
                    'stock' => 500,
                    'min_stock' => 50,
                    'location' => 'Estante F-02',
                    'expiration_months' => 30,
                ],
                [
                    'code' => 'MED-024',
                    'name' => 'Sulfato ferroso',
                    'presentation' => 'Tabletas',
                    'concentration' => '200 mg',
                    'unit' => 'tableta',
                    'description' => 'Suplemento de hierro para datos de demostración.',
                    'lot_number' => 'LOT-SFE-001',
                    'stock' => 600,
                    'min_stock' => 60,
                    'location' => 'Estante F-03',
                    'expiration_months' => 30,
                ],
                [
                    'code' => 'MED-025',
                    'name' => 'Ácido acetilsalicílico',
                    'presentation' => 'Tabletas',
                    'concentration' => '100 mg',
                    'unit' => 'tableta',
                    'description' => 'Antiagregante plaquetario incluido como dato de demostración.',
                    'lot_number' => 'LOT-AAS-001',
                    'stock' => 500,
                    'min_stock' => 50,
                    'location' => 'Estante F-04',
                    'expiration_months' => 28,
                ],
                [
                    'code' => 'MED-026',
                    'name' => 'Loperamida',
                    'presentation' => 'Cápsulas',
                    'concentration' => '2 mg',
                    'unit' => 'cápsula',
                    'description' => 'Antidiarreico para datos de demostración.',
                    'lot_number' => 'LOT-LOP-001',
                    'stock' => 250,
                    'min_stock' => 25,
                    'location' => 'Estante G-01',
                    'expiration_months' => 26,
                ],
                [
                    'code' => 'MED-027',
                    'name' => 'Ondansetrón',
                    'presentation' => 'Tabletas',
                    'concentration' => '8 mg',
                    'unit' => 'tableta',
                    'description' => 'Antiemético para datos de demostración.',
                    'lot_number' => 'LOT-OND-001',
                    'stock' => 200,
                    'min_stock' => 20,
                    'location' => 'Estante G-02',
                    'expiration_months' => 22,
                ],
                [
                    'code' => 'MED-028',
                    'name' => 'Hidrocortisona',
                    'presentation' => 'Crema',
                    'concentration' => '1%',
                    'unit' => 'tubo',
                    'description' => 'Corticoide tópico para datos de demostración.',
                    'lot_number' => 'LOT-HID-001',
                    'stock' => 180,
                    'min_stock' => 20,
                    'location' => 'Estante G-03',
                    'expiration_months' => 22,
                ],
                [
                    'code' => 'MED-029',
                    'name' => 'Gentamicina',
                    'presentation' => 'Ampolletas',
                    'concentration' => '80 mg/2 ml',
                    'unit' => 'ampolleta',
                    'description' => 'Antibiótico inyectable incluido como dato de demostración.',
                    'lot_number' => 'LOT-GEN-001',
                    'stock' => 160,
                    'min_stock' => 20,
                    'location' => 'Gabinete H-01',
                    'expiration_months' => 20,
                ],
                [
                    'code' => 'MED-030',
                    'name' => 'Solución salina',
                    'presentation' => 'Solución inyectable',
                    'concentration' => '0.9% / 500 ml',
                    'unit' => 'bolsa',
                    'description' => 'Solución intravenosa para datos de demostración.',
                    'lot_number' => 'LOT-SSN-001',
                    'stock' => 200,
                    'min_stock' => 25,
                    'location' => 'Almacén H-02',
                    'expiration_months' => 24,
                ],
            ];

            foreach ($medicines as $item) {
                $medicineId = (int) DB::table('medicines')->insertGetId([
                    'code' => $item['code'],
                    'name' => $item['name'],
                    'presentation' => $item['presentation'],
                    'concentration' => $item['concentration'],
                    'unit' => $item['unit'],
                    'description' => $item['description'],
                    'status' => 'Activo',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                DB::table('inventories')->insert([
                    'medicine_id' => $medicineId,
                    'lot_number' => $item['lot_number'],
                    'stock' => $item['stock'],
                    'min_stock' => $item['min_stock'],
                    'location' => $item['location'],
                    'expiration_date' => $now->copy()
                        ->addMonths($item['expiration_months'])
                        ->toDateString(),
                    'status' => 'Activo',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        };

        // En PostgreSQL toda la limpieza queda dentro de una sola transacción.
        // Si algo falla, no se aplican cambios parciales.
        if (DB::getDriverName() === 'pgsql') {
            DB::transaction($reset);
            return;
        }

        $reset();
    }

    /**
     * La operación es destructiva y no puede reconstruir los datos anteriores.
     */
    public function down(): void
    {
        // Intencionalmente vacío.
    }

    private function clearApplicationTables(array $tables): void
    {
        $existingTables = array_values(array_filter(
            $tables,
            static fn (string $table): bool => Schema::hasTable($table)
        ));

        if ($existingTables === []) {
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            $quotedTables = implode(', ', array_map(
                static fn (string $table): string => '"' . $table . '"',
                $existingTables
            ));

            DB::statement("TRUNCATE TABLE {$quotedTables} RESTART IDENTITY CASCADE");
            return;
        }

        Schema::disableForeignKeyConstraints();

        try {
            foreach ($existingTables as $table) {
                DB::table($table)->truncate();
            }
        } finally {
            Schema::enableForeignKeyConstraints();
        }
    }
};
