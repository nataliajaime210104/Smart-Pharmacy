<?php

namespace App\Services;

use App\Models\MedicationSchedule;
use App\Models\Prescription;
use App\Models\PrescriptionItem;
use Carbon\Carbon;

class MedicationScheduleGenerator
{
    public function generate(Prescription $prescription, PrescriptionItem $item): void
    {
        if (
            empty($item->frequency) ||
            empty($item->duration) ||
            empty($item->start_time)
        ) {
            return;
        }

        preg_match('/(\d+)/', $item->frequency, $frequencyMatch);
        preg_match('/(\d+)/', $item->duration, $durationMatch);

        $hours = (int) ($frequencyMatch[1] ?? 0);
        $days = (int) ($durationMatch[1] ?? 0);

        if ($hours <= 0 || $days <= 0) {
            return;
        }

        $current = Carbon::parse($prescription->created_at)
        ->setTimeFromTimeString($item->start_time);

        $end = (clone $current)->addDays($days);

        while ($current < $end) {

            MedicationSchedule::create([
                'patient_id' => $prescription->patient_id,
                'prescription_id' => $prescription->id,
                'prescription_item_id' => $item->id,
                'scheduled_at' => $current,
                'status' => 'Pendiente',
            ]);

            $current->addHours($hours);
        }
    }
}