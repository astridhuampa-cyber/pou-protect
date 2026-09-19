import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  X,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Check,
} from 'lucide-react';
import { PouMascot } from './PouMascot';
import { speakText, stopSpeaking, playSound, triggerHaptic } from '../utils/accessibility';

interface PouAIModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: string;
  houseMode: string;
  onExecuteAction: (actionType: string, payload?: any) => void;
  accessibilitySpeechEnabled?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'pou';
  text: string;
  timestamp: string;
  actionProposal?: {
    type: 'alarm' | 'location' | 'camera' | 'call' | 'lock';
    title: string;
    description: string;
    confirmed: boolean;
  };
}

export const PouAIModal: React.FC<PouAIModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
  houseMode,
  onExecuteAction,
  accessibilitySpeechEnabled = true,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'pou',
      text: '¡Hola! Soy el Agente POU IA. Tu seguridad es mi misión. ¿Qué deseas hacer hoy? Puedes hablarme o escribir.',
      timestamp: 'Ahora',
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickPrompts = [
    '¿Cuál es el estado de mi hogar?',
    'Activa la alarma',
    'Comparte mi ubicación',
    'Muéstrame la cámara del patio',
    'Llama a mi contacto de emergencia',
    '¿Qué zonas seguras hay cerca?',
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Setup Web Speech Recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
          setIsListening(true);
          playSound('chirp');
          triggerHaptic('light');
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleSendMessage(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('El reconocimiento por voz no está disponible en este navegador. Puedes escribir tu consulta.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (e) {
        recognitionRef.current.stop();
      }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isLoading) return;

    setInputQuery('');
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    playSound('click');
    triggerHaptic('light');

    try {
      // Call backend API
      const res = await fetch('/api/pou-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, systemStatus, houseMode }),
      });

      let replyText = '';
      if (res.ok) {
        const data = await res.json();
        replyText = data.text;
      } else {
        replyText = 'He procesado tu comando de seguridad en modo de respaldo local.';
      }

      // Check if command requires confirmation
      const lower = query.toLowerCase();
      let proposal: Message['actionProposal'] = undefined;

      if (lower.includes('alarma') || lower.includes('activar alarma') || lower.includes('sonar')) {
        proposal = {
          type: 'alarm',
          title: 'Activar Alarma de Emergencia',
          description: 'Hará sonar la sirena principal y notificará a tu círculo de seguridad.',
          confirmed: false,
        };
      } else if (lower.includes('ubicación') || lower.includes('ubicacion') || lower.includes('compartir')) {
        proposal = {
          type: 'location',
          title: 'Compartir Ubicación en Tiempo Real',
          description: 'Se enviará tu enlace de GPS a tus contactos autorizados de POU Circle.',
          confirmed: false,
        };
      } else if (lower.includes('cámara') || lower.includes('camara') || lower.includes('patio')) {
        proposal = {
          type: 'camera',
          title: 'Abrir Visor de Cámaras',
          description: 'Transmitir señal en vivo de la cámara del patio.',
          confirmed: false,
        };
      } else if (lower.includes('llamar') || lower.includes('contacto') || lower.includes('emergencia')) {
        proposal = {
          type: 'call',
          title: 'Llamada a Contacto Prioritario',
          description: 'Marcar inmediatamente a tu contacto de emergencia principal.',
          confirmed: false,
        };
      }

      const pouMsg: Message = {
        id: `p-${Date.now()}`,
        sender: 'pou',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionProposal: proposal,
      };

      setMessages((prev) => [...prev, pouMsg]);

      // Voice response
      if (!isMuted && accessibilitySpeechEnabled) {
        setIsSpeaking(true);
        speakText(replyText, () => setIsSpeaking(false));
      }
    } catch (e) {
      const fallbackMsg: Message = {
        id: `p-${Date.now()}`,
        sender: 'pou',
        text: 'He registrado tu instrucción. Por seguridad, verifica el estado de las cerraduras y sensores en pantalla.',
        timestamp: 'Ahora',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (!isMuted && accessibilitySpeechEnabled) {
        speakText(fallbackMsg.text);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAction = (msgId: string, actionType: string) => {
    playSound('success');
    triggerHaptic('medium');
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId && m.actionProposal
          ? { ...m, actionProposal: { ...m.actionProposal, confirmed: true } }
          : m
      )
    );
    onExecuteAction(actionType);
    const confirmationAck = `Acción de ${actionType} confirmada y ejecutada por Agente POU.`;
    if (!isMuted && accessibilitySpeechEnabled) {
      speakText(confirmationAck);
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
    triggerHaptic('light');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg h-[88vh] max-h-[720px] bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/40 rounded-3xl shadow-[0_0_35px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-slate-100 relative"
          role="dialog"
          aria-label="Asistente de seguridad POU IA"
        >
          {/* Header */}
          <div className="p-4 border-b border-cyan-500/20 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PouMascot
                size="sm"
                state={isSpeaking ? 'speaking' : isListening ? 'listening' : 'idle'}
                interactive={false}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white tracking-wide">POU IA</h2>
                  <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-[10px] font-mono text-cyan-300">
                    AGENTE DE VOZ
                  </span>
                </div>
                <p className="text-xs text-slate-400">Protección Inteligente 24/7</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                title={isMuted ? 'Activar voz' : 'Silenciar voz'}
                aria-label={isMuted ? 'Activar voz' : 'Silenciar voz'}
              >
                {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-cyan-300" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  onClose();
                }}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                aria-label="Cerrar asistente POU IA"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-cyan-500/20">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
                >
                  <div
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed max-w-[85%] ${
                      isUser
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-tr-none shadow-md'
                        : 'bg-slate-800/90 border border-cyan-500/30 text-slate-100 rounded-tl-none shadow-[0_2px_12px_rgba(0,0,0,0.3)]'
                    }`}
                  >
                    {!isUser && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-mono text-cyan-300">
                        <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                        Agente Pou
                      </div>
                    )}
                    <p>{m.text}</p>

                    {/* Action proposal requiring explicit confirmation */}
                    {m.actionProposal && (
                      <div className="mt-3 p-3 bg-slate-900/95 border border-amber-500/40 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>Requiere tu confirmación</span>
                        </div>
                        <p className="text-xs text-slate-300">{m.actionProposal.description}</p>
                        {m.actionProposal.confirmed ? (
                          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium pt-1">
                            <Check className="w-4 h-4" />
                            Acción confirmada y ejecutada
                          </div>
                        ) : (
                          <div className="pt-1 flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleConfirmAction(m.id, m.actionProposal!.type)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Confirmar {m.actionProposal.title}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono p-3 bg-slate-800/60 rounded-2xl w-fit border border-cyan-500/20">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Agente POU analizando perímetro...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-4 py-2 border-t border-cyan-500/10 bg-slate-950/60 overflow-x-auto scrollbar-none flex gap-2">
            {quickPrompts.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-cyan-950/70 border border-cyan-500/30 text-[11px] text-cyan-200 transition-colors shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Voice & Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-cyan-500/20">
            {isListening && (
              <div className="mb-2 p-2 bg-cyan-950/70 border border-cyan-500/50 rounded-xl flex items-center justify-between text-xs text-cyan-200 animate-pulse">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span>Escuchando tu voz... Habla ahora.</span>
                </div>
                <button
                  type="button"
                  onClick={toggleListening}
                  className="text-red-400 hover:text-red-300 font-semibold text-[11px]"
                >
                  Detener
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-2xl transition-all shadow-md flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                }`}
                title={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
                aria-label={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Pregunta a POU o escribe una orden..."
                className="flex-1 bg-slate-950/80 border border-cyan-500/30 rounded-2xl px-4 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || isLoading}
                className="p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl transition-all shrink-0"
                aria-label="Enviar mensaje a POU IA"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
