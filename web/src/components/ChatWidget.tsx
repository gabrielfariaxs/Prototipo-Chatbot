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

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false)
  
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

  const handleBackToSectors = () => {
    setStep('sector')
    setMessages([])
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

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: botResponse || 'Desculpe, não consegui processar sua solicitação.',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMsg])
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
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[380px] h-[600px] bg-white rounded-[2rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200 mb-4"
          >
            {/* Header */}
            <div className="bg-[var(--gradient-header)] p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2.5 rounded-xl">
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
                    className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                    title="Mudar Setor"
                  >
                    <Layers size={20} />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex-1 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="mb-6 p-8 media-gradient media-glow rounded-[2.5rem] text-white animate-pulse-slow opacity-30">
                      <img src="/logo.png" className="h-16 w-16 object-contain" alt="Logo" />
                    </div>
                    <p className="text-[var(--color-primary)] font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
                      Arthromed + Medic = <span className="text-[var(--color-medic-pink)]">MedIA</span>
                    </p>
                    <h2 className="text-3xl font-extrabold text-[var(--sea-ink)] mb-4 leading-tight">
                      Seu Assistente<br/>
                      <span className="text-4xl media-text-gradient">MedIA Virtual.</span>
                    </h2>
                    <p className="text-slate-500 text-sm mb-10 leading-relaxed">
                      Especialista em processos internos,<br/>
                      materiais e suporte técnico.
                    </p>
                    <button
                      onClick={handleStart}
                      className="w-full rounded-2xl media-gradient media-glow py-4 text-lg font-bold text-white transition hover:-translate-y-1 hover:scale-[1.02] active:scale-95 opacity-60"
                    >
                      Começar agora
                    </button>
                  </motion.div>
                )}

                {step === 'sector' && (
                  <motion.div
                    key="sector"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col p-8 overflow-y-auto"
                  >
                    <div className="mb-8">
                      <div className="inline-block p-3 bg-[var(--color-primary)]/10 rounded-2xl text-[var(--color-primary)] mb-4">
                        <Layers size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-[var(--sea-ink)] mb-2">Selecione seu Setor</h2>
                      <p className="text-slate-500 text-sm">Para fornecer as melhores respostas, precisamos saber qual sua área de atuação.</p>
                    </div>
                    
                    <div className="space-y-4">
                      {availableSectors.length > 0 ? (
                        availableSectors.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSelectSector(s)}
                            className="w-full flex items-center justify-between p-5 rounded-2xl border-2 border-slate-100 sector-button-hover transition-all shadow-sm"
                          >
                            <span className="font-bold text-slate-700">{s}</span>
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-colors">
                               <Send size={14} className="ml-0.5" />
                             </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-10 opacity-50">Carregando setores...</div>
                      )}
                    </div>
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col overflow-hidden"
                  >
                    {/* Chat List */}
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]"
                    >
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex items-start gap-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300',
                            msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                          )}
                        >
                          <div
                            className={cn(
                              'p-2 rounded-lg shrink-0',
                              msg.role === 'user' ? 'bg-[var(--color-accent)] text-white' : 'bg-white border border-slate-200 text-slate-700'
                            )}
                          >
                            {msg.role === 'user' ? <User size={16} /> : <img src="/logo.png" className="h-4 w-4 object-contain" alt="Logo" />}
                          </div>
                          <div
                            className={cn(
                              'p-3 rounded-2xl text-sm shadow-sm',
                              msg.role === 'user'
                                ? 'bg-[var(--color-accent)] text-white rounded-tr-none'
                                : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-start gap-2 animate-pulse">
                          <div className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400">
                            <img src="/logo.png" className="h-4 w-4 object-contain opacity-50" alt="Logo" />
                          </div>
                          <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

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
                        Powered by MedIA • Arthromed
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
    </div>
  )
}
