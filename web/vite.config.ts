import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { cloudflare } from '@cloudflare/vite-plugin'

const isVercel = !!process.env.VERCEL

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  envPrefix: ['VITE_', 'SUPABASE_', 'AI_GATEWAY_'],
  plugins: [
    devtools(),
    !isVercel && cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ].filter(Boolean),
})

export default config
