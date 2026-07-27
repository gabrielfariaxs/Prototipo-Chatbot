import React, { useState } from 'react'
import { 
  Stethoscope, FileText, Download, Copy, Sparkles, Send, Paperclip, X, Image as ImageIcon,
  Loader2, Check, Eye, Code
} from 'lucide-react'
import { generateResponse } from '../../lib/chat'
import { processClinicalFile, ProcessedFile } from '../../lib/pdf-reader'

/**
 * Renderizador de Papel A4 com layout de Grade 2 Colunas e Linhas Inferiores (Fiel ao modelo InCore/Claude)
 */
function ClinicalPaperDocument({ content }: { content: string }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements: React.ReactNode[] = []
  let currentSectionTitle = ''
  let sectionFields: { label: string; value: string }[] = []
  let tableRows: string[][] = []
  let inTable = false

  const processInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|\[.*?\])/g)
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-slate-900 font-sans">{part.slice(2, -2)}</strong>
      }
      if (part.startsWith('[') && part.endsWith(']')) {
        return (
          <span key={idx} className="inline-block bg-[#fff8e1] text-[#7a4500] font-mono font-bold px-1.5 py-0.5 rounded border border-[#ffe082] text-[11px] mx-0.5">
            {part}
          </span>
        )
      }
      return part
    })
  }

  const flushGridFields = (key: number) => {
    if (sectionFields.length === 0) return null
    const fields = [...sectionFields]
    sectionFields = []

    return (
      <div key={key} className="my-3 grid grid-cols-2 gap-x-6 gap-y-3 font-sans">
        {fields.map((f, fIdx) => (
          <div key={fIdx} className="flex flex-col">
            <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">{f.label}</span>
            <div className="text-[12px] font-semibold text-slate-900 border-b border-slate-300 pb-1 mt-0.5">
              {processInline(f.value)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const flushTable = (key: number) => {
    if (tableRows.length === 0) return null
    const header = tableRows[0]
    const rows = tableRows.slice(1).filter(r => !r.every(cell => cell.includes('---') || cell.includes(':')))
    
    tableRows = []
    inTable = false

    return (
      <div key={key} className="my-4 overflow-x-auto rounded-sm border border-slate-300 shadow-2xs">
        <table className="w-full text-left border-collapse text-[11px] font-sans">
          <thead>
            <tr className="bg-[#005f73] text-white font-bold border-b border-[#005f73]">
              {header.map((col, cIdx) => (
                <th key={cIdx} className="p-2.5 border-r last:border-r-0 border-[#005f73] uppercase tracking-wider text-[10px]">
                  {processInline(col.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800">
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-[#f7f7f7]'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2.5 border-r last:border-r-0 border-slate-200 leading-relaxed">
                    {processInline(cell.trim())}
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
      tableRows.push(cells)
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
              {processInline(trimmed.slice(2))}
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
          {processInline(trimmed.slice(3))}
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
          sectionFields.push({ label, value })
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
          {processInline(trimmed.slice(4))}
        </h3>
      )
      return
    }

    if (trimmed.startsWith('- **NATUREZA') || trimmed.startsWith('- **INDICAÇÃO') || trimmed.startsWith('- **DIFERENCIAL')) {
      elements.push(
        <div key={idx} className="border-l-3 border-[#005f73] bg-[#f8fafc] p-3 rounded-r-sm my-2 text-[11px] font-sans text-slate-800 leading-relaxed">
          {processInline(trimmed.slice(2))}
        </div>
      )
      return
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-slate-800 text-[12px] font-serif my-1 leading-relaxed">
          {processInline(trimmed.slice(2))}
        </li>
      )
      return
    }

    elements.push(
      <p key={idx} className="text-[12px] text-slate-800 font-serif my-2 leading-relaxed">
        {processInline(trimmed)}
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

  // Generated Markdown state & preview
  const [generatedDraft, setGeneratedDraft] = useState('')
  const [copied, setCopied] = useState(false)

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
Analisar com EXTREMA PRECISÃO os documentos/imagens anexados e o texto digitado pelo usuário para gerar o documento clínico completo em Markdown no PADRÃO ESTRUTURADO INSTITUCIONAL IDÊNTICO AO MODELO OFICIAL:

ESTRUTURA OBRIGATÓRIA DO MARKDOWN GERADO:

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
      const formattedInputText = `[INSTRUÇÕES / DADOS DO PEDIDO DO USUÁRIO]:\n${rawPrompt || 'Analise os arquivos e fotos anexados para extrair todos os dados clínicos e gerar a solicitação médica completa.'}`

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

  const handleDownloadDocx = () => {
    if (!generatedDraft) return

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

    const htmlBody = convertMarkdownToWordHtml(generatedDraft)

    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Solicitação Médica</title>
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
    a.download = `Solicitacao_Medica_${new Date().toISOString().slice(0, 10)}.doc`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto p-4 sm:p-8 w-full max-w-[1300px] mx-auto">
      
      {/* Header Banner */}
      <div className="mb-6 bg-gradient-to-r from-[#1a2332] to-[#253248] text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center shadow-lg shrink-0 font-extrabold">
            <Stethoscope size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Solicitação Médica</h2>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase">
                Metodologia Anti-Glosa
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-[600px] leading-relaxed">
              Central para vendedores, representantes e médicos. Envie fotos ou PDFs dos pedidos para a IA extrair dados e compilar a solicitação padronizada em Word (.docx).
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-3 py-1.5 rounded-xl border border-amber-500/30 flex items-center gap-1.5">
            <Sparkles size={14} />
            Resolução CFM 2.318/2022
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Normativas ANS & STF Atualizadas</span>
        </div>
      </div>

      {/* 3-Step Guided Workflow Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 border border-blue-100">
            1
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">1. Anexar ou Digitar</h4>
            <p className="text-[10px] text-slate-500">Fotos de pedidos, laudos ou PDFs</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 font-black text-xs flex items-center justify-center shrink-0 border border-amber-100">
            2
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">2. Análise Automática da IA</h4>
            <p className="text-[10px] text-slate-500">Identifica CIDs, TUSS e regras anti-glosa</p>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-black text-xs flex items-center justify-center shrink-0 border border-emerald-100">
            3
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">3. Baixar em Word (.docx)</h4>
            <p className="text-[10px] text-slate-500">Pronto no padrão Georgia institucional</p>
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

            {/* Text Input */}
            <div>
              <h3 className="text-xs font-bold text-[#1a2332] uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText size={15} className="text-amber-600" />
                2. Instruções ou Observações Adicionais
              </h3>
              <textarea
                rows={4}
                placeholder="Exemplo: Paciente com dor lombar refratária a fisioterapia. Cirurgia de coluna no Bradesco. Marcas indicadas: Medtronic, Stryker e DePuy."
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

          {/* A4 Paper Document Preview Container */}
          <div className="flex-1 bg-[#e2e8f0] p-4 sm:p-6 rounded-2xl overflow-y-auto max-h-[640px] flex justify-center items-start border border-slate-300">
            {isLoading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 py-28 space-y-3">
                <Loader2 size={38} className="animate-spin text-amber-600" />
                <p className="text-xs font-bold text-slate-700">Lendo exames e gerando a Folha A4 InCore...</p>
                <span className="text-[10px] text-slate-500">Formatando diagnósticos CIDs, TUSS, Motor de 3 Blocos e Normativas</span>
              </div>
            ) : generatedDraft ? (
              viewMode === 'formatted' ? (
                <ClinicalPaperDocument content={generatedDraft} />
              ) : (
                <pre className="w-full bg-[#1a2332] text-slate-200 p-5 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                  {generatedDraft}
                </pre>
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-center py-28 space-y-2">
                <Stethoscope size={48} className="mb-2 opacity-25 text-amber-600" />
                <p className="text-xs font-bold text-slate-700">Anexe as fotos ou PDFs dos laudos e clique em Gerar.</p>
                <span className="text-[10px] text-slate-500 max-w-[320px] leading-relaxed">
                  A IA lerá os exames e montará a folha impressa A4 exatamente igual ao modelo da clínica InCore para download em Word (.docx).
                </span>
              </div>
            )}
          </div>

          {/* Download Button */}
          {generatedDraft && !isLoading && (
            <div className="mt-4">
              <button
                onClick={handleDownloadDocx}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white py-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <Download size={16} />
                <span>Baixar Solicitação Pronta em Word (.docx)</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
