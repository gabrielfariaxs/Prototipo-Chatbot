import { createFileRoute } from '@tanstack/react-router'
import { ChatWidget } from '../components/ChatWidget'
import { MessageCircle, ArrowRight, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { LoginScreen } from '../components/LoginScreen'
import type { Session } from '@supabase/supabase-js'

type IndexSearch = {
  desktop?: boolean
  extension?: boolean
}

export const Route = createFileRoute('/')({ 
  component: App,
  validateSearch: (search: Record<string, unknown>): IndexSearch => {
    return {
      desktop: search.desktop === 'true' || search.desktop === true,
      extension: search.extension === 'true' || search.extension === true,
    }
  },
})

function App() {
  const { desktop, extension } = Route.useSearch()
  
  // Persiste a flag no localStorage para evitar que se perca quando o router limpa a URL após o login
  if (typeof window !== 'undefined') {
    if (desktop || window.location.search.includes('desktop=true')) {
      localStorage.setItem('media_is_desktop', 'true')
    }
    if (extension || window.location.search.includes('extension=true')) {
      localStorage.setItem('media_is_extension', 'true')
    }
  }

  const isDesktop = desktop || 
    (typeof window !== 'undefined' && window.location.search.includes('desktop=true')) ||
    (typeof window !== 'undefined' && localStorage.getItem('media_is_desktop') === 'true')
    
  const isExtension = extension || 
    (typeof window !== 'undefined' && window.location.search.includes('extension=true')) ||
    (typeof window !== 'undefined' && localStorage.getItem('media_is_extension') === 'true')

  const [session, setSession] = useState<Session | null>(null)
  const [sessionChecked, setSessionChecked] = useState(false)

  useEffect(() => {
    // 1. Verifica sessão inicial no carregamento do cliente
    supabase.auth.getSession()
      .then(({ data: { session } }: { data: { session: Session | null } }) => {
        setSession(session)
        setSessionChecked(true)
      })
      .catch((err: any) => {
        console.error('Erro ao verificar sessão do Supabase:', err)
        setSessionChecked(true) // Libera a splash screen mesmo com erro
      })

    // 2. Escuta mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setSession(session)
      setSessionChecked(true)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // Splash Screen de Carregamento para evitar Hydration Mismatch no SSR
  if (!sessionChecked) {
    return (
      <main className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-12 h-12 bg-[#1e293b] rounded-xl flex items-center justify-center shadow-md mb-4">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h1v2H9V9zm5 0h1v2h-1V9z" />
            </svg>
          </div>
          <span className="text-xs font-bold tracking-widest text-[#64748b] uppercase">Carregando MedIA...</span>
        </div>
      </main>
    )
  }

  // Se não houver sessão ativa, exige login
  if (!session) {
    return <LoginScreen onSuccess={() => {}} />
  }

  // Se estiver autenticado e for modo Desktop (Widget)
  if (isDesktop) {
    return (
      <main className="fixed inset-0 pointer-events-none">
        <style dangerouslySetInnerHTML={{__html: `
          body, html, #root, #app { background: transparent !important; overflow: hidden !important; }
          body::before, body::after { display: none !important; opacity: 0 !important; }
        `}} />
        <div className="pointer-events-auto h-full w-full relative">
          <ChatWidget isDesktop={true} />
        </div>
      </main>
    )
  }

  // Se estiver autenticado e for modo Extensão
  if (isExtension) {
    return (
      <main className="fixed inset-0 pointer-events-none">
        <style dangerouslySetInnerHTML={{__html: `
          html, body, #root, #app, main {
            background: transparent !important;
            background-color: transparent !important;
            background-image: none !important;
            overflow: hidden !important;
          }
          body::before, body::after { display: none !important; }
        `}} />
        <div className="pointer-events-auto h-full w-full relative">
          <ChatWidget />
        </div>
      </main>
    )
  }

  // Interface Web padrão (Portal)
  return (
    <main className="min-h-screen flex items-center justify-center px-8 relative bg-[#f8fafc]">
      {/* Botão de Logout Absoluto (Corporativo) */}
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-6 flex items-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#0f172a] bg-white hover:bg-[#f1f5f9] border border-[#e2e8f0] px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200 cursor-pointer z-20"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sair da Conta
      </button>

      {/* Background Orbs */}
      <div className="pointer-events-none fixed -left-20 -top-24 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(0,123,143,0.05),transparent_70%)]" />
      <div className="pointer-events-none fixed -bottom-20 -right-20 h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,rgba(255,127,80,0.05),transparent_70%)]" />

      <div className="rise-in max-w-2xl w-full flex flex-col items-center text-center">
        <p className="island-kicker mb-4 text-[var(--color-primary)] font-bold tracking-widest uppercase text-sm">Portal MedIA</p>
        <h1 className="display-title mb-6 text-6xl leading-[1.1] font-extrabold tracking-tight text-[var(--sea-ink)] sm:text-7xl">
          Bem-vindo ao <span className="media-text-gradient opacity-75">MedIA</span>
        </h1>
        <p className="text-lg text-[var(--sea-ink-soft)] opacity-60 leading-relaxed mb-10 max-w-lg">
          Sua central de inteligência para suporte operacional da Arthromed e Medic. 
          Pronto para otimizar seus processos?
        </p>
        
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-media-chat'))}
          className="group relative flex items-center gap-3 bg-[var(--color-primary)] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
        >
          <MessageCircle className="w-6 h-6" />
          Começar Atendimento
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Chat Widget - fixo no canto inferior direito */}
      <ChatWidget hideToggle={true} />
    </main>
  )
}
