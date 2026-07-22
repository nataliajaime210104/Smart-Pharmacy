export type MedicationScheduleStatus =
  | 'Pendiente'
  | 'Tomado'
  | 'Omitido';

export interface MedicationSchedule {
  id: number;
  medicineName: string | null;
  dosage: string | null;
  frequency: string | null;
  scheduledAt: string;
  status: MedicationScheduleStatus;
  takenAt: string | null;
}
