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
  mesReferencia: string
  campanhas: CampanhaRelatorio[]
  logoBase64?: string
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const MESES_ACENTUADOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const PLATAFORMA_CORES: Record<string, [number, number, number]> = {
  Meta:     [24, 119, 242],
  Google:   [66, 133, 244],
  LinkedIn: [10, 102, 194],
  TikTok:   [30, 30, 30],
  YouTube:  [200, 40, 40],
}

function fmt(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

function fmtNum(v: number, dec = 0): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}

function mesLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return `${MESES_ACENTUADOS[d.getMonth()]} de ${d.getFullYear()}`
}

function mesLabelSafe(iso: string): string {
  // versão sem acento para nome de arquivo
  const d = new Date(iso + 'T00:00:00')
  return `${MESES[d.getMonth()].toLowerCase()}-${d.getFullYear()}`
}

function hr(doc: jsPDF, y: number, M: number, W: number, r: number, g: number, b: number) {
  doc.setDrawColor(r, g, b)
  doc.setLineWidth(0.25)
  doc.line(M, y, W - M, y)
}

export async function gerarRelatorioCampanha(dados: DadosRelatorio): Promise<void> {
  const { clienteNome, mesReferencia, campanhas, logoBase64 } = dados

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()
  const M = 18
  const IW = W - M * 2

  // Paleta
  const INK:   [number, number, number] = [22, 22, 22]
  const SOFT:  [number, number, number] = [80, 75, 68]
  const MUTED: [number, number, number] = [140, 133, 120]
  const LINE:  [number, number, number] = [218, 212, 200]
  const CREAM: [number, number, number] = [245, 241, 234]
  const GREEN: [number, number, number] = [60, 100, 46]
  const GOLD:  [number, number, number] = [170, 122, 30]
  const RED:   [number, number, number] = [175, 50, 35]

  // ─── CABEÇALHO ───────────────────────────────
  doc.setFillColor(...INK)
  doc.rect(0, 0, W, 46, 'F')

  if (logoBase64) {
    try { doc.addImage(logoBase64, 'PNG', M, 12, 20, 20) } catch {}
  }

  const logoX = logoBase64 ? M + 24 : M
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(245, 241, 234)
  doc.text('Leadboss', logoX, 24)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text('Agencia de Trafego Pago', logoX, 30)

  // lado direito
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(200, 196, 188)
  doc.text('RELATORIO DE PERFORMANCE', W - M, 18, { align: 'right' })

  doc.setFontSize(13)
  doc.setTextColor(245, 241, 234)
  doc.text(mesLabel(mesReferencia).toUpperCase(), W - M, 27, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text(`Cliente: ${clienteNome}`, W - M, 34, { align: 'right' })

  const hoje = new Date().toLocaleDateString('pt-BR')
  doc.setFontSize(6.5)
  doc.text(`Emitido em ${hoje}`, W - M, 40, { align: 'right' })

  let y = 56

  // ─── TOTAIS ───────────────────────────────────
  const totalInv   = campanhas.reduce((s, c) => s + Number(c.investimento || 0), 0)
  const totalFat   = campanhas.reduce((s, c) => s + Number(c.faturamento_atribuido || 0), 0)
  const totalLeads = campanhas.reduce((s, c) => s + (c.leads || 0), 0)
  const totalQual  = campanhas.reduce((s, c) => s + (c.leads_qualificados || 0), 0)
  const totalAgend = campanhas.reduce((s, c) => s + (c.agendamentos || 0), 0)
  const totalComp  = campanhas.reduce((s, c) => s + (c.comparecimentos || 0), 0)
  const totalFech  = campanhas.reduce((s, c) => s + (c.fechamentos || 0), 0)
  const roas       = totalInv > 0 ? totalFat / totalInv : 0
  const cplMedio   = totalLeads > 0 ? totalInv / totalLeads : 0
  const taxaConv   = totalLeads > 0 ? (totalFech / totalLeads) * 100 : 0

  const roasCor: [number, number, number] = roas >= 2 ? GREEN : roas > 1 ? GOLD : RED
  const roasStatus = roas >= 3 ? 'Excelente' : roas >= 2 ? 'Positivo' : roas > 1 ? 'Atencao' : 'Negativo'

  // ── Título seção
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  doc.text('VISAO GERAL DO MES', M, y)
  y += 5

  // ── ROAS hero — bloco largo, fundo escuro
  const roasH = 22
  doc.setFillColor(...roasCor)
  doc.setGState(doc.GState({ opacity: 0.1 }))
  doc.roundedRect(M, y, IW, roasH, 2, 2, 'F')
  doc.setGState(doc.GState({ opacity: 1 }))

  doc.setFillColor(...roasCor)
  doc.rect(M, y, 4, roasH, 'F')

  // Label ROAS
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...roasCor)
  doc.text('ROAS', M + 9, y + 7)

  // Número grande
  doc.setFontSize(26)
  doc.text(fmtNum(roas, 2) + 'x', M + 9, y + 18)

  // Status (sem emoji — texto puro)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...roasCor)
  doc.text(roasStatus, M + 48, y + 18)

  // Frase descritiva
  doc.setFontSize(8)
  doc.setTextColor(...SOFT)
  const frase = `Para cada R$ 1,00 investido, o cliente recebeu R$ ${fmtNum(roas, 2)} de volta`
  doc.text(frase, M + 48, y + 12)

  y += roasH + 4

  // ── 4 cards de métricas
  const cards = [
    { label: 'Investimento',    valor: fmt(totalInv),  sub: '' },
    { label: 'Faturamento',     valor: fmt(totalFat),  sub: 'atribuido' },
    { label: 'Leads Gerados',   valor: fmtNum(totalLeads), sub: `CPL: ${fmt(cplMedio)}` },
    { label: 'Fechamentos',     valor: fmtNum(totalFech),  sub: `Conv. ${fmtNum(taxaConv, 1)}%` },
  ]

  const cardW = IW / cards.length - 1.5
  cards.forEach((c, i) => {
    const cx = M + i * (cardW + 2)
    doc.setFillColor(...CREAM)
    doc.roundedRect(cx, y, cardW, 22, 1.5, 1.5, 'F')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...MUTED)
    doc.text(c.label.toUpperCase(), cx + 4, y + 6)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text(c.valor, cx + 4, y + 15)

    if (c.sub) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(...MUTED)
      doc.text(c.sub, cx + 4, y + 20)
    }
  })

  y += 28

  // ── Barra do ROAS
  doc.setFillColor(...LINE)
  doc.roundedRect(M, y, IW, 4.5, 2, 2, 'F')

  const pct = Math.min(roas / 5, 1)
  if (pct > 0) {
    doc.setFillColor(...roasCor)
    doc.roundedRect(M, y, IW * pct, 4.5, 2, 2, 'F')
  }

  ;[1, 2, 3, 4].forEach((v) => {
    const mx = M + (IW / 5) * v
    doc.setDrawColor(...LINE)
    doc.setLineWidth(0.25)
    doc.line(mx, y, mx, y + 4.5)
    doc.setFontSize(5)
    doc.setTextColor(...MUTED)
    doc.text(`${v}x`, mx - 1.5, y + 8)
  })
  doc.setFontSize(5)
  doc.setTextColor(...MUTED)
  doc.text('5x', M + IW - 2, y + 8)

  y += 14

  // ─── FUNIL ────────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  doc.text('FUNIL DE VENDAS', M, y)
  y += 5

  const etapas = [
    { label: 'Leads',          valor: totalLeads, pct: 100 },
    { label: 'Qualificados',   valor: totalQual,  pct: totalLeads > 0 ? (totalQual  / totalLeads) * 100 : 0 },
    { label: 'Agendamentos',   valor: totalAgend, pct: totalLeads > 0 ? (totalAgend / totalLeads) * 100 : 0 },
    { label: 'Comparecimentos',valor: totalComp,  pct: totalLeads > 0 ? (totalComp  / totalLeads) * 100 : 0 },
    { label: 'Fechamentos',    valor: totalFech,  pct: totalLeads > 0 ? (totalFech  / totalLeads) * 100 : 0 },
  ]

  const fH = 7.5
  const fGap = 2.5
  const labelCol = 32  // largura da coluna de labels à esquerda
  const barArea = IW - labelCol - 16  // área das barras
  const barStart = M + labelCol

  etapas.forEach((e, i) => {
    const cy = y + i * (fH + fGap)
    const bw = (barArea * e.pct) / 100
    const alpha = Math.max(0.35, 1 - i * 0.15)

    // label à esquerda
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7)
    doc.setTextColor(...SOFT)
    doc.text(e.label, M, cy + fH - 1.5)

    // barra
    doc.setGState(doc.GState({ opacity: alpha }))
    doc.setFillColor(...GREEN)
    if (bw > 0) doc.roundedRect(barStart, cy, bw, fH, 1.2, 1.2, 'F')
    doc.setGState(doc.GState({ opacity: 1 }))

    // número dentro da barra (se couber) ou fora
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7)
    if (bw >= 10) {
      doc.setTextColor(255, 255, 255)
      doc.text(String(e.valor), barStart + bw / 2, cy + fH - 1.5, { align: 'center' })
    } else {
      doc.setTextColor(...SOFT)
      doc.text(String(e.valor), barStart + bw + 2, cy + fH - 1.5)
    }

    // percentual à direita
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...MUTED)
    doc.text(`${fmtNum(e.pct, 1)}%`, M + IW, cy + fH - 1.5, { align: 'right' })
  })

  y += etapas.length * (fH + fGap) + 10

  // ─── POR PLATAFORMA ───────────────────────────
  if (y > H - 70) { doc.addPage(); y = M + 8 }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6.5)
  doc.setTextColor(...MUTED)
  doc.text('RESULTADO POR PLATAFORMA', M, y)
  y += 5

  campanhas.forEach((c) => {
    const cor = PLATAFORMA_CORES[c.plataforma] || [100, 100, 100] as [number, number, number]
    const cRoas = c.faturamento_atribuido && c.investimento
      ? Number(c.faturamento_atribuido) / Number(c.investimento) : null
    const cCpl = c.cpl || (c.leads > 0 ? c.investimento / c.leads : null)
    const cplOk = cCpl && c.meta_cpl ? cCpl <= Number(c.meta_cpl) : null

    // altura dinâmica: se tem observação, expande
    const blockH = c.observacoes ? 46 : 38

    if (y + blockH > H - 18) { doc.addPage(); y = M + 8 }

    // fundo
    doc.setFillColor(...CREAM)
    doc.roundedRect(M, y, IW, blockH, 2, 2, 'F')
    // borda lateral colorida
    doc.setFillColor(...cor)
    doc.rect(M, y, 3.5, blockH, 'F')

    // nome da plataforma
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...cor)
    doc.text(c.plataforma, M + 7, y + 8)

    // meta CPL
    if (c.meta_cpl) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(...MUTED)
      doc.text(`Meta CPL: ${fmt(Number(c.meta_cpl))}`, M + IW - 4, y + 8, { align: 'right' })
    }

    // grid 4 colunas x 2 linhas
    const metricas = [
      { label: 'INVESTIMENTO',   valor: fmt(Number(c.investimento)), cor: undefined as [number,number,number] | undefined },
      { label: 'LEADS',          valor: fmtNum(c.leads), cor: undefined },
      { label: 'LEADS QUALIF.',  valor: fmtNum(c.leads_qualificados), cor: undefined },
      { label: 'CPL',            valor: cCpl ? fmt(cCpl) : '—', cor: cplOk === false ? RED : cplOk === true ? GREEN : undefined },
      { label: 'AGENDAMENTOS',   valor: fmtNum(c.agendamentos), cor: undefined },
      { label: 'FECHAMENTOS',    valor: fmtNum(c.fechamentos), cor: undefined },
      { label: 'FATURAMENTO',    valor: c.faturamento_atribuido ? fmt(Number(c.faturamento_atribuido)) : '—', cor: undefined },
      { label: 'ROAS',           valor: cRoas ? `${fmtNum(cRoas, 2)}x` : '—', cor: cRoas && cRoas >= 2 ? GREEN : cRoas && cRoas > 1 ? GOLD : cRoas ? RED : undefined },
    ]

    const mColW = (IW - 10) / 4
    metricas.forEach((m, idx) => {
      const col = idx % 4
      const row = Math.floor(idx / 4)
      const mx = M + 7 + col * mColW
      const my = y + 13 + row * 13

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(5.5)
      doc.setTextColor(...MUTED)
      doc.text(m.label, mx, my)

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9)
      doc.setTextColor(...(m.cor || INK))
      doc.text(m.valor, mx, my + 6)
    })

    // observações (abaixo do grid, com separador)
    if (c.observacoes) {
      const obsY = y + blockH - 10
      doc.setDrawColor(...LINE)
      doc.setLineWidth(0.2)
      doc.line(M + 7, obsY - 3, M + IW - 4, obsY - 3)

      const obsLines = doc.splitTextToSize(c.observacoes, IW - 14)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(7)
      doc.setTextColor(...SOFT)
      doc.text(obsLines[0], M + 7, obsY + 1)
    }

    y += blockH + 5
  })

  // ─── ASSINATURA ───────────────────────────────
  y += 6
  if (y > H - 28) { doc.addPage(); y = M + 10 }

  hr(doc, y, M, W, ...LINE)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('Responsavel pela conta', M, y + 5)
  doc.text('Leadboss — Agencia de Trafego Pago', M, y + 10)

  // ─── RODAPÉ ────────────────────────────────────
  const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)
    hr(doc, H - 11, M, W, ...LINE)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6)
    doc.setTextColor(...MUTED)
    doc.text('Leadboss — Agencia de Trafego Pago', M, H - 6)
    doc.text(`Relatorio · ${clienteNome} · ${mesLabel(mesReferencia)}`, W / 2, H - 6, { align: 'center' })
    doc.text(`${p} / ${totalPages}`, W - M, H - 6, { align: 'right' })
  }

  // ─── DOWNLOAD ─────────────────────────────────
  doc.save(`relatorio-${clienteNome.toLowerCase().replace(/\s+/g, '-')}-${mesLabelSafe(mesReferencia)}.pdf`)
}
