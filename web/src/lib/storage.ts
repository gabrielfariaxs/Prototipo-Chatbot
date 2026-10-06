import { supabase } from './supabase'

/**
 * Ponto ÚNICO de acesso a arquivos do sistema.
 * Todo upload/link passa por aqui — se um dia migrar para Nextcloud/S3,
 * apenas este arquivo muda.
 *
 * Segurança:
 *  - Bucket privado (sem URL pública).
 *  - RLS: cada usuário só lê/grava dentro de `{user_id}/`.
 *  - Links assinados com expiração.
 *  - Toda ação é registrada em `document_access_log`.
 */

const BUCKET = 'documentos'
const HORAS_PADRAO = 48
const HORAS_MAXIMO = 24 * 7 // nunca gerar link com mais de 7 dias

export type AcaoDocumento = 'upload' | 'link_gerado' | 'download'

async function getUsuarioAtual() {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    throw new Error('Não autorizado: faça login para acessar documentos.')
  }
  return data.user
}

/** Remove acentos, espaços e caracteres perigosos (evita path traversal como "../"). */
function sanitizarNome(nome: string): string {
  const limpo = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.{2,}/g, '.')
    .replace(/^[._]+/, '')
    .slice(0, 120)
  return limpo || 'arquivo'
}

async function registrarAcesso(caminho: string, acao: AcaoDocumento, detalhes?: Record<string, unknown>) {
  try {
    await supabase.from('document_access_log').insert({
      caminho,
      acao,
      detalhes: detalhes ?? null,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 255) : null,
    })
  } catch (err) {
    // Falha no log nunca deve quebrar o fluxo do usuário
    console.warn('[storage] Falha ao registrar auditoria:', err)
  }
}

/**
 * Salva um arquivo na pasta privada do usuário logado.
 * @returns caminho interno do arquivo (guarde-o para gerar links depois)
 */
export async function salvarDocumento(nomeArquivo: string, arquivo: Blob, pasta?: string): Promise<string> {
  const user = await getUsuarioAtual()
  const subpasta = pasta ? `${sanitizarNome(pasta)}/` : ''
  const caminho = `${user.id}/${subpasta}${Date.now()}-${sanitizarNome(nomeArquivo)}`

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, arquivo, {
    contentType: arquivo.type || undefined,
    upsert: false, // nunca sobrescreve arquivo existente
  })
  if (error) throw new Error(`Falha ao salvar documento: ${error.message}`)

  await registrarAcesso(caminho, 'upload', { tamanho: arquivo.size, tipo: arquivo.type })
  return caminho
}

/**
 * Gera um link temporário para compartilhar (ex.: enviar pelo WhatsApp).
 * O link expira sozinho após `horas` (padrão 48h, máximo 7 dias).
 */
export async function gerarLinkTemporario(caminho: string, horas = HORAS_PADRAO): Promise<string> {
  await getUsuarioAtual()
  const horasSeguras = Math.min(Math.max(horas, 1), HORAS_MAXIMO)

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(caminho, horasSeguras * 3600)
  if (error || !data?.signedUrl) throw new Error(`Falha ao gerar link: ${error?.message ?? 'desconhecido'}`)

  await registrarAcesso(caminho, 'link_gerado', { expira_em_horas: horasSeguras })
  return data.signedUrl
}

/** Baixa um documento da pasta do usuário (registra o download). */
export async function baixarDocumento(caminho: string): Promise<Blob> {
  await getUsuarioAtual()
  const { data, error } = await supabase.storage.from(BUCKET).download(caminho)
  if (error || !data) throw new Error(`Falha ao baixar documento: ${error?.message ?? 'desconhecido'}`)

  await registrarAcesso(caminho, 'download')
  return data
}

/** Lista os documentos do usuário logado (opcionalmente dentro de uma subpasta). */
export async function listarDocumentos(pasta?: string) {
  const user = await getUsuarioAtual()
  const prefixo = pasta ? `${user.id}/${sanitizarNome(pasta)}` : user.id
  const { data, error } = await supabase.storage.from(BUCKET).list(prefixo, {
    limit: 100,
    sortBy: { column: 'created_at', order: 'desc' },
  })
  if (error) throw new Error(`Falha ao listar documentos: ${error.message}`)
  return (data ?? []).map((f) => ({ ...f, caminho: `${prefixo}/${f.name}` }))
}
