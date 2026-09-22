import React from 'react'
import { Calendar, CalendarCheck, CalendarDays, ExternalLink, CalendarClock, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface AgendasLocaisModalProps {
  isOpen: boolean
  onClose: () => void
}

const AGENDAS = [
  {
    id: 'agenda-arthromed',
    title: 'Agenda Arthromed',
    description: 'Agendamentos & Cirurgias (Rede Local)',
    url: 'http://192.168.100.117/arthromed/agenda.php',
    tag: 'Agendamento',
    icon: Calendar,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200/60',
    iconBgColor: 'bg-teal-50 border-teal-200 text-teal-600',
    hoverBgColor: 'hover:bg-teal-50/80',
    hoverBorderColor: 'hover:border-teal-200',
  },
  {
    id: 'agenda-medicpa',
    title: 'Agenda Medic PA',
    description: 'Agendamentos & Cirurgias Medic PA (Rede Local)',
    url: 'http://192.168.100.117/medicpa/agenda.php',
    tag: 'Medicpa',
    icon: CalendarCheck,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200/60',
    iconBgColor: 'bg-purple-50 border-purple-200 text-purple-600',
    hoverBgColor: 'hover:bg-purple-50/80',
    hoverBorderColor: 'hover:border-purple-200',
  },
  {
    id: 'agenda-medicpe',
    title: 'Agenda Medic PE',
    description: 'Agendamentos & Cirurgias Medic PE (Rede Local)',
    url: 'http://192.168.100.117/medicpe/agenda.php',
    tag: 'Medicpe',
    icon: CalendarDays,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200/60',
    iconBgColor: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    hoverBgColor: 'hover:bg-indigo-50/80',
    hoverBorderColor: 'hover:border-indigo-200',
  },
]

export const AgendasLocaisModal: React.FC<AgendasLocaisModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shadow-inner border border-violet-200/50">
                <CalendarClock size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[17px] font-black text-slate-800 tracking-tight">Agendas Locais</h2>
                <p className="text-xs font-semibold text-slate-500">Sistemas de Agendamento da Rede</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          {/* List */}
          <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
            {AGENDAS.map(item => {
              const Icon = item.icon
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className={`w-full flex flex-col gap-2 p-4 rounded-2xl border border-slate-200 transition-all text-left cursor-pointer group bg-white shadow-xs hover:shadow-md ${item.hoverBgColor} ${item.hoverBorderColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${item.iconBgColor}`}>
                        <Icon size={18} strokeWidth={2.5} />
                      </div>
                      <h3 className="text-[15px] font-black text-slate-800 group-hover:text-slate-900 transition-colors">
                        {item.title}
                      </h3>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-lg font-extrabold flex items-center gap-1 shrink-0 ${item.badgeColor}`}>
                      {item.tag} <ExternalLink size={10} strokeWidth={3} />
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-slate-500 pl-[3.25rem]">
                    {item.description}
                  </p>
                </a>
              )
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
