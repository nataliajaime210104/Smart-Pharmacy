import type { AiQuestion } from '../shared/types';

export const aiQuestionsMock: AiQuestion[] = [
  {
    id: 1,
    question: '¿Qué hago si olvidé tomar una dosis?',
    answer:
      'Si olvidaste una dosis, no dupliques la siguiente. Consulta las indicaciones de tu médico o farmacéutico.',
  },
  {
    id: 2,
    question: '¿Puedo tomar medicamento sin receta?',
    answer:
      'No es recomendable automedicarse. Consulta siempre a un profesional de la salud antes de iniciar un tratamiento.',
  },
  {
    id: 3,
    question: '¿Cómo identifico una pastilla?',
    answer:
      'Puedes revisar su forma, color, tamaño, ranuras y grabados. Si no hay certeza, no debes consumirla.',
  },
];