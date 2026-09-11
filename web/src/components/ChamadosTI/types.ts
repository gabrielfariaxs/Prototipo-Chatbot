export type ChamadoStatus = 
  | 'pendente_aprovacao'
  | 'aprovado'
  | 'recusado'
  | 'em_atendimento'
  | 'concluido'

export type ChamadoPriority = 'baixa' | 'media' | 'alta' | 'critica'

export interface ChamadoEvidenceFile {
  name: string
  base64: string
  type: string
}

export interface ChamadoComment {
  id: string
  authorName: string
  authorSector: string
  text: string
  createdAt: string
}

export interface ChamadoTI {
  id: string
  code: string
  title: string
  description: string
  priority: ChamadoPriority
  status: ChamadoStatus
  creatorName: string
  creatorSector: string
  approverSector: string // Setor/Gestor responsável por aprovar antes do T.I
  createdAt: string
  completedAt?: string // Data/hora da conclusão do chamado
  evidenceFiles?: ChamadoEvidenceFile[]
  comments?: ChamadoComment[]
  approvedBy?: string
  approvalNotes?: string
  rejectionReason?: string
  assignedTech?: string
  resolutionNotes?: string
}

export const SETORES_APROVADORES = [
  'Gestor/Diretoria',
  'Operações',
  'Qualidade / RT',
  'Comercial interno',
  'Comercial externo',
  'Instrumentação',
  'Gente Gestão',
  'Financeiro',
  'Estoque e logistica',
  'Supply Chain',
  'Compras'
]

// ==========================================
// CONFIGURAÇÕES DE HORÁRIO COMERCIAL E FERIADOS
// Horário de atendimento: 08:00 às 18:00 (10 horas úteis por dia)
// Exclui sábados, domingos e feriados nacionais brasileiros
// ==========================================
export const BUSINESS_START_HOUR = 8
export const BUSINESS_END_HOUR = 18
export const BUSINESS_HOURS_PER_DAY = BUSINESS_END_HOUR - BUSINESS_START_HOUR // 10 horas
export const BUSINESS_MINUTES_PER_DAY = BUSINESS_HOURS_PER_DAY * 60 // 600 minutos

// Algoritmo para cálculo do Domingo de Páscoa (Meeus/Jones/Butcher)
function getEasterSunday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) // 3 = Março, 4 = Abril
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

const holidaysCache = new Map<number, Set<string>>()

const formatYMD = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const getHolidaysForYear = (year: number): Set<string> => {
  if (holidaysCache.has(year)) {
    return holidaysCache.get(year)!
  }

  const holidays = new Set<string>()

  // Feriados Nacionais Fixos no Brasil
  const fixed = [
    '01-01', // Confraternização Universal / Ano Novo
    '04-21', // Tiradentes
    '05-01', // Dia do Trabalhador
    '09-07', // Independência do Brasil
    '10-12', // Nossa Senhora Aparecida (Padroeira do Brasil)
    '11-02', // Finados
    '11-15', // Proclamação da República
    '11-20', // Dia Nacional de Zumbi e da Consciência Negra (Lei nº 14.759/2023)
    '12-25'  // Natal
  ]
  fixed.forEach(md => holidays.add(`${year}-${md}`))

  // Feriados Nacionais Móveis calculados a partir da Páscoa
  const easter = getEasterSunday(year)

  const addDays = (base: Date, days: number): Date => {
    const res = new Date(base.getTime())
    res.setDate(res.getDate() + days)
    return res
  }

  // Carnaval: Segunda-feira (-48 dias) e Terça-feira (-47 dias)
  holidays.add(formatYMD(addDays(easter, -48)))
  holidays.add(formatYMD(addDays(easter, -47)))

  // Sexta-feira Santa / Paixão de Cristo (-2 dias)
  holidays.add(formatYMD(addDays(easter, -2)))

  // Corpus Christi (+60 dias)
  holidays.add(formatYMD(addDays(easter, 60)))

  holidaysCache.set(year, holidays)
  return holidays
}

export const isBusinessDay = (date: Date): boolean => {
  const dayOfWeek = date.getDay()
  // 0 = Domingo, 6 = Sábado
  if (dayOfWeek === 0 || dayOfWeek === 6) return false

  const holidays = getHolidaysForYear(date.getFullYear())
  const dateKey = formatYMD(date)
  if (holidays.has(dateKey)) return false

  return true
}

/**
 * Calcula o tempo decorrido em MINUTOS dentro do horário comercial:
 * - Das 08:00 às 18:00 (10 horas por dia útil)
 * - Exclui finais de semana (sábado e domingo)
 * - Exclui feriados nacionais brasileiros
 */
export const calculateBusinessMinutes = (startDate: Date | number, endDate: Date | number): number => {
  const startMs = typeof startDate === 'number' ? startDate : startDate.getTime()
  const endMs = typeof endDate === 'number' ? endDate : endDate.getTime()

  if (isNaN(startMs) || isNaN(endMs) || startMs >= endMs) {
    return 0
  }

  let totalMinutes = 0

  const cur = new Date(startMs)
  cur.setHours(0, 0, 0, 0)

  const endDay = new Date(endMs)
  endDay.setHours(0, 0, 0, 0)

  while (cur.getTime() <= endDay.getTime()) {
    if (isBusinessDay(cur)) {
      const y = cur.getFullYear()
      const m = cur.getMonth()
      const d = cur.getDate()

      const windowStart = new Date(y, m, d, BUSINESS_START_HOUR, 0, 0, 0).getTime()
      const windowEnd = new Date(y, m, d, BUSINESS_END_HOUR, 0, 0, 0).getTime()

      const effectiveStart = Math.max(startMs, windowStart)
      const effectiveEnd = Math.min(endMs, windowEnd)

      if (effectiveEnd > effectiveStart) {
        totalMinutes += Math.floor((effectiveEnd - effectiveStart) / (1000 * 60))
      }
    }

    cur.setDate(cur.getDate() + 1)
  }

  return Math.max(0, totalMinutes)
}

export const getEffectiveCompletionDate = (chamado: ChamadoTI): string | undefined => {
  if (chamado.completedAt) return chamado.completedAt
  if (chamado.status === 'concluido' || chamado.status === 'recusado') {
    if (chamado.comments && chamado.comments.length > 0) {
      const lastComment = chamado.comments[chamado.comments.length - 1]
      if (lastComment?.createdAt) return lastComment.createdAt
    }
  }
  return undefined
}

export interface ChamadoTimeBreakdown {
  totalMinutes: number
  tiMinutes: number
  sectorMinutes: number
  pausedMinutes: number
  approverSector: string
  isCurrentlyPendingSector: boolean
  isWaitingResponse: boolean
  lastUnansweredMessage?: ChamadoComment
}

export const isSystemEventComment = (text?: string): boolean => {
  if (!text) return false
  const trimmed = text.trim()
  return (
    trimmed.startsWith('🔄') ||
    trimmed.startsWith('✅') ||
    trimmed.startsWith('🛠️') ||
    trimmed.startsWith('❌') ||
    trimmed.includes('redirecionado para aprovação') ||
    trimmed.includes('Chamado Aprovado') ||
    trimmed.includes('Atendimento iniciado pelo técnico') ||
    trimmed.includes('Chamado Recusado')
  )
}

export const isCommentFromTi = (comment: ChamadoComment, chamado: ChamadoTI): boolean => {
  if (!comment) return false
  
  if (chamado.assignedTech && comment.authorName === chamado.assignedTech) {
    return true
  }

  const sec = (comment.authorSector || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")

  const name = (comment.authorName || '').toLowerCase()

  if (sec.includes('ti') || sec.includes('tecnologia') || sec.includes('suporte')) {
    return true
  }

  if (name.includes(' - t.i') || name.includes('(t.i)') || name.includes('suporte') || name.includes('tecnico')) {
    return true
  }

  if (comment.authorName !== chamado.creatorName && !chamado.creatorSector?.toLowerCase().includes('ti')) {
    return true
  }

  return false
}

export const getChamadoTimeBreakdown = (chamado: ChamadoTI): ChamadoTimeBreakdown => {
  const startMs = new Date(chamado.createdAt).getTime()
  if (isNaN(startMs)) {
    return {
      totalMinutes: 0,
      tiMinutes: 0,
      sectorMinutes: 0,
      pausedMinutes: 0,
      approverSector: chamado.approverSector,
      isCurrentlyPendingSector: false,
      isWaitingResponse: false
    }
  }

  const endDateStr = getEffectiveCompletionDate(chamado)
  const isTicketClosed = chamado.status === 'concluido' || chamado.status === 'recusado'
  const endMs = isTicketClosed
    ? (endDateStr ? new Date(endDateStr).getTime() : startMs)
    : Date.now()

  const totalMinutes = calculateBusinessMinutes(startMs, endMs)

  // Se o chamado está aguardando aprovação, todo o tempo decorrido pertence ao setor de aprovação e NADA ao T.I
  if (chamado.status === 'pendente_aprovacao') {
    return {
      totalMinutes,
      tiMinutes: 0,
      sectorMinutes: totalMinutes,
      pausedMinutes: 0,
      approverSector: chamado.approverSector,
      isCurrentlyPendingSector: true,
      isWaitingResponse: false
    }
  }

  const isDirectToTi = !chamado.approverSector || chamado.approverSector === 'none' || chamado.approverSector === 'Sem Aprovação (Direto T.I)'
  const comments = chamado.comments || []

  // Linha do tempo dos comentários para separar tempos e pausas
  const timelineEvents: {
    timestamp: number
    type: 'redirection_or_pending' | 'approved' | 'in_service' | 'ti_message' | 'requester_message'
    comment?: ChamadoComment
  }[] = []

  comments.forEach(c => {
    const cMs = new Date(c.createdAt).getTime()
    if (isNaN(cMs)) return

    if (c.text?.includes('redirecionado para aprovação')) {
      timelineEvents.push({ timestamp: cMs, type: 'redirection_or_pending', comment: c })
    } else if (c.text?.includes('Chamado Aprovado') || c.text?.includes('Aprovado pelo gestor') || c.text?.includes('Aprovado')) {
      timelineEvents.push({ timestamp: cMs, type: 'approved', comment: c })
    } else if (c.text?.includes('Atendimento iniciado pelo técnico')) {
      timelineEvents.push({ timestamp: cMs, type: 'in_service', comment: c })
    } else if (!isSystemEventComment(c.text)) {
      if (isCommentFromTi(c, chamado)) {
        timelineEvents.push({ timestamp: cMs, type: 'ti_message', comment: c })
      } else {
        timelineEvents.push({ timestamp: cMs, type: 'requester_message', comment: c })
      }
    }
  })

  // Se o chamado precisava de aprovação mas não possui comentário explícito de aprovação registrado:
  if (!isDirectToTi && !timelineEvents.some(e => e.type === 'approved' || e.type === 'in_service')) {
    if (comments.length > 0) {
      const firstCommentMs = new Date(comments[0].createdAt).getTime()
      if (!isNaN(firstCommentMs) && firstCommentMs >= startMs && firstCommentMs <= endMs) {
        timelineEvents.push({ timestamp: firstCommentMs, type: 'approved' })
      }
    }
  }

  timelineEvents.sort((a, b) => a.timestamp - b.timestamp)

  type OwnerState = 'sector' | 'ti' | 'paused'
  let currentOwner: OwnerState = (!isDirectToTi) ? 'sector' : 'ti'
  let lastMs = startMs
  let accumulatedSectorMinutes = 0
  let accumulatedTiMinutes = 0
  let accumulatedPausedMinutes = 0
  let lastUnansweredTiMessage: ChamadoComment | undefined = undefined

  for (const evt of timelineEvents) {
    if (evt.timestamp < lastMs) continue
    const elapsed = calculateBusinessMinutes(lastMs, evt.timestamp)

    if (currentOwner === 'sector') {
      accumulatedSectorMinutes += elapsed
    } else if (currentOwner === 'ti') {
      accumulatedTiMinutes += elapsed
    } else if (currentOwner === 'paused') {
      accumulatedPausedMinutes += elapsed
    }

    if (evt.type === 'redirection_or_pending') {
      currentOwner = 'sector'
      lastUnansweredTiMessage = undefined
    } else if (evt.type === 'approved' || evt.type === 'in_service') {
      currentOwner = 'ti'
    } else if (evt.type === 'ti_message') {
      // Mensagem enviada pelo T.I solicitando informações / retorno do usuário
      if (currentOwner !== 'sector') {
        currentOwner = 'paused'
        lastUnansweredTiMessage = evt.comment
      }
    } else if (evt.type === 'requester_message') {
      // Solicitante respondeu à mensagem! O cronômetro do T.I é retomado
      if (currentOwner === 'paused') {
        currentOwner = 'ti'
        lastUnansweredTiMessage = undefined
      }
    }
    lastMs = evt.timestamp
  }

  if (endMs > lastMs) {
    const finalElapsed = calculateBusinessMinutes(lastMs, endMs)
    if (currentOwner === 'sector') {
      accumulatedSectorMinutes += finalElapsed
    } else if (currentOwner === 'ti') {
      accumulatedTiMinutes += finalElapsed
    } else if (currentOwner === 'paused') {
      accumulatedPausedMinutes += finalElapsed
    }
  }

  const tiMinutes = Math.max(0, accumulatedTiMinutes)
  const sectorMinutes = Math.max(0, accumulatedSectorMinutes)
  const pausedMinutes = Math.max(0, accumulatedPausedMinutes)
  const isWaitingResponse = !isTicketClosed && currentOwner === 'paused'

  return {
    totalMinutes,
    tiMinutes,
    sectorMinutes,
    pausedMinutes,
    approverSector: chamado.approverSector,
    isCurrentlyPendingSector: false,
    isWaitingResponse,
    lastUnansweredMessage: isWaitingResponse ? lastUnansweredTiMessage : undefined
  }
}

export const getChamadoDurationMinutes = (chamado: ChamadoTI): number => {
  return getChamadoTimeBreakdown(chamado).tiMinutes
}

export const formatDurationShort = (minutes: number): string => {
  if (minutes < 1) return '< 1 min'
  const days = Math.floor(minutes / (60 * BUSINESS_HOURS_PER_DAY))
  const hours = Math.floor((minutes % (60 * BUSINESS_HOURS_PER_DAY)) / 60)
  const mins = minutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`)

  return parts.join(' ')
}

export const formatDurationFull = (minutes: number): string => {
  if (minutes < 1) return 'Menos de 1 minuto'
  const days = Math.floor(minutes / (60 * BUSINESS_HOURS_PER_DAY))
  const hours = Math.floor((minutes % (60 * BUSINESS_HOURS_PER_DAY)) / 60)
  const mins = minutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days} ${days === 1 ? 'dia útil' : 'dias úteis'}`)
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins} min`)

  return parts.join(' e ')
}

