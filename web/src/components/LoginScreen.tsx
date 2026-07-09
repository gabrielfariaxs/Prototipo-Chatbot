import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, ArrowRight, ShieldAlert, X, Eye, EyeOff, Loader2, ArrowLeft, Send, User } from 'lucide-react'

interface LoginScreenProps {
  onSuccess?: () => void
}

export function LoginScreen({ onSuccess }: LoginScreenProps) {
  const [view, setView] = useState<'login' | 'forgot_password'>('login')
  const [sector, setSector] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetSector, setResetSector] = useState('')

  const SETORES = [
    'Comercial externo', 'Comercial interno', 'Instrumentação', 'T.I',
    'Qualidade / RT', 'Qualidade', 'Gente Gestão', 'Financeiro', 'Estoque e logistica',
    'Supply Chain', 'Compras', 'Operações'
  ]

  const getEmailFromSector = (sec: string) => {
    // Normaliza para remover acentos, depois substitui não-alfanuméricos por _
    const slug = sec
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') // Remove _ no começo ou fim
    return `${slug}@medic.com.br`
  }
  const [resetSuccess, setResetSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!sector || !password) {
      setError('Por favor, selecione seu setor e digite a senha.')
      setLoading(false)
      return
    }

    const mappedEmail = getEmailFromSector(sector)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: mappedEmail,
        password: password,
      })

      if (authError) {
        if (authError.message === 'Invalid login credentials' || authError.status === 400) {
          setError('E-mail corporativo ou senha incorretos.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      // Sucesso!
      localStorage.setItem('userSector', sector)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      setError('Ocorreu um erro ao conectar ao servidor. Tente novamente.')
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!resetSector) {
      setError('Por favor, selecione seu setor.')
      setLoading(false)
      return
    }

    const mappedEmail = getEmailFromSector(resetSector)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(mappedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        setError(resetError.message)
        setLoading(false)
        return
      }

      setResetSuccess(true)
      setLoading(false)
    } catch (err: any) {
      setError('Ocorreu um erro ao conectar ao servidor. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc] px-4 overflow-hidden">
      {/* Background Dot Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60" 
        style={{
          backgroundImage: 'radial-gradient(#e2e8f0 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Soft gradient orbs in background */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,123,143,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,127,80,0.03),transparent_70%)] pointer-events-none" />

      {/* Main card and header container */}
      <div className="rise-in max-w-[480px] w-full flex flex-col items-center relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center gap-3.5 mb-2.5">
            {/* MedIA Icon */}
            <div className="w-11 h-11 bg-[#1a2332] rounded-xl flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h1v2H9V9zm5 0h1v2h-1V9z" />
              </svg>
            </div>
            
            {/* Brand text */}
            <div className="text-left">
              <h2 className="text-xl font-bold tracking-tight text-[#0f172a] leading-none mb-0.5">MedIA</h2>
              <span className="text-[10px] font-extrabold tracking-widest text-[#64748b] uppercase">Assistente Corp</span>
            </div>
          </div>
          
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#64748b] uppercase mt-2.5">
            Portal do Colaborador
          </p>
        </div>

        {/* Login & Forgot Password White Card */}
        <div className="w-full bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_12px_40px_rgba(15,23,42,0.04)] border border-[#f1f5f9]">
          
          {view === 'login' ? (
            <>
              <div className="text-center mb-7">
                <h1 className="text-[22px] font-bold text-[#0f172a] mb-1.5">Acesso Restrito</h1>
                <p className="text-sm text-[#64748b]">Utilize suas credenciais corporativas.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                
                {/* Sector Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase">
                    Setor
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-[18px] h-[18px] text-[#94a3b8]" />
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#0f172a] focus:bg-white focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all appearance-none cursor-pointer"
                      disabled={loading}
                    >
                      <option value="" disabled>Selecione seu setor...</option>
                      {SETORES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase">
                      Senha
                    </label>
                    <button 
                      type="button"
                      onClick={() => {
                        setView('forgot_password')
                        setError('')
                        setResetSuccess(false)
                      }}
                      className="text-[11px] font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer outline-none bg-transparent border-none p-0"
                    >
                      Esqueceu?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-4 w-[18px] h-[18px] text-[#94a3b8]" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 pl-11 pr-12 text-sm text-[#0f172a] placeholder-[#94a3b8] focus:bg-white focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-[#94a3b8] hover:text-[#475569] transition-colors outline-none"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-[18px] h-[18px]" /> : <Eye className="w-[18px] h-[18px]" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex gap-2.5 items-start animate-shake">
                    <ShieldAlert className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] font-medium text-red-700 leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1e293b] hover:bg-[#0f172a] active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Entrando...</span>
                    </>
                  ) : (
                    <>
                      <span>Entrar na Plataforma</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Security Warning */}
              <div className="mt-8 p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex gap-3 items-start">
                <ShieldAlert className="w-[18px] h-[18px] text-[#64748b] shrink-0 mt-0.5" />
                <p className="text-[10px] font-semibold text-[#64748b] leading-normal">
                  Acesso monitorado e restrito a colaboradores autorizados da Arthromed e Medic. Tentativas de acesso não autorizado serão registradas.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Back to Login Link */}
              <button 
                onClick={() => {
                  setView('login')
                  setError('')
                  setResetSuccess(false)
                }}
                className="flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors mb-6 cursor-pointer bg-transparent border-none p-0 outline-none"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar para o Login</span>
              </button>

              <div className="mb-7">
                <h1 className="text-[22px] font-bold text-[#0f172a] mb-2">Recuperar Senha</h1>
                <p className="text-xs text-[#64748b] leading-relaxed">
                  Digite o endereço de e-mail associado à sua conta corporativa. Enviaremos um link para você redefinir sua senha.
                </p>
              </div>

              {/* Reset Success State */}
              {resetSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 items-start mb-6">
                  <div className="p-1.5 bg-emerald-500 text-white rounded-lg shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-800 text-xs mb-0.5">E-mail de instruções enviado!</h4>
                    <p className="text-[10px] text-emerald-600 leading-relaxed font-medium">
                      Verifique sua caixa de entrada corporativa e siga as etapas do link enviado para cadastrar uma nova senha.
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleResetPassword} className="space-y-5">
                
                {/* Reset Sector Field */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase">
                    Seu Setor
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 w-[18px] h-[18px] text-[#94a3b8]" />
                    <select
                      value={resetSector}
                      onChange={(e) => setResetSector(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-xl py-3.5 pl-11 pr-4 text-sm text-[#0f172a] focus:bg-white focus:border-[#0f172a] focus:ring-1 focus:ring-[#0f172a] outline-none transition-all appearance-none cursor-pointer"
                      disabled={loading}
                    >
                      <option value="" disabled>Selecione seu setor...</option>
                      {SETORES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex gap-2.5 items-start animate-shake">
                    <ShieldAlert className="w-[18px] h-[18px] text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] font-medium text-red-700 leading-relaxed">{error}</p>
                  </div>
                )}

                {/* Reset Submit Button */}
                <button
                  type="submit"
                  disabled={loading || resetSuccess}
                  className="w-full bg-[#1e293b] hover:bg-[#0f172a] active:scale-[0.98] text-white py-4 px-6 rounded-xl font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <span>Enviar Instruções</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

        </div>

      </div>
    </div>
  )
}
