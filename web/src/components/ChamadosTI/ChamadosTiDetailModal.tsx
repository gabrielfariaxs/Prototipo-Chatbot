import React, { useState } from 'react'
import { X, CheckCircle2, XCircle, Wrench, ShieldCheck, Clock, User, Calendar, Tag, AlertTriangle, ArrowRight, Paperclip, FileText, Download, Send, MessageSquare, ArrowLeftRight, Edit, Trash2 } from 'lucide-react'
import type { ChamadoTI } from './types'
import { SETORES_APROVADORES } from './types'

interface ChamadosTiDetailModalProps {
  chamado: ChamadoTI
  userSector: string
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

  // Edição
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(chamado.title)
  const [editPriority, setEditPriority] = useState<ChamadoTI['priority']>(chamado.priority)
  const [editDescription, setEditDescription] = useState(chamado.description)

  // Permissões de Ação
  const canApprove = (userSector === chamado.approverSector || userSector === 'T.I' || userSector === 'Gestor/Diretoria' || userSector === 'Gestor (Diogo)') && chamado.status === 'pendente_aprovacao'
  const isTiTeam = userSector === 'T.I'
  const canRedirect = isTiTeam || userSector === 'Gestor/Diretoria' || userSector === chamado.approverSector
  
  // Pode editar se for o criador (ou do mesmo setor) E o chamado estiver pendente de aprovação (ainda não aprovado nem em atendimento pela TI)
  const canEdit = chamado.status === 'pendente_aprovacao' && (
    userSector === chamado.creatorSector || 
    userSector === 'T.I' || 
    userSector === 'Gestor/Diretoria' ||
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
        <div className="bg-[#1a2332] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold bg-blue-500/30 border border-blue-400/40 text-blue-300 px-2.5 py-1 rounded-lg tracking-wider">
              {chamado.code}
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight truncate max-w-md">{chamado.title}</h3>
              <p className="text-xs text-slate-300">Solicitado por {chamado.creatorName} ({chamado.creatorSector})</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canEdit && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Edit size={14} />
                Editar Chamado
              </button>
            )}

            {(isTiTeam || userSector === 'Gestor/Diretoria' || userSector === 'Gestor (Diogo)' || userName === chamado.creatorName) && (
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
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
                title="Excluir Chamado"
              >
                <Trash2 size={14} />
                <span>Excluir</span>
              </button>
            )}

            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer ml-1"
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
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Paperclip size={14} className="text-blue-600" />
                <span>Evidências / Anexos ({chamado.evidenceFiles.length})</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {chamado.evidenceFiles.map((file, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={18} className="text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadFile(file)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                      title="Baixar evidência"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
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

            {/* 2. Actions for T.I Team */}
            {isTiTeam && chamado.status === 'aprovado' && (
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

            {isTiTeam && chamado.status === 'em_atendimento' && (
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
    </div>
  )
}
