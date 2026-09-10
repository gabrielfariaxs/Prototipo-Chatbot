import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, History, PlusCircle, Edit3, Trash2, Search, Filter, Calendar, User, Layers, RefreshCw } from 'lucide-react'
import { getProcedureLogs, type ProcedureLogItem } from '../../lib/procedures-service'

interface ProcedureHistoryModalProps {
  onClose: () => void;
  userSector?: string;
}

export const ProcedureHistoryModal: React.FC<ProcedureHistoryModalProps> = ({ onClose, userSector }) => {
  const [logs, setLogs] = useState<ProcedureLogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<'todos' | 'adicao' | 'edicao' | 'exclusao'>('todos')
  const [filterSector, setFilterSector] = useState<string>('todos')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const data = await getProcedureLogs()
      setLogs(data)
    } catch (err) {
      console.error('Erro ao carregar histórico de procedimentos:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Lista de setores únicos nos logs para o filtro
  const availableSectors = Array.from(new Set(logs.map(l => l.setor).filter(Boolean)))

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.usuario_nome && log.usuario_nome.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.detalhes && log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesAction = filterAction === 'todos' || log.acao === filterAction
    const matchesSector = filterSector === 'todos' || log.setor.toLowerCase() === filterSector.toLowerCase()

    return matchesSearch && matchesAction && matchesSector
  })

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return isoString
    }
  }

  const getActionBadge = (acao: ProcedureLogItem['acao']) => {
    switch (acao) {
      case 'adicao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
            <PlusCircle size={13} className="text-emerald-600" />
            Adicionado
          </span>
        )
      case 'edicao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
            <Edit3 size={13} className="text-blue-600" />
            Editado
          </span>
        )
      case 'exclusao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 shadow-xs">
            <Trash2 size={13} className="text-rose-600" />
            Removido
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/30 rounded-xl text-indigo-300">
              <History size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Histórico de Procedimentos</h2>
              <p className="text-xs text-slate-300">
                Auditoria de adições, edições e exclusões para Gestores, Operações e T.I
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por procedimento ou usuário..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
              />
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer ml-auto shrink-0"
              title="Atualizar histórico"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-indigo-600' : ''} />
              Atualizar
            </button>
          </div>

          {/* Action Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter size={12} /> Ação:
            </span>
            <button
              onClick={() => setFilterAction('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterAction === 'todos'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              Todos ({logs.length})
            </button>
            <button
              onClick={() => setFilterAction('adicao')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterAction === 'adicao'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-emerald-50 border border-slate-200'
              }`}
            >
              ➕ Adições ({logs.filter(l => l.acao === 'adicao').length})
            </button>
            <button
              onClick={() => setFilterAction('edicao')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterAction === 'edicao'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-blue-50 border border-slate-200'
              }`}
            >
              ✏️ Edições ({logs.filter(l => l.acao === 'edicao').length})
            </button>
            <button
              onClick={() => setFilterAction('exclusao')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterAction === 'exclusao'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-rose-50 border border-slate-200'
              }`}
            >
              🗑️ Exclusões ({logs.filter(l => l.acao === 'exclusao').length})
            </button>

            {/* Sector Filter Dropdown */}
            {availableSectors.length > 0 && (
              <div className="ml-auto flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Layers size={12} /> Setor:
                </span>
                <select
                  value={filterSector}
                  onChange={e => setFilterSector(e.target.value)}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="todos">Todos os Setores</option>
                  {availableSectors.map(sec => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Logs List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <RefreshCw size={28} className="animate-spin text-indigo-600" />
              <p className="text-xs font-medium">Carregando histórico de auditoria...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
              <History size={36} className="text-slate-300" />
              <p className="text-sm font-semibold text-slate-600">Nenhum registro encontrado</p>
              <p className="text-xs text-slate-400">
                {searchTerm || filterAction !== 'todos' || filterSector !== 'todos' 
                  ? 'Tente ajustar os filtros ou a busca acima.'
                  : 'As ações de adição, edição e exclusão de procedimentos ficarão registradas aqui.'}
              </p>
            </div>
          ) : (
            filteredLogs.map(log => (
              <div 
                key={log.id}
                className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all shadow-2xs hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getActionBadge(log.acao)}
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">{log.processo}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      Setor: {log.setor}
                    </span>
                    {log.sistema && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.sistema}
                      </span>
                    )}
                  </div>

                  {log.detalhes && (
                    <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 p-2 rounded-lg border border-slate-100">
                      {log.detalhes}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 text-[11px] text-slate-500 border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 shrink-0">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <User size={13} className="text-slate-400" />
                    <span>{log.usuario_nome || 'Usuário do Sistema'}</span>
                    {log.usuario_setor && <span className="text-slate-400">({log.usuario_setor})</span>}
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar size={12} />
                    <span>{formatDate(log.data)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>Exibindo <strong>{filteredLogs.length}</strong> de <strong>{logs.length}</strong> registros</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-semibold transition-all cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>
    </div>
  )
}
