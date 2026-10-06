-- =====================================================================
-- STORAGE SEGURO DE DOCUMENTOS + AUDITORIA
-- Rode este script inteiro no SQL Editor do Supabase.
-- Pode ser executado mais de uma vez sem erro (idempotente).
-- =====================================================================

-- 1) Bucket PRIVADO (sem URL publica), limite de 10 MB e tipos permitidos
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documentos',
  'documentos',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg'
  ]
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- 2) Regras de acesso: cada usuario so enxerga a propria pasta ({user_id}/arquivo)
drop policy if exists "documentos_select_proprios" on storage.objects;
create policy "documentos_select_proprios"
on storage.objects for select to authenticated
using (
  bucket_id = 'documentos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "documentos_insert_proprios" on storage.objects;
create policy "documentos_insert_proprios"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'documentos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Sem policies de UPDATE/DELETE: arquivos enviados nao podem ser
-- alterados nem apagados pelo app (preserva a integridade do historico).

-- 3) Tabela de auditoria
create table if not exists document_access_log (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id),
  caminho text not null,
  acao text not null check (acao in ('upload', 'link_gerado', 'download')),
  detalhes jsonb,
  user_agent text,
  criado_em timestamptz not null default now()
);

create index if not exists document_access_log_user_idx
  on document_access_log (user_id, criado_em desc);

alter table document_access_log enable row level security;

-- Usuario so registra acoes em seu proprio nome
drop policy if exists "log_insert_proprio" on document_access_log;
create policy "log_insert_proprio"
on document_access_log for insert to authenticated
with check (user_id = auth.uid());

-- Usuario so le o proprio historico
drop policy if exists "log_select_proprio" on document_access_log;
create policy "log_select_proprio"
on document_access_log for select to authenticated
using (user_id = auth.uid());

-- Sem UPDATE/DELETE: o log e somente-anexo (ninguem apaga rastros pelo app).
