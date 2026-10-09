import { useState, useEffect } from 'react'
import { 
  Activity, Clock, MessageSquare, ThumbsDown, ChevronLeft, 
  ShieldCheck, RefreshCw, Monitor, AlertTriangle, Layers, 
  CheckCircle2, Wrench, BarChart3, TrendingUp, Users 
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AnimatedMetricCard } from './AnimatedMetricCard'
import { AnimatedProgressBar } from './AnimatedProgressBar'
import { 
  fetchUnifiedExecutiveMetrics, 
  type UnifiedExecutiveMetrics 
} from '../../lib/metrics-service'

type TabType = 'geral' | 'ti' | 'nco' | 'ai'

interface AdminDashboardProps {
  onBack?: () => void
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('geral')
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<UnifiedExecutiveMetrics>({
    ti: {
      total: 0,
      concluidos: 0,
      emAtendimento: 0,
      pendentesAprovacao: 0,
      taxaConclusao: 0,
      tempoMedioMinutos: 0,
      porSetor: [],
    },
    nco: {
      total: 0,
      resolvidos: 0,
      emAndamento: 0,
      naoIniciados: 0,
      taxaResolucao: 0,
      porSetor: [],
    },
    ai: {
      processedOrders: 0,
      timeSavedMinutes: 0,
      positiveRate: 100,
      positiveCount: 0,
      feedbacks: [],
      topInsurances: [],
    },
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchUnifiedExecutiveMetrics()
      setMetrics(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const aiHours = Math.floor(metrics.ai.timeSavedMinutes / 60)
  const aiMinutes = metrics.ai.timeSavedMinutes % 60

  const maxTiSector = metrics.ti.porSetor.length > 0
    ? Math.max(...metrics.ti.porSetor.map((s) => s.value), 1)
    : 1

  const maxNcoSector = metrics.nco.porSetor.length > 0
    ? Math.max(...metrics.nco.porSetor.map((s) => s.value), 1)
    : 1

  const maxAiInsurance = metrics.ai.topInsurances.length > 0
    ? Math.max(...metrics.ai.topInsurances.map((i) => i.value), 1)
    : 1

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header Corporativo Executivo */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Painel Executivo de Operações</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                <ShieldCheck size={13} /> Supabase Ao Vivo
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              Indicadores consolidados em tempo real de <strong>Suporte T.I</strong>, <strong>NCO (GOP)</strong> e <strong>Inteligência Artificial</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-xs"
              title="Atualizar dados do Supabase"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-[#1f29de]' : ''} />
            </button>
            <button 
              onClick={() => onBack ? onBack() : window.history.back()} 
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <ChevronLeft size={16} /> Voltar ao Menu
            </button>
          </div>
        </motion.div>

        {/* Barra de Navegação por Abas */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('geral')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'geral'
                ? 'bg-[#1f29de] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            📊 Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('ti')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ti'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            💻 Chamados T.I ({metrics.ti.total})
          </button>
          <button
            onClick={() => setActiveTab('nco')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'nco'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            ⚠️ NCO / Gargalos ({metrics.nco.total})
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'ai'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/70'
            }`}
          >
            🤖 Inteligência Artificial (MedIA)
          </button>
        </div>

        {/* Conteúdo Dinâmico com Animações */}
        <AnimatePresence mode="wait">

          {/* ================= ABA 1: VISÃO GERAL ================= */}
          {activeTab === 'geral' && (
            <motion.div
              key="tab-geral"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <AnimatedMetricCard
                  title="Chamados de T.I"
                  value={metrics.ti.total}
                  subtitle={`${metrics.ti.concluidos} resolvidos • ${metrics.ti.emAtendimento} em fila`}
                  icon={<Monitor size={24} />}
                  iconBgColor="bg-purple-50"
                  iconTextColor="text-purple-600"
                  delay={0.1}
                  trend={{ value: `${metrics.ti.taxaConclusao}% concluídos`, isPositive: metrics.ti.taxaConclusao >= 70 }}
                />

                <AnimatedMetricCard
                  title="Não Conformidades (NCO)"
                  value={metrics.nco.total}
                  subtitle={`${metrics.nco.resolvidos} tratadas • ${metrics.nco.emAndamento} em andamento`}
                  icon={<AlertTriangle size={24} />}
                  iconBgColor="bg-amber-50"
                  iconTextColor="text-amber-600"
                  delay={0.2}
                  trend={{ value: `${metrics.nco.taxaResolucao}% resolução`, isPositive: metrics.nco.taxaResolucao >= 65 }}
                />

                <AnimatedMetricCard
                  title="Tempo Poupado pela IA"
                  value={aiHours}
                  suffix={`h ${aiMinutes}m`}
                  subtitle={`${metrics.ai.processedOrders} guias e atendimentos processados`}
                  icon={<Clock size={24} />}
                  iconBgColor="bg-blue-50"
                  iconTextColor="text-blue-600"
                  delay={0.3}
                  trend={{ value: `${metrics.ai.positiveRate}% acurácia`, isPositive: metrics.ai.positiveRate >= 90 }}
                />
              </div>

              {/* Seção 2 Colunas: Resumo de T.I e NCO */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Distribuição de Chamados por Setor */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <Monitor size={18} className="text-purple-600" /> Top Setores Solicitantes (T.I)
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">Total: {metrics.ti.total}</span>
                  </div>
                  <div className="space-y-3.5">
                    {metrics.ti.porSetor.slice(0, 5).map((sec, idx) => (
                      <AnimatedProgressBar
                        key={`ti-${sec.name}-${idx}`}
                        label={sec.name}
                        value={sec.value}
                        maxValue={maxTiSector}
                        colorClass={sec.color}
                        delay={0.2 + idx * 0.05}
                      />
                    ))}
                  </div>
                </div>

                {/* Distribuição de NCO por Setor */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <AlertTriangle size={18} className="text-amber-600" /> Não Conformidades por Setor
                    </h3>
                    <span className="text-xs font-semibold text-slate-400">Total: {metrics.nco.total}</span>
                  </div>
                  <div className="space-y-3.5">
                    {metrics.nco.porSetor.slice(0, 5).map((sec, idx) => (
                      <AnimatedProgressBar
                        key={`nco-${sec.name}-${idx}`}
                        label={sec.name}
                        value={sec.value}
                        maxValue={maxNcoSector}
                        colorClass={sec.color}
                        delay={0.25 + idx * 0.05}
                      />
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* ================= ABA 2: CHAMADOS T.I ================= */}
          {activeTab === 'ti' && (
            <motion.div
              key="tab-ti"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatedMetricCard
                  title="Total de Chamados"
                  value={metrics.ti.total}
                  icon={<Monitor size={22} />}
                  iconBgColor="bg-purple-50"
                  iconTextColor="text-purple-600"
                  delay={0.1}
                />
                <AnimatedMetricCard
                  title="Concluídos com Êxito"
                  value={metrics.ti.concluidos}
                  icon={<CheckCircle2 size={22} />}
                  iconBgColor="bg-emerald-50"
                  iconTextColor="text-emerald-600"
                  delay={0.15}
                  trend={{ value: `${metrics.ti.taxaConclusao}% taxa`, isPositive: true }}
                />
                <AnimatedMetricCard
                  title="Em Atendimento"
                  value={metrics.ti.emAtendimento}
                  icon={<Wrench size={22} />}
                  iconBgColor="bg-blue-50"
                  iconTextColor="text-blue-600"
                  delay={0.2}
                />
                <AnimatedMetricCard
                  title="Tempo Médio Resolução"
                  value={metrics.ti.tempoMedioMinutos}
                  suffix=" min"
                  icon={<Clock size={22} />}
                  iconBgColor="bg-amber-50"
                  iconTextColor="text-amber-600"
                  delay={0.25}
                />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-6">Volume de Requisições por Setor Solicitante</h3>
                <div className="space-y-4">
                  {metrics.ti.porSetor.map((sec, idx) => (
                    <AnimatedProgressBar
                      key={`tab-ti-${sec.name}-${idx}`}
                      label={sec.name}
                      value={sec.value}
                      maxValue={maxTiSector}
                      colorClass={sec.color}
                      delay={0.1 + idx * 0.05}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= ABA 3: NCO / GARGALOS ================= */}
          {activeTab === 'nco' && (
            <motion.div
              key="tab-nco"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <AnimatedMetricCard
                  title="Não Conformidades"
                  value={metrics.nco.total}
                  icon={<AlertTriangle size={22} />}
                  iconBgColor="bg-rose-50"
                  iconTextColor="text-rose-600"
                  delay={0.1}
                />
                <AnimatedMetricCard
                  title="Resolvidas / Tratadas"
                  value={metrics.nco.resolvidos}
                  icon={<CheckCircle2 size={22} />}
                  iconBgColor="bg-emerald-50"
                  iconTextColor="text-emerald-600"
                  delay={0.15}
                  trend={{ value: `${metrics.nco.taxaResolucao}% taxa`, isPositive: true }}
                />
                <AnimatedMetricCard
                  title="Em Andamento"
                  value={metrics.nco.emAndamento}
                  icon={<Layers size={22} />}
                  iconBgColor="bg-amber-50"
                  iconTextColor="text-amber-600"
                  delay={0.2}
                />
                <AnimatedMetricCard
                  title="Aguardando Ação"
                  value={metrics.nco.naoIniciados}
                  icon={<Clock size={22} />}
                  iconBgColor="bg-slate-100"
                  iconTextColor="text-slate-600"
                  delay={0.25}
                />
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-800 mb-6">Incidência de Gargalos e Não Conformidades por Setor</h3>
                <div className="space-y-4">
                  {metrics.nco.porSetor.map((sec, idx) => (
                    <AnimatedProgressBar
                      key={`tab-nco-${sec.name}-${idx}`}
                      label={sec.name}
                      value={sec.value}
                      maxValue={maxNcoSector}
                      colorClass={sec.color}
                      delay={0.1 + idx * 0.05}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= ABA 4: INTELIGÊNCIA ARTIFICIAL ================= */}
          {activeTab === 'ai' && (
            <motion.div
              key="tab-ai"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <AnimatedMetricCard
                  title="Guias & Mensagens Processadas"
                  value={metrics.ai.processedOrders}
                  icon={<Activity size={24} />}
                  iconBgColor="bg-blue-50"
                  iconTextColor="text-blue-600"
                  delay={0.1}
                />
                <AnimatedMetricCard
                  title="Tempo Humano Economizado"
                  value={aiHours}
                  suffix={`h ${aiMinutes}m`}
                  icon={<Clock size={24} />}
                  iconBgColor="bg-emerald-50"
                  iconTextColor="text-emerald-600"
                  delay={0.2}
                />
                <AnimatedMetricCard
                  title="Taxa de Acerto (Feedbacks)"
                  value={metrics.ai.positiveRate}
                  suffix="%"
                  icon={<MessageSquare size={24} />}
                  iconBgColor="bg-purple-50"
                  iconTextColor="text-purple-600"
                  delay={0.3}
                  trend={{ value: `${metrics.ai.positiveCount} positivos`, isPositive: metrics.ai.positiveRate >= 90 }}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="text-base font-bold text-slate-800 mb-6">Top Convênios Processados</h3>
                  <div className="space-y-4">
                    {metrics.ai.topInsurances.map((item, idx) => (
                      <AnimatedProgressBar
                        key={`ai-ins-${item.name}-${idx}`}
                        label={item.name}
                        value={item.value}
                        maxValue={maxAiInsurance}
                        colorClass={item.color}
                        delay={0.1 + idx * 0.05}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
                  <h3 className="text-base font-bold text-slate-800 mb-4">Ajustes & Feedbacks dos Colaboradores</h3>
                  <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
                    {metrics.ai.feedbacks.filter(f => f.type === 'down' || f.comment).map((fb, idx) => (
                      <div key={fb.id ? `${fb.id}-${idx}` : `fb-item-${idx}`} className="p-4 rounded-xl bg-red-50/50 border border-red-100 flex gap-4 items-start">
                        <ThumbsDown size={16} className="text-red-500 mt-0.5 shrink-0"/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700">{fb.comment || "Feedback de ajuste reportado."}</p>
                          <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">{fb.messagePreview}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-300 shrink-0 whitespace-nowrap">
                          {new Date(fb.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))}
                    {metrics.ai.feedbacks.filter(f => f.type === 'down' || f.comment).length === 0 && (
                      <div className="text-center py-10 text-slate-400 text-sm font-medium">Nenhum feedback negativo registrado recentemente!</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  )
}
