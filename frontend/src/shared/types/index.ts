export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Medico' | 'Paciente' | 'Administrador Farmacia' | 'Administrador Sistema';
  status: 'Activo' | 'Inactivo';
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
  data: T;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: User;
}