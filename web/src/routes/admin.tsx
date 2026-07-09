import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Activity, Clock, MessageSquare, ThumbsUp, ThumbsDown, ChevronLeft } from 'lucide-react'

export const Route = createFileRoute('/admin')({
  component: AdminDashboard,
})

function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    processedOrders: 0,
    timeSavedMinutes: 0,
    feedbacks: [] as any[]
  })

  useEffect(() => {
    // Busca contador real de guias lidas pelo ChatWidget.tsx
    const orders = parseInt(localStorage.getItem('media_processed_orders') || '0', 10)
    
    // Como é um protótipo, adicionamos uma base de 142 guias mockadas
    // para o gráfico não parecer vazio na demonstração + as guias reais recém testadas.
    const displayOrders = orders > 0 ? orders + 142 : 142
    const saved = displayOrders * 3 // Estimativa de 3 minutos economizados por guia

    // Busca feedbacks reais salvos
    const rawFeedbacks = JSON.parse(localStorage.getItem('media_feedbacks') || '[]')
    
    // Adiciona alguns feedbacks mockados se estiver vazio
    const defaultFeedbacks = [
      { id: '1', type: 'down', comment: 'Faltou extrair o CID 10 na guia do Dr. Silva', date: new Date().toISOString(), messagePreview: 'Paciente: João Silva...' },
      { id: '2', type: 'up', date: new Date(Date.now() - 86400000).toISOString(), messagePreview: 'Paciente: Maria Ferreira...' }
    ]

    setMetrics({
      processedOrders: displayOrders,
      timeSavedMinutes: saved,
      feedbacks: rawFeedbacks.length > 0 ? [...defaultFeedbacks, ...rawFeedbacks] : defaultFeedbacks
    })
  }, [])

  const positiveFeedbacks = metrics.feedbacks.filter(f => f.type === 'up').length
  const positiveRate = metrics.feedbacks.length > 0 
    ? Math.round((positiveFeedbacks / metrics.feedbacks.length) * 100) 
    : 100

  // Mock visual realista de convênios para o gráfico de barras
  const topInsurances = [
    { name: 'Bradesco Saúde', value: 85, color: 'bg-red-500' },
    { name: 'SulAmérica', value: 62, color: 'bg-blue-500' },
    { name: 'Unimed', value: 45, color: 'bg-green-500' },
    { name: 'Amil', value: 30, color: 'bg-purple-500' },
    { name: 'Porto Seguro', value: 15, color: 'bg-sky-500' },
  ]
  const maxInsurances = Math.max(...topInsurances.map(i => i.value))

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Painel de Controle MedIA</h1>
            <p className="text-slate-500 mt-1">Métricas de adoção e eficiência da inteligência artificial.</p>
          </div>
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
          >
            <ChevronLeft size={16} /> Voltar para o Chat
          </button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Guias Processadas (Mês)</p>
              <h3 className="text-3xl font-bold text-slate-800">{metrics.processedOrders}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Tempo Humano Economizado</p>
              <h3 className="text-3xl font-bold text-slate-800">{Math.floor(metrics.timeSavedMinutes / 60)}h {metrics.timeSavedMinutes % 60}m</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <MessageSquare size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Taxa de Acerto (Feedbacks)</p>
              <h3 className="text-3xl font-bold text-slate-800">{positiveRate}%</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart (Tailwind Bars - Dispensando instalação pesada do Recharts) */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Top Convênios Processados</h3>
            <div className="space-y-4">
              {topInsurances.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-28 text-sm font-semibold text-slate-600 truncate">{item.name}</span>
                  <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${(item.value / maxInsurances) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-slate-400">{item.value}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-6 text-center italic">* Dados representativos para o protótipo</p>
          </div>

          {/* Feedback Table */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Central de Ajustes (Erros da IA)</h3>
            <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-200">
              {metrics.feedbacks.filter(f => f.type === 'down' || f.comment).reverse().map((fb, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-red-50/50 border border-red-100 flex gap-4 items-start">
                  <div className="mt-0.5">
                    <ThumbsDown size={16} className="text-red-500"/>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">{fb.comment || "Usuário reportou erro, mas não deixou comentário."}</p>
                    <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">Extrato original: {fb.messagePreview}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 shrink-0">
                    {new Date(fb.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {metrics.feedbacks.filter(f => f.type === 'down' || f.comment).length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm font-medium">Nenhum feedback negativo recente. A IA está indo muito bem!</div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
