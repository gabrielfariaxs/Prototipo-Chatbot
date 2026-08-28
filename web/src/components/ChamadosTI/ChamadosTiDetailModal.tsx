import React, { useState } from 'react'
import { X, CheckCircle2, XCircle, Wrench, ShieldCheck, Clock, User, Calendar, Tag, AlertTriangle, ArrowRight, Paperclip, FileText, Download, Send, MessageSquare, ArrowLeftRight, Edit, Trash2, ZoomIn, Image, Timer } from 'lucide-react'
import type { ChamadoTI } from './types'
import { SETORES_APROVADORES, getChamadoDurationMinutes, formatDurationFull, getEffectiveCompletionDate, getChamadoTimeBreakdown } from './types'

interface ChamadosTiDetailModalProps {
  chamado: ChamadoTI
  userSector: string
  userLevel?: string
  userName: string
  onClose: () => void
  onUpdateStatus: (
    id: string, 
    newStatus: ChamadoTI['status'], 
    payload?: { approvalNotes?: string; rejectionReason?: string; resolutionNotes?: string; techName?: string }
  ) => void
  onAddComment?: (id: string, commentText: string) => void
  onRedirect?: (id: string, newApproverSector: string, reason?: string) => void
  onEditChamado?: (id: string, updatedFields: { title: string; priority: ChamadoTI['priority']; description: string }) => void
  onDeleteChamado?: (id: string) => void
}

export const ChamadosTiDetailModal: React.FC<ChamadosTiDetailModalProps> = ({
  chamado,
  userSector,
  userLevel,
  userName,
  onClose,
  onUpdateStatus,
  onAddComment,
  onRedirect,
  onEditChamado,
  onDeleteChamado
}) => {
  const [rejectionInput, setRejectionInput] = useState('')
  const [resolutionInput, setResolutionInput] = useState('')
  const [commentInput, setCommentInput] = useState('')
  const [redirectSector, setRedirectSector] = useState('Operações')
  const [redirectReason, setRedirectReason] = useState('')
  
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showResolveForm, setShowResolveForm] = useState(false)
  const [showRedirectForm, setShowRedirectForm] = useState(false)

  // Lightbox de preview de anexos
  const [previewFile, setPreviewFile] = useState<{ name: string; base64: string; type: string } | null>(null)

  // Edição
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chamado.title)
  const [editPriority, setEditPriority] = useState<ChamadoTI['priority']>(chamado.priority)
  const [editDescription, setEditDescription] = useState(chamado.description)

  // Permissões de Ação
  const savedLevel = userLevel || localStorage.getItem('userLevel') || 'lider'
  const isOperationsLeader = (userSector === 'Operações' || userSector === 'Operacoes') && savedLevel !== 'colaborador'
  const isGestorOrDiretoria = userSector === 'Gestor/Diretoria' || userSector === 'Gestor (Diogo)' || savedLevel === 'coo'
  const isTiTeam = userSector === 'T.I'
  const hasFullAccess = isTiTeam || isGestorOrDiretoria || isOperationsLeader

  const canApprove = (userSector === chamado.approverSector || hasFullAccess) && chamado.status === 'pendente_aprovacao'
  const canRedirect = hasFullAccess || userSector === chamado.approverSector
  
  // Pode editar se for o criador (ou do mesmo setor) E o chamado estiver pendente de aprovação (ainda não aprovado nem em atendimento pela TI)
  const canEdit = chamado.status === 'pendente_aprovacao' && (
    userSector === chamado.creatorSector || 
    hasFullAccess ||
    userName === chamado.creatorName
  )

  const getStatusBadge = () => {
    switch (chamado.status) {
      case 'pendente_aprovacao':
        return <span className="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-full flex items-center gap-1.5"><Clock size={12} /> Pendente de Aprovação ({chamado.approverSector})</span>
      case 'aprovado':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold rounded-full flex items-center gap-1.5"><CheckCircle2 size={12} /> Aprovado (Aguardando T.I)</span>
      case 'recusado':
        return <span className="px-3 py-1 bg-red-100 text-red-800 border border-red-200 text-xs font-bold rounded-full flex items-center gap-1.5"><XCircle size={12} /> Recusado pelo Gestor</span>
      case 'em_atendimento':
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 border border-indigo-200 text-xs font-bold rounded-full flex items-center gap-1.5"><Wrench size={12} /> Em Atendimento (T.I)</span>
      case 'concluido':
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-full flex items-center gap-1.5"><ShieldCheck size={12} /> Concluído</span>
      default:
        return null
    }
  }

  const getPriorityBadge = () => {
    switch (chamado.priority) {
      case 'critica':
        return <span className="px-2.5 py-0.5 bg-red-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-md">Crítica</span>
      case 'alta':
        return <span className="px-2.5 py-0.5 bg-orange-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-md">Alta</span>
      case 'media':
        return <span className="px-2.5 py-0.5 bg-blue-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-md">Média</span>
      default:
        return <span className="px-2.5 py-0.5 bg-slate-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-md">Baixa</span>
    }
  }

  const downloadFile = (file: { name: string; base64: string; type: string }) => {
    try {
      const link = document.createElement('a')
      link.href = `data:${file.type};base64,${file.base64}`
      link.download = file.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error(e)
    }
  }

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentInput.trim() || !onAddComment) return
    onAddComment(chamado.id, commentInput.trim())
    setCommentInput('')
  }

  const handleConfirmRedirect = () => {
    if (!redirectSector || !onRedirect) return
    onRedirect(chamado.id, redirectSector, redirectReason.trim())
    setShowRedirectForm(false)
    setRedirectReason('')
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1a2332] text-white p-4 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <span className="text-xs font-extrabold bg-blue-500/30 border border-blue-400/40 text-blue-300 px-2.5 py-1 rounded-lg tracking-wider whitespace-nowrap shrink-0">
              {chamado.code}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-base leading-tight text-white line-clamp-2 sm:truncate" title={chamado.title}>
                {chamado.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-300 truncate mt-0.5">
                Solicitado por {chamado.creatorName} ({chamado.creatorSector})
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center flex-wrap">
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <Edit size={14} />
                <span>Editar Chamado</span>
              </button>
            )}

            {(hasFullAccess || userName === chamado.creatorName) && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Tem certeza que deseja excluir permanentemente o chamado ${chamado.code}?`)) {
                    if (onDeleteChamado) {
                      onDeleteChamado(chamado.id)
                    }
                    onClose()
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                title="Excluir Chamado"
              >
                <Trash2 size={14} />
                <span className="whitespace-nowrap">Excluir</span>
              </button>
            )}

            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-1 shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Status & Badges bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
              {getStatusBadge()}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridade:</span>
              {getPriorityBadge()}
            </div>
          </div>

          {/* Métrica de Tempo / Ciclo de Vida (Visível para T.I, Líder de Operações e Gestor/Diretoria) */}
          {hasFullAccess && (() => {
            const bd = getChamadoTimeBreakdown(chamado)
            const completionDateStr = getEffectiveCompletionDate(chamado)
            const isFinished = chamado.status === 'concluido' || chamado.status === 'recusado'

            return (
              <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                chamado.status === 'concluido'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  : chamado.status === 'recusado'
                    ? 'bg-red-50/70 border-red-200 text-red-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-950'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                    chamado.status === 'concluido'
                      ? 'bg-emerald-100 text-emerald-700'
                      : chamado.status === 'recusado'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700 animate-pulse'
                  }`}>
                    <Timer size={20} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                        🛠️ Tempo do Suporte T.I
                      </span>
                      <span className="text-sm font-extrabold block text-blue-900">
                        {formatDurationFull(bd.tiMinutes)}
                      </span>
                    </div>
                    {bd.sectorMinutes > 0 || bd.isCurrentlyPendingSector ? (
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                          ⏳ Aprovação / Redirecionado ({bd.approverSector || 'Setor'})
                        </span>
                        <span className="text-sm font-extrabold block text-amber-900">
                          {formatDurationFull(bd.sectorMinutes)}
                        </span>
                      </div>
                    ) : (
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-75">
                          🕒 Tempo Total Corrido
                        </span>
                        <span className="text-sm font-extrabold block">
                          {formatDurationFull(bd.totalMinutes)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium opacity-80 shrink-0 border-t md:border-t-0 pt-2 md:pt-0 w-full md:w-auto justify-between md:justify-end border-slate-200">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Abertura</span>
                    <span>{new Date(chamado.createdAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                  <span>→</span>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Conclusão</span>
                    <span>
                      {completionDateStr
                        ? new Date(completionDateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                        : 'Em andamento'
                      }
                    </span>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Form de Edição */}
          {isEditing ? (
            <div className="p-5 bg-blue-50/50 border border-blue-200 rounded-xl space-y-4 animate-in fade-in">
              <h4 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                <Edit size={16} className="text-blue-600" />
                Editar Solicitação de Suporte
              </h4>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título do Chamado</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Prioridade</label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 bg-white"
                >
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica (Urgência Total)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descrição do Problema</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-600 bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onEditChamado) {
                      onEditChamado(chamado.id, {
                        title: editTitle.trim(),
                        priority: editPriority,
                        description: editDescription.trim()
                      })
                    }
                    setIsEditing(false)
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          ) : null}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Solicitante</span>
              <span className="text-xs font-bold text-slate-700 truncate block">{chamado.creatorName}</span>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block mb-1">Aprovador Resp.</span>
              <span className="text-xs font-bold text-blue-950 truncate block">{chamado.approverSector}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Data de Criação</span>
              <span className="text-xs font-bold text-slate-700">
                {new Date(chamado.createdAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Problem Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descrição da Solicitação</h4>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-800">
              {chamado.description}
            </div>
          </div>

          {/* Evidence Files Section */}
          {chamado.evidenceFiles && chamado.evidenceFiles.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Paperclip size={14} className="text-blue-600" />
                <span>Evidências / Anexos ({chamado.evidenceFiles.length})</span>
              </h4>

              {/* Image thumbnails grid */}
              {chamado.evidenceFiles.some(f => f.type.startsWith('image/')) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                  {chamado.evidenceFiles.filter(f => f.type.startsWith('image/')).map((file, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPreviewFile(file)}
                      className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 hover:border-blue-400 transition-all shadow-xs cursor-pointer"
                      title={`Visualizar: ${file.name}`}
                    >
                      <img
                        src={`data:${file.type};base64,${file.base64}`}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-[#1a2332]/0 group-hover:bg-[#1a2332]/40 transition-all flex items-center justify-center">
                        <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                      </div>
                      <span className="absolute bottom-0 left-0 right-0 text-[9px] font-bold text-white bg-gradient-to-t from-black/70 to-transparent px-2 py-1 truncate">
                        {file.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Full file list with preview + download buttons */}
              <div className="space-y-2">
                {chamado.evidenceFiles.map((file, idx) => {
                  const isImage = file.type.startsWith('image/')
                  const isPdf = file.type === 'application/pdf'
                  return (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2 hover:border-blue-300 transition-colors">
                      <div className="flex items-center gap-2 truncate">
                        {isImage
                          ? <Image size={16} className="text-blue-500 shrink-0" />
                          : <FileText size={16} className="text-red-500 shrink-0" />
                        }
                        <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0">
                          {isImage ? 'Imagem' : isPdf ? 'PDF' : 'Arquivo'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewFile(file)}
                          className="p-1.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Visualizar"
                        >
                          <ZoomIn size={14} />
                          <span className="hidden sm:inline text-[11px]">Ver</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadFile(file)}
                          className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Baixar arquivo"
                        >
                          <Download size={14} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rejection / Resolution Notes */}
          {chamado.rejectionReason && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-1">
              <h5 className="text-xs font-bold text-red-800 uppercase tracking-wider">Motivo da Recusa</h5>
              <p className="text-xs text-red-700 font-medium">{chamado.rejectionReason}</p>
            </div>
          )}

          {chamado.resolutionNotes && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
              <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Solução Aplicada (T.I)</h5>
              <p className="text-xs text-emerald-900 font-medium">{chamado.resolutionNotes}</p>
              {chamado.assignedTech && (
                <span className="text-[10px] text-emerald-700 font-bold block pt-1">Atendido por: {chamado.assignedTech}</span>
              )}
            </div>
          )}

          {/* Workflow Actions & Redirection Section */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            
            {/* Redirection Feature (T.I or Approvers can re-route ticket) */}
            {canRedirect && !showRedirectForm && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowRedirectForm(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <ArrowLeftRight size={14} />
                  <span>Redirecionar Chamado para Outro Gestor</span>
                </button>
              </div>
            )}

            {showRedirectForm && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-purple-950 font-bold text-xs uppercase tracking-wider">
                  <ArrowLeftRight size={16} className="text-purple-600" />
                  <span>Redirecionar Chamado para Novo Gestor / Setor</span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-purple-900 block">Novo Setor/Gestor Responsável *</label>
                  <select
                    value={redirectSector}
                    onChange={(e) => setRedirectSector(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs font-bold text-slate-800 outline-none"
                  >
                    {SETORES_APROVADORES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <label className="text-xs font-bold text-purple-900 block pt-1">Motivo do Redirecionamento (Opcional)</label>
                  <input
                    type="text"
                    value={redirectReason}
                    onChange={(e) => setRedirectReason(e.target.value)}
                    placeholder="Ex: Demanda pertence ao setor de Operações..."
                    className="w-full px-3 py-2 bg-white border border-purple-300 rounded-xl text-xs outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button 
                    type="button"
                    onClick={() => setShowRedirectForm(false)} 
                    className="px-3 py-1.5 text-xs text-slate-600 font-bold"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button"
                    onClick={handleConfirmRedirect} 
                    className="px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold"
                  >
                    Confirmar Redirecionamento
                  </button>
                </div>
              </div>
            )}

            {/* 1. Actions for Approver */}
            {canApprove && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>Ação Necessária: Aprovação Prévia pelo Responsável ({userSector})</span>
                </div>

                {!showRejectForm ? (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(chamado.id, 'aprovado', { approvalNotes: `Aprovado por ${userName}` })}
                      className="flex-1 bg-[#06df82] hover:bg-[#05b96c] text-[#14161f] hover:text-white py-2.5 rounded-[11px] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle2 size={16} />
                      <span>Aprovar para Atendimento T.I</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(true)}
                      className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-amber-200">
                    <label className="text-xs font-bold text-red-800 block">Motivo da Recusa *</label>
                    <input 
                      type="text"
                      value={rejectionInput}
                      onChange={(e) => setRejectionInput(e.target.value)}
                      placeholder="Descreva o motivo da não aprovação deste chamado..."
                      className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-xs outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => setShowRejectForm(false)} 
                        className="px-3 py-1.5 text-xs text-slate-600 font-bold"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          if (!rejectionInput.trim()) return
                          onUpdateStatus(chamado.id, 'recusado', { rejectionReason: rejectionInput.trim() })
                        }} 
                        className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold"
                      >
                        Confirmar Recusa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Actions for T.I Team / Leadership */}
            {hasFullAccess && chamado.status === 'aprovado' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-blue-950 uppercase">Chamado Aprovado</h5>
                  <p className="text-xs text-blue-700">Assuma este chamado para iniciar o atendimento técnico.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(chamado.id, 'em_atendimento', { techName: userName })}
                  className="px-5 py-2.5 bg-[#1a2332] hover:bg-[#253043] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <Wrench size={16} />
                  <span>Assumir Chamado</span>
                </button>
              </div>
            )}

            {hasFullAccess && chamado.status === 'em_atendimento' && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-indigo-950 uppercase">Atendimento em Andamento</h5>
                  <span className="text-[11px] font-bold text-indigo-700">Técnico: {chamado.assignedTech || userName}</span>
                </div>

                {!showResolveForm ? (
                  <button
                    type="button"
                    onClick={() => setShowResolveForm(true)}
                    className="w-full bg-[#06df82] hover:bg-[#05b96c] text-[#14161f] hover:text-white py-2.5 rounded-[11px] text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <ShieldCheck size={16} />
                    <span>Concluir Chamado</span>
                  </button>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-indigo-200">
                    <label className="text-xs font-bold text-indigo-900 block">Resolução / Observações Técnicas *</label>
                    <textarea 
                      rows={3}
                      value={resolutionInput}
                      onChange={(e) => setResolutionInput(e.target.value)}
                      placeholder="Descreva o que foi feito para resolver o problema..."
                      className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-xs outline-none resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button 
                        type="button"
                        onClick={() => setShowResolveForm(false)} 
                        className="px-3 py-1.5 text-xs text-slate-600 font-bold"
                      >
                        Cancelar
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          if (!resolutionInput.trim()) return
                          onUpdateStatus(chamado.id, 'concluido', { resolutionNotes: resolutionInput.trim(), techName: userName })
                        }} 
                        className="px-4 py-1.5 bg-[#06df82] text-[#14161f] font-bold rounded-lg text-xs hover:bg-[#05b96c] hover:text-white"
                      >
                        Finalizar Chamado
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Interactive Internal Chat Section */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#1a2332]" />
              <h4 className="text-xs font-bold text-[#1a2332] uppercase tracking-wider">
                Histórico & Chat do Chamado ({chamado.comments?.length || 0})
              </h4>
            </div>

            {/* Comments List */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 max-h-60 overflow-y-auto">
              {(!chamado.comments || chamado.comments.length === 0) ? (
                <div className="text-center py-4 text-xs text-slate-400">
                  Nenhuma mensagem enviada ainda. Digite uma mensagem abaixo para se comunicar sobre este chamado.
                </div>
              ) : (
                chamado.comments.map((msg) => {
                  const isMe = msg.authorName === userName
                  return (
                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-slate-700">{msg.authorName}</span>
                        <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-50 px-1.5 py-0.2 rounded border border-blue-100">
                          {msg.authorSector}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className={`p-3 rounded-2xl text-xs max-w-[85%] font-medium leading-relaxed ${
                        msg.text.startsWith('🔄') 
                          ? 'bg-purple-100 text-purple-900 border border-purple-200 w-full' 
                          : isMe 
                            ? 'bg-[#1a2332] text-white rounded-tr-xs shadow-xs' 
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Send Comment Input */}
            <form onSubmit={handleSendComment} className="flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Digite uma mensagem (ex: Oi Jailton, aguardando seu retorno)..."
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] focus:ring-1 focus:ring-[#1a2332] transition-all"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                className="px-4 py-2.5 bg-[#1a2332] hover:bg-[#253043] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <span>Enviar</span>
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Lightbox de Preview de Anexo */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setPreviewFile(null)}
        >
          {/* Header do Lightbox */}
          <div
            className="w-full max-w-5xl flex items-center justify-between mb-3 px-1"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              {previewFile.type.startsWith('image/')
                ? <Image size={16} className="text-white" />
                : <FileText size={16} className="text-white" />
              }
              <span className="text-white text-sm font-bold truncate max-w-xs sm:max-w-md">{previewFile.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => downloadFile(previewFile)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Baixar</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="p-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Conteúdo do Preview */}
          <div
            className="w-full max-w-5xl flex-1 flex items-center justify-center overflow-hidden rounded-xl"
            style={{ maxHeight: 'calc(100vh - 120px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {previewFile.type.startsWith('image/') ? (
              <img
                src={`data:${previewFile.type};base64,${previewFile.base64}`}
                alt={previewFile.name}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                style={{ maxHeight: 'calc(100vh - 120px)' }}
              />
            ) : previewFile.type === 'application/pdf' ? (
              <iframe
                src={`data:application/pdf;base64,${previewFile.base64}`}
                className="w-full rounded-xl shadow-2xl bg-white"
                style={{ height: 'calc(100vh - 120px)' }}
                title={previewFile.name}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 p-8 bg-white/10 rounded-2xl border border-white/20">
                <FileText size={48} className="text-white/60" />
                <p className="text-white/80 text-sm font-medium">Este tipo de arquivo não pode ser pré-visualizado.</p>
                <button
                  type="button"
                  onClick={() => downloadFile(previewFile)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-slate-800 rounded-xl text-sm font-bold cursor-pointer"
                >
                  <Download size={16} />
                  Baixar para Visualizar
                </button>
              </div>
            )}
          </div>

          <p className="text-white/40 text-xs mt-3">Clique fora para fechar</p>
        </div>
      )}

    </div>
  )
}
