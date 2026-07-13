import React, { useState, useEffect } from 'react'
import { Plus, Search, Calendar, User, Clock, CheckCircle2, Circle, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { DemandasCreateModal } from './DemandasCreateModal'
import { DemandasDetailModal } from './DemandasDetailModal'

interface DemandasListProps {
  userSector?: string
  userRole?: string
}

export const DemandasList: React.FC<DemandasListProps> = ({ userSector = 'T.I', userRole = 'lider' }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDemanda, setSelectedDemanda] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [demandas, setDemandas] = useState<any[]>([])
  
  useEffect(() => {
    fetchDemandas()
  }, [userSector, userRole])

  const fetchDemandas = async () => {
    let query = supabase
      .from('demandas')
      .select('*')
      .order('data_criacao', { ascending: false })

    if (userRole !== 'coo' && userSector) {
      query = query.eq('setor', userSector)
    }

    const { data, error } = await query
    if (data) {
      // Auto-lock logic on fetch
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const processedData = data.map((d) => {
        if (d.status !== 'Feito' && new Date(d.prazo) < today && d.status !== 'Não concluído') {
          // Update DB if we are fetching and notice it's expired (do not await to avoid blocking UI)
          supabase.from('demandas').update({ status: 'Não concluído' }).eq('id', d.id).then()
          return { ...d, status: 'Não concluído' }
        }
        return d
      })

      setDemandas(processedData)
    }
  }

  const isExpired = (prazo: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return new Date(prazo) < today
  }

  const filteredDemandas = demandas.filter(d => {
    const matchesSearch = d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.funcionario.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const handleAddDemanda = (novaDemanda: any) => {
    fetchDemandas() // Re-fetch instead of local state update to ensure sync
  }

  const handleSaveDemanda = async (id: string, novoStatus: string, anexo?: string) => {
    await supabase
      .from('demandas')
      .update({ status: novoStatus, anexo })
      .eq('id', id)
      
    fetchDemandas()
    setSelectedDemanda(null)
  }

  const handleDeleteDemanda = async (id: string) => {
    await supabase.from('demandas').delete().eq('id', id)
    fetchDemandas()
    setSelectedDemanda(null)
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto p-8 flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">Gestão de Equipe</p>
          <h1 className="text-3xl font-extrabold text-[#1a2332] tracking-tight">Demandas Direcionadas</h1>
          <p className="text-slate-500 text-sm mt-1.5 font-medium">Acompanhe e atribua novas tarefas e demandas para membros específicos da equipe.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer shrink-0"
        >
          <Plus size={18} strokeWidth={2.5} />
          Nova Demanda
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mt-4">
        <div className="relative flex-1 min-w-[220px] max-w-[400px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar por funcionário ou descrição..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-2">
        <div className="hidden md:grid grid-cols-[auto_1.5fr_1fr_1fr_2fr] gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-8 text-center">Status</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Funcionário</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data Atribuição</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prazo Final</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descrição</div>
        </div>

        <div className="flex flex-col">
          {filteredDemandas.length > 0 ? (
            filteredDemandas.map((demanda, i) => {
              const expired = isExpired(demanda.prazo) && demanda.status !== 'Feito'
              return (
                <div 
                  key={demanda.id}
                  onClick={() => setSelectedDemanda(demanda)}
                  className={`flex flex-col md:grid md:grid-cols-[auto_1.5fr_1fr_1fr_2fr] gap-4 px-6 py-5 md:items-center hover:bg-slate-50 transition-colors cursor-pointer ${i !== filteredDemandas.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="flex items-center gap-3 md:w-8 md:justify-center">
                    {demanda.status === 'Feito' ? (
                      <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                    ) : demanda.status === 'Não concluído' ? (
                      <X size={20} className="text-red-500 shrink-0" />
                    ) : (
                      <Circle size={20} className="text-amber-500 shrink-0" />
                    )}
                    <div className="flex flex-col md:hidden">
                      <span className="text-sm font-bold text-[#1a2332]">{demanda.funcionario}</span>
                      {userRole === 'coo' && <span className="text-[10px] font-semibold text-slate-400">{demanda.setor}</span>}
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                      <User size={12} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1a2332] truncate">{demanda.funcionario}</span>
                      {userRole === 'coo' && <span className="text-[10px] font-semibold text-slate-400">{demanda.setor}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-1.5 text-sm font-semibold text-slate-600">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span className="md:hidden text-xs text-slate-400">Atribuído em:</span>
                    {new Date(demanda.data_criacao).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 md:gap-1.5 text-sm font-semibold text-slate-600">
                    <Clock size={14} className={`shrink-0 ${expired ? 'text-red-500' : 'text-slate-400'}`} />
                    <span className="md:hidden text-xs text-slate-400">Prazo:</span>
                    <span className={expired ? 'text-red-600' : ''}>
                      {new Date(demanda.prazo).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 line-clamp-2 mt-2 md:mt-0" title={demanda.descricao}>
                    {demanda.descricao}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              Nenhuma demanda encontrada para este setor.
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <DemandasCreateModal 
          userSector={userSector}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            handleAddDemanda(null)
            setIsCreateModalOpen(false)
          }}
        />
      )}

      {selectedDemanda && (
        <DemandasDetailModal
          demanda={selectedDemanda}
          isLocked={isExpired(selectedDemanda.prazo)}
          onClose={() => setSelectedDemanda(null)}
          onSave={handleSaveDemanda}
          onDelete={handleDeleteDemanda}
        />
      )}
    </div>
  )
}
