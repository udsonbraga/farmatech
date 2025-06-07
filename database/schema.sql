
-- Criação do banco de dados FarmaTech
-- Execute estes comandos em seu PostgreSQL

-- Tabela de usuários/farmácias
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    farmacia_name VARCHAR(255) NOT NULL,
    responsavel_name VARCHAR(255) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de medicamentos
CREATE TABLE medicamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    quantidade INTEGER NOT NULL DEFAULT 0,
    quantidade_minima INTEGER NOT NULL DEFAULT 0,
    categoria VARCHAR(100) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de movimentações de estoque
CREATE TABLE movimentacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    medicamento_id UUID NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    quantidade INTEGER NOT NULL,
    observacoes TEXT,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE vendas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL,
    forma_pagamento VARCHAR(50) NOT NULL,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de itens de venda (relacionamento N:N entre vendas e medicamentos)
CREATE TABLE venda_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venda_id UUID NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
    medicamento_id UUID NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL
);

-- Tabela de alertas
CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    medicamento_id UUID NOT NULL REFERENCES medicamentos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('estoque_baixo', 'vencimento_proximo')),
    mensagem TEXT NOT NULL,
    resolvido BOOLEAN DEFAULT FALSE,
    data TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX idx_medicamentos_usuario_id ON medicamentos(usuario_id);
CREATE INDEX idx_medicamentos_categoria ON medicamentos(categoria);
CREATE INDEX idx_medicamentos_vencimento ON medicamentos(data_vencimento);
CREATE INDEX idx_movimentacoes_usuario_id ON movimentacoes(usuario_id);
CREATE INDEX idx_movimentacoes_medicamento_id ON movimentacoes(medicamento_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes(data);
CREATE INDEX idx_vendas_usuario_id ON vendas(usuario_id);
CREATE INDEX idx_vendas_data ON vendas(data);
CREATE INDEX idx_venda_itens_venda_id ON venda_itens(venda_id);
CREATE INDEX idx_alertas_usuario_id ON alertas(usuario_id);
CREATE INDEX idx_alertas_resolvido ON alertas(resolvido);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medicamentos_updated_at BEFORE UPDATE ON medicamentos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para gerar alertas automáticos
CREATE OR REPLACE FUNCTION verificar_alertas()
RETURNS VOID AS $$
BEGIN
    -- Limpar alertas antigos resolvidos (opcional)
    DELETE FROM alertas WHERE resolvido = TRUE AND data < CURRENT_DATE - INTERVAL '30 days';
    
    -- Inserir alertas de estoque baixo
    INSERT INTO alertas (usuario_id, medicamento_id, tipo, mensagem)
    SELECT 
        m.usuario_id,
        m.id,
        'estoque_baixo',
        'Estoque baixo: ' || m.nome || ' (Quantidade: ' || m.quantidade || ', Mínimo: ' || m.quantidade_minima || ')'
    FROM medicamentos m
    WHERE m.quantidade <= m.quantidade_minima
    AND NOT EXISTS (
        SELECT 1 FROM alertas a 
        WHERE a.medicamento_id = m.id 
        AND a.tipo = 'estoque_baixo' 
        AND a.resolvido = FALSE
    );
    
    -- Inserir alertas de vencimento próximo (30 dias)
    INSERT INTO alertas (usuario_id, medicamento_id, tipo, mensagem)
    SELECT 
        m.usuario_id,
        m.id,
        'vencimento_proximo',
        'Vencimento próximo: ' || m.nome || ' (Vence em: ' || m.data_vencimento || ')'
    FROM medicamentos m
    WHERE m.data_vencimento <= CURRENT_DATE + INTERVAL '30 days'
    AND m.data_vencimento > CURRENT_DATE
    AND NOT EXISTS (
        SELECT 1 FROM alertas a 
        WHERE a.medicamento_id = m.id 
        AND a.tipo = 'vencimento_proximo' 
        AND a.resolvido = FALSE
    );
END;
$$ LANGUAGE plpgsql;

-- Criar um job para executar a verificação de alertas (pode ser executado manualmente ou via cron)
-- Para executar: SELECT verificar_alertas();

-- Dados de exemplo (opcional - remover em produção)
-- INSERT INTO usuarios (email, senha_hash, farmacia_name, responsavel_name, telefone) 
-- VALUES ('admin@farmacia.com', '$2b$10$exemplo_hash_aqui', 'Farmácia Central', 'João Silva', '(11) 99999-9999');
