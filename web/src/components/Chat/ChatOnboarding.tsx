import React from 'react'
import { motion } from 'framer-motion'
import { Bot, Layers, BookOpen, ArrowRight, ExternalLink, Stethoscope, Monitor } from 'lucide-react'
import { BrandLockup } from '../BrandLockup'

interface ChatOnboardingProps {
  onStart: () => void;
  onOpenNoc?: () => void;
  onOpenPortfolio?: () => void;
  onOpenSolicitacaoMedica?: () => void;
  onOpenChamadosTi?: () => void;
}

export const ChatOnboarding: React.FC<ChatOnboardingProps> = ({ 
  onStart, 
  onOpenNoc, 
  onOpenPortfolio,
  onOpenSolicitacaoMedica,
  onOpenChamadosTi
}) => {
  const handlePortfolioClick = () => {
    if (onOpenPortfolio) {
      onOpenPortfolio()
    } else {
      const portfolioUrl = localStorage.getItem('portfolio_url') || 'https://portifolioarthromed-medic.vercel.app'
      window.open(portfolioUrl, '_blank')
    }
  }

  const CARDS = [
    {
      id: 'chatbot',
      icon: <Bot size={22} strokeWidth={2} />,
      tag: 'Assistente',
      title: 'Chatbot (MedIA)',
      description: 'Suporte a procedimentos internos, dúvidas operacionais e consulta de materiais.',
      actionText: 'Acessar Chatbot',
      actionIcon: <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />,
      tagColor: 'text-[#1b497d] bg-[#eef4fa] border-[#b3c7e0]',
      hoverTitle: 'group-hover:text-[#1b497d]',
      btnBg: 'bg-[#1b497d] hover:bg-[#12345b]',
      action: onStart
    },
    {
      id: 'noc',
      icon: <Layers size={22} strokeWidth={2} />,
      tag: 'Operacional',
      title: 'NOC (NCO)',
      description: 'Registro, acompanhamento e tratativas de Não Conformidades Operacionais.',
      actionText: 'Acessar NOC',
      actionIcon: <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />,
      tagColor: 'text-[#1b497d] bg-[#1b497d]/10 border-[#1b497d]/30',
      hoverTitle: 'group-hover:text-[#1b497d]',
      btnBg: 'bg-[#1b497d] hover:bg-[#12345b]',
      action: () => { if (onOpenNoc) onOpenNoc() }
    },
    {
      id: 'portfolio',
      icon: <BookOpen size={22} strokeWidth={2} />,
      tag: 'Catálogo',
      title: 'Portfólio de Produtos',
      description: 'Catálogo completo de produtos, materiais ortopédicos e especificações.',
      actionText: 'Abrir Portfólio',
      actionIcon: <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />,
      tagColor: 'text-[#17a398] bg-[#17a398]/10 border-[#17a398]/30',
      hoverTitle: 'group-hover:text-[#17a398]',
      btnBg: 'bg-[#1b497d] hover:bg-[#12345b]',
      action: handlePortfolioClick
    },
    {
      id: 'solicitacao',
      icon: <Stethoscope size={22} strokeWidth={2} />,
      tag: 'CFM / ANS',
      title: 'Solicitação Médica',
      description: 'Solicitações cirúrgicas, justificativas OPME e recursos de negativa anti-glosa.',
      actionText: 'Acessar Módulo',
      actionIcon: <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />,
      tagColor: 'text-[#e05263] bg-[#e05263]/10 border-[#e05263]/30',
      hoverTitle: 'group-hover:text-[#e05263]',
      btnBg: 'bg-[#1b497d] hover:bg-[#12345b]',
      action: () => { if (onOpenSolicitacaoMedica) onOpenSolicitacaoMedica() }
    },
    {
      id: 'chamados_ti',
      icon: <Monitor size={22} strokeWidth={2} />,
      tag: 'Suporte T.I',
      title: 'Chamados de T.I',
      description: 'Abertura e acompanhamento de suporte técnico com aprovação do gestor.',
      actionText: 'Abrir Chamados',
      actionIcon: <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />,
      tagColor: 'text-[#6b5b95] bg-[#6b5b95]/10 border-[#6b5b95]/30',
      hoverTitle: 'group-hover:text-[#6b5b95]',
      btnBg: 'bg-[#1b497d] hover:bg-[#12345b]',
      action: () => { if (onOpenChamadosTi) onOpenChamadosTi() }
    }
  ]

  return (
    <motion.div
      key="onboarding"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-[#f4f6fa] overflow-y-auto w-full min-h-full"
    >
      <div className="w-full max-w-7xl flex flex-col items-center py-4 sm:py-6">
        
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <BrandLockup showAppName={true} />
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-[#1e293b] tracking-tight mb-1.5">
            Módulos Corporativos
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] max-w-[460px] mx-auto leading-relaxed">
            Selecione um módulo operacional abaixo para iniciar suas atividades.
          </p>
        </div>

        {/* Totalmente Responsivo: 1 col mobile, 2 col tablet, 3 col desktop médio, 5 col telas grandes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
          {CARDS.map((card) => (
            <motion.div
              key={card.id}
              onClick={card.action}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group bg-white rounded-[16px] p-4 sm:p-5 border border-[#e2e8f0] shadow-[0_2px_12px_rgba(18,29,43,0.04)] hover:shadow-[0_8px_24px_rgba(18,29,43,0.08)] flex flex-col justify-between cursor-pointer transition-all min-h-[220px]"
            >
              <div>
                <div className="w-10 h-10 bg-[#fafbfe] border border-[#e2e8f0] rounded-[11px] flex items-center justify-center text-[#1b497d] shadow-xs mb-3.5 group-hover:scale-105 transition-transform">
                  {card.icon}
                </div>
                <span className={`eyebrow text-[9px] px-2 py-0.5 rounded-[6px] border inline-block mb-2 ${card.tagColor}`}>
                  {card.tag}
                </span>
                <h2 className={`font-display font-extrabold text-base text-[#1e293b] mb-1.5 leading-snug ${card.hoverTitle} transition-colors`}>
                  {card.title}
                </h2>
                <p className="text-[11px] text-[#475569] leading-relaxed mb-4">
                  {card.description}
                </p>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  card.action()
                }}
                className={`w-full ${card.btnBg} text-white py-2.5 rounded-[10px] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs mt-auto cursor-pointer`}
              >
                <span>{card.actionText}</span>
                {card.actionIcon}
              </button>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  )
}
