import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Lock, ArrowRight, ShieldAlert, X, Eye, EyeOff, Loader2, ArrowLeft, Send, User } from 'lucide-react'
import { BrandLockup } from './BrandLockup'

interface LoginScreenProps {
  onSuccess?: () => void
  onBackToMenu?: () => void
}

export function LoginScreen({ onSuccess, onBackToMenu }: LoginScreenProps) {
  const [view, setView] = useState<'login' | 'forgot_password'>('login')
  const [sector, setSector] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetSector, setResetSector] = useState('')
  const [role, setRole] = useState('lider')

  const SETORES = [
    'Comercial externo', 'Comercial interno', 'Instrumentação', 'T.I',
    'Qualidade / RT', 'Gente Gestão', 'Financeiro', 'Estoque e logistica',
    'Supply Chain', 'Compras', 'Operações', 'Gestor/Diretoria'
  ]

  const getEmailFromSector = (sec: string) => {
    const slug = sec
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
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
        // Suporte a senha master / setor Gestor
        if (password === 'diogo2026' || (sector === 'Gestor/Diretoria' && password.toLowerCase() === 'diogo2026')) {
          localStorage.setItem('userSector', sector)
          localStorage.setItem('userLevel', sector === 'Gestor/Diretoria' ? 'coo' : role)
          if (onSuccess) onSuccess()
          return
        }

        if (authError.message === 'Invalid login credentials' || authError.status === 400) {
          setError('Credenciais incorretas para o setor selecionado.')
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      localStorage.setItem('userSector', sector)
      localStorage.setItem('userLevel', sector === 'Gestor/Diretoria' ? 'coo' : role)
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
        redirectTo: window.location.origin,
      })

      if (resetError) {
        setError(resetError.message)
      } else {
        setResetSuccess(true)
      }
    } catch (err) {
      setError('Erro ao enviar e-mail de recuperação.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#f5f7fb] px-4 overflow-hidden">
      
      {/* Container */}
      <div className="max-w-[480px] w-full flex flex-col items-center relative z-10 my-auto py-8">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <BrandLockup showAppName={true} className="mb-4" />
          
          <span className="eyebrow mt-2">
            Portal do Colaborador &bull; Acesso Corporativo
          </span>
        </div>

        {/* Card */}
        <div className="w-full bg-white rounded-[16px] p-8 sm:p-10 shadow-[0_4px_22px_rgba(20,22,31,0.06)] border border-[#e6e9f2]">
          
          {view === 'login' ? (
            <>
              {onBackToMenu && (
                <button 
                  onClick={onBackToMenu}
                  type="button"
                  className="flex items-center gap-2 text-xs font-semibold text-[#5b6276] hover:text-[#1f29de] transition-colors mb-6 cursor-pointer bg-transparent border-none p-0 outline-none"
                >
                  <ArrowLeft size={16} />
                  <span>Voltar ao Menu Principal</span>
                </button>
              )}

              <div className="mb-6">
                <h1 className="font-display font-extrabold text-2xl text-[#14161f] mb-1 leading-tight">
                  Acesse sua conta
                </h1>
                <p className="text-xs text-[#5b6276] leading-relaxed">
                  Selecione seu setor de atuação para validar seu nível de acesso.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-3.5 bg-[#feecec] border border-[#f7b4b4] text-[#b42121] text-xs font-semibold rounded-[11px] flex items-center gap-2.5">
                  <ShieldAlert size={16} className="shrink-0 text-[#dc2f2f]" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                {/* Setor */}
                <div>
                  <label className="eyebrow block mb-2">
                    Setor Corporativo *
                  </label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    required
                    className="w-full h-[44px] px-3.5 bg-white border border-[#e6e9f2] rounded-[11px] text-sm font-semibold text-[#14161f] outline-none focus:border-[#1f29de] focus:ring-2 focus:ring-[#1f29de]/20 transition-all cursor-pointer"
                  >
                    <option value="">Selecione seu setor...</option>
                    {SETORES.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>

                {/* Perfil */}
                {sector && sector !== 'Gestor/Diretoria' && (
                  <div>
                    <label className="eyebrow block mb-2">
                      Nível de Acesso *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('lider')}
                        className={`h-[44px] rounded-[11px] text-xs font-bold transition-all cursor-pointer ${
                          role === 'lider'
                            ? 'bg-[#1f29de] text-white shadow-xs'
                            : 'bg-[#fafbfe] border border-[#e6e9f2] text-[#5b6276] hover:border-[#1f29de]'
                        }`}
                      >
                        Líder de Setor
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('colaborador')}
                        className={`h-[44px] rounded-[11px] text-xs font-bold transition-all cursor-pointer ${
                          role === 'colaborador'
                            ? 'bg-[#1f29de] text-white shadow-xs'
                            : 'bg-[#fafbfe] border border-[#e6e9f2] text-[#5b6276] hover:border-[#1f29de]'
                        }`}
                      >
                        Colaborador
                      </button>
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="eyebrow">
                      Senha Corporativa *
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot_password')}
                      className="text-xs font-semibold text-[#1f29de] hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock size={16} className="absolute left-3.5 text-[#9097aa]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite sua senha"
                      required
                      className="w-full h-[44px] pl-10 pr-10 bg-white border border-[#e6e9f2] rounded-[11px] text-sm font-medium text-[#14161f] outline-none focus:border-[#1f29de] focus:ring-2 focus:ring-[#1f29de]/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-[#9097aa] hover:text-[#14161f] transition-colors bg-transparent border-none outline-none p-0 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[44px] bg-[#1f29de] hover:bg-[#1a22b8] text-white rounded-[11px] text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <>
                      <span>Entrar no Portal</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <>
              <button 
                onClick={() => setView('login')}
                type="button"
                className="flex items-center gap-2 text-xs font-semibold text-[#5b6276] hover:text-[#1f29de] transition-colors mb-6 cursor-pointer bg-transparent border-none p-0 outline-none"
              >
                <ArrowLeft size={16} />
                <span>Voltar ao Login</span>
              </button>

              <div className="mb-6">
                <h1 className="font-display font-extrabold text-2xl text-[#14161f] mb-1">
                  Recuperar Senha
                </h1>
                <p className="text-xs text-[#5b6276] leading-relaxed">
                  Informe seu setor para enviarmos as instruções de redefinição.
                </p>
              </div>

              {resetSuccess ? (
                <div className="p-4 bg-[#e6fdf2] border border-[#93f6c8] text-[#067247] text-xs font-semibold rounded-[11px] space-y-2">
                  <p>Instruções enviadas para o e-mail do setor selecionado com sucesso.</p>
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-[#1f29de] font-bold underline cursor-pointer"
                  >
                    Ir para a tela de login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="eyebrow block mb-2">
                      Selecione seu Setor *
                    </label>
                    <select
                      value={resetSector}
                      onChange={(e) => setResetSector(e.target.value)}
                      required
                      className="w-full h-[44px] px-3.5 bg-white border border-[#e6e9f2] rounded-[11px] text-sm font-semibold text-[#14161f] outline-none focus:border-[#1f29de] focus:ring-2 focus:ring-[#1f29de]/20 transition-all cursor-pointer"
                    >
                      <option value="">Selecione seu setor...</option>
                      {SETORES.map((sec) => (
                        <option key={sec} value={sec}>{sec}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[44px] bg-[#1f29de] hover:bg-[#1a22b8] text-white rounded-[11px] text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <span>Enviar Instruções</span>}
                  </button>
                </form>
              )}
            </>
          )}

        </div>

        {/* Footer info */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-[11px] font-mono text-[#9097aa] m-0">
            ARTHROMED &bull; MEDIC ORTOPEDIA &bull; SISTEMA MEDIA
          </p>
        </div>

      </div>
    </div>
  )
}
