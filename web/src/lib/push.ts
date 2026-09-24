import { supabase } from './supabase'

/**
 * Envia uma notificação Push para os dispositivos inscritos que corresponderem ao setor ou usuário
 */
export async function sendPushNotification(
  payload: { title: string; body: string; url?: string },
  targetSector?: string,
  targetUser?: string
) {
  try {
    let query = supabase.from('push_subscriptions').select('subscription, user_sector, user_name')

    // Lógica de filtro (se targetSector e targetUser forem omitidos, envia pra todo mundo)
    if (targetSector) {
      // Se for pra COO/Diretoria, precisamos pegar os inscritos na diretoria ou operacoes
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
      console.error('Erro ao buscar push subscriptions:', error)
      return false
    }

    if (!data || data.length === 0) {
      console.log('Nenhum dispositivo inscrito encontrado para este alvo.')
      return false
    }

    const subscriptions = data.map(row => row.subscription)

    // Dispara a requisição para a API Vercel
    const apiUrl = import.meta.env.DEV ? 'http://localhost:3000/api/send-push' : '/api/send-push'
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        subscriptions,
        payload
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('Erro na API de push:', errText)
      return false
    }

    return true
  } catch (err) {
    console.error('Falha ao disparar push notification:', err)
    return false
  }
}
