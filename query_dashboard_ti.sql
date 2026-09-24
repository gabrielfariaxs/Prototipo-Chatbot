-- Query para extração de dados da Ferramenta de Chamados T.I
-- Utilizada para alimentar o Dashboard de Métricas

SELECT
    id,
    code AS "Código do Chamado",
    title AS "Título",
    status AS "Status Atual",
    priority AS "Prioridade",
    creator_name AS "Solicitante",
    creator_sector AS "Setor Solicitante",
    approver_sector AS "Setor Aprovador",
    created_at AS "Data/Hora de Abertura",
    
    -- Extrai a data de resolução direto do último bloco do histórico (JSON)
    CASE 
        WHEN status IN ('concluido', 'recusado') THEN 
            CAST(comments->-1->>'createdAt' AS TIMESTAMP)
        ELSE NULL
    END AS "Data/Hora de Resolução",
    
    -- Calcula o Tempo de Abertura -> Resolução em Horas Corridas
    CASE 
        WHEN status IN ('concluido', 'recusado') THEN 
            ROUND(CAST(EXTRACT(EPOCH FROM (CAST(comments->-1->>'createdAt' AS TIMESTAMP) - created_at)) / 3600 AS NUMERIC), 2)
        ELSE NULL 
    END AS "Tempo de Resolução (Horas Corridas)"
    
FROM ti_chamados
ORDER BY created_at DESC;
