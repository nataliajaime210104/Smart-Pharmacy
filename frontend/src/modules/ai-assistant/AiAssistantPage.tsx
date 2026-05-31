import { useState } from 'react';
import {
  Bot,
  MessageCircleQuestion,
  Pill,
  Send,
  ScanSearch,
  ShieldAlert,
} from 'lucide-react';
import { aiQuestionsMock } from '../../mocks/ai.mock';

function AiAssistantPage() {
  const [question, setQuestion] = useState('');
  const [pillDescription, setPillDescription] = useState('');

  return (
    <div>
      <div className="page-title-row">
        <div className="page-icon">
          <Bot size={28} />
        </div>

        <div>
          <h1>Asistente Virtual con IA</h1>
          <p className="page-description">
            HU-14 y HU-15: Chatbot de apoyo al paciente e identificación de medicamentos por descripción.
          </p>
        </div>
      </div>

      <div className="two-columns">
        <div className="panel-card">
          <div className="section-heading">
            <MessageCircleQuestion size={24} />
            <h3>Preguntas frecuentes</h3>
          </div>

          {aiQuestionsMock.map((item) => (
            <div className="chat-item" key={item.id}>
              <div className="chat-question">
                <MessageCircleQuestion size={18} />
                <strong>{item.question}</strong>
              </div>
              <p>{item.answer}</p>
            </div>
          ))}

          <div className="form-group">
            <label>Escribe una duda médica</label>
            <textarea
              placeholder="Ejemplo: ¿Qué hago si olvidé una dosis?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <button>
            <Send size={18} />
            Enviar pregunta
          </button>
        </div>

        <div className="panel-card">
          <div className="section-heading">
            <Pill size={24} />
            <h3>Identificación de medicamento</h3>
          </div>

          <div className="form-group">
            <label>Describe la pastilla</label>
            <textarea
              placeholder="Ejemplo: Tableta blanca ovalada con línea central"
              value={pillDescription}
              onChange={(e) => setPillDescription(e.target.value)}
            />
          </div>

          <button>
            <ScanSearch size={18} />
            Analizar descripción
          </button>

          <div className="warning-box">
            <ShieldAlert size={20} />
            <span>
              Este módulo es un maquetado. La identificación real deberá advertir cuando no exista certeza suficiente.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAssistantPage;