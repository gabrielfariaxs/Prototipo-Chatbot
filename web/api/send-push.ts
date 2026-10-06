import webpush from 'web-push'

/**
 * Endpoint de compatibilidade para envio de WebPush via Vercel Serverless.
 * Nota: No TanStack Start / Cloudflare, prefira utilizar a Server Function `sendPushServerFn` em `src/lib/push.ts`.
 */

const VAPID_PUBLIC_KEY = 
  process.env.VITE_VAPID_PUBLIC_KEY || 
  'BGkHJjH43u6d01zdVZcZ79cqO-_ME-rhbr8fP6OnMWHSo_li1ILwulOqir2BhQHJk3nCK_oF52yTasXgsUQGgQc'

const VAPID_PRIVATE_KEY = 
  process.env.VAPID_PRIVATE_KEY || 
  'Q50YDJf37kvH_R_SmgRxcyzbL8Y9XlTJoHQmnlXqq74V'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:suporte@q2medical.net',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

export default async function handler(req: any, res: any) {
  const origin = req.headers?.origin || ''
  
  // CORS Seguro: Permite requisições da mesma origem ou origens confiáveis
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*')
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Authorization, Content-Type, X-Requested-With'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('[send-push-api] VAPID keys não configuradas no servidor.')
    res.status(500).json({ error: 'Push service not configured (Missing VAPID keys).' })
    return
  }

  try {
    const { subscriptions, payload } = req.body || {}

    if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
      res.status(400).json({ error: 'Nenhuma inscrição (subscription) fornecida.' })
      return
    }

    if (!payload) {
      res.status(400).json({ error: 'Nenhum payload de notificação fornecido.' })
      return
    }

    const pushPayload = JSON.stringify({
      title: payload.title || 'Nova Notificação',
      body: payload.body || 'Você tem uma nova mensagem.',
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/logo.png',
      url: payload.url || '/',
      ...payload
    })

    const sendPromises = subscriptions.map((sub: any) =>
      webpush.sendNotification(sub, pushPayload).catch((err: any) => {
        console.warn('[send-push-api] Erro ao enviar push para subscription:', err?.message || err)
        return { success: false, error: err }
      })
    )

    await Promise.all(sendPromises)
    res.status(200).json({ success: true, message: 'Notificações enviadas com sucesso.' })
  } catch (error: any) {
    console.error('[send-push-api] Erro ao enviar notificações:', error)
    res.status(500).json({ error: 'Failed to send notification.', details: error.message })
  }
}
