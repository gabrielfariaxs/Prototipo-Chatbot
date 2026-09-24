import { defineConfig, loadEnv } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import webpush from 'web-push'

function localPushApiPlugin() {
  return {
    name: 'local-push-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/send-push' && req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => { body += chunk })
          req.on('end', async () => {
            try {
              const { subscriptions, payload } = JSON.parse(body)
              const env = loadEnv(server.config.mode, process.cwd(), '')
              const VAPID_PUBLIC_KEY = env.VITE_VAPID_PUBLIC_KEY
              const VAPID_PRIVATE_KEY = env.VAPID_PRIVATE_KEY

              if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: 'Missing VAPID keys' }))
                return
              }

              webpush.setVapidDetails('mailto:suporte@q2medical.net', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
              const pushPayload = JSON.stringify({
                title: payload.title || 'Nova Notificação',
                body: payload.body || 'Você tem uma nova mensagem.',
                icon: payload.icon || '/logo.png',
                badge: payload.badge || '/logo.png',
                url: payload.url || '/',
                ...payload
              })

              const promises = subscriptions.map((sub: any) => 
                webpush.sendNotification(sub, pushPayload).catch(err => ({ success: false, error: err }))
              )
              await Promise.all(promises)
              
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ success: true, message: 'Notificações enviadas (dev)' }))
            } catch (err: any) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
        } else {
          next()
        }
      })
    }
  }
}


const isVercel = !!process.env.VERCEL
const isDev = process.argv.includes('dev') || process.env.NODE_ENV === 'development'

const config = defineConfig({
  server: { host: true },
  resolve: { tsconfigPaths: true },
  envPrefix: ['VITE_', 'SUPABASE_', 'AI_GATEWAY_'],
  ssr: isDev
    ? {
        external: ['react', 'react-dom'],
      }
    : {
        noExternal: true,
      },
  plugins: [
    devtools(),
    !isVercel && !isDev && cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    isDev && localPushApiPlugin()
  ].filter(Boolean),
})

export default config

