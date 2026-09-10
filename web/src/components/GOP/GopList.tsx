import React, { useEffect, useState, useRef } from 'react'
import { Plus, Search, ChevronDown, ChevronUp, ChevronRight, LayoutGrid, List, Loader2, CheckCircle2, Timer, BarChart3, Filter, Building2, PieChart, FileText, ShieldCheck, User, Calendar } from 'lucide-react'
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
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({})
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

    const sectorLower = (userSector || '').toLowerCase()
    const isGestorOrDiretoria = 
      sectorLower.includes('gestor') || 
      sectorLower.includes('diretoria') || 
      userRole === 'coo' || 
      sectorLower.includes('operac')

    if (userRole === 'lider' && userSector && !isGestorOrDiretoria) {
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
    if (!dateString) return ''
    const d = new Date(dateString)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).replace('.', '')
  }

  const toggleExpandColumn = (colId: string) => {
    setExpandedColumns((prev) => ({ ...prev, [colId]: !prev[colId] }))
  }

  // Derive filter options from data
  const setores = ['Todos', ...Array.from(new Set(gargalos.map(g => g.setor).filter(Boolean)))]
  const urgencias = ['Todas', 'Alta', 'Média', 'Baixa']
  const statusOptions = ['Todos', 'Não Iniciado', 'Em Andamento', 'Em pausa', 'Resolvido']

  const KANBAN_COLUMNS: { id: string; label: string; bg: string; text: string; border: string; badgeBg: string }[] = [
    {
      id: 'Não Iniciado',
      label: 'Não Iniciado',
      bg: 'bg-amber-50/80',
      text: 'text-amber-900',
      border: 'border-amber-200',
      badgeBg: 'bg-amber-500 text-white'
    },
    {
      id: 'Em Andamento',
      label: 'Em Tratativa',
      bg: 'bg-blue-50/80',
      text: 'text-blue-900',
      border: 'border-blue-200',
      badgeBg: 'bg-blue-600 text-white'
    },
    {
      id: 'Em pausa',
      label: 'Em Pausa',
      bg: 'bg-purple-50/80',
      text: 'text-purple-900',
      border: 'border-purple-200',
      badgeBg: 'bg-purple-600 text-white'
    },
    {
      id: 'Resolvido',
      label: 'Resolvido',
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-900',
      border: 'border-emerald-200',
      badgeBg: 'bg-emerald-600 text-white'
    }
  ]

  // Filter the list
  const filteredGargalos = gargalos.filter(g => {
    const matchesSearch = (g.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (g.autor_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (g.descricao || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    if (g.setor) {
      acc[g.setor] = (acc[g.setor] || 0) + 1
    }
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
    <div className="p-3 sm:p-4 md:p-6 pb-20 space-y-5 w-full max-w-none">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {userRole === 'coo' ? (
            <>
              <p className="text-indigo-600 font-bold text-xs uppercase tracking-widest mb-1">Fila de Revisão - COO</p>
              <h1 className="text-3xl font-extrabold text-[#1a2332] tracking-tight">Não Conformidades aguardando tratativa</h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">Selecione um relato para revisar evidências e registrar tratativas operacionais.</p>
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
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#1b497d] hover:bg-[#12345b] text-white font-bold text-xs py-2.5 px-5 rounded-xl flex items-center justify-center w-full md:w-auto gap-2 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            Reportar Nova Não Conformidade
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {userRole === 'coo' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1.5fr] gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 text-[13px] font-bold">
              <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                <Search size={12} strokeWidth={3} />
              </div>
              Aguardando tratativa
            </div>
            <span className="text-3xl font-extrabold text-[#1a2332]">{aguardandoTratativa}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 text-[13px] font-bold">
              <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                <Search size={12} strokeWidth={3} />
              </div>
              Alta urgência
            </div>
            <span className="text-3xl font-extrabold text-[#1a2332]">{altaUrgencia}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-[120px]">
            <div className="flex items-center gap-2 text-slate-500 text-[13px] font-bold">
              <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full border-2 border-amber-500 flex items-center justify-center"><div className="w-4 h-0.5 bg-amber-500 rotate-45"></div></div>
              </div>
              Em pausa
            </div>
            <span className="text-3xl font-extrabold text-[#1a2332]">{bloqueados}</span>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-[120px]">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total reportado', value: gargalos.length, color: 'bg-slate-400' },
            { label: 'Em andamento', value: gargalos.filter(g => g.status === 'Em Andamento').length, color: 'bg-blue-500' },
            { label: 'Em pausa', value: gargalos.filter(g => g.status === 'Em pausa').length, color: 'bg-purple-500' },
            { label: 'Resolvido', value: resolvidos, color: 'bg-green-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2.5 h-2.5 rounded-full ${stat.color}`}></div>
                <span className="text-xs font-extrabold text-slate-500 tracking-wide uppercase">{stat.label}</span>
              </div>
              <span className="text-3xl font-extrabold text-[#1a2332]">{stat.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Dashboard KPI Metrics */}
      {hasMetricsAccess && (
        <div className="space-y-3 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs">
          {/* Header das Métricas com Filtro de Período */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#1b497d]/10 text-[#1b497d] border border-[#1b497d]/20 flex items-center justify-center font-bold">
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
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 hover:border-[#1b497d]/40 px-3 py-1.5 rounded-xl transition-all self-start sm:self-auto cursor-pointer">
              <Filter size={14} className="text-[#1b497d] shrink-0" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Período:</span>
              <select
                value={metricsPeriod}
                onChange={(e) => setMetricsPeriod(e.target.value as any)}
                className="bg-transparent text-xs font-extrabold text-[#1b497d] outline-none cursor-pointer pr-1"
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
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shrink-0">
                <Timer size={18} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">Tempo Médio de Solução</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {totalResolvidos.length > 0 ? formatDurationShort(avgResolutionMinutes) : 'N/A'}
                </span>
              </div>
            </div>

            {/* Card 2: Total de Não Conformidades */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">Total de NCOs</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {totalNcoCount}
                </span>
              </div>
            </div>

            {/* Card 3: Resolvidos Sem Diretoria */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 size={18} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">Resolvidos s/ Diretoria</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {resolvidosSemDiretoria.length} <span className="text-xs font-medium text-slate-400">/ {totalResolvidos.length}</span>
                </span>
              </div>
            </div>

            {/* Card 4: Resolvidos Com Diretoria */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold shrink-0">
                <Building2 size={18} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">Resolvidos c/ Diretoria</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {resolvidosComDiretoria.length} <span className="text-xs font-medium text-slate-400">/ {totalResolvidos.length}</span>
                </span>
              </div>
            </div>

            {/* Card 5: % Resolvidos Sem Diretoria */}
            <div className="bg-slate-50/80 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center gap-3 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold shrink-0">
                <PieChart size={18} />
              </div>
              <div className="min-w-0 flex-1 flex flex-col justify-center">
                <span className="text-[11px] font-bold text-slate-500 leading-tight block mb-0.5 whitespace-normal">% Solução s/ Diretoria</span>
                <span className="text-sm font-extrabold text-slate-800 leading-tight block">
                  {percentSemDiretoria}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar Unificada de Busca e Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Lado Esquerdo: Busca por texto */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar por título, autor ou descrição da não conformidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#1b497d] transition-all"
          />
        </div>

        {/* Lado Direito: View Switcher & Filtros */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
          {/* Alternador Quadro Kanban / Lista */}
          <div className="bg-[#fafbfe] border border-[#e6e9f2] p-1 rounded-xl flex items-center shrink-0">
            <button 
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${viewMode === 'kanban' ? 'bg-[#1b497d] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <LayoutGrid size={14} />
              <span>Quadro Kanban</span>
            </button>
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${viewMode === 'list' ? 'bg-[#1b497d] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
            >
              <List size={14} />
              <span>Lista</span>
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200 hidden md:block" />

          {/* Select Setor */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Filter size={14} className="text-slate-400" />
            <select 
              value={filterSetor}
              onChange={(e) => setFilterSetor(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              {setores.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos os setores' : s}</option>)}
            </select>
          </div>

          {/* Select Urgência */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select 
              value={filterUrgencia}
              onChange={(e) => setFilterUrgencia(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              {urgencias.map(u => <option key={u} value={u}>{u === 'Todas' ? 'Todas as urgências' : `Urgência ${u}`}</option>)}
            </select>
          </div>

          {/* Select Status */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none cursor-pointer"
            >
              {statusOptions.map(s => <option key={s} value={s}>{s === 'Todos' ? 'Todos os status' : s}</option>)}
            </select>
          </div>

          {/* Badge de Contador */}
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-extrabold shrink-0 border border-slate-200/60">
            {filteredGargalos.length} relato(s)
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-white rounded-2xl shadow-xs border border-slate-200">
          <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#1b497d]" />
          <span className="text-sm font-bold">Carregando não conformidades...</span>
        </div>
      ) : filteredGargalos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Search size={24} />
          </div>
          <h4 className="font-bold text-slate-700 text-sm">Nenhuma não conformidade encontrada</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Tente ajustar os termos da busca ou selecione outros filtros de setor/urgência.
          </p>
          {userRole === 'lider' && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 px-4 py-2 bg-[#1b497d] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Reportar Nova Não Conformidade</span>
            </button>
          )}
        </div>
      ) : viewMode === 'kanban' ? (
        /* QUADRO KANBAN (4 Colunas Fluidas 100% Largura) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
          {KANBAN_COLUMNS.map((col) => {
            const columnItems = filteredGargalos.filter((g) => g.status === col.id)
            const isResolvido = col.id === 'Resolvido'
            const isExpanded = !!expandedColumns[col.id]
            const displayedItems = isResolvido
              ? columnItems.slice(0, 3)
              : isExpanded
              ? columnItems
              : columnItems.slice(0, 3)
            const hasMore = !isResolvido && columnItems.length > 3

            return (
              <div 
                key={col.id}
                className="bg-white rounded-2xl border border-[#e2e8f0] p-3 md:p-3.5 flex flex-col gap-3 min-h-[400px] shadow-xs w-full min-w-0"
              >
                {/* Header da Coluna */}
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
                <div className="flex flex-col gap-3 flex-1">
                  {columnItems.length === 0 ? (
                    <div className="p-6 border border-dashed border-slate-200 rounded-xl text-center flex flex-col items-center justify-center my-auto text-slate-400">
                      <span className="text-xs font-medium">Vazio</span>
                    </div>
                  ) : (
                    displayedItems.map((item) => {
                      const durMinutes = getGargaloDurationMinutes(item)
                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelect(item.id)}
                          className="bg-white hover:bg-slate-50 border border-[#e2e8f0] hover:border-[#1b497d]/40 rounded-xl p-4 shadow-xs transition-all cursor-pointer flex flex-col justify-between gap-3 group"
                        >
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 text-[9px] font-bold rounded flex items-center gap-1 w-max ${
                              item.urgencia === 'Alta' ? 'bg-red-100 text-red-800' :
                              item.urgencia === 'Média' ? 'bg-amber-100 text-amber-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              Urgência {item.urgencia}
                            </span>

                            {(item.tratativa_autor_badge || item.tratativa_decisao || item.status === 'Resolvido' || item.status === 'Em Andamento') && (
                              <span className="px-2 py-0.5 text-[9px] font-extrabold rounded flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 size={10} /> Respondido
                              </span>
                            )}
                          </div>

                          <div>
                            <h4 className="font-display font-bold text-sm text-[#1e293b] group-hover:text-[#1b497d] transition-colors leading-snug line-clamp-2">
                              {item.titulo}
                            </h4>
                            {item.descricao && (
                              <p className="text-xs text-[#475569] leading-relaxed line-clamp-2 mt-1">
                                {item.descricao}
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[11px] text-[#475569]">
                              <span className="flex items-center gap-1 font-semibold truncate max-w-[140px]">
                                <User size={12} /> {item.autor_nome || 'Anônimo'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {item.setor}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 flex-wrap gap-1">
                              <span className="flex items-center gap-1">
                                <Calendar size={11} /> {formatDate(item.data_registro || item.created_at)}
                              </span>

                              {durMinutes > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 bg-indigo-50 text-indigo-800 border border-indigo-200">
                                  <Timer size={10} /> {formatDurationShort(durMinutes)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}

                  {/* Indicador para a coluna Resolvido se houver mais de 3 */}
                  {isResolvido && columnItems.length > 3 && (
                    <span className="text-[10px] text-slate-400 text-center font-semibold pt-1">
                      Exibindo os 3 mais recentes
                    </span>
                  )}

                  {/* Botão Ver mais / Ver menos para outras colunas */}
                  {hasMore && (
                    <button
                      type="button"
                      onClick={() => toggleExpandColumn(col.id)}
                      className="mt-1 w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-[#1b497d] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          <span>Ver menos</span>
                          <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          <span>Ver mais ({columnItems.length - 3} restantes)</span>
                          <ChevronDown size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* Modo Lista / Tabela Operacional */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
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
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="hidden md:inline">Respondido pelo COO</span>
                        <span className="md:hidden">Respondido</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex md:hidden items-center justify-between text-xs mt-2 border-t border-slate-50 pt-3">
                  <span className="font-bold text-slate-600">{item.setor}</span>
                  <span className="font-semibold text-slate-400">{formatDate(item.data_registro || item.created_at)}</span>
                </div>

                <div className="hidden md:flex items-center text-sm font-bold text-slate-600">
                  {item.setor}
                </div>
                <div className="hidden md:flex items-center text-sm font-semibold text-slate-500">
                  {formatDate(item.data_registro || item.created_at)}
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
                        item.status === 'Não Iniciado' ? 'bg-amber-50 text-amber-700' : 
                        item.status === 'Em pausa' ? 'bg-purple-50 text-purple-600' : 
                        item.status === 'Resolvido' ? 'bg-green-50 text-green-600' :
                        'bg-slate-100 text-slate-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        item.status === 'Em Andamento' ? 'bg-blue-500' : 
                        item.status === 'Não Iniciado' ? 'bg-amber-500' : 
                        item.status === 'Em pausa' ? 'bg-purple-500' : 
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

