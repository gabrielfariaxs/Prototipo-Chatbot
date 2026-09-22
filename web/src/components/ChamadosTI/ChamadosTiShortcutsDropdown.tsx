import React from 'react'
import { Activity, Globe, ShieldAlert, MonitorSmartphone, Mail, Calendar, CalendarCheck, CalendarDays, ExternalLink, HardDrive } from 'lucide-react'

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
    id: 'links-internet-geral',
    title: 'Links de Internet',
    description: 'Monitoramento de Redes (RN, PE, PB)',
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
    id: 'hospedagem-webmail',
    title: 'Hospedagem & E-mail',
    description: 'Servidores e E-mails Locais',
    action: 'hospedagem_modal',
    tag: 'Web',
    icon: HardDrive,
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200/60',
    iconBgColor: 'bg-orange-50 border-orange-200 text-orange-600',
    hoverBgColor: 'hover:bg-orange-50/80',
    hoverBorderColor: 'hover:border-orange-200',
  },
  {
    id: 'agendas-locais',
    title: 'Agendas Locais',
    description: 'Sistemas de Agendamento da Rede',
    action: 'agendas_modal',
    tag: 'Sistemas',
    icon: Calendar,
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200/60',
    iconBgColor: 'bg-violet-50 border-violet-200 text-violet-600',
    hoverBgColor: 'hover:bg-violet-50/80',
    hoverBorderColor: 'hover:border-violet-200',
  },
]

interface ChamadosTiShortcutsDropdownProps {
  isOpen: boolean
  onClose: () => void
  onOpenNetworkModal: () => void
  onOpenAgendasModal: () => void
  onOpenHospedagemModal: () => void
}

export const ChamadosTiShortcutsDropdown: React.FC<ChamadosTiShortcutsDropdownProps> = ({
  isOpen,
  onClose,
  onOpenNetworkModal,
  onOpenAgendasModal,
  onOpenHospedagemModal,
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

            if (item.action === 'agendas_modal') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenAgendasModal()
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-xl border border-transparent transition-all text-left cursor-pointer group ${hoverBgColor} ${hoverBorderColor}`}
                >
                  {content}
                </button>
              )
            }

            if (item.action === 'hospedagem_modal') {
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenHospedagemModal()
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
