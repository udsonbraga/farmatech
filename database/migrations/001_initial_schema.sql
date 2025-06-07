
-- Migração inicial do FarmaTech
-- Versão: 001
-- Data: 2025-01-07

BEGIN;

-- Verificar se as tabelas já existem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        -- Se não existe, executar toda a criação
        \i '../schema.sql'
    ELSE
        RAISE NOTICE 'Tabelas já existem, pulando criação inicial';
    END IF;
END $$;

COMMIT;
