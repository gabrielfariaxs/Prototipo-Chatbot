import React from 'react'
import { motion } from 'framer-motion'
import { Bot, Layers, BookOpen, ArrowRight, ExternalLink, Sparkles, Stethoscope } from 'lucide-react'

interface ChatOnboardingProps {
  onStart: () => void;
  onOpenNoc?: () => void;
  onOpenPortfolio?: () => void;
  onOpenSolicitacaoMedica?: () => void;
}

export const ChatOnboarding: React.FC<ChatOnboardingProps> = ({ 
  onStart, 
  onOpenNoc, 
  onOpenPortfolio,
  onOpenSolicitacaoMedica
}) => {
  const handlePortfolioClick = () => {
    if (onOpenPortfolio) {
      onOpenPortfolio()
    } else {
      const portfolioUrl = localStorage.getItem('portfolio_url') || 'https://portifolioarthromed-medic.vercel.app'
      window.open(portfolioUrl, '_blank')
    }
  }

  return (
    <motion.div
      key="onboarding"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-[#f8fafc] overflow-y-auto w-full justify-center min-h-full"
    >
      <div className="w-full max-w-[960px] flex flex-col items-center justify-center my-auto py-6">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 bg-slate-200/60 text-slate-700 px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase mb-3 border border-slate-300/40">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Portal Corporativo
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a2332] tracking-tight mb-2">
            O que você deseja acessar?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-[460px] mx-auto leading-relaxed">
            Selecione um dos módulos abaixo para iniciar suas atividades ou consultar informações operacionais.
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 w-full max-w-[960px]">
          
          {/* Card 1: Chatbot (MedIA) */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 bg-[#1a2332] rounded-xl flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform">
                <Bot size={26} strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-bold text-blue-600 tracking-wider uppercase bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-md inline-block mb-2">
                Assistente Corp
              </span>
              <h3 className="text-lg font-bold text-[#1a2332] mb-1.5 group-hover:text-blue-600 transition-colors">
                Chatbot (MedIA)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Assistente inteligente para suporte em procedimentos internos, dúvidas operacionais e consulta de materiais.
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                onStart()
              }}
              className="w-full bg-[#1a2332] hover:bg-[#253043] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-auto"
            >
              <span>Acessar Chatbot</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Card 2: NOC / NCO */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenNoc}
            className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 bg-indigo-900 rounded-xl flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform">
                <Layers size={26} strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-bold text-indigo-600 tracking-wider uppercase bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md inline-block mb-2">
                Gestão Operacional
              </span>
              <h3 className="text-lg font-bold text-[#1a2332] mb-1.5 group-hover:text-indigo-600 transition-colors">
                NOC (NCO)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Módulo para registro, acompanhamento e tratativas de Não Conformidades Operacionais.
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onOpenNoc) onOpenNoc()
              }}
              className="w-full bg-indigo-950 hover:bg-indigo-900 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-auto"
            >
              <span>Acessar NOC</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Card 3: Portfólio */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePortfolioClick}
            className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform">
                <BookOpen size={26} strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-md inline-block mb-2">
                Catálogo Online
              </span>
              <h3 className="text-lg font-bold text-[#1a2332] mb-1.5 group-hover:text-emerald-700 transition-colors">
                Portfólio
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Catálogo completo de produtos, materiais ortopédicos e especificações corporativas.
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                handlePortfolioClick()
              }}
              className="w-full bg-emerald-900 hover:bg-emerald-950 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-auto"
            >
              <span>Abrir Portfólio</span>
              <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </motion.div>

          {/* Card 4: Solicitação Médica */}
          <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenSolicitacaoMedica}
            className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full pointer-events-none" />
            <div>
              <div className="w-12 h-12 bg-amber-900 rounded-xl flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform">
                <Stethoscope size={26} strokeWidth={1.75} />
              </div>
              <span className="text-[10px] font-bold text-amber-700 tracking-wider uppercase bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-md inline-block mb-2">
                Padrão CFM / ANS
              </span>
              <h3 className="text-lg font-bold text-[#1a2332] mb-1.5 group-hover:text-amber-700 transition-colors">
                Solicitação Médica
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Solicitações cirúrgicas, justificativas de OPME e recursos de negativa estruturados anti-glosa.
              </p>
            </div>
            
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (onOpenSolicitacaoMedica) onOpenSolicitacaoMedica()
              }}
              className="w-full bg-amber-900 hover:bg-amber-950 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer mt-auto"
            >
              <span>Acessar Módulo</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>

        </div>

      </div>
    </motion.div>
  )
}

