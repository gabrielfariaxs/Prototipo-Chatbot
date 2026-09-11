import React from 'react'
import { X, Activity, ExternalLink, Wifi, Server, MonitorSmartphone } from 'lucide-react'

interface ChamadosTiNetworkModalProps {
  onClose: () => void
}

const DASHBOARDS = [
  {
    id: 'rn',
    name: 'Arthromed RN',
    subtitle: 'Filial Rio Grande do Norte',
    url: 'http://192.168.100.73:3001/status/rn',
    color: 'emerald',
    bgColor: 'bg-emerald-500',
    lightBg: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-700',
    hoverBorder: 'hover:border-emerald-400'
  },
  {
    id: 'pe',
    name: 'Arthromed PE (Matriz)',
    subtitle: 'Matriz Pernambuco',
    url: 'http://192.168.100.73:3001/status/matriz',
    color: 'blue',
    bgColor: 'bg-blue-600',
    lightBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    hoverBorder: 'hover:border-blue-400'
  }
]

export const ChamadosTiNetworkModal: React.FC<ChamadosTiNetworkModalProps> = ({ onClose }) => {
  const handleOpenExternal = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleOpenBoth = () => {
    DASHBOARDS.forEach(d => {
      window.open(d.url, '_blank', 'noopener,noreferrer')
    })
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#1a2332] text-white px-6 py-5 flex items-center justify-between gap-3 shrink-0 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-inner">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-extrabold text-xl leading-tight">
                  Monitoramento de Links
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase rounded-md tracking-wider">
                  T.I
                </span>
              </div>
              <p className="text-sm text-slate-300">
                Dashboards Uptime Kuma • Acesso Direto
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer relative z-10"
            title="Fechar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Network Access Notice Banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex items-start gap-3 text-sm text-amber-900">
          <Wifi size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold mb-1">Conexão Local Necessária</p>
            <p className="text-amber-800/80 leading-relaxed text-xs">
              Os dashboards operam em rede fechada no servidor <code className="bg-amber-200/50 px-1.5 py-0.5 rounded font-mono font-bold text-amber-900">192.168.100.73:3001</code>. Devido ao bloqueio de segurança do navegador nativo, os links devem ser abertos em <strong>nova aba</strong>. Certifique-se de estar na Wi-Fi ou VPN.
            </p>
          </div>
        </div>

        {/* Cards Launchpad */}
        <div className="p-6 bg-slate-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {DASHBOARDS.map((dashboard) => (
              <div 
                key={dashboard.id}
                onClick={() => handleOpenExternal(dashboard.url)}
                className={`group relative flex flex-col justify-between p-5 rounded-2xl border-2 ${dashboard.borderColor} ${dashboard.lightBg} ${dashboard.hoverBorder} transition-all cursor-pointer shadow-sm hover:shadow-md overflow-hidden`}
              >
                {/* Decorative background element */}
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${dashboard.bgColor} opacity-5 group-hover:scale-150 transition-transform duration-500`} />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl ${dashboard.bgColor} text-white shadow-sm flex items-center justify-center`}>
                      <Server size={20} />
                    </div>
                    <ExternalLink size={18} className={`${dashboard.textColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  
                  <div>
                    <h4 className={`text-lg font-extrabold ${dashboard.textColor} mb-1`}>{dashboard.name}</h4>
                    <p className={`text-xs font-semibold ${dashboard.textColor} opacity-70`}>{dashboard.subtitle}</p>
                  </div>
                </div>

                <div className="relative z-10 mt-5 pt-4 border-t border-black/5 flex items-center justify-between">
                  <code className={`text-[10px] font-mono font-bold ${dashboard.textColor} opacity-60`}>
                    192.168.100.73:3001
                  </code>
                  <span className={`text-xs font-bold ${dashboard.textColor} flex items-center gap-1 group-hover:translate-x-1 transition-transform`}>
                    Acessar <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleOpenBoth}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer hover:-translate-y-0.5"
            >
              <MonitorSmartphone size={18} />
              <span>Abrir os 2 Dashboards Simultaneamente</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
