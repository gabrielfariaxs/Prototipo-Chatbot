import React, { useState, useEffect, useRef } from 'react'
import { FileSpreadsheet, FileText, ArrowLeft, Play, Download, XCircle, RefreshCw } from 'lucide-react'

// ============================================================
// TYPES
// ============================================================
type NomenMap = {
  desc_solicitacao: string
  desc_emultec: string
  referencia: string
  observacao: string
}

type PDFItem = {
  codigo: string
  descricao: string
  reg_anvisa: string
  quantidade: number
  valor_unit: number
  subtotal: number
  fabricante: string
  lote_qtd: number
  lote_numero: string
  lote_validade: string
}

type PDFData = {
  arquivo: string
  paciente: string
  cirurgia: string
  cirurgiao: string
  itens: PDFItem[]
}

type LogMessage = {
  type: 'info' | 'success' | 'warn' | 'error'
  text: string
}

type Stats = {
  total: number
  matched: number
  noPdf: number
  noItem: number
  insertedRows: number
}

interface FatureIAProps {
  onBack: () => void
}

export const FatureIA = ({ onBack }: FatureIAProps) => {
  // Files States
  const [loteFile, setLoteFile] = useState<File | null>(null)
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  
  // App States
  const [nomenclatures, setNomenclatures] = useState<NomenMap[]>([])
  const [nomenStatus, setNomenStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState({ current: 0, total: 0 })
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [processedWorkbook, setProcessedWorkbook] = useState<any | null>(null)

  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logic for the log console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs])

  // Load nomenclature spreadsheet on mount
  useEffect(() => {
    const fetchNomenclatures = async () => {
      try {
        const ExcelJS = (await import('exceljs')).default
        setLogs(prev => [...prev, { type: 'info', text: '📥 Buscando arquivo de nomenclaturas do projeto...' }])
        const response = await fetch('/nomenclaturas.xlsx')
        if (!response.ok) {
          throw new Error('Falha ao baixar o arquivo /nomenclaturas.xlsx. Verifique se ele existe no servidor.')
        }
        const arrayBuffer = await response.arrayBuffer()
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(arrayBuffer)
        
        const mappings: NomenMap[] = []
        workbook.eachSheet((worksheet) => {
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return // Skip header row
            const desc_sol = String(row.getCell(1).value || '').trim()
            const desc_emu = String(row.getCell(2).value || '').trim()
            const ref = String(row.getCell(3).value || '').trim()
            const obs = String(row.getCell(4).value || '').trim()
            if (desc_sol && desc_emu) {
              mappings.push({
                desc_solicitacao: desc_sol,
                desc_emultec: desc_emu,
                referencia: ref,
                observacao: obs
              })
            }
          })
        })

        setNomenclatures(mappings)
        setNomenStatus('success')
        setLogs(prev => [...prev, { type: 'success', text: `📋 ${mappings.length} nomenclaturas carregadas com sucesso.` }])
      } catch (err: any) {
        console.error(err)
        setNomenStatus('error')
        setLogs(prev => [...prev, { type: 'error', text: `❌ Falha ao carregar nomenclaturas: ${err.message}` }])
      }
    }

    fetchNomenclatures()
  }, [])

  // ============================================================
  // HELPERS FOR LOGGING
  // ============================================================
  const addLog = (type: 'info' | 'success' | 'warn' | 'error', text: string) => {
    setLogs(prev => [...prev, { type, text }])
  }

  // ============================================================
  // PARSING PDF TEXT
  // ============================================================
  const parsePDFText = (fileName: string, fullText: string): PDFData => {
    const data: PDFData = {
      arquivo: fileName,
      paciente: "",
      cirurgia: "",
      cirurgiao: "",
      itens: []
    }

    const pacienteMatch = fullText.match(/Paciente:\s*(.+)/i)
    if (pacienteMatch) data.paciente = pacienteMatch[1].trim()

    const cirurgiaMatch = fullText.match(/Cirurgia:\s*(.+)/i)
    if (cirurgiaMatch) data.cirurgia = cirurgiaMatch[1].trim()

    const cirurgiaoMatch = fullText.match(/Cirurgião:\s*(.+)/i)
    if (cirurgiaoMatch) data.cirurgiao = cirurgiaoMatch[1].trim()

    // Extract items
    const lines = fullText.split('\n')
    let inItemsSection = false
    
    const SKIP_PREFIXES = [
      'ARTHROMED', 'R FREI', 'RECIFE', 'CNPJ:', 'Pós Cirúrgico',
      'ELETIVA', 'Cliente:', 'Contato:', 'R MIPIBU', 'NATAL/RN',
      'Cirurgia:', 'Paciente:', 'Cirurgião:', 'Convênio:', 'Guia:',
      'Hospital:', 'Código'
    ]

    const parseBRL = (val: string): number => {
      return parseFloat(val.replace(/\./g, '').replace(',', '.'))
    }

    const isNewItem = (lineStr: string): boolean => {
      return /^(\S+)\s+(.+?)\s+(\d{10,})\s+(\d+)\s+/.test(lineStr)
    }

    const parseLoteLine = (lineStr: string, itemObj: PDFItem) => {
      const match = lineStr.match(/Lote:\s*\(\s*(\d+)\s*\)\s*(\S+)(?:\s*-\s*(\d{2}\/\d{2}\/\d{4}))?/i)
      if (match) {
        itemObj.lote_qtd = parseInt(match[1], 10)
        itemObj.lote_numero = match[2]
        itemObj.lote_validade = match[3] || ""
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      if (line.includes('Código') && line.includes('Descrição') && line.includes('Qtdade')) {
        inItemsSection = true
        continue
      }

      if (line.startsWith('Forma de Pagto') || /^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}/.test(line)) {
        inItemsSection = false
        continue
      }

      if (!inItemsSection) continue

      if (SKIP_PREFIXES.some(prefix => line.startsWith(prefix))) {
        if (line.includes('Código') && line.includes('Descrição')) {
          inItemsSection = true
        }
        continue
      }

      // Parse item line
      const itemMatch = line.match(/^(\S+)\s+(.+?)\s+(\d{10,})\s+(\d+)\s+([\d.,]+)\s+([\d.,]+)\s*$/)
      if (itemMatch) {
        const item: PDFItem = {
          codigo: itemMatch[1],
          descricao: itemMatch[2].trim(),
          reg_anvisa: itemMatch[3],
          quantidade: parseInt(itemMatch[4], 10),
          valor_unit: parseBRL(itemMatch[5]),
          subtotal: parseBRL(itemMatch[6]),
          fabricante: "",
          lote_qtd: 0,
          lote_numero: "",
          lote_validade: ""
        }

        // Check next lines for manufacturer & lote
        let nextIdx = i + 1
        if (nextIdx < lines.length) {
          const nextLine = lines[nextIdx].trim()
          if (nextLine && !nextLine.startsWith('Lote:') && !isNewItem(nextLine)) {
            item.fabricante = nextLine
            nextIdx++
          }
        }

        if (nextIdx < lines.length) {
          const nextLine = lines[nextIdx].trim()
          if (nextLine.startsWith('Lote:')) {
            parseLoteLine(nextLine, item)
            nextIdx++
          }
        }

        data.itens.push(item)
        i = nextIdx - 1
        continue
      }

      // Continuation of previous item
      if (data.itens.length > 0 && !line.startsWith('Lote:')) {
        const nextLine = (lines[i + 1] || '').trim()
        if (nextLine.startsWith('Lote:')) {
          const lastItem = data.itens[data.itens.length - 1]
          if (!lastItem.fabricante) {
            lastItem.fabricante = line
          }
          i++
          parseLoteLine(lines[i].trim(), lastItem)
          continue
        }
      }
    }

    return data
  }

  // ============================================================
  // NORMALIZATION & MATCHING STRATEGIES
  // ============================================================
  const normalizeName = (name: string): string => {
    if (!name) return ""
    let norm = name.toUpperCase().trim()
    const replacements: Record<string, string> = {
      'Á': 'A', 'À': 'A', 'Ã': 'A', 'Â': 'A',
      'É': 'E', 'È': 'E', 'Ê': 'E',
      'Í': 'I', 'Ì': 'I', 'Î': 'I',
      'Ó': 'O', 'Ò': 'O', 'Õ': 'O', 'Ô': 'O',
      'Ú': 'U', 'Ù': 'U', 'Û': 'U', 'Ç': 'C'
    }
    for (const [oldChar, newChar] of Object.entries(replacements)) {
      norm = norm.replaceAll(oldChar, newChar)
    }
    return norm
  }

  const findNomenclatureDesc = (
    pdfCode: string,
    excelDesc: string,
    nomenclature: NomenMap[]
  ): string => {
    for (const nom of nomenclature) {
      const ref = nom.referencia.toUpperCase().trim()
      if (ref && (ref === pdfCode || excelDesc.includes(ref))) {
        return nom.desc_emultec
      }
    }
    return ""
  }

  const findMatchingItem = (
    excelItemDesc: string,
    pdfItems: PDFItem[],
    nomenclature: NomenMap[],
    usedPdfIndices: Set<number>
  ): { idx: number; item: PDFItem; nomenclatureDesc: string } | null => {
    const excelUpper = excelItemDesc ? excelItemDesc.toUpperCase() : ""

    // Strategy 1: Código do PDF aparece no texto do Excel
    for (let idx = 0; idx < pdfItems.length; idx++) {
      if (usedPdfIndices.has(idx)) continue
      const pdfItem = pdfItems[idx]
      const pdfCode = pdfItem.codigo.toUpperCase()
      if (excelUpper.includes(pdfCode)) {
        const nomen = findNomenclatureDesc(pdfCode, excelUpper, nomenclature)
        return { idx, item: pdfItem, nomenclatureDesc: nomen }
      }
    }

    // Strategy 2: Match por referência da nomenclatura
    for (const nom of nomenclature) {
      const ref = nom.referencia.toUpperCase().trim()
      if (!ref) continue
      if (excelUpper.includes(ref)) {
        for (let idx = 0; idx < pdfItems.length; idx++) {
          if (usedPdfIndices.has(idx)) continue
          const pdfItem = pdfItems[idx]
          if (pdfItem.codigo.toUpperCase() === ref) {
            return { idx, item: pdfItem, nomenclatureDesc: nom.desc_emultec }
          }
        }
      }
    }

    // Strategy 3: Match por similaridade de descrição
    let bestMatch: { idx: number; item: PDFItem; nomenclatureDesc: string } | null = null
    let bestScore = 0

    for (let idx = 0; idx < pdfItems.length; idx++) {
      if (usedPdfIndices.has(idx)) continue
      const pdfItem = pdfItems[idx]

      const getWords = (str: string) => {
        const matches = str.match(/[A-Z0-9]{3,}/g) || []
        return new Set(matches)
      }

      const pdfWords = getWords(pdfItem.descricao.toUpperCase())
      const excelWords = getWords(excelUpper)

      if (pdfWords.size === 0 || excelWords.size === 0) continue

      let intersectionSize = 0
      pdfWords.forEach((word) => {
        if (excelWords.has(word)) intersectionSize++
      })

      const score = intersectionSize / Math.min(pdfWords.size, excelWords.size)

      if (score > bestScore && score >= 0.35 && intersectionSize >= 2) {
        bestScore = score
        const nomen = findNomenclatureDesc(pdfItem.codigo.toUpperCase(), excelUpper, nomenclature)
        bestMatch = { idx, item: pdfItem, nomenclatureDesc: nomen }
      }
    }

    if (bestMatch) return bestMatch

    // Strategy 4: Fallback (Ordem sequencial)
    for (let idx = 0; idx < pdfItems.length; idx++) {
      if (!usedPdfIndices.has(idx)) {
        const pdfItem = pdfItems[idx]
        const nomen = findNomenclatureDesc(pdfItem.codigo.toUpperCase(), excelUpper, nomenclature)
        return { idx, item: pdfItem, nomenclatureDesc: nomen }
      }
    }

    return null
  }

  // ============================================================
  // MAIN PROCESSING ENGINE
  // ============================================================
  const processFiles = async () => {
    const ExcelJS = (await import('exceljs')).default
    if (!loteFile) {
      alert("Por favor, selecione a planilha de Lote Excel.")
      return
    }
    if (pdfFiles.length === 0) {
      alert("Por favor, selecione os arquivos PDF das cirurgias.")
      return
    }

    setIsProcessing(true)
    setStats(null)
    setProcessedWorkbook(null)
    setLogs([])

    addLog('info', '🚀 Iniciando o processamento FatureIA...')
    addLog('info', `📄 Analisando ${pdfFiles.length} arquivos PDF...`)

    // Load PDFJS dynamically
    const pdfjsModule = await import('pdfjs-dist')
    const pdfjs = pdfjsModule.default || pdfjsModule
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs`

    const parsedPDFs: PDFData[] = []
    setProgress({ current: 0, total: pdfFiles.length })

    // Step 1: Parse all PDFs
    for (let idx = 0; idx < pdfFiles.length; idx++) {
      const file = pdfFiles[idx]
      try {
        const arrayBuffer = await file.arrayBuffer()
        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) })
        const pdf = await loadingTask.promise
        let fullText = ""

        for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const pageText = textContent.items.map((item: any) => item.str).join(" ")
          fullText += pageText + "\n"
        }

        const pdfData = parsePDFText(file.name, fullText)
        parsedPDFs.push(pdfData)
        
        addLog('success', `✅ PDF Lido: "${pdfData.paciente}" (${pdfData.itens.length} itens)`)
      } catch (err: any) {
        console.error(err)
        addLog('error', `❌ Erro no PDF "${file.name}": ${err.message}`)
      }
      setProgress(prev => ({ ...prev, current: idx + 1 }))
    }

    // Index PDFs by patient
    const pdfByPatient: Record<string, PDFData> = {}
    parsedPDFs.forEach(pdfData => {
      if (pdfData.paciente) {
        const norm = normalizeName(pdfData.paciente)
        pdfByPatient[norm] = pdfData
      }
    })

    // Step 2: Load Excel Lote
    addLog('info', '📊 Lendo planilha de Lote Excel...')
    const loteBuffer = await loteFile.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    
    try {
      await workbook.xlsx.load(loteBuffer)
    } catch (excelErr: any) {
      addLog('error', `❌ Falha ao carregar arquivo Excel: ${excelErr.message}`)
      setIsProcessing(false)
      return
    }

    const worksheet = workbook.getWorksheet(1) || workbook.worksheets[0]
    if (!worksheet) {
      addLog('error', '❌ Nenhuma aba encontrada na planilha de Lote.')
      setIsProcessing(false)
      return
    }

    // Colunas pós inserção
    const COL_INSERT_POS = 10 // Coluna J
    const NUM_NEW_COLS = 4
    const COL_ITEM = 4 // Coluna D (index 4)
    const COL_PATIENT_AFTER = 20 // P(16) + 4 = T(20)
    
    // ── Inserir 4 colunas novas na posição J (coluna 10) ──
    worksheet.spliceColumns(COL_INSERT_POS, 0, [], [], [], [])
    addLog('info', '🛠️ Inseridas 4 colunas em J (Nº Lote, Validade Lote, Qtd Lote, Desc. Nomenclatura)')

    // Copiar estilos da coluna 9 (I) para as novas colunas
    worksheet.eachRow((row) => {
      const sourceCell = row.getCell(9) // Coluna I
      for (let i = 0; i < NUM_NEW_COLS; i++) {
        const targetCell = row.getCell(COL_INSERT_POS + i)
        targetCell.font = sourceCell.font
        targetCell.fill = sourceCell.fill
        targetCell.border = sourceCell.border
        targetCell.alignment = sourceCell.alignment
        targetCell.numFmt = sourceCell.numFmt
        targetCell.protection = sourceCell.protection
      }
    })

    // Escrever cabeçalho das novas colunas
    const headers = ['Nº Lote', 'Validade Lote', 'Qtd Lote', 'Desc. Nomenclatura']
    const widths = [18, 15, 10, 45]
    const headerRow = worksheet.getRow(1)
    for (let i = 0; i < 4; i++) {
      const colNum = COL_INSERT_POS + i
      headerRow.getCell(colNum).value = headers[i]
      worksheet.getColumn(colNum).width = widths[i]
    }

    // Step 3: Match & Fill
    addLog('info', '🔄 Cruzando dados dos PDFs com o Excel...')
    const localStats: Stats = { total: 0, matched: 0, noPdf: 0, noItem: 0, insertedRows: 0 }
    const usedItemsByPatient: Record<string, Set<number>> = {}

    let rowIdx = 2
    while (rowIdx <= worksheet.rowCount) {
      const patientCell = worksheet.getRow(rowIdx).getCell(COL_PATIENT_AFTER).value
      if (!patientCell) {
        rowIdx++
        continue
      }

      const patientName = String(patientCell).trim()
      const normPatient = normalizeName(patientName)

      // Search PDF data
      let pdfData = pdfByPatient[normPatient]
      if (!pdfData) {
        // Fuzzy search
        for (const [key, val] of Object.entries(pdfByPatient)) {
          const keyWords = new Set(key.split(/\s+/))
          const patWords = new Set(normPatient.split(/\s+/))
          let intersectionSize = 0
          keyWords.forEach(word => {
            if (patWords.has(word)) intersectionSize++
          })
          const minSize = Math.min(keyWords.size, patWords.size)
          if (intersectionSize >= 2 && (intersectionSize / minSize) > 0.5) {
            pdfData = val
            break
          }
        }
      }

      if (!pdfData) {
        localStats.noPdf++
        addLog('warn', `⚠️ Linha ${rowIdx}: Paciente NÃO encontrado no PDF: "${patientName}"`)
        rowIdx++
        continue
      }

      // Identificar o bloco de linhas do mesmo paciente
      let endRow = rowIdx
      while (endRow + 1 <= worksheet.rowCount) {
        const nextPat = worksheet.getRow(endRow + 1).getCell(COL_PATIENT_AFTER).value
        if (nextPat && normalizeName(String(nextPat).trim()) === normPatient) {
          endRow++
        } else {
          break
        }
      }

      const numExcelRows = endRow - rowIdx + 1

      if (!usedItemsByPatient[normPatient]) {
        usedItemsByPatient[normPatient] = new Set()
      }

      // Quantos itens restantes no PDF
      const remainingPdfIndices = [...Array(pdfData.itens.length).keys()].filter(idx => !usedItemsByPatient[normPatient].has(idx))
      const numRemainingPdf = remainingPdfIndices.length

      // Se o PDF tiver mais itens que o Excel, inserir linhas
      if (numRemainingPdf > numExcelRows) {
        const rowsToInsert = numRemainingPdf - numExcelRows
        worksheet.insertRows(endRow + 1, Array(rowsToInsert).fill([]))
        localStats.insertedRows += rowsToInsert
        addLog('info', `➕ Inserindo ${rowsToInsert} linhas para o paciente "${patientName}"`)

        // Copiar dados da linha base para as novas
        for (let newR = endRow + 1; newR <= endRow + rowsToInsert; newR++) {
          const sourceRow = worksheet.getRow(endRow)
          const targetRow = worksheet.getRow(newR)
          
          sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const targetCell = targetRow.getCell(colNumber)
            targetCell.font = cell.font
            targetCell.fill = cell.fill
            targetCell.border = cell.border
            targetCell.alignment = cell.alignment
            targetCell.numFmt = cell.numFmt
            targetCell.protection = cell.protection
            
            // Copiar valores gerais, exceto coluna item (4) e colunas inseridas J a M
            if (colNumber !== COL_ITEM && (colNumber < COL_INSERT_POS || colNumber > COL_INSERT_POS + 3)) {
              targetCell.value = cell.value
            }
          })
        }
        endRow += rowsToInsert
      }

      // Preencher dados das linhas
      for (let r = rowIdx; r <= endRow; r++) {
        localStats.total++
        const currentRow = worksheet.getRow(r)
        const itemCellVal = currentRow.getCell(COL_ITEM).value
        const itemDesc = itemCellVal ? String(itemCellVal).trim() : ""

        const matchResult = findMatchingItem(
          itemDesc,
          pdfData.itens,
          nomenclatures,
          usedItemsByPatient[normPatient]
        )

        if (matchResult) {
          const { idx, item, nomenclatureDesc } = matchResult
          usedItemsByPatient[normPatient].add(idx)
          localStats.matched++

          // Se a linha foi recém inserida, preenche a descrição
          if (!itemDesc) {
            currentRow.getCell(COL_ITEM).value = item.descricao
          }

          // Escrever Lote, Validade, Qtd e Nomenclatura
          currentRow.getCell(COL_INSERT_POS).value = item.lote_numero
          currentRow.getCell(COL_INSERT_POS + 1).value = item.lote_validade
          currentRow.getCell(COL_INSERT_POS + 2).value = item.lote_qtd

          let finalDesc = nomenclatureDesc || item.descricao
          // Se for idêntico ao item do excel, deixa em branco (regra do projeto)
          if (normalizeName(itemDesc) === normalizeName(finalDesc)) {
            finalDesc = ""
          }
          currentRow.getCell(COL_INSERT_POS + 3).value = finalDesc

          addLog('success', `⚡ Linha ${r}: Match de "${item.descricao.substring(0, 30)}..." [Lote: ${item.lote_numero}]`)
        } else {
          localStats.noItem++
          addLog('warn', `⚠️ Linha ${r}: Item do PDF não associado ao Excel: "${itemDesc.substring(0, 35)}..."`)
        }
      }

      // Avança para a próxima linha após o bloco do paciente
      rowIdx = endRow + 1
    }

    // Processamento concluído
    setStats(localStats)
    setProcessedWorkbook(workbook)
    setIsProcessing(false)
    addLog('success', '🎉 Processamento concluído com sucesso!')
    addLog('success', `📈 Estatísticas: Match ${localStats.matched}/${localStats.total} (${((localStats.matched/localStats.total)*100).toFixed(1)}%)`)
  }

  // ============================================================
  // DOWNLOAD ACTION
  // ============================================================
  const downloadProcessedFile = async () => {
    if (!processedWorkbook) return

    try {
      const buffer = await processedWorkbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `LOTE_UNIMED_NATAL_FATUREIA_${new Date().toISOString().slice(0,10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(`Falha ao baixar o arquivo processado: ${e.message}`)
    }
  }

  // ============================================================
  // UI HANDLERS
  // ============================================================
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter(f => f.type === 'application/pdf')
      setPdfFiles(prev => [...prev, ...filesArray])
    }
  }

  const handleLoteUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLoteFile(e.target.files[0])
    }
  }

  const removePdfFile = (index: number) => {
    setPdfFiles(prev => prev.filter((_, idx) => idx !== index))
  }

  // ============================================================
  // RENDER UI
  // ============================================================
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/70 p-4 md:p-6">
      {/* Title / Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4 md:mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
          className="p-2 hover:bg-slate-200 border border-slate-200 bg-white text-slate-700 rounded-xl transition-all shadow-sm cursor-pointer"
          title="Voltar ao Chat"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-[#1a2332] tracking-tight">FatureIA Automação</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Módulo de Conciliação e Loteamento</p>
        </div>
        </div>
        
        {/* Nomenclature Status Badge */}
        <div className="sm:ml-auto flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm w-fit">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500">Nomenclaturas:</span>
          {nomenStatus === 'loading' && <span className="text-blue-500 animate-pulse">Carregando...</span>}
          {nomenStatus === 'success' && <span className="text-emerald-600 font-bold">Pronto ({nomenclatures.length})</span>}
          {nomenStatus === 'error' && <span className="text-red-500 font-bold">Falha</span>}
        </div>
      </div>

      {/* Main Section */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 overflow-y-auto md:overflow-hidden custom-scrollbar">
        
        {/* Uploads Panel */}
        <div className="flex flex-col gap-4 md:gap-5 md:overflow-y-auto md:pr-1 shrink-0">
          
          {/* Lote Excel Upload */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-500" size={18} />
              Planilha de Lote Unimed
            </h3>
            
            {!loteFile ? (
              <label className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50">
                <FileSpreadsheet size={32} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Selecione a Planilha Lote (.xlsx)</span>
                <span className="text-[10px] text-slate-400">Arraste ou clique para navegar</span>
                <input type="file" accept=".xlsx" onChange={handleLoteUpload} className="hidden" />
              </label>
            ) : (
              <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl text-emerald-800">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-white rounded-lg border border-emerald-100 text-emerald-600 shrink-0">
                    <FileSpreadsheet size={16} />
                  </div>
                  <span className="text-xs font-semibold truncate pr-4">{loteFile.name}</span>
                </div>
                <button 
                  onClick={() => setLoteFile(null)}
                  disabled={isProcessing}
                  className="p-1 hover:bg-emerald-100 rounded-full text-emerald-600 transition-colors shrink-0"
                >
                  <XCircle size={16} />
                </button>
              </div>
            )}
          </div>

          {/* PDFs Folder/Multi Upload */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col min-h-[220px] overflow-hidden">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FileText className="text-red-500" size={18} />
              PDFs das Cirurgias ({pdfFiles.length})
            </h3>

            {/* Input Drop */}
            <div className="flex gap-2 mb-4">
              <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50">
                <span className="text-xs font-bold text-slate-500 text-center">Selecionar PDFs</span>
                <span className="text-[9px] text-slate-400 text-center">Multiplo arquivo / pasta</span>
                <input 
                  type="file" 
                  accept=".pdf" 
                  multiple 
                  onChange={handlePdfUpload} 
                  className="hidden" 
                />
              </label>
              
              {pdfFiles.length > 0 && (
                <button 
                  onClick={() => setPdfFiles([])}
                  disabled={isProcessing}
                  className="px-4 border border-red-200 bg-white hover:bg-red-50 text-red-500 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  Limpar Todos
                </button>
              )}
            </div>

            {/* List of PDFs */}
            <div className="flex-1 overflow-y-auto border border-slate-100 rounded-xl bg-slate-50/30 p-2 space-y-1.5">
              {pdfFiles.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">Nenhum PDF anexado.</div>
              ) : (
                pdfFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-lg text-slate-600 shadow-sm">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText size={14} className="text-red-400 shrink-0" />
                      <span className="text-xs font-medium truncate pr-4">{file.name}</span>
                    </div>
                    <button 
                      onClick={() => removePdfFile(idx)}
                      disabled={isProcessing}
                      className="text-slate-300 hover:text-red-500 transition-colors shrink-0"
                    >
                      <XCircle size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Console / Output Panel */}
        <div className="flex flex-col gap-4 overflow-hidden shrink-0 min-h-[500px] md:min-h-0">
          
          {/* Console Window */}
          <div className="flex-1 bg-[#0b0f19] text-emerald-400 font-mono text-[11px] p-4 rounded-2xl shadow-inner border border-slate-800 flex flex-col overflow-hidden relative">
            {/* Header console */}
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-500 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-2">Console de Logs</span>
            </div>
            
            {/* Logs List */}
            <div className="flex-1 overflow-y-auto pt-3 space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.length === 0 ? (
                <div className="text-slate-600 italic">Aguardando início do processo...</div>
              ) : (
                logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warn' ? 'text-yellow-400' :
                      log.type === 'success' ? 'text-emerald-400' : 'text-slate-300'
                    }
                  >
                    {log.text}
                  </div>
                ))
              )}
              <div ref={consoleEndRef} />
            </div>

            {/* Progress Overlay */}
            {isProcessing && progress.total > 0 && (
              <div className="absolute inset-0 bg-[#0b0f19]/85 flex flex-col items-center justify-center p-6 text-center">
                <RefreshCw size={36} className="text-blue-500 animate-spin mb-4" />
                <h4 className="font-bold text-white text-sm mb-1">Processando Lote...</h4>
                <p className="text-slate-400 text-xs mb-4">Lendo PDF {progress.current} de {progress.total}</p>
                <div className="w-full max-w-[200px] h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action / Results Area */}
          <div className="shrink-0 flex flex-col">
            
            {/* Statistics Dashboard card */}
            {stats && (
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="flex flex-col bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Linhas</span>
                  <span className="text-lg font-bold text-[#1a2332]">{stats.total}</span>
                </div>
                <div className="flex flex-col bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Matches</span>
                  <span className="text-lg font-bold text-emerald-600 flex items-center gap-1 justify-center">
                    {stats.matched}
                  </span>
                </div>
                <div className="flex flex-col bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inseridas</span>
                  <span className="text-lg font-bold text-blue-600">{stats.insertedRows}</span>
                </div>
                <div className="flex flex-col bg-slate-50/50 p-2.5 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aproveitamento</span>
                  <span className="text-lg font-bold text-[#1a2332]">
                    {stats.total > 0 ? `${((stats.matched / stats.total) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            )}

            {/* Run / Download Buttons */}
            <div className="flex gap-3">
              {!processedWorkbook ? (
                <button
                  onClick={processFiles}
                  disabled={isProcessing || nomenclatures.length === 0 || !loteFile || pdfFiles.length === 0}
                  className="flex-1 bg-[#1a2332] hover:bg-[#253043] text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01] cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  <Play size={16} /> Processar Lote
                </button>
              ) : (
                <>
                  <button
                    onClick={processFiles}
                    disabled={isProcessing}
                    className="flex-1 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    <RefreshCw size={16} /> Reprocessar
                  </button>
                  <button
                    onClick={downloadProcessedFile}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01] cursor-pointer"
                  >
                    <Download size={16} /> Baixar Lote Finalizado
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
