export type MedicationHistoryStatus =
  | 'Pendiente'
  | 'Tomado'
  | 'Omitido';

export interface MedicationHistoryPatient {
  id: number;
  userId: number | null;
  recordNumber: string;
  name: string;
  email: string | null;
}

export interface MedicationHistorySummary {
  totalScheduled: number;
  evaluatedDoses: number;
  takenDoses: number;
  missedDoses: number;
  pendingDoses: number;
  adherencePercentage: number;
}

export interface MedicationHistoryDailyItem {
  date: string;
  label: string;
  scheduled: number;
  evaluated: number;
  taken: number;
  missed: number;
  pending: number;
  adherencePercentage: number;
}

export interface MedicationHistoryMedicineItem {
  medicineId: number | null;
  medicineCode: string | null;
  medicineName: string;
  scheduled: number;
  evaluated: number;
  taken: number;
  missed: number;
  pending: number;
  adherencePercentage: number;
}

export interface MedicationHistoryDose {
  id: number;
  prescriptionId: number;
  prescriptionFolio: string | null;
  prescriptionItemId: number;
  medicineId: number | null;
  medicineCode: string | null;
  medicineName: string;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
  scheduledAt: string;
  takenAt: string | null;
  registeredStatus: MedicationHistoryStatus;
  status: MedicationHistoryStatus;
  isEvaluated: boolean;
}

export interface MedicationHistoryData {
  patient: MedicationHistoryPatient;
  period: {
    startDate: string;
    endDate: string;
  };
  summary: MedicationHistorySummary;
  daily: MedicationHistoryDailyItem[];
  byMedicine: MedicationHistoryMedicineItem[];
  doses: MedicationHistoryDose[];
}

export interface MedicationHistoryFilters {
  doctorId: number;
  patientId: number;
  startDate: string;
  endDate: string;
}
