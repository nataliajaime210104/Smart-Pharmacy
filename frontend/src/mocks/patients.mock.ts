import type { Patient } from '../shared/types';

export const patientsMock: Patient[] = [
  {
    id: 1,
    recordNumber: 'EXP-2026-001',
    name: 'María Fernanda López',
    age: 34,
    clinicalDiagnosis: 'Hipertensión arterial',
    latestConsultationDiagnosis: 'Hipertensión arterial',
    allergies: 'Penicilina',
    lastTreatment: 'Losartán 50 mg cada 24 horas',
  },
  {
    id: 2,
    recordNumber: 'EXP-2026-002',
    name: 'Carlos Alberto Ramírez',
    age: 42,
    clinicalDiagnosis: 'Hipertensión arterial',
    latestConsultationDiagnosis: 'Hipertensión arterial',
    allergies: 'Sin alergias registradas',
    lastTreatment: 'Metformina 850 mg cada 12 horas',
  },
  {
    id: 3,
    recordNumber: 'EXP-2026-003',
    name: 'Ana Sofía Hernández',
    age: 28,
    clinicalDiagnosis: 'Hipertensión arterial',
    latestConsultationDiagnosis: 'Hipertensión arterial',
    allergies: 'Ibuprofeno',
    lastTreatment: 'Paracetamol 500 mg cada 8 horas',
  },
];