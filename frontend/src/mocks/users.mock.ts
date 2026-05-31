import type { User } from '../shared/types';

export const usersMock: User[] = [
  {
    id: 1,
    name: 'Dra. Natalia Jaime',
    email: 'natalia@hospital.com',
    role: 'Medico',
    status: 'Activo',
  },
  {
    id: 2,
    name: 'Sebastian Torres',
    email: 'sebastian@hospital.com',
    role: 'Administrador Sistema',
    status: 'Activo',
  },
  {
    id: 3,
    name: 'Alexa Martínez',
    email: 'alexa@hospital.com',
    role: 'Paciente',
    status: 'Activo',
  },
  {
    id: 4,
    name: 'Victor Gómez',
    email: 'victor@hospital.com',
    role: 'Administrador Farmacia',
    status: 'Activo',
  },
];