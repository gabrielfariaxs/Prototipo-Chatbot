import React, { useState, useRef, useEffect } from 'react'
import { 
  Stethoscope, FileText, Download, Copy, Sparkles, Send, Paperclip, X, Image as ImageIcon,
  Loader2, Check, Eye, Code, Mic, MicOff, Pencil, User
} from 'lucide-react'
import { generateResponse } from '../../lib/chat'
import { processClinicalFile, type ProcessedFile } from '../../lib/pdf-reader'

/**
 * Componente interativo para edição inline de campos entre colchetes [ ... ]
 * Funciona tanto no PC (clique com mouse) quanto no Celular (toque na tela).
 */
function EditablePlaceholder({ 
  value, 
  onSave 
}: { 
  value: string
  onSave: (newValue: string) => void 
}) {
  const [isEditing, setIsEditing] = useState(false)
  const innerContent = value.replace(/^\[\s*/, '').replace(/\s*\]$/, '')
  const [inputValue, setInputValue] = useState(innerContent)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setInputValue(value.replace(/^\[\s*/, '').replace(/\s*\]$/, ''))
  }, [value])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleConfirm = () => {
    const trimmed = inputValue.trim()
    const newValue = trimmed ? `[${trimmed}]` : '[ ]'
    onSave(newValue)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleConfirm()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsEditing(false)
      setInputValue(innerContent)
    }
  }

  const isUnfilled = value.includes('___') || innerContent.trim() === '' || innerContent.includes('...')

  if (isEditing) {
    return (
      <span className="inline-flex items-center gap-1 bg-amber-50 border-2 border-amber-500 rounded-md p-1 mx-1 my-0.5 shadow-md z-20">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="px-2 py-0.5 text-xs font-mono bg-white text-amber-950 font-bold border border-amber-300 rounded focus:outline-none focus:ring-2 focus:ring-amber-500 min-w-[140px]"
          placeholder="Digite o valor..."
        />
        <button
          type="button"
          onClick={handleConfirm}
          className="p-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded transition-colors cursor-pointer shrink-0"
          title="Salvar alteração"
        >
          <Check size={13} />
        </button>
        <button
          type="button"
          onClick={() => {
            setIsEditing(false)
            setInputValue(innerContent)
          }}
          className="p-1 bg-slate-400 hover:bg-slate-500 active:scale-95 text-white rounded transition-colors cursor-pointer shrink-0"
          title="Cancelar"
        >
          <X size={13} />
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      title="Clique ou toque para editar este campo manualmente"
      className={`inline-flex items-center gap-1 font-mono font-bold px-1.5 py-0.5 rounded text-[11px] mx-0.5 transition-all cursor-pointer select-none active:scale-95 group ${
        isUnfilled
          ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border-2 border-dashed border-amber-400 shadow-xs animate-pulse hover:animate-none'
          : 'bg-[#fff8e1] hover:bg-[#ffe082] text-[#7a4500] border border-[#ffe082]'
      }`}
    >
      <span>{value}</span>
      <Pencil size={10} className="opacity-60 group-hover:opacity-100 text-amber-800 shrink-0" />
    </button>
  )
}

/**
 * Renderizador de Papel A4 com layout de Grade 2 Colunas e Linhas Inferiores (Fiel ao modelo InCore/Claude)
 * Suporta edição inline interativa de todos os campos [ ... ] no celular e no PC.
 */
function ClinicalPaperDocument({ 
  content,
  onUpdateContent 
}: { 
  content: string
  onUpdateContent?: (newContent: string) => void 
}) {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let currentSectionTitle = ''
  let sectionFields: { label: string; value: string; lineIdx: number }[] = []
  let tableRows: { cells: string[]; lineIdx: number }[] = []
  let inTable = false

  const handleSavePlaceholder = (lineIdx: number, oldPart: string, newValue: string) => {
    if (!onUpdateContent || lineIdx < 0 || lineIdx >= lines.length) return
    const targetLine = lines[lineIdx]
    const updatedLine = targetLine.replace(oldPart, newValue)
    const updatedLines = [...lines]
    updatedLines[lineIdx] = updatedLine
    onUpdateContent(updatedLines.join('\n'))
  }

  const processInline = (text: string, lineIdx: number) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\])/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-slate-900 font-sans">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <EditablePlaceholder
            key={`${lineIdx}-${idx}-${part}`}
            value={part}
            onSave={(newValue) => handleSavePlaceholder(lineIdx, part, newValue)}
          />
        )
      }
      return part
    })
  }

  const flushGridFields = (key: number | string) => {
    if (sectionFields.length === 0) return null
    const fields = [...sectionFields]
    sectionFields = []

    return (
      <div key={`grid-${key}`} className="my-3 grid grid-cols-2 gap-x-6 gap-y-3 font-sans">
        {fields.map((f, fIdx) => (
          <div key={fIdx} className="flex flex-col">
            <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">{f.label}</span>
            <div className="text-[12px] font-semibold text-slate-900 border-b border-slate-300 pb-1 mt-0.5">
              {processInline(f.value, f.lineIdx)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const flushTable = (key: number | string) => {
    if (tableRows.length === 0) return null
    const headerItem = tableRows[0]
    const rowItems = tableRows.slice(1).filter(r => !r.cells.every(cell => cell.includes('---') || cell.includes(':')))
    
    tableRows = []
    inTable = false

    return (
      <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-sm border border-slate-300 shadow-2xs">
        <table className="w-full text-left border-collapse text-[11px] font-sans">
          <thead>
            <tr className="bg-[#005f73] text-white font-bold border-b border-[#005f73]">
              {headerItem.cells.map((col, cIdx) => (
                <th key={cIdx} className="p-2.5 border-r last:border-r-0 border-[#005f73] uppercase tracking-wider text-[10px]">
                  {processInline(col.trim(), headerItem.lineIdx)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {rowItems.map((rowItem, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#f7f7f7]'}>
                {rowItem.cells.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 border-r last:border-r-0 border-slate-200 leading-relaxed">
                    {processInline(cell.trim(), rowItem.lineIdx)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true
      const cells = trimmed.split('|').slice(1, -1)
      tableRows.push({ cells, lineIdx: idx })
      return
    }

    if (inTable && !trimmed.startsWith('|')) {
      const tableElem = flushTable(idx)
      if (tableElem) elements.push(tableElem)
    }

    if (!trimmed) {
      if (sectionFields.length > 0) {
        const gridElem = flushGridFields(idx)
        if (gridElem) elements.push(gridElem)
      }
      elements.push(<div key={idx} className="h-2" />)
      return
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <div key={idx} className="border-b-2 border-[#005f73] pb-3 mb-5 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#005f73] font-serif leading-none tracking-tight">
              InCore
            </h1>
            <span className="text-[10px] text-slate-500 font-sans block mt-1 font-medium">
              Instituto de Coluna e Ortopedia Especializada — Recife/PE
            </span>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold text-slate-900 uppercase font-sans tracking-wide">
              {processInline(trimmed.slice(2), idx)}
            </h2>
          </div>
        </div>
      )
      return
    }

    if (trimmed.startsWith('## ')) {
      if (sectionFields.length > 0) {
        const gridElem = flushGridFields(idx)
        if (gridElem) elements.push(gridElem)
      }

      currentSectionTitle = trimmed.slice(3).toUpperCase()
      elements.push(
        <h2 key={idx} className="text-xs font-bold text-[#005f73] font-sans uppercase tracking-wider border-b-2 border-[#005f73] pb-1 mt-6 mb-3">
          {processInline(trimmed.slice(3), idx)}
        </h2>
      )
      return
    }

    // Detecta linhas de campo chave-valor no formato "- **RÓTULO:** VALOR"
    if (trimmed.startsWith('- **') && trimmed.includes(':**')) {
      const match = trimmed.match(/-\s*\*\*(.*?):\*\*\s*(.*)/)
      if (match) {
        const label = match[1].trim()
        const value = match[2].trim()
        
        // Se estiver dentro de seções de identificação ou médico, guarda para renderizar em grade 2x2
        if (currentSectionTitle.includes('BENEFICIÁRIO') || currentSectionTitle.includes('IDENTIFICAÇÃO') || currentSectionTitle.includes('MÉDICO')) {
          sectionFields.push({ label, value, lineIdx: idx })
          return
        }
      }
    }

    if (sectionFields.length > 0) {
      const gridElem = flushGridFields(idx)
      if (gridElem) elements.push(gridElem)
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-xs font-bold text-slate-900 font-sans mt-4 mb-2">
          {processInline(trimmed.slice(4), idx)}
        </h3>
      )
      return
    }

    if (trimmed.startsWith('- **NATUREZA') || trimmed.startsWith('- **INDICAÇÃO') || trimmed.startsWith('- **DIFERENCIAL')) {
      elements.push(
        <div key={idx} className="border-l-3 border-[#005f73] bg-[#f8fafc] p-3 rounded-r-sm my-2 text-[11px] font-sans text-slate-800 leading-relaxed">
          {processInline(trimmed.slice(2), idx)}
        </div>
      )
      return
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-slate-800 text-[12px] font-serif my-1 leading-relaxed">
          {processInline(trimmed.slice(2), idx)}
        </li>
      )
      return
    }

    elements.push(
      <p key={idx} className="text-[12px] text-slate-800 font-serif my-2 leading-relaxed">
        {processInline(trimmed, idx)}
      </p>
    )
  })

  if (sectionFields.length > 0) {
    const gridElem = flushGridFields(8888)
    if (gridElem) elements.push(gridElem)
  }

  if (inTable && tableRows.length > 0) {
    const tableElem = flushTable(9999)
    if (tableElem) elements.push(tableElem)
  }

  return (
    <div className="bg-white text-slate-900 shadow-2xl rounded-sm p-6 sm:p-10 w-full max-w-[800px] border border-slate-200 font-serif leading-relaxed text-[12px] select-text">
      {elements}
    </div>
  )
}

export function ClinicalDocPanel() {
  const [rawPrompt, setRawPrompt] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<ProcessedFile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')

  // Voice Recorder state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const recognitionRef = useRef<any>(null)
  const timerRef = useRef<any>(null)

  // Generated Markdown state & preview
  const [generatedDraft, setGeneratedDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const [activePatientIdx, setActivePatientIdx] = useState(0)

  // Helper para analisar e separar documentos de múltiplos pacientes
  const parsedDocs = React.useMemo(() => {
    if (!generatedDraft) return []
    const docBlocks = generatedDraft.split(/(?=# SOLICITAÇÃO DE PROCEDIMENTO)/gi).filter(b => b.trim().length > 0)
    if (docBlocks.length <= 1) {
      const match = generatedDraft.match(/NOME DO PACIENTE:\s*\*{0,2}(.*?)\*{0,2}(?:\n|$)/i)
      const name = match && match[1] && !match[1].includes('___') ? match[1].replace(/\[|\]|\*/g, '').trim() : 'Paciente'
      return [{ id: 1, patientName: name, content: generatedDraft }]
    }
    return docBlocks.map((block, idx) => {
      const match = block.match(/NOME DO PACIENTE:\s*\*{0,2}(.*?)\*{0,2}(?:\n|$)/i) || block.match(/PACIENTE:\s*\*{0,2}(.*?)\*{0,2}(?:\n|$)/i)
      const name = match && match[1] && !match[1].includes('___') ? match[1].replace(/\[|\]|\*/g, '').trim() : `Paciente ${idx + 1}`
      return { id: idx + 1, patientName: name, content: block.trim() }
    })
  }, [generatedDraft])

  const currentDoc = parsedDocs[activePatientIdx] || parsedDocs[0]

  const handleUpdateCurrentDocContent = (newDocContent: string) => {
    if (parsedDocs.length <= 1) {
      setGeneratedDraft(newDocContent)
    } else {
      const docBlocks = generatedDraft.split(/(?=# SOLICITAÇÃO DE PROCEDIMENTO)/gi).filter(b => b.trim().length > 0)
      if (docBlocks[activePatientIdx] !== undefined) {
        docBlocks[activePatientIdx] = newDocContent
        setGeneratedDraft(docBlocks.join('\n\n'))
      } else {
        setGeneratedDraft(newDocContent)
      }
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) {}
      }
    }
  }, [])

  const startVoiceRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("O seu navegador não possui suporte ao ditado por voz. Recomendamos utilizar o Google Chrome ou Microsoft Edge.")
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.lang = 'pt-BR'
      recognition.continuous = true
      recognition.interimResults = true

      let baseText = rawPrompt ? rawPrompt.trim() + ' ' : ''
      let finalTranscript = ''

      recognition.onresult = (event: any) => {
        let interimTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText + ' '
          } else {
            interimTranscript += transcriptText
          }
        }
        setRawPrompt(baseText + finalTranscript + interimTranscript)
      }

      recognition.onerror = (event: any) => {
        console.error("Erro no reconhecimento de voz:", event.error)
        stopVoiceRecording()
      }

      recognition.onend = () => {
        setIsRecording(false)
        if (timerRef.current) clearInterval(timerRef.current)
      }

      recognition.start()
      recognitionRef.current = recognition
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Não foi possível iniciar a gravação:", err)
      alert("Não foi possível acessar o microfone. Verifique a permissão do seu navegador.")
    }
  }

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
    }
    setIsRecording(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const samplePrompts = [
    {
      label: 'Cirurgia de Coluna (Infiltração / Artrodese)',
      text: 'Paciente de 73 anos com lombociatalgia refratária a fisioterapia por 6 meses. CID M51.1 e M48.0. Cirurgia de coluna L4-L5 no Bradesco Saúde com 4 parafusos pediculares e 2 hastes de titânio. Marcas indicadas: Medtronic, Stryker e DePuy.',
    },
    {
      label: 'Cirurgia de Joelho (Âncoras / Sutura)',
      text: 'Solicitação cirúrgica de reconstrução ligamentar no joelho direito no convênio SulAmérica. CID M23.2. Materiais: 1 Âncora Knotless 5.5mm e 1 parafuso de interferência absorvível. Marcas: Arthrex, Smith & Nephew e Stryker.',
    },
    {
      label: 'Recurso de Negativa de OPME',
      text: 'O convênio PortoSaúde negou a justificativa dos materiais sob alegação de falta de fundamentação clínica. Solicito recurso contestando o parecer com o Motor de 3 Blocos e embasamento na Lei 14.454 e Resolução CFM 2.318.',
    },
  ]

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    for (const file of Array.from(files)) {
      const processed = await processClinicalFile(file)
      setAttachedFiles((prev) => [...prev, processed])
    }
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGenerateWithAI = async () => {
    if (!rawPrompt.trim() && attachedFiles.length === 0) return
    setIsLoading(true)

    const skillSystemPrompt = `
Você é o Especialista em Documentação Clínica Médica da Arthromed/Medic atuando sob a Skill "Solicitação Médica — Documentação Clínica Padronizada".

SEU OBJETIVO:
Analise com EXTREMA PRECISÃO os documentos, fotos, PDFs e textos fornecidos para gerar a documentação clínica padronizada.

REGRAS CRÍTICAS DE AGRUPAMENTO DE PACIENTES E CONSOLIDAÇÃO DE COMANDAS:
1. LEITURA E AGRUPAMENTO POR NOME DO PACIENTE:
   - Identifique o NOME DO PACIENTE em cada documento ou comanda enviada.
   - SE HOUVER 2 OU MAIS ARQUIVOS/PDFS DO MESMO PACIENTE (ex: 2 comandas ou exames do paciente "Gabriel"): VOCÊ DEVE UNIFICAR E COMBINAR todos os dados, laudos e materiais desse mesmo paciente em UMA ÚNICA SOLICITAÇÃO MÉDICA CONSOLIDADA para ele.
2. PACIENTES DIFERENTES (EX: GABRIEL E LAURA):
   - Se houver comandas de pacientes DIFERENTES (ex: "Gabriel" e "Laura"): VOCÊ DEVE GERAR UMA SOLICITAÇÃO MÉDICA ESTRUTURADA COMPLETA SEPARADA PARA CADA PACIENTE DISTINTO.
   - Cada solicitação individual de paciente DEVE iniciar com o cabeçalho "# SOLICITAÇÃO DE PROCEDIMENTO".

REGRAS CRÍTICAS DE RECOMENDAÇÃO DE MATERIAIS OPME — PORTFÓLIO MEDIC & ARTHROMED:
1. CONSULTA OBRIGATÓRIA AO PORTFÓLIO MEDIC & ARTHROMED:
   - Ao preencher e recomendar os materiais na tabela "## MATERIAIS E OPME" e nas justificativas técnicas, VOCÊ DEVE SE BASEAR RIGOROSAMENTE NO PORTFÓLIO DE PRODUTOS DA MEDIC DISTRIBUIDORA E DA ARTHROMED (catálogo Emultec/Medic).
   - Utilize as nomenclaturas comerciais padronizadas, equivalentes de catálogo e especificações técnicas oficiais:
     * Cirurgias de Ombro, Joelho e Artroscopia:
       - Âncoras: Âncora FastFit 2.5 FFA, Âncora FastFit Knotless (Sem Nó em PEEK/UHMWPE), Âncora FastFit Razek 2.5 Ajustável, Âncora Metálica TI 5.0 Sinfix, SwiveLock / PushLock (Arthrex).
       - Fixação Cortical: Botão Cortical Sinfix Button / Endobutton (Titânio + laço UHMWPE ajustável para enxertos LCA/LCP), FastFit Razek FAB Button.
       - Suturas & Fitas: Fio de Sutura Trançada com 2 Agulhas Surtufix (UHMWPE de Alta Resistência), Fita UHMWPE 2.0mm com Agulha.
       - Perfuração & Acesso: Broca Retrógrada Flexdrill (para túnel ósseo LCA/LCP), Fresas Shanon / Cilíndricas / Wedge, Cânula Artroscópica 8.5x90mm Razek, Passador de Sutura Sinpass Agulha, Fio Guia Canulado / Fio K.
     * Cirurgias de Coluna & Ortopedia Geral:
       - Agente Antiaderente e Hemostático: Betamix Gel 3.0ml (Gel estéril à base de ácido hialurônico, barreira física antifibrótica pós-operatória e hemostático) / Adhesion.
       - Sistemas Pediculares & Hastes: Parafusos Pediculares Poliaxiais de Titânio, Hastes de Titânio, Cages Intersomáticos (PEEK/Titânio), Pinos e Placas de Fixação Óssea.
     * Próteses e Artroplastia:
       - Prótese Parcial para Cabeça de Rádio Modular 19x09 (Titânio).

2. MARCAS / FABRICANTES RECOMENDADOS (MÍN. 3 MARCAS):
   - Indique sempre no mínimo 3 marcas reconhecidas no mercado e integrantes do portfólio Medic/Arthromed na coluna "MARCAS (MÍN. 3)", tais como:
     * [Razek / Sinfix / Arthrex]
     * [Medtronic / Stryker / DePuy Synthes]
     * [Smith & Nephew / Surtufix / Betamix]

3. FORNECEDORES SUGERIDOS:
   - Inclua obrigatoriamente a **Medic Distribuidora** e a **Arthromed** entre os fornecedores sugeridos na tabela "## FORNECEDORES SUGERIDOS", acompanhadas por distribuidores parceiros credenciados na região:
     | FORNECEDOR SUGERIDO 1 | FORNECEDOR SUGERIDO 2 | FORNECEDOR SUGERIDO 3 |
     | :--- | :--- | :--- |
     | [Medic Distribuidora] | [Arthromed] | [Fornecedor Autorizado Região] |

ESTRUTURA OBRIGATÓRIA DO MARKDOWN GERADO PARA CADA SOLICITAÇÃO:

# SOLICITAÇÃO DE PROCEDIMENTO
**Convênio:** [NOME DO CONVÊNIO] | **Data:** [ ___/___/______ ]

---

## IDENTIFICAÇÃO DO BENEFICIÁRIO
- **NOME DO PACIENTE:** [Nome Extraído do Documento/Exame ou Paciente]
- **IDADE:** [Idade — Data de Nascimento]
- **CPF:** [CPF do Paciente]
- **CARTEIRINHA:** [Número da Carteirinha se legível ou '[                   ]']

## MÉDICO SOLICITANTE
- **NOME:** [Nome do Médico Solicitante]
- **ESPECIALIDADE:** [Especialidade — ex: Ortopedia — Cirurgia da Coluna]
- **CRM / RQE:** [CRM e RQE do médico]
- **CLÍNICA:** [Nome do Serviço/Clínica]

## DIAGNÓSTICOS — CID-10
| CID-10 | DESCRIÇÃO |
| :--- | :--- |
| [MXX.X] | [Descrição Detalhada do CID-10] |

## HISTÓRIA E INDICAÇÃO CLÍNICA
[Relatório clínico minucioso detalhando a história do paciente, os exames de imagem e eletroneuromiografia legíveis nas fotos anexadas. Incluir obrigatoriamente a frase de tratamento conservador com datas entre colchetes em âmbar: ([ período: ___/___/____ a ___/___/____ ]) e evolução clínica.]

## PLANO TERAPÊUTICO
[Descrição sucinta do procedimento programado e caráter eletivo/urgência.]

## PROCEDIMENTOS SOLICITADOS — TUSS
| CÓDIGO TUSS | PROCEDIMENTO | QTD |
| :--- | :--- | :---: |
| [4.XX.XX.XX-X] | [Nome oficial do procedimento TUSS/CBHPM] | [xN] |

## MATERIAIS E OPME
| QTD | MATERIAL | MARCAS (MÍN. 3) |
| :--- | :--- | :--- |
| [01] | [Nome Padronizado do Material] | [Marca 1 / Marca 2 / Marca 3] |

## JUSTIFICATIVA TÉCNICA DOS MATERIAIS
Para cada material solicitado, inclua um bloco estruturado em 3 partes:
- **NATUREZA DO MATERIAL:** [Composição, tecnologia, características físico-biológicas]
- **INDICAÇÃO CLÍNICA NESTE CASO:** [Por que ESTE paciente com ESTE achado de exame precisa do item no nível operado]
- **DIFERENCIAL E RISCO DA SUBSTITUIÇÃO:** [Risco de falha mecânica, infecção, lesão neurológica ou reintervenção]

## FORNECEDORES SUGERIDOS
| FORNECEDOR SUGERIDO 1 | FORNECEDOR SUGERIDO 2 | FORNECEDOR SUGERIDO 3 |
| :--- | :--- | :--- |
| [Fornecedor A] | [Fornecedor B] | [Fornecedor C] |

## DECLARAÇÃO DE ESSENCIALIDADE E NÃO-SUBSTITUIÇÃO
Declaro que os materiais acima indicados são essenciais à execução segura e eficaz do procedimento proposto e que sua substituição por itens genéricos ou incompatíveis acarreta prejuízo técnico e risco assistencial ao paciente. Mantenho minha indicação clínica nos termos da Resolução CFM nº 2.318/2022.

## REFERÊNCIAS CIENTÍFICAS
| REFERÊNCIA | ACESSO |
| :--- | :--- |
| [Citação de estudo recente PubMed/PRISMA com PMID] | [https://doi.org/10.xxxx/xxxx] |

## EMBASAMENTO NORMATIVO
| NORMATIVA | DESCRIÇÃO |
| :--- | :--- |
| **RN ANS nº 465/2021** | Rol de Procedimentos e Eventos em Saúde e Diretrizes de Utilização |
| **RN ANS nº 566/2022** | Garantia de atendimento nos prazos regulamentados (dias úteis) |
| **Resolução CFM nº 2.318/2022** | Prescrição de OPME: vedação a exclusividade e indicação de ≥3 marcas/fornecedores |
| **Resolução CFM nº 2.217/2018** | Código de Ética Médica — autonomia do médico assistente |
| **Lei nº 9.656/1998 — Art. 10** | Coberturas obrigatórias dos planos de saúde |
| **LGPD — Lei nº 13.709/2018** | Proteção de dados pessoais sensíveis de saúde |

---
**[Nome e CRM do Médico Solicitante no Rodapé]**
`

    try {
      const formattedInputText = `[INSTRUÇÕES / DADOS DO PEDIDO DO USUÁRIO]:\n${rawPrompt || 'Analise os arquivos e fotos anexados para extrair todos os dados clínicos e gerar as solicitações médicas padronizadas para cada paciente.'}`

      const filesPayload = attachedFiles.map((file) => ({
        mimeType: file.type || 'image/png',
        base64: file.base64,
        name: file.name,
        extractedText: file.extractedText,
      }))

      const result = await generateResponse({
        data: {
          text: formattedInputText,
          context: '',
          systemPromptOverride: skillSystemPrompt,
          filesData: filesPayload,
        },
      })

      if (result) {
        setGeneratedDraft(typeof result === 'string' ? result : (result as any).text || String(result))
        setActivePatientIdx(0)
      }
    } catch (err) {
      console.error('Erro ao processar solicitações clínicas:', err)
      setGeneratedDraft(`Ocorreu um erro ao processar o documento: ${err}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(generatedDraft)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadSingleDocx = (contentToDownload?: string, patientName?: string) => {
    const targetContent = contentToDownload || (currentDoc ? currentDoc.content : generatedDraft)
    const targetName = patientName || (currentDoc ? currentDoc.patientName : 'Paciente')
    if (!targetContent) return

    const convertMarkdownToWordHtml = (markdown: string): string => {
      const lines = markdown.split('\n')
      let bodyHtml = ''
      let currentSection = ''
      let fieldBuffer: { label: string; value: string }[] = []
      let tableRows: string[][] = []
      let inTable = false

      const processInline = (str: string) => {
        return str
          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
          .replace(/\[(.*?)\]/g, '<span class="amber-box">[$1]</span>')
      }

      const flushGridHtml = () => {
        if (fieldBuffer.length === 0) return ''
        let gridHtml = '<table style="width:100%;border-collapse:collapse;margin:10px 0;">'
        
        for (let i = 0; i < fieldBuffer.length; i += 2) {
          const item1 = fieldBuffer[i]
          const item2 = fieldBuffer[i + 1]

          gridHtml += '<tr>'
          gridHtml += `
            <td style="width:50%;padding:4px 10px 6px 0;border:none;border-bottom:1px solid #cccccc;vertical-align:bottom;">
              <span style="font-size:8pt;color:#666666;font-family:sans-serif;font-weight:bold;display:block;text-transform:uppercase;">${item1.label}</span>
              <span style="font-size:10pt;color:#111111;font-family:sans-serif;font-weight:bold;">${processInline(item1.value)}</span>
            </td>
          `
          if (item2) {
            gridHtml += `
              <td style="width:50%;padding:4px 0 6px 10px;border:none;border-bottom:1px solid #cccccc;vertical-align:bottom;">
                <span style="font-size:8pt;color:#666666;font-family:sans-serif;font-weight:bold;display:block;text-transform:uppercase;">${item2.label}</span>
                <span style="font-size:10pt;color:#111111;font-family:sans-serif;font-weight:bold;">${processInline(item2.value)}</span>
              </td>
            `
          } else {
            gridHtml += '<td style="width:50%;border:none;"></td>'
          }
          gridHtml += '</tr>'
        }

        gridHtml += '</table>'
        fieldBuffer = []
        return gridHtml
      }

      const flushTable = () => {
        if (tableRows.length === 0) return ''
        const header = tableRows[0]
        const rows = tableRows.slice(1).filter(r => !r.every(cell => cell.includes('---') || cell.includes(':')))
        
        tableRows = []
        inTable = false

        let tableHtml = '<table style="width:100%;border-collapse:collapse;margin-top:10px;margin-bottom:15px;"><thead><tr style="background-color:#005f73;color:#ffffff;">'
        header.forEach(h => {
          tableHtml += `<th style="background-color:#005f73;color:#ffffff;font-weight:bold;padding:8px;border:1px solid #005f73;font-size:10pt;">${processInline(h.trim())}</th>`
        })
        tableHtml += '</tr></thead><tbody>'

        rows.forEach((row, rIdx) => {
          const bg = rIdx % 2 === 0 ? '#ffffff' : '#f7f7f7'
          tableHtml += `<tr style="background-color:${bg};">`
          row.forEach(c => {
            tableHtml += `<td style="border:1px solid #cccccc;padding:8px;font-size:10pt;">${processInline(c.trim())}</td>`
          })
          tableHtml += '</tr>'
        })

        tableHtml += '</tbody></table>'
        return tableHtml
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (line.startsWith('|') && line.endsWith('|')) {
          inTable = true
          const cells = line.split('|').slice(1, -1)
          tableRows.push(cells)
          continue
        }

        if (inTable && !line.startsWith('|')) {
          bodyHtml += flushTable()
        }

        if (!line) {
          if (fieldBuffer.length > 0) bodyHtml += flushGridHtml()
          bodyHtml += '<br/>'
          continue
        }

        if (line.startsWith('# ')) {
          bodyHtml += `
            <table style="width:100%;border-bottom:2pt solid #005f73;margin-bottom:20px;padding-bottom:5px;">
              <tr>
                <td style="border:none;padding:0;">
                  <h1 style="font-family:'Georgia',serif;color:#005f73;font-size:20pt;margin:0;font-weight:bold;">InCore</h1>
                  <span style="font-family:sans-serif;font-size:8.5pt;color:#666666;">Instituto de Coluna e Ortopedia Especializada — Recife/PE</span>
                </td>
                <td style="border:none;padding:0;text-align:right;vertical-align:bottom;">
                  <h2 style="font-family:sans-serif;color:#111111;font-size:11pt;margin:0;font-weight:bold;text-transform:uppercase;">${processInline(line.slice(2))}</h2>
                </td>
              </tr>
            </table>
          `
          continue
        }

        if (line.startsWith('## ')) {
          if (fieldBuffer.length > 0) bodyHtml += flushGridHtml()
          currentSection = line.slice(3).toUpperCase()
          bodyHtml += `<h2 style="font-family:sans-serif;color:#005f73;font-size:12pt;border-bottom:2pt solid #005f73;padding-bottom:2px;margin-top:18px;text-transform:uppercase;font-weight:bold;">${processInline(line.slice(3))}</h2>`
          continue
        }

        if (line.startsWith('- **') && line.includes(':**')) {
          const match = line.match(/-\s*\*\*(.*?):\*\*\s*(.*)/)
          if (match) {
            const label = match[1].trim()
            const value = match[2].trim()

            if (currentSection.includes('BENEFICIÁRIO') || currentSection.includes('IDENTIFICAÇÃO') || currentSection.includes('MÉDICO')) {
              fieldBuffer.push({ label, value })
              continue
            }
          }
        }

        if (fieldBuffer.length > 0) bodyHtml += flushGridHtml()

        if (line.startsWith('### ')) {
          bodyHtml += `<h3 style="font-family:sans-serif;color:#111111;font-size:11pt;margin-top:14px;font-weight:bold;">${processInline(line.slice(4))}</h3>`
          continue
        }

        if (line.startsWith('- **NATUREZA') || line.startsWith('- **INDICAÇÃO') || line.startsWith('- **DIFERENCIAL')) {
          bodyHtml += `<div style="border-left:3pt solid #005f73;background-color:#f8fafc;padding:8px 12px;margin:8px 0;font-size:10pt;">${processInline(line.slice(2))}</div>`
          continue
        }

        if (line.startsWith('- ') || line.startsWith('* ')) {
          bodyHtml += `<li style="margin-left:20px;font-size:10.5pt;font-family:'Georgia',serif;">${processInline(line.slice(2))}</li>`
          continue
        }

        bodyHtml += `<p style="margin:4px 0;font-size:10.5pt;font-family:'Georgia',serif;">${processInline(line)}</p>`
      }

      if (fieldBuffer.length > 0) bodyHtml += flushGridHtml()
      if (inTable && tableRows.length > 0) bodyHtml += flushTable()

      return bodyHtml
    }

    const htmlBody = convertMarkdownToWordHtml(targetContent)

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Solicitação Médica - ${targetName}</title>
        <style>
          body { font-family: 'Georgia', serif; font-size: 11pt; color: #111111; line-height: 1.5; margin: 40px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 15px; }
          th { background-color: #005f73; color: #ffffff; font-weight: bold; padding: 8px; font-size: 10pt; text-align: left; border: 1px solid #005f73; }
          td { border: 1px solid #cccccc; padding: 8px; font-size: 10pt; }
          tr:nth-child(even) { background-color: #f7f7f7; }
          .amber-box { background-color: #fff8e1; color: #7a4500; padding: 2px 6px; font-weight: bold; border-radius: 3px; }
          .callout { border-left: 3pt solid #005f73; background-color: #f8fafc; padding: 10px 14px; margin: 12px 0; }
        </style>
      </head>
      <body>
        ${htmlBody}
      </body>
      </html>
    `

    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = targetName.replace(/[^a-zA-Z0-9_]/g, '_')
    a.download = `Solicitacao_Medica_${safeName}_${new Date().toISOString().slice(0, 10)}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadAllDocx = () => {
    parsedDocs.forEach((doc, idx) => {
      setTimeout(() => {
        handleDownloadSingleDocx(doc.content, doc.patientName)
      }, idx * 600)
    })
  }

  return (
    <div className="w-full h-full bg-[#f8fafc] overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md border border-slate-800 p-5 sm:p-6 overflow-hidden relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center shadow-md shrink-0 font-extrabold mt-0.5">
              <Stethoscope size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-white">Solicitação Médica</h2>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-wide">
                  Metodologia Anti-Glosa
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-[620px] leading-relaxed">
                Central de documentação cirúrgica padronizada anti-glosa. Anexe fotos ou PDFs das comandas para extrair dados, unificar pacientes e compilar solicitações em Word (.docx).
              </p>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0">
            <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Resolução CFM 2.318/2022
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Portfólio Medic & Arthromed</span>
          </div>
        </div>
      </div>

      {/* 3-Step Guided Workflow Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-amber-200/60">
            1
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">1. Anexar ou Digitar</h4>
            <p className="text-[10px] text-slate-500">Fotos de pedidos, laudos ou PDFs</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-blue-200/60">
            2
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">2. Análise Automática da IA</h4>
            <p className="text-[10px] text-slate-500">Agrupa pacientes e CIDs anti-glosa</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0 border border-emerald-200/60">
            3
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">3. Baixar em Word (.docx)</h4>
            <p className="text-[10px] text-slate-500">Documento pronto editável no PC e Celular</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Input Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-5">
          
          <div className="space-y-4">
            
            {/* Upload Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-[#1a2332] uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon size={15} className="text-amber-600" />
                  1. Fotos / PDFs dos Pedidos ou Exames
                </h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Visão Computacional IA
                </span>
              </div>

              <div className="border-2 border-dashed border-amber-200 bg-amber-50/30 hover:bg-amber-50/70 rounded-2xl p-5 text-center transition-colors relative cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                    <Paperclip size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Clique aqui para selecionar fotos ou PDFs dos laudos
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Suporta PDF, foto de celular, laudo de ressonância, carteirinha do convênio e RG
                    </span>
                  </div>
                </div>
              </div>

              {/* Attached Files List */}
              {attachedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                    Arquivos Anexados ({attachedFiles.length}):
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {attachedFiles.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs"
                      >
                        <ImageIcon size={14} className="text-amber-600" />
                        <span className="max-w-[140px] truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer ml-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Sample Chips */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1.5">
                Exemplos Rápidos (Clique para testar):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRawPrompt(sample.text)}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    + {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input & Voice Recorder */}
            <div>
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <h3 className="text-xs font-bold text-[#1a2332] uppercase tracking-wider flex items-center gap-2">
                  <FileText size={15} className="text-amber-600" />
                  2. Instruções ou Observações Adicionais
                </h3>

                {/* Botão Gravador de Voz */}
                <button
                  type="button"
                  onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                    isRecording
                      ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                  }`}
                  title={isRecording ? "Clique para parar o ditado por voz" : "Clique para ditar suas observações por voz"}
                >
                  {isRecording ? (
                    <>
                      <MicOff size={14} className="animate-bounce" />
                      <span>Gravando ({recordingTime}s) • Parar</span>
                    </>
                  ) : (
                    <>
                      <Mic size={14} className="text-amber-800" />
                      <span>Gravador de Voz</span>
                    </>
                  )}
                </button>
              </div>

              {isRecording && (
                <div className="mb-2 p-2 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-800 text-[11px] font-bold shadow-2xs animate-fade-in">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                  <span>Escutando seu microfone... Fale suas observações que a IA transcreverá automaticamente abaixo.</span>
                </div>
              )}

              <textarea
                rows={4}
                placeholder="Exemplo: Paciente com dor lombar refratária a fisioterapia. Cirurgia de coluna no Bradesco. Marcas indicadas: Medtronic, Stryker e DePuy. (Ou clique em Gravador de Voz acima para ditar)"
                value={rawPrompt}
                onChange={(e) => setRawPrompt(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 focus:bg-white focus:border-amber-900 outline-none transition-all leading-relaxed font-sans"
              />
            </div>

          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateWithAI}
            disabled={isLoading || (attachedFiles.length === 0 && !rawPrompt.trim())}
            className="w-full bg-amber-900 hover:bg-amber-950 active:scale-[0.99] text-white py-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-4"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin text-amber-400" />
                <span>Processando Documentos e Gerando Solicitação...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Analisar e Gerar Solicitação Completa (.docx)</span>
              </>
            )}
          </button>

        </div>

        {/* Output Column - A4 Paper Preview */}
        <div className="lg:col-span-7 flex flex-col bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-[#1a2332] uppercase tracking-wider flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" />
              Documento Impresso (Padrão A4 InCore)
            </h3>

            <div className="flex items-center gap-2">
              {generatedDraft && (
                <>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-bold">
                    <button
                      onClick={() => setViewMode('formatted')}
                      className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        viewMode === 'formatted' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Eye size={12} />
                      <span>Folha A4</span>
                    </button>
                    <button
                      onClick={() => setViewMode('raw')}
                      className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        viewMode === 'raw' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Code size={12} />
                      <span>Markdown</span>
                    </button>
                  </div>

                  <button
                    onClick={handleCopyDraft}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-slate-200"
                  >
                    {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Patient Tabs (Quando houver múltiplos pacientes/comandas) */}
          {generatedDraft && !isLoading && parsedDocs.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2.5 mb-3 border-b border-slate-100 hide-scrollbar">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <User size={12} />
                Pacientes Identificados ({parsedDocs.length}):
              </span>
              {parsedDocs.map((doc, idx) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setActivePatientIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                    activePatientIdx === idx
                      ? 'bg-amber-900 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{doc.patientName}</span>
                </button>
              ))}
            </div>
          )}

          {/* A4 Paper Document Preview Container */}
          <div className="flex-1 bg-[#e2e8f0] p-4 sm:p-6 rounded-2xl overflow-y-auto min-h-[500px] flex justify-center items-start border border-slate-300">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 py-28 space-y-3">
                <Loader2 size={38} className="animate-spin text-amber-600" />
                <p className="text-xs font-bold text-slate-700">Lendo exames e agrupando comandas por paciente...</p>
                <span className="text-[10px] text-slate-500">Consolidando laudos do mesmo paciente e gerando solicitações A4 separadas</span>
              </div>
            ) : generatedDraft ? (
              viewMode === 'formatted' ? (
                <ClinicalPaperDocument 
                  content={currentDoc ? currentDoc.content : generatedDraft} 
                  onUpdateContent={handleUpdateCurrentDocContent}
                />
              ) : (
                <pre className="w-full bg-[#1a2332] text-slate-200 p-5 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                  {currentDoc ? currentDoc.content : generatedDraft}
                </pre>
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-center py-28 space-y-2">
                <Stethoscope size={48} className="mb-2 opacity-25 text-amber-600" />
                <p className="text-xs font-bold text-slate-700">Anexe as fotos ou PDFs das comandas e clique em Gerar.</p>
                <span className="text-[10px] text-slate-500 max-w-[320px] leading-relaxed">
                  Comandas do mesmo paciente serão unificadas em 1 solicitação. Pacientes diferentes (ex: Gabriel e Laura) gerarão solicitações A4 separadas.
                </span>
              </div>
            )}
          </div>

          {/* Download Buttons */}
          {generatedDraft && !isLoading && (
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-2">
              <button
                onClick={() => handleDownloadSingleDocx(currentDoc?.content, currentDoc?.patientName)}
                className="w-full flex-1 bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Download size={16} />
                <span>Baixar Solicitação de {currentDoc?.patientName || 'Paciente'} (.docx)</span>
              </button>

              {parsedDocs.length > 1 && (
                <button
                  onClick={handleDownloadAllDocx}
                  className="w-full sm:w-auto bg-amber-900 hover:bg-amber-950 text-white py-4 px-5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                  title="Baixar todas as solicitações cirúrgicas geradas em arquivos Word separados"
                >
                  <Download size={16} />
                  <span>Baixar Todos ({parsedDocs.length} Pacientes)</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  </div>
)
}
