export type UserRole =
  | 'Medico'
  | 'Paciente'
  | 'Administrador Farmacia'
  | 'Administrador Sistema';

export type UserStatus = 'Activo' | 'Inactivo';
export type MedicineStatus = 'Activo' | 'Inactivo';
export type InventoryStatus = 'Activo' | 'Inactivo';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}

export interface Patient {
  id: number;
  recordNumber: string;
  name: string;
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

export interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

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