import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Brain,
  MessageCircle,
  RotateCcw,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import type {
  AiAssistantMessage,
  Patient,
} from '../../shared/types';

import { getPatients } from '../doctor/services/patients.service';
import { askAiAssistant } from './services/ai-assistant.service';

const initialMessages: AiAssistantMessage[] = [
  {
    id: 1,
    role: 'assistant',
    content:
      'Hola, soy el asistente IA de SmartPharmacy.\n\nPuedo ayudarte a entender información general de recetas, medicamentos indicados, horarios y dudas frecuentes.\n\nNo puedo diagnosticar, recetar ni cambiar tratamientos.',
  },
];

function renderMessageContent(content: string) {
  const normalizedContent = content
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/\s+\*\s+/g, '\n- ')
    .replace(/^\*\s+/gm, '- ')
    .replace(/•/g, '-')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const lines = normalizedContent
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="ai-formatted-message">
      {lines.map((line, index) => {
        const isListItem = line.startsWith('- ');
        const isTitle =
          !isListItem &&
          line.endsWith(':') &&
          line.length <= 90;

        const isImportantWarning =
          line.toLowerCase().includes('no sustituye') ||
          line.toLowerCase().includes('profesional de la salud') ||
          line.toLowerCase().includes('urgencias') ||
          line.toLowerCase().includes('emergencia');

        if (isTitle) {
          return (
            <h4 key={`line-${index}`}>
              {line}
            </h4>
          );
        }

        if (isListItem) {
          return (
            <div className="ai-list-line" key={`line-${index}`}>
              <span>•</span>
              <p>{line.replace('- ', '')}</p>
            </div>
          );
        }

        return (
          <p
            key={`line-${index}`}
            className={isImportantWarning ? 'ai-warning-line' : undefined}
          >
            {line}
          </p>
        );
      })}
    </div>
  );
}

function AiAssistantPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<number | ''>('');
  const [messages, setMessages] = useState<AiAssistantMessage[]>(initialMessages);
  const [question, setQuestion] = useState('');

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [sending, setSending] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadPatients() {
      try {
        setLoadingPatients(true);
        setErrorMessage('');

        const data = await getPatients();

        setPatients(data);
      } catch {
        setErrorMessage('No fue posible cargar la lista de pacientes.');
      } finally {
        setLoadingPatients(false);
      }
    }

    loadPatients();
  }, []);

  const handleAsk = async () => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      setErrorMessage('Escribe una pregunta para el asistente.');
      return;
    }

    const userMessage: AiAssistantMessage = {
      id: Date.now(),
      role: 'user',
      content: cleanQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion('');
    setErrorMessage('');

    try {
      setSending(true);

      const response = await askAiAssistant({
        question: cleanQuestion,
        patientId:
          selectedPatientId === ''
            ? null
            : Number(selectedPatientId),
      });

      const assistantMessage: AiAssistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.answer,
      };

      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'No fue posible obtener respuesta del asistente IA.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleAsk();
  };

  const resetChat = () => {
    setMessages(initialMessages);
    setQuestion('');
    setErrorMessage('');
  };

  return (
    <div>
      <div className="page-title-row">
        <div className="page-icon">
          <Bot size={28} />
        </div>
        <div>
          <h1>Asistente IA</h1>
        </div>
      </div>

      <div className="ai-safety-card">
        <div>
          <ShieldCheck size={24} />
        </div>

        <p>
          Este asistente no diagnostica, no receta medicamentos, no cambia dosis
          y no sustituye la valoración de un profesional de la salud.
        </p>
      </div>

      {errorMessage && (
        <div className="form-alert error">{errorMessage}</div>
      )}

      <div className="ai-layout">
        <div className="ai-side-panel">
          <div className="section-heading">
            <UserRound size={22} />
            <h3>Contexto del paciente</h3>
          </div>

          <div className="form-group">
            <label>Paciente</label>

            <select
              value={selectedPatientId}
              disabled={loadingPatients}
              onChange={(event) =>
                setSelectedPatientId(
                  event.target.value === ''
                    ? ''
                    : Number(event.target.value)
                )
              }
            >
              <option value="">
                Sin paciente seleccionado
              </option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.recordNumber} - {patient.name}
                </option>
              ))}
            </select>
          </div>

          <div className="ai-info-box">
            <Brain size={20} />
            <p>
              Si seleccionas un paciente, el asistente usará su expediente,
              alergias, padecimientos y últimas recetas como contexto.
            </p>
          </div>

          <div className="ai-info-box warning">
            <AlertTriangle size={20} />
            <p>
              Para emergencias, síntomas graves o reacciones fuertes, el paciente
              debe acudir a urgencias o contactar servicios de emergencia.
            </p>
          </div>

          <button
            type="button"
            className="secondary-button button-gray"
            onClick={resetChat}
          >
            <RotateCcw size={18} />
            Reiniciar conversación
          </button>
        </div>

        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="section-heading">
              <MessageCircle size={22} />
              <h3>Conversación</h3>
            </div>
          </div>

          <div className="ai-messages">
            {messages.map((message) => (
              <div
                className={
                  message.role === 'user'
                    ? 'ai-message user'
                    : 'ai-message assistant'
                }
                key={message.id}
              >
                <div className="ai-message-avatar">
                  {message.role === 'user' ? (
                    <UserRound size={18} />
                  ) : (
                    <Bot size={18} />
                  )}
                </div>

                <div className="ai-message-content">
                  {renderMessageContent(message.content)}
                </div>
              </div>
            ))}

            {sending && (
              <div className="ai-message assistant">
                <div className="ai-message-avatar">
                  <Bot size={18} />
                </div>

                <div className="ai-message-content">
                  <div className="ai-formatted-message">
                    <p>Consultando Gemini...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="ai-input-area">
            <textarea
              placeholder="Ejemplo: ¿Cómo debo interpretar la indicación cada 8 horas?"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
            />

            <button
              type="submit"
              className="button-purple"
              disabled={sending}
            >
              <Send size={18} />
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AiAssistantPage;