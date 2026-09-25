import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Users, Clock, Link as LinkIcon, Play, Download, QrCode, CheckCircle2 } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import * as ExcelJS from 'exceljs'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import { supabase } from '../../lib/supabase'
import { getTreinamentosMes, createTreinamento, updateTreinamentoStatus, deleteTreinamento, getPresencas, updateTreinamento } from '../../lib/trainings-service'
import type { Treinamento, Presenca } from '../../lib/trainings-service'

interface TreinamentosModalProps {
  onClose: () => void
  userLevel: string
  userSector: string
  userName: string
}

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export const TreinamentosModal: React.FC<TreinamentosModalProps> = ({ onClose, userLevel, userSector, userName }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // Views: 'calendar', 'day_details', 'create_form', 'meeting_active'
  const [view, setView] = useState<'calendar' | 'day_details' | 'create_form' | 'meeting_active'>('calendar')
  const [selectedTreinamento, setSelectedTreinamento] = useState<Treinamento | null>(null)
  const [presencas, setPresencas] = useState<Presenca[]>([])

  // Form State
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    horario: '14:00',
    horarioFim: '15:00',
    colaboradores: '',
    link_video: ''
  })
  const [loading, setLoading] = useState(false)
  const [feriados, setFeriados] = useState<any[]>([])

  const isLeader = userLevel === 'coo' || userLevel === 'lider' || userSector.includes('ti') || userSector.includes('gestor')

  useEffect(() => {
    fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1)
    
    // Buscar feriados do ano atual
    fetch(`https://brasilapi.com.br/api/feriados/v1/${currentDate.getFullYear()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFeriados(data)
      })
      .catch(() => console.log('Erro ao buscar feriados'))
  }, [currentDate])

  useEffect(() => {
    if (view === 'meeting_active' && selectedTreinamento) {
      fetchPresencas()
      // Realtime para presenças
      const channel = supabase
        .channel('presencas_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'presencas', filter: `treinamento_id=eq.${selectedTreinamento.id}` }, (payload) => {
          setPresencas(prev => [payload.new as Presenca, ...prev])
        })
        .subscribe()
      return () => { supabase.removeChannel(channel) }
    }
  }, [view, selectedTreinamento])

  const fetchMonthData = async (ano: number, mes: number) => {
    const data = await getTreinamentosMes(ano, mes)
    setTreinamentos(data)
  }

  const fetchPresencas = async () => {
    if (!selectedTreinamento) return
    const data = await getPresencas(selectedTreinamento.id)
    
    // MOCK DE DADOS PARA TESTE
    if (data.length === 0) {
      setPresencas([
        { id: 'fake1', treinamento_id: selectedTreinamento.id, nome: 'João Silva Teste', setor: 'Tecnologia', horario_checkin: new Date().toISOString() },
        { id: 'fake2', treinamento_id: selectedTreinamento.id, nome: 'Maria Souza Falsa', setor: 'RH', horario_checkin: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
        { id: 'fake3', treinamento_id: selectedTreinamento.id, nome: 'Carlos Pereira (Teste)', setor: 'Financeiro', horario_checkin: new Date(Date.now() - 1000 * 60 * 15).toISOString() }
      ])
    } else {
      setPresencas(data)
    }
  }

  // Helpers do Calendário
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
    setView('day_details')
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return
    setLoading(true)
    try {
      const dataStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      if (selectedTreinamento) {
        await updateTreinamento(selectedTreinamento.id, {
          titulo: formData.titulo,
          descricao: formData.descricao,
          data: dataStr,
          horario: `${formData.horario} às ${formData.horarioFim}`,
          colaboradores: formData.colaboradores,
          link_video: formData.link_video,
        })
      } else {
        await createTreinamento({
          titulo: formData.titulo,
          descricao: formData.descricao,
          data: dataStr,
          horario: `${formData.horario} às ${formData.horarioFim}`,
          colaboradores: formData.colaboradores,
          link_video: formData.link_video,
          criado_por: userName
        })
      }
      await fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1)
      setSelectedTreinamento(null)
      setView('day_details')
      setFormData({ titulo: '', descricao: '', horario: '14:00', horarioFim: '15:00', colaboradores: '', link_video: '' })
    } catch (e: any) {
      console.error(e)
      alert('Erro ao salvar treinamento: ' + (e.message || JSON.stringify(e)))
    } finally {
      setLoading(false)
    }
  }

  const handleStartMeeting = async (t: Treinamento) => {
    try {
      console.log('Iniciando treinamento:', t)
      if (t.status === 'agendado') {
        await updateTreinamentoStatus(t.id, 'em_andamento')
        t.status = 'em_andamento'
      }
      setSelectedTreinamento(t)
      setView('meeting_active')
      console.log('View alterada para meeting_active')
    } catch (error: any) {
      console.error('Erro ao iniciar treinamento:', error)
      alert('Erro ao iniciar treinamento: ' + (error.message || 'Erro desconhecido. Verifique o console.'))
    }
  }

  const handleDownloadAta = async () => {
    if (!selectedTreinamento) return
    
    try {
      // Tentar buscar o template docx primeiro
      const response = await fetch('/RQ TREIN01.docx')
      
      // Se não encontrar ou der erro, lança exceção para cair no catch e usar Excel
      if (!response.ok) throw new Error('Template docx não encontrado')
      
      const arrayBuffer = await response.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })
      
      // Formatar dados para o template
      const templateData = {
        data: selectedTreinamento.data.split('-').reverse().join('/'),
        presencas: presencas.map(p => {
          const d = new Date(p.horario_checkin)
          return {
            nome: p.nome,
            setor: p.setor,
            horario: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
          }
        })
      }
      
      doc.render(templateData)
      
      const out = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      
      saveAs(out, `Ata_Treinamento_${selectedTreinamento.titulo.replace(/\s+/g, '_')}.docx`)
      
    } catch (err) {
      console.warn('Template Word (.docx) não encontrado, gerando Excel padrão:', err)
      
      // Fallback para Excel
      const workbook = new ExcelJS.Workbook()
      const worksheet = workbook.addWorksheet('Ata de Presença')
      
      worksheet.columns = [
        { header: 'Nome do Colaborador', key: 'nome', width: 30 },
        { header: 'Setor', key: 'setor', width: 25 },
        { header: 'Data do Check-in', key: 'data', width: 15 },
        { header: 'Hora do Check-in', key: 'hora', width: 15 }
      ]

      presencas.forEach(p => {
        const d = new Date(p.horario_checkin)
        worksheet.addRow({
          nome: p.nome,
          setor: p.setor,
          data: d.toLocaleDateString('pt-BR'),
          hora: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        })
      })

      const buffer = await workbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `Ata_Treinamento_${selectedTreinamento.titulo.replace(/\s+/g, '_')}.xlsx`
      link.click()
    }
  }

  // Renders
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
    const firstDay = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth())
    
    // Total cells in a 6-row grid = 42
    const totalCells = 42
    const blanks = Array.from({ length: firstDay }).map((_, i) => (
      <div key={`blank-${i}`} className="min-h-[110px] p-2 sm:p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 border-dashed"></div>
    ))
    
    const days = Array.from({ length: daysInMonth }).map((_, i) => {
      const dayNumber = i + 1
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`
      const dayTrainings = treinamentos.filter(t => t.data === dateStr)
      const hasTraining = dayTrainings.length > 0
      const holiday = feriados.find(f => f.date === dateStr)
      
      const isToday = dayNumber === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()

      return (
        <button
          key={dayNumber}
          onClick={() => handleDayClick(dayNumber)}
          className={`min-h-[110px] p-3 transition-all flex flex-col items-start justify-start relative group rounded-2xl border
            ${isToday 
              ? 'bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border-indigo-200 shadow-md ring-1 ring-indigo-100' 
              : holiday
                ? 'bg-red-50/20 border-red-100 hover:border-red-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-red-50/40'
                : 'bg-white border-slate-200/80 shadow-xs hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5 hover:bg-slate-50/50'
            }`}
        >
          <span className={`text-[13px] font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ${
            isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110' : 
            holiday ? 'text-red-700 bg-red-100 group-hover:bg-red-200' :
            'text-slate-600 bg-slate-100/80 group-hover:bg-indigo-100 group-hover:text-indigo-700'
          }`}>
            {dayNumber}
          </span>
          <div className="mt-2 flex flex-col gap-1.5 w-full">
            {holiday && (
              <div className="w-full text-[10px] font-extrabold px-2 py-1 rounded-lg border bg-red-50 text-red-600 border-red-200/60 flex items-center gap-1.5 overflow-hidden" title={holiday.name}>
                <span className="w-1.5 h-1.5 shrink-0 rounded-full bg-red-500"></span>
                <span className="truncate">{holiday.name}</span>
              </div>
            )}
            {dayTrainings.slice(0, 2).map((t, idx) => (
              <div key={idx} className={`w-full truncate text-[10px] font-extrabold px-2 py-1 rounded-lg border flex items-center gap-1.5 ${t.status === 'em_andamento' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60' : 'bg-indigo-50 text-indigo-700 border-indigo-200/60'}`}>
                <span className={`w-1 h-1 rounded-full ${t.status === 'em_andamento' ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`}></span>
                {t.horario} - {t.titulo}
              </div>
            ))}
            {dayTrainings.length > 2 && <div className="text-[10px] text-slate-500 font-extrabold bg-slate-100 px-2 py-1 rounded-lg text-center mt-0.5">+{dayTrainings.length - 2} eventos</div>}
          </div>
        </button>
      )
    })

    const trailingBlanksCount = totalCells - (blanks.length + days.length)
    const trailingBlanks = Array.from({ length: trailingBlanksCount }).map((_, i) => (
      <div key={`trailing-blank-${i}`} className="min-h-[110px] p-2 sm:p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 border-dashed"></div>
    ))

    return (
      <div className="p-4 sm:p-8 h-full bg-[#f8fafc]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -ml-10 -mt-10 pointer-events-none"></div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <CalendarIcon size={24} />
            </div>
            {MONTHS[currentDate.getMonth()]} <span className="text-slate-400 font-medium">{currentDate.getFullYear()}</span>
          </h2>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end relative z-10">
            {isLeader && (
              <button 
                onClick={() => {
                  setSelectedDate(new Date())
                  setView('create_form')
                }}
                style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                className="flex items-center justify-center gap-2 px-5 py-3 font-extrabold rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0 shrink-0 border border-transparent"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>Agendar Treinamento</span>
              </button>
            )}
            <div className="flex gap-2 shrink-0 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
              <button onClick={handlePrevMonth} className="p-2.5 text-slate-500 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"><ChevronLeft size={20} strokeWidth={2.5} /></button>
              <button onClick={handleNextMonth} className="p-2.5 text-slate-500 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"><ChevronRight size={20} strokeWidth={2.5} /></button>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 sm:p-7 rounded-[2rem] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
          <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
            {DAYS_OF_WEEK.map(d => <div key={d} className="text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-3 sm:gap-4">
            {blanks}
            {days}
            {trailingBlanks}
          </div>
        </div>
      </div>
    )
  }

  const renderDayDetails = () => {
    if (!selectedDate) return null
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    const dayTrainings = treinamentos.filter(t => t.data === dateStr)

    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setView('calendar')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><ChevronLeft size={20} /></button>
          <h2 className="text-xl font-bold text-slate-800">
            Treinamentos: {selectedDate.toLocaleDateString('pt-BR')}
          </h2>
        </div>

        {dayTrainings.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p>Nenhum treinamento agendado para este dia.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dayTrainings.map(t => (
              <div key={t.id} className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-colors bg-white shadow-xs">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-800">{t.titulo}</h3>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                    t.status === 'em_andamento' ? 'bg-emerald-100 text-emerald-700' :
                    t.status === 'finalizado' ? 'bg-slate-100 text-slate-600' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">{t.descricao}</p>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {t.horario}</div>
                  <div className="flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> {t.colaboradores || 'Todos'}</div>
                  {t.link_video && <div className="flex items-center gap-1.5"><LinkIcon size={14} className="text-slate-400" /> Link Disponível</div>}
                </div>
                
                {isLeader && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => handleStartMeeting(t)}
                      style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm font-bold shadow-md"
                    >
                      <Play size={16} /> Iniciar Treinamento
                    </button>
                    <button 
                      onClick={() => {
                        const [horarioInicio, horarioFim] = t.horario.split(' às ')
                        setFormData({
                          titulo: t.titulo,
                          descricao: t.descricao,
                          horario: horarioInicio || '14:00',
                          horarioFim: horarioFim || '15:00',
                          colaboradores: t.colaboradores || '',
                          link_video: t.link_video || ''
                        })
                        setSelectedTreinamento(t)
                        setView('create_form')
                      }}
                      className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors text-sm font-bold"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={async () => {
                        if (confirm('Deletar este agendamento?')) {
                          await deleteTreinamento(t.id);
                          fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1);
                        }
                      }}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isLeader && (
          <button 
            onClick={() => setView('create_form')}
            className="mt-6 w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all font-bold"
          >
            <Plus size={20} /> Agendar Novo Treinamento
          </button>
        )}
      </div>
    )
  }

  const renderCreateForm = () => {
    // Generate YYYY-MM-DD for the input[type="date"]
    const dateInputVal = selectedDate 
      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      : ''

    return (
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-4xl bg-white rounded-[2rem] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative">
          
          {/* Header */}
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <button 
                onClick={() => {
                  setView('calendar')
                  setSelectedTreinamento(null)
                  setFormData({ titulo: '', descricao: '', horario: '14:00', horarioFim: '15:00', colaboradores: '', link_video: '' })
                }} 
                className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-500 shadow-sm transition-all hover:-translate-x-1"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {selectedTreinamento ? 'Editar Treinamento' : 'Agendar Treinamento'}
                </h2>
                <p className="text-sm font-semibold text-slate-500 mt-1">
                  {selectedTreinamento ? 'Modifique os detalhes da ata de presença' : 'Preencha os detalhes para criar uma nova ata de presença'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-[13px] font-black text-slate-700 uppercase tracking-widest mb-2">Título do Treinamento</label>
                <input 
                  required type="text" value={formData.titulo} onChange={e => setFormData({...formData, titulo: e.target.value})} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                  placeholder="Ex: Treinamento de Novos Processos OPME" 
                />
              </div>
              
              <div>
                <label className="block text-[13px] font-black text-slate-700 uppercase tracking-widest mb-2">Descrição / Pauta</label>
                <textarea 
                  required rows={4} value={formData.descricao} onChange={e => setFormData({...formData, descricao: e.target.value})} 
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none resize-none" 
                  placeholder="Detalhe brevemente os assuntos que serão abordados nesta sessão..." 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="flex flex-col justify-end">
                  <label className="block text-[13px] font-black text-slate-700 uppercase tracking-widest mb-2">Data da Sessão</label>
                  <input 
                    required type="date" value={dateInputVal} 
                    onChange={e => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-')
                        setSelectedDate(new Date(Number(y), Number(m)-1, Number(d)))
                      }
                    }} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[13px] font-black text-slate-700 uppercase tracking-widest mb-2">Horário Início</label>
                  <input 
                    required type="time" value={formData.horario} onChange={e => setFormData({...formData, horario: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[13px] font-black text-slate-700 uppercase tracking-widest mb-2">Término <span className="text-slate-400 font-normal normal-case">(Previsto)</span></label>
                  <input 
                    required type="time" value={formData.horarioFim} onChange={e => setFormData({...formData, horarioFim: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-[13px] font-black text-slate-700 uppercase tracking-widest mb-2">Link da Chamada <span className="text-slate-400 font-normal normal-case">(Opcional)</span></label>
                  <input 
                    type="url" value={formData.link_video} onChange={e => setFormData({...formData, link_video: e.target.value})} 
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                    placeholder="Ex: https://meet.google.com/..." 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-black text-slate-700 uppercase tracking-widest mb-2">Setores Alvo / Públicos</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users size={20} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" value={formData.colaboradores} onChange={e => setFormData({...formData, colaboradores: e.target.value})} 
                    className="w-full pl-12 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                    placeholder="Ex: T.I, Vendas, Faturamento, ou deixe em branco para Todos..." 
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
              <button 
                disabled={loading} type="submit" 
                style={{ backgroundColor: loading ? '#94a3b8' : '#4f46e5', color: '#ffffff' }}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl font-black text-base shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none border border-transparent"
              >
                {loading ? (selectedTreinamento ? 'Salvando...' : 'Criando Sessão...') : (selectedTreinamento ? 'Salvar Alterações' : 'Confirmar e Criar Treinamento')}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  const renderMeetingActive = () => {
    if (!selectedTreinamento) return null
    const checkinUrl = `${window.location.origin}/checkin/${selectedTreinamento.id}`

    const checkinAvailable = () => {
      const [startStr, endStr] = selectedTreinamento.horario.split(' às ')
      if (!startStr || !endStr) return true
      
      const now = new Date()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      
      // Se não for hoje, já bloqueia
      if (selectedTreinamento.data !== todayStr) return false
      
      const currentTime = now.getHours() * 60 + now.getMinutes()
      const [startH, startM] = startStr.split(':').map(Number)
      const startTime = startH * 60 + startM
      const [endH, endM] = endStr.split(':').map(Number)
      const endTime = endH * 60 + endM
      
      return currentTime >= startTime && currentTime <= endTime
    }

    const isAvailable = checkinAvailable()

    return (
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setView('day_details')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500"><ChevronLeft size={20} /></button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedTreinamento.titulo}</h2>
              <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Treinamento Ativo</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {selectedTreinamento.link_video && (
              <a 
                href={selectedTreinamento.link_video.startsWith('http') ? selectedTreinamento.link_video : `https://${selectedTreinamento.link_video}`}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ backgroundColor: '#d1fae5', color: '#047857', borderColor: '#a7f3d0' }}
                className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:opacity-90 transition-opacity text-sm font-bold shadow-sm"
              >
                <Play size={16} /> Entrar na Reunião
              </a>
            )}
            <button 
              onClick={handleDownloadAta} 
              style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm font-bold shadow-sm"
            >
              <Download size={16} /> Baixar Ata
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 flex-1">
          {/* QR Code Section */}
          <div className="w-full md:w-1/3 flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center">
            {isAvailable ? (
              <>
                <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 mb-4">
                  <QRCodeSVG value={checkinUrl} size={200} level="H" includeMargin={false} />
                </div>
                <h3 className="font-black text-lg text-slate-800 mb-1 flex items-center gap-2 justify-center"><QrCode size={18}/> Check-in Digital</h3>
                <p className="text-sm text-slate-500 mb-4">Peça aos colaboradores para escanear o código com a câmera do celular ou compartilhe o link abaixo.</p>
                
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(checkinUrl);
                    alert('Link copiado para a área de transferência!');
                  }}
                  className="w-full py-2.5 px-4 bg-white border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <LinkIcon size={16} /> Copiar Link de Check-in
                </button>
              </>
            ) : (
              <div className="py-12 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <Clock size={32} className="text-slate-400" />
                </div>
                <h3 className="font-black text-lg text-slate-800 mb-2">Check-in Indisponível</h3>
                <p className="text-sm text-slate-500">
                  O check-in só estará liberado durante o horário do treinamento:<br/>
                  <strong className="text-slate-700">{selectedTreinamento.horario}</strong>
                </p>
              </div>
            )}
          </div>

          {/* Lista de Presenças */}
          <div className="w-full md:w-2/3 border border-slate-200 rounded-3xl overflow-hidden flex flex-col">
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-700">Ata de Presença em Tempo Real</h3>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs font-bold">{presencas.length} confirmados</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 bg-white">
              {presencas.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p>Aguardando check-ins...</p>
                </div>
              ) : (
                <ul className="space-y-1">
                  {presencas.map(p => (
                    <li key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <div>
                          <p className="font-bold text-sm text-slate-800 leading-none mb-1">{p.nome}</p>
                          <p className="text-[10px] text-slate-500 font-medium uppercase">{p.setor}</p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(p.horario_checkin).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 flex flex-col overflow-hidden bg-white"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-inner">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Treinamentos e Capacitação</h3>
            <p className="text-xs text-slate-500">Agendamentos, calendário e atas de presença</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-full w-full mx-auto p-4 sm:p-6 lg:p-8"
          >
            {view === 'calendar' && renderCalendar()}
            {view === 'day_details' && renderDayDetails()}
            {view === 'create_form' && renderCreateForm()}
            {view === 'meeting_active' && renderMeetingActive()}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
