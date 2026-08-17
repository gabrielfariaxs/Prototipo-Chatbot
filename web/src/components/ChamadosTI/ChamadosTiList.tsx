import React, { useState } from 'react'
import { Search, Filter, Plus, Clock, CheckCircle2, XCircle, Wrench, ShieldCheck, User, Calendar, Eye, Paperclip, LayoutGrid, List, MessageSquare, AlertTriangle } from 'lucide-react'
import type { ChamadoTI, ChamadoStatus, ChamadoPriority } from './types'

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
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')

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
        return <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded flex items-center gap-1 w-max"><Clock size={11} /> Aguardando ({approverSector})</span>
      case 'aprovado':
        return <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold rounded flex items-center gap-1 w-max"><CheckCircle2 size={11} /> Aprovado (Fila T.I)</span>
      case 'recusado':
        return <span className="px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold rounded flex items-center gap-1 w-max"><XCircle size={11} /> Recusado</span>
      case 'em_atendimento':
        return <span className="px-2 py-0.5 bg-indigo-50 text-indigo-800 border border-indigo-200 text-[10px] font-bold rounded flex items-center gap-1 w-max"><Wrench size={11} /> Em Atendimento</span>
      case 'concluido':
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded flex items-center gap-1 w-max"><ShieldCheck size={11} /> Concluído</span>
    }
  }

  const KANBAN_COLUMNS: { id: ChamadoStatus; label: string; bg: string; text: string; border: string; badgeBg: string }[] = [
    {
      id: 'pendente_aprovacao',
      label: 'Aprovação Pendente',
      bg: 'bg-amber-50/80',
      text: 'text-amber-900',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-500 text-white'
    },
    {
      id: 'aprovado',
      label: 'Fila T.I (A Fazer)',
      bg: 'bg-blue-50/80',
      text: 'text-blue-900',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-600 text-white'
    },
    {
      id: 'em_atendimento',
      label: 'Em Atendimento',
      bg: 'bg-indigo-50/80',
      text: 'text-indigo-900',
      border: 'border-indigo-200',
      badgeBg: 'bg-indigo-500 text-white'
    },
    {
      id: 'concluido',
      label: 'Concluído',
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-600 text-white'
    }
  ]

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-5 w-full max-w-none">
      
      {/* Controls & Actions Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, título, solicitante ou descrição..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1b497d] transition-all"
          />
        </div>

        {/* View Switcher & Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          
          {/* Toggle View Mode */}
          <div className="bg-[#fafbfe] border border-[#e6e9f2] p-1 rounded-xl flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-[#1b497d] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <LayoutGrid size={14} />
              <span>Quadro Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#1b497d] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <List size={14} />
              <span>Lista</span>
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 hidden md:block" />

          {/* Status Filter */}
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
            className="px-4 py-2 bg-[#1b497d] hover:bg-[#12345b] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Novo Chamado</span>
          </button>
        </div>

      </div>

      {/* Main Content View */}
      {filteredChamados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Search size={24} />
          </div>
          <h4 className="font-bold text-slate-700 text-sm">Nenhum chamado registrado no momento</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Clique abaixo para cadastrar a primeira solicitação de suporte técnico.
          </p>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="mt-4 px-4 py-2 bg-[#1b497d] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus size={14} />
            <span>Abrir Chamado</span>
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* QUADRO KANBAN (4 Colunas Fluidas 100% Largura) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
          {KANBAN_COLUMNS.map((col) => {
            const columnItems = filteredChamados.filter((c) => c.status === col.id)

            return (
              <div 
                key={col.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-3 md:p-3.5 flex flex-col gap-3 min-h-[500px] shadow-xs w-full min-w-0"
              >
                {/* Header da Coluna por Status */}
                <div className={`p-3 rounded-xl border ${col.bg} ${col.border} flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.badgeBg}`} />
                    <h3 className={`font-display font-extrabold text-xs tracking-tight ${col.text}`}>
                      {col.label}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white ${col.text} border ${col.border}`}>
                    {columnItems.length}
                  </span>
                </div>

                {/* Cards da Coluna */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto max-h-[680px]">
                  {columnItems.length === 0 ? (
                    <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center my-auto text-slate-400">
                      <span className="text-xs font-medium">Vazio</span>
                    </div>
                  ) : (
                    columnItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className="bg-white hover:bg-slate-50 border border-[#e2e8f0] hover:border-[#1b497d]/40 rounded-xl p-4 shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                      >
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[11px] text-[#1b497d] bg-[#eef4fa] px-2 py-0.5 rounded-md border border-[#b3c7e0]">
                            {item.code}
                          </span>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded flex items-center gap-1 w-max ${
                            item.priority === 'critica' ? 'bg-red-100 text-red-800' :
                            item.priority === 'alta' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'media' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            Prioridade {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-display font-bold text-sm text-[#1e293b] group-hover:text-[#1b497d] transition-colors leading-snug line-clamp-2">
                            {item.title}
                          </h4>
                          <p className="text-xs text-[#475569] leading-relaxed line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                          <div className="flex items-center justify-between text-[11px] text-[#475569]">
                            <span className="flex items-center gap-1 font-semibold truncate max-w-[140px]">
                              <User size={12} /> {item.creatorName}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {item.creatorSector}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} /> {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                            <div className="flex items-center gap-2">
                              {item.comments && item.comments.length > 0 && (
                                <span className="flex items-center gap-0.5 text-blue-600 font-bold">
                                  <MessageSquare size={11} /> {item.comments.length}
                                </span>
                              )}
                              {item.evidenceFiles && item.evidenceFiles.length > 0 && (
                                <span className="flex items-center gap-0.5 text-indigo-600 font-bold">
                                  <Paperclip size={11} /> {item.evidenceFiles.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )
          })}
        </div>
      ) : (
        /* VISÃO LISTA TRADICIONAL */
        <div className="grid grid-cols-1 gap-3">
          {filteredChamados.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelect(item)}
              className="bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 p-5 shadow-xs transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <span className="font-mono font-bold text-xs bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 rounded-lg shrink-0">
                  {item.code}
                </span>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display font-bold text-slate-800 text-sm group-hover:text-[#1b497d] transition-colors truncate">
                      {item.title}
                    </h4>
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
                    <span className="font-medium">Resp. Aprovação: <strong className="text-[#1b497d]">{item.approverSector}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex items-center gap-3 shrink-0 self-end md:self-center w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {getStatusBadge(item.status, item.approverSector)}
                <div className="p-2 text-slate-400 group-hover:text-[#1b497d] group-hover:translate-x-0.5 transition-all">
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
