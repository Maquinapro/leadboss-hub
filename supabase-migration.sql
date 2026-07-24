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
-- MIGRAÇÃO 2026-07-19 (2): limpeza de duplicados + trava contra duplicação
-- Rodar no SQL Editor do Supabase Dashboard
-- ============================================================

-- 1) Remove cobranças geradas duplicadas em despesas (mesma origem, mesmo mês),
--    mantendo a versão paga quando houver
DELETE FROM despesas d
WHERE d.origem_recorrente_id IS NOT NULL
  AND d.ctid NOT IN (
    SELECT DISTINCT ON (origem_recorrente_id, mes_inicio) ctid
    FROM despesas
    WHERE origem_recorrente_id IS NOT NULL
    ORDER BY origem_recorrente_id, mes_inicio, (status = 'pago') DESC, id
  );

-- 2) Apaga cobranças geradas retroativamente em meses já passados e nunca pagas
--    (pendências fantasma criadas ao navegar pra trás)
DELETE FROM despesas
WHERE origem_recorrente_id IS NOT NULL
  AND status = 'pendente'
  AND mes_inicio::date < date_trunc('month', CURRENT_DATE)::date;

-- 3) Remove faturas de contrato duplicadas em pagamentos (mesmo contrato, mesmo mês),
--    mantendo a versão paga quando houver
DELETE FROM pagamentos p
WHERE p.contrato_id IS NOT NULL
  AND p.ctid NOT IN (
    SELECT DISTINCT ON (contrato_id, mes_referencia) ctid
    FROM pagamentos
    WHERE contrato_id IS NOT NULL
    ORDER BY contrato_id, mes_referencia, (status = 'pago') DESC, id
  );

-- 4) Apaga faturas de contrato criadas HOJE pela geração automática em meses passados
--    (se der erro "column created_at does not exist", pule só este bloco e me avise)
DELETE FROM pagamentos
WHERE contrato_id IS NOT NULL
  AND status IN ('pendente', 'atrasado')
  AND mes_referencia::date < date_trunc('month', CURRENT_DATE)::date
  AND created_at >= CURRENT_DATE;

-- 5) Índices únicos: o banco passa a rejeitar sozinho qualquer duplicação futura
--    das gerações automáticas (despesa por origem+mês, fatura por contrato+mês)
CREATE UNIQUE INDEX IF NOT EXISTS despesas_origem_mes_uniq
  ON despesas (origem_recorrente_id, mes_inicio);
CREATE UNIQUE INDEX IF NOT EXISTS pagamentos_contrato_mes_uniq
  ON pagamentos (contrato_id, mes_referencia);

-- 6) Diagnóstico final: lista o que ainda estiver em dobro (rode e olhe o resultado;
--    receitas avulsas legítimas do mesmo cliente também aparecem aqui, é normal)
SELECT 'recebimento' AS tipo, c.nome AS descricao, p.mes_referencia::text AS mes, count(*) AS qtd
FROM pagamentos p JOIN clientes c ON c.id = p.cliente_id
WHERE p.status <> 'cancelado'
GROUP BY 1, 2, 3 HAVING count(*) > 1
UNION ALL
SELECT 'despesa', d.descricao, d.mes_inicio::text, count(*)
FROM despesas d
GROUP BY 1, 2, 3 HAVING count(*) > 1
ORDER BY tipo, mes, descricao;

-- ============================================================
-- PRONTO. Pode fechar o SQL Editor.
-- ============================================================
