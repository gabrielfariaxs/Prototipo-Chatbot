import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Layers, BookOpen, ArrowRight, ExternalLink, Sparkles, Stethoscope, ChevronLeft, ChevronRight, Monitor } from 'lucide-react'
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
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      icon: <Bot size={24} strokeWidth={2} />,
      tag: 'Assistente Corporativo',
      title: 'Chatbot (MedIA)',
      description: 'Assistente inteligente para suporte em procedimentos internos, dúvidas operacionais e consulta de materiais.',
      actionText: 'Acessar Chatbot',
      actionIcon: <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />,
      tagColor: 'text-[#1f29de] bg-[#eef0fe] border-[#c3c7fb]',
      hoverTitle: 'group-hover:text-[#1f29de]',
      btnBg: 'bg-[#1f29de] hover:bg-[#1a22b8]',
      action: onStart
    },
    {
      id: 'noc',
      icon: <Layers size={24} strokeWidth={2} />,
      tag: 'Gestão Operacional',
      title: 'NOC (NCO)',
      description: 'Módulo para registro, acompanhamento e tratativas de Não Conformidades Operacionais.',
      actionText: 'Acessar NOC',
      actionIcon: <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />,
      tagColor: 'text-[#357fc4] bg-[#357fc4]/10 border-[#357fc4]/30',
      hoverTitle: 'group-hover:text-[#357fc4]',
      btnBg: 'bg-[#1f29de] hover:bg-[#1a22b8]',
      action: () => { if (onOpenNoc) onOpenNoc() }
    },
    {
      id: 'portfolio',
      icon: <BookOpen size={24} strokeWidth={2} />,
      tag: 'Catálogo Online',
      title: 'Portfólio de Produtos',
      description: 'Catálogo completo de produtos, materiais ortopédicos e especificações corporativas.',
      actionText: 'Abrir Portfólio',
      actionIcon: <ExternalLink size={16} className="group-hover:translate-x-0.5 transition-transform" />,
      tagColor: 'text-[#4ec7ac] bg-[#4ec7ac]/10 border-[#4ec7ac]/30',
      hoverTitle: 'group-hover:text-[#4ec7ac]',
      btnBg: 'bg-[#1f29de] hover:bg-[#1a22b8]',
      action: handlePortfolioClick
    },
    {
      id: 'solicitacao',
      icon: <Stethoscope size={24} strokeWidth={2} />,
      tag: 'Padrão CFM / ANS',
      title: 'Solicitação Médica',
      description: 'Solicitações cirúrgicas, justificativas de OPME e recursos de negativa estruturados anti-glosa.',
      actionText: 'Acessar Módulo',
      actionIcon: <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />,
      tagColor: 'text-[#fd6192] bg-[#fd6192]/10 border-[#fd6192]/30',
      hoverTitle: 'group-hover:text-[#fd6192]',
      btnBg: 'bg-[#1f29de] hover:bg-[#1a22b8]',
      action: () => { if (onOpenSolicitacaoMedica) onOpenSolicitacaoMedica() }
    },
    {
      id: 'chamados_ti',
      icon: <Monitor size={24} strokeWidth={2} />,
      tag: 'Suporte Técnico',
      title: 'Chamados de T.I',
      description: 'Abertura e acompanhamento de chamados de suporte técnico com aprovação do gestor responsável.',
      actionText: 'Abrir Chamados',
      actionIcon: <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />,
      tagColor: 'text-[#664ba6] bg-[#664ba6]/10 border-[#664ba6]/30',
      hoverTitle: 'group-hover:text-[#664ba6]',
      btnBg: 'bg-[#1f29de] hover:bg-[#1a22b8]',
      action: () => { if (onOpenChamadosTi) onOpenChamadosTi() }
    }
  ]

  const nextCard = () => setActiveIndex((prev) => Math.min(prev + 1, CARDS.length - 1))
  const prevCard = () => setActiveIndex((prev) => Math.max(prev - 1, 0))

  return (
    <motion.div
      key="onboarding"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className="flex-1 flex flex-col items-center p-4 sm:p-8 bg-[#f5f7fb] overflow-hidden w-full justify-center min-h-full"
    >
      <div className="w-full max-w-[960px] flex flex-col items-center justify-center my-auto py-2">
        
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <BrandLockup showAppName={true} />
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-[#14161f] tracking-tight mb-2">
            Módulos Corporativos
          </h1>
          <p className="text-sm text-[#5b6276] max-w-[480px] mx-auto leading-relaxed">
            Selecione um módulo operacional abaixo para iniciar suas atividades.
          </p>
        </div>

        {/* 3D Carousel Container */}
        <div className="relative w-full max-w-[900px] mx-auto h-[400px] flex items-center justify-center select-none" style={{ perspective: '1200px' }}>
          
          {/* Side Arrows */}
          <div className="absolute left-2 sm:left-8 z-50 flex items-center h-full pointer-events-none">
            <button
              type="button"
              onClick={prevCard}
              disabled={activeIndex === 0}
              className="pointer-events-auto p-2.5 rounded-full bg-white shadow-md text-[#5b6276] hover:text-[#1f29de] hover:scale-105 active:scale-95 disabled:opacity-0 transition-all border border-[#e6e9f2]"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
          </div>
          
          <div className="absolute right-2 sm:right-8 z-50 flex items-center h-full pointer-events-none">
            <button
              type="button"
              onClick={nextCard}
              disabled={activeIndex === CARDS.length - 1}
              className="pointer-events-auto p-2.5 rounded-full bg-white shadow-md text-[#5b6276] hover:text-[#1f29de] hover:scale-105 active:scale-95 disabled:opacity-0 transition-all border border-[#e6e9f2]"
            >
              <ChevronRight size={24} strokeWidth={2} />
            </button>
          </div>

          {CARDS.map((card, index) => {
            const offset = index - activeIndex
            const isActive = offset === 0
            
            const xBase = isMobile ? 60 : 180
            const x = offset * xBase
            const z = Math.abs(offset) * -120
            const rotateY = offset * -15
            const scale = 1 - Math.abs(offset) * 0.1
            
            return (
              <motion.div
                key={card.id}
                onClick={() => { 
                  if (!isActive) setActiveIndex(index)
                  else card.action()
                }}
                initial={false}
                animate={{ 
                  x, 
                  z, 
                  rotateY, 
                  scale, 
                  opacity: isActive ? 1 : 0.6 
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 25 }}
                style={{
                  position: 'absolute',
                  transformStyle: 'preserve-3d',
                  zIndex: CARDS.length - Math.abs(offset)
                }}
                className={`group bg-white rounded-[24px] p-6 border border-[#e6e9f2] shadow-[0_4px_22px_rgba(20,22,31,0.06)] flex flex-col justify-between w-[290px] sm:w-[320px] h-[360px] overflow-hidden ${isActive ? 'cursor-default' : 'cursor-pointer hover:shadow-lg'}`}
              >
                <div>
                  <div className="w-12 h-12 bg-[#fafbfe] border border-[#e6e9f2] rounded-[11px] flex items-center justify-center text-[#1f29de] shadow-xs mb-5 transition-transform">
                    {card.icon}
                  </div>
                  <span className={`eyebrow px-2.5 py-1 rounded-[8px] border inline-block mb-3 ${card.tagColor}`}>
                    {card.tag}
                  </span>
                  <h2 className={`font-display font-extrabold text-xl text-[#14161f] mb-2 ${isActive ? card.hoverTitle : ''} transition-colors`}>
                    {card.title}
                  </h2>
                  <p className="text-xs text-[#5b6276] leading-relaxed mb-6 line-clamp-3">
                    {card.description}
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (isActive) card.action()
                    else setActiveIndex(index)
                  }}
                  disabled={!isActive}
                  className={`w-full ${card.btnBg} text-white py-3 rounded-[11px] text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs mt-auto ${isActive ? 'opacity-100 cursor-pointer translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                >
                  <span>{card.actionText}</span>
                  {card.actionIcon}
                </button>
              </motion.div>
            )
          })}
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center gap-2 mt-8">
          {CARDS.map((_, i) => (
            <button 
              key={i} 
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`rounded-full transition-all duration-300 ${activeIndex === i ? 'w-6 h-2 bg-[#1f29de]' : 'w-2 h-2 bg-[#9097aa] hover:bg-[#5b6276]'}`}
              aria-label={`Ir para slide ${i + 1}`}
            />
          ))}
        </div>

      </div>
    </motion.div>
  )
}
