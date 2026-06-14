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