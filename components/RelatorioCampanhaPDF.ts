import jsPDF from 'jspdf'

export type CampanhaRelatorio = {
  id: string
  plataforma: string
  investimento: number
  leads: number
  leads_qualificados: number
  agendamentos: number
  comparecimentos: number
  fechamentos: number
  ticket_medio: number | null
  faturamento_atribuido: number | null
  cpl: number | null
  meta_cpl: number | null
  observacoes: string | null
}

export type DadosRelatorio = {
  clienteNome: string
  mesReferencia: string // 'YYYY-MM-DD'
  campanhas: CampanhaRelatorio[]
  logoBase64?: string
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const PLATAFORMA_CORES: Record<string, [number, number, number]> = {
  Meta:     [24, 119, 242],
  Google:   [66, 133, 244],
  LinkedIn: [10, 102, 194],
  TikTok:   [0, 0, 0],
  YouTube:  [255, 0, 0],
}

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

function fmtNum(v: number, dec = 0): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function mesLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${MESES[d.getMonth()]} de ${d.getFullYear()}`
}

function linha(doc: jsPDF, x1: number, y: number, x2: number, r: number, g: number, b: number, w = 0.3) {
  doc.setDrawColor(r, g, b)
  doc.setLineWidth(w)
  doc.line(x1, y, x2, y)
}

function badge(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, g: number, b: number, alpha = 0.12) {
  doc.setFillColor(r, g, b)
  doc.setGState(doc.GState({ opacity: alpha }))
  doc.roundedRect(x, y, w, h, 1.5, 1.5, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))
}

export async function gerarRelatorioCampanha(dados: DadosRelatorio): Promise<void> {
  const { clienteNome, mesReferencia, campanhas, logoBase64 } = dados

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 20   // margem lateral
  const IW = W - M * 2  // largura interna

  // Paleta
  const INK:    [number, number, number] = [26, 26, 26]
  const SOFT:   [number, number, number] = [85, 80, 72]
  const MUTED:  [number, number, number] = [139, 132, 120]
  const LINE:   [number, number, number] = [217, 211, 197]
  const ACCENT: [number, number, number] = [180, 60, 40]
  const GREEN:  [number, number, number] = [74, 107, 58]
  const CREAM:  [number, number, number] = [245, 241, 234]
  const GOLD:   [number, number, number] = [184, 134, 44]

  // ───────────────────────────────────────────
  // CAPA / CABEÇALHO
  // ───────────────────────────────────────────
  // Faixa de topo
  doc.setFillColor(...INK)
  doc.rect(0, 0, W, 52, 'F')

  // Logo
  if (logoBase64) {
    try { doc.addImage(logoBase64, 'PNG', M, 14, 22, 22) } catch {}
  }

  // Nome da agência
  const logoX = logoBase64 ? M + 26 : M
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(245, 241, 234)
  doc.text('Leadboss', logoX, 26)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(139, 132, 120)
  doc.text('Agência de Tráfego Pago', logoX, 32)

  // Título do relatório (direita)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(217, 211, 197)
  doc.text('RELATÓRIO DE PERFORMANCE', W - M, 22, { align: 'right' })

  doc.setFontSize(14)
  doc.setTextColor(245, 241, 234)
  doc.text(mesLabel(mesReferencia).toUpperCase(), W - M, 30, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(139, 132, 120)
  doc.text(`Cliente: ${clienteNome}`, W - M, 38, { align: 'right' })

  // Data de emissão
  const hoje = new Date().toLocaleDateString('pt-BR')
  doc.setFontSize(7)
  doc.text(`Emitido em ${hoje}`, W - M, 44, { align: 'right' })

  let y = 64

  // ───────────────────────────────────────────
  // TOTAIS CONSOLIDADOS
  // ───────────────────────────────────────────
  const totalInv = campanhas.reduce((s, c) => s + Number(c.investimento || 0), 0)
  const totalFat = campanhas.reduce((s, c) => s + Number(c.faturamento_atribuido || 0), 0)
  const totalLeads = campanhas.reduce((s, c) => s + (c.leads || 0), 0)
  const totalFechos = campanhas.reduce((s, c) => s + (c.fechamentos || 0), 0)
  const totalAgend = campanhas.reduce((s, c) => s + (c.agendamentos || 0), 0)
  const roas = totalInv > 0 ? totalFat / totalInv : 0
  const cplMedio = totalLeads > 0 ? totalInv / totalLeads : 0
  const taxaConv = totalLeads > 0 ? (totalFechos / totalLeads) * 100 : 0

  // Título da seção
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('VISÃO GERAL DO MÊS', M, y)
  y += 6

  // Cards de métricas — linha 1 (ROAS em destaque)
  const roasLabel = roas >= 2 ? '✓ Positivo' : roas > 0 ? '△ Atenção' : '—'
  const roasCor: [number, number, number] = roas >= 2 ? GREEN : roas > 0 ? GOLD : MUTED

  // Card ROAS grande
  doc.setFillColor(...CREAM)
  doc.roundedRect(M, y, 60, 28, 2, 2, 'F')
  doc.setFillColor(...roasCor)
  doc.rect(M, y, 3, 28, 'F')

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('ROAS', M + 7, y + 7)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...roasCor)
  doc.text(fmtNum(roas, 2) + 'x', M + 7, y + 20)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...roasCor)
  doc.text(roasLabel, M + 7, y + 26)

  // Cards menores
  const cards = [
    { label: 'Investimento', valor: fmt(totalInv), sub: '' },
    { label: 'Faturamento', valor: fmt(totalFat), sub: 'atribuído' },
    { label: 'Leads Gerados', valor: fmtNum(totalLeads), sub: `CPL médio ${fmt(cplMedio)}` },
    { label: 'Fechamentos', valor: fmtNum(totalFechos), sub: `Conv. ${fmtNum(taxaConv, 1)}%` },
    { label: 'Agendamentos', valor: fmtNum(totalAgend), sub: '' },
  ]

  const cardW = (IW - 64) / cards.length - 2
  cards.forEach((c, i) => {
    const cx = M + 64 + i * (cardW + 2)
    doc.setFillColor(...CREAM)
    doc.roundedRect(cx, y, cardW, 28, 2, 2, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...MUTED)
    doc.text(c.label.toUpperCase(), cx + 5, y + 7)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...INK)
    doc.text(c.valor, cx + 5, y + 18)

    if (c.sub) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(...MUTED)
      doc.text(c.sub, cx + 5, y + 24)
    }
  })

  y += 36

  // ───────────────────────────────────────────
  // BARRA VISUAL DO ROAS
  // ───────────────────────────────────────────
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('Para cada R$ 1,00 investido, o cliente recebeu de volta', M, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...roasCor)
  doc.text(` R$ ${fmtNum(roas, 2)}`, M + 76, y)
  y += 5

  // Trilho
  doc.setFillColor(...LINE)
  doc.roundedRect(M, y, IW, 5, 2, 2, 'F')
  // Preenchimento (cap 5x)
  const pct = Math.min(roas / 5, 1)
  if (pct > 0) {
    doc.setFillColor(...roasCor)
    doc.roundedRect(M, y, IW * pct, 5, 2, 2, 'F')
  }
  // Marcadores 1x, 2x, 3x, 4x
  ;[1, 2, 3, 4].forEach((v) => {
    const mx = M + (IW / 5) * v
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.3)
    doc.line(mx, y, mx, y + 5)
    doc.setFontSize(5.5)
    doc.setTextColor(...MUTED)
    doc.text(`${v}x`, mx - 2, y + 8)
  })
  doc.setFontSize(5.5)
  doc.setTextColor(...MUTED)
  doc.text('5x', M + IW - 2, y + 8)

  y += 16

  // ───────────────────────────────────────────
  // FUNIL DE VENDAS
  // ───────────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('FUNIL DE VENDAS', M, y)
  y += 5

  const totalComp = campanhas.reduce((s, c) => s + (c.comparecimentos || 0), 0)
  const etapas = [
    { label: 'Leads',          valor: totalLeads,   pct: 100 },
    { label: 'Qualificados',   valor: campanhas.reduce((s, c) => s + (c.leads_qualificados || 0), 0), pct: totalLeads > 0 ? (campanhas.reduce((s, c) => s + (c.leads_qualificados || 0), 0) / totalLeads) * 100 : 0 },
    { label: 'Agendamentos',   valor: totalAgend,   pct: totalLeads > 0 ? (totalAgend / totalLeads) * 100 : 0 },
    { label: 'Comparecimentos',valor: totalComp,    pct: totalLeads > 0 ? (totalComp / totalLeads) * 100 : 0 },
    { label: 'Fechamentos',    valor: totalFechos,  pct: totalLeads > 0 ? (totalFechos / totalLeads) * 100 : 0 },
  ]

  const funnelH = 8
  const funnelGap = 3

  etapas.forEach((e, i) => {
    const barW = (IW * e.pct) / 100
    const barX = M + (IW - barW) / 2
    const cy = y + i * (funnelH + funnelGap)
    const alpha = 1 - i * 0.12

    doc.setGState(doc.GState({ opacity: alpha }))
    doc.setFillColor(...GREEN)
    doc.roundedRect(barX, cy, barW, funnelH, 1.5, 1.5, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(255, 255, 255)
    if (barW > 20) doc.text(String(e.valor), barX + barW / 2, cy + 5.5, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...SOFT)
    doc.text(e.label, M, cy + 5.5)
    doc.text(`${fmtNum(e.pct, 1)}%`, M + IW, cy + 5.5, { align: 'right' })
  })

  y += etapas.length * (funnelH + funnelGap) + 10

  // ───────────────────────────────────────────
  // DETALHE POR PLATAFORMA
  // ───────────────────────────────────────────
  if (y > H - 80) {
    doc.addPage()
    y = M
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('RESULTADO POR PLATAFORMA', M, y)
  y += 6

  campanhas.forEach((c) => {
    if (y > H - 60) { doc.addPage(); y = M }

    const cor = PLATAFORMA_CORES[c.plataforma] || ACCENT
    const cRoas = c.faturamento_atribuido && c.investimento ? Number(c.faturamento_atribuido) / Number(c.investimento) : null
    const cCpl = c.cpl || (c.leads > 0 ? c.investimento / c.leads : null)
    const cplOk = cCpl && c.meta_cpl ? cCpl <= Number(c.meta_cpl) : null

    // Container
    doc.setFillColor(...CREAM)
    doc.roundedRect(M, y, IW, 36, 2, 2, 'F')
    doc.setFillColor(...cor)
    doc.rect(M, y, 3, 36, 'F')

    // Plataforma
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...cor)
    doc.text(c.plataforma, M + 7, y + 8)

    // Grid de métricas
    const metricas = [
      { label: 'Investimento', valor: fmt(Number(c.investimento)) },
      { label: 'Leads', valor: fmtNum(c.leads) },
      { label: 'Leads Qualif.', valor: fmtNum(c.leads_qualificados) },
      { label: 'CPL', valor: cCpl ? fmt(cCpl) : '—', destaque: cplOk === false ? ACCENT : cplOk === true ? GREEN : undefined },
      { label: 'Agendamentos', valor: fmtNum(c.agendamentos) },
      { label: 'Fechamentos', valor: fmtNum(c.fechamentos) },
      { label: 'Faturamento', valor: c.faturamento_atribuido ? fmt(Number(c.faturamento_atribuido)) : '—' },
      { label: 'ROAS', valor: cRoas ? `${fmtNum(cRoas, 2)}x` : '—', destaque: cRoas && cRoas >= 2 ? GREEN : cRoas ? GOLD : undefined },
    ]

    const colW = (IW - 10) / 4
    metricas.forEach((m, i) => {
      const col = i % 4
      const row = Math.floor(i / 4)
      const mx = M + 7 + col * colW
      const my = y + 14 + row * 13

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(...MUTED)
      doc.text(m.label.toUpperCase(), mx, my)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...(m.destaque || INK))
      doc.text(m.valor, mx, my + 6)
    })

    // Meta CPL badge
    if (c.meta_cpl) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(...MUTED)
      doc.text(`Meta CPL: ${fmt(Number(c.meta_cpl))}`, M + IW - 4, y + 8, { align: 'right' })
    }

    // Observações
    if (c.observacoes) {
      const obs = doc.splitTextToSize(c.observacoes, IW - 12)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(6.5)
      doc.setTextColor(...SOFT)
      doc.text(obs[0], M + 7, y + 33)
    }

    y += 42
  })

  // ───────────────────────────────────────────
  // ANÁLISE E PRÓXIMOS PASSOS
  // ───────────────────────────────────────────
  if (y > H - 50) { doc.addPage(); y = M }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('ANÁLISE E PRÓXIMOS PASSOS', M, y)
  y += 6

  // Insights automáticos
  const insights: string[] = []
  if (roas >= 3) insights.push(`✓  ROAS de ${fmtNum(roas, 2)}x indica campanha altamente lucrativa — recomendamos escalar o investimento.`)
  else if (roas >= 2) insights.push(`✓  ROAS de ${fmtNum(roas, 2)}x está positivo. Há espaço para otimização rumo a 3x+.`)
  else if (roas > 1) insights.push(`△  ROAS de ${fmtNum(roas, 2)}x — rentável mas abaixo do ideal. Avaliar qualidade dos leads e processo comercial.`)
  else if (roas > 0) insights.push(`✗  ROAS de ${fmtNum(roas, 2)}x abaixo do ponto de equilíbrio. Revisão estratégica necessária.`)

  if (cplMedio > 0) insights.push(`•  CPL médio de ${fmt(cplMedio)} por lead. ${totalLeads} leads gerados no período.`)
  if (taxaConv > 0) insights.push(`•  Taxa de conversão de leads em clientes: ${fmtNum(taxaConv, 1)}%.`)

  const cplAlerta = campanhas.filter(c => c.cpl && c.meta_cpl && Number(c.cpl) > Number(c.meta_cpl))
  if (cplAlerta.length > 0) insights.push(`△  ${cplAlerta.map(c => c.plataforma).join(', ')}: CPL acima da meta — revisar segmentação e criativos.`)

  insights.forEach((txt) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...SOFT)
    const linhas = doc.splitTextToSize(txt, IW)
    doc.text(linhas, M, y)
    y += linhas.length * 4.5 + 3
  })

  // Espaço p/ assinatura
  y += 10
  if (y > H - 40) { doc.addPage(); y = M }
  linha(doc, M, y, M + 70, ...LINE)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('Responsável pela conta', M, y + 5)
  doc.text('Leadboss — Agência de Tráfego Pago', M, y + 9)

  // ───────────────────────────────────────────
  // RODAPÉ em todas as páginas
  // ───────────────────────────────────────────
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    linha(doc, M, H - 12, W - M, ...LINE)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...MUTED)
    doc.text('Leadboss — Agência de Tráfego Pago', M, H - 7)
    doc.text(`Relatório confidencial · ${clienteNome} · ${mesLabel(mesReferencia)}`, W / 2, H - 7, { align: 'center' })
    doc.text(`${p} / ${totalPages}`, W - M, H - 7, { align: 'right' })
  }

  // Download
  const nomeMes = mesLabel(mesReferencia).replace(' de ', '-').toLowerCase().replace(' ', '-')
  doc.save(`relatorio-${clienteNome.toLowerCase().replace(/\s+/g, '-')}-${nomeMes}.pdf`)
}
