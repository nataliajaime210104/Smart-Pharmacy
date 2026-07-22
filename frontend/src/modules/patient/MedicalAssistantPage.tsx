import { useState, useEffect, useRef } from "react";
import { Bot, Send, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { User } from "../../shared/types";
import { askPatientAssistant } from "./services/patient-assistant.service";

interface Props {
  user: User;
}

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

function MedicalAssistantPage({ user }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hola 👋 soy tu asistente médico.\n\nPuedo ayudarte a consultar tus recetas, medicamentos, horarios e información de tu expediente.",
    },
  ]);

  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    if (!question.trim()) return;
    const cleanQuestion = question.trim();

    setMessages((prev) => [...prev, { role: "user", content: cleanQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await askPatientAssistant({
        question: cleanQuestion,
        userId: user.id,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "No pude consultar tu expediente en este momento. Por favor, inténtalo más tarde." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      backgroundColor: "#ffffff",
      borderRadius: "20px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      height: "680px",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: "850px",
      margin: "0 auto",
      border: "1px solid #e2e8f0",
      fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      
      {/* Encabezado Premium */}
      <div style={{
        background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
        color: "#ffffff",
        padding: "18px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ 
            backgroundColor: "rgba(255, 255, 255, 0.12)", 
            padding: "8px", 
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <Bot size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h1 style={{ fontSize: "16px", fontWeight: "700", margin: 0, letterSpacing: "-0.01em" }}>Asistente de Salud IA</h1>
              <span style={{ 
                backgroundColor: "rgba(52, 211, 153, 0.15)", 
                color: "#34d399", 
                fontSize: "10px", 
                fontWeight: "600", 
                padding: "2px 8px", 
                borderRadius: "9999px", 
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#34d399" }}></span>
                En línea
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "rgba(241, 245, 249, 0.8)", margin: "2px 0 0 0" }}>Consulta tu expediente y recetas médicas</p>
          </div>
        </div>
      </div>

      {/* Historial de Mensajes */}
      <div style={{ 
        flex: 1, 
        overflowY: "auto", 
        padding: "24px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "18px", 
        backgroundColor: "#f8fafc" 
      }}>
        
        <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
          <span style={{ 
            fontSize: "10px", 
            fontWeight: 600, 
            color: "#94a3b8", 
            backgroundColor: "#e2e8f0", 
            padding: "3px 10px", 
            borderRadius: "9999px", 
            textTransform: "uppercase", 
            letterSpacing: "0.05em" 
          }}>
            Consulta Activa
          </span>
        </div>

        {messages.map((msg, index) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "start",
                gap: "10px",
                width: "100%",
                justifyContent: isUser ? "flex-end" : "flex-start"
              }}
            >
              {!isUser && (
                <div style={{ 
                  height: "32px", 
                  width: "32px", 
                  borderRadius: "10px", 
                  background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "#ffffff", 
                  flexShrink: 0, 
                  marginTop: "2px" 
                }}>
                  <Bot size={16} />
                </div>
              )}

              {/* Burbuja de Mensaje */}
              <div
                className="prose-container"
                style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                  backgroundColor: isUser ? "#3b82f6" : "#ffffff",
                  color: isUser ? "#ffffff" : "#1e293b",
                  border: isUser ? "none" : "1px solid #e2e8f0",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                }}
              >
                <div style={{ 
                  fontSize: "13px", 
                  lineHeight: "1.5", 
                  wordBreak: "break-word"
                }}>
                  <ReactMarkdown 
                    components={{
                      p: ({ children }) => <p style={{ margin: "0 0 8px 0" }}>{children}</p>,
                      ul: ({ children }) => <ul style={{ paddingLeft: "16px", margin: "4px 0", listStyleType: "disc" }}>{children}</ul>,
                      ol: ({ children }) => <ol style={{ paddingLeft: "16px", margin: "4px 0", listStyleType: "decimal" }}>{children}</ol>,
                      li: ({ children }) => <li style={{ margin: "3px 0" }}>{children}</li>,
                      strong: ({ children }) => <strong style={{ fontWeight: "600", color: isUser ? "#ffffff" : "#0f172a" }}>{children}</strong>
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>

              {isUser && (
                <div style={{ 
                  height: "32px", 
                  width: "32px", 
                  borderRadius: "10px", 
                  backgroundColor: "#f1f5f9", 
                  border: "1px solid #e2e8f0", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center", 
                  color: "#64748b", 
                  flexShrink: 0, 
                  marginTop: "2px" 
                }}>
                  <UserRound size={15} />
                </div>
              )}
            </div>
          );
        })}

        {/* Indicador de Carga */}
        {loading && (
          <div style={{ display: "flex", alignItems: "start", gap: "10px" }}>
            <div style={{ 
              height: "32px", 
              width: "32px", 
              borderRadius: "10px", 
              background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              color: "#ffffff", 
              flexShrink: 0, 
              marginTop: "2px" 
            }}>
              <Bot size={16} />
            </div>
            <div style={{ 
              backgroundColor: "#ffffff", 
              border: "1px solid #e2e8f0", 
              borderRadius: "16px 16px 16px 2px", 
              padding: "12px 16px", 
              display: "flex", 
              gap: "4px", 
              alignItems: "center",
              boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
            }}>
              <span className="dot" style={{ width: "6px", height: "6px", backgroundColor: "#94a3b8", borderRadius: "50%", display: "inline-block" }}></span>
              <span className="dot" style={{ width: "6px", height: "6px", backgroundColor: "#94a3b8", borderRadius: "50%", display: "inline-block" }}></span>
              <span className="dot" style={{ width: "6px", height: "6px", backgroundColor: "#94a3b8", borderRadius: "50%", display: "inline-block" }}></span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {/* Caja de Entrada Flotante */}
      <div style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e2e8f0", padding: "16px" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "4px 6px"
          }}
        >
          <input
            style={{
              flex: 1,
              backgroundColor: "transparent",
              padding: "10px 12px",
              fontSize: "13px",
              color: "#334155",
              outline: "none",
              border: "none",
              fontFamily: "inherit"
            }}
            placeholder="Escribe un mensaje..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            style={{
              backgroundColor: loading || !question.trim() ? "#e2e8f0" : "#4f46e5",
              color: loading || !question.trim() ? "#94a3b8" : "#ffffff",
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              border: "none",
              cursor: loading || !question.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.2s ease"
            }}
          >
            <Send size={15} />
          </button>
        </form>
        <p style={{ fontSize: "10px", textAlign: "center", color: "#94a3b8", marginTop: "8px", marginBottom: 0 }}>
          La inteligencia artificial es una herramienta de apoyo, siempre consulta con tu médico.
        </p>
      </div>

    </div>
  );
}

export default MedicalAssistantPage;