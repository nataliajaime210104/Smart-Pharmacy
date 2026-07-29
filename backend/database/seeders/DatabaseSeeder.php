<?php

namespace Database\Seeders;

use App\Models\Inventory;
use App\Models\Medicine;
use App\Models\Patient;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $accounts = [
            [
                'name' => 'SuperAdmin',
                'email' => 'correo.prueba@estoes.com',
                'role' => 'Administrador Sistema',
            ],
            [
                'name' => 'Paciente',
                'email' => 'kiyoshijuarezmu@gmail.com',
                'role' => 'Paciente',
            ],
            [
                'name' => 'Admin Farmacia',
                'email' => 'victor@hospital.com',
                'role' => 'Administrador Farmacia',
            ],
            [
                'name' => 'Medico',
                'email' => 'natalia@hospital.com',
                'role' => 'Medico',
            ],
        ];

        $users = [];

        foreach ($accounts as $account) {
            $user = User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make('12345678'),
                    'role' => $account['role'],
                    'status' => 'Activo',
                ]
            );

            $users[$account['email']] = $user;
        }

        $patientUser = $users['kiyoshijuarezmu@gmail.com'];

        Patient::updateOrCreate(
            ['user_id' => $patientUser->id],
            [
                'record_number' => 'EXP-' . now()->format('Y') . '-001',
                'full_name' => $patientUser->name,
                'birth_date' => null,
                'age' => null,
                'diagnosis' => 'Pendiente por registrar',
                'allergies' => 'Pendiente por registrar',
                'medical_conditions' => null,
                'clinical_notes' => null,
                'last_treatment' => 'Pendiente por registrar',
            ]
        );

        $medicines = [
            ['code' => 'MED-001', 'name' => 'Ibuprofeno con paracetamol', 'presentation' => 'Tabletas', 'concentration' => '400 mg / 325 mg', 'unit' => 'tableta', 'description' => 'Analgésico y antipirético combinado para datos de demostración.', 'stock' => 500, 'min_stock' => 50, 'lot_number' => 'LOT-IBP-001', 'location' => 'Estante A-01', 'expiration_months' => 24],
            ['code' => 'MED-002', 'name' => 'Metamizol Sódico', 'presentation' => 'Tabletas', 'concentration' => '500 mg', 'unit' => 'tableta', 'description' => 'Analgésico y antipirético para datos de demostración.', 'stock' => 800, 'min_stock' => 80, 'lot_number' => 'LOT-MET-001', 'location' => 'Estante A-02', 'expiration_months' => 24],
            ['code' => 'MED-003', 'name' => 'Paracetamol', 'presentation' => 'Tabletas', 'concentration' => '500 mg', 'unit' => 'tableta', 'description' => 'Analgésico y antipirético de uso común para pruebas del sistema.', 'stock' => 1000, 'min_stock' => 100, 'lot_number' => 'LOT-PAR-001', 'location' => 'Estante A-03', 'expiration_months' => 30],
            ['code' => 'MED-004', 'name' => 'Naproxeno', 'presentation' => 'Tabletas', 'concentration' => '500 mg', 'unit' => 'tableta', 'description' => 'Antiinflamatorio no esteroideo para datos de demostración.', 'stock' => 450, 'min_stock' => 45, 'lot_number' => 'LOT-NAP-001', 'location' => 'Estante A-04', 'expiration_months' => 24],
            ['code' => 'MED-005', 'name' => 'Amoxicilina', 'presentation' => 'Cápsulas', 'concentration' => '500 mg', 'unit' => 'cápsula', 'description' => 'Antibiótico betalactámico incluido como dato de demostración.', 'stock' => 600, 'min_stock' => 60, 'lot_number' => 'LOT-AMX-001', 'location' => 'Estante B-01', 'expiration_months' => 18],
            ['code' => 'MED-006', 'name' => 'Azitromicina', 'presentation' => 'Tabletas', 'concentration' => '500 mg', 'unit' => 'tableta', 'description' => 'Antibiótico macrólido incluido como dato de demostración.', 'stock' => 300, 'min_stock' => 30, 'lot_number' => 'LOT-AZI-001', 'location' => 'Estante B-02', 'expiration_months' => 18],
            ['code' => 'MED-007', 'name' => 'Cefalexina', 'presentation' => 'Cápsulas', 'concentration' => '500 mg', 'unit' => 'cápsula', 'description' => 'Cefalosporina incluida como dato de demostración.', 'stock' => 400, 'min_stock' => 40, 'lot_number' => 'LOT-CEF-001', 'location' => 'Estante B-03', 'expiration_months' => 20],
            ['code' => 'MED-008', 'name' => 'Omeprazol', 'presentation' => 'Cápsulas', 'concentration' => '20 mg', 'unit' => 'cápsula', 'description' => 'Protector gástrico para datos de demostración.', 'stock' => 700, 'min_stock' => 70, 'lot_number' => 'LOT-OME-001', 'location' => 'Estante C-01', 'expiration_months' => 28],
            ['code' => 'MED-009', 'name' => 'Metformina', 'presentation' => 'Tabletas', 'concentration' => '850 mg', 'unit' => 'tableta', 'description' => 'Antidiabético oral para datos de demostración.', 'stock' => 900, 'min_stock' => 90, 'lot_number' => 'LOT-MTF-001', 'location' => 'Estante C-02', 'expiration_months' => 30],
            ['code' => 'MED-010', 'name' => 'Losartán', 'presentation' => 'Tabletas', 'concentration' => '50 mg', 'unit' => 'tableta', 'description' => 'Antihipertensivo para datos de demostración.', 'stock' => 700, 'min_stock' => 70, 'lot_number' => 'LOT-LOS-001', 'location' => 'Estante C-03', 'expiration_months' => 30],
            ['code' => 'MED-011', 'name' => 'Amlodipino', 'presentation' => 'Tabletas', 'concentration' => '5 mg', 'unit' => 'tableta', 'description' => 'Antihipertensivo bloqueador de canales de calcio para demostración.', 'stock' => 500, 'min_stock' => 50, 'lot_number' => 'LOT-AML-001', 'location' => 'Estante C-04', 'expiration_months' => 30],
            ['code' => 'MED-012', 'name' => 'Loratadina', 'presentation' => 'Tabletas', 'concentration' => '10 mg', 'unit' => 'tableta', 'description' => 'Antihistamínico para datos de demostración.', 'stock' => 600, 'min_stock' => 60, 'lot_number' => 'LOT-LOR-001', 'location' => 'Estante D-01', 'expiration_months' => 26],
            ['code' => 'MED-013', 'name' => 'Salbutamol', 'presentation' => 'Inhalador', 'concentration' => '100 mcg/dosis', 'unit' => 'inhalador', 'description' => 'Broncodilatador inhalado para datos de demostración.', 'stock' => 120, 'min_stock' => 15, 'lot_number' => 'LOT-SAL-001', 'location' => 'Estante D-02', 'expiration_months' => 20],
            ['code' => 'MED-014', 'name' => 'Ambroxol', 'presentation' => 'Jarabe', 'concentration' => '30 mg/5 ml', 'unit' => 'frasco', 'description' => 'Mucolítico en presentación líquida para datos de demostración.', 'stock' => 180, 'min_stock' => 20, 'lot_number' => 'LOT-AMB-001', 'location' => 'Estante D-03', 'expiration_months' => 18],
            ['code' => 'MED-015', 'name' => 'Dextrometorfano', 'presentation' => 'Jarabe', 'concentration' => '15 mg/5 ml', 'unit' => 'frasco', 'description' => 'Antitusivo en presentación líquida para datos de demostración.', 'stock' => 150, 'min_stock' => 15, 'lot_number' => 'LOT-DEX-001', 'location' => 'Estante D-04', 'expiration_months' => 18],
            ['code' => 'MED-016', 'name' => 'Sales de rehidratación oral', 'presentation' => 'Sobres', 'concentration' => 'Fórmula de rehidratación oral', 'unit' => 'sobre', 'description' => 'Polvo para preparar solución de rehidratación; dato de demostración.', 'stock' => 500, 'min_stock' => 50, 'lot_number' => 'LOT-SRO-001', 'location' => 'Estante E-01', 'expiration_months' => 24],
            ['code' => 'MED-017', 'name' => 'Diclofenaco', 'presentation' => 'Gel', 'concentration' => '1%', 'unit' => 'tubo', 'description' => 'Antiinflamatorio tópico para datos de demostración.', 'stock' => 200, 'min_stock' => 20, 'lot_number' => 'LOT-DIC-001', 'location' => 'Estante E-02', 'expiration_months' => 24],
            ['code' => 'MED-018', 'name' => 'Clotrimazol', 'presentation' => 'Crema', 'concentration' => '1%', 'unit' => 'tubo', 'description' => 'Antimicótico tópico para datos de demostración.', 'stock' => 220, 'min_stock' => 25, 'lot_number' => 'LOT-CLO-001', 'location' => 'Estante E-03', 'expiration_months' => 22],
            ['code' => 'MED-019', 'name' => 'Mupirocina', 'presentation' => 'Ungüento', 'concentration' => '2%', 'unit' => 'tubo', 'description' => 'Antibiótico tópico para datos de demostración.', 'stock' => 150, 'min_stock' => 15, 'lot_number' => 'LOT-MUP-001', 'location' => 'Estante E-04', 'expiration_months' => 20],
            ['code' => 'MED-020', 'name' => 'Ciprofloxacino oftálmico', 'presentation' => 'Gotas', 'concentration' => '0.3%', 'unit' => 'frasco', 'description' => 'Solución oftálmica incluida como dato de demostración.', 'stock' => 140, 'min_stock' => 15, 'lot_number' => 'LOT-CIP-001', 'location' => 'Estante F-01', 'expiration_months' => 18],
            ['code' => 'MED-021', 'name' => 'Insulina NPH', 'presentation' => 'Suspensión inyectable', 'concentration' => '100 UI/ml', 'unit' => 'vial', 'description' => 'Insulina de acción intermedia para datos de demostración.', 'stock' => 90, 'min_stock' => 10, 'lot_number' => 'LOT-INP-001', 'location' => 'Refrigerador R-01', 'expiration_months' => 15],
            ['code' => 'MED-022', 'name' => 'Insulina glargina', 'presentation' => 'Solución inyectable', 'concentration' => '100 UI/ml', 'unit' => 'pluma', 'description' => 'Insulina de acción prolongada para datos de demostración.', 'stock' => 80, 'min_stock' => 10, 'lot_number' => 'LOT-ING-001', 'location' => 'Refrigerador R-02', 'expiration_months' => 18],
            ['code' => 'MED-023', 'name' => 'Ácido fólico', 'presentation' => 'Tabletas', 'concentration' => '5 mg', 'unit' => 'tableta', 'description' => 'Suplemento vitamínico para datos de demostración.', 'stock' => 500, 'min_stock' => 50, 'lot_number' => 'LOT-AFO-001', 'location' => 'Estante F-02', 'expiration_months' => 30],
            ['code' => 'MED-024', 'name' => 'Sulfato ferroso', 'presentation' => 'Tabletas', 'concentration' => '200 mg', 'unit' => 'tableta', 'description' => 'Suplemento de hierro para datos de demostración.', 'stock' => 600, 'min_stock' => 60, 'lot_number' => 'LOT-SFE-001', 'location' => 'Estante F-03', 'expiration_months' => 30],
            ['code' => 'MED-025', 'name' => 'Ácido acetilsalicílico', 'presentation' => 'Tabletas', 'concentration' => '100 mg', 'unit' => 'tableta', 'description' => 'Antiagregante plaquetario incluido como dato de demostración.', 'stock' => 500, 'min_stock' => 50, 'lot_number' => 'LOT-AAS-001', 'location' => 'Estante F-04', 'expiration_months' => 28],
            ['code' => 'MED-026', 'name' => 'Loperamida', 'presentation' => 'Cápsulas', 'concentration' => '2 mg', 'unit' => 'cápsula', 'description' => 'Antidiarreico para datos de demostración.', 'stock' => 250, 'min_stock' => 25, 'lot_number' => 'LOT-LOP-001', 'location' => 'Estante G-01', 'expiration_months' => 26],
            ['code' => 'MED-027', 'name' => 'Ondansetrón', 'presentation' => 'Tabletas', 'concentration' => '8 mg', 'unit' => 'tableta', 'description' => 'Antiemético para datos de demostración.', 'stock' => 200, 'min_stock' => 20, 'lot_number' => 'LOT-OND-001', 'location' => 'Estante G-02', 'expiration_months' => 22],
            ['code' => 'MED-028', 'name' => 'Hidrocortisona', 'presentation' => 'Crema', 'concentration' => '1%', 'unit' => 'tubo', 'description' => 'Corticoide tópico para datos de demostración.', 'stock' => 180, 'min_stock' => 20, 'lot_number' => 'LOT-HID-001', 'location' => 'Estante G-03', 'expiration_months' => 22],
            ['code' => 'MED-029', 'name' => 'Gentamicina', 'presentation' => 'Ampolletas', 'concentration' => '80 mg/2 ml', 'unit' => 'ampolleta', 'description' => 'Antibiótico inyectable incluido como dato de demostración.', 'stock' => 160, 'min_stock' => 20, 'lot_number' => 'LOT-GEN-001', 'location' => 'Gabinete H-01', 'expiration_months' => 20],
            ['code' => 'MED-030', 'name' => 'Solución salina', 'presentation' => 'Solución inyectable', 'concentration' => '0.9% / 500 ml', 'unit' => 'bolsa', 'description' => 'Solución intravenosa para datos de demostración.', 'stock' => 200, 'min_stock' => 25, 'lot_number' => 'LOT-SSN-001', 'location' => 'Almacén H-02', 'expiration_months' => 24],
        ];

        foreach ($medicines as $medicineData) {
            $medicine = Medicine::updateOrCreate(
                ['code' => $medicineData['code']],
                [
                    'name' => $medicineData['name'],
                    'presentation' => $medicineData['presentation'],
                    'concentration' => $medicineData['concentration'],
                    'unit' => $medicineData['unit'],
                    'description' => $medicineData['description'],
                    'status' => 'Activo',
                ]
            );

            Inventory::updateOrCreate(
                [
                    'medicine_id' => $medicine->id,
                    'lot_number' => $medicineData['lot_number'],
                ],
                [
                    'stock' => $medicineData['stock'],
                    'min_stock' => $medicineData['min_stock'],
                    'location' => $medicineData['location'],
                    'expiration_date' => now()
                        ->addMonths($medicineData['expiration_months'])
                        ->toDateString(),
                    'status' => 'Activo',
                ]
            );
        }
    }
}
