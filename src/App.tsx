import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  AlertOctagon,
  Home,
  Compass,
  Car,
  HeartPulse,
  Video,
  Users,
  Lock,
  Package,
  Dog,
  Cpu,
  WifiOff,
  History,
  Settings,
  Sparkles,
  Bot,
  MessageSquare,
  Mic,
  Volume2,
  Bell,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

// Data & Types
import {
  initialUserProfile,
  initialContacts,
  initialCameras,
  initialSafetyZones,
  initialDevicesEnergy,
  initialDeliveries,
  initialPets,
  initialAccessLogs,
  initialAuthorizedUsers,
  initialSecurityEvents,
} from './data/mockData';
import {
  UserProfile,
  EmergencyContact,
  CameraFeed,
  SafetyZone,
  DeviceEnergy,
  DeliveryItem,
  PetProfile,
  AccessLog,
  AuthorizedUser,
  SecurityEvent,
  HouseMode,
  AccessibilitySettings,
} from './types';

// Components & Modals
import { PouMascot } from './components/PouMascot';
import { PouAIModal } from './components/PouAIModal';
import { SOSModal } from './components/SOSModal';
import { SecurityMapModal } from './components/SecurityMapModal';
import { CamerasModal } from './components/CamerasModal';
import { PouCircleModal } from './components/PouCircleModal';
import { HouseModeModal } from './components/HouseModeModal';
import { PouLockModal } from './components/PouLockModal';
import { PouDeliveryModal } from './components/PouDeliveryModal';
import { PouPetModal } from './components/PouPetModal';
import { DevicesEnergyModal } from './components/DevicesEnergyModal';
import { OfflineGuideModal } from './components/OfflineGuideModal';
import { QuickMedicalModal } from './components/QuickMedicalModal';
import { VehicleModal } from './components/VehicleModal';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';

// Utilities
import { playSound, triggerHaptic, speakText } from './utils/accessibility';

export default function App() {
  // Navigation Bar State ('home' | 'history' | 'settings')
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings'>('home');

  // Core System State
  const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
  const [contacts, setContacts] = useState<EmergencyContact[]>(initialContacts);
  const [cameras, setCameras] = useState<CameraFeed[]>(initialCameras);
  const [zones, setZones] = useState<SafetyZone[]>(initialSafetyZones);
  const [devices, setDevices] = useState<DeviceEnergy[]>(initialDevicesEnergy);
  const [deliveries, setDeliveries] = useState<DeliveryItem[]>(initialDeliveries);
  const [pets, setPets] = useState<PetProfile[]>(initialPets);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(initialAccessLogs);
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>(initialAuthorizedUsers);
  const [events, setEvents] = useState<SecurityEvent[]>(initialSecurityEvents);

  // Security Status Modes
  const [houseMode, setHouseMode] = useState<HouseMode>('home');
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(false);
  const [sharingDurationMinutes, setSharingDurationMinutes] = useState<number>(60);

  // Accessibility State
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    speechNarrationEnabled: false,
    speechSpeed: 1,
    hapticFeedbackEnabled: true,
    visualFlashAlerts: true,
    simplifiedSeniorMode: false,
  });

  // Modals Visibility
  const [isPouAIOpen, setIsPouAIOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isCamerasOpen, setIsCamerasOpen] = useState<boolean>(false);
  const [isCircleOpen, setIsCircleOpen] = useState<boolean>(false);
  const [isHouseModeOpen, setIsHouseModeOpen] = useState<boolean>(false);
  const [isLockOpen, setIsLockOpen] = useState<boolean>(false);
  const [isDeliveryOpen, setIsDeliveryOpen] = useState<boolean>(false);
  const [isPetOpen, setIsPetOpen] = useState<boolean>(false);
  const [isEnergyOpen, setIsEnergyOpen] = useState<boolean>(false);
  const [isOfflineOpen, setIsOfflineOpen] = useState<boolean>(false);
  const [isMedicalOpen, setIsMedicalOpen] = useState<boolean>(false);
  const [isVehicleOpen, setIsVehicleOpen] = useState<boolean>(false);

  // Handle SOS Activation
  const handleActivateSOS = (details: { location: string; callMade?: string }) => {
    setIsAlertActive(true);
    const newEvent: SecurityEvent = {
      id: `ev-${Date.now()}`,
      title: '¡Alerta de Emergencia SOS Activada!',
      description: `Activación de protocolo personal. Ubicación: ${details.location}`,
      timestamp: 'Ahora mismo',
      type: 'alert',
      severity: 'critical',
      location: details.location,
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  const handleDeactivateSOS = () => {
    setIsAlertActive(false);
    const newEvent: SecurityEvent = {
      id: `ev-${Date.now()}`,
      title: 'Alerta SOS Cancelada',
      description: 'El usuario titular ha cancelado la alerta. Estado seguro reestablecido.',
      timestamp: 'Ahora mismo',
      type: 'system',
      severity: 'info',
    };
    setEvents((prev) => [newEvent, ...prev]);
  };

  // House Mode Name Helper
  const getHouseModeName = (mode: HouseMode) => {
    switch (mode) {
      case 'home':
        return 'En Casa';
      case 'sleeping':
        return 'Dormido';
      case 'away':
        return 'Fuera de Casa';
      case 'vacation':
        return 'Vacaciones';
    }
  };

  return (
    <div
      className={`min-h-screen font-sans transition-colors duration-300 relative select-none ${
        accessibility.highContrast
          ? 'bg-black text-white'
          : 'bg-[#040814] text-slate-100'
      } ${accessibility.largeText ? 'text-lg' : 'text-sm'}`}
    >
      {/* Visual Flash Alert Overlay for deaf/hard of hearing when SOS is active */}
      {isAlertActive && accessibility.visualFlashAlerts && (
        <div className="fixed inset-0 pointer-events-none z-40 animate-pulse bg-red-600/20" />
      )}

      {/* Cyber Ambient Gradient Glows (Subtle Neon Effect) */}
      {!accessibility.highContrast && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />
        </div>
      )}

      {/* App Container - Mobile Smartphone Frame & Tablet Centering */}
      <div className="relative z-10 max-w-md mx-auto min-h-screen flex flex-col px-4 pt-3 pb-24">
        {/* TOP STATUS BAR & LOGO */}
        <header className="flex items-center justify-between py-2 border-b border-cyan-500/20 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold font-['Rajdhani'] tracking-widest bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
                POU PROTECT
              </h1>
              <p className="text-[10px] text-cyan-300/80 -mt-0.5 font-medium">
                Tu seguridad, siempre un paso adelante.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Offline guide pill shortcut */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setIsOfflineOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors"
              title="Modo sin conexión"
              aria-label="Ver funciones sin conexión"
            >
              <WifiOff className="w-4 h-4" />
            </button>

            {/* Quick House Mode Selector Pill */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                setIsHouseModeOpen(true);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-blue-950/60 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5 shadow-sm hover:border-cyan-400 transition-all"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>{getHouseModeName(houseMode)}</span>
            </button>
          </div>
        </header>

        {/* TAB 1: PANTALLA PRINCIPAL (INICIO) */}
        {activeTab === 'home' && (
          <div className="space-y-4 flex-1">
            {/* 1. ESTADO DEL SISTEMA BANNER */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-2xl border flex items-center justify-between shadow-lg transition-all ${
                isAlertActive
                  ? 'bg-red-950/70 border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
                  : 'bg-slate-900/80 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-3 h-3 rounded-full shrink-0 ${
                    isAlertActive
                      ? 'bg-red-500 animate-ping'
                      : 'bg-emerald-400 shadow-[0_0_8px_#34D399]'
                  }`}
                />
                <div>
                  <div className="text-xs font-bold tracking-wide text-white">
                    {isAlertActive ? '¡ALERTA SOS ACTIVA!' : 'SISTEMA SEGURO – Todo en orden'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isAlertActive
                      ? 'Emisión de auxilio y contactos notificados'
                      : 'Perímetro vigilado • Sensores y cámaras estables'}
                  </div>
                </div>
              </div>

              {isAlertActive ? (
                <button
                  type="button"
                  onClick={() => setIsSOSOpen(true)}
                  className="px-2.5 py-1 bg-red-600 text-white font-bold rounded-lg text-[10px] animate-pulse"
                >
                  Ver Alerta
                </button>
              ) : (
                <span className="text-[11px] font-mono text-cyan-300">24/7</span>
              )}
            </motion.div>

            {/* 2. BOTÓN SOS GRANDE Y ROJO EN EL CENTRO */}
            <div className="relative py-3 flex flex-col items-center justify-center">
              {/* Ripple / Aura Rings */}
              <div className="absolute w-52 h-52 rounded-full bg-red-600/10 animate-ping pointer-events-none" />
              <div className="absolute w-44 h-44 rounded-full bg-red-600/20 blur-md pointer-events-none" />

              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playSound('click');
                  triggerHaptic('medium');
                  setIsSOSOpen(true);
                }}
                className={`relative z-10 w-36 h-36 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-700 text-white font-black flex flex-col items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.5)] border-4 border-red-300/40 transition-all cursor-pointer ${
                  accessibility.simplifiedSeniorMode ? 'w-44 h-44' : ''
                }`}
                aria-label="Botón de emergencia SOS"
              >
                <AlertOctagon className="w-12 h-12 text-white mb-0.5 animate-pulse" />
                <span className="text-2xl font-['Rajdhani'] font-extrabold tracking-widest drop-shadow-md">
                  SOS
                </span>
                <span className="text-[9px] font-bold tracking-wider text-red-100 uppercase opacity-90">
                  EMERGENCIA
                </span>
              </motion.button>
              <span className="text-[11px] text-slate-400 mt-2 font-medium">
                Toca para activar protocolo de auxilio protegido
              </span>
            </div>

            {/* 3. BOTONES DE ACCESO RÁPIDO: Hogar, Calle, Vehículo, Médica */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Accesos Rápidos
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {/* Hogar */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    triggerHaptic('light');
                    setIsHouseModeOpen(true);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-1.5 transition-all group"
                  aria-label="Seguridad del hogar"
                >
                  <span className="p-2 rounded-xl bg-blue-600/20 text-cyan-300 group-hover:bg-blue-600/30 transition-colors">
                    <Home className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-200">Hogar</span>
                </button>

                {/* Calle (Mapa de Seguridad) */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    triggerHaptic('light');
                    setIsMapOpen(true);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-1.5 transition-all group"
                  aria-label="Mapa de seguridad en la calle"
                >
                  <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300 group-hover:bg-emerald-600/30 transition-colors">
                    <Compass className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-200">Calle</span>
                </button>

                {/* Vehículo */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    triggerHaptic('light');
                    setIsVehicleOpen(true);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-1.5 transition-all group"
                  aria-label="Seguridad vehicular"
                >
                  <span className="p-2 rounded-xl bg-violet-600/20 text-violet-300 group-hover:bg-violet-600/30 transition-colors">
                    <Car className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-200">Vehículo</span>
                </button>

                {/* Médica */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    triggerHaptic('light');
                    setIsMedicalOpen(true);
                  }}
                  className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-red-500/50 flex flex-col items-center justify-center gap-1.5 transition-all group"
                  aria-label="Emergencia médica"
                >
                  <span className="p-2 rounded-xl bg-red-600/20 text-red-300 group-hover:bg-red-600/30 transition-colors">
                    <HeartPulse className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-semibold text-slate-200">Médica</span>
                </button>
              </div>
            </div>

            {/* 4. SECCIÓN “POU IA” CON ASISTENTE VIRTUAL & MASCOTA */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-cyan-500/40 rounded-3xl shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Mascot in badge */}
                  <div
                    onClick={() => {
                      playSound('chirp');
                      setIsPouAIOpen(true);
                    }}
                    className="cursor-pointer shrink-0"
                    title="Hablar con POU Agente"
                  >
                    <PouMascot
                      size="sm"
                      state={isAlertActive ? 'alert' : 'idle'}
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white tracking-wide">POU IA AGENTE</span>
                      <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded text-[9px] font-mono">
                        EN LÍNEA
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      "Hola, todo el perímetro está en orden. ¿Deseas hacer un chequeo o consultar algo?"
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    triggerHaptic('medium');
                    setIsPouAIOpen(true);
                  }}
                  className="px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0 transition-all"
                  aria-label="Consultar con asistente POU IA"
                >
                  <Bot className="w-4 h-4" />
                  <span>Preguntar</span>
                </button>
              </div>
            </div>

            {/* 5. TARJETAS LUMINOSAS DE MÓDULOS */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                Módulos de Seguridad
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Cámaras Inteligentes */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSound('click');
                    setIsCamerasOpen(true);
                  }}
                  className="p-3 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-cyan-600/20 text-cyan-400 group-hover:bg-cyan-600/30 transition-colors">
                      <Video className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      {cameras.filter((c) => c.isOnline).length} en vivo
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Cámaras</h4>
                    <p className="text-[10px] text-slate-400">Monitoreo & detección</p>
                  </div>
                </motion.div>

                {/* POU Circle */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSound('click');
                    setIsCircleOpen(true);
                  }}
                  className="p-3 bg-slate-900/80 border border-slate-800 hover:border-violet-500/40 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-violet-600/20 text-violet-400 group-hover:bg-violet-600/30 transition-colors">
                      <Users className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {contacts.length} contactos
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">POU Circle</h4>
                    <p className="text-[10px] text-slate-400">Red familiar & SOS</p>
                  </div>
                </motion.div>

                {/* POU Lock */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSound('click');
                    setIsLockOpen(true);
                  }}
                  className="p-3 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-blue-600/20 text-cyan-300 group-hover:bg-blue-600/30 transition-colors">
                      <Lock className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-semibold">Asegurado</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">POU Lock</h4>
                    <p className="text-[10px] text-slate-400">Accesos y cerraduras</p>
                  </div>
                </motion.div>

                {/* POU Delivery */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSound('click');
                    setIsDeliveryOpen(true);
                  }}
                  className="p-3 bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-amber-600/20 text-amber-300 group-hover:bg-amber-600/30 transition-colors">
                      <Package className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono text-amber-400">
                      {deliveries.filter((d) => d.status !== 'delivered').length} pendiente(s)
                    </span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">POU Delivery</h4>
                    <p className="text-[10px] text-slate-400">Recepción de paquetes</p>
                  </div>
                </motion.div>

                {/* POU Pet */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSound('click');
                    setIsPetOpen(true);
                  }}
                  className="p-3 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 group-hover:bg-emerald-600/30 transition-colors">
                      <Dog className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">En zona</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">POU Pet</h4>
                    <p className="text-[10px] text-slate-400">Geovalla & recordatorios</p>
                  </div>
                </motion.div>

                {/* POU Energy */}
                <motion.div
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    playSound('click');
                    setIsEnergyOpen(true);
                  }}
                  className="p-3 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-2xl cursor-pointer transition-all space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-slate-800 text-cyan-300 group-hover:bg-slate-700 transition-colors">
                      <Cpu className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{devices.length} disp.</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">POU Energy</h4>
                    <p className="text-[10px] text-slate-400">Baterías & hardware</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORIAL */}
        {activeTab === 'history' && (
          <HistoryView
            events={events}
            onClearHistory={() => setEvents([])}
            accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
          />
        )}

        {/* TAB 3: AJUSTES & ACCESIBILIDAD */}
        {activeTab === 'settings' && (
          <SettingsView
            userProfile={userProfile}
            accessibilitySettings={accessibility}
            onUpdateProfile={setUserProfile}
            onUpdateAccessibility={setAccessibility}
            onOpenPouCircle={() => setIsCircleOpen(true)}
          />
        )}

        {/* BOTTOM NAVIGATION BAR (Android style) */}
        <nav
          className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 border-t border-cyan-500/20 backdrop-blur-lg py-2 px-6"
          role="navigation"
          aria-label="Navegación principal"
        >
          <div className="max-w-md mx-auto flex items-center justify-around">
            {/* Inicio */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                triggerHaptic('light');
                setActiveTab('home');
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'home' ? 'text-cyan-400 scale-105' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Pestaña de Inicio"
            >
              <div
                className={`p-1.5 rounded-xl ${
                  activeTab === 'home' ? 'bg-cyan-500/20 border border-cyan-400/40' : ''
                }`}
              >
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold">Inicio</span>
            </button>

            {/* Historial */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                triggerHaptic('light');
                setActiveTab('history');
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'history' ? 'text-cyan-400 scale-105' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Pestaña de Historial"
            >
              <div
                className={`p-1.5 rounded-xl ${
                  activeTab === 'history' ? 'bg-cyan-500/20 border border-cyan-400/40' : ''
                }`}
              >
                <History className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold">Historial</span>
            </button>

            {/* Ajustes */}
            <button
              type="button"
              onClick={() => {
                playSound('click');
                triggerHaptic('light');
                setActiveTab('settings');
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'settings' ? 'text-cyan-400 scale-105' : 'text-slate-400 hover:text-white'
              }`}
              aria-label="Pestaña de Ajustes"
            >
              <div
                className={`p-1.5 rounded-xl ${
                  activeTab === 'settings' ? 'bg-cyan-500/20 border border-cyan-400/40' : ''
                }`}
              >
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold">Ajustes</span>
            </button>
          </div>
        </nav>

        {/* MODAL DIALOGS */}
        <PouAIModal
          isOpen={isPouAIOpen}
          onClose={() => setIsPouAIOpen(false)}
          systemStatus={isAlertActive ? 'Alerta SOS Activa' : 'Sistema Seguro - Todo en orden'}
          houseMode={getHouseModeName(houseMode)}
          onExecuteAction={(actionType) => {
            if (actionType === 'alarm') {
              setIsSOSOpen(true);
            } else if (actionType === 'camera') {
              setIsCamerasOpen(true);
            } else if (actionType === 'location') {
              setIsMapOpen(true);
            } else if (actionType === 'lock') {
              setIsLockOpen(true);
            }
          }}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <SOSModal
          isOpen={isSOSOpen}
          onClose={() => setIsSOSOpen(false)}
          contacts={contacts}
          onActivateAlert={handleActivateSOS}
          onDeactivateAlert={handleDeactivateSOS}
          isAlertActive={isAlertActive}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <SecurityMapModal
          isOpen={isMapOpen}
          onClose={() => setIsMapOpen(false)}
          zones={zones}
          contacts={contacts}
          isSharingLocation={isSharingLocation}
          sharingDurationMinutes={sharingDurationMinutes}
          onUpdateSharing={(sharing, mins) => {
            setIsSharingLocation(sharing);
            setSharingDurationMinutes(mins);
          }}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <CamerasModal
          isOpen={isCamerasOpen}
          onClose={() => setIsCamerasOpen(false)}
          cameras={cameras}
          onAddCamera={(newCam) => setCameras((prev) => [...prev, newCam])}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <PouCircleModal
          isOpen={isCircleOpen}
          onClose={() => setIsCircleOpen(false)}
          contacts={contacts}
          onUpdateContacts={setContacts}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <HouseModeModal
          isOpen={isHouseModeOpen}
          onClose={() => setIsHouseModeOpen(false)}
          currentMode={houseMode}
          onSelectMode={(m) => {
            setHouseMode(m);
            const ev: SecurityEvent = {
              id: `ev-${Date.now()}`,
              title: `Modo de Casa cambiado a: ${getHouseModeName(m)}`,
              description: 'Configuración perimetral y sensores actualizados.',
              timestamp: 'Ahora mismo',
              type: 'system',
              severity: 'info',
            };
            setEvents((prev) => [ev, ...prev]);
          }}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <PouLockModal
          isOpen={isLockOpen}
          onClose={() => setIsLockOpen(false)}
          logs={accessLogs}
          authorizedUsers={authorizedUsers}
          onAddLog={(newLog) => setAccessLogs((prev) => [newLog, ...prev])}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <PouDeliveryModal
          isOpen={isDeliveryOpen}
          onClose={() => setIsDeliveryOpen(false)}
          deliveries={deliveries}
          onConfirmDelivery={(id) => {
            setDeliveries((prev) =>
              prev.map((d) => (d.id === id ? { ...d, status: 'delivered' } : d))
            );
            const ev: SecurityEvent = {
              id: `ev-${Date.now()}`,
              title: 'Paquete recibido con éxito',
              description: 'Entrega completada y verificada.',
              timestamp: 'Ahora mismo',
              type: 'delivery',
              severity: 'info',
            };
            setEvents((prev) => [ev, ...prev]);
          }}
          onAddDelivery={(item) => setDeliveries((prev) => [item, ...prev])}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <PouPetModal
          isOpen={isPetOpen}
          onClose={() => setIsPetOpen(false)}
          pets={pets}
          onAddPet={(p) => setPets((prev) => [...prev, p])}
          onToggleReminder={(petId, rId) => {
            setPets((prev) =>
              prev.map((p) =>
                p.id === petId
                  ? {
                      ...p,
                      reminders: p.reminders.map((r) =>
                        r.id === rId ? { ...r, completed: !r.completed } : r
                      ),
                    }
                  : p
              )
            );
          }}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <DevicesEnergyModal
          isOpen={isEnergyOpen}
          onClose={() => setIsEnergyOpen(false)}
          devices={devices}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <OfflineGuideModal
          isOpen={isOfflineOpen}
          onClose={() => setIsOfflineOpen(false)}
          contacts={contacts}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <QuickMedicalModal
          isOpen={isMedicalOpen}
          onClose={() => setIsMedicalOpen(false)}
          userProfile={userProfile}
          onCallEmergency={() => {
            playSound('click');
            window.location.href = 'tel:112';
          }}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />

        <VehicleModal
          isOpen={isVehicleOpen}
          onClose={() => setIsVehicleOpen(false)}
          accessibilitySpeechEnabled={accessibility.speechNarrationEnabled}
        />
      </div>
    </div>
  );
}
