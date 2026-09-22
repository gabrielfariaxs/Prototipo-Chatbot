import { supabase } from './supabase'

export interface Treinamento {
  id: string
  titulo: string
  descricao: string
  data: string // YYYY-MM-DD
  horario: string
  colaboradores: string
  link_video: string
  status: 'agendado' | 'em_andamento' | 'finalizado'
  criado_por: string
  created_at: string
}

export interface Presenca {
  id: string
  treinamento_id: string
  nome: string
  setor: string
  horario_checkin: string
}

// -----------------------------
// Treinamentos
// -----------------------------

export async function getTreinamentosMes(ano: number, mes: number) {
  const startDate = `${ano}-${String(mes).padStart(2, '0')}-01`
  const lastDay = new Date(ano, mes, 0).getDate()
  const endDate = `${ano}-${String(mes).padStart(2, '0')}-${lastDay}`

  const { data, error } = await supabase
    .from('treinamentos')
    .select('*')
    .gte('data', startDate)
    .lte('data', endDate)
    .order('data', { ascending: true })
    .order('horario', { ascending: true })

  if (error) {
    console.error('Erro ao buscar treinamentos:', error)
    return []
  }
  return data as Treinamento[]
}

export async function createTreinamento(treinamento: Omit<Treinamento, 'id' | 'created_at' | 'status'>) {
  const { data, error } = await supabase
    .from('treinamentos')
    .insert([{ ...treinamento, status: 'agendado' }])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar treinamento:', error)
    throw error
  }
  return data as Treinamento
}

export async function updateTreinamentoStatus(id: string, status: 'agendado' | 'em_andamento' | 'finalizado') {
  const { data, error } = await supabase
    .from('treinamentos')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar status do treinamento:', error)
    throw error
  }
  return data as Treinamento
}

export async function deleteTreinamento(id: string) {
  const { error } = await supabase
    .from('treinamentos')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar treinamento:', error)
    throw error
  }
}

// -----------------------------
// Presenças (Ata Digital)
// -----------------------------

export async function getPresencas(treinamentoId: string) {
  const { data, error } = await supabase
    .from('presencas')
    .select('*')
    .eq('treinamento_id', treinamentoId)
    .order('horario_checkin', { ascending: false })

  if (error) {
    console.error('Erro ao buscar presenças:', error)
    return []
  }
  return data as Presenca[]
}

export async function registrarPresenca(treinamentoId: string, nome: string, setor: string) {
  const { data, error } = await supabase
    .from('presencas')
    .insert([{ treinamento_id: treinamentoId, nome, setor }])
    .select()
    .single()

  if (error) {
    console.error('Erro ao registrar presença:', error)
    throw error
  }
  return data as Presenca
}
