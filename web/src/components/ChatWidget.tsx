import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, FileText, User, Shield, Landmark, Activity, Layers, Clock, Copy, ThumbsUp, ThumbsDown, Maximize2, Image as ImageIcon, Bot } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getContext, generateResponse, getSectors } from '../lib/chat'
import { cn } from '../lib/utils'
import { FatureIA } from './FatureIA'
import { GopPanel } from './GOP/GopPanel'
import { ChatOnboarding } from './Chat/ChatOnboarding'
import { ChatSectorSelect } from './Chat/ChatSectorSelect'
import { AdminDashboard } from './Metrics/AdminDashboard'
import { logAiUsage, saveAiFeedback } from '../lib/metrics-service'

import { FilePreviewModal } from './Chat/FilePreviewModal'


import { ProcedureManageModal } from './Chat/ProcedureManageModal'
import { ProcedureHistoryModal } from './Chat/ProcedureHistoryModal'
import { getCustomProcedures, canAccessProcedureHistory, type ProcedureItem } from '../lib/procedures-service'
import { LoginScreen } from './common/LoginScreen'
import { ClinicalDocPanel } from './ClinicalDoc/ClinicalDocPanel'
import { ChamadosTiPanel } from './ChamadosTI/ChamadosTiPanel'
import { PortalPasswordsModal } from './common/PortalPasswordsModal'
import { AgendasLocaisModal } from './common/AgendasLocaisModal'
import { HospedagemModal } from './common/HospedagemModal'
import { TreinamentosModal } from './Treinamentos/TreinamentosModal'
import { CatalogoVideosModal } from './Treinamentos/CatalogoVideosModal'
import { supabase, getSectorFromEmail } from '../lib/supabase'
import { ChatHeader } from './Chat/ChatHeader'
import { ChatMessageItem } from './Chat/ChatMessageItem'
import { ChatInputBar } from './Chat/ChatInputBar'
import { DeveloperDocsModal } from './common/DeveloperDocsModal'
import type { Session } from '@supabase/supabase-js'

type Message = {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: Date
  files?: {
    name: string
    base64: string
    type: string
    originalPdfBase64?: string
  }[]
  feedback?: 'up' | 'down'
  feedbackComment?: string
}

export const ChatWidget = ({ isDesktop = false, hideToggle = false }: { isDesktop?: boolean, hideToggle?: boolean }) => {
  const [isOpen, setIsOpen] = useState(isDesktop)
  const [previewFile, setPreviewFile] = useState<{ name: string; base64: string; type: string; originalPdfBase64?: string; url?: string } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imgZoom, setImgZoom] = useState<number>(1)
  const [isDevDocsModalOpen, setIsDevDocsModalOpen] = useState(false)

  useEffect(() => {
    setImgZoom(1)
    if (!previewFile) {
      setPreviewUrl(null)
      return
    }

    try {
      if ((previewFile as any).url) {
        setPreviewUrl((previewFile as any).url)
        return
      }

      // Se houver um PDF original, gera o Blob a partir dele (assim renderiza o visualizador nativo completo)
      const base64ToUse = previewFile.originalPdfBase64 || previewFile.base64
      const typeToUse = previewFile.originalPdfBase64 ? 'application/pdf' : previewFile.type

      const binary = atob(base64ToUse)
      const array = []
      for (let i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i))
      }
      const blob = new Blob([new Uint8Array(array)], { type: typeToUse })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)

      return () => {
        if (!(previewFile as any).url) {
          URL.revokeObjectURL(url)
        }
      }
    } catch (e) {
      console.error('Erro ao gerar blob URL:', e)
      setPreviewUrl(null)
    }
  }, [previewFile])
  
  useEffect(() => {
    // Notificar o pai (extensão) sobre o estado do chat
    window.parent.postMessage({ type: 'MEDIA_CHAT_TOGGLE', isOpen }, '*')
    
    // Notificar o Python (Desktop App) para redimensionar a janela nativa
    if (typeof window !== 'undefined' && (window as any).pywebview && (window as any).pywebview.api) {
      setTimeout(() => {
        try {
          (window as any).pywebview.api.resize_window(isOpen === true)
        } catch (e) {}
      }, 50)
    }
  }, [isOpen])

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  // const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // Salvar feedback global
  const saveGlobalFeedback = (msgId: string, type: 'up' | 'down', comment?: string, messageText?: string) => {
    const existing = JSON.parse(localStorage.getItem('media_feedbacks') || '[]')
    
    // Atualiza se já existir (para o caso de adicionar comentário depois do downvote)
    const existingIdx = existing.findIndex((f: any) => f.msgId === msgId)
    if (existingIdx >= 0) {
      if (comment) existing[existingIdx].comment = comment
    } else {
      existing.push({
        id: Date.now().toString(),
        msgId,
        date: new Date().toISOString(),
        type,
        comment,
        messagePreview: messageText ? messageText.substring(0, 100) : ''
      })
    }
    localStorage.setItem('media_feedbacks', JSON.stringify(existing))

    // Dispara persistência em tempo real no Supabase
    saveAiFeedback({
      tipo: type,
      comentario: comment,
      mensagemPreview: messageText
    })
  }


  const handleFeedback = (msgId: string, type: 'up' | 'down', messageText?: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: type } : m))
    saveGlobalFeedback(msgId, type, undefined, messageText)
  }

  const handleFeedbackComment = (msgId: string, comment: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedbackComment: comment } : m))
    saveGlobalFeedback(msgId, 'down', comment)
  }
  const [step, setStep] = useState<'onboarding' | 'sector' | 'chat' | 'dashboard' | 'fature_ia' | 'gop' | 'login' | 'doc_clinica' | 'chamados_ti' | 'treinamentos' | 'treinaflix'>('onboarding')
  const [session, setSession] = useState<Session | null>(null)
  const [pendingModule, setPendingModule] = useState<'chatbot' | 'noc' | 'doc_clinica' | 'chamados_ti' | 'treinamentos' | 'treinaflix' | 'dev_docs' | 'dashboard' | null>(null)

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
      if (currentSession?.user?.email) {
        const savedSector = localStorage.getItem('userSector')
        if (!savedSector) {
          const inferred = getSectorFromEmail(currentSession.user.email)
          if (inferred) localStorage.setItem('userSector', inferred)
        }
      }
    }
    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, currentSession: Session | null) => {
      setSession(currentSession)
      if (currentSession?.user?.email) {
        const savedSector = localStorage.getItem('userSector')
        if (!savedSector) {
          const inferred = getSectorFromEmail(currentSession.user.email)
          if (inferred) localStorage.setItem('userSector', inferred)
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const executeWithAuth = async (moduleKey: 'chatbot' | 'noc' | 'doc_clinica' | 'chamados_ti' | 'treinamentos' | 'treinaflix' | 'dev_docs' | 'dashboard', action: () => void) => {
    let activeSession = session
    if (!activeSession) {
      const { data: { session: refreshedSession } } = await supabase.auth.getSession()
      activeSession = refreshedSession
      if (refreshedSession) setSession(refreshedSession)
    }

    if (activeSession?.user) {
      if (activeSession.user.email && !localStorage.getItem('userSector')) {
        const inferred = getSectorFromEmail(activeSession.user.email)
        if (inferred) localStorage.setItem('userSector', inferred)
      }
      action()
    } else {
      setPendingModule(moduleKey)
      setStep('login')
    }
  }

  const handleSelectChatbotModule = () => {
    executeWithAuth('chatbot', handleStart)
  }

  const handleSelectNocModule = () => {
    executeWithAuth('noc', () => setStep('gop'))
  }

  const handleSelectDocClinicaModule = () => {
    executeWithAuth('doc_clinica', () => setStep('doc_clinica'))
  }

  const handleSelectChamadosTiModule = () => {
    executeWithAuth('chamados_ti', () => setStep('chamados_ti'))
  }

  const handleSelectTreinamentosModule = () => {
    executeWithAuth('treinamentos', () => setStep('treinamentos'))
  }

  const handleSelectTreinaFlixModule = () => {
    executeWithAuth('treinaflix', () => setStep('treinaflix'))
  }

  const handleSelectDevDocs = () => {
    executeWithAuth('dev_docs', () => setIsDevDocsModalOpen(true))
  }

  const handleSelectMetrics = () => {
    executeWithAuth('dashboard', () => setStep('dashboard'))
  }

  const handleLoginSuccess = () => {
    if (pendingModule === 'noc') {
      setStep('gop')
    } else if (pendingModule === 'doc_clinica') {
      setStep('doc_clinica')
    } else if (pendingModule === 'chamados_ti') {
      setStep('chamados_ti')
    } else if (pendingModule === 'treinamentos') {
      setStep('treinamentos')
    } else if (pendingModule === 'treinaflix') {
      setStep('treinaflix')
    } else if (pendingModule === 'dev_docs') {
      setIsDevDocsModalOpen(true)
      setStep('onboarding')
    } else if (pendingModule === 'dashboard') {
      setStep('dashboard')
    } else {
      handleStart()
    }
    setPendingModule(null)
  }

  const [sector, setSector] = useState<string | null>(null)
  const [availableSectors, setAvailableSectors] = useState<string[]>([])
  const [, setStepSession] = useState<{
    steps: string[]
    current: number
    intro: string
  } | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; base64: string; type: string; extractedText?: string; originalPdfBase64?: string }[]>([])
  const [sessionContext, setSessionContext] = useState<string>('')

  // Estados para Gestão de Procedimentos com Fotos & Histórico
  const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [procedureModalMode, setProcedureModalMode] = useState<'create' | 'edit' | 'delete'>('create')
  const [procedureModalData, setProcedureModalData] = useState<Partial<ProcedureItem> | null>(null)
  const [customProcedures, setCustomProcedures] = useState<ProcedureItem[]>([])
  const [isPortalPasswordsModalOpen, setIsPortalPasswordsModalOpen] = useState(false)
  const [isAgendasModalOpen, setIsAgendasModalOpen] = useState(false)
  const [isHospedagemModalOpen, setIsHospedagemModalOpen] = useState(false)

  const canShowHistoryButton = () => {
    if (typeof window === 'undefined') return false
    const userSec = sector || localStorage.getItem('userSector') || ''
    const userRole = localStorage.getItem('userRole') || ''
    return canAccessProcedureHistory(userSec, userRole)
  }

  const loadProcedures = async (sec?: string) => {
    try {
      const procs = await getCustomProcedures(sec)
      setCustomProcedures(procs)
    } catch (e) {
      console.warn('Erro ao carregar procedimentos customizados:', e)
    }
  }

  useEffect(() => {
    loadProcedures(sector || undefined)
  }, [sector])

  const handleOpenEditProcedure = (botText: string) => {
    const match = customProcedures.find(p => 
      botText.toLowerCase().includes(p.processo.toLowerCase()) || 
      p.processo.toLowerCase().includes(botText.slice(0, 30).toLowerCase())
    )

    if (match) {
      setProcedureModalData(match)
    } else {
      const firstHeading = botText.match(/###?\s*(.*)/)?.[1] || 
        botText.match(/Procedimento:\s*(.*)/i)?.[1] ||
        botText.split('\n')[0].replace(/^#+\s*/, '').slice(0, 50)

      setProcedureModalData({
        processo: firstHeading || 'Procedimento',
        setor: sector || 'Orçamento',
        sistema: 'Emultec',
        conteudo: botText
      })
    }
    setProcedureModalMode('edit')
    setIsProcedureModalOpen(true)
  }

  const handleOpenDeleteProcedure = (botText: string) => {
    const match = customProcedures.find(p => 
      botText.toLowerCase().includes(p.processo.toLowerCase())
    )
    const firstHeading = botText.match(/###?\s*(.*)/)?.[1] || botText.split('\n')[0].replace(/^#+\s*/, '').slice(0, 50)
    setProcedureModalData(match || {
      processo: firstHeading || 'Procedimento',
      setor: sector || 'Orçamento'
    })
    setProcedureModalMode('delete')
    setIsProcedureModalOpen(true)
  }

  // TTS (Text-to-Speech) states
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(false)
  const [, setActiveSpeech] = useState<SpeechSynthesisUtterance | null>(null)

  // Cancelar fala ao desmontar o componente
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])



  // Ativa/Desativa o TTS e interrompe fala atual se for desligado
  const toggleSpeech = () => {
    const nextState = !isSpeechEnabled
    setIsSpeechEnabled(nextState)
    if (!nextState && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setActiveSpeech(null)
    }
  }

  // Lê a resposta do bot em voz alta se o TTS estiver ativado
  const speakResponseText = (text: string) => {
    if (!isSpeechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()

    // Limpar o markdown e tags especiais para leitura limpa
    const cleanText = text
      .replace(/###/g, '')
      .replace(/##/g, '')
      .replace(/#/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`[^`]+`/g, '') 
      .replace(/-\s+/g, '') 
      .replace(/\d+[\.)\-]\s+/g, '') 
      .replace(/[-_]/g, ' ')
      .trim()

    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = 'pt-BR'

    const voices = window.speechSynthesis.getVoices()
    const ptVoices = voices.filter(v => v.lang.startsWith('pt'))
    if (ptVoices.length > 0) {
      const preferredVoice = ptVoices.find(v => v.name.includes('Google') || v.name.includes('Maria') || v.name.includes('Daniel') || v.name.includes('Heloisa')) || ptVoices[0]
      utterance.voice = preferredVoice
    }

    utterance.onend = () => {
      setActiveSpeech(null)
    }
    utterance.onerror = () => {
      setActiveSpeech(null)
    }

    setActiveSpeech(utterance)
    window.speechSynthesis.speak(utterance)
  }


  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const handleExternalOpen = () => {
      setIsOpen(true)
      setStep('sector')
    }
    window.addEventListener('open-media-chat', handleExternalOpen)
    return () => window.removeEventListener('open-media-chat', handleExternalOpen)
  }, [])

  // Fetch sectors on mount
  useEffect(() => {
    const fetchSectors = async () => {
      const sectors = await getSectors()
      if (sectors && sectors.length > 0) {
        setAvailableSectors(sectors)
      } else {
        setAvailableSectors(['Comercial', 'Estoque/Logística', 'Faturamento', 'Financeiro', 'Orçamento'])
      }
    }
    fetchSectors()
  }, [])

  // Histórico de Conversas (Memória)
  useEffect(() => {
    if (sector && step === 'chat') {
      const saved = localStorage.getItem(`media_chat_history_${sector}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const parsedMessages = parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
          setMessages(parsedMessages)
        } catch (e) {
          console.error("Erro ao carregar histórico", e)
        }
      } else {
        setMessages([
          {
            id: 'initial',
            role: 'bot',
            text: `Olá! Sou o MedIA, seu assistente da Arthromed no setor ${sector}. Como posso ajudar hoje?`,
            timestamp: new Date(),
          },
        ])
      }
    }
  }, [sector, step])

  useEffect(() => {
    if (sector && step === 'chat' && messages.length > 0) {
      localStorage.setItem(`media_chat_history_${sector}`, JSON.stringify(messages))
    }
  }, [messages, sector, step])

  const handleStart = () => setStep('sector')

  const handleSelectSector = (s: string) => {
    setSector(s)
    setStep('chat')
  }

  const handleClose = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setActiveSpeech(null)
    }
    if (isDesktop && (window as any).pywebview) {
      (window as any).pywebview.api.close_window()
    } else if (!isDesktop) {
      setIsOpen(false)
    } else {
      try {
        window.close()
      } catch (e) {}
      handleBackToSectors()
    }
  }

  const handleBackToSectors = () => {
    setStep('sector')
    setMessages([])
    setStepSession(null)
  }



  // Suporte a Ctrl+V para colar imagens
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!isOpen || step !== 'chat') return
      
      const items = e.clipboardData?.items
      if (!items) return

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              const base64Full = event.target?.result as string
              const base64Data = base64Full.split(',')[1]
              setAttachedFiles(prev => [...prev, {
                name: `Imagem colada (${new Date().toLocaleTimeString()})`,
                base64: base64Data,
                type: file.type
              }])
              if (!input.trim()) {
                setInput(`Analise esta imagem colada`)
              }
            }
            reader.readAsDataURL(file)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [isOpen, step, input])

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input
    if (!textToSend.trim() || isLoading) return

    const lowInput = textToSend.toLowerCase().trim()
    const changeSectorKeywords = ['mudar de setor', 'trocar de setor', 'mudar setor', 'trocar setor', 'voltar para setores', 'alterar setor']
    
    if (changeSectorKeywords.some(keyword => lowInput.includes(keyword))) {
      handleBackToSectors()
      setInput('')
      return
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
      files: attachedFiles.length > 0 ? attachedFiles.map(f => ({
        name: f.name,
        base64: f.base64,
        type: f.type,
        originalPdfBase64: f.originalPdfBase64
      })) : undefined
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    
    // Armazena cópia do anexo para limpar o estado antes do envio
    const filesToSend = attachedFiles
    setAttachedFiles([])

    try {
      const context = await getContext({
        data: {
          text: textToSend,
          sector: sector || 'Geral',
          history: sessionContext, // Passa o contexto extraído anteriormente
          customProcedures: customProcedures.map(p => ({
            processo: p.processo,
            setor: p.setor,
            sistema: p.sistema,
            conteudo: p.conteudo
          }))
        }
      })

      const botResponse = await generateResponse({
        data: {
          text: textToSend,
          context: context,
          history: messages.map(m => ({ role: m.role, text: m.text })),
          filesData: filesToSend.map(f => ({
            base64: f.base64,
            mimeType: f.type,
            extractedText: f.extractedText
          }))
        }
      })

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: botResponse || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMsg])

      if (botResponse) {
        speakResponseText(botResponse)
      }

      setStepSession(null)
      if (botResponse?.includes('Paciente:') || botResponse?.includes('Médico:')) {
        setSessionContext((prev) => prev + '\n\n' + botResponse)
      }

      // Registra telemetria de uso real no Supabase
      logAiUsage({
        tipo: filesToSend.length > 0 ? 'leitura_guia' : 'chat',
        tempoEconomizado: filesToSend.length > 0 ? 3 : 1
      })
    } catch (error) {

      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'bot',
          text: 'Ocorreu um erro ao conectar com o servidor.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Renderizador de Mensagens com Suporte a Cards de Dados
  const renderMessageContent = (msg: Message) => {
    const text = msg.text || ''
    const lines = text.split('\n')
    
    // Conta quantas linhas têm o formato de par chave-valor negrito, ex: **Paciente**: João
    let keyValMatchCount = 0
    lines.forEach(line => {
      if (line.match(/^\s*[\-\*]*\s*\*\*(Paciente|Médico|Procedimento|Hospital|Material|Data|Setor)\*\*:\s*(.*)/i)) {
        keyValMatchCount++
      }
    })

    // Só ativa o layout de card de extração se encontrar pelo menos 2 campos chave-valor
    const isExtraction = keyValMatchCount >= 2
    
    if (isExtraction) {
      const exportToCSV = (cardData: { label: string; value: string }[]) => {
        const header = cardData.map(c => `"${c.label}"`).join(',')
        const row = cardData.map(c => `"${c.value.replace(/"/g, '""')}"`).join(',')
        const csvContent = `${header}\n${row}`
        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `extracao_media_${new Date().getTime()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }

      const copyToERP = (cardData: { label: string; value: string }[]) => {
        const text = cardData.map(c => `${c.label}: ${c.value}`).join('\n')
        navigator.clipboard.writeText(text)
        alert("Copiado para a área de transferência!")
      }

      const cardData: { icon: any; label: string; value: string }[] = []
      const otherLines: string[] = []

      lines.forEach(line => {
        const match = line.match(/^\s*[\-\*]*\s*\*\*(.*?)\*\*:\s*(.*)/)
        if (match) {
          const label = match[1].trim()
          const value = match[2].trim()
          
          let icon = FileText
          if (label.toLowerCase().includes('paciente')) icon = User
          if (label.toLowerCase().includes('médico')) icon = Shield
          if (label.toLowerCase().includes('hospital')) icon = Landmark
          if (label.toLowerCase().includes('procedimento')) icon = Activity
          if (label.toLowerCase().includes('material')) icon = Layers
          if (label.toLowerCase().includes('data')) icon = Clock

          cardData.push({ icon, label, value })
        } else {
          // Mantém todas as linhas, inclusive vazias, para manter espaçamento
          otherLines.push(line)
        }
      })

      // Remove linhas em branco do início de otherLines
      while (otherLines.length > 0 && !otherLines[0].trim()) {
        otherLines.shift()
      }

      if (cardData.length > 0) {
        // Função auxiliar para renderizar blocos de texto formatados dentro da extração
        const renderTextBlock = (textLines: string[]) => {
          return (
            <div className="space-y-1.5 text-xs text-slate-600 leading-relaxed mt-1 italic">
              {textLines.map((line, i) => {
                if (!line.trim()) return <div key={i} className="h-1" />
                if (line.startsWith('###')) return <h3 key={i} className="font-bold text-sm mt-2 mb-1 text-slate-800 not-italic">{line.replace(/^###\s*/, '')}</h3>
                if (line.startsWith('##')) return <h2 key={i} className="font-bold text-base mt-3 mb-1 text-slate-800 not-italic">{line.replace(/^##\s*/, '')}</h2>
                
                const parts = line.split(/(\*\*.*?\*\*)/g)
                return (
                  <p key={i}>
                    {parts.map((part, pi) => 
                      part.startsWith('**') && part.endsWith('**') 
                        ? <strong key={pi} className="font-bold text-slate-800 not-italic">{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                )
              })}
            </div>
          )
        }

        return (
          <div className="flex flex-col gap-4 w-full">
            {otherLines.length > 0 && otherLines[0].trim() && (
              <div className="text-sm font-semibold text-slate-800 mb-1">
                {otherLines[0].replace(/^#+\s*/, '')}
              </div>
            )}
            <div className="grid grid-cols-1 gap-2.5">
              {cardData.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="mt-0.5 p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500">
                    <item.icon size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{item.label}</span>
                    <span className="text-sm text-slate-700 font-medium leading-tight">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 mt-1">
              <button 
                onClick={() => exportToCSV(cardData)} 
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a2332] text-white rounded-lg text-xs font-semibold hover:bg-[#253043] transition-colors"
              >
                <FileText size={14} /> CSV
              </button>
              <button 
                onClick={() => copyToERP(cardData)} 
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <Copy size={14} /> Copiar (ERP)
              </button>
            </div>

            {msg.role === 'bot' && (
              <div className="mt-2 pt-3 border-t border-slate-100 flex flex-col gap-2">
                {!msg.feedback ? (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>A extração ficou correta?</span>
                    <div className="flex gap-1.5">
                      <button onClick={() => handleFeedback(msg.id, 'up', msg.text)} className="p-1.5 bg-slate-50 hover:bg-green-100 hover:text-green-600 rounded-md transition-colors"><ThumbsUp size={14}/></button>
                      <button onClick={() => handleFeedback(msg.id, 'down', msg.text)} className="p-1.5 bg-slate-50 hover:bg-red-100 hover:text-red-600 rounded-md transition-colors"><ThumbsDown size={14}/></button>
                    </div>
                  </div>
                ) : msg.feedback === 'down' && !msg.feedbackComment ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-red-500 font-medium">O que faltou ou veio errado?</span>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        id={`feedback-input-${msg.id}`}
                        placeholder="Ex: Não pegou o CID correto..." 
                        className="flex-1 text-xs px-2 py-1.5 border border-red-200 rounded-md outline-none focus:border-red-400 bg-white"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value
                            if(val.trim()) handleFeedbackComment(msg.id, val)
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById(`feedback-input-${msg.id}`) as HTMLInputElement
                          if(input.value.trim()) handleFeedbackComment(msg.id, input.value)
                        }}
                        className="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-md text-xs font-semibold hover:bg-red-100 cursor-pointer"
                      >
                        Enviar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    {msg.feedback === 'up' ? <ThumbsUp size={12} className="text-green-500"/> : <ThumbsDown size={12} className="text-red-500"/>}
                    <span>Obrigado pelo feedback!</span>
                  </div>
                )}
              </div>
            )}

            {otherLines.length > 1 && renderTextBlock(otherLines.slice(1))}
          </div>
        )
      }
    }

    // Renderização Markdown aprimorada (Organizada)
    const blocks: { type: string; content?: string; items?: string[] }[] = []
    let currentList: { type: 'bullet' | 'number'; items: string[] } | null = null

    const flushList = () => {
      if (currentList) {
        blocks.push({
          type: currentList.type === 'bullet' ? 'bullet_list' : 'numbered_list',
          items: currentList.items
        })
        currentList = null
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed) {
        flushList()
        // Adiciona um divisor de parágrafo se o anterior não for um divisor
        if (blocks.length > 0 && blocks[blocks.length - 1].type !== 'spacer') {
          blocks.push({ type: 'spacer' })
        }
        return
      }

      // Imagens Markdown em linha ou isoladas: ![alt](url_ou_data)
      const imgRegex = /!\[(.*?)\]\((.*?)\)/g
      if (line.includes('![') && line.includes('](')) {
        flushList()
        let lastIndex = 0
        let match: RegExpExecArray | null
        while ((match = imgRegex.exec(line)) !== null) {
          const before = line.slice(lastIndex, match.index).trim()
          if (before) {
            blocks.push({ type: 'paragraph', content: before })
          }
          blocks.push({
            type: 'image',
            content: match[2],
            items: [match[1] || 'Foto do Passo a Passo']
          })
          lastIndex = imgRegex.lastIndex
        }
        const after = line.slice(lastIndex).trim()
        if (after) {
          blocks.push({ type: 'paragraph', content: after })
        }
        return
      }

      // Headings
      if (trimmed.startsWith('###')) {
        flushList()
        blocks.push({ type: 'h3', content: trimmed.replace(/^###\s*/, '') })
        return
      }
      if (trimmed.startsWith('##')) {
        flushList()
        blocks.push({ type: 'h2', content: trimmed.replace(/^##\s*/, '') })
        return
      }
      if (trimmed.startsWith('#')) {
        flushList()
        blocks.push({ type: 'h1', content: trimmed.replace(/^#\s*/, '') })
        return
      }

      // Blockquotes
      if (trimmed.startsWith('>')) {
        flushList()
        blocks.push({ type: 'blockquote', content: trimmed.replace(/^>\s*/, '') })
        return
      }

      // Listas ordenadas (numéricas)
      const numberMatch = line.match(/^(\s*)\d+[\.)\-]\s+(.*)/)
      if (numberMatch) {
        const itemContent = numberMatch[2]
        if (currentList && currentList.type === 'number') {
          currentList.items.push(itemContent)
        } else {
          flushList()
          currentList = { type: 'number', items: [itemContent] }
        }
        return
      }

      // Listas não ordenadas (bullet)
      const bulletMatch = line.match(/^(\s*)[\-\*•]\s+(.*)/)
      if (bulletMatch) {
        const itemContent = bulletMatch[2]
        if (currentList && currentList.type === 'bullet') {
          currentList.items.push(itemContent)
        } else {
          flushList()
          currentList = { type: 'bullet', items: [itemContent] }
        }
        return
      }

      // Texto normal (Parágrafo)
      flushList()
      blocks.push({ type: 'paragraph', content: line })
    })

    flushList()

    const renderTextWithFormatting = (txt: string) => {
      // Divide por negrito ** e inline code `
      const parts = txt.split(/(\*\*.*?\*\*|`.*?`)/g)
      return parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="font-bold text-slate-800">{part.slice(2, -2)}</strong>
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return <code key={idx} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-lg text-xs font-mono text-rose-500">{part.slice(1, -1)}</code>
        }
        return part
      })
    }

    const renderItemContent = (itemText: string) => {
      const match = itemText.match(/!\[(.*?)\]\((.*?)\)/)
      if (!match) {
        return renderTextWithFormatting(itemText)
      }
      const before = itemText.slice(0, match.index).trim()
      const alt = match[1] || 'Foto do Passo'
      const src = match[2]
      const after = itemText.slice(match.index! + match[0].length).trim()
      const isBase64 = src.startsWith('data:')
      const base64Data = isBase64 ? src.split(',')[1] : ''

      return (
        <div className="space-y-2 w-full">
          {before && <div>{renderTextWithFormatting(before)}</div>}
          <div 
            onClick={() => setPreviewFile({
              name: alt,
              base64: base64Data,
              type: 'image/png',
              url: !isBase64 ? src : undefined
            })}
            className="my-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 max-h-[300px] flex items-center justify-center cursor-pointer group relative shadow-2xs"
          >
            <img src={src} alt={alt} className="w-full max-h-[300px] object-contain group-hover:scale-[1.01] transition-transform" />
            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-3 py-1.5 bg-slate-900/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md">
                <Maximize2 size={12} /> Clique para ampliar
              </span>
            </div>
          </div>
          {after && <div>{renderTextWithFormatting(after)}</div>}
        </div>
      )
    }

    return (
      <div className="space-y-2 text-sm text-slate-700">
        {blocks.map((block, i) => {
          switch (block.type) {
            case 'h1':
              return <h1 key={i} className="font-bold text-xl text-[#1a2332] mt-4 mb-2 border-b border-slate-100 pb-1">{renderTextWithFormatting(block.content || '')}</h1>
            case 'h2':
              return <h2 key={i} className="font-bold text-lg text-[#1a2332] mt-3 mb-2 border-b border-slate-100 pb-0.5">{renderTextWithFormatting(block.content || '')}</h2>
            case 'h3':
              return <h3 key={i} className="font-semibold text-base text-[#1a2332] mt-2 mb-1">{renderTextWithFormatting(block.content || '')}</h3>
            case 'blockquote':
              return <blockquote key={i} className="border-l-4 border-slate-200 pl-3.5 italic my-2.5 text-slate-500 bg-slate-50/50 p-2.5 rounded-r-xl">{renderTextWithFormatting(block.content || '')}</blockquote>
            case 'image': {
              const src = block.content || ''
              const alt = block.items?.[0] || 'Foto do Passo a Passo'
              const isBase64 = src.startsWith('data:')
              const base64Data = isBase64 ? src.split(',')[1] : ''

              return (
                <div key={i} className="my-3 rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50/60 shadow-xs group">
                  <div 
                    onClick={() => setPreviewFile({
                      name: alt,
                      base64: base64Data,
                      type: 'image/png',
                      url: !isBase64 ? src : undefined
                    })}
                    className="relative cursor-pointer overflow-hidden bg-slate-900/5 flex items-center justify-center max-h-[380px]"
                  >
                    <img 
                      src={src} 
                      alt={alt} 
                      className="w-full max-h-[380px] object-contain transition-transform duration-200 group-hover:scale-[1.01]" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="px-3.5 py-1.5 bg-slate-900/90 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs">
                        <Maximize2 size={13} />
                        <span>Clique para ampliar foto</span>
                      </span>
                    </div>
                  </div>
                  {alt && (
                    <div className="px-3.5 py-2 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-700">
                      <span className="font-semibold flex items-center gap-1.5 truncate">
                        <ImageIcon size={14} className="text-blue-600 shrink-0" />
                        <span>{alt}</span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                        Passo a Passo
                      </span>
                    </div>
                  )}
                </div>
              )
            }
            case 'bullet_list':
              return (
                <ul key={i} className="list-disc pl-5 space-y-1.5 my-2">
                  {block.items?.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{renderItemContent(item)}</li>
                  ))}
                </ul>
              )
            case 'numbered_list':
              return (
                <ol key={i} className="list-decimal pl-5 space-y-1.5 my-2">
                  {block.items?.map((item, idx) => (
                    <li key={idx} className="leading-relaxed">{renderItemContent(item)}</li>
                  ))}
                </ol>
              )
            case 'spacer':
              return <div key={i} className="h-1.5" />
            case 'paragraph':
            default:
              return <p key={i} className="leading-relaxed">{renderTextWithFormatting(block.content || '')}</p>
          }
        })}
      </div>
    )
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      // Limite de 5MB para evitar estouro de memória no Worker
      if (file.size > 5 * 1024 * 1024) {
        alert(`Arquivo ${file.name} muito grande! Por favor, use arquivos menores que 5MB.`)
        return
      }

      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64Full = event.target?.result as string
        const base64Data = base64Full.split(',')[1]
        
        let finalBase64 = base64Data
        let extractedText = ""
        let fileType = file.type
        const originalPdfBase64 = file.type === 'application/pdf' ? base64Data : undefined

        // 1. Tenta extrair via Python (Se estiver no Desktop App)
        if (file.type === 'application/pdf' && (window as any).pywebview?.api?.extract_pdf_text) {
        setIsLoading(true)
        try {
          const result = await (window as any).pywebview.api.extract_pdf_text(base64Data)
          if (result.success) {
             if (result.text && result.text.trim().length > 0) {
               extractedText = result.text
               // Mantém finalBase64 = base64Data para visualização local no chat
             } else if (result.image) {
               finalBase64 = result.image
               fileType = result.mimeType || 'image/png'
               extractedText = "" 
             }
          }
        } catch (err) {
          console.error("Erro na ponte Python:", err)
        } finally {
          setIsLoading(false)
        }
      }

      // 2. Tenta extrair via Web (Se o Python não estiver disponível ou falhar na extração de texto)
      if (file.type === 'application/pdf' && !extractedText) {
        setIsLoading(true)
        try {
          const pdfjsModule = await import('pdfjs-dist')
          const pdfjs = pdfjsModule.default || pdfjsModule
          
          // Configura o worker via CDN robusto correspondendo à versão instalada
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs`
          
          const binaryString = atob(base64Data)
          const bytes = new Uint8Array(binaryString.length)
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
          }

          const loadingTask = pdfjs.getDocument({ data: bytes })
          const pdf = await loadingTask.promise
          let fullText = ""
          
          for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) { // Limite de 10 páginas para performance
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str).join(" ")
            fullText += pageText + "\n"
          }

          if (fullText.trim().length > 0) {
            extractedText = fullText
            // Mantém finalBase64 = base64Data para visualização local no chat
          } else {
            // PDF Escaneado na Web: Renderiza a primeira página como imagem PNG usando Canvas!
            try {
              const page = await pdf.getPage(1)
              const viewport = page.getViewport({ scale: 1.5 })
              
              const canvas = document.createElement('canvas')
              canvas.width = viewport.width
              canvas.height = viewport.height
              const ctx = canvas.getContext('2d')
              
              if (ctx) {
                await page.render({
                  canvasContext: ctx,
                  viewport: viewport,
                  canvas: canvas
                }).promise
                
                const imgUrl = canvas.toDataURL('image/png')
                finalBase64 = imgUrl.split(',')[1]
                fileType = 'image/png'
                extractedText = ""
              }
            } catch (renderErr) {
              console.error("Erro ao renderizar página do PDF escaneado na web:", renderErr)
            }
          }
        } catch (err) {
          console.error("Erro na extração PDF Web:", err)
        } finally {
          setIsLoading(false)
        }
      }

      setAttachedFiles(prev => [...prev, {
        name: file.name,
        base64: finalBase64,
        type: fileType,
        extractedText: extractedText,
        originalPdfBase64: originalPdfBase64
      }])

      // Sugere ao usuário o que fazer após anexar
      if (!input.trim()) {
        const actionText = file.type.includes('image') ? 'analise esta imagem' : 'analise este documento'
        setInput(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} para mim.`)
      }
    }
    
    reader.readAsDataURL(file)
    })
  }

  return (
    <div className={cn(
      isDesktop ? "w-full h-full" : "fixed inset-0 z-50 pointer-events-none",
      "font-sans"
    )}>
      <AnimatePresence>
        {(isOpen || isDesktop) && (
          <motion.div
            initial={isDesktop ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              'bg-white flex flex-col shadow-[0_10px_40px_rgba(26,35,50,0.15)] overflow-hidden pointer-events-auto',
              isDesktop 
                ? 'w-full h-full' 
                : 'fixed inset-0 z-50 md:bottom-24 md:right-8 md:w-[420px] md:h-[680px] md:inset-auto md:rounded-[1.5rem] md:border md:border-slate-200/60'
            )}
          >
            {/* Modular Corporate Header */}
            {step !== 'chamados_ti' && step !== 'gop' && step !== 'treinamentos' && step !== 'treinaflix' && (
              <ChatHeader
                step={step}
                sector={sector || undefined}
                onBackToMenu={() => setStep('onboarding')}
                onClose={handleClose}
                isDesktop={isDesktop}
                canShowHistory={canShowHistoryButton()}
                onOpenHistory={() => setIsHistoryModalOpen(true)}
                onOpenAddProcedure={() => {
                  setProcedureModalData(null)
                  setProcedureModalMode('create')
                  setIsProcedureModalOpen(true)
                }}
                isSpeechEnabled={isSpeechEnabled}
                onToggleSpeech={toggleSpeech}
                onOpenDashboard={handleSelectMetrics}
                onOpenFatureIA={() => setStep('fature_ia')}
                onClearHistory={() => {
                  if (confirm('Deseja limpar o histórico desta conversa?')) {
                    setMessages([{
                      id: 'initial',
                      role: 'bot',
                      text: `Olá! Sou o MedIA, seu assistente da Arthromed no setor ${sector}. Como posso ajudar hoje?`,
                      timestamp: new Date(),
                    }])
                    localStorage.removeItem(`media_chat_history_${sector}`)
                  }
                }}
                onOpenPortalPasswords={() => setIsPortalPasswordsModalOpen(true)}
                onOpenDevDocs={handleSelectDevDocs}
              />
            )}

            <div className="flex-1 flex flex-col overflow-hidden relative">
              <AnimatePresence mode="wait">
                {step === 'onboarding' && (
                  <motion.div key="step-onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                    <ChatOnboarding 
                      onStart={handleSelectChatbotModule} 
                      onOpenNoc={handleSelectNocModule}
                      onOpenPortfolio={() => {
                        const portfolioUrl = localStorage.getItem('portfolio_url') || 'https://portifolioarthromed-medic.vercel.app'
                        window.open(portfolioUrl, '_blank')
                      }}
                      onOpenMedicPortfolio={() => {
                        const medicPortfolioUrl = localStorage.getItem('medic_portfolio_url') || 'https://medic-portfolio.vercel.app/'
                        window.open(medicPortfolioUrl, '_blank')
                      }}
                      onOpenSolicitacaoMedica={handleSelectDocClinicaModule}
                      onOpenChamadosTi={handleSelectChamadosTiModule}
                      onOpenTreinamentos={handleSelectTreinamentosModule}
                      onOpenTreinaFlix={handleSelectTreinaFlixModule}
                      onOpenDevDocs={handleSelectDevDocs}
                      onOpenMetrics={handleSelectMetrics}
                      isAuthenticated={!!session?.user}
                    />
                  </motion.div>
                )}

                {step === 'dashboard' && (
                  <motion.div key="step-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto w-full bg-[#f8fafc]">
                    <AdminDashboard onBack={() => setStep('onboarding')} />
                  </motion.div>
                )}

                {step === 'login' && (
                  <motion.div key="step-login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto w-full flex items-center justify-center p-4">
                    <LoginScreen 
                      onSuccess={handleLoginSuccess}
                      onBackToMenu={() => setStep('onboarding')}
                    />
                  </motion.div>
                )}

                {step === 'gop' && (
                  <motion.div key="step-gop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                    <GopPanel 
                      onPreviewFile={setPreviewFile}
                      onBackToMenu={() => setStep('onboarding')}
                      onClose={handleClose}
                      onOpenPortalPasswords={() => setIsPortalPasswordsModalOpen(true)}
                    />
                  </motion.div>
                )}

                {step === 'doc_clinica' && (
                  <motion.div key="step-doc-clinica" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                    <ClinicalDocPanel />
                  </motion.div>
                )}

                {step === 'chamados_ti' && (
                  <motion.div key="step-chamados-ti" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                    <ChamadosTiPanel 
                      onBackToMenu={() => setStep('onboarding')}
                      onClose={handleClose}
                      onOpenPortalPasswords={() => setIsPortalPasswordsModalOpen(true)}
                      onOpenAgendasModal={() => setIsAgendasModalOpen(true)}
                      onOpenHospedagemModal={() => setIsHospedagemModalOpen(true)}
                    />
                  </motion.div>
                )}

                {step === 'treinamentos' && (
                  <motion.div key="step-treinamentos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                    <TreinamentosModal 
                      onClose={() => setStep('onboarding')} 
                      userSector={sector || (typeof window !== 'undefined' ? localStorage.getItem('userSector') : null) || ''}
                      userLevel={typeof window !== 'undefined' ? localStorage.getItem('userLevel') || '' : ''}
                      userName={typeof window !== 'undefined' ? localStorage.getItem('userName') || '' : ''}
                    />
                  </motion.div>
                )}

                {step === 'treinaflix' && (
                  <motion.div key="step-treinaflix" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                    <CatalogoVideosModal 
                      onClose={() => setStep('onboarding')} 
                    />
                  </motion.div>
                )}

                {step === 'sector' && (
                  <motion.div key="step-sector" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                    <ChatSectorSelect availableSectors={availableSectors} onSelectSector={handleSelectSector} />
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div
                    key="step-chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col overflow-hidden bg-white"
                  >
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#f8fafc] dark:bg-[#090d16] transition-colors"
                    >
                      {messages.map((msg, idx) => (
                        <ChatMessageItem
                          key={`${msg.id || 'msg'}-${idx}`}
                          message={msg}
                          onPreviewFile={setPreviewFile}
                          onFeedback={saveGlobalFeedback}
                          onOpenEditProcedure={handleOpenEditProcedure}
                          onOpenDeleteProcedure={handleOpenDeleteProcedure}
                          renderCustomContent={(m) => renderMessageContent(m)}
                        />
                      ))}
                      {isLoading && (
                        <div className="flex items-start gap-3 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1f29de] to-[#4338ca] flex items-center justify-center text-white shrink-0 mt-1 shadow-2xs">
                            <Bot size={14} />
                          </div>
                          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-sm flex gap-1.5 h-12 items-center">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    <ChatInputBar
                      input={input}
                      setInput={setInput}
                      onSend={(text) => handleSend(text)}
                      isLoading={isLoading}
                      attachedFiles={attachedFiles}
                      onFileUpload={handleFileUpload}
                      onRemoveFile={(idx) => setAttachedFiles(prev => prev.filter((_, i) => i !== idx))}
                      suggestions={
                        attachedFiles.length > 0
                          ? ["Resumir Pedido", "Checar Autorização", "Extrair apenas CID", "Extrair Materiais"]
                          : messages.length < 3 ? ["Análise de Pendências", "Emissão de Nota Fiscal", "Consultar Glosas", "Status de Orçamento"] : []
                      }
                    />
                  </motion.div>
                )}

                {step === 'fature_ia' && (
                  <motion.div key="step-fature-ia" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col overflow-hidden">
                    <FatureIA onBack={() => setStep('chat')} />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Gestão de Procedimentos com Fotos */}
      <ProcedureManageModal
        isOpen={isProcedureModalOpen}
        mode={procedureModalMode}
        initialData={procedureModalData || undefined}
        currentSector={sector || 'Orçamento'}
        onClose={() => setIsProcedureModalOpen(false)}
        onSaveSuccess={(item, action) => {
          loadProcedures(sector || undefined)
          const procTitle = (item as any)?.processo || 'Procedimento'
          if (action === 'created') {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'bot',
              text: `✅ **Procedimento Cadastrado com Sucesso!**\nO procedimento **"${procTitle}"** com fotos passo a passo foi salvo e está ativo para consultas imediatas no chat.`,
              timestamp: new Date()
            }])
          } else if (action === 'updated') {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'bot',
              text: `✏️ **Procedimento Atualizado!**\nAs alterações e fotos de **"${procTitle}"** foram gravadas com sucesso.`,
              timestamp: new Date()
            }])
          } else if (action === 'deleted') {
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'bot',
              text: `🗑️ **Procedimento Removido!**\nO procedimento foi desativado das consultas.`,
              timestamp: new Date()
            }])
          }
        }}
      />

      {/* Modal de Histórico de Procedimentos */}
      {isHistoryModalOpen && (
        <ProcedureHistoryModal
          onClose={() => setIsHistoryModalOpen(false)}
          userSector={sector || localStorage.getItem('userSector') || undefined}
        />
      )}

      {/* Modal de Senhas dos Portais (Comercial Interno) */}
      <PortalPasswordsModal
        isOpen={isPortalPasswordsModalOpen}
        onClose={() => setIsPortalPasswordsModalOpen(false)}
      />

      {/* Modal de Agendas Locais */}
      <AgendasLocaisModal
        isOpen={isAgendasModalOpen}
        onClose={() => setIsAgendasModalOpen(false)}
      />

      {/* Modal de Hospedagem */}
      <HospedagemModal
        isOpen={isHospedagemModalOpen}
        onClose={() => setIsHospedagemModalOpen(false)}
      />

      {/* Modal de Pré-visualização Premium */}
      <FilePreviewModal 
        previewFile={previewFile}
        previewUrl={previewUrl}
        imgZoom={imgZoom}
        setImgZoom={setImgZoom}
        onClose={() => setPreviewFile(null)}
      />

      {/* Modal de Documentação Técnica & API Reference (Devs) */}
      <DeveloperDocsModal
        isOpen={isDevDocsModalOpen}
        onClose={() => setIsDevDocsModalOpen(false)}
        onRequireLogin={() => {
          setIsDevDocsModalOpen(false)
          setPendingModule('dev_docs')
          setStep('login')
        }}
      />

      {/* Toggle Button */}
      {!isDesktop && (!hideToggle || isOpen) && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 pointer-events-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'p-4 md:p-5 rounded-full transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95',
              isOpen
                ? 'bg-white text-[#1a2332] rotate-90 shadow-xl hidden md:flex' // Hide toggle on mobile when open since it's full screen
                : 'bg-[#1a2332] hover:bg-[#0f172a] text-white border-2 border-white/20 shadow-lg shadow-[#1a2332]/20'
            )}
          >
            {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
          </button>
        </div>
      )}
    </div>
  )
}
