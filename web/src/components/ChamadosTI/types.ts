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
