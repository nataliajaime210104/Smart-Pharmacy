<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class InventoryController extends Controller
{
    public function index()
    {
        $inventory = Inventory::with('medicine')
            ->orderBy('id', 'asc')
            ->get()
            ->map(fn ($item) => $this->formatInventory($item));

        return response()->json([
            'success' => true,
            'data' => $inventory,
        ]);
    }

    public function lowStock()
    {
        $inventory = Inventory::with('medicine')
            ->whereColumn('stock', '<=', 'min_stock')
            ->where('status', 'Activo')
            ->orderBy('stock', 'asc')
            ->get()
            ->map(fn ($item) => $this->formatInventory($item));

        return response()->json([
            'success' => true,
            'data' => $inventory,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicineId' => ['required', 'exists:medicines,id'],
            'lotNumber' => ['nullable', 'string', 'max:255'],
            'stock' => ['required', 'integer', 'min:0'],
            'minStock' => ['required', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
            'expirationDate' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $item = Inventory::create([
            'medicine_id' => $validated['medicineId'],
            'lot_number' => $validated['lotNumber'] ?? null,
            'stock' => $validated['stock'],
            'min_stock' => $validated['minStock'],
            'location' => $validated['location'] ?? null,
            'expiration_date' => $validated['expirationDate'] ?? null,
            'status' => $validated['status'],
        ]);

        $item->load('medicine');

        return response()->json([
            'success' => true,
            'message' => 'Inventario registrado correctamente.',
            'data' => $this->formatInventory($item),
        ], 201);
    }

    public function update(Request $request, Inventory $inventory)
    {
        $validated = $request->validate([
            'medicineId' => ['required', 'exists:medicines,id'],
            'lotNumber' => ['nullable', 'string', 'max:255'],
            'stock' => ['required', 'integer', 'min:0'],
            'minStock' => ['required', 'integer', 'min:0'],
            'location' => ['nullable', 'string', 'max:255'],
            'expirationDate' => ['nullable', 'date'],
            'status' => ['required', Rule::in(['Activo', 'Inactivo'])],
        ]);

        $inventory->update([
            'medicine_id' => $validated['medicineId'],
            'lot_number' => $validated['lotNumber'] ?? null,
            'stock' => $validated['stock'],
            'min_stock' => $validated['minStock'],
            'location' => $validated['location'] ?? null,
            'expiration_date' => $validated['expirationDate'] ?? null,
            'status' => $validated['status'],
        ]);

        $inventory->load('medicine');

        return response()->json([
            'success' => true,
            'message' => 'Inventario actualizado correctamente.',
            'data' => $this->formatInventory($inventory),
        ]);
    }

    public function deactivate(Inventory $inventory)
    {
        $inventory->update([
            'status' => 'Inactivo',
        ]);

        $inventory->load('medicine');

        return response()->json([
            'success' => true,
            'message' => 'Inventario desactivado correctamente.',
            'data' => $this->formatInventory($inventory),
        ]);
    }

    private function formatInventory(Inventory $item)
    {
        return [
            'id' => $item->id,
            'medicineId' => $item->medicine_id,
            'medicineName' => $item->medicine?->name,
            'medicineCode' => $item->medicine?->code,
            'lotNumber' => $item->lot_number,
            'stock' => $item->stock,
            'minStock' => $item->min_stock,
            'location' => $item->location,
            'expirationDate' => $item->expiration_date?->format('Y-m-d'),
            'status' => $item->status,
            'isLowStock' => $item->stock <= $item->min_stock,
        ];
    }
}