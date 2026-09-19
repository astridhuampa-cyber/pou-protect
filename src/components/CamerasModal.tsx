import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Video,
  VideoOff,
  Eye,
  Moon,
  Sun,
  Maximize2,
  Volume2,
  Plus,
  X,
  AlertCircle,
  Clock,
  Battery,
  Shield,
  Camera,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { CameraFeed } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface CamerasModalProps {
  isOpen: boolean;
  onClose: () => void;
  cameras: CameraFeed[];
  onAddCamera: (newCam: CameraFeed) => void;
  accessibilitySpeechEnabled?: boolean;
}

export const CamerasModal: React.FC<CamerasModalProps> = ({
  isOpen,
  onClose,
  cameras,
  onAddCamera,
  accessibilitySpeechEnabled = true,
}) => {
  const [selectedCam, setSelectedCam] = useState<CameraFeed>(cameras[0] || null);
  const [isNightVision, setIsNightVision] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState<string>('');

  // Add Camera Form State
  const [newCamName, setNewCamName] = useState('');
  const [newCamLocation, setNewCamLocation] = useState('Exterior');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-ES', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePan = (direction: 'up' | 'down' | 'left' | 'right') => {
    playSound('click');
    triggerHaptic('light');
    setPanOffset((prev) => {
      if (direction === 'up') return { ...prev, y: Math.max(-25, prev.y - 10) };
      if (direction === 'down') return { ...prev, y: Math.min(25, prev.y + 10) };
      if (direction === 'left') return { ...prev, x: Math.max(-30, prev.x - 10) };
      if (direction === 'right') return { ...prev, x: Math.min(30, prev.x + 10) };
      return prev;
    });
  };

  const handleToggleNightVision = () => {
    playSound('click');
    triggerHaptic('light');
    setIsNightVision(!isNightVision);
    if (accessibilitySpeechEnabled) {
      speakText(isNightVision ? 'Visión nocturna infrarroja desactivada' : 'Visión nocturna infrarroja activada');
    }
  };

  const handleCreateCamera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCamName.trim()) return;

    const created: CameraFeed = {
      id: `cam-${Date.now()}`,
      name: newCamName,
      location: newCamLocation,
      isOnline: true,
      hasMotion: false,
      lastMotionTimestamp: 'Sin actividad reciente',
      resolution: '1080p FHD',
      nightVision: true,
      isRecording: true,
      batteryPercent: 100,
      previewGradient: 'from-slate-900 via-sky-950 to-slate-900',
    };

    onAddCamera(created);
    setSelectedCam(created);
    setShowAddModal(false);
    setNewCamName('');
    playSound('success');
    triggerHaptic('medium');

    if (accessibilitySpeechEnabled) {
      speakText(`Cámara ${created.name} agregada correctamente en línea.`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col h-[92vh] max-h-[780px] overflow-hidden text-slate-100 relative"
        role="dialog"
        aria-label="Administrador de Cámaras Inteligentes"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-600/30 border border-cyan-400/40 text-cyan-300">
              <Video className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">CÁMARAS DE SEGURIDAD</h2>
              <p className="text-xs text-slate-400">Monitoreo Perimetral en Vivo</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-cyan-600/30 hover:bg-cyan-600/50 border border-cyan-400/30 rounded-xl text-xs font-semibold text-cyan-200 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Cámara
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Cerrar cámaras"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Live Feed Area */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20">
          {selectedCam && (
            <div className="space-y-2">
              {/* Simulated Screen Feed */}
              <div
                className={`relative aspect-video w-full rounded-2xl overflow-hidden border-2 transition-all select-none shadow-2xl ${
                  selectedCam.isOnline
                    ? isNightVision
                      ? 'border-emerald-500/60 bg-emerald-950/40'
                      : 'border-cyan-500/40 bg-slate-950'
                    : 'border-red-500/40 bg-slate-950 opacity-80'
                }`}
              >
                {/* Night vision green or high-tech gradient filter */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${selectedCam.previewGradient} transition-transform duration-200`}
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(1.15)`,
                    filter: isNightVision ? 'brightness(1.4) contrast(1.3) hue-rotate(90deg)' : 'none',
                  }}
                >
                  {/* Subtle simulated ambient background shapes representing house environment */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute bottom-0 w-full h-1/3 bg-slate-800/60" />
                    <div className="absolute top-10 left-10 w-32 h-48 border border-slate-700/80" />
                    <div className="absolute top-16 right-20 w-48 h-36 border border-slate-700/80" />
                  </div>
                </div>

                {/* Night Vision Scanlines effect */}
                {isNightVision && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, #00E676 0px, transparent 2px, transparent 4px)',
                    }}
                  />
                )}

                {/* Simulated Motion Detection Bounding Box */}
                {selectedCam.hasMotion && selectedCam.isOnline && (
                  <motion.div
                    animate={{
                      scale: [1, 1.02, 1],
                      borderColor: ['#F59E0B', '#EF4444', '#F59E0B'],
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute top-1/3 left-1/3 w-36 h-28 border-2 border-amber-400 rounded-lg pointer-events-none z-10 flex flex-col justify-between p-1 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  >
                    <span className="text-[10px] font-mono bg-amber-500 text-black font-bold px-1 rounded w-fit">
                      MOVIMIENTO (98%)
                    </span>
                    <span className="text-[9px] font-mono text-amber-300 self-end">OBJ: MASCOTA / HUMANO</span>
                  </motion.div>
                )}

                {/* Status Overlays on Video */}
                <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 ${
                      selectedCam.isOnline ? 'bg-red-600/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    {selectedCam.isOnline ? 'REC' : 'OFFLINE'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/60 text-slate-300 border border-slate-700">
                    {selectedCam.resolution}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-black/70 text-cyan-300 border border-cyan-500/30">
                    {currentTime || '12:00:00'}
                  </span>
                  {selectedCam.batteryPercent !== undefined && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-black/70 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Battery className="w-3 h-3" />
                      {selectedCam.batteryPercent}%
                    </span>
                  )}
                </div>

                {/* Camera Title Bottom */}
                <div className="absolute bottom-3 left-3 z-10 bg-black/75 px-3 py-1.5 rounded-xl border border-slate-700/60 backdrop-blur-sm">
                  <p className="text-xs font-bold text-white">{selectedCam.name}</p>
                  <p className="text-[10px] text-slate-400">{selectedCam.location}</p>
                </div>

                {/* Offline Warning */}
                {!selectedCam.isOnline && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 space-y-2">
                    <VideoOff className="w-10 h-10 text-red-400 animate-pulse" />
                    <p className="text-sm font-bold text-white">Cámara sin conexión remota</p>
                    <p className="text-xs text-slate-400">Verifica la alimentación o la red local Wi-Fi.</p>
                  </div>
                )}
              </div>

              {/* Live Controls Bar */}
              <div className="p-3 bg-slate-900 border border-cyan-500/20 rounded-2xl flex items-center justify-between gap-2 flex-wrap">
                {/* Night vision toggle */}
                <button
                  type="button"
                  onClick={handleToggleNightVision}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isNightVision
                      ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isNightVision ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {isNightVision ? 'Visión Normal' : 'Visión Nocturna'}
                </button>

                {/* PTZ Pan Controls */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => handlePan('left')}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                    title="Girar Izquierda"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handlePan('up')}
                      className="p-1 hover:bg-slate-800 rounded-lg text-slate-300"
                      title="Subir"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePan('down')}
                      className="p-1 hover:bg-slate-800 rounded-lg text-slate-300"
                      title="Bajar"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePan('right')}
                    className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300"
                    title="Girar Derecha"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Snapshot Button */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    triggerHaptic('light');
                    alert('Captura de seguridad guardada en el historial de eventos.');
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  Captura
                </button>
              </div>
            </div>
          )}

          {/* Connected Cameras Selector Grid */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Cámaras Vinculadas ({cameras.length})
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {cameras.map((cam) => {
                const isSelected = selectedCam?.id === cam.id;
                return (
                  <button
                    key={cam.id}
                    type="button"
                    onClick={() => {
                      setSelectedCam(cam);
                      playSound('click');
                      triggerHaptic('light');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          cam.isOnline ? 'bg-emerald-400' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-[10px] font-mono text-slate-400">{cam.resolution.split(' ')[0]}</span>
                    </div>
                    <div className="text-xs font-bold text-white truncate">{cam.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{cam.location}</div>
                    {cam.hasMotion && (
                      <span className="mt-1.5 inline-block text-[9px] font-semibold text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                        Movimiento
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal: Add New Camera */}
        {showAddModal && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Vincular Nueva Cámara</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCamera} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300">Nombre de la cámara</label>
                  <input
                    type="text"
                    required
                    value={newCamName}
                    onChange={(e) => setNewCamName(e.target.value)}
                    placeholder="Ej. Puerta Balcón"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300">Ubicación</label>
                  <select
                    value={newCamLocation}
                    onChange={(e) => setNewCamLocation(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="Exterior Delantero">Exterior Delantero</option>
                    <option value="Exterior Trasero">Exterior Trasero</option>
                    <option value="Interior Sala">Interior Sala</option>
                    <option value="Pasillo">Pasillo</option>
                    <option value="Garaje">Garaje</option>
                  </select>
                </div>

                <div className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl text-[11px] text-cyan-200">
                  El protocolo POU PROTECT detectará el feed RTSP / Wi-Fi automáticamente.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
                  >
                    Vincular Cámara
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
