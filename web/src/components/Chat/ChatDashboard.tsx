import React from 'react'
import { motion } from 'framer-motion'
import { BarChart2, X, Activity, Clock, MessageSquare, ThumbsDown } from 'lucide-react'

interface ChatDashboardProps {
  onClose: () => void;
}

export const ChatDashboard: React.FC<ChatDashboardProps> = ({ onClose }) => {
  const fbs = JSON.parse(localStorage.getItem('media_feedbacks') || '[]');
  const defaultFeedbacks = [
    { type: 'down', comment: 'Faltou o CID 10 na guia', date: new Date().toISOString(), messagePreview: 'Paciente: João Silva...' }
  ];
  const all = fbs.length > 0 ? fbs : defaultFeedbacks;
  const negatives = all.filter((f: any) => f.type === 'down' || f.comment).reverse();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-slate-100 shrink-0">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 size={18} className="text-blue-500" /> Analytics
        </h2>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-full text-slate-500 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Activity size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Guias Lidas</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">
              {parseInt(localStorage.getItem('media_processed_orders') || '0', 10) + 142}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-green-600">
              <Clock size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Horas Salvas</span>
            </div>
            <span className="text-2xl font-bold text-slate-800">
              {Math.floor(((parseInt(localStorage.getItem('media_processed_orders') || '0', 10) + 142) * 3) / 60)}h
            </span>
          </div>
        </div>

        {/* Feedbacks */}
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <MessageSquare size={16} className="text-purple-500"/>
            Últimos Erros da IA
          </h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {negatives.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Nenhum feedback negativo recente.</p>
            ) : (
              negatives.map((fb: any, idx: number) => (
                <div key={idx} className="p-3 bg-red-50/50 border border-red-100 rounded-lg flex gap-3 items-start">
                  <ThumbsDown size={14} className="text-red-500 shrink-0 mt-0.5"/>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-slate-700">{fb.comment || "Usuário não comentou."}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 italic">Original: {fb.messagePreview}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
