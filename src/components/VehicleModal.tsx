import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Car,
  ShieldCheck,
  Lock,
  Unlock,
  Volume2,
  MapPin,
  Battery,
  X,
  AlertTriangle,
  Radio,
} from 'lucide-react';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessibilitySpeechEnabled?: boolean;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  accessibilitySpeechEnabled = true,
}) => {
  const [isAlarmArmed, setIsAlarmArmed] = useState(true);
  const [isDoorsLocked, setIsDoorsLocked] = useState(true);

  const toggleAlarm = () => {
    const next = !isAlarmArmed;
    setIsAlarmArmed(next);
    playSound(next ? 'lock' : 'unlock');
    triggerHaptic('medium');
    if (accessibilitySpeechEnabled) {
      speakText(next ? 'Alarma perimétrica de vehículo activada' : 'Alarma de vehículo desarmada');
    }
  };

  const toggleDoors = () => {
    const next = !isDoorsLocked;
    setIsDoorsLocked(next);
    playSound(next ? 'lock' : 'unlock');
    triggerHaptic('medium');
    if (accessibilitySpeechEnabled) {
      speakText(next ? 'Puertas de vehículo aseguradas' : 'Puertas de vehículo abiertas');
    }
  };

  const handleHornLocate = () => {
    playSound('chirp');
    triggerHaptic('light');
    alert('Luces destellando y bocina emitida para localizar tu coche.');
    if (accessibilitySpeechEnabled) {
      speakText('Destello de luces activado en el vehículo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col h-[85vh] max-h-[700px] overflow-hidden text-slate-100 relative"
        role="dialog"
        aria-label="Seguridad vehicular POU"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/40 text-cyan-300">
              <Car className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">SEGURIDAD VEHICULAR</h2>
              <p className="text-xs text-slate-400">Protección Antirrobo & GPS de tu Coche</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Cerrar seguridad vehicular"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          {/* Vehicle Status Box */}
          <div className="p-4 bg-slate-900 border border-cyan-500/30 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Vehículo Personal</h3>
                <p className="text-xs text-slate-400">Matrícula: 4820-LKR • SUV</p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  isAlarmArmed
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {isAlarmArmed ? 'ALARMA ARMADA' : 'DESPROTEGIDO'}
              </span>
            </div>

            {/* GPS Location of vehicle */}
            <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="text-slate-200 font-semibold">Aparcamiento Centro (Plaza 42)</div>
                  <div className="text-[10px] text-slate-400">Último movimiento: Hace 1h 24m</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">A 350 metros</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Batería 12V:</span>
                <span className="font-mono text-emerald-400 font-bold">12.6 V (100%)</span>
              </div>
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-400">Sensor choque:</span>
                <span className="font-semibold text-emerald-400">Activo</span>
              </div>
            </div>
          </div>

          {/* Quick Remote Vehicle Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Controles Remotos Seguros
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={toggleDoors}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isDoorsLocked
                    ? 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                }`}
              >
                {isDoorsLocked ? <Lock className="w-5 h-5 text-cyan-400 mb-2" /> : <Unlock className="w-5 h-5 text-emerald-400 mb-2" />}
                <span className="text-xs font-bold">{isDoorsLocked ? 'Cerraduras Cerradas' : 'Cerraduras Abiertas'}</span>
                <span className="text-[10px] text-slate-400">Tocar para alternar</span>
              </button>

              <button
                type="button"
                onClick={toggleAlarm}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  isAlarmArmed
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                }`}
              >
                <ShieldCheck className="w-5 h-5 mb-2" />
                <span className="text-xs font-bold">{isAlarmArmed ? 'Alarma Perimétrica' : 'Alarma Desactivada'}</span>
                <span className="text-[10px] text-slate-400">Sensor de choque</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleHornLocate}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              Destellar Luces y Pitar para Encontrar Coche
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
