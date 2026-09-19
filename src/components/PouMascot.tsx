import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { playSound, triggerHaptic } from '../utils/accessibility';

interface PouMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  state?: 'idle' | 'speaking' | 'alert' | 'listening' | 'happy';
  showSpeechBubble?: boolean;
  speechText?: string;
  onClick?: () => void;
  className?: string;
  interactive?: boolean;
}

export const PouMascot: React.FC<PouMascotProps> = ({
  size = 'md',
  state = 'idle',
  showSpeechBubble = false,
  speechText = '¡Todo seguro por aquí!',
  onClick,
  className = '',
  interactive = true,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [internalSpeaking, setInternalSpeaking] = useState(state === 'speaking');

  // Random natural eye blink loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 4200 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  useEffect(() => {
    setInternalSpeaking(state === 'speaking');
  }, [state]);

  const sizePixels = {
    sm: 70,
    md: 110,
    lg: 150,
    xl: 200,
  }[size];

  const handlePouClick = () => {
    playSound('chirp');
    triggerHaptic('light');
    if (onClick) onClick();
  };

  const isAlert = state === 'alert';
  const isListening = state === 'listening';

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble if active */}
      {showSpeechBubble && speechText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mb-2 max-w-[220px] px-3 py-2 bg-slate-900/95 border border-cyan-500/50 rounded-2xl shadow-[0_0_15px_rgba(6,182,212,0.3)] text-center text-xs text-cyan-200 font-medium relative backdrop-blur-md z-10"
        >
          {speechText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-cyan-500/50 rotate-45" />
        </motion.div>
      )}

      {/* Mascot Graphic */}
      <motion.div
        whileHover={interactive ? { scale: 1.05 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        onClick={interactive ? handlePouClick : undefined}
        className={`relative cursor-pointer transition-transform ${isAlert ? 'animate-pulse' : ''}`}
        style={{ width: sizePixels, height: sizePixels * 1.08 }}
        title="Agente POU - Protector de Seguridad"
        role="img"
        aria-label="Agente Pou con uniforme de seguridad y radio"
      >
        {/* Soft neon aura glow */}
        <div
          className={`absolute inset-0 rounded-full blur-xl opacity-60 transition-colors duration-500 ${
            isAlert
              ? 'bg-red-500/40'
              : isListening
              ? 'bg-cyan-400/35'
              : 'bg-blue-500/25'
          }`}
        />

        <svg
          viewBox="0 0 200 216"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]"
        >
          <defs>
            {/* Pou classic skin gradient */}
            <radialGradient id="pouSkin" cx="45%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#E2CA9D" />
              <stop offset="60%" stopColor="#C4A36E" />
              <stop offset="100%" stopColor="#9B7745" />
            </radialGradient>

            {/* Security cap gradient */}
            <linearGradient id="capGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="60%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Gold badge gradient */}
            <linearGradient id="goldBadge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#A16207" />
            </linearGradient>

            {/* Uniform gradient */}
            <linearGradient id="uniformGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" />
              <stop offset="70%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Neon Cyan Line */}
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Pou Body (Rounded Triangular Pear Shape) */}
          {/* Path starts from top rounded curve, goes down wide to bottom cheeks */}
          <path
            d="M100 48
               C145 48, 172 105, 175 152
               C178 184, 155 204, 100 204
               C45 204, 22 184, 25 152
               C28 105, 55 48, 100 48 Z"
            fill="url(#pouSkin)"
          />

          {/* Subtle skin shadow bottom */}
          <path
            d="M34 165 C60 198, 140 198, 166 165 C150 198, 50 198, 34 165 Z"
            fill="#7C5D30"
            opacity="0.35"
          />

          {/* 2. Security Uniform Vest / Jacket */}
          <path
            d="M38 140
               C36 168, 48 198, 100 198
               C152 198, 164 168, 162 140
               C140 152, 115 156, 100 156
               C85 156, 60 152, 38 140 Z"
            fill="url(#uniformGradient)"
          />

          {/* Uniform Collar / Lapels */}
          <path
            d="M75 142 L100 170 L86 195 L50 185 Z"
            fill="#0F172A"
            stroke="#0284C7"
            strokeWidth="1.5"
          />
          <path
            d="M125 142 L100 170 L114 195 L150 185 Z"
            fill="#0F172A"
            stroke="#0284C7"
            strokeWidth="1.5"
          />

          {/* Golden Shield Security Badge on Chest */}
          <path
            d="M100 172 L108 178 L105 189 L100 194 L95 189 L92 178 Z"
            fill="url(#goldBadge)"
            stroke="#FDE047"
            strokeWidth="1"
          />
          {/* Star on Badge */}
          <polygon
            points="100,177 101.5,181 106,181 102.5,183.5 104,188 100,185 96,188 97.5,183.5 94,181 98.5,181"
            fill="#78350F"
          />

          {/* Shoulder Epaulettes with Cyan Stripes */}
          <rect x="36" y="142" width="18" height="6" rx="2" fill="#0284C7" transform="rotate(-15 36 142)" />
          <rect x="146" y="138" width="18" height="6" rx="2" fill="#0284C7" transform="rotate(15 146 138)" />

          {/* 3. Security Radio / Walkie-Talkie on Shoulder */}
          <g transform="translate(152, 115)">
            {/* Antenna */}
            <line x1="16" y1="0" x2="16" y2="14" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="16" cy="1" r="1.5" fill="#EF4444" className={isAlert ? 'animate-ping' : ''} />
            {/* Radio Body */}
            <rect x="8" y="14" width="16" height="26" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
            {/* Speaker Grille */}
            <line x1="11" y1="20" x2="21" y2="20" stroke="#64748B" strokeWidth="1.2" />
            <line x1="11" y1="24" x2="21" y2="24" stroke="#64748B" strokeWidth="1.2" />
            <line x1="11" y1="28" x2="21" y2="28" stroke="#64748B" strokeWidth="1.2" />
            {/* LED Status light */}
            <circle cx="12" cy="17" r="1.5" fill={isAlert ? '#EF4444' : '#10B981'} />
          </g>

          {/* 4. Pou Big Expressive Eyes */}
          {/* Left Eye */}
          <ellipse cx="74" cy="108" rx="19" ry="22" fill="#FFFFFF" stroke="#261A0C" strokeWidth="3" />
          {/* Right Eye */}
          <ellipse cx="126" cy="108" rx="19" ry="22" fill="#FFFFFF" stroke="#261A0C" strokeWidth="3" />

          {/* Eye Pupils / Blink */}
          {!isBlinking ? (
            <>
              {/* Left Pupil */}
              <circle cx={isAlert ? "76" : "75"} cy="110" r="11" fill="#181109" />
              <circle cx="72" cy="106" r="4.5" fill="#FFFFFF" />
              <circle cx="78" cy="113" r="2" fill="#FFFFFF" opacity="0.8" />

              {/* Right Pupil */}
              <circle cx={isAlert ? "124" : "125"} cy="110" r="11" fill="#181109" />
              <circle cx="122" cy="106" r="4.5" fill="#FFFFFF" />
              <circle cx="128" cy="113" r="2" fill="#FFFFFF" opacity="0.8" />
            </>
          ) : (
            // Blinking closed eye line
            <>
              <path d="M58 110 Q74 116 90 110" stroke="#261A0C" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M110 110 Q126 116 142 110" stroke="#261A0C" strokeWidth="4" strokeLinecap="round" fill="none" />
            </>
          )}

          {/* Cute subtle Cheeks */}
          <ellipse cx="52" cy="126" rx="9" ry="6" fill="#F43F5E" opacity="0.25" />
          <ellipse cx="148" cy="126" rx="9" ry="6" fill="#F43F5E" opacity="0.25" />

          {/* 5. Mouth */}
          {internalSpeaking ? (
            // Speaking open mouth
            <ellipse cx="100" cy="138" rx="10" ry="8" fill="#5A1A1A" stroke="#261A0C" strokeWidth="2.5" />
          ) : isAlert ? (
            // Alert cautious mouth
            <ellipse cx="100" cy="138" rx="6" ry="6" fill="#261A0C" />
          ) : (
            // Friendly slight smile
            <path
              d="M88 134 Q100 144 112 134"
              stroke="#261A0C"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* 6. Security Police Cap (Gorra con Visera y Escudo) */}
          {/* Cap Base / Visor */}
          <path
            d="M48 62 C58 45, 142 45, 152 62 C158 72, 138 78, 100 78 C62 78, 42 72, 48 62 Z"
            fill="#020617"
          />
          {/* Visor shine */}
          <path
            d="M58 64 C75 58, 125 58, 142 64 C130 68, 70 68, 58 64 Z"
            fill="#38BDF8"
            opacity="0.3"
          />

          {/* Cap Crown / Top Dome */}
          <path
            d="M54 58
               C52 24, 80 14, 100 14
               C120 14, 148 24, 146 58
               Z"
            fill="url(#capGradient)"
            stroke="#0F172A"
            strokeWidth="2"
          />

          {/* Cyan Neon Band around Cap */}
          <path
            d="M52 56 C70 50, 130 50, 148 56 L148 62 C130 56, 70 56, 52 62 Z"
            fill="#0284C7"
            filter="url(#neonGlow)"
          />

          {/* Golden Badge on Cap Center */}
          <g transform="translate(90, 24)">
            <path
              d="M10 0 L18 6 L15 17 L10 21 L5 17 L2 6 Z"
              fill="url(#goldBadge)"
              stroke="#FEF08A"
              strokeWidth="1.2"
            />
            {/* Inner Star */}
            <polygon
              points="10,4 11.5,8 15.5,8 12.5,10.5 13.5,14.5 10,12 6.5,14.5 7.5,10.5 4.5,8 8.5,8"
              fill="#78350F"
            />
          </g>
        </svg>

        {/* Small live badge tag */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-900/90 border border-cyan-500/40 rounded-full text-[9px] font-mono tracking-widest text-cyan-300 shadow-sm flex items-center gap-1 whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full ${isAlert ? 'bg-red-500 animate-ping' : 'bg-emerald-400'}`} />
          POU AGENTE
        </div>
      </motion.div>
    </div>
  );
};
