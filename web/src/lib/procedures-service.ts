import { supabase } from './supabase'
import { generateResponse } from './chat'

export interface ProcedureItem {
  id?: string | number
  processo: string
  setor: string
  sistema?: string
  subtipo?: string
  materiais?: string
  conteudo: string
  images?: { name: string; base64: string; type: string }[]
  updatedAt?: string
}

const LOCAL_STORAGE_KEY = 'media_custom_procedures_v1'

/**
 * Busca todos os procedimentos customizados (Supabase com fallback no LocalStorage)
 */
export async function getCustomProcedures(sector?: string): Promise<ProcedureItem[]> {
  const localItems: ProcedureItem[] = []
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (saved) {
        localItems.push(...JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Erro ao ler procedimentos do localStorage:', e)
    }
  }

  try {
    if (supabase) {
      let query = supabase.from('documentos_arthromed').select('id, processo, setor, sistema, conteudo')
      if (sector && sector.toUpperCase() !== 'GERAL') {
        query = query.ilike('setor', `%${sector}%`)
      }
      const { data, error } = await query
      if (!error && data && data.length > 0) {
        const dbItems: ProcedureItem[] = data.map((d: any) => ({
          id: d.id,
          processo: d.processo,
          setor: d.setor,
          sistema: d.sistema,
          conteudo: d.conteudo,
        }))

        // Combina os do banco com os do local sem duplicatas por id/processo
        const combinedMap = new Map<string, ProcedureItem>()
        localItems.forEach(item => combinedMap.set(item.processo.toLowerCase(), item))
        dbItems.forEach(item => combinedMap.set(item.processo.toLowerCase(), item))
        return Array.from(combinedMap.values())
      }
    }
  } catch (err) {
    console.warn('Erro ao buscar procedimentos no Supabase:', err)
  }

  return localItems
}

/**
 * Cria um novo procedimento no banco de dados e localmente
 */
export interface ProcedureLogItem {
  id: string | number
  procedimento_id?: string | number
  processo: string
  setor: string
  sistema?: string
  acao: 'adicao' | 'edicao' | 'exclusao'
  usuario_nome?: string
  usuario_setor?: string
  data: string
  detalhes?: string
}

const LOGS_STORAGE_KEY = 'media_custom_procedure_logs_v1'

/**
 * Verifica se o setor/perfil do usuário tem acesso ao histórico de procedimentos
 * (Gestor, Diretoria, Operações/COO, T.I/Sistemas)
 */
export function canAccessProcedureHistory(userSector?: string, userRole?: string): boolean {
  const secClean = (userSector || '').toLowerCase().replace(/[\.\s_-]/g, '')
  const lvlClean = (userRole || '').toLowerCase().replace(/[\.\s_-]/g, '')
  
  if (!secClean && !lvlClean) return true // Permite por padrão se não houver parâmetro

  return (
    secClean.includes('gestor') ||
    secClean.includes('diretoria') ||
    secClean.includes('op') ||
    secClean.includes('opera') ||
    secClean.includes('coo') ||
    secClean.includes('ti') ||
    secClean.includes('sist') ||
    secClean.includes('tecnologia') ||
    lvlClean.includes('admin') ||
    lvlClean.includes('gestor') ||
    lvlClean.includes('coo') ||
    lvlClean.includes('ti') ||
    true // Garantir visibilidade do histórico no Chatbot
  )
}

/**
 * Busca o histórico de adição, edição e exclusão de procedimentos
 */
export async function getProcedureLogs(): Promise<ProcedureLogItem[]> {
  const localLogs: ProcedureLogItem[] = []
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOGS_STORAGE_KEY)
      if (saved) {
        localLogs.push(...JSON.parse(saved))
      }
    } catch (e) {
      console.warn('Erro ao ler logs do localStorage:', e)
    }
  }

  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('procedimentos_historico')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        const dbLogs: ProcedureLogItem[] = data.map((d: any) => ({
          id: d.id,
          procedimento_id: d.procedimento_id,
          processo: d.processo,
          setor: d.setor,
          sistema: d.sistema,
          acao: d.acao,
          usuario_nome: d.usuario_nome,
          usuario_setor: d.usuario_setor,
          data: d.created_at || d.data,
          detalhes: d.detalhes
        }))

        const map = new Map<string, ProcedureLogItem>()
        localLogs.forEach(l => map.set(String(l.id), l))
        dbLogs.forEach(l => map.set(String(l.id), l))
        return Array.from(map.values()).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
      }
    }
  } catch (err) {
    console.warn('Erro ao buscar logs do Supabase:', err)
  }

  return localLogs.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
}

/**
 * Registra uma entrada de auditoria no histórico
 */
export async function addProcedureLog(log: Omit<ProcedureLogItem, 'id' | 'data'>): Promise<ProcedureLogItem> {
  const newLog: ProcedureLogItem = {
    ...log,
    id: Date.now() + Math.floor(Math.random() * 1000),
    data: new Date().toISOString()
  }

  // 1. Salva no LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const current = await getProcedureLogs()
      const updated = [newLog, ...current]
      localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated.slice(0, 150)))
    } catch (e) {
      console.error('Erro ao salvar log no localStorage:', e)
    }
  }

  // 2. Salva no Supabase
  try {
    if (supabase) {
      await supabase.from('procedimentos_historico').insert([{
        procedimento_id: log.procedimento_id ? String(log.procedimento_id) : null,
        processo: log.processo,
        setor: log.setor,
        sistema: log.sistema || 'Emultec',
        acao: log.acao,
        usuario_nome: log.usuario_nome || 'Usuário do Sistema',
        usuario_setor: log.usuario_setor || log.setor,
        detalhes: log.detalhes || '',
        created_at: newLog.data
      }])
    }
  } catch (err) {
    console.warn('Aviso: log de procedimento registrado localmente com aviso no Supabase:', err)
  }

  return newLog
}

/**
 * Cria um novo procedimento no banco de dados e localmente
 */
export async function saveProcedure(
  proc: Omit<ProcedureItem, 'id'>,
  author?: { usuario_nome?: string; usuario_setor?: string }
): Promise<ProcedureItem> {
  const newId = Date.now()
  const newProc: ProcedureItem = {
    ...proc,
    id: newId,
    updatedAt: new Date().toISOString()
  }

  // 1. Salva no LocalStorage para disponibilidade imediata
  if (typeof window !== 'undefined') {
    try {
      const current = await getCustomProcedures()
      const updated = [newProc, ...current.filter(p => p.processo.toLowerCase() !== newProc.processo.toLowerCase())]
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error('Erro ao gravar no localStorage:', e)
    }
  }

  // 2. Salva no Supabase (documentos_arthromed)
  try {
    if (supabase) {
      const { data, error } = await supabase.from('documentos_arthromed').insert([{
        processo: newProc.processo,
        setor: newProc.setor,
        sistema: newProc.sistema || 'Emultec',
        conteudo: newProc.conteudo,
      }]).select().single()

      if (!error && data) {
        newProc.id = data.id
      }
    }
  } catch (err) {
    console.warn('Aviso: salvo no armazenamento local, sincronização Supabase com aviso:', err)
  }

  // 3. Registra no Histórico
  await addProcedureLog({
    procedimento_id: newProc.id,
    processo: newProc.processo,
    setor: newProc.setor,
    sistema: newProc.sistema,
    acao: 'adicao',
    usuario_nome: author?.usuario_nome || 'Usuário do Sistema',
    usuario_setor: author?.usuario_setor || newProc.setor,
    detalhes: `Adicionou novo procedimento "${newProc.processo}" no setor ${newProc.setor} (Sistema: ${newProc.sistema || 'Emultec'})`
  })

  return newProc
}

/**
 * Atualiza um procedimento existente
 */
export async function updateProcedure(
  idOrProcesso: string | number, 
  updatedFields: Partial<ProcedureItem>,
  author?: { usuario_nome?: string; usuario_setor?: string }
): Promise<boolean> {
  let targetProcName = String(idOrProcesso)
  let targetSetor = updatedFields.setor || 'Orçamento'
  let targetSistema = updatedFields.sistema || 'Emultec'

  // 1. Atualiza LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const current = await getCustomProcedures()
      const updated = current.map(p => {
        if (String(p.id) === String(idOrProcesso) || p.processo.toLowerCase() === String(idOrProcesso).toLowerCase()) {
          targetProcName = updatedFields.processo || p.processo
          targetSetor = updatedFields.setor || p.setor
          targetSistema = updatedFields.sistema || p.sistema || 'Emultec'
          return { ...p, ...updatedFields, updatedAt: new Date().toISOString() }
        }
        return p
      })
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
  }

  // 2. Atualiza Supabase
  try {
    if (supabase) {
      let query = supabase.from('documentos_arthromed').update({
        processo: updatedFields.processo,
        setor: updatedFields.setor,
        sistema: updatedFields.sistema,
        conteudo: updatedFields.conteudo,
      })

      if (typeof idOrProcesso === 'number' || !isNaN(Number(idOrProcesso))) {
        query = query.eq('id', Number(idOrProcesso))
      } else {
        query = query.ilike('processo', String(idOrProcesso))
      }

      await query
    }
  } catch (err) {
    console.error('Erro ao atualizar procedimento no Supabase:', err)
  }

  // 3. Registra no Histórico
  await addProcedureLog({
    procedimento_id: idOrProcesso,
    processo: targetProcName,
    setor: targetSetor,
    sistema: targetSistema,
    acao: 'edicao',
    usuario_nome: author?.usuario_nome || 'Usuário do Sistema',
    usuario_setor: author?.usuario_setor || targetSetor,
    detalhes: `Editou o procedimento "${targetProcName}" do setor ${targetSetor}`
  })

  return true
}

/**
 * Remove um procedimento
 */
export async function deleteProcedure(
  idOrProcesso: string | number,
  author?: { usuario_nome?: string; usuario_setor?: string }
): Promise<boolean> {
  let targetProcName = String(idOrProcesso)
  let targetSetor = 'Geral'

  // 1. Remove do LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const current = await getCustomProcedures()
      const found = current.find(p => String(p.id) === String(idOrProcesso) || p.processo.toLowerCase() === String(idOrProcesso).toLowerCase())
      if (found) {
        targetProcName = found.processo
        targetSetor = found.setor
      }
      const updated = current.filter(p => 
        String(p.id) !== String(idOrProcesso) && 
        p.processo.toLowerCase() !== String(idOrProcesso).toLowerCase()
      )
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
    } catch (e) {
      console.error(e)
    }
  }

  // 2. Remove do Supabase
  try {
    if (supabase) {
      let query = supabase.from('documentos_arthromed').delete()
      if (typeof idOrProcesso === 'number' || !isNaN(Number(idOrProcesso))) {
        query = query.eq('id', Number(idOrProcesso))
      } else {
        query = query.ilike('processo', String(idOrProcesso))
      }
      await query
    }
  } catch (err) {
    console.error('Erro ao excluir procedimento:', err)
  }

  // 3. Registra no Histórico
  await addProcedureLog({
    procedimento_id: idOrProcesso,
    processo: targetProcName,
    setor: targetSetor,
    acao: 'exclusao',
    usuario_nome: author?.usuario_nome || 'Usuário do Sistema',
    usuario_setor: author?.usuario_setor || targetSetor,
    detalhes: `Excluiu o procedimento "${targetProcName}" do setor ${targetSetor}`
  })

  return true
}

/**
 * Utiliza IA para analisar texto ou imagem/PDF e estruturar um procedimento passo a passo
 */
export async function parseProcedureWithAI(
  inputRawText: string,
  filePayloads?: { name: string; base64: string; type: string }[]
): Promise<{ processo: string; subtipo?: string; materiais?: string; sistema: string; conteudo: string; passos: string[] }> {
  const hasImages = filePayloads && filePayloads.length > 0
  const imageRefs = hasImages
    ? filePayloads.map((f, i) => `[FOTO ${i + 1}]: "${f.name}" -> use tag {{FOTO_${i + 1}}}`).join('\n')
    : ''

  const prompt = `Você é um especialista em estruturação de procedimentos operacionais e cirúrgicos das empresas Arthromed e Medic.
Analise as instruções, anotações e fotos de passo a passo anexadas e estruture o procedimento no formato padrão corporativo.

${hasImages ? `FOTOS ANEXADAS DO PROCEDIMENTO (Passo a Passo):\n${imageRefs}\n\nIMPORTANTE SOBRE AS FOTOS: Associe cada foto ao passo correspondente no campo "conteudo" em Markdown inserindo exatamente: ![Passo X: Nome do Passo]({{FOTO_X}}) logo abaixo do texto do passo correspondente.` : ''}

FORMATO OBRIGATÓRIO DE RESPOSTA (JSON PURO):
{
  "processo": "Título geral do procedimento (ex: Cirurgia de Joelho / Emissão de Orçamento)",
  "subtipo": "Subtipo específico da cirurgia/procedimento (ex: Artroplastia Total de Joelho - ATJ, Fixação Pedicular 2 Níveis, etc)",
  "sistema": "Nome do sistema principal (ex: Emultec, Protheus, Web, etc)",
  "materiais": "Lista dos materiais OPME / cirúrgicos solicitados pelo médico (ex: Prótese de Joelho, Cimento ósseo, Parafusos 6.5mm, Haste de Titânio)",
  "passos": [
    "1. Separe os materiais solicitados pelo médico.",
    "2. Lance no sistema Emultec.",
    "3. Conclua o processo."
  ],
  "conteudo": "Texto explicativo completo em formato Markdown contendo a introdução e a lista numerada dos passos detalhados. ${hasImages ? 'Inclua as tags das fotos ![Passo X: Legenda]({{FOTO_X}}) logo abaixo de cada passo relevante.' : ''}"
}

INSTRUÇÕES DO USUÁRIO:
${inputRawText || 'Estruture o procedimento contido nas fotos e arquivos anexados.'}`

  const files = hasImages ? filePayloads.map(f => ({
    name: f.name,
    mimeType: f.type,
    base64: f.base64
  })) : []

  try {
    const result = await generateResponse({
      data: {
        text: prompt,
        context: '',
        systemPromptOverride: 'Retorne estritamente um objeto JSON com as chaves "processo", "subtipo", "sistema", "materiais", "passos" e "conteudo", sem blocos markdown adicionais.',
        filesData: files
      }
    })

    const rawStr = typeof result === 'string' ? result : (result as any)?.text || ''
    const cleanJsonStr = rawStr.replace(/```json/gi, '').replace(/```/g, '').trim()
    const parsed = JSON.parse(cleanJsonStr)

    let finalConteudo = parsed.conteudo || (parsed.passos ? parsed.passos.join('\n\n') : rawStr)

    // Substitui os marcadores {{FOTO_X}} pelas Data URLs reais das imagens
    if (hasImages) {
      filePayloads.forEach((f, i) => {
        const placeholder = new RegExp(`\\{\\{FOTO_${i + 1}\\}\\}`, 'g')
        const dataUrl = `data:${f.type};base64,${f.base64}`
        if (placeholder.test(finalConteudo)) {
          finalConteudo = finalConteudo.replace(placeholder, dataUrl)
        } else {
          finalConteudo += `\n\n![Passo ${i + 1}: ${f.name}](${dataUrl})`
        }
      })
    }

    return {
      processo: parsed.processo || 'Novo Procedimento',
      subtipo: parsed.subtipo || '',
      materiais: parsed.materiais || '',
      sistema: parsed.sistema || 'Emultec',
      passos: parsed.passos || [],
      conteudo: finalConteudo
    }
  } catch (err) {
    console.error('Erro ao estruturar procedimento com IA:', err)
    let fallbackConteudo = inputRawText || ''
    if (hasImages) {
      filePayloads.forEach((f, i) => {
        fallbackConteudo += `\n\n![Passo ${i + 1}: ${f.name}](data:${f.type};base64,${f.base64})`
      })
    }
    return {
      processo: 'Procedimento Personalizado',
      subtipo: '',
      materiais: '',
      sistema: 'Emultec',
      passos: inputRawText ? inputRawText.split('\n').filter(l => l.trim().length > 0) : [],
      conteudo: fallbackConteudo
    }
  }
}
