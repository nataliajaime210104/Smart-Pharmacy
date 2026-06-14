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