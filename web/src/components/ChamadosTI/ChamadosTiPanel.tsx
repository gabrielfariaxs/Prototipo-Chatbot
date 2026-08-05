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

const INITIAL_MOCK_CHAMADOS: ChamadoTI[] = []
const INITIAL_MOCK_NOTIFICATIONS: TiNotification[] = []

export const ChamadosTiPanel: React.FC = () => {
  const [chamados, setChamados] = useState<ChamadoTI[]>([])
  const [selectedChamado, setSelectedChamado] = useState<ChamadoTI | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'meus' | 'aprovacoes' | 'ti'>('meus')
  
  const [userSector, setUserSector] = useState<string>('T.I')
  const [userLevel, setUserLevel] = useState<string>('lider')
  const [userName, setUserName] = useState<string>('Usuário T.I')
  const [userInitials, setUserInitials] = useState<string>('TI')

  const [notifications, setNotifications] = useState<TiNotification[]>([])
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)

  // Carregar setor/nível e chamados
  useEffect(() => {
    const savedSector = localStorage.getItem('userSector') || 'Gestor/Diretoria'
    const savedLevel = localStorage.getItem('userLevel') || 'lider'
    setUserSector(savedSector)
    setUserLevel(savedLevel)

    const savedChamados = localStorage.getItem('chamados_ti_items')
    if (savedChamados) {
      try {
        const parsed = JSON.parse(savedChamados)
        const cleaned = parsed.filter((c: any) => !c.id.startsWith('mock-') && c.id !== '1' && c.id !== '2' && c.id !== '3')
        setChamados(cleaned)
        localStorage.setItem('chamados_ti_items', JSON.stringify(cleaned))
      } catch (e) {
        setChamados([])
      }
    } else {
      setChamados([])
      localStorage.setItem('chamados_ti_items', JSON.stringify([]))
    }

    const savedNotifications = localStorage.getItem('chamados_ti_notifications')
    if (savedNotifications) {
      try {
        const parsedNotifs = JSON.parse(savedNotifications)
        const cleanedNotifs = parsedNotifs.filter((n: any) => !n.id.startsWith('notif-'))
        setNotifications(cleanedNotifs)
        localStorage.setItem('chamados_ti_notifications', JSON.stringify(cleanedNotifs))
      } catch (e) {
        setNotifications([])
      }
    } else {
      setNotifications([])
      localStorage.setItem('chamados_ti_notifications', JSON.stringify([]))
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário'
        setUserName(name)
        const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        setUserInitials(initials)
      }
    })
  }, [])

  // Salvar no localStorage sempre que houver alteração
  const saveChamados = (items: ChamadoTI[]) => {
    setChamados(items)
    localStorage.setItem('chamados_ti_items', JSON.stringify(items))
  }

  const saveNotifications = (items: TiNotification[]) => {
    setNotifications(items)
    localStorage.setItem('chamados_ti_notifications', JSON.stringify(items))
  }

  const addNotification = (notif: Omit<TiNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: TiNotification = {
      ...notif,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
      createdAt: new Date().toISOString(),
      read: false
    }
    const updated = [newNotif, ...notifications]
    saveNotifications(updated)
  }

  const handleCreateChamado = (newChamado: ChamadoTI) => {
    const updated = [newChamado, ...chamados]
    saveChamados(updated)

    // Gerar Notificação para a T.I
    addNotification({
      title: 'Novo Chamado de Suporte',
      message: `Novo chamado ${newChamado.code} (${newChamado.title}) foi aberto por ${newChamado.creatorName} (${newChamado.creatorSector}).`,
      targetSector: 'T.I',
      chamadoId: newChamado.id
    })

    // Se houver direcionamento para aprovação de outro setor
    if (newChamado.approverSector && newChamado.approverSector !== 'none' && newChamado.approverSector !== 'Sem Aprovação (Direto T.I)') {
      addNotification({
        title: 'Solicitação de Aprovação Prévia',
        message: `O chamado ${newChamado.code} requer a aprovação do seu setor (${newChamado.approverSector}).`,
        targetSector: newChamado.approverSector,
        chamadoId: newChamado.id
      })
    }
  }

  const handleUpdateStatus = (
    id: string, 
    newStatus: ChamadoTI['status'], 
    payload?: { approvalNotes?: string; rejectionReason?: string; resolutionNotes?: string; techName?: string }
  ) => {
    let targetItem: ChamadoTI | undefined
    const updated = chamados.map((item) => {
      if (item.id === id) {
        targetItem = item
        return {
          ...item,
          status: newStatus,
          approvedBy: payload?.approvalNotes ? userName : item.approvedBy,
          rejectionReason: payload?.rejectionReason ?? item.rejectionReason,
          resolutionNotes: payload?.resolutionNotes ?? item.resolutionNotes,
          assignedTech: payload?.techName ?? item.assignedTech
        }
      }
      return item
    })
    saveChamados(updated)
    if (selectedChamado && selectedChamado.id === id) {
      const updatedItem = updated.find(i => i.id === id) || null
      setSelectedChamado(updatedItem)
    }

    if (targetItem) {
      // Notificar o solicitante do chamado
      addNotification({
        title: `Chamado ${newStatus === 'aprovado' ? 'Aprovado' : newStatus === 'recusado' ? 'Recusado' : newStatus === 'em_atendimento' ? 'Em Atendimento' : 'Concluído'}`,
        message: `O status do chamado ${targetItem.code} foi atualizado para "${newStatus.replace('_', ' ')}".`,
        targetUser: targetItem.creatorName,
        chamadoId: id
      })
    }
  }

  const handleAddComment = (id: string, commentText: string) => {
    const newComment = {
      id: Date.now().toString(),
      authorName: userName,
      authorSector: userSector,
      text: commentText,
      createdAt: new Date().toISOString()
    }
    const updated = chamados.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          comments: [...(item.comments || []), newComment]
        }
      }
      return item
    })
    saveChamados(updated)
    if (selectedChamado && selectedChamado.id === id) {
      const updatedItem = updated.find(i => i.id === id) || null
      setSelectedChamado(updatedItem)
    }
  }

  const handleRedirectChamado = (id: string, newApproverSector: string, reason?: string) => {
    let targetItem: ChamadoTI | undefined
    const updated = chamados.map((item) => {
      if (item.id === id) {
        targetItem = item
        return {
          ...item,
          approverSector: newApproverSector,
          status: 'pendente_aprovacao' as const,
          comments: [
            ...(item.comments || []),
            {
              id: Date.now().toString(),
              authorName: userName,
              authorSector: userSector,
              text: `🔄 Chamado redirecionado para aprovação do setor: ${newApproverSector}.${reason ? ` Motivo: ${reason}` : ''}`,
              createdAt: new Date().toISOString()
            }
          ]
        }
      }
      return item
    })
    saveChamados(updated)
    if (selectedChamado && selectedChamado.id === id) {
      const updatedItem = updated.find(i => i.id === id) || null
      setSelectedChamado(updatedItem)
    }

    if (targetItem) {
      // Notificar o novo setor aprovação
      addNotification({
        title: 'Chamado Redirecionado para Seu Setor',
        message: `O chamado ${targetItem.code} foi redirecionado pela T.I para aprovação do setor ${newApproverSector}.${reason ? ` Motivo: ${reason}` : ''}`,
        targetSector: newApproverSector,
        chamadoId: id
      })
    }
  }

  const handleEditChamado = (id: string, updatedFields: { title: string; priority: ChamadoTI['priority']; description: string }) => {
    const updated = chamados.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...updatedFields,
          comments: [
            ...(item.comments || []),
            {
              id: Date.now().toString(),
              authorName: userName,
              authorSector: userSector,
              text: `✏️ Solicitação editada pelo criador/setor.`,
              createdAt: new Date().toISOString()
            }
          ]
        }
      }
      return item
    })
    saveChamados(updated)
    if (selectedChamado && selectedChamado.id === id) {
      const updatedItem = updated.find(i => i.id === id) || null
      setSelectedChamado(updatedItem)
    }
  }

  const handleDeleteChamado = (id: string) => {
    const updated = chamados.filter((item) => item.id !== id)
    saveChamados(updated)
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

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }))
    saveNotifications(updated)
  }

  const markNotificationAsRead = (notifId: string) => {
    const updated = notifications.map(n => n.id === notifId ? { ...n, read: true } : n)
    saveNotifications(updated)
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
      return chamados.filter(c => c.status === 'aprovado' || c.status === 'em_atendimento' || c.status === 'concluido')
    }
    return chamados
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
                Fluxo de Chamados
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
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllNotificationsAsRead}
                          className="text-[11px] font-bold text-[#1f29de] hover:underline cursor-pointer"
                        >
                          Limpar Lidas
                        </button>
                      )}
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
      <div className="flex-1">
        <ChamadosTiList 
          chamados={getTabChamados()}
          userSector={userSector}
          userName={userName}
          onSelect={(c) => setSelectedChamado(c)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />
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
