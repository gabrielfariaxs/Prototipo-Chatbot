/**
 * Endpoint Serverless na Vercel para verificação e disparo automático
 * de lembretes de treinamento no WhatsApp (30 minutos antes da sessão).
 * 
 * Rota: https://media.q2medical.net/api/cron-treinamentos-whatsapp
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://espjmmzyrimglobetlzo.supabase.co'
const SUPABASE_KEY = process.env.VITE_SUPABASE_KEY || 'sb_publishable_MiUtB_XXXPCUMZqOamIF8g_wqL5HOaw'
const UAZAPI_SERVER_URL = process.env.VITE_UAZAPI_SERVER_URL || 'https://q2medical.uazapi.com'
const UAZAPI_TOKEN = process.env.VITE_UAZAPI_TOKEN || '36301400-dc84-493d-a6dd-2b3f57b9e9be'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const SPECIAL_PHONE_EXCEPTIONS = [
  { names: ['rafaela torres', 'rafaela'], officialName: 'Rafaela Torres', phone: '5581989236136' },
  { names: ['thaciana pontual', 'thaciana', 'taciana'], officialName: 'Thaciana Pontual', phone: '5581989236136' },
  { names: ['alessandra lima', 'alessandra'], officialName: 'Alessandra Lima', phone: '5581989236136' },
  { names: ['vanessa costa', 'vanessa'], officialName: 'Vanessa Costa', phone: '5581989236136' },
  { names: ['jucara marques', 'juçara marques', 'jucara', 'juçara'], officialName: 'Juçara Marques', phone: '5581989236136' },
  { names: ['lahys araujo', 'lahys araújo', 'lahys', 'lais araujo', 'lais'], officialName: 'Lahys Araújo', phone: '5581989236136' },
  { names: ['karen maia', 'karen'], officialName: 'Karen Maia', phone: '5581989236136' }
]

function normalize(str: string): string {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export default async function handler(req: any, res: any) {
  // Configuração de CORS para permitir invocações do próprio app web
  const origin = req.headers?.origin || '*'
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // 1. Data e Horário atual em horário de Brasília (UTC-3)
    const nowUtc = new Date()
    const brasiliaTime = new Date(nowUtc.getTime() - 3 * 60 * 60 * 1000)
    
    const todayStr = brasiliaTime.toISOString().split('T')[0] // YYYY-MM-DD
    const currentHour = brasiliaTime.getUTCHours()
    const currentMinute = brasiliaTime.getUTCMinutes()
    const currentTotalMinutes = currentHour * 60 + currentMinute

    console.log(`[Cron WhatsApp] Executando em ${todayStr} às ${currentHour}:${currentMinute} (Brasília)`)

    // 2. Buscar treinamentos agendados para a data de hoje
    const { data: treinamentos, error } = await supabase
      .from('treinamentos')
      .select('*')
      .eq('data', todayStr)
      .eq('status', 'agendado')

    if (error) {
      console.error('[Cron WhatsApp] Erro ao buscar treinamentos:', error)
      return res.status(500).json({ error: 'Erro ao buscar treinamentos', details: error.message })
    }

    if (!treinamentos || treinamentos.length === 0) {
      return res.status(200).json({
        message: 'Nenhum treinamento agendado para hoje.',
        today: todayStr,
        checkedAt: brasiliaTime.toISOString()
      })
    }

    // 3. Buscar a lista de contatos da agenda do WhatsApp via Uazapi
    let contacts: any[] = []
    try {
      const contactsRes = await fetch(`${UAZAPI_SERVER_URL}/contacts`, {
        headers: { token: UAZAPI_TOKEN, 'Content-Type': 'application/json' }
      })
      if (contactsRes.ok) {
        contacts = await contactsRes.json()
      }
    } catch (e: any) {
      console.error('[Cron WhatsApp] Erro ao buscar contatos da Uazapi:', e.message)
    }

    const processedTreinamentos: any[] = []

    // 4. Analisar cada treinamento
    for (const t of treinamentos) {
      // Já foi enviado lembrete para este treinamento?
      if (t.criado_por && t.criado_por.includes('whatsapp_lembrete_enviado')) {
        processedTreinamentos.push({
          id: t.id,
          titulo: t.titulo,
          status: 'ja_enviado'
        })
        continue
      }

      // Extrai horário de início: "09:00 às 11:00" ou "09:00"
      const horarioStart = (t.horario || '').split('às')[0].trim()
      const [startH, startM] = horarioStart.split(':').map(Number)

      if (isNaN(startH) || isNaN(startM)) {
        processedTreinamentos.push({
          id: t.id,
          titulo: t.titulo,
          status: 'horario_invalido'
        })
        continue
      }

      const trainingTotalMinutes = startH * 60 + startM
      const minutesRemaining = trainingTotalMinutes - currentTotalMinutes

      // Verifica se faltam aproximadamente 30 minutos (entre 20 e 35 minutos de margem)
      // Ou se a requisição vier com force=true
      const isForce = req.query?.force === 'true' || req.body?.force === true
      const shouldTrigger = isForce || (minutesRemaining >= 20 && minutesRemaining <= 35)

      if (!shouldTrigger) {
        processedTreinamentos.push({
          id: t.id,
          titulo: t.titulo,
          horario: t.horario,
          minutesRemaining,
          status: 'fora_da_janela_30min'
        })
        continue
      }

      // Identifica os contatos com base no campo colaboradores
      const targetText = t.colaboradores || ''
      const cleaned = targetText.replace(/[\w\sÀ-ÿ]+:\s*/gi, ', ')
      const candidateNames = cleaned
        .split(/[,;\n\.]/)
        .map(n => n.trim())
        .filter(n => n.length >= 2 && !n.toLowerCase().includes('link'))

      // Extrai contatos excluídos manualmente pelo usuário em criado_por
      const excludedMatch = (t.criado_por || '').match(/\[excluded_whatsapp:([^\]]+)\]/)
      const excludedKeys = excludedMatch ? excludedMatch[1].split(',').map((k: string) => k.trim().toLowerCase()) : []
      const isExcluded = (contactKey: string, phone: string, name: string) => {
        const normName = normalize(name)
        const cleanPhone = (phone || '').replace(/\D/g, '')
        return excludedKeys.includes(contactKey.toLowerCase()) ||
               excludedKeys.includes(cleanPhone) ||
               excludedKeys.includes(normName)
      }

      const matchedContacts: any[] = []
      const matchedKeys = new Set<string>()

      for (const name of candidateNames) {
        const normCandidate = normalize(name)
        const firstName = normCandidate.split(/\s+/)[0]

        // 1. Checa regra de exceção para telefone comercial compartilhado (81989236136)
        const specialRule = SPECIAL_PHONE_EXCEPTIONS.find(rule => {
          return rule.names.some(n => {
            const normRule = normalize(n)
            return normCandidate === normRule || normCandidate.includes(normRule) || (firstName.length >= 3 && normRule.startsWith(firstName))
          })
        })

        if (specialRule) {
          const commKey = `comm_${normalize(specialRule.officialName).replace(/\s+/g, '_')}`
          if (isExcluded(commKey, specialRule.phone, specialRule.officialName)) {
            console.log(`[Cron WhatsApp] Contato comercial ignorado por exclusão: ${specialRule.officialName}`)
            continue
          }

          const key = `${specialRule.phone}_${specialRule.officialName}`
          if (!matchedKeys.has(key)) {
            matchedKeys.add(key)
            matchedContacts.push({
              contact_name: specialRule.officialName,
              jid: `${specialRule.phone}@s.whatsapp.net`,
              phone: specialRule.phone
            })
          }
          continue
        }

        // 2. Busca na agenda Uazapi
        const found = contacts.find((c: any) => {
          if (!c.jid || c.jid.includes('@g.us')) return false
          const normContact = normalize(c.contact_name || c.contact_FirstName || '')
          return normContact === normCandidate || (firstName.length >= 3 && normContact.includes(firstName))
        })

        if (found) {
          const foundPhone = (found.phone || found.jid.replace(/@.*$/, '')).replace(/\D/g, '')
          const contactKey = found.jid || foundPhone
          if (isExcluded(contactKey, foundPhone, found.contact_name || found.contact_FirstName || '')) {
            console.log(`[Cron WhatsApp] Contato da agenda ignorado por exclusão: ${found.contact_name || foundPhone}`)
            continue
          }

          if (!matchedKeys.has(found.jid)) {
            matchedKeys.add(found.jid)
            matchedContacts.push(found)
          }
        }
      }

      // Formatar data: 2026-10-09 -> 09/10/2026
      let dataFormatada = t.data
      if (t.data && t.data.includes('-')) {
        const [y, m, d] = t.data.split('-')
        dataFormatada = `${d}/${m}/${y}`
      }

      // Agrupa contatos pelo número de telefone (evita mensagens repetidas no número 81989236136)
      const groupedByPhone = new Map<string, any[]>()
      for (const c of matchedContacts) {
        const phone = (c.phone || c.jid.replace(/@.*$/, '')).replace(/\D/g, '')
        if (!groupedByPhone.has(phone)) groupedByPhone.set(phone, [])
        groupedByPhone.get(phone)!.push(c)
      }

      const dispatchResults: any[] = []

      for (const [rawPhone, group] of Array.from(groupedByPhone.entries())) {
        let greetingName = ''
        if (group.length === 1) {
          greetingName = group[0].contact_name
        } else if (group.length === 2) {
          greetingName = `${group[0].contact_name} e ${group[1].contact_name}`
        } else {
          const exceptLast = group.slice(0, -1).map((c: any) => c.contact_name).join(', ')
          const last = group[group.length - 1].contact_name
          greetingName = `${exceptLast} e ${last}`
        }

        const message = [
          `🔔 *Lembrete de Treinamento - Início em 30 Minutos!*`,
          ``,
          `Olá, *${greetingName}*! 👋`,
          ``,
          `Lembramos que o seu treinamento da *Arthromed / Medic* começará em breve:`,
          ``,
          `📌 *Tema:* ${t.titulo}`,
          `📅 *Data:* ${dataFormatada}`,
          `⏰ *Horário:* ${t.horario}`,
          t.descricao ? `📋 *Descrição:* ${t.descricao}` : null,
          ``,
          `🔗 *Link da Reunião / Chamada:*`,
          t.link_video ? `${t.link_video}` : `(O link será disponibilizado pelo instrutor)`,
          ``,
          `Por favor, organize-se para entrar na chamada no horário previsto. Contamos com a sua presença! 🚀`
        ].filter(Boolean).join('\n')

        try {
          const sendRes = await fetch(`${UAZAPI_SERVER_URL}/send/text`, {
            method: 'POST',
            headers: { token: UAZAPI_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: rawPhone, text: message })
          })

          const sendData = await sendRes.json()
          dispatchResults.push({
            destinatarios: greetingName,
            phone: rawPhone,
            success: sendRes.ok,
            response: sendData
          })
        } catch (err: any) {
          dispatchResults.push({
            destinatarios: greetingName,
            phone: rawPhone,
            success: false,
            error: err.message
          })
        }

        // Intervalo de segurança entre envios
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Marcar no Supabase para não reenviar
      const timestampEnvio = new Date().toISOString()
      const novoCriadoPor = t.criado_por 
        ? `${t.criado_por} [whatsapp_lembrete_enviado:${timestampEnvio}]`
        : `[whatsapp_lembrete_enviado:${timestampEnvio}]`

      await supabase
        .from('treinamentos')
        .update({ criado_por: novoCriadoPor })
        .eq('id', t.id)

      processedTreinamentos.push({
        id: t.id,
        titulo: t.titulo,
        status: 'enviado',
        contatosNotificados: matchedContacts.length,
        detalhes: dispatchResults
      })
    }

    return res.status(200).json({
      success: true,
      dataVerificada: todayStr,
      horarioAtualBrasilia: `${currentHour}:${currentMinute}`,
      treinamentos: processedTreinamentos
    })

  } catch (err: any) {
    console.error('[Cron WhatsApp] Erro inesperado:', err)
    return res.status(500).json({ error: 'Erro interno no cron', details: err?.message })
  }
}
