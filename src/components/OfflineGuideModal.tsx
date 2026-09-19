import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  WifiOff,
  Volume2,
  Phone,
  BookOpen,
  Database,
  ShieldCheck,
  X,
  AlertCircle,
  Flame,
  HeartPulse,
  Lock,
} from 'lucide-react';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';
import { EmergencyContact } from '../types';

interface OfflineGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  accessibilitySpeechEnabled?: boolean;
}

export const OfflineGuideModal: React.FC<OfflineGuideModalProps> = ({
  isOpen,
  onClose,
  contacts,
  accessibilitySpeechEnabled = true,
}) => {
  const [selectedTip, setSelectedTip] = useState<'medical' | 'fire' | 'intrusion'>('medical');
  const [isSirenActive, setIsSirenActive] = useState(false);

  const toggleOfflineSiren = () => {
    if (!isSirenActive) {
      setIsSirenActive(true);
      playSound('sos');
      triggerHaptic('sos');
      if (accessibilitySpeechEnabled) {
        speakText('Sirena disuasoria local activada a todo volumen sin necesidad de internet.');
      }
    } else {
      setIsSirenActive(false);
      playSound('click');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col h-[90vh] max-h-[740px] overflow-hidden text-slate-100 relative"
        role="dialog"
        aria-label="Funciones en modo sin conexión a internet"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-600/30 border border-amber-400/40 text-amber-300">
              <WifiOff className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">MODO SIN CONEXIÓN</h2>
              <p className="text-xs text-slate-400">Protección Activa Incluso Sin Red ni Wi-Fi</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Cerrar modo sin conexión"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="p-3 bg-amber-950/40 border-b border-amber-500/30 text-xs text-amber-200 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            POU PROTECT guarda en tu móvil tus recursos vitales para que nunca quedes desprotegido.
          </span>
        </div>

        {/* Offline Features List */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          {/* 1. Sirena Local */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                  <Volume2 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-xs font-bold text-white">1. Sirena Disuasoria Local</h3>
                  <p className="text-[11px] text-slate-400">Emite sonido de alta potencia desde los altavoces.</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleOfflineSiren}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                isSirenActive
                  ? 'bg-red-600 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-red-300 border border-red-500/30'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              {isSirenActive ? 'DETENER SIRENA OFFLINE' : 'PROBAR SIRENA OFFLINE'}
            </button>
          </div>

          {/* 2. Contactos de emergencia guardados en memoria */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                <Phone className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">2. Directorio Telefónico Directo</h3>
                <p className="text-[11px] text-slate-400">
                  Guarda en caché los teléfonos para marcar vía red móvil convencional.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="tel:112"
                className="p-2.5 bg-slate-950 border border-slate-800 hover:border-red-500/40 rounded-xl text-center block"
              >
                <div className="text-xs font-bold text-red-400">112 / 911</div>
                <div className="text-[10px] text-slate-400">Emergencias Oficial</div>
              </a>

              {contacts[0] && (
                <a
                  href={`tel:${contacts[0].phone}`}
                  className="p-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl text-center block"
                >
                  <div className="text-xs font-bold text-cyan-300 truncate">{contacts[0].name}</div>
                  <div className="text-[10px] text-slate-400">{contacts[0].phone}</div>
                </a>
              )}
            </div>
          </div>

          {/* 3. Consejos básicos de seguridad offline */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                <BookOpen className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">3. Protocolos de Seguridad Offline</h3>
                <p className="text-[11px] text-slate-400">Guías rápidas para emergencias sin cobertura.</p>
              </div>
            </div>

            {/* Subtabs */}
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { id: 'medical', label: 'Médica / RCP', icon: HeartPulse },
                { id: 'fire', label: 'Incendio', icon: Flame },
                { id: 'intrusion', label: 'Intrusión', icon: Lock },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTip(t.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                    selectedTip === t.id ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tip Content */}
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs space-y-1 text-slate-300">
              {selectedTip === 'medical' && (
                <>
                  <p className="font-bold text-white">Emergencia médica repentina:</p>
                  <p>1. Mantén la calma y comprueba si la persona responde y respira.</p>
                  <p>2. Si no respira, inicia compresiones en el centro del pecho (100-120 por min).</p>
                  <p>3. Pide a alguien cercano que llame al 112 o busque un desfibrilador (DEA).</p>
                </>
              )}
              {selectedTip === 'fire' && (
                <>
                  <p className="font-bold text-white">En caso de incendio o humo:</p>
                  <p>1. Muévete gateando o agachado, el aire respirable queda pegado al suelo.</p>
                  <p>2. No uses ascensores bajo ninguna circunstancia.</p>
                  <p>3. Toca las puertas con el dorso de la mano antes de abrirlas para comprobar calor.</p>
                </>
              )}
              {selectedTip === 'intrusion' && (
                <>
                  <p className="font-bold text-white">Sospecha de intrusión o peligro en calle:</p>
                  <p>1. Refúgiate en una habitación segura con cerradura o lugar público iluminado.</p>
                  <p>2. Activa la sirena local para disuadir e indicar tu ubicación a vecinos.</p>
                  <p>3. Comunica la dirección exacta al 112 con voz baja pero clara.</p>
                </>
              )}
            </div>
          </div>

          {/* 4. Almacenamiento local de eventos */}
          <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <Database className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-white">4. Registro Local Seguro</h3>
                <p className="text-[11px] text-slate-400">
                  Los eventos se almacenan en el móvil y se sincronizan al recuperar conexión.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              ACTIVO
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
