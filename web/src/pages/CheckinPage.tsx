import React, { useState, useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { CheckCircle2, User, Building2, MapPin, LogOut } from 'lucide-react'
import { registrarPresenca } from '../lib/trainings-service'
import { LoginScreen } from '../components/common/LoginScreen'

export const CheckinPage: React.FC = () => {
  const { id } = useParams({ strict: false })
  
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [nome, setNome] = useState('')
  const [setor, setSetor] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSector = localStorage.getItem('userSector')
      const storedName = localStorage.getItem('userName')
      if (storedSector) {
        setIsLoggedIn(true)
        setSetor(storedSector)
      }
      if (storedName) {
        setNome(storedName)
      }
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    if (typeof window !== 'undefined') {
      setSetor(localStorage.getItem('userSector') || '')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !nome || !setor) return
    setLoading(true)
    try {
      await registrarPresenca(id as string, nome, setor)
      setSuccess(true)
    } catch (err) {
      alert('Erro ao realizar o check-in. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Check-in Realizado!</h2>
          <p className="text-slate-500 mb-8">Sua presença foi confirmada com sucesso na ata digital. Você já pode fechar esta página.</p>
          <div className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="font-bold text-slate-700">{nome}</p>
            <p className="text-xs text-slate-400 font-medium uppercase mt-1">{setor}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return <LoginScreen onSuccess={handleLoginSuccess} />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative">
      <button 
        onClick={() => {
          localStorage.removeItem('userSector')
          localStorage.removeItem('userLevel')
          setIsLoggedIn(false)
        }}
        className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 bg-white rounded-full shadow-sm border border-slate-200"
      >
        <LogOut size={20} />
      </button>

      <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <MapPin size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 mb-2">Check-in de Presença</h1>
          <p className="text-sm text-slate-500">Confirme sua participação no treinamento informando seus dados abaixo.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
              <User size={16} className="text-slate-400" /> Nome Completo
            </label>
            <input
              required
              type="text"
              value={nome}
              onChange={e => {
                setNome(e.target.value)
                if (typeof window !== 'undefined') localStorage.setItem('userName', e.target.value)
              }}
              className="w-full p-4 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              placeholder="Digite seu nome completo"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
              <Building2 size={16} className="text-slate-400" /> Setor
            </label>
            <input
              required
              disabled
              type="text"
              value={setor}
              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 outline-none cursor-not-allowed"
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full p-4 mt-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
          >
            {loading ? 'Confirmando...' : 'Confirmar Presença'}
          </button>
        </form>
      </div>
    </div>
  )
}
