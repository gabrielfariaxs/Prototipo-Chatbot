import React, { useState, useEffect } from 'react'
import { Bell, LogOut, Monitor, Plus, CheckCircle, Clock, ShieldAlert, Check, X } from 'lucide-react'
import type { ChamadoTI } from './types'
import { ChamadosTiList } from './ChamadosTiList'
import { ChamadosTiCreateModal } from './ChamadosTiCreateModal'
import { ChamadosTiDetailModal } from './ChamadosTiDetailModal'
import { supabase } from '../../lib/supabase'

export interface TiNotification {
  id: string
  title: string
  message: string
  targetSector?: string
  targetUser?: string
  createdAt: string
  read: boolean
  chamadoId?: string
}

const mapToChamadoTI = (data: any): ChamadoTI => ({
  id: data.id,
  code: data.code,
  title: data.title,
  priority: data.priority as any,
  status: data.status as any,
  description: data.description,
  creatorName: data.creator_name,
  creatorSector: data.creator_sector,
  approverSector: data.approver_sector,
  createdAt: data.created_at,
  evidenceFiles: data.evidence_files,
  comments: data.comments,
  approvedBy: data.approved_by,
  rejectionReason: data.rejection_reason,
  resolutionNotes: data.resolution_notes,
  assignedTech: data.assigned_tech
})

const mapToNotification = (data: any): TiNotification => ({
  id: data.id,
  title: data.title,
  message: data.message,
  targetSector: data.target_sector,
  targetUser: data.target_user,
  createdAt: data.created_at,
  read: data.read,
  chamadoId: data.chamado_id
})

export const ChamadosTiPanel: React.FC = () => {
  const [chamados, setChamados] = useState<ChamadoTI[]>([])
  const [selectedChamado, setSelectedChamado] = useState<ChamadoTI | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'meus' | 'aprovacoes' | 'ti' | 'historico'>('meus')
  const [historySearch, setHistorySearch] = useState('')

  const [userSector, setUserSector] = useState<string>('')
  const [userLevel, setUserLevel] = useState<string>('lider')
  const [userName, setUserName] = useState<string>('')
  const [userInitials, setUserInitials] = useState<string>('')

  const [notifications, setNotifications] = useState<TiNotification[]>([])
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)

  const loadData = async () => {
    const { data: chamadosData } = await supabase.from('ti_chamados').select('*').order('created_at', { ascending: false })
    if (chamadosData) {
      const mapped = chamadosData.map(mapToChamadoTI)
      setChamados(mapped)
      setSelectedChamado(prev => {
        if (!prev) return null;
        const fresh = mapped.find(c => c.id === prev.id)
        return fresh || prev
      })
    }

    const { data: notifData } = await supabase.from('ti_notifications').select('*').order('created_at', { ascending: false })
    if (notifData) setNotifications(notifData.map(mapToNotification))
  }

  // Carregar setor/nível e nome do usuário a partir do localStorage e sessão
  useEffect(() => {
    const savedSector = localStorage.getItem('userSector') || 'Geral'
    const savedLevel = localStorage.getItem('userLevel') || 'lider'
    setUserSector(savedSector)
    setUserLevel(savedLevel)

    // Mapeia o nível salvo para um rótulo legível
    const levelLabel =
      savedLevel === 'coo' ? 'COO/Diretoria' :
      savedLevel === 'lider' ? 'Líder de Setor' :
      'Colaborador'

    // Deriva o nome de exibição combinando nível + setor
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const metaName = session.user.user_metadata?.full_name as string | undefined
        const displayName = (metaName && metaName.trim())
          ? metaName.trim()
          : `${levelLabel} - ${savedSector}`
        setUserName(displayName)
        const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        setUserInitials(initials)
      } else {
        // Login via senha master (sem sessão Supabase)
        const displayName = `${levelLabel} - ${savedSector}`
        setUserName(displayName)
        const initials = savedSector.substring(0, 2).toUpperCase()
        setUserInitials(initials)
      }
    })

    loadData()

    // Polling a cada 10 segundos para manter a tela sempre atualizada
    const interval = setInterval(() => {
      loadData()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const addNotification = async (notif: Omit<TiNotification, 'id' | 'createdAt' | 'read'>) => {
    const { data } = await supabase.from('ti_notifications').insert([{
      title: notif.title,
      message: notif.message,
      target_sector: notif.targetSector,
      target_user: notif.targetUser,
      chamado_id: notif.chamadoId
    }]).select().single()

    if (data) {
      setNotifications(prev => [mapToNotification(data), ...prev])
    }
  }

  const handleCreateChamado = async (newChamado: ChamadoTI): Promise<void> => {
    const { data, error } = await supabase.from('ti_chamados').insert([{
      code: newChamado.code,
      title: newChamado.title,
      priority: newChamado.priority,
      status: newChamado.status,
      description: newChamado.description,
      creator_name: newChamado.creatorName,
      creator_sector: newChamado.creatorSector,
      approver_sector: newChamado.approverSector,
      evidence_files: newChamado.evidenceFiles
    }]).select().single()

    if (error) {
      console.error('Error creating chamado:', error)
      throw new Error(error.message || 'Falha ao salvar chamado no banco de dados.')
    }

    if (data) {
      const savedChamado = mapToChamadoTI(data)
      setChamados(prev => [savedChamado, ...prev])

      addNotification({
        title: 'Novo Chamado de Suporte',
        message: `Novo chamado ${savedChamado.code} (${savedChamado.title}) foi aberto por ${savedChamado.creatorName} (${savedChamado.creatorSector}).`,
        targetSector: 'T.I',
        chamadoId: savedChamado.id
      })

      if (savedChamado.approverSector && savedChamado.approverSector !== 'none' && savedChamado.approverSector !== 'Sem Aprovação (Direto T.I)') {
        addNotification({
          title: 'Solicitação de Aprovação Prévia',
          message: `O chamado ${savedChamado.code} requer a aprovação do seu setor (${savedChamado.approverSector}).`,
          targetSector: savedChamado.approverSector,
          chamadoId: savedChamado.id
        })
      }
    }
  }

  const handleUpdateStatus = async (
    id: string,
    newStatus: ChamadoTI['status'],
    payload?: { approvalNotes?: string; rejectionReason?: string; resolutionNotes?: string; techName?: string }
  ) => {
    const targetItem = chamados.find(c => c.id === id)
    if (!targetItem) return

    let updatePayload: any = { status: newStatus }
    if (payload?.approvalNotes) updatePayload.approved_by = userName
    if (payload?.rejectionReason) updatePayload.rejection_reason = payload.rejectionReason
    if (payload?.resolutionNotes) updatePayload.resolution_notes = payload.resolutionNotes
    if (payload?.techName) updatePayload.assigned_tech = payload.techName

    let updatedComments = [...(targetItem.comments || [])]

    if (newStatus === 'concluido' && payload?.resolutionNotes) {
      updatedComments.push({
        id: Date.now().toString(),
        authorName: userName,
        authorSector: 'T.I',
        text: `✅ Devolutiva Técnica:\n${payload.resolutionNotes}`,
        createdAt: new Date().toISOString()
      })
      updatePayload.comments = updatedComments
    }

    const { data, error } = await supabase.from('ti_chamados').update(updatePayload).eq('id', id).select().single()
    if (error) console.error(error)
    
    if (data) {
      const updatedItem = mapToChamadoTI(data)
      setChamados(prev => prev.map(c => c.id === id ? updatedItem : c))
      if (selectedChamado?.id === id) setSelectedChamado(updatedItem)

      addNotification({
        title: `Chamado ${newStatus === 'aprovado' ? 'Aprovado' : newStatus === 'recusado' ? 'Recusado' : newStatus === 'em_atendimento' ? 'Em Atendimento' : 'Concluído'}`,
        message: `O status do chamado ${updatedItem.code} foi atualizado para "${newStatus.replace('_', ' ')}".`,
        targetUser: updatedItem.creatorName,
        chamadoId: id
      })
    }
  }

  const handleAddComment = async (id: string, commentText: string) => {
    const targetItem = chamados.find(c => c.id === id)
    if (!targetItem) return
    const newComment = {
      id: Date.now().toString(),
      authorName: userName,
      authorSector: userSector,
      text: commentText,
      createdAt: new Date().toISOString()
    }
    const updatedComments = [...(targetItem.comments || []), newComment]
    
    const { data } = await supabase.from('ti_chamados').update({ comments: updatedComments }).eq('id', id).select().single()
    if (data) {
      const updatedItem = mapToChamadoTI(data)
      setChamados(prev => prev.map(c => c.id === id ? updatedItem : c))
      if (selectedChamado?.id === id) setSelectedChamado(updatedItem)
    }
  }

  const handleRedirectChamado = async (id: string, newApproverSector: string, reason?: string) => {
    const targetItem = chamados.find(c => c.id === id)
    if (!targetItem) return
    const newComment = {
      id: Date.now().toString(),
      authorName: userName,
      authorSector: userSector,
      text: `🔄 Chamado redirecionado para aprovação do setor: ${newApproverSector}.${reason ? ` Motivo: ${reason}` : ''}`,
      createdAt: new Date().toISOString()
    }
    const updatedComments = [...(targetItem.comments || []), newComment]

    const { data } = await supabase.from('ti_chamados').update({ 
      approver_sector: newApproverSector, 
      status: 'pendente_aprovacao',
      comments: updatedComments
    }).eq('id', id).select().single()
    
    if (data) {
      const updatedItem = mapToChamadoTI(data)
      setChamados(prev => prev.map(c => c.id === id ? updatedItem : c))
      if (selectedChamado?.id === id) setSelectedChamado(updatedItem)

      addNotification({
        title: 'Chamado Redirecionado para Seu Setor',
        message: `O chamado ${updatedItem.code} foi redirecionado pela T.I para aprovação do setor ${newApproverSector}.${reason ? ` Motivo: ${reason}` : ''}`,
        targetSector: newApproverSector,
        chamadoId: id
      })
    }
  }

  const handleEditChamado = async (id: string, updatedFields: { title: string; priority: ChamadoTI['priority']; description: string }) => {
    const targetItem = chamados.find(c => c.id === id)
    if (!targetItem) return
    const newComment = {
      id: Date.now().toString(),
      authorName: userName,
      authorSector: userSector,
      text: `✏️ Solicitação editada pelo criador/setor.`,
      createdAt: new Date().toISOString()
    }
    const updatedComments = [...(targetItem.comments || []), newComment]

    const { data } = await supabase.from('ti_chamados').update({ 
      title: updatedFields.title,
      priority: updatedFields.priority,
      description: updatedFields.description,
      comments: updatedComments
    }).eq('id', id).select().single()
    
    if (data) {
      const updatedItem = mapToChamadoTI(data)
      setChamados(prev => prev.map(c => c.id === id ? updatedItem : c))
      if (selectedChamado?.id === id) setSelectedChamado(updatedItem)
    }
  }

  const handleDeleteChamado = async (id: string) => {
    await supabase.from('ti_chamados').delete().eq('id', id)
    setChamados(prev => prev.filter(c => c.id !== id))
    setSelectedChamado(null)
  }

  // Notificações relevantes ao usuário logado
  const relevantNotifications = notifications.filter(n =>
    !n.targetSector ||
    n.targetSector === userSector ||
    (userSector === 'T.I' && n.targetSector === 'T.I') ||
    userSector === 'Gestor/Diretoria' ||
    userSector === 'Gestor (Diogo)' ||
    (n.targetUser && n.targetUser.toLowerCase() === userName.toLowerCase())
  )

  const unreadCount = relevantNotifications.filter(n => !n.read).length

  const markAllNotificationsAsRead = async () => {
    await supabase.from('ti_notifications').update({ read: true }).in('id', relevantNotifications.map(n => n.id))
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const clearAllNotifications = async () => {
    const idsToDelete = relevantNotifications.map(n => n.id)
    if (idsToDelete.length > 0) {
      await supabase.from('ti_notifications').delete().in('id', idsToDelete)
      setNotifications(prev => prev.filter(n => !idsToDelete.includes(n.id)))
    }
  }

  const markNotificationAsRead = async (notifId: string) => {
    await supabase.from('ti_notifications').update({ read: true }).eq('id', notifId)
    setNotifications(notifications.map(n => n.id === notifId ? { ...n, read: true } : n))
  }

  // Filtragem baseada na aba
  const getTabChamados = () => {
    if (activeTab === 'aprovacoes') {
      return chamados.filter(c =>
        c.status === 'pendente_aprovacao' &&
        (c.approverSector === userSector || userSector === 'T.I' || userSector === 'Gestor/Diretoria' || userSector === 'Gestor (Diogo)')
      )
    }
    if (activeTab === 'ti') {
      // T.I / Diretoria vê tudo na fila
      return chamados
    }
    // 'meus'
    return chamados.filter(c => c.creatorSector === userSector || c.creatorName.toLowerCase() === userName.toLowerCase())
  }

  // Contagem para badges
  const pendingApprovalsCount = chamados.filter(c =>
    c.status === 'pendente_aprovacao' && (c.approverSector === userSector || userSector === 'T.I' || userSector === 'Gestor/Diretoria' || userSector === 'Gestor (Diogo)')
  ).length

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto w-full relative min-h-screen">

      {/* Top Header */}
      <div className="w-full bg-white border-b border-[#e6e9f2] sticky top-0 z-40 shadow-xs">
        <div className="px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-[11px] bg-[#1f29de] text-white flex items-center justify-center font-bold shadow-xs">
                <Monitor size={18} />
              </div>
              <div>
                <span className="font-display font-extrabold text-[#14161f] text-base leading-none block">Suporte T.I</span>
                <span className="eyebrow text-[9px] block mt-0.5">Módulo de Chamados Técnico</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-full bg-[#1f29de] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {userInitials}
              </div>
              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  localStorage.removeItem('userSector');
                  window.location.reload();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-red-100 text-red-500 hover:bg-red-50 cursor-pointer"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>

          {/* Tabs & Notifications & User Info */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 w-full md:w-auto">
            <div className="bg-[#fafbfe] border border-[#e6e9f2] rounded-[11px] p-1 flex items-center shadow-xs min-w-max shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('meus')}
                className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${activeTab === 'meus' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
              >
                Chamados do Setor
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('aprovacoes')}
                className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer relative flex items-center gap-1.5 ${activeTab === 'aprovacoes' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
              >
                <span>Aprovações Pendentes</span>
                {pendingApprovalsCount > 0 && (
                  <span className="w-4 h-4 bg-[#f4be56] text-[#14161f] rounded-full text-[10px] font-extrabold flex items-center justify-center">
                    {pendingApprovalsCount}
                  </span>
                )}
              </button>

              {(userSector === 'T.I' || userSector === 'Gestor/Diretoria' || userSector === 'Gestor (Diogo)') && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveTab('ti')}
                    className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${activeTab === 'ti' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
                  >
                    Fila T.I
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('historico')}
                    className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${activeTab === 'historico' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
                  >
                    Histórico T.I
                  </button>
                </>
              )}
            </div>

            <div className="hidden md:block w-px h-6 bg-[#e6e9f2]" />

            {/* Notification Bell & User badge */}
            <div className="hidden md:flex items-center gap-3">

              {/* Notification Bell */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
                  className="p-2 text-[#5b6276] hover:text-[#1f29de] hover:bg-[#eef4fa] rounded-[11px] border border-[#e6e9f2] transition-all relative cursor-pointer"
                  title="Central de Notificações"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Backdrop invisível para fechar ao clicar fora */}
                {showNotificationDropdown && (
                  <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setShowNotificationDropdown(false)}
                  />
                )}

                {/* Notifications Dropdown Popover */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <div className="flex items-center gap-2">
                        <Bell size={16} className="text-[#1f29de]" />
                        <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                          {unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : `Notificações (${relevantNotifications.length})`}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllNotificationsAsRead}
                            className="text-[11px] font-bold text-[#1f29de] hover:underline cursor-pointer"
                          >
                            Marcar Lidas
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={clearAllNotifications}
                          className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
                        >
                          Limpar Tudo
                        </button>
                      </div>
                    </div>

                    {relevantNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">
                        Nenhuma notificação no momento.
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {relevantNotifications.slice(0, 15).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              if (n.chamadoId) {
                                const found = chamados.find(c => c.id === n.chamadoId)
                                if (found) setSelectedChamado(found)
                              }
                              markNotificationAsRead(n.id)
                              setShowNotificationDropdown(false)
                            }}
                            className={`p-3 rounded-xl border transition-all cursor-pointer ${n.read ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-blue-50/60 border-blue-200'}`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-800">{n.title}</span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User badge */}
              <div className="flex items-center gap-2 bg-[#fafbfe] border border-[#e6e9f2] px-3 py-1.5 rounded-[11px]">
                <div className="w-7 h-7 rounded-full bg-[#1f29de] text-white flex items-center justify-center text-xs font-bold">
                  {userInitials}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-[#14161f]">{userName}</span>
                  <span className="text-[10px] font-semibold text-[#5b6276]">{userSector}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  await supabase.auth.signOut();
                  localStorage.removeItem('userSector');
                  window.location.reload();
                }}
                className="p-2 text-[#9097aa] hover:text-[#dc2f2f] hover:bg-[#feecec] rounded-[11px] transition-colors cursor-pointer"
                title="Sair da Conta"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="brand-filete-bar" />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'historico' ? (
          <div className="p-6 h-full flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Histórico de Chamados (Base de Conhecimento)</h2>
                <p className="text-xs text-slate-500 mt-1">Busque por chamados antigos concluídos ou recusados para consultar resoluções anteriores.</p>
              </div>
              <div className="relative w-72">
                <input
                  type="text"
                  placeholder="Buscar por título, código ou resolução..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-4 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-blue-500 shadow-sm transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {chamados
                .filter(c => (c.status === 'concluido' || c.status === 'recusado'))
                .filter(c => 
                  historySearch === '' || 
                  c.title.toLowerCase().includes(historySearch.toLowerCase()) || 
                  c.code.toLowerCase().includes(historySearch.toLowerCase()) || 
                  (c.resolutionNotes && c.resolutionNotes.toLowerCase().includes(historySearch.toLowerCase()))
                )
                .map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setSelectedChamado(c)}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-bold text-xs" style={{
                      backgroundColor: c.status === 'concluido' ? '#d1fae5' : '#fee2e2',
                      color: c.status === 'concluido' ? '#065f46' : '#991b1b'
                    }}>
                      {c.status === 'concluido' ? <CheckCircle size={18} /> : <X size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">{c.code}</span>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{c.title}</h4>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-2xl">{c.resolutionNotes || c.description}</p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4 mt-2 sm:mt-0">
                    <span className="text-[10px] font-bold text-slate-400 mb-1">Solicitado por: {c.creatorName}</span>
                    <span className="text-[10px] font-bold text-slate-400">Técnico: {c.assignedTech || 'N/A'}</span>
                    <span className="text-[10px] font-bold text-slate-400 mt-1">{new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ChamadosTiList
            chamados={getTabChamados()}
            userSector={userSector}
            userName={userName}
            onSelect={(c) => setSelectedChamado(c)}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <ChamadosTiCreateModal
          userSector={userSector}
          userName={userName}
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateChamado}
        />
      )}

      {/* Detail / Action Modal */}
      {selectedChamado && (
        <ChamadosTiDetailModal
          chamado={selectedChamado}
          userSector={userSector}
          userName={userName}
          onClose={() => setSelectedChamado(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
          onRedirect={handleRedirectChamado}
          onEditChamado={handleEditChamado}
          onDeleteChamado={handleDeleteChamado}
        />
      )}

    </div>
  )
}
