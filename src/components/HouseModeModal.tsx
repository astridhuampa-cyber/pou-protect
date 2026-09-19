import React from 'react';
import { motion } from 'motion/react';
import {
  Home,
  Moon,
  Footprints,
  Plane,
  ShieldCheck,
  Lock,
  Eye,
  Bell,
  X,
  Check,
} from 'lucide-react';
import { HouseMode } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface HouseModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: HouseMode;
  onSelectMode: (mode: HouseMode) => void;
  accessibilitySpeechEnabled?: boolean;
}

export const HouseModeModal: React.FC<HouseModeModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
  accessibilitySpeechEnabled = true,
}) => {
  const modes: {
    id: HouseMode;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    border: string;
    sensorsActive: string[];
  }[] = [
    {
      id: 'home',
      title: 'En Casa',
      description: 'Protección perimetral activa. Sensores interiores desarmados para moverte libremente.',
      icon: Home,
      color: 'from-blue-600 to-cyan-600',
      border: 'border-blue-500/50',
      sensorsActive: ['Puertas y ventanas exteriores', 'Cámara de patio', 'Sirena disuasoria'],
    },
    {
      id: 'sleeping',
      title: 'Dormido',
      description: 'Vigilancia nocturna reforzada. Modo silencioso para alertas no críticas.',
      icon: Moon,
      color: 'from-indigo-600 to-violet-600',
      border: 'border-indigo-500/50',
      sensorsActive: [
        'Perímetro completo armado',
        'Visión nocturna en cámaras',
        'Detector de humo/CO activo',
        'Modo no molestar para llamadas',
      ],
    },
    {
      id: 'away',
      title: 'Fuera de Casa',
      description: 'Armado total. Todas las cámaras y sensores de movimiento interiores y exteriores vigilando.',
      icon: Footprints,
      color: 'from-emerald-600 to-teal-600',
      border: 'border-emerald-500/50',
      sensorsActive: [
        'Todas las cámaras con grabación',
        'Sensores de movimiento interiores',
        'Cerraduras POU Lock bloqueadas',
        'Alerta instantánea a tu móvil',
      ],
    },
    {
      id: 'vacation',
      title: 'Vacaciones',
      description: 'Máxima seguridad por ausencia prolongada. Supervisión 24/7 y respaldo del POU Circle.',
      icon: Plane,
      color: 'from-amber-600 to-orange-600',
      border: 'border-amber-500/50',
      sensorsActive: [
        'Armado 100% permanente',
        'Monitoreo de fugas de agua y corte eléctrico',
        'Notificación compartida al círculo familiar',
        'Respaldo de eventos fuera de línea',
      ],
    },
  ];

  const handleSelect = (modeId: HouseMode, title: string) => {
    playSound('success');
    triggerHaptic('medium');
    onSelectMode(modeId);
    if (accessibilitySpeechEnabled) {
      speakText(`Modo de seguridad cambiado a ${title}.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col h-[88vh] max-h-[720px] overflow-hidden text-slate-100 relative"
        role="dialog"
        aria-label="Configuración de Modo del Hogar"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/40 text-cyan-300">
              <Home className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">MODO CASA</h2>
              <p className="text-xs text-slate-400">Personaliza la Protección de tu Hogar</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Cerrar modo casa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modes Selection Grid */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          {modes.map((m) => {
            const Icon = m.icon;
            const isSelected = currentMode === m.id;

            return (
              <motion.div
                key={m.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(m.id, m.title)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected
                    ? `bg-slate-900/95 ${m.border} shadow-[0_0_20px_rgba(6,182,212,0.25)]`
                    : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl bg-gradient-to-tr ${m.color} text-white shadow-md`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {m.title}
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full text-[10px] font-mono">
                            ACTIVO AHORA
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{m.description}</p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500 text-black'
                        : 'border-slate-600 bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                {/* Sub-features list */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {m.sensorsActive.map((sensor, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] text-slate-300"
                    >
                      ✓ {sensor}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-cyan-500/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
          >
            Listo
          </button>
        </div>
      </motion.div>
    </div>
  );
};
