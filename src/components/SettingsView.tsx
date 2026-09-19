import React from 'react';
import { motion } from 'motion/react';
import {
  Settings,
  User,
  Eye,
  Volume2,
  Vibrate,
  Shield,
  Bell,
  Heart,
  HelpCircle,
  Sparkles,
  Check,
} from 'lucide-react';
import { UserProfile, AccessibilitySettings } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface SettingsViewProps {
  userProfile: UserProfile;
  accessibilitySettings: AccessibilitySettings;
  onUpdateProfile: (profile: UserProfile) => void;
  onUpdateAccessibility: (settings: AccessibilitySettings) => void;
  onOpenPouCircle: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userProfile,
  accessibilitySettings,
  onUpdateProfile,
  onUpdateAccessibility,
  onOpenPouCircle,
}) => {
  const toggleSetting = (key: keyof AccessibilitySettings) => {
    playSound('click');
    triggerHaptic('light');
    const updated = {
      ...accessibilitySettings,
      [key]: !accessibilitySettings[key],
    };
    onUpdateAccessibility(updated);

    if (updated.speechNarrationEnabled && key === 'speechNarrationEnabled') {
      speakText('Lectura de voz y accesibilidad auditiva activada.');
    } else if (key === 'highContrast') {
      speakText(updated.highContrast ? 'Modo alto contraste activado.' : 'Modo alto contraste desactivado.');
    } else if (key === 'largeText') {
      speakText(updated.largeText ? 'Texto grande activado.' : 'Texto grande desactivado.');
    }
  };

  const handleSpeechSpeed = (speed: number) => {
    playSound('click');
    onUpdateAccessibility({
      ...accessibilitySettings,
      speechSpeed: speed,
    });
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          AJUSTES & ACCESIBILIDAD
        </h2>
        <p className="text-xs text-slate-400">
          Personalización, perfil y herramientas de inclusión adaptadas a ti
        </p>
      </div>

      {/* User Profile Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl space-y-4 shadow-md">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
            {userProfile.name[0]}
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{userProfile.name}</h3>
            <p className="text-xs text-slate-400">{userProfile.phone}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono">
                Tipo: {userProfile.bloodType}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 border border-red-400/30 text-[10px]">
                {userProfile.allergies}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Edit Profile fields */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
          <div>
            <label className="text-[11px] text-slate-400">Dirección protegida</label>
            <input
              type="text"
              value={userProfile.address}
              onChange={(e) => onUpdateProfile({ ...userProfile, address: e.target.value })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-400">Condición médica / Notas de emergencia</label>
            <input
              type="text"
              value={userProfile.medicalNotes}
              onChange={(e) => onUpdateProfile({ ...userProfile, medicalNotes: e.target.value })}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* ACCESSIBILITY & INCLUSION SECTION */}
      <div className="p-4 bg-slate-900/90 border border-cyan-500/30 rounded-3xl space-y-4 shadow-lg">
        <div className="flex items-center gap-2.5 pb-2 border-b border-cyan-500/20">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <div>
            <h3 className="text-sm font-bold text-white">INCLUSIÓN & ACCESIBILIDAD</h3>
            <p className="text-[11px] text-slate-400">Diseñado para adultos mayores y personas con discapacidad</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Senior / Simplified Mode */}
          <div
            onClick={() => toggleSetting('simplifiedSeniorMode')}
            className="p-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-600/20 text-cyan-300">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Modo Adulto Mayor / Simplificado</h4>
                <p className="text-[11px] text-slate-400">Botones extra grandes y navegación más directa</p>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                accessibilitySettings.simplifiedSeniorMode ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  accessibilitySettings.simplifiedSeniorMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* High Contrast */}
          <div
            onClick={() => toggleSetting('highContrast')}
            className="p-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-600/20 text-amber-300">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Modo Alto Contraste</h4>
                <p className="text-[11px] text-slate-400">Fondo negro puro y bordes de alta visibilidad</p>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                accessibilitySettings.highContrast ? 'bg-amber-400' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black transition-transform ${
                  accessibilitySettings.highContrast ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Large Text */}
          <div
            onClick={() => toggleSetting('largeText')}
            className="p-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300">
                <span className="font-bold text-sm">Aa</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Texto Grande & Legible</h4>
                <p className="text-[11px] text-slate-400">Aumenta el tamaño tipográfico de toda la interfaz</p>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                accessibilitySettings.largeText ? 'bg-violet-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  accessibilitySettings.largeText ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Voice Narration / TTS */}
          <div
            onClick={() => toggleSetting('speechNarrationEnabled')}
            className="p-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-300">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Lectura de Pantalla POU por Voz</h4>
                <p className="text-[11px] text-slate-400">Narra en voz alta las alertas, estados y botones</p>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                accessibilitySettings.speechNarrationEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  accessibilitySettings.speechNarrationEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Haptic Vibration Feedback */}
          <div
            onClick={() => toggleSetting('hapticFeedbackEnabled')}
            className="p-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-600/20 text-cyan-300">
                <Vibrate className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Vibración & Respuesta Háptica</h4>
                <p className="text-[11px] text-slate-400">Confirmación táctil física al pulsar botones clave</p>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                accessibilitySettings.hapticFeedbackEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  accessibilitySettings.hapticFeedbackEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          {/* Visual Flash Alerts (for deaf/hard of hearing users) */}
          <div
            onClick={() => toggleSetting('visualFlashAlerts')}
            className="p-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-600/20 text-rose-300">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Destello Visual de Alertas</h4>
                <p className="text-[11px] text-slate-400">
                  Parpadeo de pantalla en emergencias para personas con discapacidad auditiva
                </p>
              </div>
            </div>
            <div
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                accessibilitySettings.visualFlashAlerts ? 'bg-rose-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  accessibilitySettings.visualFlashAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Circle & Privacy shortcut button */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-white">Administrar POU Circle</h4>
          <p className="text-[11px] text-slate-400">Contactos con permiso para recibir tu ubicación y SOS</p>
        </div>
        <button
          type="button"
          onClick={onOpenPouCircle}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold rounded-xl transition-colors border border-slate-700"
        >
          Gestionar
        </button>
      </div>
    </div>
  );
};
