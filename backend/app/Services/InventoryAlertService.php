<?php

namespace App\Services;

use App\Models\InventoryAlertState;
use App\Models\Medicine;
use App\Models\User;
use App\Notifications\SmartPharmacyNotification;

class InventoryAlertService
{
    public function __construct(
        private readonly NotificationDispatcher $dispatcher,
    ) {
    }

    public function evaluateMedicine(int $medicineId): void
    {
        $medicine = Medicine::find($medicineId);

        if (!$medicine) {
            return;
        }

        $totals = $medicine->inventories()
            ->where('status', 'Activo')
            ->selectRaw('COALESCE(SUM(stock), 0) as current_stock, COALESCE(MAX(min_stock), 0) as minimum_stock')
            ->first();

        $currentStock = (int) ($totals?->current_stock ?? 0);
        $minimumStock = (int) ($totals?->minimum_stock ?? 0);
        $newState = $this->calculateState($medicine, $currentStock, $minimumStock);

        $state = InventoryAlertState::firstOrNew([
            'medicine_id' => $medicine->id,
        ]);

        $previousState = $state->exists ? $state->state : null;
        $stateChanged = $previousState !== $newState;

        $state->fill([
            'state' => $newState,
            'current_stock' => $currentStock,
            'minimum_stock' => $minimumStock,
        ]);

        if (!$stateChanged) {
            $state->save();
            return;
        }

        // No generamos una notificación inicial cuando el inventario ya está normal.
        if ($previousState === null && $newState === 'normal') {
            $state->save();
            return;
        }

        $roles = $newState === 'normal'
            ? ['Administrador Farmacia']
            : ['Medico', 'Administrador Farmacia'];

        $notified = false;

        User::query()
            ->where('status', 'Activo')
            ->whereIn('role', $roles)
            ->each(function (User $user) use (
                $medicine,
                $newState,
                $currentStock,
                $minimumStock,
                &$notified,
            ): void {
                $notification = $this->buildNotification(
                    $medicine,
                    $newState,
                    $currentStock,
                    $minimumStock,
                    $user->role,
                );

                if (!$notification) {
                    return;
                }

                $this->dispatcher->send($user, $notification);
                $notified = true;
            });

        if ($notified) {
            $state->last_notified_at = now();
        }

        $state->save();
    }

    /**
     * @param array<int> $medicineIds
     */
    public function evaluateMany(array $medicineIds): void
    {
        foreach (array_unique(array_map('intval', $medicineIds)) as $medicineId) {
            $this->evaluateMedicine($medicineId);
        }
    }

    private function calculateState(
        Medicine $medicine,
        int $currentStock,
        int $minimumStock,
    ): string {
        if ($medicine->status !== 'Activo') {
            return 'inactive';
        }

        if ($currentStock <= 0) {
            return 'out_of_stock';
        }

        if ($minimumStock > 0 && $currentStock <= $minimumStock) {
            return 'low_stock';
        }

        $nearLowFactor = max((float) env('INVENTORY_NEAR_LOW_FACTOR', 1.25), 1.0);
        $nearLowThreshold = (int) ceil($minimumStock * $nearLowFactor);

        if ($minimumStock > 0 && $currentStock <= $nearLowThreshold) {
            return 'near_low_stock';
        }

        return 'normal';
    }

    private function buildNotification(
        Medicine $medicine,
        string $state,
        int $currentStock,
        int $minimumStock,
        string $recipientRole,
    ): ?SmartPharmacyNotification {
        $baseMetadata = [
            'medicineId' => $medicine->id,
            'medicineName' => $medicine->name,
            'currentStock' => $currentStock,
            'minimumStock' => $minimumStock,
            'inventoryState' => $state,
        ];

        $actionUrl = match ($recipientRole) {
            'Administrador Farmacia' => $state === 'inactive'
                ? '/?section=medicines'
                : '/?section=inventory',
            'Medico' => '/?section=prescriptions',
            default => '/',
        };

        return match ($state) {
            'out_of_stock' => new SmartPharmacyNotification(
                notificationType: 'inventory_out_of_stock',
                title: 'Medicamento sin existencias',
                body: "{$medicine->name} ya no tiene existencias disponibles.",
                actionUrl: $actionUrl,
                severity: 'danger',
                metadata: $baseMetadata,
            ),
            'low_stock' => new SmartPharmacyNotification(
                notificationType: 'inventory_low_stock',
                title: 'Stock bajo de medicamento',
                body: "{$medicine->name} tiene {$currentStock} unidades; el mínimo configurado es {$minimumStock}.",
                actionUrl: $actionUrl,
                severity: 'danger',
                metadata: $baseMetadata,
            ),
            'near_low_stock' => new SmartPharmacyNotification(
                notificationType: 'inventory_near_low',
                title: 'Medicamento próximo a stock bajo',
                body: "{$medicine->name} se acerca al mínimo: {$currentStock} unidades disponibles.",
                actionUrl: $actionUrl,
                severity: 'warning',
                metadata: $baseMetadata,
            ),
            'inactive' => new SmartPharmacyNotification(
                notificationType: 'medicine_inactive',
                title: 'Medicamento inactivo',
                body: "{$medicine->name} cambió a estado Inactivo.",
                actionUrl: $actionUrl,
                severity: 'warning',
                metadata: $baseMetadata,
            ),
            'normal' => new SmartPharmacyNotification(
                notificationType: 'inventory_recovered',
                title: 'Inventario restablecido',
                body: "{$medicine->name} regresó a un nivel normal de existencias ({$currentStock} unidades).",
                actionUrl: $actionUrl,
                severity: 'success',
                metadata: $baseMetadata,
            ),
            default => null,
        };
    }
}
