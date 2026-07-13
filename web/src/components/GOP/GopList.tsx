import React, { useEffect, useState } from 'react'
import { Plus, Search, ChevronDown, ChevronRight, LayoutGrid, List, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { GopCreateModal } from './GopCreateModal'

interface GopListProps {
  onSelect: (id: string) => void
  userRole: 'lider' | 'coo' | 'demandas'
  userSector?: string
}

export const GopList: React.FC<GopListProps> = ({ onSelect, userRole, userSector }) => {
  const [gargalos, setGargalos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSetor, setFilterSetor] = useState('Todos')
  const [filterUrgencia, setFilterUrgencia] = useState('Todas')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  useEffect(() => {
    fetchGargalos()
  }, [])

  const fetchGargalos = async () => {
    setLoading(true)
    let query = supabase
      .from('gargalos')
      .select('*')
      .order('data_registro', { ascending: false })

    if (userRole === 'lider' && userSector) {
      query = query.eq('setor', userSector)
    }

    const { data, error } = await query
    
    if (data) {
      setGargalos(data)
    } else {
      console.error('Erro ao buscar gargalos:', error)
    }
    setLoading(false)
  }

  const formatDate = (dateString: string) => {
    const d = new Date(dateString)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
  }

  // Derive filter options from data
  const setores = ['Todos', ...Array.from(new Set(gargalos.map(g => g.setor)))]
  const urgencias = ['Todas', 'Alta', 'Média', 'Baixa']
  const statusOptions = ['Todos', 'Não Iniciado', 'Em Andamento', 'Em pausa', 'Resolvido']

  // Filter the list
  const filteredGargalos = gargalos.filter(g => {
    const matchesSearch = g.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.autor_nome.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSetor = filterSetor === 'Todos' || g.setor === filterSetor
    const matchesUrgencia = filterUrgencia === 'Todas' || g.urgencia === filterUrgencia
    const matchesStatus = filterStatus === 'Todos' || g.status === filterStatus

    return matchesSearch && matchesSetor && matchesUrgencia && matchesStatus
  })

  const aguardandoTratativa = gargalos.filter(g => g.status === 'Não Iniciado' || g.status === 'Em Andamento').length
  const altaUrgencia = gargalos.filter(g => g.urgencia === 'Alta').length
  const bloqueados = gargalos.filter(g => g.status === 'Em pausa').length
  const naoIniciados = gargalos.filter(g => g.status === 'Não Iniciado').length
  const resolvidos = gargalos.filter(g => g.status === 'Resolvido').length

  // Calculate Sector distribution
  const setorCounts = gargalos.reduce((acc: any, g) => {
    acc[g.setor] = (acc[g.setor] || 0) + 1
    return acc
  }, {})
  const maxSetorCount = Math.max(...Object.values(setorCounts) as number[], 1)

  return (
    <div className="w-full max-w-[1100px] mx-auto p-8 flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <div>
          {userRole === 'coo' ? (
            <>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">Fila de Revisão - COO</p>
              <h1 className="text-3xl font-extrabold text-[#1a2332] tracking-tight">Não Conformidades aguardando tratativa</h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Selecione um gargalo para revisar as evidências e registrar a decisão da reunião.</p>
            </>
          ) : (
            <>
              <p className="text-blue-600 font-bold text-xs uppercase tracking-widest mb-1">Minhas Não Conformidades</p>
              <h1 className="text-3xl font-extrabold text-[#1a2332] tracking-tight">Painel de Não Conformidades Operacionais</h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Não conformidades reportadas por você e seu status de tratativa junto ao COO.</p>
            </>
          )}
        </div>
        {userRole === 'lider' && (
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-6 rounded-xl flex items-center justify-center w-full md:w-auto gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
            Reportar Nova Não Conformidade
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {userRole === 'coo' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1.5fr] gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 text-[13px] font-bold">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Search size={12} strokeWidth={3} />
              </div>
              Aguardando tratativa
            </div>
            <span className="text-3xl font-extrabold text-[#1a2332]">{aguardandoTratativa}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 text-[13px] font-bold">
              <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <Search size={12} strokeWidth={3} />
              </div>
              Alta urgência
            </div>
            <span className="text-3xl font-extrabold text-[#1a2332]">{altaUrgencia}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 text-[13px] font-bold">
              <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full border-2 border-amber-500 flex items-center justify-center"><div className="w-4 h-0.5 bg-amber-500 rotate-45"></div></div>
              </div>
              Em pausa
            </div>
            <span className="text-3xl font-extrabold text-[#1a2332]">{bloqueados}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 text-[13px] font-bold">
              <div className="w-6 h-6 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                <Search size={12} strokeWidth={3} />
              </div>
              Resolvidos
            </div>
            <span className="text-3xl font-extrabold text-[#1a2332]">{resolvidos}</span>
          </div>
          
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col h-[120px] overflow-hidden lg:col-span-1 md:col-span-2">
            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-3">Não Conformidades por setor</span>
            <div className="flex flex-col gap-2 overflow-y-auto pr-1 custom-scrollbar">
              {Object.entries(setorCounts).map(([setor, count]: [string, any]) => (
                <div key={setor} className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate-500 w-24 truncate" title={setor}>{setor}</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(count / maxSetorCount) * 100}%` }}></div>
                  </div>
                  <span className="text-[12px] font-extrabold text-[#1a2332] w-4 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total reportado', value: gargalos.length, color: 'bg-slate-400' },
            { label: 'Em andamento', value: gargalos.filter(g => g.status === 'Em Andamento').length, color: 'bg-blue-500' },
            { label: 'Em pausa', value: gargalos.filter(g => g.status === 'Em pausa').length, color: 'bg-red-500' },
            { label: 'Resolvido', value: resolvidos, color: 'bg-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-[1.25rem] p-6 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                <span className="text-[13px] font-bold text-slate-500 tracking-wide">{stat.label}</span>
              </div>
              <span className="text-[2.5rem] leading-none font-extrabold text-[#1a2332]">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mt-4 flex-wrap">
        <div className="flex flex-col md:flex-row gap-3 flex-wrap">
          <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 shrink-0">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex flex-1 justify-center items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${viewMode === 'list' ? 'bg-[#1a2332] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <List size={16} /> {userRole === 'coo' ? 'Cards' : 'Tabela'}
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex flex-1 justify-center items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${viewMode === 'kanban' ? 'bg-[#1a2332] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              <LayoutGrid size={16} /> {userRole === 'coo' ? 'Lista' : 'Kanban'}
            </button>
          </div>
          
          <div className="relative flex-1 min-w-[220px] max-w-full md:max-w-[320px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar não conformidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 flex-wrap">
          <div className="relative w-full md:w-auto">
            <select 
              value={filterSetor}
              onChange={(e) => setFilterSetor(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 w-full md:w-auto bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 shadow-sm hover:bg-slate-50 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {setores.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos os setores' : s}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>

          <div className="relative w-full md:w-auto">
            <select 
              value={filterUrgencia}
              onChange={(e) => setFilterUrgencia(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 w-full md:w-auto bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 shadow-sm hover:bg-slate-50 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {urgencias.map(u => <option key={u} value={u}>{u === 'Todas' ? 'Toda urgência' : u}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>

          <div className="relative w-full md:w-auto">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 w-full md:w-auto bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 shadow-sm hover:bg-slate-50 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {statusOptions.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todo status' : s}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>
        </div>
        <span className="text-sm font-bold text-slate-400 tracking-wide shrink-0 block mt-3 md:mt-0">{filteredGargalos.length} resultado(s)</span>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-100 mt-2">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
          <span className="text-sm font-bold">Carregando não conformidades...</span>
        </div>
      ) : filteredGargalos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white rounded-2xl shadow-sm border border-slate-100 mt-2">
          <span className="text-sm font-bold">Nenhuma não conformidade encontrada para os filtros selecionados.</span>
        </div>
      ) : userRole === 'coo' ? (
        /* COO Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
          {filteredGargalos.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onSelect(item.id)}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group"
            >
              {/* Top Tags */}
              <div className="flex items-center justify-between mb-4 gap-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-[0.4rem] text-[11px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap
                  ${item.urgencia === 'Alta' ? 'bg-red-50 text-red-600' : 
                    item.urgencia === 'Média' ? 'bg-amber-50 text-amber-600' : 
                    'bg-green-50 text-green-600'}`}>
                  {item.urgencia}
                </span>
                <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] font-bold shrink-0 whitespace-nowrap
                  ${item.status === 'Em Andamento' ? 'bg-blue-50 text-blue-600' : 
                    item.status === 'Não Iniciado' ? 'bg-slate-100 text-slate-600' : 
                    item.status === 'Em pausa' ? 'bg-red-50 text-red-600' : 
                    item.status === 'Resolvido' ? 'bg-green-50 text-green-600' :
                    'bg-slate-100 text-slate-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    item.status === 'Em Andamento' ? 'bg-blue-500' : 
                    item.status === 'Não Iniciado' ? 'bg-slate-400' : 
                    item.status === 'Em pausa' ? 'bg-red-500' : 
                    item.status === 'Resolvido' ? 'bg-green-500' : 'bg-slate-400'
                  }`}></div>
                  {item.status}
                </span>
              </div>
              
              {/* Title & Desc */}
              <h3 className="text-[17px] font-bold text-[#1a2332] mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{item.titulo}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed line-clamp-2 flex-1 mb-2">{item.descricao}</p>
              
              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                  <span>{item.setor}</span>
                  <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                  <span>{formatDate(item.data_registro)}</span>
                </div>
                <span className="text-[13px] font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Revisar <ChevronRight size={14} strokeWidth={3} />
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban View */
        <div className="flex gap-4 mt-2 overflow-x-auto pb-4 custom-scrollbar">
          {statusOptions.filter(s => s !== 'Todos').map(statusCol => {
            const colItems = filteredGargalos.filter(g => g.status === statusCol)
            const colorClass = statusCol === 'Não Iniciado' ? 'bg-slate-400' : statusCol === 'Em Andamento' ? 'bg-blue-500' : statusCol === 'Em pausa' ? 'bg-red-500' : 'bg-green-500'
            
            return (
              <div key={statusCol} className="flex-1 min-w-[260px] bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col h-[500px]">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                    <span className="text-[13px] font-extrabold text-[#1a2332]">{statusCol}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center shadow-sm">
                    {colItems.length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 overflow-y-auto pr-1 custom-scrollbar flex-1">
                  {colItems.length === 0 ? (
                    <div className="w-full py-8 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs font-bold text-slate-400">
                      Vazio
                    </div>
                  ) : (
                    colItems.map(item => (
                      <div 
                        key={item.id} 
                        onClick={() => onSelect(item.id)}
                        className={`bg-white rounded-xl p-5 border-l-2 shadow-sm cursor-pointer hover:shadow-md transition-all flex flex-col gap-3
                          ${item.status === 'Não Iniciado' ? 'border-l-amber-500' : item.status === 'Em Andamento' ? 'border-l-red-500' : item.status === 'Em pausa' ? 'border-l-slate-200' : 'border-l-green-500'}
                        `}
                      >
                        <h4 className="font-bold text-[#1a2332] text-[13px] leading-snug group-hover:text-indigo-600 transition-colors">{item.titulo}</h4>
                        {item.tratativa_decisao && (
                          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-md w-fit flex items-center gap-1.5 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            Respondido
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold
                            ${item.urgencia === 'Alta' ? 'bg-red-50 text-red-600' : item.urgencia === 'Média' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'}
                          `}>
                            {item.urgencia}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-400 truncate">{item.setor}</span>
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
        /* Lider Table View */
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-2">
          <div className="hidden md:grid grid-cols-[2fr_1.5fr_1.2fr_1fr_1.2fr_auto] gap-4 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Nome da Não Conformidade</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Setor</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Data de Registro</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Urgência</div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</div>
            <div className="w-6"></div>
          </div>
          <div className="flex flex-col">
            {filteredGargalos.map((item, i) => (
              <div 
                key={item.id} 
                onClick={() => onSelect(item.id)}
                className={`flex flex-col md:grid md:grid-cols-[2fr_1.5fr_1.2fr_1fr_1.2fr_auto] gap-4 px-6 py-5 md:items-center cursor-pointer hover:bg-slate-50 transition-colors ${i !== filteredGargalos.length - 1 ? 'border-b border-slate-100' : ''}`}
              >
                <div className="flex flex-col md:pr-4">
                  <span className="font-bold text-[#1a2332] text-[15px] leading-tight mb-1">{item.titulo}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold text-slate-400">{item.autor_nome}</span>
                    {item.tratativa_decisao && (
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="hidden md:inline">Respondido pelo COO</span>
                        <span className="md:hidden">Respondido</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex md:hidden items-center justify-between text-xs mt-2 border-t border-slate-50 pt-3">
                  <span className="font-bold text-slate-600">{item.setor}</span>
                  <span className="font-semibold text-slate-400">{formatDate(item.data_registro)}</span>
                </div>

                <div className="hidden md:flex items-center text-sm font-bold text-slate-600">
                  {item.setor}
                </div>
                <div className="hidden md:flex items-center text-sm font-semibold text-slate-500">
                  {formatDate(item.data_registro)}
                </div>

                <div className="flex items-center justify-between md:justify-start gap-4 md:gap-0 mt-3 md:mt-0">
                  <div className="flex flex-col gap-1.5 md:contents">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-widest">Urgência</span>
                    <span className={`inline-flex items-center justify-center px-3 md:px-2.5 py-1.5 md:py-1 rounded-[0.4rem] text-[11px] font-bold uppercase tracking-wider w-fit shrink-0 whitespace-nowrap
                      ${item.urgencia === 'Alta' ? 'bg-red-50 text-red-600' : 
                        item.urgencia === 'Média' ? 'bg-amber-50 text-amber-600' : 
                        'bg-green-50 text-green-600'}`}>
                      {item.urgencia}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 md:contents">
                    <span className="md:hidden text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right md:text-left">Status</span>
                    <span className={`inline-flex items-center gap-2 px-3 md:px-3.5 py-1.5 rounded-full text-[12px] font-bold w-fit ml-auto md:ml-0 shrink-0 whitespace-nowrap
                      ${item.status === 'Em Andamento' ? 'bg-blue-50 text-blue-600' : 
                        item.status === 'Não Iniciado' ? 'bg-slate-100 text-slate-600' : 
                        item.status === 'Em pausa' ? 'bg-red-50 text-red-600' : 
                        item.status === 'Resolvido' ? 'bg-green-50 text-green-600' :
                        'bg-slate-100 text-slate-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'Em Andamento' ? 'bg-blue-500' : 
                        item.status === 'Não Iniciado' ? 'bg-slate-400' : 
                        item.status === 'Em pausa' ? 'bg-red-500' : 
                        item.status === 'Resolvido' ? 'bg-green-500' : 'bg-slate-400'
                      }`}></div>
                      {item.status}
                    </span>
                  </div>
                </div>
                
                <div className="hidden md:flex items-center justify-end">
                  <ChevronRight size={18} className="text-slate-300" strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Create Modal */}
      {isCreateModalOpen && (
        <GopCreateModal 
          userSector={userSector}
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={() => {
            setIsCreateModalOpen(false)
            fetchGargalos()
          }}
        />
      )}
    </div>
  )
}

