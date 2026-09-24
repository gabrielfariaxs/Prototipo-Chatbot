import webpush from 'web-push'

// Configuração das Chaves VAPID a partir das variáveis de ambiente
// Estas chaves devem estar no .env do Vercel
const VAPID_PUBLIC_KEY = process.env.VITE_VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

// Configurar o web-push se as chaves existirem
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:suporte@q2medical.net',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
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
    console.error('VAPID keys não configuradas no servidor.')
    res.status(500).json({ error: 'Push service not configured (Missing VAPID keys).' })
    return
  }

  try {
    const { subscriptions, payload } = req.body

    if (!subscriptions || !Array.isArray(subscriptions) || subscriptions.length === 0) {
      res.status(400).json({ error: 'Nenhuma inscrição (subscription) fornecida.' })
      return
    }

    if (!payload) {
      res.status(400).json({ error: 'Nenhum payload de notificação fornecido.' })
      return
    }

    // Estrutura padrão da notificação
    const pushPayload = JSON.stringify({
      title: payload.title || 'Nova Notificação',
      body: payload.body || 'Você tem uma nova mensagem.',
      icon: payload.icon || '/logo.png',
      badge: payload.badge || '/logo.png',
      url: payload.url || '/',
      ...payload
    })

    const sendPromises = subscriptions.map((sub) =>
      webpush.sendNotification(sub, pushPayload).catch((err) => {
        console.error('Erro ao enviar push para subscription:', err)
        // Se retornar 404 ou 410, a inscrição expirou e pode ser removida do banco no futuro
        return { success: false, error: err }
      })
    )

    await Promise.all(sendPromises)

    res.status(200).json({ success: true, message: 'Notificações enviadas com sucesso.' })
  } catch (error: any) {
    console.error('Erro na API de push:', error)
    res.status(500).json({ error: 'Failed to send notification.', details: error.message })
  }
}
