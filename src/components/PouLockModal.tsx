import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Unlock,
  KeyRound,
  Fingerprint,
  Users,
  History,
  AlertTriangle,
  X,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { AccessLog, AuthorizedUser } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface PouLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AccessLog[];
  authorizedUsers: AuthorizedUser[];
  onAddLog: (log: AccessLog) => void;
  accessibilitySpeechEnabled?: boolean;
}

interface SmartDoor {
  id: string;
  name: string;
  isLocked: boolean;
  batteryPercent: number;
  type: 'exterior' | 'garage' | 'interior';
}

export const PouLockModal: React.FC<PouLockModalProps> = ({
  isOpen,
  onClose,
  logs,
  authorizedUsers,
  onAddLog,
  accessibilitySpeechEnabled = true,
}) => {
  const [tab, setTab] = useState<'doors' | 'users' | 'logs'>('doors');
  const [doors, setDoors] = useState<SmartDoor[]>([
    { id: 'd1', name: 'Puerta Principal Entrada', isLocked: true, batteryPercent: 78, type: 'exterior' },
    { id: 'd2', name: 'Portón Vehicular Garaje', isLocked: true, batteryPercent: 92, type: 'garage' },
    { id: 'd3', name: 'Puerta Trasera Patio', isLocked: true, batteryPercent: 64, type: 'interior' },
  ]);

  const handleToggleDoor = (doorId: string, currentStatus: boolean, doorName: string) => {
    const nextLocked = !currentStatus;
    if (nextLocked) {
      playSound('lock');
      triggerHaptic('medium');
    } else {
      playSound('unlock');
      triggerHaptic('medium');
    }

    setDoors((prev) =>
      prev.map((d) => (d.id === doorId ? { ...d, isLocked: nextLocked } : d))
    );

    // Register log
    const newLog: AccessLog = {
      id: `l-${Date.now()}`,
      doorName,
      personName: 'Usuario Titular',
      type: nextLocked ? 'exit' : 'entry',
      timestamp: 'Ahora mismo',
      method: 'biometric',
      avatarInitials: 'UT',
    };
    onAddLog(newLog);

    if (accessibilitySpeechEnabled) {
      speakText(`${doorName} ${nextLocked ? 'bloqueada y asegurada' : 'abierta por biometría'}`);
    }
  };

  const handleSimulateTamper = (doorName: string) => {
    playSound('sos');
    triggerHaptic('warning');
    const alertLog: AccessLog = {
      id: `l-${Date.now()}`,
      doorName,
      personName: '¡Intento Forzado No Autorizado!',
      type: 'denied',
      timestamp: 'Ahora mismo',
      method: 'pin',
      avatarInitials: '⚠️',
    };
    onAddLog(alertLog);
    alert(`¡Alerta POU Lock! Se ha registrado un intento de acceso no autorizado en ${doorName}.`);
    if (accessibilitySpeechEnabled) {
      speakText(`Alerta de seguridad. Intento de acceso no autorizado en ${doorName}.`);
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
        aria-label="Control de accesos POU Lock"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-600/30 border border-cyan-400/40 text-cyan-300">
              <KeyRound className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">POU LOCK</h2>
              <p className="text-xs text-slate-400">Control de Accesos & Cerraduras</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Cerrar POU Lock"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-2 bg-slate-950/80 border-b border-cyan-500/20 gap-1">
          <button
            type="button"
            onClick={() => setTab('doors')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'doors' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Cerraduras ({doors.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('users')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'users' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Autorizados ({authorizedUsers.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('logs')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              tab === 'logs' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Historial ({logs.length})
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {/* TAB 1: DOORS */}
          {tab === 'doors' && (
            <div className="space-y-3">
              {doors.map((door) => (
                <div
                  key={door.id}
                  className={`p-4 rounded-2xl border-2 transition-all space-y-3 ${
                    door.isLocked
                      ? 'bg-slate-900/90 border-slate-800'
                      : 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 rounded-2xl ${
                          door.isLocked
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-emerald-500 text-black animate-pulse'
                        }`}
                      >
                        {door.isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">{door.name}</h3>
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`font-semibold ${
                              door.isLocked ? 'text-cyan-400' : 'text-emerald-400'
                            }`}
                          >
                            {door.isLocked ? 'Bloqueada y Asegurada' : 'Abierta'}
                          </span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400 font-mono">Batería: {door.batteryPercent}%</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleDoor(door.id, door.isLocked, door.name)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow ${
                        door.isLocked
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <Fingerprint className="w-4 h-4" />
                      {door.isLocked ? 'Desbloquear' : 'Asegurar'}
                    </button>
                  </div>

                  {/* Security simulation test */}
                  <div className="pt-2 border-t border-slate-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSimulateTamper(door.name)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-mono flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Simular Intento Forzado
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: AUTHORIZED USERS */}
          {tab === 'users' && (
            <div className="space-y-3">
              {authorizedUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        {user.name}
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-300">
                          {user.role}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {user.expiresText || 'Llave digital activa'} • {user.accessCount} accesos
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-semibold ${
                      user.hasActiveKey
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {user.hasActiveKey ? 'Autorizado' : 'Expirado'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: LOGS */}
          {tab === 'logs' && (
            <div className="space-y-2.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    log.type === 'denied'
                      ? 'bg-red-950/40 border-red-500/50 text-red-200'
                      : log.type === 'entry'
                      ? 'bg-slate-900 border-slate-800 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-1.5 rounded-xl ${
                        log.type === 'denied'
                          ? 'bg-red-600 text-white'
                          : log.type === 'entry'
                          ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {log.type === 'denied' ? (
                        <ShieldAlert className="w-4 h-4" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </span>
                    <div>
                      <div className="font-bold text-white">{log.personName}</div>
                      <div className="text-[11px] text-slate-400">
                        {log.doorName} • Método: {log.method.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">{log.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
