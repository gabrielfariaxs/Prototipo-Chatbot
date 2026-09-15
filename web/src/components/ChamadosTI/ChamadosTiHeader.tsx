import React from 'react'
import { Monitor, Link2, ChevronDown, Bell, LogOut, ArrowLeft, X, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../lib/theme'

interface ChamadosTiHeaderProps {
  activeTab: 'meus' | 'aprovacoes' | 'ti' | 'historico'
  setActiveTab: (tab: 'meus' | 'aprovacoes' | 'ti' | 'historico') => void
  hasFullAccess: boolean
  isTiLeader: boolean
  isTi: boolean
  pendingApprovalsCount: number
  unreadCount: number
  shortcutsCount: number
  userName: string
  userSector: string
  userInitials: string
  showShortcutsDropdown: boolean
  onToggleShortcuts: () => void
  showNotificationDropdown: boolean
  onToggleNotifications: () => void
  onLogout: () => void
  onBackToMenu?: () => void
  onClose?: () => void
}

export const ChamadosTiHeader: React.FC<ChamadosTiHeaderProps> = ({
  activeTab,
  setActiveTab,
  hasFullAccess,
  isTiLeader,
  isTi,
  pendingApprovalsCount,
  unreadCount,
  shortcutsCount,
  userName,
  userSector,
  userInitials,
  showShortcutsDropdown,
  onToggleShortcuts,
  showNotificationDropdown,
  onToggleNotifications,
  onLogout,
  onBackToMenu,
  onClose,
}) => {
  const { isDark, toggleTheme } = useTheme()
  const canAccessShortcuts = isTiLeader || isTi || hasFullAccess

  const renderTabs = () => (
    <div className="bg-[#fafbfe] border border-[#e6e9f2] rounded-[11px] p-1 flex items-center shadow-xs shrink-0 min-w-max gap-0.5">
      <button
        type="button"
        onClick={() => setActiveTab('meus')}
        className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
          activeTab === 'meus'
            ? 'bg-[#1f29de] text-white shadow-xs'
            : 'text-[#5b6276] hover:text-[#14161f] hover:bg-slate-100/60'
        }`}
      >
        <span className="xl:hidden">{hasFullAccess ? 'Todos' : 'Setor'}</span>
        <span className="hidden xl:inline">
          {hasFullAccess ? 'Todos os Chamados' : 'Chamados do Setor'}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setActiveTab('aprovacoes')}
        className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap relative flex items-center gap-1.5 ${
          activeTab === 'aprovacoes'
            ? 'bg-[#1f29de] text-white shadow-xs'
            : 'text-[#5b6276] hover:text-[#14161f] hover:bg-slate-100/60'
        }`}
      >
        <span>Aprovações</span>
        {pendingApprovalsCount > 0 && (
          <span className="min-w-[18px] h-[18px] px-1 bg-[#f4be56] text-[#14161f] rounded-full text-[10px] font-extrabold flex items-center justify-center shrink-0 shadow-2xs">
            {pendingApprovalsCount}
          </span>
        )}
      </button>

      {hasFullAccess && (
        <>
          <button
            type="button"
            onClick={() => setActiveTab('ti')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'ti'
                ? 'bg-[#1f29de] text-white shadow-xs'
                : 'text-[#5b6276] hover:text-[#14161f] hover:bg-slate-100/60'
            }`}
          >
            <span>Fila T.I</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('historico')}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'historico'
                ? 'bg-[#1f29de] text-white shadow-xs'
                : 'text-[#5b6276] hover:text-[#14161f] hover:bg-slate-100/60'
            }`}
          >
            <span>Histórico</span>
          </button>
        </>
      )}
    </div>
  )

  const renderActions = (isCompact = false) => (
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 select-none">
      {canAccessShortcuts && (
        <button
          type="button"
          onClick={onToggleShortcuts}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-[11px] text-xs font-bold transition-all cursor-pointer shadow-2xs border shrink-0 whitespace-nowrap select-none min-w-max ${
            showShortcutsDropdown
              ? 'bg-[#1f29de] text-white border-[#1f29de] shadow-xs'
              : 'bg-white hover:bg-slate-50 border-[#d0d7e7] text-[#14161f] hover:text-[#1f29de] hover:border-[#1f29de]/40'
          }`}
          title="Atalhos rápidos e links úteis"
        >
          <div
            className={`w-5 h-5 rounded-[6px] flex items-center justify-center transition-colors shrink-0 ${
              showShortcutsDropdown ? 'bg-white/20 text-white' : 'bg-[#eef2fe] text-[#1f29de]'
            }`}
          >
            <Link2 size={12} strokeWidth={2.4} className="shrink-0" />
          </div>
          <span className="hidden sm:inline whitespace-nowrap font-bold text-xs shrink-0">Atalhos</span>
          <span
            className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-[5px] shrink-0 transition-colors ${
              showShortcutsDropdown ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {shortcutsCount}
          </span>
          <ChevronDown
            size={12}
            className={`shrink-0 transition-transform duration-200 ${
              showShortcutsDropdown ? 'rotate-180 text-white' : 'text-slate-400'
            }`}
          />
        </button>
      )}

      {/* Notification Bell */}
      <button
        type="button"
        onClick={onToggleNotifications}
        className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center rounded-[11px] border transition-all relative cursor-pointer ${
          showNotificationDropdown
            ? 'text-[#1f29de] bg-[#eef4fa] border-[#c7d7fc] shadow-2xs'
            : 'text-[#5b6276] hover:text-[#1f29de] hover:bg-[#eef4fa] border-[#e6e9f2]'
        }`}
        title="Central de Notificações"
      >
        <Bell size={16} className="shrink-0" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center border-2 border-white animate-pulse shrink-0">
            {unreadCount}
          </span>
        )}
      </button>

      {/* User Badge */}
      <div className="shrink-0 flex items-center gap-2 bg-[#fafbfe] border border-[#e6e9f2] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-[11px] min-w-max select-none">
        <div className="w-6 h-6 rounded-full bg-[#1f29de] text-white flex items-center justify-center text-[11px] font-bold shadow-2xs shrink-0">
          {userInitials}
        </div>
        {!isCompact && (
          <div className="hidden xl:flex flex-col shrink-0 text-left max-w-[130px]">
            <span className="text-xs font-bold text-[#14161f] whitespace-nowrap leading-tight truncate">
              {userName}
            </span>
            <span className="text-[10px] font-semibold text-[#5b6276] whitespace-nowrap leading-tight truncate">
              {userSector}
            </span>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        type="button"
        onClick={onLogout}
        className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center text-[#9097aa] hover:text-[#dc2f2f] hover:bg-[#feecec] rounded-[11px] border border-transparent hover:border-red-200 transition-colors cursor-pointer"
        title="Sair da Conta"
      >
        <LogOut size={15} className="shrink-0" />
      </button>

      {/* Close Modal/Screen Button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-[11px] border border-slate-200/80 transition-colors cursor-pointer ml-0.5"
          title="Fechar"
        >
          <X size={17} className="shrink-0" />
        </button>
      )}
    </div>
  )

  return (
    <div className="w-full bg-white border-b border-[#e6e9f2] sticky top-0 z-40 shadow-xs shrink-0">
      <div className="px-3 sm:px-5 lg:px-6 py-2.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 sm:gap-3">

        {/* Left: Back + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onBackToMenu && (
            <button
              type="button"
              onClick={onBackToMenu}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[11px] text-[#5b6276] hover:text-[#14161f] bg-[#f0f3fa] hover:bg-[#e4e9f5] border border-[#d8e0f0] transition-all cursor-pointer font-bold text-xs shrink-0 whitespace-nowrap shadow-2xs"
              title="Voltar ao Menu Principal"
            >
              <ArrowLeft size={15} className="shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Menu</span>
            </button>
          )}

          {onBackToMenu && (
            <div className="hidden sm:block w-px h-6 bg-[#e6e9f2] shrink-0" />
          )}

          {/* Logo Suporte T.I */}
          <div className="flex items-center gap-2.5 shrink-0 select-none">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[11px] bg-gradient-to-br from-purple-600 to-fuchsia-700 text-white flex items-center justify-center font-bold shadow-sm shadow-purple-500/20 shrink-0">
              <Monitor size={17} className="shrink-0" />
            </div>
            <div className="shrink-0">
              <span className="font-display font-extrabold text-[#14161f] text-sm sm:text-base leading-none block whitespace-nowrap">
                Suporte T.I
              </span>
              <span className="eyebrow text-[9px] block mt-0.5 whitespace-nowrap text-slate-500 font-semibold tracking-wider uppercase">
                Módulo Técnico
              </span>
            </div>
          </div>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center overflow-x-auto hide-scrollbar shrink-0 justify-start lg:justify-center">
          {renderTabs()}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center shrink-0">
          {renderActions(false)}
        </div>

      </div>
      <div className="brand-filete-bar" />
    </div>
  )
}
