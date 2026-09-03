import React, { useEffect, useState, useRef } from 'react'
import { Plus, Search, ChevronDown, ChevronRight, LayoutGrid, List, Loader2, CheckCircle2, Timer, BarChart3, Filter, Building2, PieChart, FileText, ShieldCheck } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { GopCreateModal } from './GopCreateModal'

const formatDurationShort = (minutes: number): string => {
  if (minutes < 1) return '< 1 min'
  const days = Math.floor(minutes / (60 * 24))
  const hours = Math.floor((minutes % (60 * 24)) / 60)
  const mins = minutes % 60

  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`)

  return parts.join(' ')
}

const isDiretoriaEscalated = (g: any): boolean => {
  const setorLower = (g.setor || '').toLowerCase()
  const sugestaoLower = (g.sugestao_lider || '').toLowerCase()
  const badgeLower = (g.tratativa_autor_badge || '').toLowerCase()

  return (
    setorLower.includes('diretoria') ||
    setorLower.includes('coo') ||
    sugestaoLower.includes('diretoria') ||
    sugestaoLower.includes('coo') ||
    sugestaoLower.includes('gestor/diretoria') ||
    badgeLower.includes('diretoria') ||
    badgeLower.includes('diogo') ||
    badgeLower.includes('coo')
  )
}

const getGargaloDurationMinutes = (g: any): number => {
  // Chamados/NCOs aguardando aprovação não entram na base de tempo de solução
  const statusLower = (g.status || '').toLowerCase()
  if (statusLower.includes('aprovac') || statusLower.includes('aprovação') || statusLower === 'pendente_aprovacao') {
    return 0
  }
  const startMs = new Date(g.data_registro || g.created_at || g.data_ocorrencia).getTime()
  if (isNaN(startMs)) return 0
  const endMs = g.updated_at ? new Date(g.updated_at).getTime() : Date.now()
  return Math.max(0, Math.floor((endMs - startMs) / (1000 * 60)))
}

interface GopListProps {
  onSelect: (id: string) => void
  userRole: 'lider' | 'coo' | 'demandas'
  userSector?: string
}

export const GopList: React.FC<GopListProps> = ({ onSelect, userRole, userSector }) => {
  const [gargalos, setGargalos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter & Dashboard states
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSetor, setFilterSetor] = useState('Todos')
  const [filterUrgencia, setFilterUrgencia] = useState('Todas')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [metricsPeriod, setMetricsPeriod] = useState<'24h' | '7d' | '30d' | '3m' | '6m' | 'todos'>('todos')
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

  // Filtragem por Período para o Dashboard NCO
  const periodGargalos = gargalos.filter(g => {
    if (metricsPeriod === 'todos') return true
    const regDateStr = g.data_registro || g.created_at || g.data_ocorrencia
    const createdMs = new Date(regDateStr).getTime()
    if (isNaN(createdMs)) return true
    const diffMs = Date.now() - createdMs
    if (metricsPeriod === '24h') return diffMs <= 24 * 60 * 60 * 1000
    if (metricsPeriod === '7d') return diffMs <= 7 * 24 * 60 * 60 * 1000
    if (metricsPeriod === '30d') return diffMs <= 30 * 24 * 60 * 60 * 1000
    if (metricsPeriod === '3m') return diffMs <= 90 * 24 * 60 * 60 * 1000
    if (metricsPeriod === '6m') return diffMs <= 180 * 24 * 60 * 60 * 1000
    return true
  })

  // Base de Cálculo do Dashboard NCO (Exclui chamados/NCOs aguardando aprovação)
  const ncoBaseGargalos = periodGargalos.filter(g => {
    const statusLower = (g.status || '').toLowerCase()
    return !statusLower.includes('aprovac') && !statusLower.includes('aprovação') && statusLower !== 'pendente_aprovacao'
  })

  // Cálculos do Dashboard NCO
  const totalNcoCount = ncoBaseGargalos.length
  const totalResolvidos = ncoBaseGargalos.filter(g => g.status === 'Resolvido')

  const resolvidosSemDiretoria = totalResolvidos.filter(g => !isDiretoriaEscalated(g))
  const resolvidosComDiretoria = totalResolvidos.filter(g => isDiretoriaEscalated(g))

  const totalResolutionMinutes = totalResolvidos.reduce((acc, g) => acc + getGargaloDurationMinutes(g), 0)
  const avgResolutionMinutes = totalResolvidos.length > 0 ? Math.round(totalResolutionMinutes / totalResolvidos.length) : 0

  const percentSemDiretoria = totalResolvidos.length > 0 
    ? Math.round((resolvidosSemDiretoria.length / totalResolvidos.length) * 100) 
    : 0

  const aguardandoTratativa = gargalos.filter(g => g.status === 'Não Iniciado' || g.status === 'Em Andamento').length
  const altaUrgencia = gargalos.filter(g => g.urgencia === 'Alta').length
  const bloqueados = gargalos.filter(g => g.status === 'Em pausa').length
  const resolvidos = gargalos.filter(g => g.status === 'Resolvido').length

  // Calculate Sector distribution
  const setorCounts = gargalos.reduce((acc: any, g) => {
    acc[g.setor] = (acc[g.setor] || 0) + 1
    return acc
  }, {})
  const maxSetorCount = Math.max(...Object.values(setorCounts) as number[], 1)

  // Permissão de Acesso às Métricas: Apenas Líder de Operações, Qualidade e Gestor/COO/Diretoria
  const hasMetricsAccess = (() => {
    if (userRole === 'coo') return true
    const sectorLower = (userSector || '').toLowerCase()
    return (
      sectorLower.includes('operaç') ||
      sectorLower.includes('operac') ||
      sectorLower.includes('qualidade') ||
      sectorLower.includes('gestor') ||
      sectorLower.includes('diretoria')
    )
  })()

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
          
          <div className="bg-white rounded-2xl p-4.5 border border-slate-100 shadow-xs flex flex-col justify-between min-h-[120px] lg:col-span-1 md:col-span-2">
            <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 block">Não Conformidades por Setor</span>
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[130px] pr-1 custom-scrollbar">
              {Object.entries(setorCounts)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .map(([setor, count]: [string, any]) => (
                  <div key={setor} className="flex items-center gap-3">
                    <span className="text-[11px] font-extrabold text-slate-600 w-28 truncate" title={setor}>{setor}</span>
                    <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500" style={{ width: `${(count / maxSetorCount) * 100}%` }}></div>
                    </div>
                    <span className="text-[12px] font-black text-slate-800 w-5 text-right shrink-0">{count}</span>
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

      {/* Dashboard KPI Metrics (Apenas Visível para Líder de Operações, Qualidade e Gestor/COO/Diretoria) */}
      {hasMetricsAccess && (
        <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs mt-2">
          {/* Header das Métricas com Filtro de Período */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold">
                <BarChart3 size={18} />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  Dashboard & Métricas NCO
                </h4>
                <span className="text-[10px] text-slate-400 font-medium block">
                  Indicadores de tempo e resolutividade por nível de decisão
                </span>
              </div>
            </div>

            {/* Seletor de Período */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-indigo-500/40 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer">
              <Filter size={14} className="text-indigo-600 shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Período:</span>
              <select
                value={metricsPeriod}
                onChange={(e) => setMetricsPeriod(e.target.value as any)}
                className="bg-transparent text-xs font-extrabold text-indigo-900 outline-none cursor-pointer pr-1"
              >
                <option value="24h">Últimas 24 Horas</option>
                <option value="7d">Últimos 7 Dias</option>
                <option value="30d">Últimos 30 Dias</option>
                <option value="3m">Últimos 3 Meses</option>
                <option value="6m">Últimos 6 Meses</option>
                <option value="todos">Todo o Período (Histórico Completo)</option>
              </select>
            </div>
          </div>

          {/* Grade de 5 Cards Principais */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
            {/* Card 1: Tempo Médio de Solução */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shrink-0">
                <Timer size={20} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">Tempo Médio de Solução</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {totalResolvidos.length > 0 ? formatDurationShort(avgResolutionMinutes) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Card 2: Total de Não Conformidades */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0">
                <FileText size={20} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">Total de Não Conformidades</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {totalNcoCount}
                </span>
              </div>
            </div>

            {/* Card 3: Resolvidos Sem Diretoria */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">Resolvidos sem Diretoria</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {resolvidosSemDiretoria.length} <span className="text-xs font-medium text-slate-400">/ {totalResolvidos.length}</span>
                </span>
              </div>
            </div>

            {/* Card 4: Resolvidos Com Diretoria */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold shrink-0">
                <Building2 size={20} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">Resolvidos com Diretoria</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {resolvidosComDiretoria.length} <span className="text-xs font-medium text-slate-400">/ {totalResolvidos.length}</span>
                </span>
              </div>
            </div>

            {/* Card 5: % Resolvidos Sem Diretoria */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold shrink-0">
                <PieChart size={20} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">% Solução sem Diretoria</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {percentSemDiretoria}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar Unificada de Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
        {/* Lado Esquerdo: Alternador de Visualização & Campo de Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Toggle View Mode */}
          <div className="bg-[#fafbfe] border border-[#e6e9f2] p-1 rounded-xl flex items-center shrink-0">
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${viewMode === 'list' ? 'bg-[#1a2332] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <List size={14} /> <span>{userRole === 'coo' ? 'Cards' : 'Tabela'}</span>
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${viewMode === 'kanban' ? 'bg-[#1a2332] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <LayoutGrid size={14} /> <span>{userRole === 'coo' ? 'Lista' : 'Kanban'}</span>
            </button>
          </div>
          
          {/* Input de Busca */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar não conformidade..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Lado Direito: Seletores de Filtro e Contador de Resultados */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Select Setor */}
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={filterSetor}
              onChange={(e) => setFilterSetor(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              {setores.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos os setores' : s}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>

          {/* Select Urgência */}
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={filterUrgencia}
              onChange={(e) => setFilterUrgencia(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              {urgencias.map(u => <option key={u} value={u}>{u === 'Todas' ? 'Toda urgência' : u}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>

          {/* Select Status */}
          <div className="relative flex-1 sm:flex-initial">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 w-full bg-slate-50 hover:bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              {statusOptions.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todo status' : s}</option>)}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2.5} />
          </div>

          {/* Badge de Contador de Resultados */}
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-extrabold shrink-0 border border-slate-200/60">
            {filteredGargalos.length} resultado(s)
          </span>
        </div>
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
              
              {(item.tratativa_autor_badge || item.tratativa_decisao || item.status === 'Resolvido' || item.status === 'Em Andamento') && (
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1 w-max block">
                  ✓ {item.tratativa_autor_badge || 'Respondido pelo Gestor de Operações'}
                </span>
              )}
              
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
              <div key={statusCol} className="flex-1 min-w-[260px] bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>
                    <span className="text-[13px] font-extrabold text-[#1a2332]">{statusCol}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center shadow-sm">
                    {colItems.length}
                  </span>
                </div>
                
                <div className="flex flex-col gap-3 pr-1">
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

