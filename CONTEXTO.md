# Leadboss Hub — Contexto do Projeto

## Stack
- Next.js 16.2.6 + TypeScript + Supabase + Vercel
- Repositório: https://github.com/Maquinapro/leadboss-hub
- Local: /Users/gustavoteixeira/Projetos/leadboss-crm

## URLs
- Site público: leadboss.com.br
- Sistema: leadboss.com.br/sistema/login
- Vercel: leadboss-hub.vercel.app

## Supabase
- URL: https://qlxqerlvnrfvucatxzju.supabase.co
- Anon Key: sb_publishable_-s4nSh3PriUjiirufiJAoA_S-iVJIXp

## Estrutura de pastas
app/
  page.tsx                    → Site público
  layout.tsx                  → GTM (GTM-N2R38654) + Meta Pixel (853098353836873)
  sistema/
    page.tsx                  → Dashboard
    login/page.tsx
    clientes/
      page.tsx                → Listagem
      novo/page.tsx           → Cadastro
      [id]/page.tsx           → Detalhe (4 abas: Dados, Pagamentos, Campanhas, Histórico)
    campanhas/page.tsx
    pagamentos/page.tsx       → Módulo de Recebimentos
    configuracoes/page.tsx
components/
  ClientePagamentos.tsx
  ClienteCampanhas.tsx
  ClienteHistorico.tsx
  ReciboPDF.ts                → Gera recibo PDF com logo Leadboss Ads
  FaturaPDF.ts                → Gera fatura de cobrança numerada (começa em 550)
  Header.tsx

## Banco de dados (Supabase)
Tabelas: planos, clientes, pagamentos, campanhas, atividades, configuracoes, contratos
- configuracoes tem campo ultimo_numero_fatura (integer, default 549)

## Status atual
- Site institucional: ✅ completo (plano Essencial R$949)
- Sistema /sistema: ✅ funcionando
- Deploy em produção: ✅
- GTM + Meta Pixel: ✅ (GTM configurado externamente)
- Recibo PDF: ✅ logo Leadboss Ads, nome fantasia, chave PIX
- Fatura de cobrança: ✅ numerada sequencialmente a partir de 550
- Módulo Recebimentos: ✅ (antes chamado Pagamentos)

## Pendências
- Página /obrigado para conversões
- Email de cobrança (Resend)

## Dados de teste
Cliente: Marry Helen Domingues de Matos Vitale
- Odontologia, Plano Parceria, R$500/mês, dia vencimento: 5
- Google + Meta, verba R$1.500
- Data entrada: 16/05/2026
