import React from 'react'
import { Bell } from 'lucide-react'
import type { TiNotification } from './ChamadosTiPanel'

interface ChamadosTiNotificationsDropdownProps {
  isOpen: boolean
  onClose: () => void
  unreadCount: number
  notifications: TiNotification[]
  onSelectNotification: (chamadoId?: string, notificationId?: string) => void
  onMarkAllAsRead: () => void
  onClearAll: () => void
}

export const ChamadosTiNotificationsDropdown: React.FC<ChamadosTiNotificationsDropdownProps> = ({
  isOpen,
  onClose,
  unreadCount,
  notifications,
  onSelectNotification,
  onMarkAllAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-transparent"
        onClick={onClose}
      />
      <div className="fixed left-3 right-3 md:left-auto md:right-8 top-[72px] mt-2 md:w-[380px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-[#1f29de]" />
            <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
              {unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : `Notificações (${notifications.length})`}
            </h4>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllAsRead}
                className="text-[11px] font-bold text-[#1f29de] hover:underline cursor-pointer"
              >
                Marcar Lidas
              </button>
            )}
            <button
              type="button"
              onClick={onClearAll}
              className="text-[11px] font-bold text-red-500 hover:underline cursor-pointer"
            >
              Limpar Tudo
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 font-medium">
            Nenhuma notificação no momento.
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {notifications.slice(0, 15).map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  onSelectNotification(n.chamadoId, n.id)
                  onClose()
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.read ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-blue-50/60 border-blue-200'
                }`}
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
    </>
  )
}
