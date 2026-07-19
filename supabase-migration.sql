-- ============================================================
-- MIGRAÇÃO: Contas a Pagar — melhorias
-- Rodar no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1. Tabela de contas correntes (banco, agência, conta, PIX)
CREATE TABLE IF NOT EXISTS contas_correntes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          TEXT NOT NULL,
  banco         TEXT NOT NULL,
  agencia       TEXT,
  conta         TEXT,
  digito        TEXT,
  pix           TEXT,
  tipo          TEXT NOT NULL CHECK (tipo IN ('empresa', 'fisica')),
  ativo         BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Juros e valor_pago na tabela pagamentos
ALTER TABLE pagamentos
  ADD COLUMN IF NOT EXISTS valor_pago  NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS juros       NUMERIC(10,2);

-- 3. Novas colunas na tabela despesas
ALTER TABLE despesas
  ADD COLUMN IF NOT EXISTS data_pagamento    DATE,
  ADD COLUMN IF NOT EXISTS data_vencimento   DATE,
  ADD COLUMN IF NOT EXISTS recorrente        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS conta_corrente_id UUID REFERENCES contas_correntes(id);

-- ============================================================
-- PRONTO. Pode fechar o SQL Editor.
-- ============================================================

-- ============================================================
-- MIGRAÇÃO 2026-07-19: Contas a Pagar — status por mês em despesas recorrentes
-- Rodar no SQL Editor do Supabase Dashboard
-- ============================================================

-- Liga cada cobrança mensal gerada de uma despesa recorrente de volta
-- pra despesa "molde" que a originou. Molde = recorrente sem essa coluna
-- preenchida; cobrança do mês = tem essa coluna apontando pro molde.
-- ON DELETE CASCADE: excluir o molde apaga as cobranças mensais geradas dele.
ALTER TABLE despesas
  ADD COLUMN IF NOT EXISTS origem_recorrente_id UUID REFERENCES despesas(id) ON DELETE CASCADE;

-- ============================================================
-- PRONTO. Pode fechar o SQL Editor.
-- ============================================================
