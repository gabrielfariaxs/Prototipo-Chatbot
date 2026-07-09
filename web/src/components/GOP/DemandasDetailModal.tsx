import React, { useState } from 'react'
import { X, Calendar, User, Clock, CheckCircle2, Circle, Upload, Paperclip, AlertTriangle, Trash2 } from 'lucide-react'

interface DemandasDetailModalProps {
  demanda: any
  onClose: () => void
  onSave: (id: string, novoStatus: string, anexo?: string) => void
  onDelete?: (id: string) => void
  isLocked: boolean
}

export const DemandasDetailModal: React.FC<DemandasDetailModalProps> = ({ demanda, onClose, onSave, onDelete, isLocked }) => {
  const [status, setStatus] = useState(demanda.status)
  const [anexoUrl, setAnexoUrl] = useState<string | undefined>(demanda.anexo)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAnexoUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveClick = () => {
    onSave(demanda.id, status, anexoUrl)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-[#f8fafc] rounded-none md:rounded-2xl w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-[#1a2332]">Detalhes da Demanda</h2>
            {isLocked && (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <AlertTriangle size={12} />
                Prazo Vencido
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Funcionário / Setor</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#1a2332] text-sm">{demanda.funcionario}</span>
                  <span className="text-[11px] font-semibold text-slate-500">{demanda.setor}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prazos</span>
              <div className="flex items-center gap-4 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(demanda.data_criacao).toLocaleDateString()}
                </div>
                <div className="text-slate-300">→</div>
                <div className={`flex items-center gap-1.5 ${isLocked ? 'text-red-600' : ''}`}>
                  <Clock size={14} className={isLocked ? 'text-red-500' : 'text-slate-400'} />
                  {new Date(demanda.prazo).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descrição da Demanda</span>
            <div className="bg-white p-5 rounded-2xl border border-slate-100 text-slate-700 text-sm font-medium leading-relaxed">
              {demanda.descricao}
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full my-2"></div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ações e Status</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`flex items-center justify-center gap-2 border rounded-xl py-3 transition-colors ${status === 'Pendente' ? 'border-amber-500 bg-amber-50/50 text-amber-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} ${isLocked ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                <input type="radio" name="status" value="Pendente" checked={status === 'Pendente'} onChange={(e) => setStatus(e.target.value)} className="hidden" />
                <Circle size={16} className={status === 'Pendente' ? 'text-amber-500' : 'text-slate-400'} />
                <span className="text-sm font-bold">Pendente</span>
              </label>

              <label className={`flex items-center justify-center gap-2 border rounded-xl py-3 transition-colors ${status === 'Feito' ? 'border-green-500 bg-green-50/50 text-green-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} ${isLocked && status !== 'Feito' ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                <input type="radio" name="status" value="Feito" checked={status === 'Feito'} onChange={(e) => setStatus(e.target.value)} className="hidden" />
                <CheckCircle2 size={16} className={status === 'Feito' ? 'text-green-500' : 'text-slate-400'} />
                <span className="text-sm font-bold">Feito</span>
              </label>

              <label className={`flex items-center justify-center gap-2 border rounded-xl py-3 transition-colors ${status === 'Não concluído' ? 'border-red-500 bg-red-50/50 text-red-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'} ${isLocked && status !== 'Não concluído' ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                <input type="radio" name="status" value="Não concluído" checked={status === 'Não concluído'} onChange={(e) => setStatus(e.target.value)} className="hidden" />
                <X size={16} className={status === 'Não concluído' ? 'text-red-500' : 'text-slate-400'} />
                <span className="text-sm font-bold">Não concluído</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Comprovante de Execução
              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">OPCIONAL</span>
            </span>

            {anexoUrl ? (
              <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <Paperclip size={18} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#1a2332]">Anexo inserido</span>
                    <span className="text-xs text-slate-500 font-medium">Pronto para envio</span>
                  </div>
                </div>
                {!isLocked && (
                  <button 
                    onClick={() => setAnexoUrl(undefined)}
                    className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    Remover
                  </button>
                )}
              </div>
            ) : (
              <label className={`border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-slate-400 transition-colors hover:border-indigo-400 hover:text-indigo-500 ${isLocked ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}>
                <Upload size={24} />
                <span className="text-sm font-semibold">Clique para anexar arquivo ou imagem</span>
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} disabled={isLocked} />
              </label>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            {onDelete && (
              <button 
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir esta demanda?')) {
                    onDelete(demanda.id)
                  }
                }}
                className="px-4 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Trash2 size={16} />
                Excluir
              </button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            {!isLocked && (
              <button 
                onClick={handleSaveClick}
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#1a2332] hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
              >
                Salvar Alterações
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
