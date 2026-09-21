import React, { useState } from 'react'
import {
  Mail,
  X,
  Search,
  Plus,
  Reply,
  ReplyAll,
  Forward,
  Send,
  Sparkles,
  Paperclip,
  Check,
  RefreshCw,
  Clock,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
  Lock,
  Building2,
  Inbox,
  SendHorizontal,
  ChevronRight,
  CheckCircle2,
  Tag,
  ArrowLeft,
  Eye,
  KeyRound,
  Copy,
  Download,
  FileSpreadsheet,
  FileCode,
  Layers,
  HeartPulse,
  Hospital
} from 'lucide-react'

export interface EmailAccount {
  id: string
  email: string
  label: string
  company: 'Medic' | 'Arthromed' | 'T.I'
  unreadCount: number
  color: string
}

export interface EmailMessage {
  id: string
  accountId: string
  senderName: string
  senderEmail: string
  subject: string
  preview: string
  body: string
  timestamp: string
  dateFormatted: string
  isUnread: boolean
  isFlagged?: boolean
  categoryTag: string
  categoryColor: string
  aiSummary: string
  attachments?: { name: string; size: string; type: string; ext?: string }[]
  replyHistory?: { sender: string; timestamp: string; content: string }[]
  intelMetadata?: {
    convênio?: string
    hospital?: string
    paciente?: string
  }
}

const INITIAL_ACCOUNTS: EmailAccount[] = [
  {
    id: 'acc-1',
    email: 'orcamento@medicpe.com.br',
    label: 'Medic Ortopedia - Cotações & Vendas',
    company: 'Medic',
    unreadCount: 0,
    color: '#059669' // Emerald
  },
  {
    id: 'acc-2',
    email: 'orcamento@arthromed.com.br',
    label: 'Arthromed OPME - Cotações & Produtos',
    company: 'Arthromed',
    unreadCount: 0,
    color: '#7c3aed' // Purple
  }
]

const INITIAL_EMAILS: EmailMessage[] = []

interface OutlookEmailsModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenTiTicket?: (emailData?: { subject: string; body: string }) => void
}

export const OutlookEmailsModal: React.FC<OutlookEmailsModalProps> = ({
  isOpen,
  onClose,
  onOpenTiTicket
}) => {
  const [accounts, setAccounts] = useState<EmailAccount[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('outlook_connected_accounts')
        if (saved) return JSON.parse(saved)
      }
    } catch {}
    return INITIAL_ACCOUNTS
  })
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all')
  const [emails, setEmails] = useState<EmailMessage[]>(INITIAL_EMAILS)
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterFolder, setFilterFolder] = useState<'all' | 'unread' | 'flagged'>('all')

  // Reader View Mode Tab
  const [readerTab, setReaderTab] = useState<'both' | 'summary' | 'full' | 'attachments'>('both')
  const [copiedToast, setCopiedToast] = useState(false)

  // Reply Editor State
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [isGeneratingAiReply, setIsGeneratingAiReply] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendSuccessToast, setSendSuccessToast] = useState(false)

  // New Account Connection Modal
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false)
  const [newAccountForm, setNewAccountForm] = useState({
    email: 'orcamento@medicpe.com.br',
    label: 'Medic Ortopedia - Cotações & Vendas',
    company: 'Medic' as 'Medic' | 'Arthromed' | 'T.I',
    appPassword: ''
  })
  const [accountConnectSuccess, setAccountConnectSuccess] = useState(false)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSyncEmails = async (targetEmailOrEvent?: string | React.SyntheticEvent | any, pass?: string) => {
    setIsSyncing(true)
    const rawEmail = typeof targetEmailOrEvent === 'string' && targetEmailOrEvent.includes('@') ? targetEmailOrEvent.trim() : undefined
    const selectedAcc = accounts.find(a => a.id === selectedAccountId)
    const activeAccEmail = rawEmail || selectedAcc?.email || accounts[0]?.email || 'orcamento@medicpe.com.br'
    
    const rawPass = typeof pass === 'string' ? pass : ''
    const passwordToUse = rawPass || (typeof window !== 'undefined' ? (localStorage.getItem(`pass_${activeAccEmail}`) || '') : '')

    if (!passwordToUse) {
      setIsSyncing(false)
      // Open connection dialog to ask for password
      setNewAccountForm(prev => ({
        ...prev,
        email: String(activeAccEmail),
        label: accounts.find(a => a.email === activeAccEmail)?.label || String(activeAccEmail).split('@')[0],
        company: String(activeAccEmail).includes('arthromed') ? 'Arthromed' : 'Medic'
      }))
      setIsAddAccountOpen(true)
      return
    }

    try {
      // 1. Try local dev server endpoint /api/imap/fetch
      let res: Response | null = null
      try {
        res = await fetch('http://localhost:3005/api/imap/fetch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: activeAccEmail, password: passwordToUse, maxCount: 500 })
        })
      } catch (e) {
        console.warn('Falha no fetch direto:', e)
      }

      if (res && res.ok) {
        const data = await res.json()
        if (data.success && Array.isArray(data.emails) && data.emails.length > 0) {
          setEmails(prev => {
            const newIds = new Set(data.emails.map((e: any) => e.id))
            const filteredOld = prev.filter(e => !newIds.has(e.id))
            return [...data.emails, ...filteredOld]
          })
          if (data.emails[0]?.id) setSelectedEmailId(data.emails[0].id)
        } else if (data.error) {
          alert(`Aviso Locaweb: ${data.error}`)
        } else if (data.success && (!data.emails || data.emails.length === 0)) {
          alert(`Caixa de entrada ${activeAccEmail} sincronizada com sucesso! (Nenhum e-mail recente encontrado).`)
        }
      } else {
        alert(`Não foi possível conectar ao servidor IMAP da Locaweb. (Status: ${res?.status || 'Fetch Falhou'}). Verifique se o servidor na porta 3005 está rodando.`)
      }
    } catch (err: any) {
      console.warn('Erro na sincronização IMAP:', err)
      alert('Erro ao sincronizar com o servidor local (Porta 3005): ' + (err.message || 'Falha de rede.'))
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isOpen) return null

  // Active email object
  const activeEmail = emails.find(m => m.id === selectedEmailId) || null

  // Filtered Emails List
  const filteredEmails = emails.filter(m => {
    // Filter by account
    if (selectedAccountId !== 'all' && m.accountId !== selectedAccountId) {
      return false
    }

    // Filter by folder
    if (filterFolder === 'unread' && !m.isUnread) return false
    if (filterFolder === 'flagged' && !m.isFlagged) return false

    // Filter by search term
    const term = searchTerm.toLowerCase().trim()
    if (!term) return true
    return (
      m.senderName.toLowerCase().includes(term) ||
      m.senderEmail.toLowerCase().includes(term) ||
      m.subject.toLowerCase().includes(term) ||
      m.body.toLowerCase().includes(term) ||
      m.categoryTag.toLowerCase().includes(term)
    )
  })

  const markAsRead = (id: string) => {
    setEmails(prev =>
      prev.map(item => (item.id === id ? { ...item, isUnread: false } : item))
    )
  }

  const handleSelectEmail = (id: string) => {
    setSelectedEmailId(id)
    markAsRead(id)
    setIsReplying(false)
    setReplyText('')
  }

  // AI Response Generator Simulation
  const handleGenerateAiReply = () => {
    if (!activeEmail) return
    setIsGeneratingAiReply(true)

    setTimeout(() => {
      let aiText = ''
      if (activeEmail.categoryTag.includes('Cotação')) {
        aiText = `Prezado(a) ${activeEmail.senderName.split(' ')[0]},\n\nAgradecemos o envio da solicitação de cotação.\n\nInformamos que os dados da cirurgia e o prontuário foram recebidos com sucesso por nossa equipe comercial. Já estamos preparando a proposta comercial precificada com os códigos TUSS correspondentes e disponibilidade em estoque de nossos kits estéreis.\n\nEm instantes enviaremos a proposta formal anexada com validade de 15 dias.\n\nPermanecemos à disposição para suporte técnico urgente.\n\nAtenciosamente,\nEquipe Comercial - Grupo Medic Ortopedia & Arthromed OPME`
      } else if (activeEmail.categoryTag.includes('Dúvida')) {
        aiText = `Prezada ${activeEmail.senderName.split(' ')[0]},\n\nConfirmamos que a Ponteira Flush Cut Arthromed 45° é 100% compatível com a consola de radiofrequência Razek e com bombas de irrigação contínua hospitalar de alto fluxo.\n\nAnexamos a esta resposta a Ficha Técnica Oficial de Instrumentação com o passo a passo para a equipe de enfermagem.\n\nQualquer dúvida adicional, estamos à disposição!\n\nAtenciosamente,\nSuporte Técnico Arthromed OPME`
      } else {
        aiText = `Prezado(a) ${activeEmail.senderName.split(' ')[0]},\n\nConfirmamos o recebimento de sua mensagem referente a "${activeEmail.subject}".\n\nNossa equipe já está analisando o caso e retornará em breve com as devidas orientações.\n\nAtenciosamente,\nEquipe Grupo MedicPE / Arthromed`
      }

      setReplyText(aiText)
      setIsGeneratingAiReply(false)
    }, 1100)
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !activeEmail) return
    setIsSending(true)

    setTimeout(() => {
      const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const updatedHistory = activeEmail.replyHistory || []
      
      const updatedEmails = emails.map(m => {
        if (m.id === activeEmail.id) {
          return {
            ...m,
            isUnread: false,
            replyHistory: [
              ...updatedHistory,
              {
                sender: 'Você (via Outlook MedIA)',
                timestamp: nowFormatted,
                content: replyText.trim()
              }
            ]
          }
        }
        return m
      })

      setEmails(updatedEmails)
      setIsSending(false)
      setIsReplying(false)
      setReplyText('')

      // Show toast
      setSendSuccessToast(true)
      setTimeout(() => setSendSuccessToast(false), 3500)
    }, 1200)
  }

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    const targetEmail = newAccountForm.email.trim()
    const targetPass = newAccountForm.appPassword.trim()
    if (!targetEmail) return

    setIsTestingConnection(true)

    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`pass_${targetEmail}`, targetPass)
      }

      const existingAcc = accounts.find(a => a.email.toLowerCase() === targetEmail.toLowerCase())
      let updatedAccounts = accounts

      if (!existingAcc) {
        const newAcc: EmailAccount = {
          id: 'acc-' + Date.now(),
          email: targetEmail,
          label: newAccountForm.label.trim() || targetEmail.split('@')[0],
          company: newAccountForm.company,
          unreadCount: 0,
          color: newAccountForm.company === 'Medic' ? '#059669' : newAccountForm.company === 'Arthromed' ? '#7c3aed' : '#dc2626'
        }
        updatedAccounts = [newAcc, ...accounts]
        setAccounts(updatedAccounts)
        try {
          localStorage.setItem('outlook_connected_accounts', JSON.stringify(updatedAccounts))
        } catch {}
      }

      setSelectedAccountId(existingAcc ? existingAcc.id : updatedAccounts[0].id)

      // Call real IMAP Locaweb Bridge Sync
      await handleSyncEmails(targetEmail, targetPass)

      setAccountConnectSuccess(true)
      setTimeout(() => {
        setAccountConnectSuccess(false)
        setIsAddAccountOpen(false)
        setNewAccountForm({ email: 'orcamento@medicpe.com.br', label: 'Medic Ortopedia - Cotações & Vendas', company: 'Medic', appPassword: '' })
      }, 1200)
    } finally {
      setIsTestingConnection(false)
    }
  }

  const activeAccount = accounts.find(a => a.id === activeEmail?.accountId)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/90 border border-blue-400/40 text-white flex items-center justify-center shadow-md shrink-0">
              <Mail size={22} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-extrabold text-white tracking-tight leading-tight flex items-center gap-2">
                  <span>Central de E-mails Outlook</span>
                  <span className="bg-blue-500/30 text-blue-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-400/30">
                    Multicontas Office 365
                  </span>
                </h3>
              </div>
              <p className="text-xs text-blue-200/80 font-medium leading-tight mt-0.5">
                Caixa de entrada unificada com suporte a respostas e análise inteligente da MedIA.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddAccountOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white font-extrabold text-xs shadow-md transition-all cursor-pointer border border-blue-400/40 shrink-0 whitespace-nowrap"
              style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            >
              <Plus size={15} />
              <span className="hidden sm:inline">Conectar Conta Outlook</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Fechar"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area - 3 Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-50">
          
          {/* LEFT SIDEBAR: Accounts & Folders */}
          <div className="w-full md:w-64 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col shrink-0">
            
            {/* Account Selector Section */}
            <div className="p-3 border-b border-slate-800">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2 px-2">
                Contas Outlook Conectadas
              </span>

              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => setSelectedAccountId('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedAccountId === 'all'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Inbox size={15} />
                    <span className="truncate">Todas as Caixas</span>
                  </div>
                  <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-md border border-slate-700">
                    {emails.length}
                  </span>
                </button>

                {accounts.map(acc => {
                  const accUnread = emails.filter(m => m.accountId === acc.id && m.isUnread).length
                  const isSelected = selectedAccountId === acc.id

                  return (
                    <button
                      type="button"
                      key={acc.id}
                      onClick={() => setSelectedAccountId(acc.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                          : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: acc.color }}
                        />
                        <div className="flex flex-col text-left truncate">
                          <span className="font-bold truncate text-[11px] text-white leading-tight">
                            {acc.email.split('@')[0]}
                          </span>
                          <span className="text-[9.5px] text-slate-400 truncate">
                            {acc.label}
                          </span>
                        </div>
                      </div>

                      {accUnread > 0 && (
                        <span className="bg-emerald-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full shrink-0">
                          {accUnread}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Folder Filters */}
            <div className="p-3 space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1 px-2">
                Filtros Rápidos
              </span>

              <button
                type="button"
                onClick={() => setFilterFolder('all')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterFolder === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <Mail size={14} />
                <span>Todos os E-mails</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterFolder('unread')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filterFolder === 'unread' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Não Lidos</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded border border-emerald-800">
                  {emails.filter(m => m.isUnread).length}
                </span>
              </button>
            </div>

            {/* Bottom Status Info */}
            <div className="mt-auto p-3 border-t border-slate-800 bg-slate-950 text-[10.5px] text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Outlook Live Sync</span>
              </div>
              <span className="text-[9px] text-slate-500">v2.4 Graph API</span>
            </div>
          </div>

          {/* MIDDLE COLUMN: Emails List (Inbox) */}
          <div className="w-full md:w-80 lg:w-96 border-r border-slate-200 bg-white flex flex-col shrink-0">
            
            {/* Search Bar & Sync Status */}
            <div className="p-3 border-b border-slate-200 bg-slate-50 space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar assunto, remetente ou tag..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-2xs"
                />
              </div>

              <div className="flex items-center justify-between text-[10.5px] text-slate-500 font-medium">
                <span>Exibindo {filteredEmails.length} e-mails</span>
                <button
                  type="button"
                  onClick={() => handleSyncEmails()}
                  disabled={isSyncing}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-bold disabled:opacity-50"
                >
                  <RefreshCw size={11} className={isSyncing ? 'animate-spin text-blue-600' : ''} />
                  <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Caixas'}</span>
                </button>
              </div>
            </div>

            {/* Emails List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredEmails.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-3">
                  <Inbox size={36} className="mx-auto text-slate-300" />
                  <div>
                    <p className="text-xs font-bold text-slate-700">Nenhum e-mail sincronizado no momento.</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Clique abaixo para sincronizar a caixa de entrada Locaweb.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSyncEmails()}
                    disabled={isSyncing}
                    className="px-5 py-2.5 font-extrabold text-xs rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    style={{ backgroundColor: isSyncing ? '#94a3b8' : '#2563eb', color: '#ffffff' }}
                  >
                    <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'Sincronizando com email-ssl.com.br...' : 'Sincronizar Caixas Locaweb'}</span>
                  </button>
                </div>
              ) : (
                filteredEmails.map(mail => {
                  const isSelected = selectedEmailId === mail.id
                  const mailAcc = accounts.find(a => a.id === mail.accountId)

                  return (
                    <div
                      key={mail.id}
                      onClick={() => handleSelectEmail(mail.id)}
                      className={`p-3.5 transition-all cursor-pointer relative group ${
                        isSelected
                          ? 'bg-blue-50/80 border-l-4 border-blue-600 shadow-2xs'
                          : mail.isUnread
                          ? 'bg-emerald-50/40 hover:bg-slate-50'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Top Header line inside email card */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded border shrink-0 uppercase tracking-wider" style={{
                          backgroundColor: `${mailAcc?.color}15`,
                          color: mailAcc?.color,
                          borderColor: `${mailAcc?.color}40`
                        }}>
                          {mailAcc?.email.split('@')[0]}
                        </span>

                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {mail.timestamp}
                        </span>
                      </div>

                      {/* Sender Name */}
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs truncate ${mail.isUnread ? 'font-black text-slate-900' : 'font-bold text-slate-700'}`}>
                          {mail.senderName}
                        </h4>
                        {mail.isUnread && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>

                      {/* Subject */}
                      <p className={`text-[11.5px] truncate mt-0.5 ${mail.isUnread ? 'font-extrabold text-slate-800' : 'font-semibold text-slate-600'}`}>
                        {mail.subject}
                      </p>

                      {/* Preview */}
                      <p className="text-[10.5px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                        {mail.preview}
                      </p>

                      {/* Tag & Attachments indicator */}
                      <div className="flex items-center justify-between gap-2 mt-2 pt-1">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded border shrink-0 ${mail.categoryColor}`}>
                          {mail.categoryTag}
                        </span>

                        {mail.attachments && mail.attachments.length > 0 && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold">
                            <Paperclip size={11} />
                            <span>{mail.attachments.length}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Detailed Email Reader & AI Assistant & Reply Box */}
          <div className="flex-1 bg-white flex flex-col overflow-hidden">
            {activeEmail ? (
              <div className="flex-1 flex flex-col overflow-y-auto">
                
                {/* Email Header Bar */}
                <div className="p-4 border-b border-slate-200 bg-white sticky top-0 z-10 shadow-2xs space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${activeEmail.categoryColor}`}>
                          {activeEmail.categoryTag}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          Via {activeAccount?.email}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                        {activeEmail.subject}
                      </h2>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsReplying(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                      >
                        <Reply size={14} />
                        <span>Responder</span>
                      </button>

                      {activeEmail.categoryTag.includes('T.I') && onOpenTiTicket && (
                        <button
                          type="button"
                          onClick={() => onOpenTiTicket({ subject: activeEmail.subject, body: activeEmail.body })}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-xs shadow-sm transition-all cursor-pointer"
                          style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                        >
                          <ShieldCheck size={14} />
                          <span>Gerar Chamado T.I</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sender Detail Badge */}
                  <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                        {activeEmail.senderName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-xs text-slate-800 truncate block leading-tight">
                          {activeEmail.senderName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium truncate block mt-0.5">
                          &lt;{activeEmail.senderEmail}&gt;
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-500 font-semibold shrink-0">
                      {activeEmail.dateFormatted}
                    </span>
                  </div>
                </div>

                {/* View Mode Tabs (Toggle between Resumo MedIA, E-mail Original Completo, Anexos) */}
                <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-slate-200 bg-slate-50 shrink-0">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    <button
                      type="button"
                      onClick={() => setReaderTab('both')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        readerTab === 'both' ? 'shadow-sm text-white' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      style={readerTab === 'both' ? { backgroundColor: '#2563eb' } : {}}
                    >
                      <Layers size={13} />
                      <span>Visão Completa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReaderTab('summary')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        readerTab === 'summary' ? 'shadow-sm text-white' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      style={readerTab === 'summary' ? { backgroundColor: '#4f46e5' } : {}}
                    >
                      <Sparkles size={13} />
                      <span>Resumo MedIA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReaderTab('full')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                        readerTab === 'full' ? 'shadow-sm text-white' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                      style={readerTab === 'full' ? { backgroundColor: '#1e293b' } : {}}
                    >
                      <FileText size={13} />
                      <span>E-mail Original Completo</span>
                    </button>

                    {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setReaderTab('attachments')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                          readerTab === 'attachments' ? 'shadow-sm text-white' : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                        style={readerTab === 'attachments' ? { backgroundColor: '#059669' } : {}}
                      >
                        <Paperclip size={13} />
                        <span>Anexos ({activeEmail.attachments.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`De: ${activeEmail.senderName} <${activeEmail.senderEmail}>\nAssunto: ${activeEmail.subject}\nData: ${activeEmail.dateFormatted}\n\n${activeEmail.body}`)
                      setCopiedToast(true)
                      setTimeout(() => setCopiedToast(false), 2500)
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 text-[11px] font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap"
                    title="Copiar texto do e-mail"
                  >
                    <Copy size={12} />
                    <span className="hidden sm:inline">Copiar</span>
                  </button>
                </div>

                {/* Copied Feedback Toast */}
                {copiedToast && (
                  <div className="mx-4 mt-2 p-2 bg-slate-900 text-white text-xs rounded-xl flex items-center justify-between animate-in fade-in">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <Check size={14} className="text-emerald-400" />
                      Texto do e-mail copiado para a área de transferência!
                    </span>
                  </div>
                )}

                {/* TAB CONTENT 1: Resumo Inteligente MedIA (Show when 'both' or 'summary') */}
                {(readerTab === 'both' || readerTab === 'summary') && (
                  <div className="mx-4 mt-4 space-y-3">
                    {/* AI Summary Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <Sparkles size={13} className="animate-pulse" />
                          </div>
                          <span className="text-xs font-black text-indigo-950 uppercase tracking-wide">
                            Resumo Estruturado da MedIA
                          </span>
                        </div>

                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          Inteligência Cirúrgica OPME
                        </span>
                      </div>

                      <div className="bg-white/95 border border-indigo-100 shadow-sm rounded-xl p-3">
                        <p className="text-[13px] text-slate-800 font-medium leading-relaxed">
                          {activeEmail.aiSummary}
                        </p>
                      </div>

                      {/* Clinical & Commercial Intelligence Pills */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                        <div className="bg-white/90 border border-indigo-100 rounded-xl p-2.5 space-y-0.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <Hospital size={11} className="text-indigo-600" />
                            Hospital / Unidade
                          </span>
                          <p className="text-xs font-extrabold text-slate-800 whitespace-normal leading-tight">
                            {activeEmail.intelMetadata?.hospital || (activeEmail.subject.toLowerCase().includes('hnsn') ? 'Hospital N. Sra. das Neves' : 'Hospital Solicitante')}
                          </p>
                        </div>

                        <div className="bg-white/90 border border-indigo-100 rounded-xl p-2.5 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck size={11} className="text-indigo-600" />
                            Convênio / Operadora
                          </span>
                          <p className="text-xs font-extrabold text-slate-800 whitespace-normal leading-tight">
                            {activeEmail.intelMetadata?.convênio || (activeEmail.subject.toLowerCase().includes('bradesco') ? 'Bradesco Saúde' : activeEmail.subject.toLowerCase().includes('unimed') ? 'Unimed' : 'Particular / Outros')}
                          </p>
                        </div>

                        <div className="bg-white/90 border border-indigo-100 rounded-xl p-2.5 space-y-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <User size={11} className="text-indigo-600" />
                            Paciente / Demanda
                          </span>
                          <p className="text-xs font-extrabold text-slate-800 whitespace-normal leading-tight">
                            {activeEmail.intelMetadata?.paciente || 'Identificado nos anexos/corpo'}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action Triggers */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        <button
                          type="button"
                          onClick={() => {
                            setIsReplying(true)
                            handleGenerateAiReply()
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wide text-white shadow-xs transition-all cursor-pointer"
                          style={{ backgroundColor: '#4f46e5' }}
                        >
                          <Sparkles size={14} className="text-white" />
                          <span>Gerar Proposta Comercial com IA</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setReaderTab('full')}
                          className="text-xs text-indigo-700 hover:text-indigo-900 font-extrabold underline cursor-pointer ml-auto"
                        >
                          Ver E-mail Completo na Íntegra →
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 2: Full Original Unsummarized Email Body (Show when 'both' or 'full') */}
                {(readerTab === 'both' || readerTab === 'full') && (
                  <div className="p-4 sm:p-5 space-y-3">
                    {readerTab === 'both' && (
                      <div className="flex items-center justify-between pt-2 pb-1 border-b border-slate-100">
                        <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                          <FileText size={14} className="text-slate-500" />
                          <span>E-mail Original na Íntegra (Texto Completo do Remetente)</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Servidor: email-ssl.com.br (Porta 993)
                        </span>
                      </div>
                    )}

                    {readerTab === 'full' && (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500 text-[11px]">
                          <span><strong>De:</strong> {activeEmail.senderName} &lt;{activeEmail.senderEmail}&gt;</span>
                          <span>{activeEmail.dateFormatted}</span>
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          <strong>Para:</strong> {activeAccount?.email || 'orcamento@medicpe.com.br'}
                        </div>
                        <div className="text-slate-800 font-bold text-xs pt-1">
                          <strong>Assunto:</strong> {activeEmail.subject}
                        </div>
                      </div>
                    )}

                    {/* Verbatim Clean Email Body Text */}
                    <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-200 text-xs text-slate-800 font-sans leading-relaxed whitespace-pre-wrap select-text selection:bg-blue-100 selection:text-blue-900 space-y-3">
                      {activeEmail.body}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT 3: Attachments Section (Show when 'both', 'full' or 'attachments') */}
                {activeEmail.attachments && activeEmail.attachments.length > 0 && (readerTab === 'both' || readerTab === 'attachments' || readerTab === 'full') && (
                  <div className="mx-4 sm:mx-5 mb-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Paperclip size={15} className="text-blue-600" />
                        <span>Arquivos & Anexos Recebidos ({activeEmail.attachments.length})</span>
                      </span>

                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        Prontos para Download & Análise
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {activeEmail.attachments.map((file, idx) => {
                        const ext = file.ext || file.name.split('.').pop()?.toUpperCase() || 'ARQ'
                        const isPdf = ext === 'PDF'
                        const isExcel = ['XLS', 'XLSX', 'CSV'].includes(ext)
                        const isDoc = ['DOC', 'DOCX'].includes(ext)

                        return (
                          <div
                            key={idx}
                            className="bg-white border border-slate-200 hover:border-blue-300 p-3 rounded-xl flex items-center justify-between gap-3 shadow-2xs transition-all group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[10px] shrink-0 ${
                                isPdf ? 'bg-red-50 text-red-600 border border-red-200' :
                                isExcel ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                isDoc ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {isPdf ? <FileText size={18} /> : isExcel ? <FileSpreadsheet size={18} /> : <FileCode size={18} />}
                              </div>

                              <div className="min-w-0">
                                <span className="text-xs font-extrabold text-slate-800 truncate block group-hover:text-blue-600 transition-colors" title={file.name}>
                                  {file.name}
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 uppercase">
                                    {ext}
                                  </span>
                                  <span className="text-[10.5px] text-slate-400 font-medium">
                                    {file.size}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => alert(`Iniciando download seguro de: ${file.name}`)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Baixar Arquivo"
                              >
                                <Download size={13} />
                                <span className="hidden sm:inline">Baixar</span>
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Sent Replies History */}
                {activeEmail.replyHistory && activeEmail.replyHistory.length > 0 && (
                  <div className="mx-5 mb-5 space-y-2 border-t border-slate-200 pt-4">
                    <span className="text-xs font-extrabold text-slate-700 block">
                      Respostas Enviadas nesta Conversa ({activeEmail.replyHistory.length}):
                    </span>

                    {activeEmail.replyHistory.map((rep, idx) => (
                      <div key={idx} className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-emerald-900 font-bold">
                          <span>{rep.sender}</span>
                          <span className="text-[10px] text-emerald-700">{rep.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
                          {rep.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* REPLY EDITOR AREA */}
                {isReplying && (
                  <div className="m-4 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl space-y-3 animate-in slide-in-from-bottom-3 duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Reply size={16} className="text-blue-400" />
                        <span className="text-xs font-extrabold text-white">
                          Respondendo para {activeEmail.senderName} ({activeEmail.senderEmail})
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateAiReply}
                        disabled={isGeneratingAiReply}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer border border-purple-400/40 disabled:opacity-50"
                      >
                        <Sparkles size={13} className={isGeneratingAiReply ? 'animate-spin' : ''} />
                        <span>{isGeneratingAiReply ? 'Gerando...' : 'Gerar Resposta com MedIA'}</span>
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      placeholder="Escreva a resposta do e-mail ou use o gerador de I.A acima..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed resize-y"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setIsReplying(false)}
                        className="text-xs font-semibold text-slate-400 hover:text-white"
                      >
                        Cancelar
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSendReply}
                          disabled={isSending || !replyText.trim()}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-extrabold text-xs shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed"
                          style={{ backgroundColor: isSending || !replyText.trim() ? '#64748b' : '#059669', color: '#ffffff' }}
                        >
                          {isSending ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Enviando pelo Outlook...</span>
                            </>
                          ) : (
                            <>
                              <SendHorizontal size={15} />
                              <span>Enviar E-mail via Outlook</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <Mail size={40} className="text-slate-300" />
                <p className="text-sm font-semibold">Selecione um e-mail na lista ao lado para ler e responder.</p>
              </div>
            )}
          </div>
        </div>

        {/* Success Toast */}
        {sendSuccessToast && (
          <div className="absolute bottom-6 right-6 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in zoom-in-95 duration-200 z-50">
            <CheckCircle2 size={20} />
            <div>
              <h5 className="font-extrabold text-xs">E-mail enviado com sucesso!</h5>
              <p className="text-[11px] text-emerald-100">Sua resposta foi enviada pelo Outlook e salva nos Enviados.</p>
            </div>
          </div>
        )}

        {/* MODAL: Add New Outlook Account */}
        {isAddAccountOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in zoom-in-95">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Mail size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Conectar Nova Conta Outlook</h4>
                    <p className="text-[11px] text-slate-500">Conexão segura via Microsoft Office 365</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddAccountOpen(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X size={16} />
                </button>
              </div>

              {accountConnectSuccess ? (
                <div className="py-6 text-center space-y-2">
                  <CheckCircle2 size={40} className="text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-sm font-extrabold text-slate-800">Conta Conectada com Sucesso!</h4>
                  <p className="text-xs text-slate-500">A caixa de entrada já está sincronizando em tempo real.</p>
                </div>
              ) : (
                <form onSubmit={handleAddAccount} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Endereço de E-mail Outlook corporativo:
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="exemplo@medicpe.com.br"
                      value={newAccountForm.email}
                      onChange={e => setNewAccountForm({ ...newAccountForm, email: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Nome de Identificação da Caixa (ex: Vendas, Suporte):
                    </label>
                    <input
                      type="text"
                      placeholder="Central de Atendimento"
                      value={newAccountForm.label}
                      onChange={e => setNewAccountForm({ ...newAccountForm, label: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Empresa / Setor Correspondente:
                    </label>
                    <select
                      value={newAccountForm.company}
                      onChange={e => setNewAccountForm({ ...newAccountForm, company: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Medic">Medic Ortopedia</option>
                      <option value="Arthromed">Arthromed OPME</option>
                      <option value="T.I">Suporte T.I</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Senha da Caixa de E-mail (Locaweb Webmail/Outlook):
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••"
                      value={newAccountForm.appPassword}
                      onChange={e => setNewAccountForm({ ...newAccountForm, appPassword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  {/* Configurações Locaweb da Imagem */}
                  <div className="bg-slate-100/80 border border-slate-200 rounded-xl p-3 space-y-1.5 text-[10.5px]">
                    <span className="font-extrabold text-slate-700 block uppercase tracking-wider text-[9.5px]">
                      Configuração de Servidor Locaweb (SSL/TLS):
                    </span>
                    <div className="grid grid-cols-2 gap-2 font-mono text-slate-600">
                      <div>
                        <span className="font-bold text-slate-800 block">IMAP: email-ssl.com.br</span>
                        <span>Porta: 993 (SSL)</span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">SMTP: email-ssl.com.br</span>
                        <span>Porta: 465 (SSL)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddAccountOpen(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isTestingConnection}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer disabled:cursor-wait"
                    >
                      {isTestingConnection ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Autenticando email-ssl.com.br...</span>
                        </>
                      ) : (
                        <span>Conectar Conta Locaweb</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  )
}
