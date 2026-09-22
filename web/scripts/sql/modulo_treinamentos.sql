-- Tabela de Treinamentos Agendados
CREATE TABLE public.treinamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  data date NOT NULL,
  horario text NOT NULL,
  colaboradores text,
  link_video text,
  status text DEFAULT 'agendado', -- agendado, em_andamento, finalizado
  criado_por text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tabela de Check-in (Ata Digital)
CREATE TABLE public.presencas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treinamento_id uuid REFERENCES public.treinamentos(id) ON DELETE CASCADE,
  nome text NOT NULL,
  setor text NOT NULL,
  horario_checkin timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS (opcional, mas recomendado)
ALTER TABLE public.treinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

-- Políticas super permissivas para testes e uso interno rápido (pode restringir depois)
CREATE POLICY "Permitir leitura total treinamentos" ON public.treinamentos FOR SELECT USING (true);
CREATE POLICY "Permitir inserção treinamentos" ON public.treinamentos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir update treinamentos" ON public.treinamentos FOR UPDATE USING (true);
CREATE POLICY "Permitir deleção treinamentos" ON public.treinamentos FOR DELETE USING (true);

CREATE POLICY "Permitir leitura total presencas" ON public.presencas FOR SELECT USING (true);
CREATE POLICY "Permitir inserção presencas" ON public.presencas FOR INSERT WITH CHECK (true);
