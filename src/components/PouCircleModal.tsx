import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  UserPlus,
  Shield,
  MapPin,
  AlertTriangle,
  CheckCircle,
  X,
  Phone,
  Settings2,
  Trash2,
} from 'lucide-react';
import { EmergencyContact } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface PouCircleModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: EmergencyContact[];
  onUpdateContacts: (contacts: EmergencyContact[]) => void;
  accessibilitySpeechEnabled?: boolean;
}

export const PouCircleModal: React.FC<PouCircleModalProps> = ({
  isOpen,
  onClose,
  contacts,
  onUpdateContacts,
  accessibilitySpeechEnabled = true,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('Familiar');
  const [canViewLocation, setCanViewLocation] = useState(true);
  const [receiveSOS, setReceiveSOS] = useState(true);

  const handleTogglePermission = (id: string, field: 'canViewLocation' | 'receiveSOS' | 'isPriority') => {
    playSound('click');
    triggerHaptic('light');
    const updated = contacts.map((c) => (c.id === id ? { ...c, [field]: !c[field] } : c));
    onUpdateContacts(updated);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const newContact: EmergencyContact = {
      id: `c-${Date.now()}`,
      name,
      phone,
      relation,
      isPriority: false,
      canViewLocation,
      receiveSOS,
      avatarColor: 'from-violet-600 to-indigo-700',
    };

    onUpdateContacts([...contacts, newContact]);
    setShowAddModal(false);
    setName('');
    setPhone('');
    playSound('success');
    triggerHaptic('medium');

    if (accessibilitySpeechEnabled) {
      speakText(`${newContact.name} ha sido agregado a tu POU Circle de confianza.`);
    }
  };

  const handleDeleteMember = (id: string, contactName: string) => {
    if (window.confirm(`¿Deseas remover a ${contactName} de tu POU Circle?`)) {
      playSound('click');
      triggerHaptic('medium');
      const updated = contacts.filter((c) => c.id !== id);
      onUpdateContacts(updated);
      if (accessibilitySpeechEnabled) {
        speakText(`${contactName} removido del círculo.`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.2)] flex flex-col h-[90vh] max-h-[750px] overflow-hidden text-slate-100 relative"
        role="dialog"
        aria-label="Círculo de Confianza POU Circle"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-violet-600/30 border border-violet-400/40 text-violet-300">
              <Users className="w-5 h-5 text-violet-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">POU CIRCLE</h2>
              <p className="text-xs text-slate-400">Red Familiar & Contactos de Emergencia</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Agregar
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Cerrar círculo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Informational banner */}
        <div className="p-3 bg-violet-950/40 border-b border-violet-500/20 text-xs text-violet-200 flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400 shrink-0" />
          <span>
            Controla quién puede ver tu ubicación y quién recibe notificaciones inmediatas de SOS.
          </span>
        </div>

        {/* Contacts List */}
        <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-500/20">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-violet-500/40 rounded-2xl space-y-3 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${contact.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}
                  >
                    {contact.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{contact.name}</span>
                      {contact.isPriority && (
                        <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-semibold rounded">
                          PRIORIDAD
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{contact.relation}</span>
                      <span>•</span>
                      <span className="font-mono">{contact.phone}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteMember(contact.id, contact.name)}
                  className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  title="Eliminar del círculo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Granular Permission Toggles */}
              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTogglePermission(contact.id, 'canViewLocation')}
                  className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                    contact.canViewLocation
                      ? 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Ver Ubicación</span>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      contact.canViewLocation ? 'bg-blue-400' : 'bg-slate-600'
                    }`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePermission(contact.id, 'receiveSOS')}
                  className={`p-2 rounded-xl text-left border flex items-center justify-between transition-all ${
                    contact.receiveSOS
                      ? 'bg-red-950/40 border-red-500/40 text-red-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Recibir SOS</span>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      contact.receiveSOS ? 'bg-red-400' : 'bg-slate-600'
                    }`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal: Add Member */}
        {showAddModal && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-violet-500/40 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Nuevo Miembro POU Circle</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300">Nombre completo o apodo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Papá (Roberto)"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300">Teléfono móvil</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300">Parentesco / Relación</label>
                  <select
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-400"
                  >
                    <option value="Familiar directo">Familiar directo</option>
                    <option value="Hijo/a">Hijo/a</option>
                    <option value="Hermano/a">Hermano/a</option>
                    <option value="Pareja">Pareja</option>
                    <option value="Amigo/a de confianza">Amigo/a de confianza</option>
                    <option value="Vecino/a">Vecino/a</option>
                  </select>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={canViewLocation}
                      onChange={(e) => setCanViewLocation(e.target.checked)}
                      className="rounded accent-violet-500"
                    />
                    <span>Permitir ver mi ubicación voluntaria</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={receiveSOS}
                      onChange={(e) => setReceiveSOS(e.target.checked)}
                      className="rounded accent-red-500"
                    />
                    <span>Recibir avisos de alerta SOS inmediata</span>
                  </label>
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
                    className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold"
                  >
                    Guardar Miembro
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
