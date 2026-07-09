import React, { useState } from 'react'
import { Plus, Search, Calendar, User, Clock, CheckCircle2, Circle } from 'lucide-react'
import { DemandasCreateModal } from './DemandasCreateModal'

export const DemandasList = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Mock data for prototype
  const [demandas, setDemandas] = useState<any[]>([
    {
      id: '1',
      data_criacao: new Date().toISOString(),
      prazo: '2026-07-20',
      funcionario: 'Carlos Silva',
      descricao: 'Revisar os processos de faturamento do mês anterior e enviar o relatório de inconformidades.',
      status: 'Pendente'
    },
    {
      id: '2',
      data_criacao: new Date(Date.now() - 86400000).toISOString(), // Ontem
      prazo: '2026-07-15',
      funcionario: 'Ana Souza',
      descricao: 'Atualizar a planilha de controle de equipamentos do setor de TI.',
      status: 'Concluído'
    }
  ])

  const filteredDemandas = demandas.filter(d => 
    d.descricao.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.funcionario.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddDemanda = (novaDemanda: any) => {
    setDemandas([{ ...novaDemanda, id: Date.now().toString(), status: 'Pendente', data_criacao: new Date().toISOString() }, ...demandas])
  }

  const toggleStatus = (id: string) => {
    setDemandas(demandas.map(d => {
      if (d.id === id) {
        return { ...d, status: d.status === 'Pendente' ? 'Concluído' : 'Pendente' }
      }
      return d
    }))
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
        <div className="grid grid-cols-[auto_1.5fr_1fr_1fr_2fr] gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest w-8 text-center">Status</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Funcionário</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data Atribuição</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Prazo Final</div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Descrição</div>
        </div>

        <div className="flex flex-col">
          {filteredDemandas.length > 0 ? (
            filteredDemandas.map((demanda, i) => (
              <div 
                key={demanda.id}
                className={`grid grid-cols-[auto_1.5fr_1fr_1fr_2fr] gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors ${i !== filteredDemandas.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <button 
                  onClick={() => toggleStatus(demanda.id)}
                  className="w-8 flex justify-center text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                  title={demanda.status === 'Pendente' ? 'Marcar como concluído' : 'Reabrir demanda'}
                >
                  {demanda.status === 'Concluído' ? (
                    <CheckCircle2 size={20} className="text-green-500" />
                  ) : (
                    <Circle size={20} />
                  )}
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                    <User size={12} />
                  </div>
                  <span className="text-sm font-bold text-[#1a2332] truncate">{demanda.funcionario}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                  <Calendar size={14} className="text-slate-400" />
                  {new Date(demanda.data_criacao).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                  <Clock size={14} className={new Date(demanda.prazo) < new Date() && demanda.status !== 'Concluído' ? 'text-red-500' : 'text-slate-400'} />
                  <span className={new Date(demanda.prazo) < new Date() && demanda.status !== 'Concluído' ? 'text-red-600' : ''}>
                    {new Date(demanda.prazo).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-slate-600 line-clamp-2" title={demanda.descricao}>
                  {demanda.descricao}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              Nenhuma demanda encontrada.
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <DemandasCreateModal 
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={(demanda) => {
            handleAddDemanda(demanda)
            setIsCreateModalOpen(false)
          }}
        />
      )}
    </div>
  )
}
