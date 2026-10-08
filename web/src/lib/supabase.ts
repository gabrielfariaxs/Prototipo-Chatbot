import { createClient } from '@supabase/supabase-js'

// Variáveis de ambiente com fallbacks públicos e seguros para garantir funcionamento universal
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://espjmmzyrimglobetlzo.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_MiUtB_XXXPCUMZqOamIF8g_wqL5HOaw'

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
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined',
      }
    }) 
  : (mockSupabase as any)

export const getSectorFromEmail = (email?: string): string => {
  if (!email) return ''
  const handle = email.split('@')[0].toLowerCase().trim()
  if (handle.includes('comercial_externo')) return 'Comercial externo'
  if (handle.includes('comercial_interno') || handle.includes('comercial')) return 'Comercial interno'
  if (handle.includes('instrumentacao')) return 'Instrumentação'
  if (handle.includes('t_i') || handle.includes('ti') || handle.includes('suporte')) return 'T.I'
  if (handle.includes('qualidade')) return 'Qualidade / RT'
  if (handle.includes('gente_gestao') || handle.includes('rh') || handle.includes('gente')) return 'Gente Gestão'
  if (handle.includes('financeiro')) return 'Financeiro'
  if (handle.includes('estoque') || handle.includes('logistica')) return 'Estoque e logistica'
  if (handle.includes('supply')) return 'Supply Chain'
  if (handle.includes('compras')) return 'Compras'
  if (handle.includes('operac')) return 'Operações'
  if (handle.includes('gestor') || handle.includes('diretor')) return 'Gestor/Diretoria'
  return ''
}

// Sincroniza a sessão do localStorage com um Cookie para as Server Functions (API) lerem
if (typeof window !== 'undefined' && isConfigured) {
  const syncSessionState = (session: any) => {
    if (session?.access_token) {
      const maxAge = 60 * 60 * 24 * 7; // 7 dias
      document.cookie = `sb-access-token=${session.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;

      if (session.user?.email && !localStorage.getItem('userSector')) {
        const sector = getSectorFromEmail(session.user.email);
        if (sector) {
          localStorage.setItem('userSector', sector);
        }
      }
    } else {
      document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  };

  supabase.auth.onAuthStateChange(async (event: string, session: any) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
      syncSessionState(session);
    } else if (event === 'SIGNED_OUT') {
      document.cookie = `sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      localStorage.removeItem('userSector');
      localStorage.removeItem('userLevel');
      localStorage.removeItem('userName');
    }
  });

  // Validação e auto-recuperação de token no carregamento da aplicação
  supabase.auth.getSession().then(async ({ data: { session }, error }: any) => {
    if (error || !session) {
      // Se não há sessão Supabase válida, limpa setores residuais para não burlar a autenticação
      if (localStorage.getItem('userSector') && !session) {
        localStorage.removeItem('userSector');
        localStorage.removeItem('userLevel');
      }
      return;
    }

    syncSessionState(session);

    // Se o token estiver expirado ou a menos de 2 minutos de expirar, renova proativamente
    const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
    if (expiresAt && Date.now() > expiresAt - 120000) {
      try {
        const { data: refreshData, error: refreshErr } = await supabase.auth.refreshSession();
        if (refreshErr) {
          console.warn('Sessão expirada não pôde ser renovada automaticamente:', refreshErr.message);
          await supabase.auth.signOut();
          localStorage.removeItem('userSector');
          localStorage.removeItem('userLevel');
        } else if (refreshData.session) {
          syncSessionState(refreshData.session);
        }
      } catch (err) {
        console.warn('Erro ao atualizar sessão expirada:', err);
      }
    }
  });
}

