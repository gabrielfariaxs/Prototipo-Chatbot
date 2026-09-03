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
  approverSector: string
  isCurrentlyPendingSector: boolean
}

export const getChamadoTimeBreakdown = (chamado: ChamadoTI): ChamadoTimeBreakdown => {
  const startMs = new Date(chamado.createdAt).getTime()
  if (isNaN(startMs)) {
    return { totalMinutes: 0, tiMinutes: 0, sectorMinutes: 0, approverSector: chamado.approverSector, isCurrentlyPendingSector: false }
  }

  const endDateStr = getEffectiveCompletionDate(chamado)
  const endMs = (chamado.status === 'concluido' || chamado.status === 'recusado')
    ? (endDateStr ? new Date(endDateStr).getTime() : startMs)
    : Date.now()

  const totalMinutes = Math.max(0, Math.floor((endMs - startMs) / (1000 * 60)))

  // Se o chamado está aguardando aprovação, todo o tempo decorrido pertence ao setor de aprovação e NADA ao T.I
  if (chamado.status === 'pendente_aprovacao') {
    return {
      totalMinutes,
      tiMinutes: 0,
      sectorMinutes: totalMinutes,
      approverSector: chamado.approverSector,
      isCurrentlyPendingSector: true
    }
  }

  const isDirectToTi = !chamado.approverSector || chamado.approverSector === 'none' || chamado.approverSector === 'Sem Aprovação (Direto T.I)'
  const comments = chamado.comments || []

  const hasRedirectionOrApproval = comments.some(c => 
    (c.text && (c.text.includes('redirecionado para aprovação') || c.text.includes('Chamado Aprovado') || c.text.includes('Aprovado')))
  )

  if (isDirectToTi && !hasRedirectionOrApproval) {
    return {
      totalMinutes,
      tiMinutes: totalMinutes,
      sectorMinutes: 0,
      approverSector: chamado.approverSector,
      isCurrentlyPendingSector: false
    }
  }

  // Linha do tempo dos comentários para separar tempos
  const timelineEvents: { timestamp: number; type: 'redirection_or_pending' | 'approved' | 'in_service' }[] = []

  comments.forEach(c => {
    const cMs = new Date(c.createdAt).getTime()
    if (isNaN(cMs)) return

    if (c.text?.includes('redirecionado para aprovação')) {
      timelineEvents.push({ timestamp: cMs, type: 'redirection_or_pending' })
    } else if (c.text?.includes('Chamado Aprovado') || c.text?.includes('Aprovado pelo gestor') || c.text?.includes('Aprovado')) {
      timelineEvents.push({ timestamp: cMs, type: 'approved' })
    } else if (c.text?.includes('Atendimento iniciado pelo técnico')) {
      timelineEvents.push({ timestamp: cMs, type: 'in_service' })
    }
  })

  // Se o chamado precisava de aprovação mas não possui comentário explícito de aprovação registrado:
  if (!isDirectToTi && timelineEvents.length === 0) {
    if (comments.length > 0) {
      const firstCommentMs = new Date(comments[0].createdAt).getTime()
      if (!isNaN(firstCommentMs) && firstCommentMs >= startMs && firstCommentMs <= endMs) {
        timelineEvents.push({ timestamp: firstCommentMs, type: 'approved' })
      }
    }
  }

  timelineEvents.sort((a, b) => a.timestamp - b.timestamp)

  let currentOwner: 'sector' | 'ti' = (!isDirectToTi) ? 'sector' : 'ti'
  let lastMs = startMs
  let accumulatedSectorMs = 0
  let accumulatedTiMs = 0

  timelineEvents.forEach(evt => {
    if (evt.timestamp < lastMs) return
    const elapsed = evt.timestamp - lastMs

    if (currentOwner === 'sector') {
      accumulatedSectorMs += elapsed
    } else {
      accumulatedTiMs += elapsed
    }

    if (evt.type === 'redirection_or_pending') {
      currentOwner = 'sector'
    } else if (evt.type === 'approved' || evt.type === 'in_service') {
      currentOwner = 'ti'
    }
    lastMs = evt.timestamp
  })

  if (endMs > lastMs) {
    const finalElapsed = endMs - lastMs
    if (currentOwner === 'sector') {
      accumulatedSectorMs += finalElapsed
    } else {
      accumulatedTiMs += finalElapsed
    }
  }

  const tiMinutes = Math.max(0, Math.floor(accumulatedTiMs / (1000 * 60)))
  const sectorMinutes = Math.max(0, Math.floor(accumulatedSectorMs / (1000 * 60)))

  return {
    totalMinutes,
    tiMinutes,
    sectorMinutes,
    approverSector: chamado.approverSector,
    isCurrentlyPendingSector: false
  }
}

export const getChamadoDurationMinutes = (chamado: ChamadoTI): number => {
  return getChamadoTimeBreakdown(chamado).tiMinutes
}

export const formatDurationShort = (minutes: number): string => {
  if (minutes < 1) return '< 1 min'
  const days = Math.floor(minutes / (60 * 24))
  const hours = Math.floor((minutes % (60 * 24)) / 60)
  const mins = minutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`)

  return parts.join(' ')
}

export const formatDurationFull = (minutes: number): string => {
  if (minutes < 1) return 'Menos de 1 minuto'
  const days = Math.floor(minutes / (60 * 24))
  const hours = Math.floor((minutes % (60 * 24)) / 60)
  const mins = minutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days} ${days === 1 ? 'dia' : 'dias'}`)
  if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'hora' : 'horas'}`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins} min`)

  return parts.join(' e ')
}

