import React, { useState, useEffect } from 'react'
import { LogOut, ArrowLeft, X, Layers } from 'lucide-react'
import { GopList } from './GopList'
import { GopDetail } from './GopDetail'
import { DemandasList } from './DemandasList'
import { supabase } from '../../lib/supabase'

interface GopPanelProps {
  onPreviewFile?: (file: any) => void
  onBackToMenu?: () => void
  onClose?: () => void
}

export const GopPanel: React.FC<GopPanelProps> = ({ 
  onPreviewFile, 
  onBackToMenu, 
  onClose 
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('Usuário')
  const [userInitials, setUserInitials] = useState<string>('US')
  const [activeTab, setActiveTab] = useState<'lider' | 'coo' | 'demandas'>('lider')
  const [userSector, setUserSector] = useState<string>('')
  const [userLevel, setUserLevel] = useState<string>('lider')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const savedSector = localStorage.getItem('userSector') || 'T.I'
    const savedLevel = localStorage.getItem('userLevel') || 'lider'
    setUserSector(savedSector)
    setUserLevel(savedLevel)
    if (savedLevel === 'colaborador') {
      setActiveTab('demandas')
    }
    setReady(true)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário'
        setUserName(name)
        const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        setUserInitials(initials)
      }
    })
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] w-full relative overflow-y-auto min-h-0 h-full pb-16">
      <style>{`.brand-filete-bar { height: 3px; background: linear-gradient(90deg, #1f29de 0%, #4338ca 100%); }`}</style>
      
      {/* Top Header */}
      <div className="w-full bg-white border-b border-[#e6e9f2] sticky top-0 z-40 shadow-xs shrink-0">
        <div className="px-3 sm:px-5 lg:px-6 py-2.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-2.5 sm:gap-3">

          {/* Left section: Back button + Divider + Brand Logo */}
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

            {/* Logo / Title */}
            <div className="flex items-center gap-2.5 shrink-0 select-none">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[11px] bg-gradient-to-br from-indigo-600 to-violet-700 text-white flex items-center justify-center font-bold shadow-sm shadow-indigo-500/20 shrink-0">
                <Layers size={17} className="shrink-0" />
              </div>
              <div className="shrink-0">
                <span className="font-display font-extrabold text-[#14161f] text-sm sm:text-base leading-none block whitespace-nowrap">
                  Módulo NCO
                </span>
                <span className="eyebrow text-[9px] block mt-0.5 whitespace-nowrap text-slate-500 font-semibold tracking-wider uppercase">
                  Não Conformidades Operacionais
                </span>
              </div>
            </div>
          </div>

          {/* Center section: Navigation tabs pill */}
          <div className="flex items-center overflow-x-auto hide-scrollbar shrink-0 justify-start lg:justify-center">
            <div className="bg-[#fafbfe] border border-[#e6e9f2] rounded-[11px] p-1 flex items-center shadow-xs min-w-max shrink-0 gap-0.5">
              {userLevel !== 'colaborador' && (
                <button 
                  type="button"
                  onClick={() => { setActiveTab('lider'); setSelectedId(null); }}
                  className={`px-3 sm:px-4 py-1.5 rounded-[8px] text-xs font-bold cursor-pointer transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'lider' 
                      ? 'bg-[#1f29de] text-white shadow-xs' 
                      : 'text-[#5b6276] hover:text-[#14161f] hover:bg-slate-100/60'
                  }`}
                >
                  Líder de Setor
                </button>
              )}
              {userLevel !== 'colaborador' && (
                userSector === 'Operações' || 
                userSector === 'Gestor (Diogo)' || 
                userSector === 'Gestor/Diretoria' ||
                userSector.toLowerCase().includes('gestor') ||
                userSector.toLowerCase().includes('diretoria') ||
                userSector.toLowerCase().includes('qualidade') ||
                userLevel === 'coo'
              ) && (
                <button 
                  type="button"
                  onClick={() => { setActiveTab('coo'); setSelectedId(null); }}
                  className={`px-3 sm:px-4 py-1.5 rounded-[8px] text-xs font-bold cursor-pointer transition-all shrink-0 whitespace-nowrap ${
                    activeTab === 'coo' 
                      ? 'bg-[#1f29de] text-white shadow-xs' 
                      : 'text-[#5b6276] hover:text-[#14161f] hover:bg-slate-100/60'
                  }`}
                >
                  Revisão COO / Qualidade
                </button>
              )}
              <button 
                type="button"
                onClick={() => setActiveTab('demandas')}
                className={`px-3 sm:px-4 py-1.5 rounded-[8px] text-xs font-bold cursor-pointer transition-all shrink-0 whitespace-nowrap ${
                  activeTab === 'demandas' 
                    ? 'bg-[#1f29de] text-white shadow-xs' 
                    : 'text-[#5b6276] hover:text-[#14161f] hover:bg-slate-100/60'
                }`}
              >
                Demandas
              </button>
            </div>
          </div>

          {/* Right section: User Card + Logout + Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 select-none">
            <div className="shrink-0 flex items-center gap-2.5 bg-[#fafbfe] border border-[#e6e9f2] px-2.5 py-1 rounded-[10px] min-w-max select-none">
              <div className="w-6 h-6 rounded-full bg-[#1f29de] text-white flex items-center justify-center text-[11px] font-bold shadow-2xs shrink-0">
                {userInitials}
              </div>
              <div className="hidden md:flex flex-col shrink-0 text-left max-w-[130px]">
                <span className="text-xs font-bold text-[#14161f] whitespace-nowrap leading-tight truncate">{userName}</span>
                <span className="text-[10px] text-[#5b6276] font-semibold whitespace-nowrap leading-tight truncate">
                  {userLevel === 'colaborador' ? 'Colaborador' : (activeTab === 'coo' || userSector.toLowerCase().includes('gestor') || userSector.toLowerCase().includes('diretoria')) ? 'Diretor de Operações / Gestor' : 'Líder de Setor'}
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem('userSector');
                window.location.reload();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center text-[#9097aa] hover:text-[#dc2f2f] hover:bg-[#feecec] rounded-[10px] border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              title="Sair da Conta"
            >
              <LogOut size={15} className="shrink-0" />
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-[10px] border border-slate-200/80 transition-colors cursor-pointer ml-0.5"
                title="Fechar"
              >
                <X size={17} className="shrink-0" />
              </button>
            )}
          </div>

        </div>
        <div className="brand-filete-bar" />
      </div>

      {/* Content - Both tabs rendered simultaneously, hidden via CSS */}
      {ready && (
        <div className="w-full flex-1 relative">
          {selectedId ? (
            <GopDetail 
              id={selectedId} 
              onBack={() => setSelectedId(null)} 
              userRole={activeTab as 'lider' | 'coo'} 
              onPreviewFile={onPreviewFile} 
            />
          ) : (
            <>
              {/* Não Conformidades tabs - always mounted, hidden when not active */}
              <div className={activeTab === 'lider' ? 'block' : 'hidden'}>
                <GopList onSelect={setSelectedId} userRole="lider" userSector={userSector} />
              </div>
              {(
                userSector === 'Operações' || 
                userSector === 'Gestor (Diogo)' || 
                userSector === 'Gestor/Diretoria' ||
                userSector.toLowerCase().includes('gestor') ||
                userSector.toLowerCase().includes('diretoria') ||
                userSector.toLowerCase().includes('qualidade') ||
                userLevel === 'coo'
              ) && (
                <div className={activeTab === 'coo' ? 'block' : 'hidden'}>
                  <GopList onSelect={setSelectedId} userRole="coo" userSector={userSector} />
                </div>
              )}
              {/* Demandas tab - always mounted, hidden when not active */}
              <div className={activeTab === 'demandas' ? 'block' : 'hidden'}>
                <DemandasList userSector={userSector} userRole={(userLevel === 'coo' || userSector.toLowerCase().includes('gestor') || userSector.toLowerCase().includes('diretoria')) ? 'coo' : 'lider'} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
