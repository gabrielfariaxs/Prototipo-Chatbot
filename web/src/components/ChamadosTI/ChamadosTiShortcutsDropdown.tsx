import React from 'react'
import { Activity, Globe, Server, Mail, Calendar, CalendarCheck, CalendarDays, ExternalLink } from 'lucide-react'

export interface TiShortcutItem {
  id: string
  title: string
  description?: string
  url?: string
  action?: 'network_modal'
  tag?: string
  icon?: React.ComponentType<{ size?: number; className?: string }>
  badgeColor?: string
  iconBgColor?: string
  hoverBgColor?: string
  hoverBorderColor?: string
}

/**
 * Lista central e dinâmica de Atalhos Rápidos da T.I.
 * Para adicionar um novo atalho, basta adicionar um novo objeto nesta lista.
 * A contagem e a renderização nos botões e no modal acontecem 100% automaticamente!
 */
export const TI_SHORTCUTS: TiShortcutItem[] = [
  {
    id: 'links-internet',
    title: 'Links de Internet',
    description: 'Monitoramento Arthromed RN & PE',
    action: 'network_modal',
    tag: 'Online',
    icon: Activity,
    badgeColor: 'bg-emerald-200/80 text-emerald-900',
    iconBgColor: 'bg-emerald-100 border-emerald-200 text-emerald-700',
    hoverBgColor: 'hover:bg-emerald-50/80',
    hoverBorderColor: 'hover:border-emerald-200',
  },
  {
    id: 'pws',
    title: 'Portal PWS',
    description: 'Portal de Serviços Web PSFX',
    url: 'https://psfx.com.br/pws/index.php/pws',
    tag: 'PWS',
    icon: Globe,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200/60',
    iconBgColor: 'bg-blue-50 border-blue-200 text-[#1f29de]',
    hoverBgColor: 'hover:bg-blue-50/80',
    hoverBorderColor: 'hover:border-blue-200',
  },
  {
    id: 'kinghost',
    title: 'Painel KingHost',
    description: 'Gerenciamento KingHost & Domínios',
    url: 'https://login.kinghost.com.br/?referrer=https:%2F%2Fpainel.kinghost.com.br%2Findex.php',
    tag: 'Hospedagem',
    icon: Server,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200/60',
    iconBgColor: 'bg-amber-50 border-amber-200 text-amber-600',
    hoverBgColor: 'hover:bg-amber-50/80',
    hoverBorderColor: 'hover:border-amber-200',
  },
  {
    id: 'locaweb',
    title: 'E-mail Locaweb',
    description: 'Painel de E-mail Corporativo',
    url: 'https://login-new.locaweb.com.br/login?service=https%3A%2F%2Fpainel-email.locaweb.com.br%2F',
    tag: 'Locaweb',
    icon: Mail,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200/60',
    iconBgColor: 'bg-rose-50 border-rose-200 text-rose-600',
    hoverBgColor: 'hover:bg-rose-50/80',
    hoverBorderColor: 'hover:border-rose-200',
  },
  {
    id: 'agenda-arthromed',
    title: 'Agenda Arthromed',
    description: 'Agendamentos & Cirurgias (Rede Local)',
    url: 'http://192.168.100.117/arthromed/agenda.php',
    tag: 'Intranet',
    icon: Calendar,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200/60',
    iconBgColor: 'bg-teal-50 border-teal-200 text-teal-600',
    hoverBgColor: 'hover:bg-teal-50/80',
    hoverBorderColor: 'hover:border-teal-200',
  },
  {
    id: 'agenda-medicpa',
    title: 'Agenda Medic PA',
    description: 'Agendamentos & Cirurgias Medic PA (Rede Local)',
    url: 'http://192.168.100.117/medicpa/agenda.php',
    tag: 'Medicpa',
    icon: CalendarCheck,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200/60',
    iconBgColor: 'bg-purple-50 border-purple-200 text-purple-600',
    hoverBgColor: 'hover:bg-purple-50/80',
    hoverBorderColor: 'hover:border-purple-200',
  },
  {
    id: 'agenda-medicpe',
    title: 'Agenda Medic PE',
    description: 'Agendamentos & Cirurgias Medic PE (Rede Local)',
    url: 'http://192.168.100.117/medicpe/agenda.php',
    tag: 'Medicpe',
    icon: CalendarDays,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200/60',
    iconBgColor: 'bg-indigo-50 border-indigo-200 text-indigo-600',
    hoverBgColor: 'hover:bg-indigo-50/80',
    hoverBorderColor: 'hover:border-indigo-200',
  },
]

interface ChamadosTiShortcutsDropdownProps {
  isOpen: boolean
  onClose: () => void
  onOpenNetworkModal: () => void
}

export const ChamadosTiShortcutsDropdown: React.FC<ChamadosTiShortcutsDropdownProps> = ({
  isOpen,
  onClose,
  onOpenNetworkModal,
}) => {
  if (!isOpen) return null

  const shortcutsCount = TI_SHORTCUTS.length

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="fixed left-3 right-3 sm:left-auto sm:right-6 lg:right-28 top-[68px] sm:w-84 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-3 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
        <div className="px-3 py-2 mb-2 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1f29de] animate-pulse" />
            <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider">
              Atalhos Rápidos
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#1f29de] bg-[#eef2fe] px-2 py-0.5 rounded-full">
            {shortcutsCount} {shortcutsCount === 1 ? 'atalho' : 'atalhos'}
          </span>
        </div>

        <div className="space-y-1.5">
          {TI_SHORTCUTS.map((item) => {
            const IconComponent = item.icon || Globe
            const badgeColor = item.badgeColor || 'bg-blue-100 text-blue-800 border-blue-200/60'
            const iconBgColor = item.iconBgColor || 'bg-blue-50 border-blue-200 text-[#1f29de]'
            const hoverBgColor = item.hoverBgColor || 'hover:bg-blue-50/80'
            const hoverBorderColor = item.hoverBorderColor || 'hover:border-blue-200'

            const content = (
              <>
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 group-hover:scale-105 transition-all shadow-2xs ${iconBgColor}`}
                >
                  <IconComponent
                    size={17}
                    className={item.id === 'links-internet' ? 'animate-pulse' : ''}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-slate-950 transition-colors truncate">
                      {item.title}
                    </span>
                    {item.tag && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-extrabold flex items-center gap-0.5 shrink-0 ${badgeColor}`}
                      >
                        {item.tag} {item.url && <ExternalLink size={9} />}
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </>
            )

            if (item.action === 'network_modal') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenNetworkModal()
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all text-left cursor-pointer group ${hoverBgColor} ${hoverBorderColor}`}
                >
                  {content}
                </button>
              )
            }

            return (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all text-left cursor-pointer group ${hoverBgColor} ${hoverBorderColor}`}
              >
                {content}
              </a>
            )
          })}
        </div>
      </div>
    </>
  )
}
