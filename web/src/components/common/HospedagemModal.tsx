import React from 'react'
import { Server, Mail, ExternalLink, HardDrive, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface HospedagemModalProps {
  isOpen: boolean
  onClose: () => void
}

const ITEMS = [
  {
    id: 'kinghost',
    title: 'Painel KingHost',
    description: 'Gerenciamento KingHost & Domínios',
    url: 'https://login.kinghost.com.br/?referrer=https:%2F%2Fpainel.kinghost.com.br%2Findex.php',
    tag: 'Hospedagem',
    icon: Server,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200/60',
    iconBgColor: 'bg-amber-50 border-amber-200 text-amber-600',
    hoverBgColor: 'hover:bg-amber-50/80',
    hoverBorderColor: 'hover:border-amber-200',
  },
  {
    id: 'locaweb',
    title: 'E-mail Locaweb',
    description: 'Painel de E-mail Corporativo',
    url: 'https://login-new.locaweb.com.br/login?service=https%3A%2F%2Fpainel-email.locaweb.com.br%2F',
    tag: 'Locaweb',
    icon: Mail,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200/60',
    iconBgColor: 'bg-rose-50 border-rose-200 text-rose-600',
    hoverBgColor: 'hover:bg-rose-50/80',
    hoverBorderColor: 'hover:border-rose-200',
  }
]

export const HospedagemModal: React.FC<HospedagemModalProps> = ({ isOpen, onClose }) => {
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
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner border border-orange-200/50">
                <HardDrive size={20} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[17px] font-black text-slate-800 tracking-tight">Hospedagem & Webmail</h2>
                <p className="text-xs font-semibold text-slate-500">Servidores, Domínios e E-mails Locais</p>
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
            {ITEMS.map(item => {
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
