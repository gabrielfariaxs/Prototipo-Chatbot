import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, Bot, Layers, ArrowLeft, ArrowRight, TrendingUp, FileText, CreditCard, Calculator, Briefcase, Paperclip, Shield, Clock, Zap, ChevronLeft } from 'lucide-react'
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
    
    // CHAT_URL = "https://chatbot.gabrielfarias-marques13.workers.dev/?desktop=true&v=premium_v2"
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
  const [step, setStep] = useState<'onboarding' | 'sector' | 'chat'>('onboarding')
  const [sector, setSector] = useState<string | null>(null)
  const [availableSectors, setAvailableSectors] = useState<string[]>([])
  const [stepSession, setStepSession] = useState<{
    steps: string[]
    current: number
    intro: string
  } | null>(null)
  const [attachedFile, setAttachedFile] = useState<{ name: string; base64: string; type: string; extractedText?: string } | null>(null)
  const [sessionContext, setSessionContext] = useState<string>('')

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
    
    // Armazena cópia do anexo para limpar o estado antes do envio
    const fileToSend = attachedFile
    setAttachedFile(null)

    try {
      const context = await getContext({
        data: {
          text: input,
          sector: sector || 'Geral',
          history: sessionContext, // Passa o contexto extraído anteriormente
        }
      })

      const botResponse = await generateResponse({
        data: {
          text: fileToSend?.extractedText 
            ? `${input}\n\n[CONTEÚDO DO DOCUMENTO EXTRAÍDO]:\n${fileToSend.extractedText}`
            : input,
          context: context,
          fileData: fileToSend?.base64 ? {
            base64: fileToSend.base64,
            mimeType: fileToSend.type
          } : undefined
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
        
        // Se a resposta parece ser uma extração de dados, salvamos no contexto da sessão
        if (botResponse?.includes('Paciente:') || botResponse?.includes('Médico:')) {
          setSessionContext((prev) => prev + '\n\n' + botResponse)
        }
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Limite de 5MB para evitar estouro de memória no Worker
    if (file.size > 5 * 1024 * 1024) {
      alert('Arquivo muito grande! Por favor, use arquivos menores que 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = async (event) => {
      const base64Full = event.target?.result as string
      const base64Data = base64Full.split(',')[1]
      
      let finalBase64 = base64Data
      let extractedText = ""

      // Se for PDF e estiver no Desktop, extraímos o texto via Python para evitar erros de upload
      if (file.type === 'application/pdf' && (window as any).pywebview?.api?.extract_pdf_text) {
        setIsLoading(true)
        try {
          const result = await (window as any).pywebview.api.extract_pdf_text(base64Data)
          if (result.success) {
             extractedText = result.text
             // Para PDFs já extraídos, não enviamos a base64 (economiza banda e evita erros)
             finalBase64 = "" 
          }
        } catch (err) {
          console.error("Erro na ponte Python:", err)
        } finally {
          setIsLoading(false)
        }
      }

      setAttachedFile({
        name: file.name,
        base64: finalBase64,
        type: file.type,
        extractedText: extractedText
      })

      // Sugere ao usuário o que fazer após anexar
      if (!input.trim()) {
        const actionText = file.type.includes('image') ? 'analise esta imagem' : 'analise este documento'
        setInput(`${actionText.charAt(0).toUpperCase() + actionText.slice(1)} para mim: ${file.name}`)
      }
    }
    reader.readAsDataURL(file)
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
            {/* Unified Corporate Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#1a2332] rounded-lg flex items-center justify-center">
                  <img src="/logo.png" className="h-5 w-5 object-contain invert brightness-0" alt="Logo" />
                </div>
                <div>
                  <h1 className="font-bold text-[#1a2332] leading-tight">MedIA</h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">Assistente Arthromed</p>
                  {step === 'chat' && sector && (
                    <p className="text-xs text-slate-700 mt-0.5">Departamento: <span className="font-semibold">{sector}</span></p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {step === 'chat' && (
                  <button
                    onClick={handleBackToSectors}
                    className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-1.5 rounded text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    <Layers size={14} /> Trocar Setor
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded transition-colors"
                  title={isDesktop ? "Encerrar Programa" : "Fechar Chat"}
                >
                  <X size={18} />
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
                    className="flex-1 flex flex-col items-center justify-center p-8 bg-white"
                  >
                    <div className="mb-6 flex justify-center w-full">
                      <div className="w-20 h-20 bg-[#1a2332] rounded-2xl flex items-center justify-center">
                        <img src="/logo.png" className="h-10 w-10 object-contain invert brightness-0" alt="Logo" />
                      </div>
                    </div>

                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold text-[#1a2332] mb-2">
                        Bem-vindo ao MedIA
                      </h2>
                      <p className="text-sm text-slate-500 mb-6">
                        Sistema de Assistência Virtual
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-[280px] mx-auto">
                        Plataforma inteligente especializada em processos internos, gestão de materiais e suporte técnico para as equipes Arthromed e Medic.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 w-full mb-10 max-w-[300px]">
                      <div className="flex flex-col items-center">
                        <div className="bg-slate-50 text-slate-600 p-3 rounded-full mb-2"><Zap size={18} strokeWidth={1.5} /></div>
                        <span className="text-[9px] text-slate-600 text-center">Respostas<br/>Rápidas</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-slate-50 text-slate-600 p-3 rounded-full mb-2"><Shield size={18} strokeWidth={1.5} /></div>
                        <span className="text-[9px] text-slate-600 text-center">Seguro e<br/>Confiável</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-slate-50 text-slate-600 p-3 rounded-full mb-2"><Clock size={18} strokeWidth={1.5} /></div>
                        <span className="text-[9px] text-slate-600 text-center">24/7<br/>Disponível</span>
                      </div>
                    </div>

                    <button
                      onClick={handleStart}
                      className="w-full max-w-[320px] corp-btn py-3.5 rounded-lg text-sm font-semibold flex items-center justify-center"
                    >
                      Iniciar Atendimento
                    </button>
                  </motion.div>
                )}

                {step === 'sector' && (
                  <motion.div
                    key="sector"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex-1 flex flex-col p-8 overflow-y-auto bg-white"
                  >
                    <div className="mb-8 text-center flex flex-col items-center">
                      <div className="w-12 h-12 bg-[#1a2332] rounded-xl flex items-center justify-center text-white mb-6">
                        <Layers size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-[#1a2332] mb-2">Seleção de Departamento</h2>
                      <p className="text-slate-500 text-xs">Selecione sua área de atuação para personalizar o atendimento e fornecer informações precisas.</p>
                    </div>
                    
                    <div className="space-y-3">
                      {availableSectors.length > 0 ? (
                        availableSectors.map((s, index) => (
                          <motion.button
                            key={s}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => handleSelectSector(s)}
                            className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                          >
                            <span className="font-semibold text-sm text-slate-800">{s}</span>
                            <ChevronLeft className="text-slate-400 rotate-180" size={16} />
                          </motion.button>
                        ))
                      ) : (
                        <div className="text-center py-10 opacity-50">Carregando setores...</div>
                      )}
                    </div>

                    <p className="mt-8 text-center text-[10px] text-slate-400">
                      Caso não encontre seu departamento, entre em contato com o suporte.
                    </p>
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col overflow-hidden bg-[#F8FAFC]"
                  >
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-6 space-y-6"
                    >
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex items-start gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300',
                            msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
                          )}
                        >
                          <div
                            className={cn(
                              'p-2 rounded-full shrink-0 flex items-center justify-center w-8 h-8',
                              msg.role === 'user' ? 'hidden' : 'bg-[#1a2332] text-white'
                            )}
                          >
                            {msg.role !== 'user' && <Zap size={14} />}
                          </div>
                          <div
                            className={cn(
                              'p-3.5 rounded-lg text-[13px] leading-relaxed shadow-sm',
                              msg.role === 'user'
                                ? 'bg-[#1a2332] text-white'
                                : 'bg-white border border-slate-200 text-slate-700'
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-start gap-3 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-[#1a2332] flex items-center justify-center text-white shrink-0">
                            <Zap size={14} />
                          </div>
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex gap-1.5">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {stepSession && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-6 mb-4 rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden"
                      >
                        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-500 tracking-wider">
                            PASSO {stepSession.current + 1} DE {stepSession.steps.length}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {Math.round(((stepSession.current + 1) / stepSession.steps.length) * 100)}% concluído
                          </span>
                        </div>
                        <div className="px-5 mb-4">
                          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1a2332] transition-all duration-500"
                              style={{ width: `${((stepSession.current + 1) / stepSession.steps.length) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="px-5 pb-5">
                          <h3 className="text-sm font-bold text-slate-800 mb-4">
                            {stepSession.steps[stepSession.current].replace(/^\d+[\.)\-]\s*/, '')}
                          </h3>
                          <div className="flex gap-3">
                            <button
                              onClick={handleStepYes}
                              className="flex-1 corp-btn py-2.5 rounded text-xs font-semibold flex items-center justify-center gap-2"
                            >
                              <span>✓ Concluído</span>
                            </button>
                            <button
                              onClick={handleStepNo}
                              className="flex-1 py-2.5 rounded border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                              <span>✕ Preciso de Ajuda</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="p-4 bg-white border-t border-slate-200">
                      <div className="corp-input-area p-1.5 flex items-center">
                        <button 
                          className={cn(
                            "p-2 transition-colors relative",
                            attachedFile ? "text-[#1a2332]" : "text-slate-400 hover:text-slate-600"
                          )}
                          title="Adicionar Anexo"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <Paperclip size={18} />
                          {attachedFile && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full border border-white" />
                          )}
                          <input 
                            type="file" 
                            id="file-upload" 
                            className="hidden" 
                            onChange={handleFileUpload}
                            accept=".pdf,image/*"
                          />
                        </button>
                        
                        <input
                          type="text"
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                          placeholder={attachedFile ? `Arquivo pronto: ${attachedFile.name}` : "Digite sua mensagem..."}
                          className="flex-1 border-none outline-none text-sm text-slate-700 placeholder-slate-400 px-2"
                        />
                        
                        {attachedFile && (
                          <button
                            onClick={() => setAttachedFile(null)}
                            className="p-1.5 text-slate-400 hover:text-red-500 mr-1"
                            title="Remover arquivo"
                          >
                            <X size={14} />
                          </button>
                        )}
                        
                        <button
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          className="p-2 bg-slate-200 text-slate-500 rounded disabled:opacity-50 hover:bg-slate-300 transition-colors"
                        >
                          <Send size={16} />
                        </button>
                      </div>
                      <div className="text-center mt-3">
                        <p className="text-[9px] font-semibold text-slate-400">
                          ARTHROMED • MEDIC
                        </p>
                      </div>
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
