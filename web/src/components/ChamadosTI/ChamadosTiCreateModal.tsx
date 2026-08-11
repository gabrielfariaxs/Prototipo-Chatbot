import React, { useState } from 'react'
import { X, Send, AlertCircle, ShieldAlert, Monitor, Paperclip, FileText, Trash2, User } from 'lucide-react'
import { SETORES_APROVADORES } from './types'
import type { ChamadoPriority, ChamadoTI, ChamadoEvidenceFile } from './types'

interface ChamadosTiCreateModalProps {
  userSector: string
  userName: string
  onClose: () => void
  onCreate: (newChamado: ChamadoTI) => void
}

export const ChamadosTiCreateModal: React.FC<ChamadosTiCreateModalProps> = ({
  userSector,
  userName,
  onClose,
  onCreate
}) => {
  const defaultSector = userSector === 'T.I' ? 'none' : 'none'
  const [title, setTitle] = useState('')
  const [requesterName, setRequesterName] = useState('')
  const [priority, setPriority] = useState<ChamadoPriority>('media')
  const [approverSector, setApproverSector] = useState(defaultSector)
  const [description, setDescription] = useState('')
  const [evidenceFiles, setEvidenceFiles] = useState<ChamadoEvidenceFile[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Full = event.target?.result as string
        const base64Data = base64Full.split(',')[1]
        setEvidenceFiles((prev) => [
          ...prev,
          {
            name: file.name,
            base64: base64Data,
            type: file.type
          }
        ])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeEvidence = (index: number) => {
    setEvidenceFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Por favor, informe o título do chamado.')
      return
    }
    if (!requesterName.trim()) {
      setError('Por favor, informe o nome do solicitante.')
      return
    }
    if (!description.trim()) {
      setError('Por favor, descreva detalhadamente o problema.')
      return
    }

    setSubmitting(true)

    const isDirectToTi = !approverSector || approverSector === 'none' || approverSector === 'Sem Aprovação (Direto T.I)'

    const savedItems = localStorage.getItem('chamados_ti_items')
    let nextSeq = 1
    if (savedItems) {
      try {
        const list = JSON.parse(savedItems)
        nextSeq = list.length + 1
      } catch (e) {}
    }
    const codeNum = String(nextSeq).padStart(3, '0')

    const newChamado: ChamadoTI = {
      id: Date.now().toString(),
      code: `TI-2026-${codeNum}`,
      title: title.trim(),
      priority,
      status: isDirectToTi ? 'aprovado' : 'pendente_aprovacao',
      description: description.trim(),
      creatorName: requesterName.trim(),
      creatorSector: userSector || 'Geral',
      approverSector: isDirectToTi ? 'Sem Aprovação (Direto T.I)' : approverSector,
      createdAt: new Date().toISOString(),
      evidenceFiles: evidenceFiles.length > 0 ? evidenceFiles : undefined
    }

    setTimeout(() => {
      onCreate(newChamado)
      setSubmitting(false)
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1a2332] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <Monitor size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Novo Chamado de Suporte T.I</h3>
              <p className="text-xs text-slate-300">Solicitação sujeita a aprovação prévia do responsável selecionado</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2">
              <ShieldAlert size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Título do Chamado *
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lentidão no ERP Protheus ao faturar nota"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] focus:ring-1 focus:ring-[#1a2332] transition-all"
            />
          </div>

          {/* Grid Solicitante & Setor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nome do Solicitante *
              </label>
              <div className="relative flex items-center">
                <User size={16} className="absolute left-3.5 text-slate-400" />
                <input 
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Digite seu nome completo"
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] focus:ring-1 focus:ring-[#1a2332] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Setor Solicitante
              </label>
              <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-extrabold text-slate-700 flex items-center justify-between gap-2 cursor-not-allowed">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>{userSector || 'Geral'}</span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">(Automático)</span>
              </div>
            </div>
          </div>

          {/* Prioridade */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Prioridade *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ChamadoPriority)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] focus:ring-1 focus:ring-[#1a2332] transition-all cursor-pointer"
            >
              <option value="baixa">Baixa (Dúvidas/Melhorias)</option>
              <option value="media">Média (Impacto pontual no trabalho)</option>
              <option value="alta">Alta (Bloqueio total de trabalho)</option>
              <option value="critica">Crítica (Urgência Total / Setor Parado)</option>
            </select>
          </div>

          {/* Approver Sector (Visível apenas para usuários do setor de T.I) */}
          {userSector === 'T.I' && (
            <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-blue-600 shrink-0" />
                  <label className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                    Direcionar para Aprovação de (Opcional)
                  </label>
                </div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase bg-blue-100/80 px-2 py-0.5 rounded">Opcional T.I</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Selecione o gestor se a demanda exigir aprovação prévia. Caso contrário, selecione "Nenhum" para enviar direto para a T.I.
              </p>
              <select
                value={approverSector}
                onChange={(e) => setApproverSector(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-blue-300 rounded-xl text-sm font-bold text-[#1a2332] outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="none">Nenhum / Enviar Direto para a T.I (Sem Aprovação)</option>
                {SETORES_APROVADORES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Descrição do Problema / Solicitação *
            </label>
            <textarea 
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva com o máximo de detalhes possível, incluindo mensagens de erro ou número de documentos relacionados..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] focus:ring-1 focus:ring-[#1a2332] transition-all resize-none"
            />
          </div>

          {/* Evidence Files Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Evidências / Anexos (Fotos, Prints, PDFs)
              </label>
              <label 
                htmlFor="evidence-upload"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
              >
                <Paperclip size={14} />
                <span>Anexar Arquivos</span>
              </label>
              <input 
                type="file"
                id="evidence-upload"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {evidenceFiles.length === 0 ? (
              <div 
                onClick={() => document.getElementById('evidence-upload')?.click()}
                className="p-4 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl bg-slate-50/50 hover:bg-slate-50 text-center cursor-pointer transition-all flex flex-col items-center gap-1"
              >
                <Paperclip size={20} className="text-slate-400" />
                <span className="text-xs font-medium text-slate-500">Clique para selecionar fotos de erro ou comprovantes</span>
                <span className="text-[10px] text-slate-400">PNG, JPG, PDF (até 5MB)</span>
              </div>
            ) : (
              <div className="space-y-2">
                {evidenceFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={16} className="text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvidence(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remover arquivo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-[#1a2332] hover:bg-[#253043] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send size={14} />
              <span>{submitting ? 'Abrindo...' : 'Enviar Chamado'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
