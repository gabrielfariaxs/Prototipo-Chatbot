import React, { useState, useEffect } from 'react'
import { Bell, LogOut } from 'lucide-react'
import { GopList } from './GopList'
import { GopDetail } from './GopDetail'
import { DemandasList } from './DemandasList'
import { supabase } from '../../lib/supabase'

export const GopPanel = ({ onPreviewFile }: { onPreviewFile?: (file: any) => void }) => {
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Usuário'
        setUserName(name)
        const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
        setUserInitials(initials)
      }
    })
  }, [])

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto w-full relative">
      <style>{`.brand-filete-bar { height: 3px; background: linear-gradient(90deg, #1f29de 0%, #1f29de 100%); }`}</style>
           {/* Top Header */}
      <div className="w-full bg-white border-b border-[#e6e9f2] sticky top-0 z-10 shadow-xs">
        <div className="px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div>
              <span className="font-display font-extrabold text-[#14161f] text-base leading-none block">Módulo NCO</span>
              <span className="eyebrow text-[9px] block mt-0.5">Não Conformidades Operacionais</span>
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
                className="w-8 h-8 flex items-center justify-center rounded-full border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 hide-scrollbar">
            <div className="bg-[#fafbfe] border border-[#e6e9f2] rounded-[11px] p-1 flex items-center shadow-xs min-w-max shrink-0">
              {userLevel !== 'colaborador' && (
                <button 
                  type="button"
                  onClick={() => { setActiveTab('lider'); setSelectedId(null); }}
                  className={`px-4 py-1.5 rounded-[8px] text-xs font-bold cursor-pointer transition-all ${activeTab === 'lider' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
                >
                  Líder de Setor
                </button>
              )}
              {userLevel !== 'colaborador' && (userSector === 'Operações' || userSector === 'Gestor (Diogo)' || userSector.toLowerCase().includes('qualidade')) && (
                <button 
                  type="button"
                  onClick={() => { setActiveTab('coo'); setSelectedId(null); }}
                  className={`px-4 py-1.5 rounded-[8px] text-xs font-bold cursor-pointer transition-all ${activeTab === 'coo' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
                >
                  Revisão COO / Qualidade
                </button>
              )}
              <button 
                type="button"
                onClick={() => setActiveTab('demandas')}
                className={`px-4 py-1.5 rounded-[8px] text-xs font-bold cursor-pointer transition-all ${activeTab === 'demandas' ? 'bg-[#1f29de] text-white shadow-xs' : 'text-[#5b6276] hover:text-[#14161f]'}`}
              >
                Demandas
              </button>
            </div>
            
            <div className="hidden md:block w-px h-6 bg-[#e6e9f2]"></div>
            
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div className="text-right flex flex-col justify-center">
                <span className="text-xs font-bold text-[#14161f] leading-tight">{userName}</span>
                <span className="text-[10px] text-[#5b6276] font-semibold leading-tight">
                  {userLevel === 'colaborador' ? 'Colaborador' : activeTab === 'coo' ? 'Diretor de Operações' : 'Líder de Setor'}
                </span>
              </div>
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
                className="w-8 h-8 flex items-center justify-center rounded-full border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
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
              {(userSector === 'Operações' || userSector === 'Gestor (Diogo)' || userSector.toLowerCase().includes('qualidade')) && (
                <div className={activeTab === 'coo' ? 'block' : 'hidden'}>
                  <GopList onSelect={setSelectedId} userRole="coo" userSector={userSector} />
                </div>
              )}
              {/* Demandas tab - always mounted, hidden when not active */}
              <div className={activeTab === 'demandas' ? 'block' : 'hidden'}>
                <DemandasList userSector={userSector} userRole={userLevel === 'coo' ? 'coo' : 'lider'} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
