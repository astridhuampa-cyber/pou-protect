import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Plus,
  X,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { DeliveryItem } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface PouDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  deliveries: DeliveryItem[];
  onConfirmDelivery: (id: string) => void;
  onAddDelivery: (item: DeliveryItem) => void;
  accessibilitySpeechEnabled?: boolean;
}

export const PouDeliveryModal: React.FC<PouDeliveryModalProps> = ({
  isOpen,
  onClose,
  deliveries,
  onConfirmDelivery,
  onAddDelivery,
  accessibilitySpeechEnabled = true,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [provider, setProvider] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [instructions, setInstructions] = useState('');
  const [arrivalEstimated, setArrivalEstimated] = useState('Hoy por la tarde');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider.trim()) return;

    const newItem: DeliveryItem = {
      id: `del-${Date.now()}`,
      provider,
      trackingNumber: trackingNumber || `TRACK-${Math.floor(100000 + Math.random() * 900000)}`,
      courier: 'Repartidor asignado',
      status: 'pending',
      arrivalEstimated,
      instructions: instructions || 'Dejar en portería o buzón POU Lock.',
      isPendingVerification: true,
    };

    onAddDelivery(newItem);
    setShowAddModal(false);
    setProvider('');
    setTrackingNumber('');
    setInstructions('');
    playSound('success');
    triggerHaptic('medium');

    if (accessibilitySpeechEnabled) {
      speakText(`Nuevo pedido de ${newItem.provider} registrado.`);
    }
  };

  const handleConfirm = (id: string, providerName: string) => {
    playSound('success');
    triggerHaptic('medium');
    onConfirmDelivery(id);
    if (accessibilitySpeechEnabled) {
      speakText(`Entrega de ${providerName} confirmada y guardada en historial.`);
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
        aria-label="Gestión de entregas POU Delivery"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-600/30 border border-amber-400/40 text-amber-300">
              <Package className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">POU DELIVERY</h2>
              <p className="text-xs text-slate-400">Recepción Segura de Paquetes</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Envío
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Cerrar delivery"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deliveries list */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-500/20">
          {deliveries.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border-2 space-y-3 transition-all ${
                item.status === 'delivered'
                  ? 'bg-slate-900/60 border-slate-800 opacity-80'
                  : item.status === 'in_transit'
                  ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      item.status === 'delivered'
                        ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
                        : item.status === 'in_transit'
                        ? 'bg-amber-500 text-black animate-pulse'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.status === 'delivered' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : item.status === 'in_transit' ? (
                      <Truck className="w-5 h-5" />
                    ) : (
                      <Package className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.provider}</h3>
                    <p className="text-[11px] font-mono text-slate-400">{item.trackingNumber}</p>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    item.status === 'delivered'
                      ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                      : item.status === 'in_transit'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                  }`}
                >
                  {item.status === 'delivered'
                    ? 'Entregado'
                    : item.status === 'in_transit'
                    ? 'En Camino'
                    : 'Pendiente'}
                </span>
              </div>

              {/* Arrival & courier details */}
              <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Estimado:
                  </span>
                  <span className="font-semibold">{item.arrivalEstimated}</span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-300 pt-1 border-t border-slate-800">
                  <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-300">{item.instructions}</span>
                </div>
              </div>

              {/* Confirm receipt button if not delivered yet */}
              {item.status !== 'delivered' && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleConfirm(item.id, item.provider)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Confirmar Recepción de Paquete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal: Add Delivery */}
        {showAddModal && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Registrar Nuevo Pedido</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300">Proveedor o Tienda</label>
                  <input
                    type="text"
                    required
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    placeholder="Ej. Amazon, MercadoLibre, IKEA"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300">Número de seguimiento (Opcional)</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ej. ES-89104820"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300">Fecha u horario estimado</label>
                  <input
                    type="text"
                    value={arrivalEstimated}
                    onChange={(e) => setArrivalEstimated(e.target.value)}
                    placeholder="Ej. Mañana antes de las 14:00"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300">Instrucciones de recepción segura</label>
                  <textarea
                    rows={2}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Ej. Dejar dentro del buzón POU Lock con código temporal #1234."
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
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
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-xs"
                  >
                    Guardar Pedido
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
