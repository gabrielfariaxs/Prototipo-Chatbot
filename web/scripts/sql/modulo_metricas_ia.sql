-- ==============================================================================
-- 📊 Módulo de Métricas e Telemetria MedIA (Supabase SQL)
-- ==============================================================================

-- 1. Tabela de Uso e Telemetria da Inteligência Artificial
CREATE TABLE IF NOT EXISTS public.media_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text,
  user_sector text,
  tipo_operacao text NOT NULL DEFAULT 'chat', -- 'leitura_guia', 'chat', 'solicitacao_medica', 'analise_opme'
  convenio text,                              -- 'Bradesco Saúde', 'SulAmérica', 'Unimed', 'Amil', 'Porto Seguro', 'Outro'
  tempo_economizado_minutos integer NOT NULL DEFAULT 3,
  sucesso boolean NOT NULL DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Feedbacks e Acurácia (Thumbs Up / Thumbs Down)
CREATE TABLE IF NOT EXISTS public.media_ai_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name text,
  user_sector text,
  tipo text NOT NULL CHECK (tipo IN ('up', 'down')),
  comentario text,
  mensagem_preview text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Índices de Performance para Agregação Rápida
CREATE INDEX IF NOT EXISTS idx_media_ai_usage_created_at ON public.media_ai_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_ai_usage_convenio ON public.media_ai_usage(convenio);
CREATE INDEX IF NOT EXISTS idx_media_ai_usage_sector ON public.media_ai_usage(user_sector);
CREATE INDEX IF NOT EXISTS idx_media_ai_feedbacks_created_at ON public.media_ai_feedbacks(created_at DESC);

-- 4. Habilitação de Row Level Security (RLS)
ALTER TABLE public.media_ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_ai_feedbacks ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Segurança (Permissões de Leitura e Inserção para Usuários)
DROP POLICY IF EXISTS "Permitir leitura publica de metricas de uso" ON public.media_ai_usage;
CREATE POLICY "Permitir leitura publica de metricas de uso" 
  ON public.media_ai_usage FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insercao de telemetria" ON public.media_ai_usage;
CREATE POLICY "Permitir insercao de telemetria" 
  ON public.media_ai_usage FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura publica de feedbacks" ON public.media_ai_feedbacks;
CREATE POLICY "Permitir leitura publica de feedbacks" 
  ON public.media_ai_feedbacks FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir envio de feedbacks" ON public.media_ai_feedbacks;
CREATE POLICY "Permitir envio de feedbacks" 
  ON public.media_ai_feedbacks FOR INSERT WITH CHECK (true);

-- 6. Carga Inicial de Dados Históricos (Opcional - para o painel já iniciar preenchido)
INSERT INTO public.media_ai_usage (user_name, user_sector, tipo_operacao, convenio, tempo_economizado_minutos, created_at)
VALUES 
  ('Sistema', 'Faturamento', 'leitura_guia', 'Bradesco Saúde', 3, now() - interval '2 days'),
  ('Sistema', 'Faturamento', 'leitura_guia', 'SulAmérica', 3, now() - interval '3 days'),
  ('Sistema', 'Comercial Interno', 'leitura_guia', 'Unimed', 3, now() - interval '1 day'),
  ('Sistema', 'Faturamento', 'leitura_guia', 'Amil', 3, now() - interval '4 days'),
  ('Sistema', 'Orçamento', 'leitura_guia', 'Porto Seguro', 3, now() - interval '5 days');
