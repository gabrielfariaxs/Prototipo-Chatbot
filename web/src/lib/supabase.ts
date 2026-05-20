import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente com fallbacks públicos e seguros para garantir funcionamento universal
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aucfklzbouqjfvrycdvb.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_Uc72wj9rXElJQaPf2sWlWQ_8F_P5wIi'

const isConfigured = !!(supabaseUrl && supabaseKey)

if (!isConfigured) {
  console.warn('⚠️ Credenciais do Supabase não encontradas. Utilizando simulador.')
} else {
  console.log('🔌 Supabase inicializado com sucesso!', {
    url: supabaseUrl,
    hasKey: !!supabaseKey,
    keyPreview: supabaseKey.substring(0, 15) + '...'
  })
}

// Fallback apenas para resiliência extrema em builds
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: { session: null }, error: new Error('Supabase não configurado') }),
  }
}

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : (mockSupabase as any)
