import { getWebRequest } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

// Usamos a chave publica para validar a sessao (isso é seguro, o Supabase valida o JWT contra a assinatura do projeto)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://espjmmzyrimglobetlzo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || ''

const supabaseAuth = createClient(supabaseUrl, supabaseKey)

/**
 * Utilitário para verificar e exigir autenticação nas Server Functions.
 * Lê o header Authorization ou Cookie e valida o JWT contra o Supabase.
 */
export async function requireAuth() {
  const req = getWebRequest()
  if (!req) {
    throw new Error('Falha ao obter request (não está em ambiente de servidor)')
  }

  // Tenta extrair o token do cabeçalho de Autorização
  const authHeader = req.headers.get('Authorization')
  let token = ''

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.replace('Bearer ', '')
  } else {
    // Tentar ler dos cookies o sb-access-token injetado pelo frontend
    const cookieHeader = req.headers.get('Cookie')
    if (cookieHeader) {
      const match = cookieHeader.match(/sb-access-token=([^;]+)/)
      if (match) {
        token = match[1]
      }
    }
  }

  if (!token) {
    throw new Error('Não autorizado: Token JWT Ausente. Faça login novamente.')
  }

  // Valida o JWT no Supabase
  const { data, error } = await supabaseAuth.auth.getUser(token)

  if (error || !data.user) {
    console.error('Erro de Autenticação JWT:', error?.message)
    throw new Error('Não autorizado: Sessão inválida ou expirada.')
  }

  return {
    user: data.user,
    token
  }
}
