import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Users, Clock, Link as LinkIcon, Play, Download, QrCode, CheckCircle2, LogOut, MessageCircle, Send, Check, AlertCircle, Loader2, Phone, Search } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import * as ExcelJS from 'exceljs'
import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import fileSaver from 'file-saver'
const { saveAs } = fileSaver
import { supabase } from '../../lib/supabase'
import { salvarDocumento } from '../../lib/storage'
import { getTreinamentosMes, createTreinamento, updateTreinamentoStatus, deleteTreinamento, getPresencas, updateTreinamento, getAllAgendados } from '../../lib/trainings-service'
import type { Treinamento, Presenca } from '../../lib/trainings-service'
import { getWhatsAppContacts, matchTargetAudienceContacts, dispatchBatchReminders, formatPhoneNumber, buildTrainingReminderMessage, getContactIdentifier, extractExcludedContactsFromCriadoPor, buildCriadoPorWithExclusions } from '../../lib/uazapi'
import type { WhatsAppContact } from '../../lib/uazapi'

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
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'list'>('month')
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
  // Views: 'calendar', 'day_details', 'create_form', 'meeting_active'
  const [view, setView] = useState<'calendar' | 'day_details' | 'create_form' | 'meeting_active'>('calendar')
  const [selectedTreinamento, setSelectedTreinamento] = useState<Treinamento | null>(null)
  const [presencas, setPresencas] = useState<Presenca[]>([])

  // WhatsApp Integration States
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [treinamentoParaLembrete, setTreinamentoParaLembrete] = useState<Treinamento | null>(null)
  const [matchedReminderContacts, setMatchedReminderContacts] = useState<WhatsAppContact[]>([])
  const [selectedContactIdsForReminder, setSelectedContactIdsForReminder] = useState<Set<string>>(new Set())
  const [isDispatchingReminders, setIsDispatchingReminders] = useState(false)
  const [dispatchProgress, setDispatchProgress] = useState<{ current: number; total: number; contactName: string; success: boolean } | null>(null)
  const [dispatchResult, setDispatchResult] = useState<{ sent: number; failed: number } | null>(null)
  const [contactSearchFilter, setContactSearchFilter] = useState('')
  const [showContactPicker, setShowContactPicker] = useState(false)
  const [excludedContactIds, setExcludedContactIds] = useState<string[]>([])

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

  const levelLow = userLevel.toLowerCase();
  const sectorLow = userSector.toLowerCase();
  
  const normalizedSec = sectorLow.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  const isGestorOrDiretor = levelLow.includes('gestor') || levelLow.includes('diretor') || levelLow.includes('coo') || levelLow.includes('diretoria') || normalizedSec.includes('gestor') || normalizedSec.includes('diretoria');
  const isLider = levelLow.includes('lider') || levelLow.includes('líder');
  const isTi = normalizedSec.includes('ti') || normalizedSec.includes('tecnologia');
  const isOperacoes = normalizedSec.includes('operac');
  
  const isLiderTiOrOperacoes = isLider && (isTi || isOperacoes);
  
  const isLeader = isGestorOrDiretor || isLiderTiOrOperacoes;

  useEffect(() => {
    if (calendarMode === 'list') {
      fetchAgendados()
    } else {
      fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1)
    }
    
    // Buscar feriados do ano atual
    fetch(`https://brasilapi.com.br/api/feriados/v1/${currentDate.getFullYear()}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setFeriados(data)
      })
      .catch(() => console.log('Erro ao buscar feriados'))
  }, [currentDate, calendarMode])

  // Carrega a agenda de contatos do WhatsApp da Uazapi
  useEffect(() => {
    setIsLoadingContacts(true)
    getWhatsAppContacts()
      .then(contacts => {
        setWhatsappContacts(contacts)
      })
      .catch(err => console.warn('[WhatsApp] Falha ao carregar contatos:', err))
      .finally(() => setIsLoadingContacts(false))
  }, [])

  // Verificador em background a cada 60 segundos para garantir disparo 30 min antes
  useEffect(() => {
    const triggerAutoReminderCheck = () => {
      fetch('/api/cron-treinamentos-whatsapp').catch(() => {})
    }
    triggerAutoReminderCheck()
    const timer = setInterval(triggerAutoReminderCheck, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (view === 'meeting_active' && selectedTreinamento) {
      fetchPresencas()
      
      const intervalId = setInterval(() => {
        fetchPresencas()
      }, 10000)

      // Realtime para presenças
      const channel = supabase
        .channel('presencas_realtime')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'presencas', filter: `treinamento_id=eq.${selectedTreinamento.id}` }, (payload: any) => {
          setPresencas(prev => [payload.new as Presenca, ...prev])
        })
        .subscribe()
      return () => { 
        supabase.removeChannel(channel)
        clearInterval(intervalId)
      }
    }
  }, [view, selectedTreinamento])

  const fetchMonthData = async (ano: number, mes: number) => {
    const data = await getTreinamentosMes(ano, mes)
    setTreinamentos(data)
  }

  const fetchAgendados = async () => {
    const data = await getAllAgendados()
    setTreinamentos(data)
  }

  const fetchPresencas = async () => {
    if (!selectedTreinamento) return
    const data = await getPresencas(selectedTreinamento.id)
    setPresencas(data)
  }

  // Abre o modal de disparo de lembrete no WhatsApp respeitando contatos excluídos
  const handleOpenWhatsAppReminderModal = (t: Treinamento) => {
    setTreinamentoParaLembrete(t)
    setDispatchResult(null)
    setDispatchProgress(null)
    
    // Busca os contatos correspondentes ao público-alvo excluindo os ignorados
    const excluded = extractExcludedContactsFromCriadoPor(t.criado_por)
    const { matchedContacts } = matchTargetAudienceContacts(t.colaboradores || '', whatsappContacts, excluded)
    setMatchedReminderContacts(matchedContacts)
    setSelectedContactIdsForReminder(new Set(matchedContacts.map(c => getContactIdentifier(c))))
    setIsWhatsAppModalOpen(true)
  }

  // Executa o disparo dos lembretes para os contatos selecionados
  const handleDispatchReminders = async () => {
    if (!treinamentoParaLembrete) return
    const contactsToSend = matchedReminderContacts.filter(c => selectedContactIdsForReminder.has(getContactIdentifier(c)))
    if (contactsToSend.length === 0) {
      alert('Selecione ao menos um contato para disparar o lembrete.')
      return
    }

    setIsDispatchingReminders(true)
    setDispatchProgress({ current: 0, total: contactsToSend.length, contactName: '', success: true })

    try {
      const res = await dispatchBatchReminders(
        treinamentoParaLembrete,
        contactsToSend,
        (current, total, contact, success) => {
          setDispatchProgress({ current, total, contactName: contact.contact_name, success })
        }
      )
      setDispatchResult({ sent: res.sent, failed: res.failed })
      
      // Atualiza o estado local para marcar como enviado
      setTreinamentos(prev => prev.map(item => {
        if (item.id === treinamentoParaLembrete.id) {
          const marca = `[whatsapp_lembrete_enviado:${new Date().toISOString()}]`
          return { ...item, criado_por: item.criado_por ? `${item.criado_por} ${marca}` : marca }
        }
        return item
      }))
    } catch (err: any) {
      alert(`Erro durante o disparo: ${err?.message || 'Falha de conexão'}`)
    } finally {
      setIsDispatchingReminders(false)
    }
  }

  // Adiciona contato selecionado da agenda ao campo de texto do público-alvo
  const handleAddContactToColaboradores = (contact: WhatsAppContact) => {
    const contactId = getContactIdentifier(contact)
    // Se o contato havia sido excluído, desfaz a exclusão automaticamente
    setExcludedContactIds(prev => prev.filter(id => id !== contactId && id !== contact.jid && id !== contact.phone))

    const currentText = formData.colaboradores.trim()
    const nameToAdd = contact.contact_name
    if (!currentText) {
      setFormData({ ...formData, colaboradores: nameToAdd })
    } else {
      if (!currentText.toLowerCase().includes(nameToAdd.toLowerCase())) {
        setFormData({ ...formData, colaboradores: `${currentText}, ${nameToAdd}` })
      }
    }
  }

  // Remove/tira um contato identificado da lista de lembretes
  const handleRemoveContact = (contact: WhatsAppContact) => {
    const contactId = getContactIdentifier(contact)
    setExcludedContactIds(prev => {
      if (prev.includes(contactId)) return prev
      return [...prev, contactId]
    })

    // Se o nome completo do contato foi digitado/inserido no texto de colaboradores, limpa também
    if (contact.contact_name && formData.colaboradores.toLowerCase().includes(contact.contact_name.toLowerCase())) {
      const escaped = contact.contact_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(?:,\\s*)?${escaped}(?:\\s*,)?`, 'i')
      const updated = formData.colaboradores
        .replace(regex, '')
        .replace(/,\s*,/g, ', ')
        .replace(/^[,\s]+|[,\s]+$/g, '')
        .trim()
      setFormData(prev => ({ ...prev, colaboradores: updated }))
    }
  }

  // Restaura contato que havia sido removido
  const handleRestoreContact = (contactId: string) => {
    setExcludedContactIds(prev => prev.filter(id => id !== contactId))
  }

  // Helpers do Calendário
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handlePrevMonth = () => {
    if (calendarMode === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }
  }
  const handleNextMonth = () => {
    if (calendarMode === 'week') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 7))
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
  }

  const handleDayClick = (dayDate: Date) => {
    setSelectedDate(dayDate)
    setView('day_details')
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate) return
    setLoading(true)
    try {
      const dataStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      if (selectedTreinamento) {
        const baseCriadoPor = selectedTreinamento.criado_por || userName
        const updatedCriadoPor = buildCriadoPorWithExclusions(baseCriadoPor, excludedContactIds)
        await updateTreinamento(selectedTreinamento.id, {
          titulo: formData.titulo,
          descricao: formData.descricao,
          data: dataStr,
          horario: `${formData.horario} às ${formData.horarioFim}`,
          colaboradores: formData.colaboradores,
          link_video: formData.link_video,
          criado_por: updatedCriadoPor
        })
      } else {
        const novoCriadoPor = buildCriadoPorWithExclusions(userName, excludedContactIds)
        await createTreinamento({
          titulo: formData.titulo,
          descricao: formData.descricao,
          data: dataStr,
          horario: `${formData.horario} às ${formData.horarioFim}`,
          colaboradores: formData.colaboradores,
          link_video: formData.link_video,
          criado_por: novoCriadoPor
        })
      }
      await fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1)
      setSelectedTreinamento(null)
      setExcludedContactIds([])
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
        area: selectedTreinamento?.titulo || 'Título não encontrado',
        Area: selectedTreinamento?.titulo || 'Título não encontrado',
        'ÁREA': selectedTreinamento?.titulo || 'Título não encontrado',
        'Área': selectedTreinamento?.titulo || 'Título não encontrado',
        'área': selectedTreinamento?.titulo || 'Título não encontrado',
        titulo: selectedTreinamento?.titulo || 'Título não encontrado',
        Titulo: selectedTreinamento?.titulo || 'Título não encontrado',
        data: selectedTreinamento?.data?.split('-').reverse().join('/') || '',
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
      
      const nomeAta = `Ata_Treinamento_${selectedTreinamento.titulo.replace(/\s+/g, '_')}.docx`
      saveAs(out, nomeAta)

      // Arquiva cópia no bucket privado (não bloqueia o download)
      salvarDocumento(nomeAta, out, 'atas').catch((e) =>
        console.warn('[storage] Ata não arquivada:', e?.message)
      )
      
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
    if (calendarMode === 'list') {
      return (
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 h-full bg-[#f8fafc]">
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setCalendarMode('month')} 
              className="p-2 rounded-xl hover:bg-white text-slate-500 bg-white/50 shadow-sm border border-slate-200 transition-all hover:shadow-md hover:text-indigo-600"
            >
              <ChevronLeft size={24} strokeWidth={2.5} />
            </button>
            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                <CalendarIcon size={20} strokeWidth={2.5} />
              </div>
              Todos os Agendamentos
            </h2>
          </div>
          
          {treinamentos.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>Nenhum treinamento agendado encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {treinamentos.map(t => {
                const parts = t.data.split('-')
                const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      const d = new Date(t.data + 'T12:00:00')
                      handleDayClick(d)
                    }}
                    className="w-full text-left bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-lg transition-all shadow-xs group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{t.titulo}</h3>
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide bg-indigo-100 text-indigo-700">
                        {t.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1.5"><CalendarIcon size={14} className="text-slate-400" /> {formattedDate}</div>
                      <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {t.horario}</div>
                      <div className="flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> {t.colaboradores || 'Todos'}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    let calendarDays: Date[] = []
    let blanksCount = 0

    if (calendarMode === 'month') {
      const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth())
      blanksCount = getFirstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth())
      for (let i = 1; i <= daysInMonth; i++) {
        calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
      }
    } else {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek)
        d.setDate(startOfWeek.getDate() + i)
        calendarDays.push(d)
      }
    }

    const blanks = Array.from({ length: blanksCount }).map((_, i) => (
      <div key={`blank-${i}`} className={`p-2 sm:p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 border-dashed ${calendarMode === 'week' ? 'min-h-[220px]' : 'min-h-[110px]'}`}></div>
    ))
    
    const days = calendarDays.map((d, i) => {
      const dayNumber = d.getDate()
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`
      const dayTrainings = treinamentos.filter(t => t.data === dateStr)
      const hasTraining = dayTrainings.length > 0
      const holiday = feriados.find(f => f.date === dateStr)
      
      const isToday = dayNumber === new Date().getDate() && d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear()

      return (
        <button
          key={dateStr}
          onClick={() => handleDayClick(d)}
          className={`p-3 transition-all flex flex-col items-start justify-start relative group rounded-2xl border ${calendarMode === 'week' ? 'min-h-[220px]' : 'min-h-[110px]'}
            ${isToday 
              ? 'bg-gradient-to-br from-indigo-50/80 to-blue-50/50 border-indigo-200 shadow-md ring-1 ring-indigo-100' 
              : holiday
                ? 'bg-red-50/20 border-red-200 hover:border-red-300 hover:shadow-lg hover:-translate-y-0.5 hover:bg-red-50/40'
                : 'bg-white border-slate-300 shadow-sm hover:border-indigo-400 hover:shadow-lg hover:-translate-y-0.5 hover:bg-slate-50'
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

    const totalCells = calendarMode === 'week' ? 7 : 42
    const trailingBlanksCount = totalCells - (blanks.length + days.length)
    const trailingBlanks = Array.from({ length: trailingBlanksCount }).map((_, i) => (
      <div key={`trailing-blank-${i}`} className={`p-2 sm:p-3 rounded-2xl bg-slate-50/50 border border-slate-100/50 border-dashed ${calendarMode === 'week' ? 'min-h-[220px]' : 'min-h-[110px]'}`}></div>
    ))

    return (
      <div className="p-4 sm:p-8 h-full bg-[#f8fafc]">
        
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setCalendarMode('list')}
            className="flex items-center gap-2 px-5 py-2.5 font-bold rounded-2xl transition-all bg-white text-slate-700 border border-slate-300 shadow-sm hover:bg-slate-50 hover:border-slate-400 hover:shadow-md hover:-translate-y-0.5"
          >
            <CalendarIcon size={18} />
            Treinamentos agendados
          </button>
        </div>

        {calendarMode !== 'list' && (
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
                  setSelectedTreinamento(null)
                  setExcludedContactIds([])
                  setFormData({ titulo: '', descricao: '', horario: '14:00', horarioFim: '15:00', colaboradores: '', link_video: '' })
                  setView('create_form')
                }}
                style={{ backgroundColor: '#4f46e5', color: '#ffffff' }}
                className="flex items-center justify-center gap-2 px-5 py-3 font-extrabold rounded-2xl transition-all shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5 active:translate-y-0 shrink-0 border border-transparent"
              >
                <Plus size={20} strokeWidth={2.5} />
                <span className="hidden sm:inline">Agendar Treinamento</span>
              </button>
            )}
            
            <div className="flex gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60 items-center overflow-x-auto">
              <button 
                onClick={() => setCalendarMode('month')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${calendarMode === 'month' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Mês
              </button>
              <button 
                onClick={() => setCalendarMode('week')} 
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${calendarMode === 'week' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Semana
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>
              <button onClick={handlePrevMonth} className="p-2 text-slate-500 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"><ChevronLeft size={18} strokeWidth={2.5} /></button>
              <button onClick={handleNextMonth} className="p-2 text-slate-500 rounded-xl hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"><ChevronRight size={18} strokeWidth={2.5} /></button>
            </div>
          </div>
        </div>
        )}

        <div className="bg-white p-5 sm:p-7 rounded-[2rem] border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-x-auto">
          <div className="min-w-[600px]">
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
            {dayTrainings.map(t => {
              const now = new Date()
              const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
              let isPast = t.data < todayStr
              if (t.data === todayStr) {
                const parts = t.horario.split(' às ')
                if (parts[1]) {
                  const [endH, endM] = parts[1].split(':').map(Number)
                  if (now.getHours() * 60 + now.getMinutes() > endH * 60 + endM) isPast = true
                } else {
                  const [startH, startM] = parts[0].split(':').map(Number)
                  if (now.getHours() * 60 + now.getMinutes() > (startH + 1) * 60 + startM) isPast = true
                }
              }
              const concluded = t.status === 'finalizado' || isPast

              return (
              <div key={t.id} className="border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 transition-colors bg-white shadow-xs">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-lg text-slate-800">{t.titulo}</h3>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${
                    !concluded && t.status === 'em_andamento' ? 'bg-emerald-100 text-emerald-700' :
                    concluded ? 'bg-slate-100 text-slate-600' :
                    'bg-indigo-100 text-indigo-700'
                  }`}>
                    {concluded ? 'FINALIZADO' : t.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-4">{t.descricao}</p>
                <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500 mb-4">
                  <div className="flex items-center gap-1.5"><Clock size={14} className="text-slate-400" /> {t.horario}</div>
                  <div className="flex items-center gap-1.5"><Users size={14} className="text-slate-400" /> {t.colaboradores || 'Todos'}</div>
                  {t.link_video && <div className="flex items-center gap-1.5"><LinkIcon size={14} className="text-slate-400" /> Link Disponível</div>}
                  {t.criado_por?.includes('whatsapp_lembrete_enviado') ? (
                    <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                      <Check size={12} className="text-emerald-600" /> Lembrete WhatsApp Enviado
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-600 bg-emerald-50/70 border border-emerald-200/60 px-2.5 py-0.5 rounded-full font-bold text-[11px]">
                      <Clock size={11} className="text-emerald-600" /> Disparo auto 30m antes
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 flex-wrap">
                  {(isLeader || concluded) && (
                    <button 
                      onClick={() => handleStartMeeting(t)}
                      style={{ backgroundColor: concluded ? '#f1f5f9' : '#4f46e5', color: concluded ? '#475569' : '#ffffff' }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-90 transition-opacity text-sm font-bold shadow-md ${concluded ? 'border border-slate-300' : ''}`}
                    >
                      {concluded ? <CheckCircle2 size={16} /> : <Play size={16} />} 
                      {concluded ? 'Ver Ata e Presenças' : 'Iniciar Treinamento'}
                    </button>
                  )}
                  {isLeader && !concluded && (
                    <>
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
                          setExcludedContactIds(extractExcludedContactsFromCriadoPor(t.criado_por))
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
                    </>
                  )}
                  {t.link_video && !concluded && (
                    <a 
                      href={t.link_video.startsWith('http') ? t.link_video : `https://${t.link_video}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ backgroundColor: '#d1fae5', color: '#047857', borderColor: '#a7f3d0' }}
                      className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:opacity-90 transition-opacity text-sm font-bold shadow-sm"
                    >
                      <Play size={16} /> Entrar na Reunião
                    </a>
                  )}
                  {!concluded && (
                    <button
                      type="button"
                      onClick={() => handleOpenWhatsAppReminderModal(t)}
                      style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all text-sm font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
                      title="Disparar ou agendar lembrete no WhatsApp com link da reunião para os participantes"
                    >
                      <MessageCircle size={16} className="text-white shrink-0" />
                      <span>{t.criado_por?.includes('whatsapp_lembrete_enviado') ? 'Reenviar WhatsApp' : 'Lembrete WhatsApp'}</span>
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}

        {isLeader && (
          <button 
            onClick={() => {
              setSelectedTreinamento(null)
              setExcludedContactIds([])
              setFormData({ titulo: '', descricao: '', horario: '14:00', horarioFim: '15:00', colaboradores: '', link_video: '' })
              setView('create_form')
            }}
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
                  setExcludedContactIds([])
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

              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="block text-[13px] font-black text-slate-700 uppercase tracking-widest">
                      Setores Alvo / Colaboradores (Público)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Digite os nomes ou use o botão ao lado para buscar na agenda
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Botão de Busca na Agenda com visual blindado */}
                    <button
                      type="button"
                      onClick={() => setShowContactPicker(!showContactPicker)}
                      style={{ backgroundColor: '#25D366', color: '#ffffff' }}
                      className="px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/25 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer border border-transparent"
                      title="Buscar e adicionar contatos diretamente da agenda do WhatsApp"
                    >
                      {isLoadingContacts ? (
                        <Loader2 size={14} className="text-white animate-spin shrink-0" />
                      ) : (
                        <Phone size={14} className="text-white shrink-0" />
                      )}
                      <span>
                        {isLoadingContacts
                          ? 'Carregando Agenda...'
                          : (showContactPicker ? 'Fechar Agenda' : '+ Buscar na Agenda WhatsApp')}
                      </span>
                    </button>

                    {/* Badge de Integração Uazapi */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{whatsappContacts.length > 0 ? `${whatsappContacts.length} contatos` : 'Uazapi'}</span>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users size={20} className="text-slate-400" />
                  </div>
                  <input 
                    required 
                    type="text" 
                    value={formData.colaboradores} 
                    onChange={e => setFormData({ ...formData, colaboradores: e.target.value })} 
                    className="w-full pl-12 pr-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 font-medium placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
                    placeholder="Ex: Comercial interno: Karen, Thaciana. Financeiro: Maria, Bruna..." 
                  />
                </div>

                {/* Seletor Suspenso da Agenda do WhatsApp */}
                {showContactPicker && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xl space-y-3 animate-fade-in relative z-20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className="text-emerald-600" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                          Contatos da Agenda do WhatsApp ({whatsappContacts.length})
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowContactPicker(false)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                      >
                        Fechar ✕
                      </button>
                    </div>

                    <div className="relative">
                      <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        value={contactSearchFilter}
                        onChange={e => setContactSearchFilter(e.target.value)}
                        placeholder="Buscar por nome ou telefone na agenda..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-emerald-500"
                      />
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1 divide-y divide-slate-100 pr-1">
                      {whatsappContacts
                        .filter(c => {
                          if (!contactSearchFilter.trim()) return true
                          const term = contactSearchFilter.toLowerCase()
                          return c.contact_name.toLowerCase().includes(term) || c.phone.includes(term)
                        })
                        .slice(0, 30)
                        .map((c, idx) => {
                          const isAlreadyIn = formData.colaboradores.toLowerCase().includes(c.contact_name.toLowerCase())
                          const itemKey = `${c.jid}_${c.contact_name}_${idx}`
                          return (
                            <button
                              key={itemKey}
                              type="button"
                              onClick={() => {
                                handleAddContactToColaboradores(c)
                              }}
                              className={`w-full text-left p-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                isAlreadyIn ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                  {c.contact_name.charAt(0).toUpperCase()}
                                </div>
                                <span className="font-semibold">{c.contact_name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 font-mono">{formatPhoneNumber(c.phone)}</span>
                                <span
                                  style={{
                                    backgroundColor: isAlreadyIn ? '#d1fae5' : '#059669',
                                    color: isAlreadyIn ? '#065f46' : '#ffffff'
                                  }}
                                  className="text-[10px] px-2.5 py-1 rounded-lg font-black transition-all shrink-0 shadow-2xs"
                                >
                                  {isAlreadyIn ? 'Adicionado ✓' : '+ Inserir'}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                    </div>
                  </div>
                )}

                {/* Auto-Match dos contatos identificados em tempo real com opção de remover */}
                {(() => {
                  if (!formData.colaboradores.trim()) return null

                  const allResult = matchTargetAudienceContacts(formData.colaboradores, whatsappContacts, [])
                  const { matchedContacts, unmatchedNames } = matchTargetAudienceContacts(formData.colaboradores, whatsappContacts, excludedContactIds)

                  // Identifica quais contatos foram tirados/removidos pelo usuário
                  const excludedList = allResult.matchedContacts.filter(c => {
                    const cId = getContactIdentifier(c)
                    const cleanPhone = (c.phone || '').replace(/\D/g, '')
                    return excludedContactIds.includes(cId) || 
                           excludedContactIds.includes(c.jid) || 
                           excludedContactIds.includes(cleanPhone) ||
                           excludedContactIds.includes(c.contact_name.toLowerCase())
                  })

                  return (
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1.5">
                          <MessageCircle size={14} className="text-emerald-600" />
                          Contatos da Agenda Identificados para Lembrete ({matchedContacts.length}):
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Disparo automático programado para 30 minutos antes
                        </span>
                      </div>

                      {matchedContacts.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {matchedContacts.map(c => {
                            const cId = getContactIdentifier(c)
                            return (
                              <div
                                key={cId}
                                className="group flex items-center gap-1.5 bg-white border border-emerald-300 text-emerald-900 pl-2.5 pr-1.5 py-1 rounded-xl text-[11px] font-bold shadow-2xs hover:border-emerald-400 transition-all"
                              >
                                <Phone size={11} className="text-emerald-600 shrink-0" />
                                <span>{c.contact_name}</span>
                                <span className="text-[9px] text-emerald-600 font-mono">({formatPhoneNumber(c.phone)})</span>
                                
                                {/* Botão para tirar/remover contato não correto */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveContact(c)
                                  }}
                                  className="ml-1 p-0.5 rounded-md hover:bg-red-50 hover:text-red-600 text-slate-400 transition-colors cursor-pointer shrink-0"
                                  title={`Tirar ${c.contact_name} do lembrete`}
                                >
                                  <X size={13} strokeWidth={2.5} />
                                </button>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500">
                          {excludedList.length > 0
                            ? 'Todos os contatos correspondentes foram removidos dos lembretes deste treinamento.'
                            : 'Nenhum contato da agenda foi identificado ainda no texto digitado. Use o botão + Agenda acima para selecionar.'}
                        </p>
                      )}

                      {/* Lista de contatos removidos com opção de restaurar */}
                      {excludedList.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-slate-500 flex items-center gap-1">
                              🚫 Removido(s) do lembrete ({excludedList.length}):
                            </span>
                            {excludedList.map(c => {
                              const cId = getContactIdentifier(c)
                              return (
                                <span
                                  key={cId}
                                  className="inline-flex items-center gap-1 bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-lg font-medium"
                                >
                                  <span className="line-through">{c.contact_name}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleRestoreContact(cId)}
                                    style={{ color: '#4f46e5' }}
                                    className="font-bold hover:underline cursor-pointer ml-1"
                                    title="Restaurar este contato no lembrete"
                                  >
                                    Restaurar
                                  </button>
                                </span>
                              )
                            })}
                          </div>
                          <button
                            type="button"
                            onClick={() => setExcludedContactIds([])}
                            style={{ color: '#4f46e5' }}
                            className="font-bold hover:underline cursor-pointer ml-auto"
                          >
                            Restaurar todos
                          </button>
                        </div>
                      )}

                      {unmatchedNames.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/80 flex items-start gap-1.5 text-[10px] text-amber-700">
                          <AlertCircle size={12} className="shrink-0 mt-0.5 text-amber-600" />
                          <span>
                            Nomes não localizados na agenda com esse formato exato: <strong>{unmatchedNames.join(', ')}</strong>. Você pode clicar em <strong>+ Agenda</strong> para vincular o contato correto.
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}

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
            {isLeader && selectedTreinamento.status !== 'finalizado' && (
              <button 
                onClick={async () => {
                  if (confirm('Tem certeza que deseja encerrar este treinamento antes do horário previsto?')) {
                    try {
                      await updateTreinamentoStatus(selectedTreinamento.id, 'finalizado');
                      selectedTreinamento.status = 'finalizado';
                      fetchMonthData(currentDate.getFullYear(), currentDate.getMonth() + 1);
                      setView('day_details');
                    } catch (e: any) {
                      alert('Erro ao encerrar treinamento: ' + e.message);
                    }
                  }
                }} 
                style={{ backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' }}
                className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:opacity-90 transition-opacity text-sm font-bold shadow-sm"
              >
                <X size={16} /> Encerrar
              </button>
            )}
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
        <div className="flex items-center gap-2">
          <button 
            onClick={async () => {
              if (confirm('Deseja realmente sair da sua conta?')) {
                await supabase.auth.signOut();
                localStorage.removeItem('userSector');
                localStorage.removeItem('userLevel');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole');
                window.location.reload();
              }
            }} 
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <LogOut size={14} /> Sair
          </button>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>
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

      {/* Modal Interativo de Disparo de Lembrete WhatsApp (Uazapi) */}
      <AnimatePresence>
        {isWhatsAppModalOpen && treinamentoParaLembrete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-500/30 shrink-0">
                    <MessageCircle size={22} />
                  </div>
                  <div>
                    <h3 className="font-display font-black text-slate-800 text-lg">
                      Disparar Lembrete no WhatsApp
                    </h3>
                    <p className="text-xs text-slate-500">
                      Instância Uazapi conectada • {treinamentoParaLembrete.titulo}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsWhatsAppModalOpen(false)}
                  className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                
                {/* Resumo da Reunião */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>📅 Data: {treinamentoParaLembrete.data.split('-').reverse().join('/')}</span>
                    <span>⏰ Horário: {treinamentoParaLembrete.horario}</span>
                  </div>
                  {treinamentoParaLembrete.link_video ? (
                    <div className="text-xs font-semibold text-emerald-800 flex items-center gap-1.5 truncate">
                      <LinkIcon size={13} className="shrink-0 text-emerald-600" />
                      <span className="truncate">Link: {treinamentoParaLembrete.link_video}</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-amber-700 font-medium">
                      ⚠️ Este treinamento não possui link de chamada cadastrado. O lembrete avisará que o organizador disponibilizará o link no início.
                    </p>
                  )}
                </div>

                {/* Preview da Mensagem */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                    Preview da Mensagem que será Enviada:
                  </label>
                  <div className="bg-[#e7f8ec] p-4 rounded-2xl border border-emerald-200 text-xs text-slate-800 font-sans whitespace-pre-wrap leading-relaxed shadow-2xs">
                    {buildTrainingReminderMessage(treinamentoParaLembrete, 'Colaborador')}
                  </div>
                </div>

                {/* Seleção de Contatos */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Users size={14} className="text-emerald-600" />
                      Participantes Localizados na Agenda ({matchedReminderContacts.length}):
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedContactIdsForReminder(new Set(matchedReminderContacts.map(c => getContactIdentifier(c))))}
                        className="text-[11px] text-indigo-600 hover:underline font-bold"
                      >
                        Selecionar Todos
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        type="button"
                        onClick={() => setSelectedContactIdsForReminder(new Set())}
                        className="text-[11px] text-slate-500 hover:underline font-medium"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>

                  {matchedReminderContacts.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
                      <p className="font-bold flex items-center gap-1.5">
                        <AlertCircle size={14} /> Nenhum contato da agenda foi identificado automaticamente pelo texto.
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Edite o treinamento e use o botão <strong>+ Agenda</strong> no campo de público-alvo para selecionar os contatos da lista do WhatsApp.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto space-y-1.5 border border-slate-200 rounded-2xl p-2 bg-slate-50/50">
                      {matchedReminderContacts.map(contact => {
                        const cId = getContactIdentifier(contact)
                        const isChecked = selectedContactIdsForReminder.has(cId)
                        return (
                          <div
                            key={cId}
                            onClick={() => {
                              const next = new Set(selectedContactIdsForReminder)
                              if (isChecked) next.delete(cId)
                              else next.add(cId)
                              setSelectedContactIdsForReminder(next)
                            }}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-white border-emerald-300 text-slate-900 shadow-2xs'
                                : 'bg-transparent border-transparent opacity-60 hover:opacity-100 text-slate-600'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}} // Tratado no onClick do pai
                                className="w-4 h-4 text-emerald-600 rounded-md border-slate-300 focus:ring-emerald-500 cursor-pointer"
                              />
                              <div>
                                <span className="font-bold block">{contact.contact_name}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{formatPhoneNumber(contact.phone)}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                              WhatsApp Ativo ✓
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Feedback de Progresso e Resultado */}
                {isDispatchingReminders && dispatchProgress && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                      <span className="flex items-center gap-2">
                        <Loader2 size={14} className="animate-spin text-emerald-600" />
                        Enviando mensagem {dispatchProgress.current} de {dispatchProgress.total}...
                      </span>
                      <span>{Math.round((dispatchProgress.current / dispatchProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full transition-all duration-300"
                        style={{ width: `${(dispatchProgress.current / dispatchProgress.total) * 100}%` }}
                      />
                    </div>
                    {dispatchProgress.contactName && (
                      <p className="text-[10px] text-emerald-700 truncate">
                        Destinatário atual: <strong>{dispatchProgress.contactName}</strong>
                      </p>
                    )}
                  </div>
                )}

                {dispatchResult && (
                  <div className="p-4 bg-emerald-100/70 border border-emerald-300 rounded-2xl space-y-1 text-xs text-emerald-900 animate-fade-in">
                    <p className="font-extrabold flex items-center gap-2">
                      <Check size={16} className="text-emerald-700" /> Disparo concluído com sucesso!
                    </p>
                    <p className="text-[11px]">
                      {dispatchResult.sent} mensagem(ns) enviada(s) pelo WhatsApp.{' '}
                      {dispatchResult.failed > 0 && `(${dispatchResult.failed} falha(s))`}.
                    </p>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                  Lembrete automático programado para 30 min antes.
                </p>
                <div className="flex items-center gap-2.5 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsWhatsAppModalOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleDispatchReminders}
                    disabled={isDispatchingReminders || selectedContactIdsForReminder.size === 0}
                    style={{ backgroundColor: selectedContactIdsForReminder.size === 0 ? '#94a3b8' : '#25D366', color: '#ffffff' }}
                    className="px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-md shadow-emerald-500/25 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDispatchingReminders ? (
                      <>
                        <Loader2 size={14} className="animate-spin text-white" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} className="text-white" />
                        <span>Disparar para {selectedContactIdsForReminder.size} Contatos</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
