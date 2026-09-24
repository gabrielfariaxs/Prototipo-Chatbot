import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Layers, BookOpen, ArrowRight, ExternalLink, Stethoscope, Monitor, FolderKanban, Sparkles, Mail, X, Users } from 'lucide-react'
import { BrandLockup } from '../common/BrandLockup'
import { supabase } from '../../lib/supabase'
import { getTodaysBirthdays } from '../../data/birthdays'
import type { Birthday } from '../../data/birthdays'
import { Cake, BellRing } from 'lucide-react'

// Utilidade para converter VAPID base64 string para Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  try {
    // Remove possíveis aspas (se o usuário colocou no .env com aspas), espaços ou quebras de linha
    const cleanBase64 = base64String.replace(/^['"]+|['"]+$/g, '').replace(/\s/g, '')
    const padding = '='.repeat((4 - cleanBase64.length % 4) % 4)
    const base64 = (cleanBase64 + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  } catch (error) {
    console.error("Erro ao decodificar a VAPID KEY (VITE_VAPID_PUBLIC_KEY):", base64String);
    throw new Error("A chave VAPID configurada no sistema não é um Base64 válido. Verifique as variáveis de ambiente (VITE_VAPID_PUBLIC_KEY).");
  }
}

interface ChatOnboardingProps {
  onStart: () => void;
  onOpenNoc?: () => void;
  onOpenPortfolio?: () => void;
  onOpenMedicPortfolio?: () => void;
  onOpenSolicitacaoMedica?: () => void;
  onOpenChamadosTi?: () => void;
  onOpenOutlookEmails?: () => void;
  onOpenTreinamentos?: () => void;
}

export const ChatOnboarding: React.FC<ChatOnboardingProps> = ({ 
  onStart, 
  onOpenNoc, 
  onOpenPortfolio,
  onOpenMedicPortfolio,
  onOpenSolicitacaoMedica,
  onOpenChamadosTi,
  onOpenOutlookEmails,
  onOpenTreinamentos
}) => {
  const [unreadTi, setUnreadTi] = useState(false)
  const [unreadTiCount, setUnreadTiCount] = useState(0)
  const [unreadGop, setUnreadGop] = useState(false)
  const [unreadGopCount, setUnreadGopCount] = useState(0)
  const [showPortfolioSelection, setShowPortfolioSelection] = useState(false)

  const userSector = (typeof window !== 'undefined' ? localStorage.getItem('userSector') || '' : '').toLowerCase().trim()
  const userLevel = (typeof window !== 'undefined' ? localStorage.getItem('userLevel') || '' : '').toLowerCase().trim()
  const userName = (typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : '').trim()

  const isTi = userSector.includes('ti') || userSector.includes('t.i') || userSector.includes('tecnologia') || userSector.includes('suporte')
  const isOpsLeader = userSector.includes('operaç') || userSector.includes('operac') || userSector.includes('gop') || userSector.includes('noc') || userLevel === 'coo' || userLevel === 'lider'
  const hasFullAccess = userSector.includes('gestor') || userSector.includes('diretoria') || userLevel === 'coo'
  const isTreinamentosAuthorized = isTi || isOpsLeader || hasFullAccess || userSector.includes('rh')

  const [isPushSupported, setIsPushSupported] = useState(false)
  const [isPushSubscribed, setIsPushSubscribed] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsPushSupported(true)
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsPushSubscribed(!!subscription)
        })
      })
    }
  }, [])

  const handleSubscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    
    try {
      setPushLoading(true)
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Permissão de notificação negada. Altere nas configurações do navegador.')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
      
      if (!publicVapidKey) {
        alert('Erro: Chave VAPID não configurada no sistema.')
        return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      })

      const { error } = await supabase.from('push_subscriptions').insert({
        user_sector: userSector || 'T.I',
        user_name: userName || 'Usuário Local',
        subscription: subscription
      })

      if (error) {
        console.error('Erro Supabase:', error)
        alert('Erro ao vincular dispositivo no servidor.')
      } else {
        setIsPushSubscribed(true)
        alert('Dispositivo vinculado com sucesso! Você receberá notificações push.')
      }
    } catch (err: any) {
      console.error(err)
      alert(`Falha: ${err.message}`)
    } finally {
      setPushLoading(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      await supabase.auth.getSession()
      
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

    const handleVisibility = () => { if (document.visibilityState === 'visible') fetchNotifications() }
    window.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('focus', fetchNotifications)

    const interval = setInterval(fetchNotifications, 25000) // Fallback 25s
    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
      window.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('focus', fetchNotifications)
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
      const portfolioUrl = (typeof window !== 'undefined' ? localStorage.getItem('portfolio_url') : null) || 'https://portifolioarthromed-medic.vercel.app'
      if (typeof window !== 'undefined') window.open(portfolioUrl, '_blank')
    }
  }

  const handleMedicPortfolioClick = () => {
    if (onOpenMedicPortfolio) {
      onOpenMedicPortfolio()
    } else {
      const medicPortfolioUrl = (typeof window !== 'undefined' ? localStorage.getItem('medic_portfolio_url') : null) || 'https://medic-portfolio.vercel.app/'
      if (typeof window !== 'undefined') window.open(medicPortfolioUrl, '_blank')
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
      id: 'portfolios',
      icon: <BookOpen size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Catálogo de Produtos',
      title: 'Portfólios Corporativos',
      description: 'Catálogos completos de produtos, soluções tecnológicas, especificações técnicas e instrumentais do grupo.',
      actionText: 'Selecionar Portfólio',
      actionIcon: <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />,
      tagTheme: 'bg-teal-50 text-teal-700 border-teal-200/70',
      iconTheme: 'bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-md shadow-teal-500/20',
      hoverGlow: 'hover:border-teal-500/50 hover:shadow-[0_16px_36px_rgba(20,184,166,0.14)]',
      hoverTitle: 'group-hover:text-teal-600',
      actionTextColor: 'text-teal-600',
      hasBadge: false,
      badgeColor: 'bg-teal-500',
      action: () => setShowPortfolioSelection(true)
    },
    ...(import.meta.env.DEV && (isTreinamentosAuthorized || !userSector) ? [{
      id: 'treinamentos',
      icon: <Users size={22} strokeWidth={2.2} className="w-[22px] h-[22px] shrink-0" />,
      tag: 'Capacitação',
      title: 'Treinamentos',
      description: 'Agendamento de reuniões, controle de atas digitais via QR Code e calendário corporativo.',
      actionText: 'Acessar Treinamentos',
      actionIcon: <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />,
      tagTheme: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/70',
      iconTheme: 'bg-gradient-to-br from-fuchsia-500 to-purple-700 text-white shadow-md shadow-fuchsia-500/20',
      hoverGlow: 'hover:border-fuchsia-500/50 hover:shadow-[0_16px_36px_rgba(217,70,239,0.14)]',
      hoverTitle: 'group-hover:text-fuchsia-600',
      actionTextColor: 'text-fuchsia-600',
      hasBadge: false,
      badgeColor: 'bg-fuchsia-500',
      action: () => { if (onOpenTreinamentos) onOpenTreinamentos() }
    }] : []),
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

          {/* Banner de Aniversariantes */}
          {getTodaysBirthdays().length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="w-full max-w-lg mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 border border-amber-200/60 shadow-lg shadow-amber-500/10"
            >
              <div className="flex flex-col items-center p-4">
                <div className="flex items-center gap-2 mb-2 text-amber-700">
                  <Cake size={20} className="animate-bounce" />
                  <span className="font-bold text-sm uppercase tracking-wider">Aniversariantes do Dia</span>
                  <Cake size={20} className="animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {getTodaysBirthdays().map((b: Birthday, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/60 rounded-full font-bold text-amber-900 text-sm shadow-xs border border-white/80">
                      🎉 {b.name}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-semibold text-amber-800/70 mt-3 text-center">Deseje muitas felicidades para a equipe! 🎂</p>
              </div>
            </motion.div>
          )}

          {/* Banner de Instrução em Destaque Neon Premium */}
          <div className="flex justify-center w-full">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 border border-blue-200/80 text-blue-950 text-xs sm:text-sm font-bold shadow-xs transition-all hover:border-blue-300">
              <div className="w-6 h-6 rounded-lg bg-[#1f29de] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles size={13} />
              </div>
              <span>Clique diretamente em qualquer card abaixo para abrir o módulo desejado</span>
            </div>
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

      <AnimatePresence>
        {showPortfolioSelection && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-inner">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">Portfólios Corporativos</h3>
                    <p className="text-xs text-slate-500">Selecione o catálogo desejado</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPortfolioSelection(false)}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <button
                  onClick={() => {
                    setShowPortfolioSelection(false);
                    handlePortfolioClick();
                  }}
                  className="relative w-full group flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-200 hover:border-teal-300 hover:bg-teal-50/60 transition-all text-center shadow-2xs hover:shadow-lg"
                >
                  <ExternalLink size={16} className="absolute top-4 right-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen size={30} strokeWidth={2} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-teal-700 transition-colors">Arthromed</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2 font-medium">Implantes ortopédicos, sinteses e artroscopia</p>
                </button>

                <button
                  onClick={() => {
                    setShowPortfolioSelection(false);
                    handleMedicPortfolioClick();
                  }}
                  className="relative w-full group flex flex-col items-center justify-center p-6 rounded-3xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/60 transition-all text-center shadow-2xs hover:shadow-lg"
                >
                  <ExternalLink size={16} className="absolute top-4 right-4 text-slate-300 group-hover:text-sky-500 transition-colors" />
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-sky-500/30 group-hover:scale-110 transition-transform duration-300">
                    <FolderKanban size={30} strokeWidth={2} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg group-hover:text-sky-700 transition-colors">Medic</h4>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2 font-medium">Soluções completas, bucomaxilo e tecnologias</p>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Push Notification Button */}
      {isPushSupported && !isPushSubscribed && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 300, delay: 0.8 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <button
            onClick={handleSubscribeToPush}
            disabled={pushLoading}
            className="group flex items-center gap-3 px-2 pr-5 py-2 rounded-[28px] bg-white/90 backdrop-blur-md border border-slate-200/90 text-slate-800 text-sm font-bold shadow-xl shadow-slate-300/40 transition-all duration-300 hover:shadow-2xl hover:bg-white hover:-translate-y-1 active:scale-95 whitespace-nowrap cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className="w-10 h-10 rounded-[20px] bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-inner">
              <BellRing size={18} className={pushLoading ? 'animate-pulse' : 'animate-bounce'} />
            </div>
            <span className="tracking-tight">{pushLoading ? 'Ativando Alertas...' : 'Ativar Notificações'}</span>
          </button>
        </motion.div>
      )}

    </motion.div>
  )
}
