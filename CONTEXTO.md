# Leadboss Hub — Contexto do Projeto

> Documento de referência para retomar o trabalho em novos chats ou onboarding rápido.
> **Última atualização:** 19/05/2026

---

## 🎯 O que é

CRM interno da Maquinapro para gerenciar clientes de outsourcing de marketing
(impressão + tráfego pago). Site institucional + sistema de gestão no mesmo projeto.

---

## 🧱 Stack

- **Framework:** Next.js 16.2.6 (App Router)
- **Runtime:** React 19.2.4
- **Linguagem:** TypeScript 5
- **Estilo:** Tailwind CSS 4
- **Backend/DB:** Supabase (Postgres + Auth + SSR)
- **PDF:** jspdf + jspdf-autotable
- **Hosting:** Vercel (deploy automático via push na main)
- **Repositório:** https://github.com/Maquinapro/leadboss-hub (público)
- **Local:** /Users/gustavoteixeira/Projetos/leadboss-crm

---

## 🌐 URLs

- **Site público:** https://leadboss.com.br
- **Login do sistema:** https://leadboss.com.br/sistema/login
- **Deploy Vercel:** https://leadboss-hub.vercel.app
- **Supabase:** https://qlxqerlvnrfvucatxzju.supabase.co

---

## 🔐 Variáveis de ambiente

Necessárias em .env.local (não commitado):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Futuramente: RESEND_API_KEY

---

## 📂 Estrutura de pastas

app/
  page.tsx                       → Site público (landing)
  layout.tsx                     → GTM + Meta Pixel
  sistema/
    page.tsx                     → Dashboard
    login/page.tsx
    clientes/
      page.tsx                   → Listagem
      novo/page.tsx              → Cadastro
      [id]/page.tsx              → Detalhe (4 abas)
    campanhas/page.tsx
    pagamentos/page.tsx
    configuracoes/page.tsx

components/
  ClientePagamentos.tsx
  ClienteCampanhas.tsx
  ClienteHistorico.tsx
  ReciboPDF.ts
  Header.tsx

---

## 🗄️ Schema do banco (Supabase)

Relacionamentos:
- planos → clientes
- clientes → pagamentos, campanhas, atividades, contratos
- contratos → planos
- configuracoes (tabela singleton com dados da Maquinapro)

### clientes
id, nome, segmento, email, telefone, responsavel_contato,
plano_id, valor_mensal, verba_midia, plataformas (array),
data_entrada, status, data_saida, motivo_saida,
meta_cpl_padrao, dia_vencimento, observacoes

### contratos
id, cliente_id, plano_id, data_inicio, data_fim,
valor_mensal, dia_vencimento, ativo, observacoes

### pagamentos
id, cliente_id, mes_referencia, valor,
data_vencimento, data_pagamento, status,
metodo_pagamento, nota_fiscal, observacoes

### campanhas
id, cliente_id, plataforma, mes_referencia,
investimento, leads, leads_qualificados,
agendamentos, comparecimentos, fechamentos,
ticket_medio, faturamento_atribuido,
cpl, meta_cpl, observacoes

### atividades
id, cliente_id, tipo, titulo, descricao,
data_evento, concluida

### planos
id, nome, descricao, valor_padrao,
frequencia_relatorio, permite_valor_customizado, observacoes

### configuracoes (singleton)
Dados fiscais e bancários da Maquinapro:
razao_social, cnpj, endereco completo, contato,
chave_pix, banco, agencia, conta, observacoes_recibo

### ⚠️ Dívida técnica
- dia_vencimento existe em clientes E contratos — definir fonte da verdade
- valor_mensal duplicado em clientes E contratos
- Decidir se histórico de planos vive em contratos ou se clientes é só estado atual

---

## 🚀 Comandos do dia-a-dia

- npm run dev          → roda localhost:3000
- npm run build        → testa build antes do deploy
- npm run lint         → roda ESLint
- git push             → deploy automático na Vercel

---

## 🏗️ Decisões de arquitetura

- **Supabase:** sugerido pelo Claude no setup. Postgres + Auth + tier grátis sem precisar montar backend.
- **Componentes separados por aba:** sugestão do Claude para não deixar [id]/page.tsx gigante.
- **App Router (Next 16):** padrão atual do Next, server components por default.
- **Tailwind 4:** sem tailwind.config.js, configuração via @tailwindcss/postcss.

---

## ✅ Status atual

- Site institucional: completo
- Sistema /sistema: funcionando
- Deploy em produção: ativo
- GTM + Meta Pixel: instalados
- Bug do Faturamento Total: corrigido (usar id da URL no useEffect, não cliente?.id)

---

## 📌 Próximas pendências

### Técnicas
- Definir fonte de verdade de dia_vencimento e valor_mensal (clientes vs contratos)
- Revisar se status em pagamentos está padronizado (lowercase 'pago')

### Features
- Configurar GA4 dentro do GTM
- Criar página /obrigado para tracking de conversões
- Integrar Resend para envio de cobrança por email
- Automação de geração de pagamentos mensais

---

## 🧪 Dados de teste

Cliente: Marry Helen Domingues de Matos Vitale
- Segmento: Odontologia
- Plano: Parceria
- Valor: R$500/mês, dia vencimento: 5
- Plataformas: Google + Meta
- Verba mídia: R$1.500
- Data entrada: 16/05/2026

---

## 📡 Tracking instalado

- GTM: GTM-N2R38654
- Meta Pixel: 853098353836873
- GA4: pendente (configurar via GTM)


---

## 🔄 Atualizações recentes (maio/2026)

### Banco — mudanças
- `contratos`: adicionados campos `descricao`, `responsavel_pagamento`, `forma_pagamento`
- Removido índice único `idx_contrato_ativo_por_cliente` (cliente pode ter múltiplos contratos)
- `pagamentos`: removido UNIQUE(cliente_id, mes_referencia), adicionado UNIQUE(contrato_id, mes_referencia)
- View `clientes_completo` atualizada: `valor_mensal` = SUM de todos contratos ativos
- Novas tabelas: `cartoes`, `despesas`

### Funcionalidades adicionadas
- Múltiplos contratos por cliente (com descrição, responsável, forma de pagamento)
- Edição inline de contrato na tela do cliente
- Geração de faturas por contrato (não mais por cliente)
- Descrição do serviço aparece em cada fatura
- Módulo de despesas: categorias, origens, parcelamento automático
- Cadastro de cartões de crédito com cor personalizada
- Modo privado nos stats do dashboard (olhinho)
- Calendário To Do no dashboard (grade desktop, agenda mobile)
- Header: Client *Hub*
