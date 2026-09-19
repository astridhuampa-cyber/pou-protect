import React from 'react';
import { motion } from 'motion/react';
import {
  HeartPulse,
  PhoneCall,
  User,
  AlertCircle,
  FileText,
  X,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface QuickMedicalModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onCallEmergency: () => void;
  accessibilitySpeechEnabled?: boolean;
}

export const QuickMedicalModal: React.FC<QuickMedicalModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onCallEmergency,
  accessibilitySpeechEnabled = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-red-500/40 rounded-3xl shadow-[0_0_40px_rgba(239,68,68,0.25)] flex flex-col h-[85vh] max-h-[700px] overflow-hidden text-slate-100 relative"
        role="dialog"
        aria-label="Ficha médica de emergencia"
      >
        {/* Header */}
        <div className="p-4 bg-red-950/70 border-b border-red-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-red-600/30 border border-red-400/40 text-red-300">
              <HeartPulse className="w-5 h-5 text-red-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">EMERGENCIA MÉDICA</h2>
              <p className="text-xs text-red-300">Ficha Rápida para Sanitarios & 112</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Cerrar ficha médica"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/20">
          {/* Urgent Call 112 Button */}
          <button
            type="button"
            onClick={onCallEmergency}
            className="w-full p-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.4)] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-black/30 rounded-xl">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-base">Llamar Ambulancia (112 / 061)</div>
                <div className="text-xs text-red-100 font-normal">Emergencias Médicas Inmediatas</div>
              </div>
            </div>
            <span className="text-xs px-3 py-1 bg-white/20 rounded-full font-mono">Llamar</span>
          </button>

          {/* Patient Card */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-pink-600 flex items-center justify-center font-bold text-lg text-white">
                {userProfile.name[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{userProfile.name}</h3>
                <p className="text-xs text-slate-400">Titular de la cuenta POU</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Grupo Sanguíneo</span>
                <span className="text-red-400 font-mono font-bold text-sm">{userProfile.bloodType}</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase">Alergias Conocidas</span>
                <span className="text-amber-300 font-semibold">{userProfile.allergies}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block text-[10px] uppercase">Notas Médicas / Padecimientos</span>
              <p className="text-slate-200">{userProfile.medicalNotes}</p>
            </div>
          </div>

          {/* Quick First-Aid Guide */}
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              Guía de Primeros Auxilios Inmediatos
            </h4>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li>Colocar en Posición Lateral de Seguridad si está inconsciente pero respira.</li>
              <li>En caso de desmayo, elevar las piernas a 30 cm para facilitar riego cerebral.</li>
              <li>En caso de asfixia o atragantamiento, aplicar Maniobra de Heimlich.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
