
-- Consultas úteis para o sistema FarmaTech

-- 1. Buscar medicamentos com estoque baixo
SELECT 
    m.nome,
    m.quantidade,
    m.quantidade_minima,
    m.categoria,
    u.farmacia_name
FROM medicamentos m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.quantidade <= m.quantidade_minima
ORDER BY m.nome;

-- 2. Medicamentos próximos ao vencimento (próximos 30 dias)
SELECT 
    m.nome,
    m.data_vencimento,
    m.quantidade,
    u.farmacia_name,
    (m.data_vencimento - CURRENT_DATE) as dias_para_vencer
FROM medicamentos m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.data_vencimento <= CURRENT_DATE + INTERVAL '30 days'
AND m.data_vencimento > CURRENT_DATE
ORDER BY m.data_vencimento;

-- 3. Relatório de vendas do dia
SELECT 
    v.id as venda_id,
    v.total,
    v.forma_pagamento,
    v.data,
    COUNT(vi.id) as total_itens
FROM vendas v
LEFT JOIN venda_itens vi ON v.id = vi.venda_id
WHERE DATE(v.data) = CURRENT_DATE
GROUP BY v.id, v.total, v.forma_pagamento, v.data
ORDER BY v.data DESC;

-- 4. Medicamentos mais vendidos (últimos 30 dias)
SELECT 
    m.nome,
    SUM(vi.quantidade) as total_vendido,
    SUM(vi.subtotal) as receita_total
FROM venda_itens vi
JOIN medicamentos m ON vi.medicamento_id = m.id
JOIN vendas v ON vi.venda_id = v.id
WHERE v.data >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY m.id, m.nome
ORDER BY total_vendido DESC
LIMIT 10;

-- 5. Histórico de movimentações de um medicamento específico
SELECT 
    m.nome,
    mov.tipo,
    mov.quantidade,
    mov.observacoes,
    mov.data
FROM movimentacoes mov
JOIN medicamentos m ON mov.medicamento_id = m.id
WHERE m.id = 'UUID_DO_MEDICAMENTO'
ORDER BY mov.data DESC;

-- 6. Resumo financeiro mensal
SELECT 
    DATE_TRUNC('month', data) as mes,
    COUNT(*) as total_vendas,
    SUM(total) as receita_total,
    AVG(total) as ticket_medio
FROM vendas
WHERE data >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', data)
ORDER BY mes DESC;

-- 7. Alertas ativos por usuário
SELECT 
    u.farmacia_name,
    a.tipo,
    COUNT(*) as total_alertas
FROM alertas a
JOIN usuarios u ON a.usuario_id = u.id
WHERE a.resolvido = FALSE
GROUP BY u.id, u.farmacia_name, a.tipo
ORDER BY total_alertas DESC;
