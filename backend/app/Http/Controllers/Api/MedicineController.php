<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Medicine;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MedicineController extends Controller
{
    public function index()
    {
        $medicines = Medicine::withSum('inventories as total_stock', 'stock')
            ->withSum('inventories as total_min_stock', 'min_stock')
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn ($medicine) => $this->formatMedicine($medicine));

        return response()->json([
            'success' => true,
            'data' => $medicines,
        ]);
    }
    public function catalogs()
    {
        $presentations = collect([
            'Tabletas',
            'Cápsulas',
            'Jarabe',
            'Suspensión',
            'Solución oral',
            'Gotas',
            'Crema',
            'Ungüento',
            'Gel',
            'Ampolletas',
            'Solución inyectable',
            'Aerosol',
            'Inhalador',
            'Supositorios',
            'Parche',
            'Polvo',
            'Sobres',
        ])
            ->merge(
                Medicine::query()
                    ->whereNotNull('presentation')
                    ->where('presentation', '<>', '')
                    ->pluck('presentation')
            )
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique(fn ($value) => mb_strtolower($value))
            ->sort(fn ($first, $second) => strnatcasecmp($first, $second))
            ->values();

        $concentrations = collect([
            '1 mg',
            '2 mg',
            '5 mg',
            '10 mg',
            '20 mg',
            '25 mg',
            '50 mg',
            '100 mg',
            '200 mg',
            '250 mg',
            '400 mg',
            '500 mg',
            '600 mg',
            '650 mg',
            '750 mg',
            '1 g',
            '5 mg/ml',
            '10 mg/ml',
            '20 mg/ml',
            '50 mg/ml',
            '100 mg/5 ml',
            '125 mg/5 ml',
            '250 mg/5 ml',
            '500 mg/5 ml',
            '1%',
            '2%',
            '5%',
        ])
            ->merge(
                Medicine::query()
                    ->whereNotNull('concentration')
                    ->where('concentration', '<>', '')
                    ->pluck('concentration')
            )
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique(fn ($value) => mb_strtolower($value))
            ->sort(fn ($first, $second) => strnatcasecmp($first, $second))
            ->values();

        $units = collect([
            'Pieza',
            'Caja',
            'Frasco',
            'Blíster',
            'Tubo',
            'Ampolleta',
            'Sobre',
            'Envase',
            'Bolsa',
            'Vial',
            'Lata',
            'Inhalador',
        ])
            ->merge(
                Medicine::query()
                    ->whereNotNull('unit')
                    ->where('unit', '<>', '')
                    ->pluck('unit')
            )
            ->map(fn ($value) => trim((string) $value))
            ->filter()
            ->unique(fn ($value) => mb_strtolower($value))
            ->sort(fn ($first, $second) => strnatcasecmp($first, $second))
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'presentations' => $presentations,
                'concentrations' => $concentrations,
                'units' => $units,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:medicines,code'],
            'name' => ['required', 'string', 'max:255'],
            'presentation' => ['nullable', 'string', 'max:255'],
            'concentration' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $medicine = Medicine::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Medicamento creado correctamente.',
            'data' => $this->formatMedicine($medicine),
        ], 201);
    }

    public function update(Request $request, Medicine $medicine)
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('medicines', 'code')->ignore($medicine->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'presentation' => ['nullable', 'string', 'max:255'],
            'concentration' => ['nullable', 'string', 'max:255'],
            'unit' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $medicine->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Medicamento actualizado correctamente.',
            'data' => $this->formatMedicine($medicine),
        ]);
    }

    public function deactivate(Medicine $medicine)
    {
        $medicine->update([
            'status' => 'Inactivo',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Medicamento desactivado correctamente.',
            'data' => $this->formatMedicine($medicine),
        ]);
    }

    private function formatMedicine(Medicine $medicine)
    {
        return [
            'id' => $medicine->id,
            'code' => $medicine->code,
            'name' => $medicine->name,
            'presentation' => $medicine->presentation,
            'concentration' => $medicine->concentration,
            'unit' => $medicine->unit,
            'description' => $medicine->description,
            'status' => $medicine->status,
            'totalStock' => (int) ($medicine->total_stock ?? 0),
            'totalMinStock' => (int) ($medicine->total_min_stock ?? 0),
        ];
    }
}