import React, { useState, useEffect } from 'react'
import { Bell, LogOut, Monitor, Plus, CheckCircle, Clock, ShieldAlert } from 'lucide-react'
import type { ChamadoTI } from './types'
import { ChamadosTiList } from './ChamadosTiList'
import { ChamadosTiCreateModal } from './ChamadosTiCreateModal'
import { ChamadosTiDetailModal } from './ChamadosTiDetailModal'
import { supabase } from '../../lib/supabase'

const INITIAL_MOCK_CHAMADOS: ChamadoTI[] = []

export const ChamadosTiPanel: React.FC = () => {
  const [chamados, setChamados] = useState<ChamadoTI[]>([])
  const [selectedChamado, setSelectedChamado] = useState<ChamadoTI | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'meus' | 'aprovacoes' | 'ti'>('meus')
  
  const [userSector, setUserSector] = useState<string>('T.I')
  const [userLevel, setUserLevel] = useState<string>('lider')
  const [userName, setUserName] = useState<string>('Usuário T.I')
  const [userInitials, setUserInitials] = useState<string>('TI')

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
        const cleaned = parsed.filter((c: any) => c.id !== '1' && c.id !== '2' && c.id !== '3')
        setChamados(cleaned)
        localStorage.setItem('chamados_ti_items', JSON.stringify(cleaned))
      } catch (e) {
        setChamados([])
      }
    } else {
      setChamados([])
      localStorage.setItem('chamados_ti_items', JSON.stringify([]))
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

  const handleCreateChamado = (newChamado: ChamadoTI) => {
    const updated = [newChamado, ...chamados]
    saveChamados(updated)
  }

  const handleUpdateStatus = (
    id: string, 
    newStatus: ChamadoTI['status'], 
    payload?: { approvalNotes?: string; rejectionReason?: string; resolutionNotes?: string; techName?: string }
  ) => {
    const updated = chamados.map((item) => {
      if (item.id === id) {
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
    const updated = chamados.map((item) => {
      if (item.id === id) {
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
  }

  // Filtragem baseada na aba
  const getTabChamados = () => {
    if (activeTab === 'aprovacoes') {
      return chamados.filter(c => c.approverSector === userSector || userSector === 'Gestor/Diretoria' || userSector === 'Gestor (Diogo)')
    }
    if (activeTab === 'ti') {
      return chamados.filter(c => c.status === 'aprovado' || c.status === 'em_atendimento' || c.status === 'concluido')
    }
    // Aba 'meus' (chamados criados pelo usuário ou seu setor)
    return chamados
  }

  // Contagem para badges
  const pendingApprovalsCount = chamados.filter(c => 
    c.status === 'pendente_aprovacao' && (c.approverSector === userSector || userSector === 'Gestor/Diretoria' || userSector === 'Gestor (Diogo)')
  ).length

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto w-full relative min-h-screen">
      
      {/* Top Header */}
      <div className="w-full bg-white border-b border-[#e6e9f2] sticky top-0 z-20 shadow-xs">
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

          {/* Tabs & User Info */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <div className="bg-[#fafbfe] border border-[#e6e9f2] rounded-[11px] p-1 flex items-center shadow-xs min-w-max shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('meus')}
                className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${activeTab === 'meus' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
              >
                Todos / Meus Chamados
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

              {userSector === 'T.I' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('ti')}
                  className={`px-4 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer ${activeTab === 'ti' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
                >
                  Fila de Atendimento T.I
                </button>
              )}
            </div>

            <div className="hidden md:block w-px h-6 bg-[#e6e9f2]" />

            {/* User badge */}
            <div className="hidden md:flex items-center gap-3">
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

      {/* Detail Modal */}
      {selectedChamado && (
        <ChamadosTiDetailModal 
          chamado={selectedChamado}
          userSector={userSector}
          userName={userName}
          onClose={() => setSelectedChamado(null)}
          onUpdateStatus={handleUpdateStatus}
          onAddComment={handleAddComment}
          onRedirect={handleRedirectChamado}
        />
      )}

    </div>
  )
}
