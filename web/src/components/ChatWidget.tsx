import React, { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, User, Bot, Layers, ArrowLeft, ArrowRight, TrendingUp, FileText, CreditCard, Calculator, Briefcase, Paperclip, Shield, Clock, Zap, ChevronLeft, Lightbulb, ThumbsUp, ThumbsDown, Copy, Landmark, Activity, DollarSign } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { getContext, generateResponse, getSectors } from '../lib/chat'
import { cn } from '../lib/utils'

type Message = {
  id: string
  role: 'user' | 'bot'
  text: string
  timestamp: Date
  file?: {
    name: string
    base64: string
    type: string
    originalPdfBase64?: string
  }
}

export const ChatWidget = ({ isDesktop = false, hideToggle = false }: { isDesktop?: boolean, hideToggle?: boolean }) => {
  const [isOpen, setIsOpen] = useState(isDesktop)
  const [previewFile, setPreviewFile] = useState<{ name: string; base64: string; type: string; originalPdfBase64?: string } | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imgZoom, setImgZoom] = useState<number>(1)

  useEffect(() => {
    setImgZoom(1)
    if (!previewFile) {
      setPreviewUrl(null)
      return
    }

    try {
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
        URL.revokeObjectURL(url)
      }
    } catch (e) {
      console.error('Erro ao gerar blob URL:', e)
      setPreviewUrl(null)
    }
  }, [previewFile])
  
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
  const [attachedFile, setAttachedFile] = useState<{ name: string; base64: string; type: string; extractedText?: string; originalPdfBase64?: string } | null>(null)
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

  // Divide a resposta em blocos (mensagens separadas) por etapas do processo
  const splitIntoBlocks = (text: string): string[] => {
    const trimmed = (text || '').trim()
    if (!trimmed) return []

    const lines = trimmed.split('\n')
    
    // Verifica se há pelo menos um passo numerado no texto
    const hasSteps = lines.some(line => /^\s*\d+[\.)\-]\s+/.test(line))
    if (!hasSteps) {
      return [trimmed]
    }

    const blocks: string[] = []
    let currentBlock: string[] = []

    for (const line of lines) {
      const trimmed = line.trim()
      
      if (!trimmed) {
        // Para evitar quebras excessivas fora de etapas,
        // só fechamos o bloco ao encontrar linha em branco se o bloco atual for uma etapa
        const isCurrentBlockStep = currentBlock.some(l => /^\s*\d+[\.)\-]\s+/.test(l))
        if (isCurrentBlockStep && currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n'))
          currentBlock = []
        } else {
          // Se for texto normal/intro, mantemos a linha em branco para manter parágrafo agrupado
          currentBlock.push(line)
        }
        continue
      }

      // Se a linha começa com um passo numerado (ex: "1.", "2.")
      if (/^\d+[\.)\-]\s+/.test(trimmed)) {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n'))
        }
        currentBlock = [line]
      }
      // Se a linha começa com um sub-bullet (ex: "- ", "* ")
      else if (/^[\-\*]\s+/.test(trimmed)) {
        if (currentBlock.length > 0) {
          currentBlock.push(line)
        } else {
          currentBlock = [line]
        }
      }
      // Linha de texto normal ou cabeçalho
      else {
        const lastLine = currentBlock[currentBlock.length - 1]?.trim() || ''
        const isLastLineStep = /^\d+[\.)\-]\s+/.test(lastLine) || /^[\-\*]\s+/.test(lastLine)
        
        if (isLastLineStep) {
          blocks.push(currentBlock.join('\n'))
          currentBlock = [line]
        } else {
          currentBlock.push(line)
        }
      }
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'))
    }

    return blocks.map(b => b.trim()).filter(Boolean)
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
              setAttachedFile({
                name: `Imagem colada (${new Date().toLocaleTimeString()})`,
                base64: base64Data,
                type: file.type
              })
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
      file: attachedFile ? {
        name: attachedFile.name,
        base64: attachedFile.base64,
        type: attachedFile.type,
        originalPdfBase64: attachedFile.originalPdfBase64
      } : undefined
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
          text: input,
          context: context,
          history: messages.map(m => ({ role: m.role, text: m.text })),
          fileData: fileToSend?.base64 && !fileToSend.extractedText ? {
            base64: fileToSend.base64,
            mimeType: fileToSend.type
          } : undefined,
          extractedText: fileToSend?.extractedText || undefined
        }
      })

      const parsed = parseSteps(botResponse || '')
      
      const blocks = splitIntoBlocks(botResponse || '')
      if (blocks.length > 0) {
        const newMsgs: Message[] = blocks.map((block, idx) => ({
          id: (Date.now() + 1 + idx).toString(),
          role: 'bot',
          text: block,
          timestamp: new Date(),
        }))
        setMessages((prev) => [...prev, ...newMsgs])
      } else {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: 'bot',
          text: botResponse || 'Desculpe, não consegui processar sua solicitação.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, botMsg])
      }

      if (parsed) {
        // Só ativa o assistente interativo se for um processo acionável (não apenas materiais ou lista estática)
        const textLower = (botResponse || '').toLowerCase()
        const isInteractiveProcess = 
          !textLower.includes('material') && 
          !textLower.includes('materiais') && 
          !textLower.includes('lista de') &&
          !textLower.includes('produtos')
        
        if (isInteractiveProcess) {
          setStepSession({ ...parsed, current: 0 })
        } else {
          setStepSession(null)
        }
      } else {
        setStepSession(null)
        
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

  // Renderizador de Mensagens com Suporte a Cards de Dados
  const renderMessageContent = (text: string) => {
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
            {otherLines.length > 1 && renderTextBlock(otherLines.slice(1))}
          </div>
        )
      }
    }

    // Renderização Markdown simples (Básico)
    return (
      <div className="space-y-2">
        {text.split('\n').map((line, i) => {
          if (line.startsWith('###')) return <h3 key={i} className="font-bold text-base mt-3 mb-1 text-slate-900">{line.replace(/^###\s*/, '')}</h3>
          if (line.startsWith('##')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2 text-slate-900 border-b border-slate-100 pb-1">{line.replace(/^##\s*/, '')}</h2>
          
          // Formata negritos **texto**
          const parts = line.split(/(\*\*.*?\*\*)/g)
          return (
            <p key={i} className="leading-relaxed">
              {parts.map((part, pi) => 
                part.startsWith('**') && part.endsWith('**') 
                  ? <strong key={pi} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
                  : part
              )}
            </p>
          )
        })}
      </div>
    )
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

      setAttachedFile({
        name: file.name,
        base64: finalBase64,
        type: fileType,
        extractedText: extractedText,
        originalPdfBase64: originalPdfBase64
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
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1a2332] rounded-xl flex items-center justify-center text-white">
                  <Bot size={22} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <h1 className="font-bold text-[#1a2332] text-lg leading-tight">MedIA</h1>
                    {step === 'chat' && sector && (
                      <div className="flex flex-col ml-2">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Departamento</span>
                        <div className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center border border-slate-200">
                          {sector}
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Assistente Corp</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {step === 'chat' && (
                  <button
                    onClick={handleBackToSectors}
                    className="flex items-center gap-2 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Layers size={14} /> Trocar Setor
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 p-2 rounded-full transition-all shadow-sm border border-slate-100"
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
                    className="flex-1 flex flex-col items-center justify-center p-8 bg-white"
                  >
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
                      onClick={handleStart}
                      className="w-full max-w-[380px] bg-[#1a2332] hover:bg-[#253043] text-white py-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      Iniciar Atendimento <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {step === 'sector' && (
                  <motion.div
                    key="sector"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex-1 flex flex-col p-8 overflow-y-auto bg-slate-50/50"
                  >
                    <div className="mb-10 text-center flex flex-col items-center">
                      <div className="w-14 h-14 bg-[#1a2332] rounded-full flex items-center justify-center text-white mb-6 shadow-md">
                        <Layers size={24} />
                      </div>
                      <h2 className="text-2xl font-bold text-[#1a2332] mb-3 tracking-tight">Seleção de Departamento</h2>
                      <p className="text-slate-500 text-sm max-w-[400px] mx-auto leading-relaxed">Por favor, selecione sua área de atuação para personalizarmos o seu atendimento e fornecermos as informações corretas.</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-[800px] mx-auto w-full">
                      {availableSectors.length > 0 ? (
                        availableSectors.map((s, index) => {
                          let Icon = Layers;
                          let desc = "Gestão de processos e suporte.";
                          if (s.toLowerCase().includes('comercial')) {
                            Icon = Briefcase;
                            desc = "Vendas, contratos e relacionamento corporativo.";
                          } else if (s.toLowerCase().includes('faturamento')) {
                            Icon = DollarSign;
                            desc = "Emissão de notas, cobranças e conciliações.";
                          } else if (s.toLowerCase().includes('financeiro')) {
                            Icon = Landmark;
                            desc = "Contas a pagar, receber e tesouraria geral.";
                          } else if (s.toLowerCase().includes('orçamento - arthromed')) {
                            Icon = Calculator;
                            desc = "Planejamento e controle de custos Arthromed.";
                          } else if (s.toLowerCase().includes('orçamento - medic')) {
                            Icon = Activity;
                            desc = "Planejamento e controle de custos Medic.";
                          }

                          return (
                            <motion.button
                              key={s}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.05 }}
                              onClick={() => handleSelectSector(s)}
                              className="text-left w-full flex flex-col p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-300 hover:shadow-md transition-all group relative"
                            >
                              <div className="bg-slate-100 text-slate-500 p-2 rounded-lg w-fit mb-4">
                                <Icon size={18} strokeWidth={1.5} />
                              </div>
                              <h3 className="font-bold text-slate-800 text-base mb-1">{s}</h3>
                              <p className="text-xs text-slate-500 leading-relaxed pr-6">{desc}</p>
                              <ArrowRight className="text-slate-300 absolute top-5 right-5 group-hover:text-slate-500 transition-colors" size={16} />
                            </motion.button>
                          )
                        })
                      ) : (
                        <div className="col-span-2 text-center py-10 opacity-50">Carregando departamentos...</div>
                      )}
                    </div>

                    <p className="mt-auto pt-8 text-center text-xs text-slate-400">
                      Caso não encontre seu departamento, entre em contato com o suporte de TI.
                    </p>
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col overflow-hidden bg-white"
                  >
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30"
                    >
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300',
                            msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'items-start'
                          )}
                        >
                          {msg.role !== 'user' && (
                            <div className="p-2 rounded-full shrink-0 flex items-center justify-center w-8 h-8 bg-[#1a2332] text-white shadow-sm mt-1">
                              <Lightbulb size={14} />
                            </div>
                          )}
                          <div className="flex flex-col gap-1.5">
                            <div
                              className={cn(
                                'p-4 rounded-2xl text-[14px] leading-relaxed',
                                msg.role === 'user'
                                  ? 'bg-[#1a2332] text-white rounded-tr-sm shadow-md'
                                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                              )}
                            >
                              {msg.role === 'user' ? (
                                <div className="flex flex-col gap-3">
                                  <span>{msg.text}</span>
                                  {msg.file && (
                                    <button
                                      onClick={() => setPreviewFile(msg.file!)}
                                      className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white transition-all text-left group cursor-pointer w-full mt-1"
                                    >
                                      <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors shrink-0">
                                        {msg.file.type === 'application/pdf' ? (
                                          <FileText size={18} />
                                        ) : (
                                          <Paperclip size={18} />
                                        )}
                                      </div>
                                      <div className="flex flex-col flex-1 overflow-hidden">
                                        <span className="text-xs font-semibold truncate">{msg.file.name}</span>
                                        <span className="text-[9px] text-white/60 uppercase tracking-widest mt-0.5 font-bold">Clique para pré-visualizar</span>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              ) : (
                                renderMessageContent(msg.text)
                              )}
                            </div>
                            {msg.role !== 'user' && (
                              <div className="flex items-center gap-3 px-1">
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button className="text-slate-300 hover:text-slate-500 transition-colors"><ThumbsUp size={12} /></button>
                                  <button className="text-slate-300 hover:text-slate-500 transition-colors"><ThumbsDown size={12} /></button>
                                  <button className="text-slate-300 hover:text-slate-500 transition-colors"><Copy size={12} /></button>
                                </div>
                              </div>
                            )}
                            {msg.role === 'user' && (
                              <span className="text-[10px] text-slate-400 font-medium text-right px-1">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex items-start gap-3 animate-pulse">
                          <div className="w-8 h-8 rounded-full bg-[#1a2332] flex items-center justify-center text-white shrink-0 mt-1">
                            <Lightbulb size={14} />
                          </div>
                          <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex gap-1.5 h-12 items-center">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                          </div>
                        </div>
                      )}
                    </div>

                    {stepSession && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-6 mb-4 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-bold text-slate-500 tracking-wider">
                            PASSO {stepSession.current + 1} DE {stepSession.steps.length}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {Math.round(((stepSession.current + 1) / stepSession.steps.length) * 100)}% concluído
                          </span>
                        </div>
                        <div className="mb-6">
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#1a2332] transition-all duration-500 rounded-full"
                              style={{ width: `${((stepSession.current + 1) / stepSession.steps.length) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="pb-2">
                          <h3 className="text-lg font-bold text-[#1a2332] mb-6">
                            {stepSession.steps[stepSession.current].replace(/^\d+[\.)\-]\s*/, '')}
                          </h3>
                          <div className="flex gap-3">
                            <button
                              onClick={handleStepYes}
                              className="flex-1 bg-[#1a2332] hover:bg-[#253043] text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                              <span>✓ Concluído</span>
                            </button>
                            <button
                              onClick={handleStepNo}
                              className="flex-1 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                            >
                              <span>✕ Preciso de Ajuda</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="p-5 bg-white border-t border-slate-100">
                      {messages.length < 3 && !stepSession && (
                        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                          {["Análise de Pendências", "Emissão de Nota Fiscal", "Consultar Glosas", "Status de Orçamento"].map((sug) => (
                            <button
                              key={sug}
                              onClick={() => { setInput(sug); handleSend() }}
                              className="whitespace-nowrap px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-medium hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-100/70 border border-slate-200 rounded-full flex items-center p-1.5 pr-2 focus-within:ring-2 focus-within:ring-[#1a2332]/20 focus-within:border-[#1a2332]/30 transition-all">
                          <button 
                            className={cn(
                              "p-2.5 transition-colors relative rounded-full hover:bg-slate-200/50",
                              attachedFile ? "text-[#1a2332]" : "text-slate-400"
                            )}
                            title="Adicionar Anexo"
                            onClick={() => document.getElementById('file-upload')?.click()}
                          >
                            <Paperclip size={18} />
                            {attachedFile && (
                              <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border border-white" />
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
                            placeholder={attachedFile ? `Arquivo pronto: ${attachedFile.name}` : "Descreva sua solicitação ou dúvida..."}
                            className="flex-1 border-none bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400 px-2"
                          />
                          
                          {attachedFile && (
                            <button
                              onClick={() => setAttachedFile(null)}
                              className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                              title="Remover arquivo"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={handleSend}
                          disabled={!input.trim() || isLoading}
                          className="p-3.5 bg-[#1a2332]/10 text-[#1a2332] rounded-full disabled:opacity-50 hover:bg-[#1a2332]/20 transition-colors"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                          MEDIA CORPORATE ASSISTANT • POWERED BY ARTHROMED
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

      {/* Modal de Pré-visualização Premium */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#0b0f19]/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header do Modal */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white border border-slate-200 text-[#1a2332] rounded-xl shadow-sm">
                    {previewFile.type === 'application/pdf' ? <FileText size={20} /> : <Paperclip size={20} />}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight truncate max-w-[200px] md:max-w-[450px]">
                      {previewFile.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                      Pré-visualização do Anexo
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {previewUrl && (
                    <a
                      href={previewUrl}
                      download={previewFile.name}
                      className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                    >
                      Baixar Arquivo
                    </a>
                  )}
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 p-2.5 rounded-full transition-all border border-slate-200/50 shadow-sm cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Corpo do Modal - Conteúdo do Arquivo */}
              <div className="flex-1 bg-slate-100/50 p-4 md:p-6 flex items-center justify-center overflow-hidden">
                {previewFile.originalPdfBase64 || previewFile.type === 'application/pdf' ? (
                  previewUrl ? (
                    <iframe
                      src={previewUrl}
                      title={previewFile.name}
                      className="w-full h-full border border-slate-200 rounded-2xl shadow-inner bg-white"
                    />
                  ) : (
                    <div className="text-slate-400 text-sm font-semibold">Carregando visualizador de PDF...</div>
                  )
                ) : previewFile.type.startsWith('image/') ? (
                  <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                    {/* Zoom Controls */}
                    <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-slate-200/60 p-1.5 rounded-2xl shadow-md select-none">
                      <button
                        onClick={() => setImgZoom(prev => Math.max(0.5, prev - 0.25))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-bold text-xs"
                        title="Diminuir Zoom"
                      >
                        A-
                      </button>
                      <span className="text-[10px] font-bold text-slate-500 px-2 min-w-[36px] text-center">
                        {Math.round(imgZoom * 100)}%
                      </span>
                      <button
                        onClick={() => setImgZoom(prev => Math.min(3.0, prev + 0.25))}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-all cursor-pointer font-bold text-xs"
                        title="Aumentar Zoom"
                      >
                        A+
                      </button>
                      <button
                        onClick={() => setImgZoom(1)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-[10px] font-bold uppercase tracking-wider px-2"
                        title="Resetar Zoom"
                      >
                        Reset
                      </button>
                    </div>
                    {/* Zoomable Image Container */}
                    <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                      <img
                        src={`data:${previewFile.type};base64,${previewFile.base64}`}
                        alt={previewFile.name}
                        style={{
                          transform: `scale(${imgZoom})`,
                          transformOrigin: 'center center',
                          transition: 'transform 0.15s ease-out'
                        }}
                        className="max-w-full max-h-full object-contain rounded-2xl shadow-lg border border-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-md max-w-sm">
                    <div className="p-4 bg-slate-50 text-slate-400 rounded-full border border-slate-100">
                      <FileText size={40} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 text-base mb-1">Visualização Indisponível</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Não conseguimos exibir este tipo de arquivo diretamente. Faça o download para visualizá-lo.
                      </p>
                    </div>
                    {previewUrl && (
                      <a
                        href={previewUrl}
                        download={previewFile.name}
                        className="bg-[#1a2332] text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-[#253043] transition-colors shadow-md"
                      >
                        Baixar Arquivo
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!isDesktop && (!hideToggle || isOpen) && (
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
