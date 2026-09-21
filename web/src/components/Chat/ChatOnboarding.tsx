import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bot, Layers, BookOpen, ArrowRight, ExternalLink, Stethoscope, Monitor, FolderKanban, Sparkles, Mail } from 'lucide-react'
import { BrandLockup } from '../common/BrandLockup'
import { supabase } from '../../lib/supabase'

interface ChatOnboardingProps {
  onStart: () => void;
  onOpenNoc?: () => void;
  onOpenPortfolio?: () => void;
  onOpenMedicPortfolio?: () => void;
  onOpenSolicitacaoMedica?: () => void;
  onOpenChamadosTi?: () => void;
  onOpenOutlookEmails?: () => void;
}

export const ChatOnboarding: React.FC<ChatOnboardingProps> = ({ 
  onStart, 
  onOpenNoc, 
  onOpenPortfolio,
  onOpenMedicPortfolio,
  onOpenSolicitacaoMedica,
  onOpenChamadosTi,
  onOpenOutlookEmails
}) => {
  const [unreadTi, setUnreadTi] = useState(false)
  const [unreadTiCount, setUnreadTiCount] = useState(0)
  const [unreadGop, setUnreadGop] = useState(false)
  const [unreadGopCount, setUnreadGopCount] = useState(0)

  const fetchNotifications = async () => {
    try {
      const userSector = (localStorage.getItem('userSector') || '').toLowerCase().trim()
      const userLevel = (localStorage.getItem('userLevel') || '').toLowerCase().trim()
      const userName = (localStorage.getItem('userName') || '').toLowerCase().trim()
      
      const isTi = userSector.includes('ti') || userSector.includes('t.i') || userSector.includes('tecnologia') || userSector.includes('suporte')
      const isOpsLeader = userSector.includes('operaç') || userSector.includes('operac') || userSector.includes('gop') || userSector.includes('noc') || userLevel === 'coo' || userLevel === 'lider'
      const hasFullAccess = userSector.includes('gestor') || userSector.includes('diretoria') || userLevel === 'coo'

      // ----------------------------------------------------
      // 1. CHAMADOS DE T.I (Notificações, Redirecionamentos e Fila TI)
      // ----------------------------------------------------
      const { data: tiNotifs } = await supabase
        .from('ti_notifications')
        .select('*')
        .eq('read', false)

      let relevantTiNotifsCount = 0
      if (tiNotifs && tiNotifs.length > 0) {
        relevantTiNotifsCount = tiNotifs.filter((n: any) => {
          if (isTi || hasFullAccess) return true
          if (!n.target_sector) return true
          const targetSec = (n.target_sector || '').toLowerCase()
          if (targetSec === userSector || targetSec.includes(userSector)) return true
          if (n.target_user && userName.includes((n.target_user || '').toLowerCase())) return true
          return false
        }).length
      }

      let tiQueueOpenCount = 0
      if (isTi || hasFullAccess) {
        const { count } = await supabase
          .from('ti_chamados')
          .select('id', { count: 'exact', head: true })
          .in('status', ['aprovado', 'em_atendimento', 'pendente_aprovacao'])
        
        if (count && count > 0) tiQueueOpenCount = count
      } else if (userSector) {
        const { count } = await supabase
          .from('ti_chamados')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pendente_aprovacao')
          .ilike('approver_sector', `%${userSector}%`)

        if (count && count > 0) tiQueueOpenCount = count
      }

      const totalTiUnread = Math.max(relevantTiNotifsCount, tiQueueOpenCount)
      setUnreadTiCount(totalTiUnread)
      setUnreadTi(totalTiUnread > 0)

      // ----------------------------------------------------
      // 2. NÃO CONFORMIDADES NOC (GOP, Gargalos NCO e Demandas Operacionais)
      // ----------------------------------------------------
      const { data: gopNotifs } = await supabase
        .from('gop_notifications')
        .select('*')
        .eq('read', false)

      let relevantGopNotifsCount = 0
      if (gopNotifs && gopNotifs.length > 0) {
        relevantGopNotifsCount = gopNotifs.filter((n: any) => {
          if (isOpsLeader || hasFullAccess) return true
          if (!n.target_sector) return true
          const targetSec = (n.target_sector || '').toLowerCase()
          return targetSec === userSector || targetSec.includes(userSector)
        }).length
      }

      // Consulta NCOs pendentes no gargalos/demandas direcionadas para o setor/líder
      let openGargalosCount = 0
      if (isOpsLeader || hasFullAccess) {
        const { count } = await supabase
          .from('gargalos')
          .select('id', { count: 'exact', head: true })
          .in('status', ['Pendente', 'Em Análise', 'Aberto', 'Novo'])
        
        if (count && count > 0) openGargalosCount = count
      } else if (userSector) {
        const { count } = await supabase
          .from('gargalos')
          .select('id', { count: 'exact', head: true })
          .ilike('setor', `%${userSector}%`)
          .in('status', ['Pendente', 'Em Análise', 'Aberto'])
        
        if (count && count > 0) openGargalosCount = count
      }

      const totalGopUnread = Math.max(relevantGopNotifsCount, openGargalosCount)
      setUnreadGopCount(totalGopUnread)
      setUnreadGop(totalGopUnread > 0)

    } catch (e) {
      // fail silently
    }
  }

  useEffect(() => {
    fetchNotifications()

    // Realtime listener para atualização instantânea das tabelas relevantes
    const channel = supabase
      .channel('onboarding_realtime_all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ti_notifications' }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ti_chamados' }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gop_notifications' }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gargalos' }, fetchNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'demandas' }, fetchNotifications)
      .subscribe()

    const interval = setInterval(fetchNotifications, 25000) // Fallback 25s
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  const handleOpenChamadosTi = async () => {
    setUnreadTiCount(0)
    setUnreadTi(false)
    try {
      await supabase.from('ti_notifications').update({ read: true }).eq('read', false)
    } catch (e) {}
    if (onOpenChamadosTi) onOpenChamadosTi()
  }

  const handleOpenNoc = async () => {
    setUnreadGopCount(0)
    setUnreadGop(false)
    try {
      await supabase.from('gop_notifications').update({ read: true }).eq('read', false)
    } catch (e) {}
    if (onOpenNoc) onOpenNoc()
  }

  const handlePortfolioClick = () => {
    if (onOpenPortfolio) {
      onOpenPortfolio()
    } else {
      const portfolioUrl = localStorage.getItem('portfolio_url') || 'https://portifolioarthromed-medic.vercel.app'
      window.open(portfolioUrl, '_blank')
    }
  }

  const handleMedicPortfolioClick = () => {
    if (onOpenMedicPortfolio) {
      onOpenMedicPortfolio()
    } else {
      const medicPortfolioUrl = localStorage.getItem('medic_portfolio_url') || 'https://medic-portfolio.vercel.app/'
      window.open(medicPortfolioUrl, '_blank')
    }
  }

  const CARDS = [
    {
      id: 'chatbot',
      icon: <Bot size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Assistente I.A',
      title: 'Chatbot (MedIA)',
      description: 'Suporte inteligente a procedimentos internos, normas operacionais e consultas de materiais.',
      actionText: 'Acessar Chatbot',
      actionIcon: <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />,
      tagTheme: 'bg-blue-50 text-[#1f29de] border-blue-200/70',
      iconTheme: 'bg-gradient-to-br from-[#1f29de] to-[#4338ca] text-white shadow-md shadow-blue-500/20',
      hoverGlow: 'hover:border-[#1f29de]/50 hover:shadow-[0_16px_36px_rgba(31,41,222,0.14)]',
      hoverTitle: 'group-hover:text-[#1f29de]',
      actionTextColor: 'text-[#1f29de]',
      badgeColor: 'bg-blue-500',
      action: onStart
    },
    {
      id: 'noc',
      icon: <Layers size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Gestão Operacional',
      title: 'NOC (NCO)',
      description: 'Registro, acompanhamento detalhado e tratativas de Não Conformidades Operacionais.',
      actionText: 'Acessar Módulo NOC',
      actionIcon: <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />,
      tagTheme: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
      iconTheme: 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/20',
      hoverGlow: 'hover:border-indigo-500/50 hover:shadow-[0_16px_36px_rgba(79,70,229,0.14)]',
      hoverTitle: 'group-hover:text-indigo-600',
      actionTextColor: 'text-indigo-600',
      hasBadge: unreadGop,
      unreadCount: unreadGopCount,
      badgeColor: 'bg-indigo-500',
      action: handleOpenNoc
    },
    {
      id: 'portfolio',
      icon: <BookOpen size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Catálogo de Produtos',
      title: 'Portfólio Arthromed',
      description: 'Catálogo completo de produtos ortopédicos, especificações técnicas e instrumentais.',
      actionText: 'Abrir Portfólio Arthromed',
      actionIcon: <ExternalLink size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />,
      tagTheme: 'bg-teal-50 text-teal-700 border-teal-200/70',
      iconTheme: 'bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-md shadow-teal-500/20',
      hoverGlow: 'hover:border-teal-500/50 hover:shadow-[0_16px_36px_rgba(20,184,166,0.14)]',
      hoverTitle: 'group-hover:text-teal-600',
      actionTextColor: 'text-teal-600',
      hasBadge: false,
      badgeColor: 'bg-teal-500',
      action: handlePortfolioClick
    },
    {
      id: 'medic_portfolio',
      icon: <FolderKanban size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Catálogo de Produtos',
      title: 'Portfólio Medic',
      description: 'Catálogo atualizado de soluções, produtos e tecnologias do ecossistema Medic.',
      actionText: 'Abrir Portfólio Medic',
      actionIcon: <ExternalLink size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />,
      tagTheme: 'bg-sky-50 text-sky-700 border-sky-200/70',
      iconTheme: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20',
      hoverGlow: 'hover:border-sky-500/50 hover:shadow-[0_16px_36px_rgba(14,165,233,0.14)]',
      hoverTitle: 'group-hover:text-sky-600',
      actionTextColor: 'text-sky-600',
      hasBadge: false,
      badgeColor: 'bg-sky-500',
      action: handleMedicPortfolioClick
    },
    {
      id: 'solicitacao',
      icon: <Stethoscope size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Regulatório CFM / ANS',
      title: 'Solicitação Médica',
      description: 'Solicitações cirúrgicas padronizadas, justificativas OPME e pareceres anti-glosa.',
      actionText: 'Gerar Documento Clínico',
      actionIcon: <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />,
      tagTheme: 'bg-rose-50 text-rose-700 border-rose-200/70',
      iconTheme: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20',
      hoverGlow: 'hover:border-rose-500/50 hover:shadow-[0_16px_36px_rgba(244,63,94,0.14)]',
      hoverTitle: 'group-hover:text-rose-600',
      actionTextColor: 'text-rose-600',
      hasBadge: false,
      badgeColor: 'bg-rose-500',
      action: () => { if (onOpenSolicitacaoMedica) onOpenSolicitacaoMedica() }
    },
    {
      id: 'chamados_ti',
      icon: <Monitor size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Suporte Técnico T.I',
      title: 'Chamados de T.I',
      description: 'Abertura rápida e acompanhamento em tempo real de requisições de suporte de informática.',
      actionText: 'Abrir Suporte T.I',
      actionIcon: <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />,
      tagTheme: 'bg-purple-50 text-purple-700 border-purple-200/70',
      iconTheme: 'bg-gradient-to-br from-purple-600 to-fuchsia-700 text-white shadow-md shadow-purple-500/20',
      hoverGlow: 'hover:border-purple-500/50 hover:shadow-[0_16px_36px_rgba(168,85,247,0.14)]',
      hoverTitle: 'group-hover:text-purple-600',
      actionTextColor: 'text-purple-600',
      hasBadge: unreadTi,
      unreadCount: unreadTiCount,
      badgeColor: 'bg-purple-500',
      action: handleOpenChamadosTi
    },
    // O card abaixo será renderizado APENAS em ambiente local (npm run dev)
    // No Vercel (produção) ele será automaticamente ocultado.
    ...(import.meta.env.DEV ? [{
      id: 'outlook_emails',
      icon: <Mail size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Comunicação Corporativa',
      title: 'Central E-mails Outlook',
      description: 'Visualização, leitura, resumos com I.A e resposta de e-mails corporativos (200+ mensagens).',
      actionText: 'Abrir Central Outlook',
      actionIcon: <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />,
      tagTheme: 'bg-blue-50 text-blue-700 border-blue-200/70',
      iconTheme: 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20',
      hoverGlow: 'hover:border-blue-500/50 hover:shadow-[0_16px_36px_rgba(37,99,235,0.14)]',
      hoverTitle: 'group-hover:text-blue-600',
      actionTextColor: 'text-blue-600',
      hasBadge: true,
      unreadCount: 30,
      badgeColor: 'bg-blue-600',
      action: () => { if (onOpenOutlookEmails) onOpenOutlookEmails() }
    }] : [])
  ]

  return (
    <motion.div
      key="onboarding"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col items-center p-4 sm:p-6 lg:p-10 bg-[#f8fafc] overflow-y-auto w-full min-h-full"
    >
      <div className="w-full max-w-6xl flex flex-col items-center py-2 sm:py-6">
        
        {/* Top Header Hero */}
        <div className="text-center mb-8 sm:mb-10 flex flex-col items-center w-full">
          <div className="w-full flex items-center justify-center mb-4 px-2">
            <BrandLockup showAppName={true} />
          </div>
          
          <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-slate-900 tracking-tight mb-3">
            Módulos Operacionais
          </h1>

          {/* Banner de Instrução em Destaque Neon Premium */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-200/80 text-blue-950 text-xs sm:text-sm font-bold shadow-xs transition-all hover:border-blue-300">
            <div className="w-6 h-6 rounded-lg bg-[#1f29de] text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles size={13} />
            </div>
            <span>Clique diretamente em qualquer card abaixo para abrir o módulo desejado</span>
          </div>
        </div>

        {/* Grid de Cards Proporcionais e Elegantes (2 cols tablet / 3 cols desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 w-full">
          {CARDS.map((card) => (
            <motion.div
              key={card.id}
              onClick={card.action}
              whileHover={{ y: -5, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`group relative bg-gradient-to-br from-white via-slate-50/50 to-white rounded-[22px] p-5 sm:p-6 border border-slate-200/90 ${card.hoverGlow} shadow-[0_4px_20px_rgba(15,23,42,0.03)] flex flex-col justify-between cursor-pointer transition-all duration-300 select-none min-h-[195px]`}
            >
              {/* Header do Card: Ícone + Tag + Badge de Notificação */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-[14px] ${card.iconTheme} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    {card.icon}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {(card as any).unreadCount && (card as any).unreadCount > 0 ? (
                      <div className="flex items-center gap-1.5 bg-red-500 text-white px-2.5 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm animate-pulse tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        <span>{(card as any).unreadCount} {(card as any).unreadCount === 1 ? 'novo' : 'novos'}</span>
                      </div>
                    ) : (card as any).hasBadge ? (
                      <span className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 shadow-2xs"></span>
                      </span>
                    ) : null}

                    <span className={`eyebrow text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 whitespace-nowrap ${card.tagTheme}`}>
                      {card.tag}
                    </span>
                  </div>
                </div>

                {/* Título e Descrição */}
                <h2 className={`font-display font-black text-lg text-slate-900 mb-1.5 leading-snug ${card.hoverTitle} transition-colors`}>
                  {card.title}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              {/* Rodapé Integrado do Card com Micro-interação */}
              <div className="pt-3.5 mt-4 border-t border-slate-100/90 flex items-center justify-between text-xs font-extrabold transition-colors">
                <span className={`group-hover:translate-x-0.5 transition-transform ${card.actionTextColor} font-bold`}>
                  {card.actionText}
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-[#1f29de] group-hover:text-white text-slate-500 flex items-center justify-center transition-all duration-300 shadow-2xs group-hover:shadow-xs group-hover:translate-x-0.5">
                  {card.actionIcon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </motion.div>
  )
}
