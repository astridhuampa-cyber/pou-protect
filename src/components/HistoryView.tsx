import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  History,
  Filter,
  Search,
  AlertTriangle,
  Lock,
  Video,
  Package,
  Dog,
  ShieldCheck,
  Calendar,
  Download,
  Trash2,
} from 'lucide-react';
import { SecurityEvent } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface HistoryViewProps {
  events: SecurityEvent[];
  onClearHistory?: () => void;
  accessibilitySpeechEnabled?: boolean;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  events,
  onClearHistory,
  accessibilitySpeechEnabled = true,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterCategories = [
    { id: 'all', label: 'Todos' },
    { id: 'alert', label: 'Alertas SOS' },
    { id: 'access', label: 'Accesos' },
    { id: 'camera', label: 'Cámaras' },
    { id: 'delivery', label: 'Entregas' },
    { id: 'pet', label: 'Mascotas' },
    { id: 'system', label: 'Sistema' },
  ];

  const filteredEvents = events.filter((ev) => {
    const matchesType = filterType === 'all' || ev.type === filterType;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'access':
        return <Lock className="w-4 h-4 text-emerald-400" />;
      case 'camera':
        return <Video className="w-4 h-4 text-cyan-400" />;
      case 'delivery':
        return <Package className="w-4 h-4 text-amber-400" />;
      case 'pet':
        return <Dog className="w-4 h-4 text-violet-400" />;
      default:
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-600/30 text-red-400 border border-red-500/40">CRÍTICO</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40">AVISO</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400">INFO</span>;
    }
  };

  const handleExport = () => {
    playSound('click');
    triggerHaptic('light');
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pou_protect_historial_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (accessibilitySpeechEnabled) {
      speakText('Historial de eventos de seguridad descargado.');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            HISTORIAL DE EVENTOS
          </h2>
          <p className="text-xs text-slate-400">Registro cronológico de seguridad y accesos</p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por evento, ubicación o descripción..."
            className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        {/* Filter chips scrollable */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setFilterType(cat.id);
                playSound('click');
                triggerHaptic('light');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterType === cat.id
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline of events */}
      <div className="space-y-2.5">
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
            <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm font-semibold text-slate-300">No hay eventos en este filtro</p>
            <p className="text-xs text-slate-500">Todos los eventos y accesos se registrarán aquí.</p>
          </div>
        ) : (
          filteredEvents.map((ev) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-slate-900/90 border border-slate-800/90 hover:border-cyan-500/40 rounded-2xl transition-all shadow-md flex items-start gap-3"
            >
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                {getEventIcon(ev.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-white truncate">{ev.title}</h4>
                  {getSeverityBadge(ev.severity)}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>{ev.location || 'Ubicación registrada'}</span>
                  <span>{ev.timestamp}</span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
