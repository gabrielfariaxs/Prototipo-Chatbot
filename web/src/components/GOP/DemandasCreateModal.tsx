import React, { useState } from 'react'
import { X, Calendar, User, FileText, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface DemandasCreateModalProps {
  onClose: () => void
  onSuccess: () => void
  userSector?: string
}

export const DemandasCreateModal: React.FC<DemandasCreateModalProps> = ({ onClose, onSuccess, userSector = 'T.I' }) => {
  const [funcionario, setFuncionario] = useState('')
  const [prazo, setPrazo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!funcionario.trim() || !prazo || !descricao.trim()) {
      alert("Por favor, preencha todos os campos obrigatórios (Funcionário, Prazo e Descrição).")
      return
    }

    setIsSubmitting(true)
    const { error } = await supabase.from('demandas').insert({
      funcionario,
      prazo,
      descricao,
      setor: userSector,
      status: 'Pendente'
    })
    setIsSubmitting(false)

    if (error) {
      alert("Erro ao criar demanda: " + error.message)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-[#f8fafc] rounded-none md:rounded-2xl w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Nova Atribuição</span>
            <h2 className="text-2xl font-extrabold text-[#1a2332]">Registrar Demanda</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 p-4 md:p-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-8">
            <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={16} /> Detalhes da Demanda
              </h3>
              
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1a2332] flex items-center gap-2">
                      <User size={16} className="text-slate-400" />
                      Funcionário Direcionado *
                    </label>
                    <input 
                      type="text" 
                      value={funcionario} 
                      onChange={e => setFuncionario(e.target.value)}
                      placeholder="Nome do funcionário"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-[#1a2332] flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      Prazo de Conclusão *
                    </label>
                    <input 
                      type="date" 
                      value={prazo} 
                      onChange={e => setPrazo(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 bg-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-[#1a2332]">Descrição da Demanda *</label>
                  <textarea 
                    value={descricao} 
                    onChange={e => setDescricao(e.target.value)}
                    placeholder="Descreva o que o funcionário precisa fazer ou resolver..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-[15px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[120px] resize-none text-slate-700"
                  />
                  <p className="text-xs font-semibold text-slate-400 mt-1">
                    Forneça detalhes suficientes para que o funcionário entenda claramente o que é esperado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-200 flex justify-end gap-3 shrink-0">
            <button 
              type="button" 
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl text-sm font-bold text-white bg-[#1a2332] hover:bg-blue-600 transition-colors shadow-lg cursor-pointer flex items-center gap-2"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Registrar Demanda
            </button>
        </div>

      </div>
    </div>
  )
}
