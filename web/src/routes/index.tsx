import { createFileRoute } from '@tanstack/react-router'
import { ChatWidget } from '../components/ChatWidget'
import { MessageCircle, ArrowRight } from 'lucide-react'

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
  const isDesktop = desktop || (typeof window !== 'undefined' && window.location.search.includes('desktop=true'))
  const isExtension = extension || (typeof window !== 'undefined' && window.location.search.includes('extension=true'))

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

  return (
    <main className="min-h-screen flex items-center justify-center px-8">
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
          className="group relative flex items-center gap-3 bg-[var(--color-primary)] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
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
