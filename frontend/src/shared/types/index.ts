export type UserRole =
  | 'Medico'
  | 'Paciente'
  | 'Administrador Farmacia'
  | 'Administrador Sistema';

export type UserStatus = 'Activo' | 'Inactivo';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  patientAge?: number | null;
}

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  patientAge?: number | '';
}

export interface Patient {
  id: number;
  userId?: number | null;
  recordNumber: string;
  name: string;
  email?: string | null;
  age: number | null;
  diagnosis: string;
  allergies: string;
  lastTreatment: string;
}

export interface AiQuestion {
  id: number;
  question: string;
  answer: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}

export type MedicineStatus = 'Activo' | 'Inactivo';
export type InventoryStatus = 'Activo' | 'Inactivo';

export interface Medicine {
  id: number;
  code: string;
  name: string;
  presentation: string | null;
  concentration: string | null;
  unit: string | null;
  description: string | null;
  status: MedicineStatus;
  totalStock: number;
  totalMinStock: number;
}

export interface MedicineFormData {
  code: string;
  name: string;
  presentation: string;
  concentration: string;
  unit: string;
  description: string;
  status: MedicineStatus;
}

export interface InventoryItem {
  id: number;
  medicineId: number;
  medicineName: string;
  medicineCode: string;
  lotNumber: string | null;
  stock: number;
  minStock: number;
  location: string | null;
  expirationDate: string | null;
  status: InventoryStatus;
  isLowStock: boolean;
}

export interface InventoryFormData {
  medicineId: number;
  lotNumber: string;
  stock: number;
  minStock: number;
  location: string;
  expirationDate: string;
  status: InventoryStatus;
}

export type PrescriptionStatus =
  | 'Borrador'
  | 'Firmada'
  | 'Cancelada'
  | 'Dispensada';

export interface PrescriptionItem {
  id: number;
  medicineId: number;
  medicineCode: string;
  medicineName: string;
  quantity: number;
  dosage: string | null;
  frequency: string | null;
  duration: string | null;
  instructions: string | null;
}

export interface Prescription {
  id: number;
  folio: string;
  patientId: number;
  patientName: string;
  doctorId: number;
  doctorName: string;
  diagnosis: string | null;
  notes: string | null;
  status: PrescriptionStatus;
  signedAt: string | null;
  signedByName: string | null;
  signatureHash: string | null;
  verificationCode: string | null;
  signatureImagePath: string | null;
  pdfUrl: string | null;
  createdAt: string | null;
  items: PrescriptionItem[];
}

export interface PrescriptionItemFormData {
  medicineId: number;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionFormData {
  patientId: number;
  doctorId: number;
  diagnosis: string;
  notes: string;
  items: PrescriptionItemFormData[];
}

export interface StockCheckItem {
  medicineId: number;
  medicineName: string;
  requestedQuantity: number;
  availableStock: number;
  isAvailable: boolean;
}

export interface StockCheckResponse {
  success: boolean;
  canCreate: boolean;
  message?: string;
  data: StockCheckItem[];
}