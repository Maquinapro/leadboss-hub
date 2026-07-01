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

-- 2. Novas colunas na tabela despesas
ALTER TABLE despesas
  ADD COLUMN IF NOT EXISTS data_pagamento    DATE,
  ADD COLUMN IF NOT EXISTS recorrente        BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS conta_corrente_id UUID REFERENCES contas_correntes(id);

-- ============================================================
-- PRONTO. Pode fechar o SQL Editor.
-- ============================================================
