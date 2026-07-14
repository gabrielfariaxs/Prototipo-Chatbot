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
      
      {/* Top Header */}
      <div className="w-full bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-10 gap-3">
        <div className="flex items-center justify-between w-full md:w-auto">
          <span className="font-bold text-[#1a2332] text-sm tracking-widest uppercase">Módulo NCO</span>
          <div className="flex items-center gap-2 md:hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
              {userInitials}
            </div>
            <button 
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
          <div className="bg-slate-100 rounded-lg p-1 flex items-center shadow-inner min-w-max shrink-0">
            {userLevel !== 'colaborador' && (
              <button 
                onClick={() => { setActiveTab('lider'); setSelectedId(null); }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${activeTab === 'lider' ? 'bg-[#1a2332] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Líder de Setor
              </button>
            )}
            {userLevel !== 'colaborador' && userSector === 'Operações' && (
              <button 
                onClick={() => { setActiveTab('coo'); setSelectedId(null); }}
                className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${activeTab === 'coo' ? 'bg-[#1a2332] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Revisão COO / Qualidade
              </button>
            )}
            <button 
              onClick={() => setActiveTab('demandas')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${activeTab === 'demandas' ? 'bg-[#1a2332] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Demandas
            </button>
          </div>
          
          <div className="hidden md:block w-px h-6 bg-slate-200"></div>
          
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
              <Bell size={16} />
            </button>
            <div className="text-right flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-800 leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-400 font-semibold leading-tight">
                {userLevel === 'colaborador' ? 'Colaborador' : activeTab === 'coo' ? 'Diretor de Operações' : 'Líder de Setor'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-md">
              {userInitials}
            </div>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                localStorage.removeItem('userSector');
                window.location.reload();
              }}
              className="ml-2 w-8 h-8 flex items-center justify-center rounded-full border border-red-100 text-red-500 hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors"
              title="Sair da conta"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
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
              {userSector === 'Operações' && (
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
