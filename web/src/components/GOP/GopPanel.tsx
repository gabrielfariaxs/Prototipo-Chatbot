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
  const [userSector, setUserSector] = useState<string>('T.I')

  useEffect(() => {
    const savedSector = localStorage.getItem('userSector')
    if (savedSector) {
      setUserSector(savedSector)
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

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto w-full relative">
      
      {/* Top Header - GOP Specific */}
      <div className="w-full bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          {/* Logo was already in the main header, but we can put breadcrumbs or just leave empty */}
          <span className="font-bold text-[#1a2332] text-sm tracking-widest uppercase">Módulo NCO</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="bg-slate-100 rounded-lg p-1 flex items-center shadow-inner">
            <button 
              onClick={() => setActiveTab('lider')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${activeTab === 'lider' ? 'bg-[#1a2332] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Líder de Setor
            </button>
            {userSector === 'Operações' && (
              <button 
                onClick={() => setActiveTab('coo')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${activeTab === 'coo' ? 'bg-[#1a2332] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Revisão COO
              </button>
            )}
            <button 
              onClick={() => setActiveTab('demandas')}
              className={`px-4 py-1.5 rounded-md text-xs font-bold cursor-pointer transition-colors ${activeTab === 'demandas' ? 'bg-[#1a2332] text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Demandas
            </button>
          </div>
          <div className="w-px h-6 bg-slate-200"></div>
          <button className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 cursor-pointer transition-colors">
            <Bell size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right flex flex-col justify-center">
              <span className="text-xs font-bold text-slate-800 leading-tight">{userName}</span>
              <span className="text-[10px] text-slate-400 font-semibold leading-tight">{activeTab === 'coo' ? 'Diretor de Operações' : 'Líder de Setor'}</span>
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

      {/* Content */}
      <div className="w-full flex-1">
        {activeTab === 'demandas' ? (
          <DemandasList userSector={userSector} userRole={activeTab} />
        ) : selectedId ? (
          <GopDetail id={selectedId} onBack={() => setSelectedId(null)} userRole={activeTab} onPreviewFile={onPreviewFile} />
        ) : (
          <GopList onSelect={setSelectedId} userRole={activeTab} userSector={userSector} />
        )}
      </div>
    </div>
  )
}
