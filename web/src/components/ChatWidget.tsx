import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, Bot, Layers, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getContext, generateResponse, getSectors } from '../lib/chat'
import { cn } from '../lib/utils'

type Message = {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: Date
}

export const ChatWidget = ({ isDesktop = false }: { isDesktop?: boolean }) => {
  const [isOpen, setIsOpen] = useState(isDesktop)
  
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
  const [step, setStep] = useState<'onboarding' | 'sector' | 'chat'>('onboarding')
  const [sector, setSector] = useState<string>('')
  const [availableSectors, setAvailableSectors] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [stepSession, setStepSession] = useState<{
    steps: string[]
    current: number
    intro: string
  } | null>(null)

  // Detecta passos numerados na resposta do bot
  const parseSteps = (text: string): { intro: string; steps: string[] } | null => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
    const steps: string[] = []
    const introLines: string[] = []
    for (const line of lines) {
      if (/^\d+[\.)\-]\s+.+/.test(line)) {
        steps.push(line)
      } else if (steps.length === 0) {
        introLines.push(line)
      }
    }
    return steps.length >= 2 ? { intro: introLines.join(' '), steps } : null
  }
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const handleExternalOpen = (e: any) => {
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
        setAvailableSectors(['Comercial', 'Faturamento', 'Financeiro', 'Orçamento - Arthromed', 'Orçamento - Medic'])
      }
    }
    fetchSectors()
  }, [])

  const handleStart = () => setStep('sector')

  const handleSelectSector = (s: string) => {
    setSector(s)
    setStep('chat')
    setMessages([
      {
        id: 'initial',
        role: 'bot',
        text: `Olá! Sou o MedIA, seu assistente da Arthromed no setor ${s}. Como posso ajudar hoje?`,
        timestamp: new Date(),
      },
    ])
  }

  const handleClose = () => {
    if (isDesktop && (window as any).pywebview) {
      (window as any).pywebview.api.close_window()
    } else {
      setIsOpen(false)
    }
  }

  const handleBackToSectors = () => {
    setStep('sector')
    setMessages([])
    setStepSession(null)
  }

  const handleStepYes = () => {
    if (!stepSession) return
    const next = stepSession.current + 1
    if (next >= stepSession.steps.length) {
      setStepSession(null)
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'bot',
        text: '✅ Processo concluído! Posso te ajudar com mais alguma coisa?',
        timestamp: new Date(),
      }])
    } else {
      setStepSession(prev => prev ? { ...prev, current: next } : null)
    }
  }

  const handleStepNo = () => {
    if (!stepSession) return
    const stepNum = stepSession.current + 1
    const stepText = stepSession.steps[stepSession.current].replace(/^\d+[\.)\-]\s*/, '')
    setStepSession(null)
    setInput(`Não entendi o passo ${stepNum}. Pode explicar melhor: "${stepText}"?`)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const lowInput = input.toLowerCase().trim()
    const changeSectorKeywords = ['mudar de setor', 'trocar de setor', 'mudar setor', 'trocar setor', 'voltar para setores', 'alterar setor']
    
    if (changeSectorKeywords.some(keyword => lowInput.includes(keyword))) {
      handleBackToSectors()
      setInput('')
      return
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const context = await getContext({
        data: {
          text: input,
          sector: sector,
        }
      })

      const botResponse = await generateResponse({
        data: {
          text: input,
          context: context,
        }
      })

      const parsed = parseSteps(botResponse || '')
      if (parsed) {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: parsed.intro || 'Vou te guiar pelos passos:',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMsg])
        setStepSession({ ...parsed, current: 0 })
      } else {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: botResponse || 'Desculpe, não consegui processar sua solicitação.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMsg])
      }
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

  return (
    <div className={cn(
      isDesktop ? "w-full h-full" : "fixed bottom-6 right-6 z-50",
      "font-sans"
    )}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              isDesktop ? "w-full h-full border-none rounded-none mb-0" : "w-[380px] h-[520px] rounded-[2rem] border border-slate-200 mb-4 shadow-2xl",
              "bg-white flex flex-col overflow-hidden"
            )}
          >
            {/* Header */}
            <div className="bg-[var(--color-primary)]/10 p-6 flex justify-between items-center text-[var(--color-primary)]">
              <div className="flex items-center gap-3">
                <div className="bg-[var(--color-primary)]/20 p-2.5 rounded-xl">
                  <img src="/logo.png" className="h-6 w-6 object-contain" alt="Logo" />
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-tight">MedIA</h3>
                  <p className="text-xs opacity-80">
                    {step === 'chat' ? `Setor: ${sector}` : 'Assistente Arthromed'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {step === 'chat' && (
                  <button
                    onClick={handleBackToSectors}
                    className="hover:bg-[var(--color-primary)]/20 p-1.5 rounded-full transition-colors"
                    title="Mudar Setor"
                  >
                    <ArrowLeft size={20} />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="hover:bg-red-500/10 hover:text-red-500 p-1.5 rounded-full transition-all duration-200"
                  title={isDesktop ? "Encerrar Programa" : "Fechar Chat"}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden relative">
              <AnimatePresence mode="wait">
                {step === 'onboarding' && (
                  <motion.div
                    key="onboarding"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center p-8 mesh-bg"
                  >
                    {/* Logo Section */}
                    <div className="mt-4 mb-8 relative">
                      <div className="absolute inset-0 bg-[var(--color-primary)] opacity-10 blur-3xl rounded-full" />
                      <div className="relative glass-card p-6 rounded-[2.5rem] shadow-xl">
                        <img src="/logo.png" className="h-16 w-16 object-contain" alt="Logo" />
                      </div>
                    </div>

                    {/* Text Section */}
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-black text-[var(--sea-ink)] mb-2 tracking-tight">
                        Bem-vindo ao <span className="media-text-gradient">MedIA</span>
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-primary)] opacity-60 mb-4">
                        Sistema de Assistência Virtual
                      </p>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
                        Plataforma inteligente especializada em processos internos, gestão de materiais e suporte técnico.
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-3 gap-3 w-full mb-10">
                      <div className="feature-icon-box">
                        <div className="text-[var(--color-primary)] mb-2"><Zap size={20} /></div>
                        <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Respostas<br/>Rápidas</span>
                      </div>
                      <div className="feature-icon-box">
                        <div className="text-[var(--color-accent)] mb-2"><Shield size={20} /></div>
                        <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Seguro e<br/>Confiável</span>
                      </div>
                      <div className="feature-icon-box">
                        <div className="text-[var(--color-medic-blue)] mb-2"><Clock size={20} /></div>
                        <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">24/7<br/>Disponível</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={handleStart}
                      className="w-full rounded-2xl media-gradient media-glow py-4.5 text-lg font-bold text-white transition-all hover:-translate-y-1 hover:brightness-110 active:scale-95 shadow-lg flex items-center justify-center gap-2"
                    >
                      <span>Iniciar Atendimento</span>
                      <ArrowRight size={20} />
                    </button>
                  </motion.div>
                )}

                {step === 'sector' && (
                  <motion.div
                    key="sector"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 flex flex-col p-6 overflow-y-auto mesh-bg"
                  >
                    <div className="mb-8 text-center">
                      <div className="inline-flex p-4 glass-card rounded-2xl text-[var(--color-primary)] mb-4 shadow-sm">
                        <Layers size={32} />
                      </div>
                      <h2 className="text-2xl font-black text-[var(--sea-ink)] mb-2">Seleção de Departamento</h2>
                      <p className="text-slate-500 text-xs px-4">Escolha sua área para personalizar o atendimento e fornecer informações precisas.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {availableSectors.length > 0 ? (
                        availableSectors.map((s, index) => {
                          const getIcon = (name: string) => {
                            if (name.includes('Comercial')) return <TrendingUp size={24} />;
                            if (name.includes('Faturamento')) return <FileText size={24} />;
                            if (name.includes('Financeiro')) return <CreditCard size={24} />;
                            if (name.includes('Orçamento')) return <Calculator size={24} />;
                            return <Briefcase size={24} />;
                          };

                          return (
                            <motion.button
                              key={s}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleSelectSector(s)}
                              className="group glass-card p-5 rounded-2xl border border-white flex flex-col items-center gap-3 transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95"
                            >
                              <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                                {getIcon(s)}
                              </div>
                              <span className="font-bold text-[13px] text-slate-700 text-center leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                                {s}
                              </span>
                            </motion.button>
                          );
                        })
                      ) : (
                        <div className="col-span-2 text-center py-10 opacity-50">Carregando setores...</div>
                      )}
                    </div>

                    <p className="mt-8 text-center text-[10px] text-slate-400 font-medium">
                      Caso não encontre seu departamento, entre em contato com o suporte.
                    </p>
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col overflow-hidden mesh-bg"
                  >
                    {/* Chat List */}
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-4 space-y-6"
                    >
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex items-start gap-3 max-w-[90%] animate-in fade-in slide-in-from-bottom-2 duration-300',
                            msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                          )}
                        >
                          <div
                            className={cn(
                              'p-2 rounded-xl shrink-0 shadow-sm',
                              msg.role === 'user' ? 'media-gradient text-white' : 'glass-card text-[var(--color-primary)]'
                            )}
                          >
                            {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                          </div>
                          <div
                            className={cn(
                              'p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm',
                              msg.role === 'user'
                                ? 'media-gradient text-white rounded-tr-none'
                                : 'glass-card text-slate-700 rounded-tl-none border-white/50'
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-start gap-3 animate-pulse">
                          <div className="p-2 rounded-xl glass-card text-slate-300">
                            <Bot size={18} />
                          </div>
                          <div className="glass-card p-4 rounded-2xl rounded-tl-none border-white/50">
                            <div className="flex gap-1.5">
                              <span className="w-2 h-2 bg-[var(--color-primary)]/30 rounded-full animate-bounce"></span>
                              <span className="w-2 h-2 bg-[var(--color-primary)]/30 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                              <span className="w-2 h-2 bg-[var(--color-primary)]/30 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step UI (Fica flutuando sobre o input) */}
                    {stepSession && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mx-4 mb-2 rounded-2xl border border-white/50 glass-card shadow-xl overflow-hidden"
                      >
                        {/* Barra de progresso */}
                        <div className="h-1.5 bg-slate-100">
                          <div
                            className="h-full transition-all duration-500"
                            style={{
                              width: `${((stepSession.current + 1) / stepSession.steps.length) * 100}%`,
                              background: 'linear-gradient(90deg, #007B8F, #4A90E2)'
                            }}
                          />
                        </div>
                        {/* Header do passo */}
                        <div className="flex items-center justify-between px-4 pt-3 pb-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
                            Passo {stepSession.current + 1} de {stepSession.steps.length}
                          </span>
                          <button onClick={() => setStepSession(null)} className="text-slate-400 hover:text-slate-600 text-xs transition-colors">✕</button>
                        </div>
                        {/* Texto do passo */}
                        <p className="px-4 pb-3 text-sm font-semibold text-slate-700 leading-relaxed">
                          {stepSession.steps[stepSession.current].replace(/^\d+[\.)\-]\s*/, '')}
                        </p>
                        {/* Botões */}
                        <div className="flex gap-2 px-4 pb-4">
                          <button
                            onClick={handleStepYes}
                            className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                            style={{ background: 'linear-gradient(135deg, #007B8F, #4A90E2)' }}
                          >
                            ✅ Sim, feito!
                          </button>
                          <button
                            onClick={handleStepNo}
                            className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-bold hover:bg-slate-200 transition-all active:scale-95"
                          >
                            ❌ Preciso de ajuda
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white border-top border-slate-100">
                      <div className={cn("relative flex items-center gap-2 p-1 rounded-xl transition-all input-branded-focus")}>
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          placeholder="Digite sua dúvida..."
                          className="w-full pl-4 pr-12 py-3 bg-slate-50 border-none rounded-lg text-sm outline-none transition-all"
                        />
                        <button
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          className="absolute right-2 p-2 bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                      <p className="text-[10px] text-center mt-3 text-slate-400 uppercase tracking-widest font-bold">
                        Powered by MedIA • Arthromed/Medic
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!isDesktop && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'p-5 rounded-full transition-all duration-300 flex items-center justify-center transform hover:scale-110 active:scale-95',
              isOpen
                ? 'bg-white text-[var(--color-primary)] rotate-90 shadow-xl'
                : 'media-gradient media-glow text-white border-2 border-white/20'
            )}
          >
            {isOpen ? <X size={32} /> : <MessageCircle size={32} />}
          </button>
        </div>
      )}
    </div>
  )
}
