import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { supabase } from './supabase'
import { requireAuth } from './security'

/**
 * Função de Servidor (TanStack Start) para envio seguro de Web Push Notifications.
 * - Exige autenticação via JWT (`requireAuth`)
 * - Executa tanto em ambiente local quanto em produção (Cloudflare / Node / Vercel)
 */
export const sendPushServerFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      subscriptions: z.array(z.any()),
      payload: z.object({
        title: z.string(),
        body: z.string(),
        url: z.string().optional(),
        icon: z.string().optional(),
        badge: z.string().optional(),
      }),
    })
  )
  .handler(async ({ data }) => {
    // 🔒 1. Validação de Segurança: Apenas usuários autenticados podem disparar push
    await requireAuth()

    const { subscriptions, payload } = data

    if (!subscriptions || subscriptions.length === 0) {
      return { success: false, error: 'Nenhuma inscrição fornecida.' }
    }

    const VAPID_PUBLIC_KEY = 
      process.env.VITE_VAPID_PUBLIC_KEY || 
      (import.meta.env ? (import.meta.env as any).VITE_VAPID_PUBLIC_KEY : '') ||
      'BGkHJjH43u6d01zdVZcZ79cqO-_ME-rhbr8fP6OnMWHSo_li1ILwulOqir2BhQHJk3nCK_oF52yTasXgsUQGgQc'

    const VAPID_PRIVATE_KEY = 
      process.env.VAPID_PRIVATE_KEY || 
      (import.meta.env ? (import.meta.env as any).VAPID_PRIVATE_KEY : '') ||
      'Q50YDJf37kvH_R_SmgRxcyzbL8Y9XlTJoHQmnlXqq74V'

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      console.error('[push-server] Chaves VAPID não configuradas.')
      return { success: false, error: 'VAPID keys ausentes no servidor.' }
    }

    try {
      const webpush = (await import('web-push')).default
      webpush.setVapidDetails('mailto:suporte@q2medical.net', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

      const pushPayload = JSON.stringify({
        title: payload.title || 'Nova Notificação',
        body: payload.body || 'Você tem uma nova mensagem.',
        icon: payload.icon || '/logo.png',
        badge: payload.badge || '/logo.png',
        url: payload.url || '/',
      })

      const promises = subscriptions.map((sub) =>
        webpush.sendNotification(sub, pushPayload).catch((err) => {
          console.warn('[push-server] Falha ao enviar para dispositivo:', err?.message || err)
          return { success: false, error: err }
        })
      )

      await Promise.all(promises)
      return { success: true, count: subscriptions.length }
    } catch (err: any) {
      console.error('[push-server] Erro geral ao disparar push:', err)
      return { success: false, error: err.message || 'Falha ao processar push' }
    }
  })

/**
 * Utilitário Client-Side para buscar os destinatários e disparar a notificação
 */
export async function sendPushNotification(
  payload: { title: string; body: string; url?: string },
  targetSector?: string,
  targetUser?: string
): Promise<boolean> {
  try {
    let query = supabase.from('push_subscriptions').select('subscription, user_sector, user_name')

    // Filtro por setor ou usuário
    if (targetSector) {
      if (targetSector === 'Gestor/Diretoria' || targetSector === 'Operações') {
        query = query.in('user_sector', ['Gestor/Diretoria', 'Operações', 'Gestor (Diogo)'])
      } else {
        query = query.ilike('user_sector', `%${targetSector}%`)
      }
    } else if (targetUser) {
      query = query.ilike('user_name', `%${targetUser}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('[push] Erro ao buscar push subscriptions:', error)
      return false
    }

    if (!data || data.length === 0) {
      console.log('[push] Nenhum dispositivo inscrito encontrado para este alvo.')
      return false
    }

    const subscriptions = data.map((row) => row.subscription)

    // Chama a Server Function protegida
    const result = await sendPushServerFn({
      data: {
        subscriptions,
        payload,
      },
    })

    return !!result?.success
  } catch (err) {
    console.error('[push] Falha ao disparar notificação:', err)
    return false
  }
}
