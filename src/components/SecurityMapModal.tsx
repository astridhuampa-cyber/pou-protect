import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Share2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Users,
  Compass,
  X,
  Battery,
  Layers,
  Info,
} from 'lucide-react';
import { SafetyZone, EmergencyContact } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface SecurityMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  zones: SafetyZone[];
  contacts: EmergencyContact[];
  isSharingLocation: boolean;
  sharingDurationMinutes: number;
  onUpdateSharing: (isSharing: boolean, durationMinutes: number) => void;
  accessibilitySpeechEnabled?: boolean;
}

export const SecurityMapModal: React.FC<SecurityMapModalProps> = ({
  isOpen,
  onClose,
  zones,
  contacts,
  isSharingLocation,
  sharingDurationMinutes,
  onUpdateSharing,
  accessibilitySpeechEnabled = true,
}) => {
  const [selectedDuration, setSelectedDuration] = useState<number>(sharingDurationMinutes || 60);
  const [selectedZone, setSelectedZone] = useState<SafetyZone | null>(null);
  const [filterZoneType, setFilterZoneType] = useState<'all' | 'safe' | 'precaution' | 'alert'>('all');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number }>({
    lat: 40.4168,
    lng: -3.7038,
  });
  const [gpsAccuracy, setGpsAccuracy] = useState<number>(12);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  // Request actual geolocation
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLoadingGPS(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
          setGpsAccuracy(Math.round(pos.coords.accuracy));
          setIsLoadingGPS(false);
        },
        () => {
          // Keep reliable fallback coordinates
          setIsLoadingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, [isOpen]);

  const handleToggleSharing = () => {
    playSound('click');
    triggerHaptic('medium');
    const newState = !isSharingLocation;
    onUpdateSharing(newState, selectedDuration);

    if (accessibilitySpeechEnabled) {
      if (newState) {
        speakText(`Compartiendo tu ubicación con tu círculo durante ${selectedDuration} minutos.`);
      } else {
        speakText('Has dejado de compartir tu ubicación. Tu posición ahora es privada.');
      }
    }
  };

  const filteredZones = zones.filter((z) => (filterZoneType === 'all' ? true : z.type === filterZoneType));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col h-[90vh] max-h-[750px] overflow-hidden text-slate-100 relative"
        role="dialog"
        aria-label="Mapa de seguridad y ubicación"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-600/30 border border-blue-400/40 text-cyan-300">
              <Compass className="w-5 h-5 text-cyan-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">MAPA DE SEGURIDAD</h2>
              <p className="text-xs text-slate-400">Geolocalización & Zonas Verificadas</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            aria-label="Cerrar mapa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Sharing Status Bar */}
        <div
          className={`px-4 py-2.5 flex items-center justify-between text-xs border-b transition-colors ${
            isSharingLocation
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-slate-900/80 border-slate-800 text-slate-400'
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSharingLocation ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'
              }`}
            />
            <span className="font-semibold">
              {isSharingLocation ? 'Compartiendo ubicación en tiempo real' : 'Ubicación privada (No compartida)'}
            </span>
          </div>
          {isSharingLocation && (
            <span className="font-mono text-[11px] text-emerald-300">
              Vigencia: {selectedDuration}m
            </span>
          )}
        </div>

        {/* Interactive Tactical Map Stage */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden select-none">
          {/* Cyber grid background */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                'radial-gradient(#0284C7 1px, transparent 1px), linear-gradient(to right, #0F172A 1px, transparent 1px), linear-gradient(to bottom, #0F172A 1px, transparent 1px)',
              backgroundSize: '24px 24px, 48px 48px, 48px 48px',
            }}
          />

          {/* Tactical SVG Map layer */}
          <svg className="w-full h-full" viewBox="0 0 500 350" preserveAspectRatio="xMidYMid slice">
            <defs>
              <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#0284C7" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Radar scan concentric rings */}
            <circle cx="250" cy="175" r="50" fill="none" stroke="#0284C7" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            <circle cx="250" cy="175" r="110" fill="none" stroke="#0284C7" strokeWidth="1" strokeDasharray="4 4" opacity="0.3" />
            <circle cx="250" cy="175" r="170" fill="none" stroke="#0284C7" strokeWidth="1" strokeDasharray="4 4" opacity="0.2" />

            {/* Roads & City Grid Lines (simulated vector roads) */}
            <path d="M40 80 Q200 120 460 70" stroke="#1E293B" strokeWidth="6" fill="none" />
            <path d="M80 300 Q260 220 420 290" stroke="#1E293B" strokeWidth="7" fill="none" />
            <path d="M120 30 L180 320" stroke="#1E293B" strokeWidth="5" fill="none" />
            <path d="M340 30 L310 320" stroke="#1E293B" strokeWidth="5" fill="none" />
            <path d="M250 20 L250 330" stroke="#0369A1" strokeWidth="2" strokeDasharray="6 4" opacity="0.5" fill="none" />

            {/* Safety Zones */}
            {filteredZones.map((zone) => {
              // Simulated map placements
              const coordsMap: Record<string, { cx: number; cy: number; color: string; r: number }> = {
                sz1: { cx: 160, cy: 110, color: '#10B981', r: 38 }, // Safe Zone
                sz2: { cx: 370, cy: 130, color: '#F59E0B', r: 32 }, // Precaution
                sz3: { cx: 130, cy: 250, color: '#EF4444', r: 28 }, // Alert
              };
              const pos = coordsMap[zone.id] || { cx: 200, cy: 200, color: '#38BDF8', r: 30 };

              return (
                <g
                  key={zone.id}
                  className="cursor-pointer transition-transform hover:scale-105"
                  onClick={() => {
                    setSelectedZone(zone);
                    playSound('click');
                    triggerHaptic('light');
                  }}
                >
                  <circle
                    cx={pos.cx}
                    cy={pos.cy}
                    r={pos.r}
                    fill={pos.color}
                    fillOpacity="0.2"
                    stroke={pos.color}
                    strokeWidth="2"
                    strokeDasharray={zone.type === 'precaution' ? '4 2' : undefined}
                  />
                  <circle cx={pos.cx} cy={pos.cy} r="6" fill={pos.color} />
                  <text
                    x={pos.cx}
                    y={pos.cy + pos.r + 14}
                    textAnchor="middle"
                    fill="#E2E8F0"
                    fontSize="11"
                    fontFamily="monospace"
                    className="font-bold drop-shadow-md"
                  >
                    {zone.name.split(' ')[0]} {zone.name.split(' ')[1] || ''}
                  </text>
                </g>
              );
            })}

            {/* Trusted Contacts on Map */}
            {/* Contact 1: Mamá */}
            <g transform="translate(340, 220)" className="cursor-pointer">
              <circle cx="0" cy="0" r="14" fill="#DB2777" fillOpacity="0.3" stroke="#F472B6" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="6" fill="#F472B6" />
              <text x="0" y="22" textAnchor="middle" fill="#FBCFE8" fontSize="10" className="font-semibold">
                Mamá (1.2 km)
              </text>
            </g>

            {/* Contact 2: Carlos */}
            <g transform="translate(190, 70)" className="cursor-pointer">
              <circle cx="0" cy="0" r="14" fill="#2563EB" fillOpacity="0.3" stroke="#60A5FA" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="6" fill="#60A5FA" />
              <text x="0" y="-12" textAnchor="middle" fill="#BFDBFE" fontSize="10" className="font-semibold">
                Carlos (3.8 km)
              </text>
            </g>

            {/* User Location Center Marker */}
            <g transform="translate(250, 175)">
              <circle cx="0" cy="0" r="28" fill="url(#radarScan)" />
              <circle cx="0" cy="0" r="18" fill="none" stroke="#00E5FF" strokeWidth="1.5" className="animate-ping" />
              <circle cx="0" cy="0" r="9" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="2.5" />
              <text x="0" y="-14" textAnchor="middle" fill="#00E5FF" fontSize="11" className="font-bold tracking-wider">
                TÚ (AQUÍ)
              </text>
            </g>
          </svg>

          {/* Map Controls Floating Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Filter Chips */}
            <div className="flex gap-1 pointer-events-auto bg-slate-900/90 p-1 rounded-xl border border-cyan-500/30 backdrop-blur-md">
              {(['all', 'safe', 'precaution', 'alert'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterZoneType(type)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all ${
                    filterZoneType === type
                      ? 'bg-cyan-500 text-black shadow'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {type === 'all' ? 'Todas' : type === 'safe' ? 'Seguras' : type === 'precaution' ? 'Precaución' : 'Alerta'}
                </button>
              ))}
            </div>

            {/* GPS Accuracy Chip */}
            <div className="pointer-events-auto px-2.5 py-1 bg-slate-900/90 border border-cyan-500/30 rounded-xl text-[10px] font-mono text-cyan-300 flex items-center gap-1.5 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>±{gpsAccuracy}m GPS</span>
            </div>
          </div>

          {/* Zone Detail Card Popup if selected */}
          {selectedZone && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-3 left-3 right-3 p-3.5 bg-slate-900/95 border border-cyan-500/50 rounded-2xl shadow-xl backdrop-blur-md z-20 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedZone.type === 'safe' ? (
                    <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <ShieldCheck className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      <AlertTriangle className="w-4 h-4" />
                    </span>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-white">{selectedZone.name}</h4>
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        selectedZone.type === 'safe'
                          ? 'text-emerald-400'
                          : selectedZone.type === 'precaution'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }`}
                    >
                      Zona {selectedZone.type === 'safe' ? 'Segura' : selectedZone.type === 'precaution' ? 'de Precaución' : 'de Alerta'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedZone(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedZone.description}</p>

              <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 font-mono pt-1 border-t border-slate-800">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Fuente verificada: {selectedZone.verifiedSource}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Location Sharing Controls Drawer */}
        <div className="p-4 bg-slate-900 border-t border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                Compartir Ubicación Voluntaria
              </label>
              <p className="text-[11px] text-slate-400">
                Visible únicamente para los contactos autorizados en tu POU Circle.
              </p>
            </div>

            {/* Time Duration selector pills */}
            <div className="flex gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[
                { label: '15m', mins: 15 },
                { label: '1h', mins: 60 },
                { label: '8h', mins: 480 },
              ].map((item) => (
                <button
                  key={item.mins}
                  type="button"
                  onClick={() => setSelectedDuration(item.mins)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                    selectedDuration === item.mins
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-1 flex gap-2">
            <button
              type="button"
              onClick={handleToggleSharing}
              className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg ${
                isSharingLocation
                  ? 'bg-slate-800 hover:bg-red-950/80 text-red-300 border border-red-500/40'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]'
              }`}
            >
              <Share2 className="w-4 h-4" />
              {isSharingLocation ? 'DEJAR DE COMPARTIR UBICACIÓN' : `COMPARTIR UBICACIÓN (${selectedDuration} MIN)`}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
