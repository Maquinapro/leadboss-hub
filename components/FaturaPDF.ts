import jsPDF from 'jspdf'

type Configuracoes = {
  razao_social: string | null
  nome_fantasia: string | null
  cnpj: string | null
  endereco: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  telefone: string | null
  whatsapp: string | null
  email: string | null
  site: string | null
  chave_pix: string | null
}

type Pagamento = {
  id: string
  valor: number
  data_vencimento: string
  mes_referencia: string
  metodo_pagamento: string | null
  cliente: {
    nome: string
    email: string | null
    telefone: string | null
  } | null
}

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function formatMoeda(v: number): string {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })
}

function formatData(s: string): string {
  return new Date(s + 'T00:00:00').toLocaleDateString('pt-BR')
}

export async function gerarFaturaPDF(
  pagamento: Pagamento,
  config: Configuracoes,
  numeroFatura: number,
  logoBase64?: string
) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const lp = doc.internal.pageSize.getWidth()
  const margem = 20
  let y = margem

  const corTinta = [26, 26, 26] as [number, number, number]
  const corSuave = [85, 80, 72] as [number, number, number]
  const corMuted = [139, 132, 120] as [number, number, number]
  const corLinha = [217, 211, 197] as [number, number, number]
  const corAcento = [180, 60, 40] as [number, number, number]

  // === Cabeçalho ===
  if (logoBase64) {
    try { doc.addImage(logoBase64, 'PNG', margem, y, 18, 18) } catch {}
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(...corTinta)
  doc.text(config.nome_fantasia || config.razao_social || 'Leadboss', margem + 22, y + 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  if (config.razao_social && config.nome_fantasia && config.razao_social !== config.nome_fantasia) {
    doc.text(config.razao_social, margem + 22, y + 13)
  }
  if (config.cnpj) {
    doc.text(`CNPJ: ${config.cnpj}`, margem + 22, y + 18)
  }

  // Número da fatura (direita)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text('FATURA Nº', lp - margem, y + 4, { align: 'right' })
  doc.setFontSize(14)
  doc.setTextColor(...corAcento)
  doc.text(String(numeroFatura).padStart(4, '0'), lp - margem, y + 11, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  const hoje = new Date().toLocaleDateString('pt-BR')
  doc.text(`Emitida em ${hoje}`, lp - margem, y + 16, { align: 'right' })

  y += 26

  // Linha
  doc.setDrawColor(...corLinha)
  doc.setLineWidth(0.3)
  doc.line(margem, y, lp - margem, y)
  y += 10

  // Título
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...corMuted)
  doc.text('F A T U R A   D E   C O B R A N Ç A', lp / 2, y, { align: 'center' })
  y += 14

  // Valor
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(30)
  doc.setTextColor(...corAcento)
  doc.text(formatMoeda(Number(pagamento.valor)), lp / 2, y, { align: 'center' })
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...corSuave)
  doc.text('Valor com vencimento em ' + formatData(pagamento.data_vencimento), lp / 2, y, { align: 'center' })
  y += 16

  // Linha
  doc.setDrawColor(...corLinha)
  doc.line(margem, y, lp - margem, y)
  y += 8

  // Dados do cliente
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text('DADOS DO CLIENTE', margem, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...corTinta)
  doc.text(pagamento.cliente?.nome || '—', margem, y)
  y += 5

  if (pagamento.cliente?.email) {
    doc.setFontSize(9)
    doc.setTextColor(...corSuave)
    doc.text(pagamento.cliente.email, margem, y)
    y += 5
  }
  if (pagamento.cliente?.telefone) {
    doc.setTextColor(...corSuave)
    doc.text(pagamento.cliente.telefone, margem, y)
    y += 5
  }
  y += 4

  // Linha
  doc.setDrawColor(...corLinha)
  doc.line(margem, y, lp - margem, y)
  y += 8

  // Detalhes do serviço
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text('DETALHES DO SERVIÇO', margem, y)
  y += 6

  const mesRef = new Date(pagamento.mes_referencia + 'T00:00:00')
  const mesNome = MESES[mesRef.getMonth()]
  const anoRef = mesRef.getFullYear()
  const empresaNome = config.nome_fantasia || config.razao_social || 'Leadboss'

  const itens: Array<[string, string]> = [
    ['Serviço', `Gestão de tráfego pago e marketing digital`],
    ['Referência', `${mesNome.charAt(0).toUpperCase() + mesNome.slice(1)} de ${anoRef}`],
    ['Prestado por', empresaNome],
    ['Vencimento', formatData(pagamento.data_vencimento)],
    ['Valor', formatMoeda(Number(pagamento.valor))],
  ]

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  for (const [label, valor] of itens) {
    doc.setTextColor(...corMuted)
    doc.text(label, margem, y)
    doc.setTextColor(...corTinta)
    doc.text(valor, lp - margem, y, { align: 'right' })
    y += 6
  }
  y += 4

  // Linha
  doc.setDrawColor(...corLinha)
  doc.line(margem, y, lp - margem, y)
  y += 8

  // Pagamento
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text('COMO PAGAR', margem, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...corTinta)

  if (config.chave_pix) {
    doc.setFont('helvetica', 'bold')
    doc.text('PIX', margem, y)
    doc.setFont('helvetica', 'normal')
    doc.text(config.chave_pix, lp - margem, y, { align: 'right' })
    y += 6
  }

  const endLinha = [
    config.endereco && config.numero ? `${config.endereco}, ${config.numero}` : config.endereco,
    config.bairro,
    config.cidade && config.estado ? `${config.cidade} - ${config.estado}` : config.cidade,
    config.cep ? `CEP ${config.cep}` : null,
  ].filter(Boolean).join(' · ')

  y += 6
  doc.setDrawColor(...corLinha)
  doc.line(margem, y, lp - margem, y)
  y += 8

  // Rodapé agência
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text('DADOS DA AGÊNCIA', margem, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...corTinta)
  if (config.razao_social) { doc.text(config.razao_social, margem, y); y += 5 }
  if (endLinha) { doc.setTextColor(...corSuave); doc.text(endLinha, margem, y); y += 5 }

  const contato = [
    config.telefone,
    config.whatsapp && config.whatsapp !== config.telefone ? `WhatsApp ${config.whatsapp}` : null,
    config.email,
    config.site,
  ].filter(Boolean).join(' · ')
  if (contato) { doc.setTextColor(...corSuave); doc.text(contato, margem, y) }

  const mesNomeCap = mesNome.charAt(0).toUpperCase() + mesNome.slice(1)
  doc.save(`fatura-${String(numeroFatura).padStart(4, '0')}-${pagamento.cliente?.nome?.split(' ')[0] || 'cliente'}-${mesNomeCap}-${anoRef}.pdf`)
}
