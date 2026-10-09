/**
 * Serviço de Integração com a API do Uazapi (WhatsApp)
 * Conexão com a instância oficial da Q2 Medical / Arthromed
 */

import { supabase } from './supabase'

export interface WhatsAppContact {
  contact_name: string
  contact_FirstName?: string
  jid: string // ex: 558194420722@s.whatsapp.net
  phone: string // ex: 558194420722
}

export interface TrainingReminderPayload {
  treinamentoId: string
  titulo: string
  descricao: string
  data: string
  horario: string
  link_video: string
  colaboradoresText: string
}

export const UAZAPI_CONFIG = {
  SERVER_URL: (typeof process !== 'undefined' && process.env?.VITE_UAZAPI_SERVER_URL) || 'https://q2medical.uazapi.com',
  TOKEN: (typeof process !== 'undefined' && process.env?.VITE_UAZAPI_TOKEN) || '36301400-dc84-493d-a6dd-2b3f57b9e9be'
}

let cachedContacts: WhatsAppContact[] | null = null
let lastContactsFetchTime = 0
const CONTACTS_CACHE_TTL = 1000 * 60 * 10 // 10 minutos de cache

/**
 * Normaliza e limpa string para busca (remove acentos, espaços extras e pontuação)
 */
export function normalizeString(str: string): string {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * Formata o JID ou número para exibição amigável (+55 81 99999-9999)
 */
export function formatPhoneNumber(jidOrNumber: string): string {
  if (!jidOrNumber) return ''
  const clean = jidOrNumber.replace(/@.*$/, '').replace(/\D/g, '')
  if (clean.length === 13 && clean.startsWith('55')) {
    return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 9)}-${clean.slice(9)}`
  }
  if (clean.length === 12 && clean.startsWith('55')) {
    return `+55 (${clean.slice(2, 4)}) ${clean.slice(4, 8)}-${clean.slice(8)}`
  }
  return clean
}

/**
 * Busca todos os contatos salvos na agenda do WhatsApp da instância conectada
 */
export async function getWhatsAppContacts(forceRefresh = false): Promise<WhatsAppContact[]> {
  const now = Date.now()
  if (!forceRefresh && cachedContacts && now - lastContactsFetchTime < CONTACTS_CACHE_TTL) {
    return cachedContacts
  }

  // Tenta carregar do sessionStorage se estiver no navegador
  if (typeof window !== 'undefined' && !forceRefresh) {
    try {
      const stored = sessionStorage.getItem('uazapi_cached_contacts')
      const storedTime = sessionStorage.getItem('uazapi_contacts_time')
      if (stored && storedTime && now - Number(storedTime) < CONTACTS_CACHE_TTL) {
        cachedContacts = JSON.parse(stored)
        lastContactsFetchTime = Number(storedTime)
        return cachedContacts || []
      }
    } catch (e) {
      // Ignora erro de cache
    }
  }

  try {
    const res = await fetch(`${UAZAPI_CONFIG.SERVER_URL}/contacts`, {
      method: 'GET',
      headers: {
        token: UAZAPI_CONFIG.TOKEN,
        'Content-Type': 'application/json'
      }
    })

    if (!res.ok) {
      throw new Error(`Falha ao buscar contatos da Uazapi: ${res.statusText} (${res.status})`)
    }

    const rawContacts = await res.json()
    if (!Array.isArray(rawContacts)) {
      return []
    }

    // Filtra e normaliza contatos válidos (exclui grupos, contatos vazios e duplicados)
    const seenJids = new Set<string>()
    const validContacts: WhatsAppContact[] = []

    for (const c of rawContacts) {
      if (!c.jid || c.jid.includes('@g.us')) continue
      const rawPhone = c.jid.replace(/@.*$/, '').replace(/\D/g, '')
      const name = (c.contact_name || c.contact_FirstName || formatPhoneNumber(rawPhone)).trim()
      const dedupeKey = `${c.jid}_${name.toLowerCase()}`
      if (seenJids.has(dedupeKey)) continue
      seenJids.add(dedupeKey)

      validContacts.push({
        contact_name: name,
        contact_FirstName: c.contact_FirstName || '',
        jid: c.jid,
        phone: rawPhone
      })
    }

    validContacts.sort((a, b) => a.contact_name.localeCompare(b.contact_name))

    cachedContacts = validContacts
    lastContactsFetchTime = now

    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('uazapi_cached_contacts', JSON.stringify(validContacts))
        sessionStorage.setItem('uazapi_contacts_time', String(now))
      } catch (e) {}
    }

    return validContacts
  } catch (error) {
    console.error('[Uazapi] Erro ao carregar contatos da agenda:', error)
    return cachedContacts || []
  }
}

/**
 * Envia uma mensagem de texto simples via WhatsApp usando a Uazapi
 */
export async function sendWhatsAppMessage(number: string, text: string): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Normaliza número: se vier JID, extrai número; adiciona 55 se faltar
    const cleanNumber = number.replace(/@.*$/, '').replace(/\D/g, '')

    const res = await fetch(`${UAZAPI_CONFIG.SERVER_URL}/send/text`, {
      method: 'POST',
      headers: {
        token: UAZAPI_CONFIG.TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        number: cleanNumber,
        text: text
      })
    })

    const data = await res.json()

    if (!res.ok) {
      return { success: false, error: data?.error || data?.message || `HTTP ${res.status}` }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('[Uazapi] Erro ao enviar mensagem para', number, error)
    return { success: false, error: error?.message || 'Falha de conexão com a API' }
  }
}

export const SPECIAL_PHONE_EXCEPTIONS = [
  {
    names: ['rafaela torres', 'rafaela'],
    officialName: 'Rafaela Torres',
    phone: '5581989236136'
  },
  {
    names: ['thaciana pontual', 'thaciana', 'taciana'],
    officialName: 'Thaciana Pontual',
    phone: '5581989236136'
  },
  {
    names: ['alessandra lima', 'alessandra'],
    officialName: 'Alessandra Lima',
    phone: '5581989236136'
  },
  {
    names: ['vanessa costa', 'vanessa'],
    officialName: 'Vanessa Costa',
    phone: '5581989236136'
  },
  {
    names: ['jucara marques', 'juçara marques', 'jucara', 'juçara'],
    officialName: 'Juçara Marques',
    phone: '5581989236136'
  },
  {
    names: ['lahys araujo', 'lahys araújo', 'lahys', 'lais araujo', 'lais'],
    officialName: 'Lahys Araújo',
    phone: '5581989236136'
  },
  {
    names: ['karen maia', 'karen'],
    officialName: 'Karen Maia',
    phone: '5581989236136'
  }
]

/**
 * Retorna uma chave única e estável para identificar o contato (respeitando a equipe comercial)
 */
export function getContactIdentifier(contact: { jid: string; contact_name: string; phone?: string }): string {
  if (contact.jid?.startsWith('5581989236136') || contact.phone === '5581989236136') {
    return `comm_${normalizeString(contact.contact_name).replace(/\s+/g, '_')}`
  }
  return contact.jid || contact.phone || ''
}

/**
 * Extrai os JIDs/identificadores de contatos excluídos armazenados em criado_por
 * Formato: [excluded_whatsapp:jid1,jid2,...]
 */
export function extractExcludedContactsFromCriadoPor(criadoPor?: string): string[] {
  if (!criadoPor) return []
  const match = criadoPor.match(/\[excluded_whatsapp:([^\]]+)\]/)
  if (!match) return []
  return match[1].split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
}

/**
 * Atualiza ou anexa a tag [excluded_whatsapp:...] na string criado_por
 */
export function buildCriadoPorWithExclusions(currentCriadoPor: string, excludedList: string[]): string {
  const clean = (currentCriadoPor || '').replace(/\[excluded_whatsapp:[^\]]*\]/g, '').trim()
  if (excludedList.length === 0) return clean
  const tag = `[excluded_whatsapp:${excludedList.join(',')}]`
  return clean ? `${clean} ${tag}` : tag
}

/**
 * Algoritmo de correspondência inteligente:
 * Dado um texto de público-alvo (ex: "Comercial interno: Karen, Thaciana, Rafaela..."),
 * procura e identifica os contatos correspondentes na agenda do WhatsApp da empresa,
 * respeitando as exceções de números compartilhados de equipe e lista de contatos excluídos.
 */
export function matchTargetAudienceContacts(
  targetText: string, 
  allContacts: WhatsAppContact[],
  excludedKeys: string[] = []
): {
  matchedContacts: WhatsAppContact[]
  unmatchedNames: string[]
} {
  if (!targetText) {
    return { matchedContacts: [], unmatchedNames: [] }
  }

  const normalizedExcluded = excludedKeys.map(k => k.toLowerCase().trim())
  const isExcluded = (contactKey: string, phone: string, name: string) => {
    const normName = normalizeString(name)
    const cleanPhone = (phone || '').replace(/\D/g, '')
    return normalizedExcluded.includes(contactKey.toLowerCase()) ||
           normalizedExcluded.includes(cleanPhone) ||
           normalizedExcluded.includes(normName)
  }

  // Divide o texto por vírgulas, pontos e quebras de linha
  // Remove rótulos de setor como "Comercial interno:", "Financeiro:", etc.
  const cleanedText = targetText.replace(/[\w\sÀ-ÿ]+:\s*/gi, ', ')
  const candidateNames = cleanedText
    .split(/[,;\n\.]/)
    .map(name => name.trim())
    .filter(name => name.length >= 2 && !name.toLowerCase().includes('link disponível'))

  const matchedSet = new Map<string, WhatsAppContact>()
  const unmatchedList: string[] = []

  for (const candidate of candidateNames) {
    const normCandidate = normalizeString(candidate)
    if (!normCandidate) continue

    const candidateParts = normCandidate.split(/\s+/)
    const firstName = candidateParts[0]

    // 1. Verificação prioritária de exceções para o número compartilhado (81989236136)
    const specialRule = SPECIAL_PHONE_EXCEPTIONS.find(rule => {
      return rule.names.some(n => {
        const normRuleName = normalizeString(n)
        return normCandidate === normRuleName || normCandidate.includes(normRuleName) || (firstName.length >= 3 && normRuleName.startsWith(firstName))
      })
    })

    if (specialRule) {
      const contactKey = `comm_${normalizeString(specialRule.officialName).replace(/\s+/g, '_')}`
      if (isExcluded(contactKey, specialRule.phone, specialRule.officialName)) {
        if (!unmatchedList.includes(candidate)) {
          unmatchedList.push(candidate)
        }
        continue
      }

      const uniqueKey = `${specialRule.phone}_${specialRule.officialName}`
      if (!matchedSet.has(uniqueKey)) {
        matchedSet.set(uniqueKey, {
          contact_name: specialRule.officialName,
          contact_FirstName: specialRule.officialName.split(' ')[0],
          jid: `${specialRule.phone}@s.whatsapp.net`,
          phone: specialRule.phone
        })
      }
      continue
    }

    // 2. Busca na agenda do WhatsApp da Uazapi por correspondência exata ou primeiro nome
    let found = allContacts.find(c => {
      const normContact = normalizeString(c.contact_name)
      if (normContact === normCandidate) return true
      const contactParts = normContact.split(/\s+/)
      return contactParts[0] === firstName && (candidateParts.length === 1 || normContact.includes(candidateParts[1]))
    })

    // 3. Se não achou, busca parcial flexível
    if (!found && firstName.length >= 3) {
      found = allContacts.find(c => {
        const normContact = normalizeString(c.contact_name)
        return normContact.includes(firstName)
      })
    }

    if (found) {
      const contactKey = getContactIdentifier(found)
      if (isExcluded(contactKey, found.phone, found.contact_name)) {
        if (!unmatchedList.includes(candidate)) {
          unmatchedList.push(candidate)
        }
        continue
      }

      if (!matchedSet.has(found.jid)) {
        matchedSet.set(found.jid, found)
      }
    } else {
      if (!unmatchedList.includes(candidate)) {
        unmatchedList.push(candidate)
      }
    }
  }

  return {
    matchedContacts: Array.from(matchedSet.values()),
    unmatchedNames: unmatchedList
  }
}

/**
 * Monta o texto oficial e padronizado do lembrete de treinamento
 */
export function buildTrainingReminderMessage(
  treinamento: {
    titulo: string
    descricao?: string
    data: string
    horario: string
    link_video?: string
  },
  contactName: string
): string {
  // Formata a data: 2026-10-09 -> 09/10/2026
  let dataFormatada = treinamento.data
  if (treinamento.data && treinamento.data.includes('-')) {
    const [y, m, d] = treinamento.data.split('-')
    dataFormatada = `${d}/${m}/${y}`
  }

  const primeironome = contactName ? contactName.split(' ')[0] : 'Colaborador(a)'

  const lines = [
    `🔔 *Lembrete de Treinamento - Início em 30 Minutos!*`,
    ``,
    `Olá, *${primeironome}*! 👋`,
    ``,
    `Lembramos que o treinamento da *Arthromed / Medic* começará em breve:`,
    ``,
    `📌 *Tema:* ${treinamento.titulo}`,
    `📅 *Data:* ${dataFormatada}`,
    `⏰ *Horário:* ${treinamento.horario}`,
    treinamento.descricao ? `📋 *Descrição:* ${treinamento.descricao}` : null,
    ``,
    `🔗 *Link da Reunião / Chamada:*`,
    treinamento.link_video ? `${treinamento.link_video}` : `(O organizador disponibilizará o link no início da sessão)`,
    ``,
    `Por favor, organize-se para entrar na chamada no horário previsto. Contamos com a sua presença! 🚀`
  ].filter(line => line !== null)

  return lines.join('\n')
}

/**
 * Dispara lembretes em lote para múltiplos contatos com controle de intervalo
 */
export async function dispatchBatchReminders(
  treinamento: {
    id: string
    titulo: string
    descricao?: string
    data: string
    horario: string
    link_video?: string
  },
  contacts: WhatsAppContact[],
  onProgress?: (current: number, total: number, contact: WhatsAppContact, success: boolean) => void
): Promise<{ total: number; sent: number; failed: number; results: Array<{ contact: WhatsAppContact; success: boolean; error?: string }> }> {
  const results: Array<{ contact: WhatsAppContact; success: boolean; error?: string }> = []
  
  // Agrupa contatos pelo número de telefone para não enviar mensagens repetidas para o mesmo celular (ex: número comercial 81989236136)
  const groupedByPhone = new Map<string, WhatsAppContact[]>()
  for (const c of contacts) {
    const cleanPhone = c.phone.replace(/\D/g, '')
    if (!groupedByPhone.has(cleanPhone)) {
      groupedByPhone.set(cleanPhone, [])
    }
    groupedByPhone.get(cleanPhone)!.push(c)
  }

  const phoneEntries = Array.from(groupedByPhone.entries())
  let sent = 0
  let failed = 0

  for (let i = 0; i < phoneEntries.length; i++) {
    const [phone, groupContacts] = phoneEntries[i]

    // Formata o nome para a saudação (ex: "Karen Maia, Thaciana Pontual, Rafaela Torres e Lahys Araújo")
    let greetingName = ''
    if (groupContacts.length === 1) {
      greetingName = groupContacts[0].contact_name
    } else if (groupContacts.length === 2) {
      greetingName = `${groupContacts[0].contact_name} e ${groupContacts[1].contact_name}`
    } else {
      const allExceptLast = groupContacts.slice(0, -1).map(c => c.contact_name).join(', ')
      const last = groupContacts[groupContacts.length - 1].contact_name
      greetingName = `${allExceptLast} e ${last}`
    }

    const message = buildTrainingReminderMessage(treinamento, greetingName)
    const res = await sendWhatsAppMessage(phone, message)

    for (const contact of groupContacts) {
      if (res.success) {
        sent++
        results.push({ contact, success: true })
      } else {
        failed++
        results.push({ contact, success: false, error: res.error })
      }
      if (onProgress) onProgress(results.length, contacts.length, contact, res.success)
    }

    if (i < phoneEntries.length - 1) {
      await new Promise(r => setTimeout(r, 300))
    }
  }

  // Registra no Supabase que o lembrete foi enviado para este treinamento
  try {
    const marcaEnvio = `[whatsapp_lembrete_enviado:${new Date().toISOString()}]`
    const { data: current } = await supabase.from('treinamentos').select('criado_por').eq('id', treinamento.id).single()
    const novoCriadoPor = current?.criado_por ? `${current.criado_por} ${marcaEnvio}` : marcaEnvio
    await supabase.from('treinamentos').update({ criado_por: novoCriadoPor }).eq('id', treinamento.id)
  } catch (e) {
    console.warn('[Uazapi] Erro ao registrar marcação de lembrete no Supabase:', e)
  }

  return {
    total: contacts.length,
    sent,
    failed,
    results
  }
}
