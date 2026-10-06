-- Habilitar RLS nas tabelas
ALTER TABLE public.portal_passwords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimentos_historico ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas permissivas
DROP POLICY IF EXISTS "Permitir leitura anon portal_passwords" ON public.portal_passwords;
DROP POLICY IF EXISTS "Permitir inserção anon portal_passwords" ON public.portal_passwords;
DROP POLICY IF EXISTS "Permitir atualização anon portal_passwords" ON public.portal_passwords;
DROP POLICY IF EXISTS "Permitir exclusão anon portal_passwords" ON public.portal_passwords;

DROP POLICY IF EXISTS "Permitir leitura anon procedimentos_historico" ON public.procedimentos_historico;
DROP POLICY IF EXISTS "Permitir inserção anon procedimentos_historico" ON public.procedimentos_historico;
DROP POLICY IF EXISTS "Permitir atualização anon procedimentos_historico" ON public.procedimentos_historico;
DROP POLICY IF EXISTS "Permitir exclusão anon procedimentos_historico" ON public.procedimentos_historico;

-- Novas políticas: Apenas usuários autenticados (Logados no Portal)
-- Permite leitura e escrita gerais apenas para quem passou pelo login via Supabase Auth.
-- Idealmente, isso deve ser refinado para cruzar com roles/níveis de acesso no futuro.

-- Políticas para portal_passwords
CREATE POLICY "Leitura autenticada portal_passwords" ON public.portal_passwords FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inserção autenticada portal_passwords" ON public.portal_passwords FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Atualização autenticada portal_passwords" ON public.portal_passwords FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Exclusão autenticada portal_passwords" ON public.portal_passwords FOR DELETE TO authenticated USING (true);

-- Políticas para procedimentos_historico
CREATE POLICY "Leitura autenticada procedimentos_historico" ON public.procedimentos_historico FOR SELECT TO authenticated USING (true);
CREATE POLICY "Inserção autenticada procedimentos_historico" ON public.procedimentos_historico FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Atualização autenticada procedimentos_historico" ON public.procedimentos_historico FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Exclusão autenticada procedimentos_historico" ON public.procedimentos_historico FOR DELETE TO authenticated USING (true);
