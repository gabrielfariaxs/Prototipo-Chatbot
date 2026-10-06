import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Code2, 
  BookOpen, 
  ShieldCheck, 
  Database, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Search, 
  Layers, 
  Lock, 
  Sparkles, 
  Server,
  FolderTree,
  FileCode2,
  Key,
  Cpu,
  Boxes,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
  Activity,
  AlertTriangle,
  FileText,
  Stethoscope,
  BellRing,
  Wrench,
  CheckCircle2,
  Sliders,
  Flame,
  Globe,
  RefreshCw,
  Hash,
  Laptop,
  Mail,
  Users,
  QrCode,
  HardDrive,
  GitBranch,
  Workflow,
  ArrowRight
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface DeveloperDocsModalProps {
  isOpen: boolean
  onClose: () => void
}

type SectionId = 
  | 'overview_deep'
  | 'tech_stack'
  | 'rag_ingestion'
  | 'chat_ai_engine'
  | 'clinical_opme_process'
  | 'noc_gop_process'
  | 'ti_chamados_process'
  | 'trainings_qr_process'
  | 'auth_rbac_cascade'
  | 'portal_passwords_deep'
  | 'storage_lgpd_audit'
  | 'webpush_vapid_process'
  | 'ddl_schemas_deep'
  | 'env_deploy_troubleshooting'
  | 'live_playground'

export const DeveloperDocsModal: React.FC<DeveloperDocsModalProps> = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState<SectionId>('overview_deep')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Estados do API Playground
  const [testEndpoint, setTestEndpoint] = useState<'getContext' | 'generateResponse' | 'storageTest' | 'sessionCheck' | 'dbHealth'>('getContext')
  const [testInput, setTestInput] = useState('Como realizar a transferência de filial para matriz no Emultec?')
  const [testSector, setTestSector] = useState('Faturamento')
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const runInteractiveTest = async () => {
    setTestLoading(true)
    setTestResult(null)
    const startTime = performance.now()

    try {
      if (testEndpoint === 'getContext') {
        const { getContext } = await import('../../lib/chat')
        const res = await getContext({
          data: {
            text: testInput,
            sector: testSector
          }
        })
        const duration = Math.round(performance.now() - startTime)
        setTestResult(`⏱️ Tempo de Resposta: ${duration}ms\n\n📄 CONTEXTO RECUPERADO (RAG HÍBRIDO 5 CAMADAS):\n${res}`)
      } else if (testEndpoint === 'generateResponse') {
        const { generateResponse } = await import('../../lib/chat')
        const res = await generateResponse({
          data: {
            text: testInput,
            context: `[SETOR: ${testSector}] Contexto de validação de ambiente de desenvolvimento.`
          }
        })
        const duration = Math.round(performance.now() - startTime)
        setTestResult(`⏱️ Tempo de Resposta: ${duration}ms\n\n🤖 RESPOSTA IA GERADA:\n${res}`)
      } else if (testEndpoint === 'storageTest') {
        const { listarDocumentos } = await import('../../lib/storage')
        const docs = await listarDocumentos()
        const duration = Math.round(performance.now() - startTime)
        setTestResult(`⏱️ Tempo de Resposta: ${duration}ms\n\n📁 DOCUMENTOS NO BUCKET PRIVADO 'documentos':\n${JSON.stringify(docs, null, 2)}`)
      } else if (testEndpoint === 'sessionCheck') {
        const { supabase } = await import('../../lib/supabase')
        const { data: { session }, error } = await supabase.auth.getSession()
        const duration = Math.round(performance.now() - startTime)
        if (error) throw error
        setTestResult(`⏱️ Tempo de Resposta: ${duration}ms\n\n🔑 SESSÃO SUPABASE AUTH:\n${JSON.stringify({
          autenticado: !!session,
          user_id: session?.user?.id || 'Anônimo / Local',
          email: session?.user?.email || 'N/A',
          role: session?.user?.role || 'authenticated',
          expires_at: session?.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'
        }, null, 2)}`)
      } else if (testEndpoint === 'dbHealth') {
        const { supabase } = await import('../../lib/supabase')
        const { count, error } = await supabase.from('documentos_arthromed').select('id', { count: 'exact', head: true })
        const duration = Math.round(performance.now() - startTime)
        if (error) throw error
        setTestResult(`⏱️ Tempo de Resposta: ${duration}ms\n\n💚 HEALTH CHECK POSTGRESQL:\n- Conexão: OK\n- Tabela documentos_arthromed (RAG): ${count ?? 0} registros ativos\n- Latência Edge-Database: ${duration}ms`)
      }
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime)
      setTestResult(`❌ ERRO (${duration}ms): ${err.message || err}`)
    } finally {
      setTestLoading(false)
    }
  }

  const MENU_SECTIONS = [
    {
      category: '1. FUNDAMENTOS & ARQUITETURA',
      items: [
        { id: 'overview_deep', label: '1.1. Topologia Edge & Estrutura', icon: <Cpu size={15} /> },
        { id: 'tech_stack', label: '1.2. Linguagens, Frameworks & Libs', icon: <Boxes size={15} /> },
        { id: 'rag_ingestion', label: '1.3. Ingestão & RAG 5 Camadas', icon: <Sparkles size={15} /> },
        { id: 'chat_ai_engine', label: '1.4. Motor de I.A & Prompt Guard', icon: <Terminal size={15} /> },
      ]
    },
    {
      category: '2. PROCESSOS DE NEGÓCIO',
      items: [
        { id: 'clinical_opme_process', label: '2.1. Módulo Clínico & OPME Anti-Glosa', icon: <Stethoscope size={15} /> },
        { id: 'noc_gop_process', label: '2.2. NOC / NCO Gestão de Gargalos', icon: <Layers size={15} /> },
        { id: 'ti_chamados_process', label: '2.3. Helpdesk & Chamados de T.I', icon: <Laptop size={15} /> },
        { id: 'trainings_qr_process', label: '2.4. Treinamentos, Atas & QR Code', icon: <QrCode size={15} /> },
      ]
    },
    {
      category: '3. SEGURANÇA, STORAGE & MENSAGERIA',
      items: [
        { id: 'auth_rbac_cascade', label: '3.1. Autenticação JWT & RBAC em Cascata', icon: <ShieldCheck size={15} /> },
        { id: 'portal_passwords_deep', label: '3.2. Blindagem de Senhas dos Portais', icon: <Lock size={15} /> },
        { id: 'storage_lgpd_audit', label: '3.3. Storage Privado & Auditoria LGPD', icon: <FileText size={15} /> },
        { id: 'webpush_vapid_process', label: '3.4. Notificações WebPush (VAPID)', icon: <BellRing size={15} /> },
      ]
    },
    {
      category: '4. BANCO, CONFIGURAÇÃO & PLAYGROUND',
      items: [
        { id: 'ddl_schemas_deep', label: '4.1. Schemas PostgreSQL & DDL Completo', icon: <Database size={15} /> },
        { id: 'env_deploy_troubleshooting', label: '4.2. Variáveis (.env) & Troubleshooting', icon: <Key size={15} /> },
        { id: 'live_playground', label: '4.3. API Live Playground (Console)', icon: <Play size={15} /> },
      ]
    }
  ]

  const ALL_ITEMS = MENU_SECTIONS.flatMap(cat => cat.items)
  const filteredNavItems = searchQuery 
    ? ALL_ITEMS.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : null

  return (
    <div className="fixed inset-0 z-50 bg-[#070b14]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        className="bg-white dark:bg-[#0c1222] w-full max-w-7xl h-full max-h-[96vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1222] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1f29de] to-[#4338ca] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Terminal size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  MedIA Architecture & Complete Process Specification
                </h2>
                <span className="px-2.5 py-0.5 text-[10px] font-black rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#1f29de] dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                  v2.0 Deep Technical
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Especificação técnica formal de todos os processos: Ingestão RAG, IA, OPME, NOC, Helpdesk, Segurança e Schemas DDL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Fechar Documentação"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Body: Sidebar + Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* ========================================================================= */}
          {/* SIDEBAR DE NAVEGAÇÃO */}
          {/* ========================================================================= */}
          <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#080d1a] flex flex-col shrink-0 overflow-y-auto p-4 space-y-5">
            
            {/* Campo de Busca */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar processos e schemas..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:border-[#1f29de] transition-colors shadow-2xs placeholder-slate-400"
              />
            </div>

            {/* Menu Lateral */}
            {filteredNavItems ? (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Resultados ({filteredNavItems.length})</span>
                {filteredNavItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id as SectionId)
                      setSearchQuery('')
                    }}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer',
                      activeSection === item.id
                        ? 'bg-[#1f29de] text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    )}
                  >
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              MENU_SECTIONS.map((cat, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2.5 block mb-1.5">
                    {cat.category}
                  </span>
                  {cat.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as SectionId)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer whitespace-nowrap select-none',
                        activeSection === item.id
                          ? 'bg-[#1f29de] text-white shadow-md shadow-blue-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                      )}
                    >
                      <span className={activeSection === item.id ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
                </div>
              ))
            )}

            {/* Status Footer Sidebar */}
            <div className="mt-auto p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1 shadow-2xs">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5"><Workflow size={12} className="text-[#1f29de]" /> Processos Mapeados</span>
                <span className="text-[10px] font-mono bg-blue-50 text-[#1f29de] px-1.5 py-0.5 rounded border border-blue-200">100% Formatados</span>
              </div>
              <p className="text-[10px] text-slate-400">Arthromed &bull; Medic &bull; Emultec &bull; TanStack Start</p>
            </div>
          </aside>

          {/* ========================================================================= */}
          {/* CONTEÚDO PRINCIPAL TÉCNICO COMPLETO */}
          {/* ========================================================================= */}
          <main className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#fafbfe] dark:bg-[#0c1222] space-y-8">
            
            {/* 1.1. TOPOLOGIA EDGE & ESTRUTURA */}
            {activeSection === 'overview_deep' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-[#1f29de] dark:text-blue-300 text-xs font-extrabold mb-2 border border-blue-200 dark:border-blue-800">
                    <Cpu size={13} />
                    <span>TOPOLOGIA DE SISTEMA FULL-STACK</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    1.1. Visão Geral e Topologia de Execução Edge
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    O <strong>MedIA</strong> é uma plataforma de automação corporativa, inteligência documental e suporte operacional para os grupos <strong>Arthromed</strong> e <strong>Medic</strong>. O sistema foi desenvolvido no modelo <strong>Full-Stack Edge</strong> utilizando <strong>TanStack Start (React 19 + Vinxi/Vite)</strong> sobre <strong>Cloudflare Workers</strong>, com persistência e camada de banco no <strong>Supabase (PostgreSQL + pgvector + Auth + Storage Privado)</strong>.
                  </p>
                </div>

                {/* Estrutura de Camadas em Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">1</div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Camada Cliente (React 19)</h3>
                    <p className="text-slate-500 leading-relaxed">Interface responsiva, modularizada com Tailwind CSS, framer-motion e renderização de feedback em tempo real.</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black">2</div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Camada Edge (Cloudflare)</h3>
                    <p className="text-slate-500 leading-relaxed">TanStack Start Server Functions com Zod, interceptores JWT <code className="font-mono text-[10px]">requireAuth()</code> e caches de memória (LRU 300 / TTL 1h).</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">3</div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Camada de Banco (Supabase)</h3>
                    <p className="text-slate-500 leading-relaxed">PostgreSQL com pgvector (1536 dimensões), Row Level Security (RLS) estrito, storage privado e canais Realtime.</p>
                  </div>
                </div>

                {/* Mapeamento de Arquivos Centrais */}
                <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderTree size={16} className="text-emerald-500" />
                    <span>Mapeamento dos Arquivos Centrais do Sistema</span>
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="font-mono text-blue-600 block mb-1">web/src/lib/chat.ts</strong>
                      <span className="text-slate-500">Pipeline RAG híbrido, similaridade de cosseno, scoring de setores e Server Functions <code className="font-mono text-[10px]">getContext</code> e <code className="font-mono text-[10px]">generateResponse</code>.</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="font-mono text-purple-600 block mb-1">web/src/lib/security.ts</strong>
                      <span className="text-slate-500">Função universal <code className="font-mono text-[10px]">requireAuth()</code> que intercepta tokens JWT no servidor e sessão do Supabase no cliente.</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="font-mono text-emerald-600 block mb-1">web/src/lib/storage.ts</strong>
                      <span className="text-slate-500">Gateway de upload seguro com isolamento de pasta <code className="font-mono text-[10px]">&#123;user_id&#125;/*</code>, URLs assinadas e auditoria append-only.</span>
                    </div>
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <strong className="font-mono text-amber-600 block mb-1">web/src/lib/push.ts</strong>
                      <span className="text-slate-500">Engine de notificações WebPush via protocolo VAPID RFC 8291 para comunicação instantânea.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1.2. STACK TECNOLÓGICA: LINGUAGENS, FRAMEWORKS & BIBLIOTECAS */}
            {activeSection === 'tech_stack' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold mb-2 border border-indigo-200 dark:border-indigo-900">
                    <Boxes size={13} />
                    <span>ECOSSISTEMA TECNOLÓGICO</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    1.2. Stack Tecnológica: Linguagens, Frameworks & Bibliotecas
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Mapeamento exaustivo de todas as tecnologias que compõem o ecossistema Full-Stack do MedIA, com suas respectivas funções e dependências.
                  </p>
                </div>

                {/* 1. Linguagens de Programação */}
                <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Code2 size={16} className="text-[#1f29de]" />
                    <span>Linguagens de Programação</span>
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <strong className="text-blue-600 block font-bold text-sm">TypeScript 5.x / 6.x</strong>
                      <p className="text-slate-500 leading-relaxed">Tipagem estática ponta a ponta para 100% dos componentes React, Server Functions, esquemas Zod e RPCs.</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <strong className="text-indigo-600 block font-bold text-sm">PostgreSQL / SQL</strong>
                      <p className="text-slate-500 leading-relaxed">PL/pgSQL para funções RPC de cosseno (<code className="font-mono text-[10px]">match_documents</code>), DDL, triggers e políticas RLS.</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <strong className="text-emerald-600 block font-bold text-sm">HTML5 & CSS3</strong>
                      <p className="text-slate-500 leading-relaxed">Estrutura semântica acessível (WCAG AA), manipulação do DOM e propriedades CSS modernas.</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <strong className="text-amber-600 block font-bold text-sm">Python 3.x</strong>
                      <p className="text-slate-500 leading-relaxed">Scripts de automação, ingestão de dados brutos e testes de geração de embeddings vetoriais.</p>
                    </div>
                  </div>
                </div>

                {/* 2. Frameworks Principais & Runtimes */}
                <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu size={16} className="text-purple-600" />
                    <span>Frameworks & Runtimes</span>
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 dark:text-white text-sm">React 19</span>
                        <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">v19.2.0</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">Biblioteca reativa de interface com novos hooks e transições de estado assíncronas.</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 dark:text-white text-sm">TanStack Start & Router</span>
                        <span className="text-[10px] font-mono bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">v1.168.x</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">Framework Full-Stack Edge para RPCs (<code className="font-mono text-[10px]">createServerFn</code>) e roteamento tipado seguro.</p>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900 dark:text-white text-sm">Vite & Vinxi</span>
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">v8.0.0</span>
                      </div>
                      <p className="text-slate-500 leading-relaxed">Build tool de alta performance com Hot Module Replacement (HMR) em menos de 50ms.</p>
                    </div>
                  </div>
                </div>

                {/* 3. Bibliotecas Especializadas por Domínio */}
                <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers size={16} className="text-emerald-600" />
                    <span>Bibliotecas Especializadas (Dependencies)</span>
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>@supabase/supabase-js</span>
                        <span className="font-mono text-[10px] text-slate-400">v2.105.3</span>
                      </div>
                      <p className="text-slate-500">Cliente oficial do Supabase para Auth JWT, queries relacionais, pgvector e buckets privados de storage.</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>zod</span>
                        <span className="font-mono text-[10px] text-slate-400">v4.4.3</span>
                      </div>
                      <p className="text-slate-500">Validação estrita de contratos de dados em tempo de execução para todas as Server Functions.</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>tailwindcss & @tailwindcss/vite</span>
                        <span className="font-mono text-[10px] text-slate-400">v4.1.18</span>
                      </div>
                      <p className="text-slate-500">Framework utilitário moderno com novo engine Oxide, compilação instantânea e zero CSS desnecessário.</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>framer-motion</span>
                        <span className="font-mono text-[10px] text-slate-400">v12.38.0</span>
                      </div>
                      <p className="text-slate-500">Micro-interações suaves, animações de entrada/saída de modais, transições de abas e escala de botões.</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>docxtemplater & pizzip</span>
                        <span className="font-mono text-[10px] text-slate-400">v3.71.0</span>
                      </div>
                      <p className="text-slate-500">Engine de compilação de arquivos Microsoft Word (.docx) para emissão de laudos cirúrgicos e justificativas de OPME.</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>pdfjs-dist</span>
                        <span className="font-mono text-[10px] text-slate-400">v5.7.284</span>
                      </div>
                      <p className="text-slate-500">Extração estruturada de texto de laudos médicos, pedidos e guias PDF diretamente no navegador.</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>web-push & @types/web-push</span>
                        <span className="font-mono text-[10px] text-slate-400">v3.6.7</span>
                      </div>
                      <p className="text-slate-500">Assinatura de notificações push VAPID (RFC 8291) para alertas operacionais e chamados em tempo real.</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                        <span>qrcode.react & exceljs</span>
                        <span className="font-mono text-[10px] text-slate-400">v4.2.0</span>
                      </div>
                      <p className="text-slate-500">Geração de QR Codes dinâmicos para check-in de atas de treinamentos e exportação de relatórios em Excel.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 1.3. INGESTÃO DE DADOS & RAG 5 CAMADAS */}
            {activeSection === 'rag_ingestion' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    1.3. Processo de Ingestão de Dados & Pipeline RAG em 5 Camadas
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Como a informação institucional é estruturada, indexada, vetorizada e recuperada em menos de 150ms.
                  </p>
                </div>

                {/* Cards das 5 Etapas do Pipeline */}
                <div className="space-y-3">
                  {[
                    {
                      step: '1',
                      title: 'Normalização e Extração de Texto',
                      desc: 'O texto de entrada passa por limpeza de caracteres especiais e normalização NFD para ignorar variações de acentuação e caixa alta/baixa.',
                      badge: 'Higienização'
                    },
                    {
                      step: '2',
                      title: 'Geração de Embeddings Vetoriais (1536d)',
                      desc: 'Textos de procedimentos e normas são transformados em vetores densos de ponto flutuante de 1536 dimensões via modelo text-embedding-3-small.',
                      badge: 'OpenAI Embeddings'
                    },
                    {
                      step: '3',
                      title: 'Indexação com pgvector & IVFFlat',
                      desc: 'Armazenados no PostgreSQL com índices IVFFlat para viabilizar consultas aproximadas de vizinho mais próximo em milissegundos.',
                      badge: 'PostgreSQL 15'
                    },
                    {
                      step: '4',
                      title: 'Cálculo de Similaridade de Cosseno (match_documents)',
                      desc: 'A Server Function executa a RPC match_documents passando o vetor da pergunta do usuário e um limiar de corte de 0.65 de similaridade.',
                      badge: 'RPC Function'
                    },
                    {
                      step: '5',
                      title: 'Consolidação e Ponderação de Setor',
                      desc: 'O contexto final é montado combinando a base vetorial, os procedimentos locais do setor ativo e os catálogos com cache em memória.',
                      badge: 'Scoring Ponderado'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex items-start gap-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-[#1f29de] dark:text-blue-300 flex items-center justify-center font-black text-xs shrink-0 border border-blue-200 dark:border-blue-900">
                        {item.step}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">{item.title}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{item.badge}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 1.3. MOTOR DE IA & PROMPT GUARD */}
            {activeSection === 'chat_ai_engine' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    1.3. Motor de Inteligência Artificial & Prompt Injection Guard
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Orquestração multimodal de modelos com proteção corporativa contra vazamento de instruções e injeção de prompts maliciosos.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <div className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                      <Shield size={16} />
                      <span>1. Delimitação Estrita</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">O contexto recuperado pelo RAG é inserido em blocos delimitados, impedindo que instruções do usuário modifiquem as diretrizes fundamentais.</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                      <Cpu size={16} />
                      <span>2. Fallback de Modelos</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">Se o modelo primário (Claude 3.5 Sonnet) atingir rate limit ou instabilidade, o sistema comuta automaticamente para GPT-4o ou Claude 3 Haiku.</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <Activity size={16} />
                      <span>3. Whisper Audio Server</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed">Gravações de áudio do microfone são enviadas em base64 e processadas no servidor via Whisper-1, garantindo transcrições com precisão clínica.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2.1. MÓDULO CLÍNICO & OPME ANTI-GLOSA */}
            {activeSection === 'clinical_opme_process' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-extrabold mb-2 border border-rose-200 dark:border-rose-900">
                    <Stethoscope size={13} />
                    <span>REGULATÓRIO CFM & ANS</span>
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    2.1. Processo do Módulo Clínico & Pareceres Anti-Glosa de OPME
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Fluxo estruturado para emissão de solicitações cirúrgicas, justificativas técnicas de materiais especiais (OPME) e recursos de negativa.
                  </p>
                </div>

                {/* Timeline Visual dos 4 Passos Clínicos */}
                <div className="space-y-3">
                  {[
                    {
                      step: 'Passo 1',
                      title: 'Entrada e Identificação dos Dados Clínicos',
                      desc: 'O cirurgião ou instrumentador preenche os dados essenciais: Tipo de Procedimento, CID-10, Convênio e Hospital onde ocorrerá o ato cirúrgico.',
                      tag: 'Coleta de Dados'
                    },
                    {
                      step: 'Passo 2',
                      title: 'Cruzamento Regulatório & Justificativa Técnica',
                      desc: 'O motor clínico vincula os materiais solicitados ao Rol de Procedimentos da ANS e insere fundamentação baseada nas Resoluções CFM 1.956/2010 e 2.318/2022.',
                      tag: 'Anti-Glosa CFM'
                    },
                    {
                      step: 'Passo 3',
                      title: 'Geração do Documento Formatado (.docx)',
                      desc: 'O backend compila o arquivo Word formal com cabeçalho institucional, campos para assinatura médica e CRM, salvando no bucket privado com isolamento por usuário.',
                      tag: 'Storage Privado'
                    },
                    {
                      step: 'Passo 4',
                      title: 'Auditoria LGPD & URL Temporária',
                      desc: 'É emitido um link assinado temporário com validade de 48 horas e registrado um evento de auditoria imutável na tabela document_access_log.',
                      tag: 'Auditoria LGPD'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex items-start gap-4">
                      <div className="w-16 py-1 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center justify-center font-extrabold text-[11px] shrink-0 border border-rose-200 dark:border-rose-900">
                        {item.step}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">{item.tag}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2.2. NOC / NCO GESTÃO DE GARGALOS */}
            {activeSection === 'noc_gop_process' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    2.2. Processo do NOC (Não Conformidades Operacionais & GOP)
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Centralização, registro e tratativa em tempo real de gargalos logísticos, faturamento e divergências de estoque.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">1</span>
                    <strong className="text-slate-900 dark:text-white font-bold block text-sm">Abertura da NCO</strong>
                    <p className="text-slate-500 leading-relaxed">Colaborador registra título, setor de origem, impacto operacional e anexa fotos das evidências.</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                    <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-black">2</span>
                    <strong className="text-slate-900 dark:text-white font-bold block text-sm">Notificação Realtime</strong>
                    <p className="text-slate-500 leading-relaxed">Disparo instantâneo de Push VAPID e badge numérico na tabela <code className="font-mono text-[10px]">gop_notifications</code> para os líderes.</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black">3</span>
                    <strong className="text-slate-900 dark:text-white font-bold block text-sm">Plano de Ação 5W2H</strong>
                    <p className="text-slate-500 leading-relaxed">Liderança define causa raiz, prazo e responsável direto, atualizando o status para 'Em Análise'.</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">4</span>
                    <strong className="text-slate-900 dark:text-white font-bold block text-sm">Encerramento Eficaz</strong>
                    <p className="text-slate-500 leading-relaxed">Validação da eficácia da tratativa e gravação no histórico operacional para indicadores de qualidade.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2.3. HELPDESK & CHAMADOS DE TI */}
            {activeSection === 'ti_chamados_process' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    2.3. Processo de Helpdesk & Chamados de T.I
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Sistema de triagem e atendimento técnico de informática com controle de SLA e notificações multicanais.
                  </p>
                </div>

                {/* Timeline Visual dos 5 Passos do Chamado */}
                <div className="space-y-3">
                  {[
                    {
                      step: 'Passo 1',
                      title: 'Abertura do Chamado (#TI-XXXX)',
                      desc: 'O solicitante registra a requisição com título, descrição do problema, categoria (Hardware, Software, Rede, Acessos) e nível de prioridade (Baixa, Média, Alta, Crítica).',
                      tag: 'Ticket Gerado'
                    },
                    {
                      step: 'Passo 2',
                      title: 'Fila de Aprovação de Gestores',
                      desc: 'Se o chamado envolver compra de equipamentos ou liberação de novos acessos sensíveis, ele entra como pendente de aprovação para a liderança do setor.',
                      tag: 'Aprovação Prévia'
                    },
                    {
                      step: 'Passo 3',
                      title: 'Distribuição & Assunção pelo Suporte',
                      desc: 'A equipe de TI recebe alertas via WebPush e assume o atendimento no painel central, alterando o status do ticket para "em_atendimento".',
                      tag: 'SLA Ativo'
                    },
                    {
                      step: 'Passo 4',
                      title: 'Mensageria Interna em Tempo Real',
                      desc: 'Técnico e solicitante trocam mensagens, logs e capturas de tela diretamente no chat interno do chamado via canal Supabase Realtime.',
                      tag: 'Realtime Chat'
                    },
                    {
                      step: 'Passo 5',
                      title: 'Resolução & Parecer Técnico',
                      desc: 'O técnico conclui o chamado com a descrição da solução adotada e o solicitante avalia a qualidade do atendimento prestado.',
                      tag: 'Concluído'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs flex items-start gap-4">
                      <div className="w-16 py-1 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-extrabold text-[11px] shrink-0 border border-purple-200 dark:border-purple-900">
                        {item.step}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</h4>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">{item.tag}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2.4. TREINAMENTOS & QR CODE */}
            {activeSection === 'trainings_qr_process' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    2.4. Processo de Treinamentos, Atas Digitais & Check-in QR Code
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Controle de capacitação contínua, agendamento de reuniões corporativas e emissão de atas digitais de presença.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <strong className="font-bold text-sm text-slate-900 dark:text-white block">QR Code Dinâmico de Presença</strong>
                    <p className="text-slate-500 leading-relaxed">Ao iniciar um treinamento, o sistema projeta um QR Code dinâmico na tela. O colaborador aponta a câmera do celular, confirma sua identidade e tem a presença registrada instantaneamente na ata digital.</p>
                  </div>
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <strong className="font-bold text-sm text-slate-900 dark:text-white block">Catálogo TreinaFlix</strong>
                    <p className="text-slate-500 leading-relaxed">Repositório integrado de vídeo-aulas corporativas organizadas por setor com controle de progresso e certificação interna de procedimentos.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3.1. AUTENTICAÇÃO JWT & RBAC */}
            {activeSection === 'auth_rbac_cascade' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    3.1. Autenticação JWT, Cookies Seguros & RBAC em Cascata
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    O modelo de autorização em 4 camadas que protege todas as Server Functions e chamadas de banco.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Implementação Universal em security.ts</span>
                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{`// Validação universal de JWT (Edge Server + Browser Fallback)
export async function requireAuth() {
  if (typeof window !== 'undefined') {
    const { supabase } = await import('./supabase')
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) return { user: session.user, token: session.access_token }
  }

  // No servidor Cloudflare / TanStack Start:
  const token = req.headers.get('Authorization')?.replace('Bearer ', '') || getCookie('sb-access-token')
  const { data, error } = await supabaseAuth.auth.getUser(token)
  if (error || !data.user) throw new Error('Não autorizado: Sessão inválida.')
  return { user: data.user, token }
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* 3.2. BLINDAGEM DE SENHAS DOS PORTAIS */}
            {activeSection === 'portal_passwords_deep' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    3.2. Blindagem de Senhas e Credenciais dos Portais
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    As senhas corporativas da Medic e Arthromed são protegidas por 5 camadas ativas de isolamento.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white block">1. RLS no PostgreSQL</strong>
                    <p className="text-slate-500">Tabela <code className="font-mono text-[10px]">portal_passwords</code> bloqueia 100% de acessos anônimos. Apenas conexões com JWT válido são autorizadas.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white block">2. RBAC por Setor</strong>
                    <p className="text-slate-500">Apenas Comercial Interno, T.I e Liderança têm permissão para abrir o modal de senhas.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white block">3. Ocultação & Clipboard Seguro</strong>
                    <p className="text-slate-500">Senhas mascaradas (<code className="font-mono text-[10px]">••••••••</code>) com cópia direta para a memória do clipboard sem expor texto na tela.</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-2">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white block">4. Zero Hardcode em JS</strong>
                    <p className="text-slate-500">Nenhuma credencial fica nos arquivos estáticos do cliente compilado.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3.3. STORAGE PRIVADO & AUDITORIA LGPD */}
            {activeSection === 'storage_lgpd_audit' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    3.3. Storage Privado & Auditoria Append-Only (LGPD)
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Arquitetura de isolamento de arquivos médicos em buckets privados do Supabase com trilha de auditoria inviolável.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Tabela document_access_log (Imutável)</span>
                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{`-- Toda emissão de link assinado, upload ou download gera um registro obrigatório:
INSERT INTO document_access_log (user_id, caminho, acao, detalhes, user_agent)
VALUES (auth.uid(), 'solicitacoes/user_123/laudo.docx', 'link_gerado', '{"validade_horas": 48}', 'Chrome/Win11');

-- Políticas RLS bloqueiam UPDATE e DELETE para garantir integridade perante auditorias.`}
                  </pre>
                </div>
              </div>
            )}

            {/* 3.4. NOTIFICAÇÕES WEBPUSH */}
            {activeSection === 'webpush_vapid_process' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    3.4. Notificações WebPush (VAPID RFC 8291)
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Mensageria instantânea via Service Worker com chaves assimétricas VAPID para alertas operacionais e chamados.
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">Disparo com push.ts</span>
                  <pre className="p-4 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
{`import { sendPushNotification } from '@/lib/push'

await sendPushNotification({
  title: 'Nova Não Conformidade (NOC)',
  body: 'GOP registrou divergência no setor Logística',
  url: '/'
}, 'Gestor/Diretoria')`}
                  </pre>
                </div>
              </div>
            )}

            {/* 4.1. DDL SCHEMAS COMPLETO */}
            {activeSection === 'ddl_schemas_deep' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    4.1. Schemas PostgreSQL & DDL Completo das Tabelas
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Definições formais das tabelas gerenciadas no Supabase com tipos de dados, chaves primárias e relacionamentos.
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      name: '1. documentos_arthromed (RAG / pgvector)',
                      sql: `CREATE TABLE documentos_arthromed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  processo text NOT NULL,
  setor text NOT NULL,
  sistema text,
  conteudo text NOT NULL,
  embedding vector(1536), -- Índice IVFFlat para cosseno
  criado_em timestamptz DEFAULT now()
);`
                    },
                    {
                      name: '2. gargalos (NOC / Não Conformidades)',
                      sql: `CREATE TABLE gargalos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  setor text NOT NULL,
  titulo text NOT NULL,
  descricao text NOT NULL,
  evidencias jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'Pendente',
  criado_em timestamptz DEFAULT now()
);`
                    },
                    {
                      name: '3. ti_chamados (Suporte Técnico Helpdesk)',
                      sql: `CREATE TABLE ti_chamados (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('baixa', 'media', 'alta', 'critica')),
  status text NOT NULL DEFAULT 'aprovado',
  creator_name text NOT NULL,
  creator_sector text NOT NULL,
  criado_em timestamptz DEFAULT now()
);`
                    },
                    {
                      name: '4. document_access_log (Auditoria LGPD/CFM)',
                      sql: `CREATE TABLE document_access_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  caminho text NOT NULL,
  acao text NOT NULL CHECK (acao IN ('upload', 'link_gerado', 'download')),
  detalhes jsonb DEFAULT '{}'::jsonb,
  user_agent text,
  criado_em timestamptz DEFAULT now()
);`
                    },
                    {
                      name: '5. portal_passwords (Credenciais dos Portais)',
                      sql: `CREATE TABLE portal_passwords (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  company text NOT NULL, -- 'medic', 'arthromed', 'ambas'
  portal_name text NOT NULL,
  url text,
  username text NOT NULL,
  password text NOT NULL,
  notes text,
  criado_em timestamptz DEFAULT now()
);`
                    }
                  ].map((table, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2">
                      <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">{table.name}</span>
                      <pre className="p-3.5 bg-slate-950 text-slate-200 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
                        {table.sql}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4.2. VARIÁVEIS & TROUBLESHOOTING */}
            {activeSection === 'env_deploy_troubleshooting' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    4.2. Variáveis de Ambiente, Deploy & Troubleshooting
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Guia de configuração de segredos, rotas de publicação e soluções para os erros técnicos mais comuns.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2 text-xs">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white block">Tabela de Variáveis Obrigatórias (.env)</strong>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="py-2 px-2">Variável</th>
                            <th className="py-2 px-2">Escopo</th>
                            <th className="py-2 px-2">Uso</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          <tr><td className="py-2.5 px-2 font-mono font-bold">VITE_SUPABASE_URL</td><td>Público</td><td className="text-slate-500">URL da API Supabase</td></tr>
                          <tr><td className="py-2.5 px-2 font-mono font-bold">VITE_SUPABASE_KEY</td><td>Público</td><td className="text-slate-500">Chave pública anon/publishable</td></tr>
                          <tr><td className="py-2.5 px-2 font-mono font-bold text-purple-600">AI_GATEWAY_API_KEY</td><td>🔒 Servidor</td><td className="text-slate-500">Chave OpenRouter / Claude</td></tr>
                          <tr><td className="py-2.5 px-2 font-mono font-bold">VITE_VAPID_PUBLIC_KEY</td><td>Público</td><td className="text-slate-500">Chave VAPID WebPush</td></tr>
                          <tr><td className="py-2.5 px-2 font-mono font-bold text-purple-600">VAPID_PRIVATE_KEY</td><td>🔒 Servidor</td><td className="text-slate-500">Assinatura de notificações</td></tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-2 text-xs">
                    <strong className="text-sm font-bold text-slate-900 dark:text-white block flex items-center gap-1.5 text-amber-600">
                      <AlertTriangle size={15} /> Troubleshooting: Erros Comuns & Soluções
                    </strong>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed ml-2">
                      <li><strong>Token JWT Ausente (401)</strong>: Ocorre quando a sessão expirou. O frontend redireciona para <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">setStep('login')</code> automaticamente.</li>
                      <li><strong>VAPID Base64 Inválido</strong>: O utilitário <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">urlBase64ToUint8Array()</code> limpa aspas acidentais automaticamente do <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.env</code>.</li>
                      <li><strong>Erro de CORS em Serverless</strong>: Todas as funções usam TanStack Start <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">createServerFn</code> nativas, eliminando headers CORS manuais.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 4.3. API PLAYGROUND */}
            {activeSection === 'live_playground' && (
              <div className="space-y-5 max-w-5xl">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    4.3. API Live Playground & Console de Diagnóstico
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Dispare consultas em tempo real contra as Server Functions e monitore a latência de execução em milissegundos.
                  </p>
                </div>

                <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-xs space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Endpoint Server-Side / Teste:
                      </label>
                      <select
                        value={testEndpoint}
                        onChange={(e: any) => setTestEndpoint(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium outline-none shadow-2xs"
                      >
                        <option value="getContext">getContext() — RAG Híbrido & Caches 5 Camadas</option>
                        <option value="generateResponse">generateResponse() — Inferência IA OpenRouter</option>
                        <option value="storageTest">listarDocumentos() — Supabase Storage Privado</option>
                        <option value="sessionCheck">validarSessao() — Supabase Auth & JWT Status</option>
                        <option value="dbHealth">healthCheck() — Latência PostgreSQL & RAG Count</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                        Setor / Contexto Operacional:
                      </label>
                      <input
                        type="text"
                        value={testSector}
                        onChange={(e) => setTestSector(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none shadow-2xs font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Query de Teste / Parâmetros:
                    </label>
                    <input
                      type="text"
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none font-mono shadow-2xs"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={runInteractiveTest}
                    disabled={testLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1f29de] hover:bg-[#1820b8] text-white text-xs font-bold rounded-xl transition-all shadow-md hover:shadow-blue-500/25 cursor-pointer disabled:opacity-50"
                  >
                    <Play size={14} />
                    <span>{testLoading ? 'Executando Chamada no Servidor...' : 'Disparar Chamada ao Vivo'}</span>
                  </button>
                </div>

                {/* Console Output */}
                {testResult && (
                  <div className="space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                        Live Response Output
                      </span>
                      <button
                        onClick={() => handleCopy(testResult, 'test-result')}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1"
                      >
                        {copiedId === 'test-result' ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span>Copiar Retorno</span>
                      </button>
                    </div>
                    <pre className="p-4 bg-slate-950 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto max-h-80 whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                      {testResult}
                    </pre>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080d1a] shrink-0 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">MedIA Complete Engineering Specification</span>
            <span>&bull;</span>
            <span>Arthromed & Medic</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
          >
            Fechar Documentação
          </button>
        </div>
      </motion.div>
    </div>
  )
}
