import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Dog,
  Cat,
  Battery,
  ShieldCheck,
  AlertCircle,
  Bell,
  Plus,
  X,
  Volume2,
  Calendar,
  Check,
} from 'lucide-react';
import { PetProfile } from '../types';
import { playSound, triggerHaptic, speakText } from '../utils/accessibility';

interface PouPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: PetProfile[];
  onAddPet: (pet: PetProfile) => void;
  onToggleReminder: (petId: string, reminderId: string) => void;
  accessibilitySpeechEnabled?: boolean;
}

export const PouPetModal: React.FC<PouPetModalProps> = ({
  isOpen,
  onClose,
  pets,
  onAddPet,
  onToggleReminder,
  accessibilitySpeechEnabled = true,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'Perro' | 'Gato' | 'Otro'>('Perro');
  const [breed, setBreed] = useState('');

  const handleCreatePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newPet: PetProfile = {
      id: `pet-${Date.now()}`,
      name,
      type,
      breed: breed || (type === 'Perro' ? 'Mestizo' : 'Común'),
      collarBattery: 100,
      isInsideSafeZone: true,
      lastActivity: 'En casa, reposando',
      reminders: [
        { id: `r-${Date.now()}`, title: 'Chequeo veterinario general', date: 'Próximo mes', completed: false },
      ],
    };

    onAddPet(newPet);
    setShowAddModal(false);
    setName('');
    setBreed('');
    playSound('success');
    triggerHaptic('medium');

    if (accessibilitySpeechEnabled) {
      speakText(`Mascota ${newPet.name} registrada con collar GPS de seguridad.`);
    }
  };

  const handleRingCollar = (petName: string) => {
    playSound('chirp');
    triggerHaptic('light');
    alert(`Emitiendo pitido en el collar de ${petName} para localizarlo.`);
    if (accessibilitySpeechEnabled) {
      speakText(`Haciendo sonar el collar de ${petName}.`);
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
        aria-label="Seguridad de mascotas POU Pet"
      >
        {/* Header */}
        <div className="p-4 bg-slate-900/90 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-600/30 border border-emerald-400/40 text-emerald-300">
              <Dog className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">POU PET</h2>
              <p className="text-xs text-slate-400">Protección & Geovalla para Mascotas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Mascota
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              aria-label="Cerrar mascotas"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pets list */}
        <div className="p-4 space-y-3.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-500/20">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 space-y-3 transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-md">
                    {pet.type === 'Gato' ? <Cat className="w-6 h-6" /> : <Dog className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{pet.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {pet.breed}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{pet.lastActivity}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRingCollar(pet.name)}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors"
                  title="Hacer sonar collar GPS"
                  aria-label={`Hacer sonar collar de ${pet.name}`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Status bar */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
                <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Batería Collar:</span>
                  <span className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5" />
                    {pet.collarBattery}%
                  </span>
                </div>

                <div className="p-2 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Perímetro:</span>
                  <span
                    className={`font-semibold ${
                      pet.isInsideSafeZone ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {pet.isInsideSafeZone ? 'En Zona Segura' : '¡Fuera de Casa!'}
                  </span>
                </div>
              </div>

              {/* Reminders section */}
              {pet.reminders.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    Recordatorios y Salud
                  </span>
                  {pet.reminders.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => onToggleReminder(pet.id, r.id)}
                      className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            r.completed
                              ? 'bg-emerald-500 border-emerald-400 text-black'
                              : 'border-slate-600'
                          }`}
                        >
                          {r.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </span>
                        <span className={r.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {r.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{r.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Modal: Add Pet */}
        {showAddModal && (
          <div className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/40 rounded-3xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Registrar Nueva Mascota</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePet} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300">Nombre de la mascota</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Bruno, Toby, Kira"
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300">Tipo de mascota</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="Perro">Perro</option>
                    <option value="Gato">Gato</option>
                    <option value="Otro">Otro animal de compañía</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-300">Raza o características</label>
                  <input
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    placeholder="Ej. Golden Retriever, Siames..."
                    className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
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
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs"
                  >
                    Guardar
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
