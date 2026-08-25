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

export const getChamadoDurationMinutes = (chamado: ChamadoTI): number => {
  const start = new Date(chamado.createdAt).getTime()
  if (isNaN(start)) return 0
  const endDateStr = getEffectiveCompletionDate(chamado)
  const end = (chamado.status === 'concluido' || chamado.status === 'recusado')
    ? (endDateStr ? new Date(endDateStr).getTime() : start)
    : Date.now()
  if (isNaN(end) || end < start) return 0
  return Math.floor((end - start) / (1000 * 60))
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

