import jsPDF from 'jspdf'

type Configuracoes = {
  razao_social: string | null
  nome_fantasia: string | null
  cnpj: string | null
  inscricao_estadual: string | null
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
  banco: string | null
  agencia: string | null
  conta: string | null
  observacoes_recibo: string | null
}

type Pagamento = {
  id: string
  valor: number
  data_pagamento: string | null
  data_vencimento: string
  mes_referencia: string
  metodo_pagamento: string | null
  nota_fiscal: string | null
  observacoes: string | null
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
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  })
}

function formatData(s: string): string {
  return new Date(s + 'T00:00:00').toLocaleDateString('pt-BR')
}

function valorPorExtenso(valor: number): string {
  const inteiro = Math.floor(valor)
  const centavos = Math.round((valor - inteiro) * 100)

  if (inteiro === 0 && centavos === 0) return 'zero reais'

  const unidades = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove']
  const dezAVinte = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const dezenas = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const centenas = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  function ate999(n: number): string {
    if (n === 0) return ''
    if (n === 100) return 'cem'
    const c = Math.floor(n / 100)
    const resto = n % 100
    const d = Math.floor(resto / 10)
    const u = resto % 10
    const partes: string[] = []
    if (c > 0) partes.push(centenas[c])
    if (resto > 0 && c > 0) partes.push('e')
    if (d === 1) partes.push(dezAVinte[u])
    else if (d > 1) {
      partes.push(dezenas[d])
      if (u > 0) { partes.push('e'); partes.push(unidades[u]) }
    } else if (u > 0) partes.push(unidades[u])
    return partes.join(' ')
  }

  function escrever(n: number): string {
    if (n === 0) return 'zero'
    if (n < 1000) return ate999(n)
    const milhares = Math.floor(n / 1000)
    const resto = n % 1000
    const partes: string[] = []
    if (milhares === 1) partes.push('mil')
    else partes.push(ate999(milhares) + ' mil')
    if (resto > 0) {
      partes.push(resto < 100 || resto % 100 === 0 ? 'e' : ',')
      partes.push(ate999(resto))
    }
    return partes.join(' ')
  }

  let resultado = ''
  if (inteiro > 0) {
    resultado += escrever(inteiro) + ' ' + (inteiro === 1 ? 'real' : 'reais')
  }
  if (centavos > 0) {
    if (inteiro > 0) resultado += ' e '
    resultado += escrever(centavos) + ' ' + (centavos === 1 ? 'centavo' : 'centavos')
  }
  return resultado
}

export async function gerarReciboPDF(pagamento: Pagamento, config: Configuracoes, logoBase64?: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const larguraPagina = doc.internal.pageSize.getWidth()
  const margem = 20
  let y = margem

  // Cores
  const corTinta = [26, 26, 26] as [number, number, number]
  const corSuave = [85, 80, 72] as [number, number, number]
  const corMuted = [139, 132, 120] as [number, number, number]
  const corLinha = [217, 211, 197] as [number, number, number]
  const corVerde = [74, 107, 58] as [number, number, number]

  // === Cabeçalho com logo ===
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margem, y, 18, 18)
    } catch (e) {
      // ignora se logo falhar
    }
  }

  // Nome da empresa
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...corTinta)
  doc.text(config.nome_fantasia || config.razao_social || 'Leadboss', margem + 22, y + 7)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  if (config.razao_social && config.razao_social !== config.nome_fantasia) {
    doc.text(config.razao_social, margem + 22, y + 12)
  }
  if (config.cnpj) {
    doc.text(`CNPJ: ${config.cnpj}`, margem + 22, y + 16)
  }

  // Número do recibo (direita)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text('RECIBO Nº', larguraPagina - margem, y + 4, { align: 'right' })
  doc.setFontSize(11)
  doc.setTextColor(...corTinta)
  doc.text(pagamento.id.substring(0, 8).toUpperCase(), larguraPagina - margem, y + 9, { align: 'right' })

  // Data de emissão
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  const hoje = new Date().toLocaleDateString('pt-BR')
  doc.text(`Emitido em ${hoje}`, larguraPagina - margem, y + 14, { align: 'right' })

  y += 25

  // Linha divisória
  doc.setDrawColor(...corLinha)
  doc.setLineWidth(0.3)
  doc.line(margem, y, larguraPagina - margem, y)
  y += 12

  // === Título RECIBO DE PAGAMENTO ===
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...corMuted)
  doc.text('R E C I B O   D E   P A G A M E N T O', larguraPagina / 2, y, { align: 'center' })
  y += 14

  // === Valor em destaque ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...corVerde)
  doc.text(formatMoeda(Number(pagamento.valor)), larguraPagina / 2, y, { align: 'center' })
  y += 8

  // Valor por extenso
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...corSuave)
  const extenso = `(${valorPorExtenso(Number(pagamento.valor))})`
  doc.text(extenso, larguraPagina / 2, y, { align: 'center' })
  y += 14

  // === Texto descritivo ===
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...corTinta)

  const mesRef = new Date(pagamento.mes_referencia + 'T00:00:00')
  const mesNome = MESES[mesRef.getMonth()]
  const anoRef = mesRef.getFullYear()

  const empresaNome = config.nome_fantasia || config.razao_social || 'Leadboss'
  const clienteNome = pagamento.cliente?.nome || '—'

  const texto = `Recebemos de ${clienteNome} a importância acima descrita, referente aos serviços de gestão de tráfego pago e marketing digital prestados por ${empresaNome} no mês de ${mesNome} de ${anoRef}, dando assim plena, geral e irrevogável quitação pelo valor recebido.`

  const linhasTexto = doc.splitTextToSize(texto, larguraPagina - margem * 2)
  doc.text(linhasTexto, margem, y)
  y += linhasTexto.length * 5 + 8

  // === Detalhes do pagamento ===
  doc.setDrawColor(...corLinha)
  doc.line(margem, y, larguraPagina - margem, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text('DETALHES DO PAGAMENTO', margem, y)
  y += 6

  const detalhes: Array<[string, string]> = []
  if (pagamento.data_pagamento) detalhes.push(['Data do pagamento', formatData(pagamento.data_pagamento)])
  detalhes.push(['Vencimento', formatData(pagamento.data_vencimento)])
  if (pagamento.metodo_pagamento) detalhes.push(['Método', pagamento.metodo_pagamento])
  detalhes.push(['Referência', `${mesNome.charAt(0).toUpperCase() + mesNome.slice(1)} de ${anoRef}`])
  if (pagamento.nota_fiscal) detalhes.push(['Nota fiscal', pagamento.nota_fiscal])

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  for (const [label, valor] of detalhes) {
    doc.setTextColor(...corMuted)
    doc.text(label, margem, y)
    doc.setTextColor(...corTinta)
    doc.text(valor, larguraPagina - margem, y, { align: 'right' })
    y += 5
  }
  y += 6

  // === Dados da agência ===
  doc.setDrawColor(...corLinha)
  doc.line(margem, y, larguraPagina - margem, y)
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text('DADOS DA AGÊNCIA', margem, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...corTinta)

  if (config.razao_social) {
    doc.text(config.razao_social, margem, y); y += 5
  }

  const enderecoCompleto = [
    config.endereco && config.numero ? `${config.endereco}, ${config.numero}` : config.endereco,
    config.complemento,
    config.bairro,
    config.cidade && config.estado ? `${config.cidade} - ${config.estado}` : config.cidade,
    config.cep ? `CEP ${config.cep}` : null,
  ].filter(Boolean).join(' · ')

  if (enderecoCompleto) {
    doc.setTextColor(...corSuave)
    doc.text(enderecoCompleto, margem, y); y += 5
  }

  const contato = [
    config.telefone,
    config.whatsapp && config.whatsapp !== config.telefone ? `WhatsApp ${config.whatsapp}` : null,
    config.email,
    config.site,
  ].filter(Boolean).join(' · ')

  if (contato) {
    doc.text(contato, margem, y); y += 5
  }
  y += 4

  // === Observações ===
  if (config.observacoes_recibo) {
    doc.setDrawColor(...corLinha)
    doc.line(margem, y, larguraPagina - margem, y)
    y += 6
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8)
    doc.setTextColor(...corSuave)
    const linhasObs = doc.splitTextToSize(config.observacoes_recibo, larguraPagina - margem * 2)
    doc.text(linhasObs, margem, y)
    y += linhasObs.length * 4 + 4
  }

  // === Rodapé com cidade e assinatura ===
  const yRodape = doc.internal.pageSize.getHeight() - 35
  if (y < yRodape) y = yRodape

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...corTinta)

  const cidadeAgencia = config.cidade || 'Atibaia'
  const estadoAgencia = config.estado || 'SP'
  const hojeExtenso = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.text(`${cidadeAgencia} (${estadoAgencia}), ${hojeExtenso}.`, margem, y)
  y += 12

  // Linha de assinatura
  doc.setDrawColor(...corTinta)
  doc.setLineWidth(0.3)
  doc.line(margem, y, margem + 80, y)
  y += 4
  doc.setFontSize(8)
  doc.setTextColor(...corMuted)
  doc.text(config.razao_social || config.nome_fantasia || 'Leadboss', margem, y)

  // Salvar com nome bonitinho
  const nomeArquivo = `Recibo_${clienteNome.replace(/[^a-zA-Z0-9]/g, '_')}_${mesNome}_${anoRef}.pdf`
  doc.save(nomeArquivo)
}

// Converte a imagem do logo em base64 (pra embutir no PDF)
export async function carregarLogoBase64(): Promise<string | null> {
  try {
    const response = await fetch('/leadboss-logo.png')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}