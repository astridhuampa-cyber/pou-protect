import React from 'react';
import { motion } from 'motion/react';
import {
  Battery,
  BatteryCharging,
  BatteryWarning,
  Wifi,
  Radio,
  Cpu,
  X,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { DeviceEnergy } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface DevicesEnergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DeviceEnergy[];
  accessibilitySpeechEnabled?: boolean;
}

export const DevicesEnergyModal: React.FC<DevicesEnergyModalProps> = ({
  isOpen,
  onClose,
  devices,
  accessibilitySpeechEnabled = true,
}) => {
  const lowBatteryDevices = devices.filter((d) => d.batteryPercent < 25);

  const handleRefresh = () => {
    playSound('chirp');
    triggerHaptic('light');
    if (accessibilitySpeechEnabled) {
      speakText('Estado de baterías y conexión de dispositivos actualizado.');
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
        aria-label="Estado de energía y dispositivos conectados"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-600/30 border border-cyan-400/40 text-cyan-300">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">POU ENERGY & DISPOSITIVOS</h2>
              <p className="text-xs text-slate-400">Baterías & Monitoreo de Hardware</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 transition-colors"
              title="Actualizar telemetría"
              aria-label="Actualizar telemetría de dispositivos"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Cerrar dispositivos"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Low Battery Warning Banner if any */}
        {lowBatteryDevices.length > 0 && (
          <div className="p-3 bg-amber-950/60 border-b border-amber-500/40 flex items-center gap-2.5 text-amber-200 text-xs">
            <BatteryWarning className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Atención:</strong> {lowBatteryDevices.length} dispositivo(s) con batería baja (&lt;25%).
              Revisa para mantener la protección continua.
            </span>
          </div>
        )}

        {/* Devices list */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          {devices.map((device) => {
            const isLow = device.batteryPercent < 25;
            const isMedium = device.batteryPercent >= 25 && device.batteryPercent < 60;

            return (
              <div
                key={device.id}
                className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                  isLow
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
                      <Cpu className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        {device.name}
                        {isLow && (
                          <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[9px] font-bold">
                            BATERÍA BAJA
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{device.category}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-mono">
                          <Wifi className="w-3 h-3 text-cyan-400" />
                          {device.connectionType}
                        </span>
                        <span>•</span>
                        <span>{device.lastSeen}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-mono font-bold flex items-center justify-end gap-1 ${
                        isLow
                          ? 'text-red-400'
                          : isMedium
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {device.isCharging ? (
                        <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
                      ) : (
                        <Battery className="w-4 h-4" />
                      )}
                      <span>{device.batteryPercent}%</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {device.isOnline ? 'Conectado' : 'Offline'}
                    </span>
                  </div>
                </div>

                {/* Battery level progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isLow
                        ? 'bg-red-500'
                        : isMedium
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${device.batteryPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
