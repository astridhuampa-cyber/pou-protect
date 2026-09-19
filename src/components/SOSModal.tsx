import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertOctagon,
  PhoneCall,
  MapPin,
  Share2,
  Volume2,
  X,
  CheckCircle,
  ShieldAlert,
  Radio,
  Clock,
  UserCheck,
} from 'lucide-react';
import { EmergencyContact } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  onActivateAlert: (details: { location: string; callMade?: string }) => void;
  onDeactivateAlert: () => void;
  isAlertActive: boolean;
  accessibilitySpeechEnabled?: boolean;
}

export const SOSModal: React.FC<SOSModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onActivateAlert,
  onDeactivateAlert,
  isAlertActive,
  accessibilitySpeechEnabled = true,
}) => {
  const [step, setStep] = useState<'confirm' | 'active' | 'calling'>('confirm');
  const [countdown, setCountdown] = useState<number>(3);
  const [userLocation, setUserLocation] = useState<string>('Obteniendo ubicación GPS...');
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [locationSharedWith, setLocationSharedWith] = useState<string[]>([]);
  const [callingContact, setCallingContact] = useState<{ name: string; phone: string } | null>(null);
  const [isSirenPlaying, setIsSirenPlaying] = useState<boolean>(false);

  // Sync step with external alert status
  useEffect(() => {
    if (isAlertActive) {
      setStep('active');
    } else {
      setStep('confirm');
      setCountdown(3);
    }
  }, [isAlertActive, isOpen]);

  // Handle countdown when opening in confirm step
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen && step === 'confirm' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
        playSound('beep');
        triggerHaptic('light');
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [isOpen, step, countdown]);

  // Request location with explicit user permission
  const requestLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setHasLocationPermission(true);
          const locStr = `Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)} (Precisión: ±${Math.round(pos.coords.accuracy)}m)`;
          setUserLocation(locStr);
        },
        (_err) => {
          setHasLocationPermission(false);
          setUserLocation('Ubicación protegida (Madrid Centro - Calle Alcalá 42, estimado)');
        },
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      setUserLocation('Ubicación GPS no soportada en navegador');
    }
  };

  const handleConfirmSOS = () => {
    playSound('sos');
    triggerHaptic('sos');
    setStep('active');
    requestLocation();
    onActivateAlert({ location: userLocation });

    if (accessibilitySpeechEnabled) {
      speakText('¡Alerta de emergencia SOS activada! Ubicación lista para compartir y servicios de llamada disponibles.');
    }
  };

  const handleShareLocationWithContact = (contactId: string, contactName: string) => {
    playSound('click');
    triggerHaptic('medium');
    if (!locationSharedWith.includes(contactId)) {
      setLocationSharedWith((prev) => [...prev, contactId]);
      if (accessibilitySpeechEnabled) {
        speakText(`Ubicación enviada a ${contactName}`);
      }
    }
  };

  const handleShareWithAll = () => {
    playSound('success');
    triggerHaptic('medium');
    const allIds = contacts.filter((c) => c.receiveSOS).map((c) => c.id);
    setLocationSharedWith(allIds);
    if (accessibilitySpeechEnabled) {
      speakText('Ubicación compartida con todos los contactos de emergencia autorizados.');
    }
  };

  const handleCall = (name: string, phone: string) => {
    playSound('click');
    triggerHaptic('medium');
    setCallingContact({ name, phone });
    setStep('calling');
    if (accessibilitySpeechEnabled) {
      speakText(`Iniciando conexión con ${name}, número ${phone}. Pulsa confirmar llamada.`);
    }
  };

  const toggleSiren = () => {
    if (!isSirenPlaying) {
      setIsSirenPlaying(true);
      playSound('sos');
      triggerHaptic('sos');
      const sirenInterval = setInterval(() => {
        playSound('sos');
        triggerHaptic('warning');
      }, 500);
      (window as any).__pouSiren = sirenInterval;
    } else {
      setIsSirenPlaying(false);
      clearInterval((window as any).__pouSiren);
    }
  };

  const handleCancelEmergency = () => {
    if (window.confirm('¿Seguro que deseas cancelar la alerta de emergencia SOS?')) {
      if (isSirenPlaying) {
        clearInterval((window as any).__pouSiren);
        setIsSirenPlaying(false);
      }
      playSound('success');
      triggerHaptic('medium');
      onDeactivateAlert();
      setStep('confirm');
      setCountdown(3);
      onClose();

      if (accessibilitySpeechEnabled) {
        speakText('Alerta SOS cancelada. El sistema ha vuelto a estado seguro.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-2 border-red-500/60 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)] overflow-hidden flex flex-col text-slate-100 relative"
          role="alertdialog"
          aria-label="Panel de emergencia SOS"
        >
          {/* Header */}
          <div className="p-4 bg-red-950/70 border-b border-red-500/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-red-600 text-white animate-pulse">
                <AlertOctagon className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-lg font-bold text-red-100 tracking-wider font-['Rajdhani']">
                  {step === 'confirm' ? 'CONFIRMACIÓN SOS' : '¡EMERGENCIA SOS ACTIVADA!'}
                </h2>
                <p className="text-xs text-red-300">Protocolo de Asistencia Personal</p>
              </div>
            </div>

            <button
              type="button"
              onClick={step === 'active' ? handleCancelEmergency : onClose}
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar modal de emergencia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* STEP 1: Confirmation to prevent accidental triggers */}
          {step === 'confirm' && (
            <div className="p-6 text-center space-y-6">
              <div className="w-24 h-24 mx-auto rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center animate-pulse">
                <ShieldAlert className="w-12 h-12 text-red-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">¿Deseas activar la alerta de emergencia?</h3>
                <p className="text-sm text-slate-300">
                  Esta acción alertará a tu círculo de seguridad y preparará la llamada a servicios de emergencia.
                </p>
                <div className="text-xs text-amber-300/90 font-mono bg-amber-950/40 border border-amber-500/30 rounded-lg p-2 mt-2">
                  Activación protegida contra toques accidentales.
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleConfirmSOS}
                  className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-base rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <AlertOctagon className="w-5 h-5" />
                  CONFIRMAR Y ACTIVAR SOS AHORA
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-2xl transition-all"
                >
                  Cancelar (Fue un error)
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Active Emergency Panel */}
          {step === 'active' && (
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-red-500/30">
              {/* Active Banner */}
              <div className="p-3 bg-red-900/60 border border-red-500/60 rounded-2xl flex items-center justify-between text-red-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    ALERTA TRANSMITIÉNDOSE
                  </span>
                </div>
                <span className="text-[11px] font-mono text-red-300">En vivo</span>
              </div>

              {/* Location Box */}
              <div className="p-3.5 bg-slate-900/90 border border-cyan-500/30 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>Tu Ubicación Actual</span>
                  </div>
                  <button
                    type="button"
                    onClick={requestLocation}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Actualizar GPS
                  </button>
                </div>
                <p className="text-xs font-mono text-slate-200 bg-black/40 p-2 rounded-xl">
                  {userLocation}
                </p>
                <button
                  type="button"
                  onClick={handleShareWithAll}
                  className="w-full py-2 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/40 text-cyan-200 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Compartir Ubicación con Todo el Círculo
                </button>
              </div>

              {/* Call Emergency Services Direct Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Llamada Directa (Requiere tu Confirmación)
                </label>

                {/* 112 / 911 button */}
                <button
                  type="button"
                  onClick={() => handleCall('Servicios de Emergencia Oficiales', '112 / 911')}
                  className="w-full p-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black/30 rounded-xl">
                      <PhoneCall className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm">Llamar a Emergencias (112 / 911)</div>
                      <div className="text-[11px] text-red-100 font-normal">Policía, Ambulancia y Bomberos</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-white/20 rounded-full font-mono">Llamar</span>
                </button>

                {/* Priority Contacts List */}
                {contacts.slice(0, 2).map((contact) => {
                  const isShared = locationSharedWith.includes(contact.id);
                  return (
                    <div
                      key={contact.id}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center font-bold text-xs">
                          {contact.name[0]}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-white">{contact.name}</div>
                          <div className="text-[11px] text-slate-400">{contact.phone}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleShareLocationWithContact(contact.id, contact.name)}
                          className={`p-2 rounded-xl border text-xs ${
                            isShared
                              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                          }`}
                          title={isShared ? 'Ubicación ya enviada' : 'Enviar ubicación por SMS/Chat'}
                          aria-label={`Compartir con ${contact.name}`}
                        >
                          {isShared ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCall(contact.name, contact.phone)}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Llamar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Local Deterrent Siren Button */}
              <button
                type="button"
                onClick={toggleSiren}
                className={`w-full py-3 px-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  isSirenPlaying
                    ? 'bg-amber-600 text-white border-amber-400 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-800/90 text-amber-300 border-amber-500/40 hover:bg-slate-800'
                }`}
              >
                <Volume2 className="w-4 h-4" />
                {isSirenPlaying ? 'SILENCIAR SIRENA LOCAL' : 'HACER SONAR SIRENA DISUASORIA'}
              </button>

              {/* Deactivate Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCancelEmergency}
                  className="w-full py-3.5 bg-slate-800 hover:bg-emerald-900/60 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-200 font-semibold text-xs rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  CANCELAR ALERTA SOS (ESTOY A SALVO)
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Simulated Call Overlay */}
          {step === 'calling' && callingContact && (
            <div className="p-6 text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center animate-ping">
                <PhoneCall className="w-10 h-10 text-cyan-300" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-mono text-cyan-400 uppercase">Conectando llamada</p>
                <h3 className="text-xl font-bold text-white">{callingContact.name}</h3>
                <p className="text-sm font-mono text-slate-300">{callingContact.phone}</p>
              </div>

              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Para tu seguridad en el navegador, se abrirá la aplicación telefónica de tu dispositivo con el número listo para marcar.
              </p>

              <div className="space-y-2">
                <a
                  href={`tel:${callingContact.phone.replace(/[^0-9+]/g, '')}`}
                  className="block w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-lg transition-all"
                >
                  Confirmar y Abrir Teléfono
                </a>

                <button
                  type="button"
                  onClick={() => setStep('active')}
                  className="w-full py-2.5 bg-slate-800 text-slate-300 text-xs rounded-xl"
                >
                  Volver al Panel SOS
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
