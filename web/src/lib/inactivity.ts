import { useEffect } from 'react'
import { supabase } from './supabase'

/**
 * Encerra a sessão automaticamente após um período sem interação.
 * - Sincroniza entre abas (atividade em uma aba mantém as outras vivas).
 * - Só atua quando há sessão ativa.
 */

const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutos
const CHECK_INTERVAL_MS = 30 * 1000 // verifica a cada 30s
const THROTTLE_MS = 5 * 1000 // grava atividade no máx. a cada 5s
const STORAGE_KEY = 'media:last-activity'
const EVENTOS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'visibilitychange'] as const

export function useInactivityLogout(timeoutMs = TIMEOUT_MS) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    let ultimaGravacao = 0
    const registrarAtividade = () => {
      const agora = Date.now()
      if (agora - ultimaGravacao < THROTTLE_MS) return
      ultimaGravacao = agora
      try {
        localStorage.setItem(STORAGE_KEY, String(agora))
      } catch {
        /* storage indisponível: ignora */
      }
    }

    const verificar = async () => {
      const ultima = Number(localStorage.getItem(STORAGE_KEY) || Date.now())
      if (Date.now() - ultima < timeoutMs) return

      const { data } = await supabase.auth.getSession()
      if (!data?.session) return

      localStorage.removeItem(STORAGE_KEY)
      await supabase.auth.signOut()
      window.location.replace('/?motivo=inatividade')
    }

    registrarAtividade()
    EVENTOS.forEach((ev) => window.addEventListener(ev, registrarAtividade, { passive: true }))
    const intervalo = window.setInterval(verificar, CHECK_INTERVAL_MS)

    return () => {
      EVENTOS.forEach((ev) => window.removeEventListener(ev, registrarAtividade))
      window.clearInterval(intervalo)
    }
  }, [timeoutMs])
}
