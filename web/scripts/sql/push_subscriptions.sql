-- Tabela para armazenar as inscrições de Web Push dos usuários
CREATE TABLE public.push_subscriptions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_sector text NOT NULL,
    user_name text NOT NULL,
    subscription jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Segurança)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
-- Permite que qualquer um (anon ou autenticado) insira novas inscrições
CREATE POLICY "Permitir inserção anônima em push_subscriptions"
    ON public.push_subscriptions
    FOR INSERT
    WITH CHECK (true);

-- Permite leitura geral das inscrições para quem tiver acesso ao banco (apenas leitura interna)
CREATE POLICY "Permitir leitura anônima em push_subscriptions"
    ON public.push_subscriptions
    FOR SELECT
    USING (true);

-- Permite deletar/atualizar inscrições antigas para não enviar push inútil
CREATE POLICY "Permitir exclusão anônima em push_subscriptions"
    ON public.push_subscriptions
    FOR DELETE
    USING (true);

-- Índices para busca rápida ao tentar encontrar inscrições de um setor
CREATE INDEX idx_push_subscriptions_sector ON public.push_subscriptions(user_sector);
