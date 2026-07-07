import React from 'react'
import { motion } from 'framer-motion'
import { Bot, Zap, Shield, Clock, ArrowRight } from 'lucide-react'

interface ChatOnboardingProps {
  onStart: () => void;
}

export const ChatOnboarding: React.FC<ChatOnboardingProps> = ({ onStart }) => {
  return (
    <motion.div
      key="onboarding"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center p-6 sm:p-8 bg-white overflow-y-auto w-full"
    >
      <div className="w-full max-w-[380px] flex flex-col items-center justify-center min-h-full my-auto py-4">
        <div className="mb-8 flex justify-center w-full">
          <div className="w-24 h-24 bg-[#1a2332] rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Bot size={48} strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-[28px] font-bold text-[#1a2332] mb-2 tracking-tight">
            Bem-vindo ao MedIA
          </h2>
          <p className="text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Assistente Virtual Corporativo
          </p>
          <p className="text-sm text-slate-500 leading-relaxed max-w-[340px] mx-auto">
            Plataforma inteligente especializada em processos internos, gestão de materiais e suporte técnico para as equipes Arthromed e Medic.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 w-full mb-12 max-w-[380px]">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-slate-50 text-slate-600 p-3.5 rounded-full border border-slate-100"><Zap size={20} strokeWidth={1.5} /></div>
            <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">Respostas<br/>Rápidas</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="bg-slate-50 text-slate-600 p-3.5 rounded-full border border-slate-100"><Shield size={20} strokeWidth={1.5} /></div>
            <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">Seguro e<br/>Confiável</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="bg-slate-50 text-slate-600 p-3.5 rounded-full border border-slate-100"><Clock size={20} strokeWidth={1.5} /></div>
            <span className="text-[11px] font-semibold text-slate-600 text-center leading-tight">24/7<br/>Disponível</span>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full max-w-[380px] bg-[#1a2332] hover:bg-[#253043] text-white py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md shrink-0 cursor-pointer"
        >
          Iniciar Atendimento <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}
