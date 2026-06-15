// Conteúdo do blog. Para publicar um novo artigo, adicione um objeto ao array POSTS.
// O corpo é montado por blocos simples (parágrafo, subtítulo, lista). Use **negrito**
// dentro do texto para dar ênfase.

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }

export interface Post {
  slug: string
  title: string
  description: string // usado em <meta> e no card
  date: string // ISO (AAAA-MM-DD)
  category: string
  readingMinutes: number
  body: Block[]
}

const POSTS: Post[] = [
  {
    slug: 'quanto-investir-google-ads-clinicas-2026',
    title: 'Quanto investir em Google Ads para clínicas em 2026?',
    description:
      'Não existe um valor mágico, mas existe uma forma certa de definir o orçamento. Veja como calcular quanto investir em Google Ads para a sua clínica em 2026 sem queimar dinheiro.',
    date: '2026-06-10',
    category: 'Google Ads',
    readingMinutes: 5,
    body: [
      { type: 'p', text: 'É a pergunta que mais ouvimos de clínicas — odontológicas, de estética, fisioterapia, médicas: **quanto preciso investir em Google Ads para começar a ter resultado?** A resposta honesta é que não existe um número universal. Mas existe um método para chegar ao número certo para a **sua** clínica, na **sua** região.' },
      { type: 'h2', text: 'Por que não existe um valor fixo' },
      { type: 'p', text: 'O custo por clique no Google varia enormemente conforme a especialidade e a cidade. Um clique para "implante dentário" em uma capital pode custar várias vezes mais do que "limpeza de pele" em uma cidade média. Definir um orçamento sem olhar para esses dois fatores é como precificar uma consulta sem saber o procedimento.' },
      { type: 'p', text: 'Por isso, em vez de copiar o investimento do concorrente, o caminho é partir da sua meta de pacientes e trabalhar de trás para frente.' },
      { type: 'h2', text: 'Como calcular o seu orçamento de trás para frente' },
      { type: 'p', text: 'O raciocínio é simples e funciona para qualquer clínica:' },
      { type: 'ul', items: [
        'Defina quantos **novos pacientes** você quer por mês vindos do Google.',
        'Estime sua **taxa de conversão de lead em paciente** (de cada 10 contatos, quantos fecham?).',
        'Com isso você sabe quantos **leads** precisa gerar.',
        'Multiplique pelo **custo por lead** estimado da sua especialidade e região.',
      ] },
      { type: 'p', text: 'Exemplo: se você quer 10 novos pacientes, fecha 1 a cada 4 leads e o custo por lead da sua área gira em torno de R$ 40, você precisa de ~40 leads, ou seja, um investimento de aproximadamente R$ 1.600 em mídia. Os números mudam de clínica para clínica — o método, não.' },
      { type: 'h2', text: 'O erro mais caro: investir pouco demais' },
      { type: 'p', text: 'Muita clínica testa Google Ads com um orçamento mínimo por duas semanas, não vê retorno e conclui que "não funciona". O problema raramente é o canal — é a falta de **dados suficientes para otimizar**. Campanhas precisam de volume para o algoritmo aprender quem é o seu paciente ideal. Verba curta demais nunca chega nesse ponto.' },
      { type: 'p', text: 'É melhor concentrar o orçamento em poucas campanhas bem segmentadas do que espalhá-lo fino em muitas frentes.' },
      { type: 'h2', text: 'Google ou Meta para clínicas?' },
      { type: 'p', text: 'No Google você captura quem **já está procurando** pelo procedimento — intenção alta, decisão mais próxima. No Meta (Instagram e Facebook) você gera desejo e lembrança em quem ainda não procurava. A maioria das clínicas que crescem de forma previsível usa os dois: Google para captar a demanda existente, Meta para criar nova demanda.' },
      { type: 'h2', text: 'Resumo' },
      { type: 'p', text: 'Não pergunte "quanto os outros investem". Pergunte "quantos pacientes eu quero e quanto custa trazer cada um". Com esse número em mãos, o orçamento deixa de ser um chute e vira uma decisão de negócio. Se quiser, fazemos esse cálculo junto com você em um diagnóstico inicial — sem compromisso.' },
    ],
  },
  {
    slug: 'cac-meta-ads-aumentou-2026',
    title: 'O CAC no Meta Ads aumentou: o que fazer em 2026',
    description:
      'O custo de anunciar no Meta subiu e o seu custo de aquisição de cliente foi junto. Veja por que isso aconteceu e o que negócios locais podem fazer para contornar em 2026.',
    date: '2026-06-03',
    category: 'Meta Ads',
    readingMinutes: 6,
    body: [
      { type: 'p', text: 'Se você anuncia no Instagram e no Facebook, provavelmente sentiu: o mesmo resultado de antes está custando mais caro. Não é impressão. Só em janeiro de 2026, o custo de anunciar no Meta subiu **12,15%** no Brasil — e o seu **CAC (custo de aquisição de cliente)** subiu junto, muitas vezes sem você perceber, porque o gerenciador não mostra isso de forma clara.' },
      { type: 'h2', text: 'Por que o CAC subiu' },
      { type: 'p', text: 'Três forças empurram o custo para cima ao mesmo tempo:' },
      { type: 'ul', items: [
        '**Mais concorrência:** todo ano entram mais anunciantes disputando o mesmo espaço no feed.',
        '**Menos sinal de dados:** restrições de privacidade tornaram a segmentação menos precisa, e o algoritmo precisa de mais verba para acertar o público.',
        '**Criativos que cansam rápido:** o público vê o mesmo anúncio muitas vezes, o desempenho cai e o custo sobe.',
      ] },
      { type: 'h2', text: 'O que fazer na prática' },
      { type: 'p', text: 'A boa notícia: dá para contornar sem simplesmente jogar mais dinheiro no problema. O que mais funciona para negócios locais em 2026:' },
      { type: 'ul', items: [
        '**Renove os criativos com frequência.** Anúncio que cansou é dinheiro jogado fora. Ter sempre novas variações em teste mantém o custo sob controle.',
        '**Foque em oferta, não só em alcance.** Uma proposta clara e específica converte mais barato do que um anúncio genérico de "conheça nossos serviços".',
        '**Combine Meta com Google.** Deixe o Meta gerar demanda e o Google capturar quem já está procurando — isso dilui o custo médio de aquisição.',
        '**Capriche na página de destino.** Metade do custo alto vem de mandar o clique para uma página que não converte. Uma landing page focada derruba o CAC sem aumentar a verba.',
      ] },
      { type: 'h2', text: 'Meça o que realmente importa' },
      { type: 'p', text: 'O erro mais comum é olhar só para o custo por lead dentro do gerenciador. O número que decide se a operação é lucrativa é o **custo por cliente fechado** — e isso só aparece quando você conecta o que acontece no anúncio com o que acontece na sua agenda ou no seu fechamento. Sem essa ponte, você otimiza para o lead errado.' },
      { type: 'h2', text: 'Resumo' },
      { type: 'p', text: 'O CAC subir não significa que o Meta deixou de funcionar — significa que a régua subiu. Quem renova criativo, melhora a oferta, cuida da página de destino e mede o custo por cliente (não só por lead) continua crescendo de forma previsível enquanto a concorrência reclama do custo. Se quiser, revisamos a sua operação e mostramos onde está o desperdício.' },
    ],
  },
]

export function getAllPosts(): Post[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): Post | undefined {
  return POSTS.find((p) => p.slug === slug)
}

export function getAllSlugs(): string[] {
  return POSTS.map((p) => p.slug)
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}
