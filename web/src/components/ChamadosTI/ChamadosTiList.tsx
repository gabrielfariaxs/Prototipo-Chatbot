import React, { useState } from 'react'
import { Search, Filter, Plus, Clock, CheckCircle2, XCircle, Wrench, ShieldCheck, User, Calendar, Eye, Paperclip } from 'lucide-react'
import type { ChamadoTI, ChamadoStatus } from './types'

interface ChamadosTiListProps {
  chamados: ChamadoTI[]
  userSector: string
  userName: string
  onSelect: (chamado: ChamadoTI) => void
  onOpenCreateModal: () => void
}

export const ChamadosTiList: React.FC<ChamadosTiListProps> = ({
  chamados,
  userSector,
  userName,
  onSelect,
  onOpenCreateModal
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')

  const filteredChamados = chamados.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'todos' || item.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: ChamadoStatus, approverSector: string) => {
    switch (status) {
      case 'pendente_aprovacao':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold rounded-lg flex items-center gap-1 w-max"><Clock size={12} /> Aguardando Aprovação ({approverSector})</span>
      case 'aprovado':
        return <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold rounded-lg flex items-center gap-1 w-max"><CheckCircle2 size={12} /> Aprovado (Aguardando T.I)</span>
      case 'recusado':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold rounded-lg flex items-center gap-1 w-max"><XCircle size={12} /> Recusado</span>
      case 'em_atendimento':
        return <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold rounded-lg flex items-center gap-1 w-max"><Wrench size={12} /> Em Atendimento (T.I)</span>
      case 'concluido':
        return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold rounded-lg flex items-center gap-1 w-max"><ShieldCheck size={12} /> Concluído</span>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critica':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 border border-red-200 text-[10px] font-extrabold uppercase rounded">Crítica</span>
      case 'alta':
        return <span className="px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-extrabold uppercase rounded">Alta</span>
      case 'media':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-extrabold uppercase rounded">Média</span>
      default:
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-extrabold uppercase rounded">Baixa</span>
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      
      {/* Controls & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, título, solicitante ou descrição..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1a2332] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente_aprovacao">Pendentes de Aprovação</option>
              <option value="aprovado">Aprovados (Aguardando T.I)</option>
              <option value="em_atendimento">Em Atendimento</option>
              <option value="concluido">Concluídos</option>
              <option value="recusado">Recusados</option>
            </select>
          </div>

          {/* New Ticket Button */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2 bg-[#1a2332] hover:bg-[#253043] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Novo Chamado</span>
          </button>
        </div>

      </div>

      {/* Tickets List */}
      {filteredChamados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Search size={24} />
          </div>
          <h4 className="font-bold text-slate-700 text-sm">Nenhum chamado encontrado</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Não foram encontrados chamados com os filtros atuais. Clique abaixo para abrir uma nova solicitação.
          </p>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="mt-4 px-4 py-2 bg-[#1a2332] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <Plus size={14} />
            <span>Abrir Chamado</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredChamados.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="bg-white hover:bg-slate-50/80 rounded-2xl border border-slate-200 p-5 shadow-xs transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <span className="font-bold text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shrink-0">
                  {item.code}
                </span>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
                      {item.title}
                    </h4>
                    {getPriorityBadge(item.priority)}
                    {item.evidenceFiles && item.evidenceFiles.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded flex items-center gap-1">
                        <Paperclip size={10} />
                        <span>{item.evidenceFiles.length} anexo(s)</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-600"><User size={12} /> {item.creatorName} ({item.creatorSector})</span>
                    <span>•</span>
                    <span className="font-medium">Resp. Aprovação: <strong className="text-blue-900">{item.approverSector}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {getStatusBadge(item.status, item.approverSector)}
                <div className="p-2 text-slate-400 group-hover:text-[#1a2332] group-hover:translate-x-0.5 transition-all">
                  <Eye size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
