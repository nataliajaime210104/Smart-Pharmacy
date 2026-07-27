<?php

namespace App\Console\Commands;

use App\Models\MedicationSchedule;
use App\Notifications\SmartPharmacyNotification;
use App\Services\NotificationDispatcher;
use Illuminate\Console\Command;

class DispatchMedicationReminders extends Command
{
    protected $signature = 'notifications:medication-reminders';

    protected $description = 'Envía recordatorios de medicamentos programados a los pacientes.';

    public function handle(NotificationDispatcher $dispatcher): int
    {
        $now = now();
        $graceMinutes = max((int) env('MEDICATION_REMINDER_GRACE_MINUTES', 10), 1);
        $sent = 0;

        MedicationSchedule::query()
            ->with([
                'patient.user',
                'prescriptionItem.medicine',
            ])
            ->where('status', 'Pendiente')
            ->whereNull('reminder_notified_at')
            ->whereBetween('scheduled_at', [
                $now->copy()->subMinutes($graceMinutes),
                $now,
            ])
            ->whereHas('prescription', function ($query) {
                $query->whereIn('status', ['Firmada', 'Dispensada']);
            })
            ->orderBy('id')
            ->chunkById(100, function ($schedules) use ($dispatcher, &$sent): void {
                foreach ($schedules as $schedule) {
                    $user = $schedule->patient?->user;
                    $medicineName = $schedule->prescriptionItem?->medicine?->name
                        ?? 'tu medicamento';

                    if (!$user || $user->status !== 'Activo') {
                        continue;
                    }

                    $dispatcher->send(
                        $user,
                        new SmartPharmacyNotification(
                            notificationType: 'medication_due',
                            title: 'Es hora de tu medicamento',
                            body: sprintf(
                                'Debes tomar %s a las %s.',
                                $medicineName,
                                $schedule->scheduled_at?->format('H:i') ?? 'hora programada',
                            ),
                            actionUrl: '/?section=schedules',
                            severity: 'warning',
                            metadata: [
                                'scheduleId' => $schedule->id,
                                'medicineName' => $medicineName,
                                'scheduledAt' => $schedule->scheduled_at?->toIso8601String(),
                            ],
                            pushTitle: 'Recordatorio de medicamento',
                            pushBody: 'Tienes una toma programada. Abre SmartPharmacy para consultar los detalles.',
                        ),
                    );

                    $schedule->forceFill([
                        'reminder_notified_at' => now(),
                    ])->save();

                    $sent++;
                }
            });

        $this->info("Recordatorios enviados: {$sent}");

        return self::SUCCESS;
    }
}
