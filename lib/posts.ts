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
      { type: 'p', text: 'É a pergunta que mais ouvimos de clínicas (odontológicas, de estética, fisioterapia, médicas): **quanto preciso investir em Google Ads para começar a ter resultado?** A resposta honesta é que não existe um número universal. Mas existe um método para chegar ao número certo para a **sua** clínica, na **sua** região.' },
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
      { type: 'p', text: 'Exemplo: se você quer 10 novos pacientes, fecha 1 a cada 4 leads e o custo por lead da sua área gira em torno de R$ 40, você precisa de ~40 leads, ou seja, um investimento de aproximadamente R$ 1.600 em mídia. Os números mudam de clínica para clínica. O método, não.' },
      { type: 'h2', text: 'O erro mais caro: investir pouco demais' },
      { type: 'p', text: 'Muita clínica testa Google Ads com um orçamento mínimo por duas semanas, não vê retorno e conclui que "não funciona". O problema raramente é o canal: é a falta de **dados suficientes para otimizar**. Campanhas precisam de volume para o algoritmo aprender quem é o seu paciente ideal. Verba curta demais nunca chega nesse ponto.' },
      { type: 'p', text: 'É melhor concentrar o orçamento em poucas campanhas bem segmentadas do que espalhá-lo fino em muitas frentes.' },
      { type: 'h2', text: 'Google ou Meta para clínicas?' },
      { type: 'p', text: 'No Google você captura quem **já está procurando** pelo procedimento, com intenção alta e decisão mais próxima. No Meta (Instagram e Facebook) você gera desejo e lembrança em quem ainda não procurava. A maioria das clínicas que crescem de forma previsível usa os dois: Google para captar a demanda existente, Meta para criar nova demanda.' },
      { type: 'h2', text: 'Resumo' },
      { type: 'p', text: 'Não pergunte "quanto os outros investem". Pergunte "quantos pacientes eu quero e quanto custa trazer cada um". Com esse número em mãos, o orçamento deixa de ser um chute e vira uma decisão de negócio. Se quiser, fazemos esse cálculo junto com você em um diagnóstico inicial, sem compromisso.' },
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
      { type: 'p', text: 'Se você anuncia no Instagram e no Facebook, provavelmente sentiu: o mesmo resultado de antes está custando mais caro. Não é impressão. Só em janeiro de 2026, o custo de anunciar no Meta subiu **12,15%** no Brasil. O seu **CAC (custo de aquisição de cliente)** subiu junto, muitas vezes sem você perceber, porque o gerenciador não mostra isso de forma clara.' },
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
        '**Combine Meta com Google.** Deixe o Meta gerar demanda e o Google capturar quem já está procurando. Isso dilui o custo médio de aquisição.',
        '**Capriche na página de destino.** Metade do custo alto vem de mandar o clique para uma página que não converte. Uma landing page focada derruba o CAC sem aumentar a verba.',
      ] },
      { type: 'h2', text: 'Meça o que realmente importa' },
      { type: 'p', text: 'O erro mais comum é olhar só para o custo por lead dentro do gerenciador. O número que decide se a operação é lucrativa é o **custo por cliente fechado**, e isso só aparece quando você conecta o que acontece no anúncio com o que acontece na sua agenda ou no seu fechamento. Sem essa ponte, você otimiza para o lead errado.' },
      { type: 'h2', text: 'Resumo' },
      { type: 'p', text: 'O CAC subir não significa que o Meta deixou de funcionar: significa que a régua subiu. Quem renova criativo, melhora a oferta, cuida da página de destino e mede o custo por cliente (não só por lead) continua crescendo de forma previsível enquanto a concorrência reclama do custo. Se quiser, revisamos a sua operação e mostramos onde está o desperdício.' },
    ],
  },
  {
    slug: 'trafego-pago-para-advogados-funciona',
    title: 'Tráfego pago para advogados funciona? O que você precisa saber antes de investir',
    description:
      'Advogados podem anunciar no Google e no Meta, mas existem regras da OAB e particularidades do público jurídico que mudam tudo. Veja o que funciona de verdade.',
    date: '2026-06-17',
    category: 'Estratégia',
    readingMinutes: 6,
    body: [
      { type: 'p', text: 'A resposta curta: sim, funciona. Mas funciona diferente de uma clínica ou de um e-commerce, porque o público jurídico tem particularidades que mudam a estratégia inteira. Quem ignora isso queima verba e se frustra achando que "anúncio não serve pra advocacia".' },
      { type: 'h2', text: 'O que a OAB permite (e o que não permite)' },
      { type: 'p', text: 'O Provimento 205/2021 da OAB liberou a publicidade digital para advogados, inclusive anúncios pagos. O que continua proibido é a captação direta de clientes (promessas de resultado, linguagem mercantilista, comparação com outros escritórios). Na prática, o anúncio pode existir, mas precisa ter tom informativo e educativo.' },
      { type: 'p', text: 'Isso muda o criativo: em vez de "Contrate agora", a abordagem que funciona é "Entenda seus direitos" ou "Saiba como funciona o processo de [área]". O lead chega pelo conteúdo, não pela venda direta.' },
      { type: 'h2', text: 'Google ou Meta para advogados?' },
      { type: 'p', text: 'No Google, o advogado captura quem já tem um problema e está buscando solução: "advogado trabalhista em [cidade]", "como entrar com ação de divórcio". Intenção alta, lead quente. O custo por clique tende a ser mais alto, mas a qualidade do lead compensa.' },
      { type: 'p', text: 'No Meta (Instagram e Facebook), o advogado constrói autoridade e gera demanda. Posts educativos patrocinados atraem quem ainda não sabe que precisa de um advogado, mas se identifica com o problema. Funciona muito bem para Direito de Família, Trabalhista e Previdenciário, onde a dor é emocional e o público engaja com conteúdo.' },
      { type: 'h2', text: 'O erro mais comum' },
      { type: 'p', text: 'Mandar o clique do anúncio para o site institucional do escritório. A pessoa buscou "advogado para revisão de aposentadoria" e cai numa página que fala de 15 áreas de atuação, com foto da fachada e um "entre em contato". Isso não converte. O lead precisa de uma página focada no problema dele, com linguagem clara e um caminho fácil pra iniciar a conversa.' },
      { type: 'h2', text: 'Quanto custa na prática' },
      { type: 'p', text: 'O custo por lead para advogados varia bastante conforme a área e a cidade. Em capitais, leads de Direito Trabalhista e Previdenciário costumam ser mais acessíveis. Já áreas como Direito Empresarial e Tributário tendem a ter CPC mais alto, mas o ticket do serviço também é proporcionalmente maior.' },
      { type: 'p', text: 'O raciocínio é o mesmo de qualquer negócio: quanto vale um cliente fechado? Se um caso de revisão de aposentadoria rende milhares de reais em honorários, um custo de R$ 50 a R$ 80 por lead é excelente, desde que o lead seja qualificado.' },
      { type: 'h2', text: 'Resumo' },
      { type: 'p', text: 'Tráfego pago funciona para advogados, com três condições: respeitar as regras da OAB no criativo, usar página de destino focada no problema do cliente (não o site institucional) e medir o custo por cliente fechado, não só o custo por clique. Se quiser entender como isso se aplica ao seu escritório, fazemos um diagnóstico inicial sem compromisso.' },
    ],
  },
  {
    slug: 'landing-page-que-converte-o-que-nao-pode-faltar',
    title: 'Landing page que converte: o que não pode faltar',
    description:
      'Sua campanha pode estar perfeita, mas se a página de destino não convence, o clique vira desperdício. Veja os elementos que uma landing page precisa ter pra gerar leads de verdade.',
    date: '2026-06-20',
    category: 'Conversão',
    readingMinutes: 5,
    body: [
      { type: 'p', text: 'Metade do dinheiro desperdiçado em tráfego pago não é culpa do anúncio. É culpa da página de destino. O anúncio faz o trabalho dele (atrai o clique certo), mas o lead chega na página e não encontra o que esperava, ou encontra e não sabe o que fazer. Resultado: volta pro Google e clica no concorrente.' },
      { type: 'h2', text: 'O princípio que muda tudo: message match' },
      { type: 'p', text: 'Message match é quando a mensagem do anúncio e a mensagem da página são a mesma. Se o anúncio promete "implante dentário em Presidente Prudente", a página precisa abrir com exatamente isso no título. Parece óbvio, mas a maioria das empresas manda o clique pra página inicial do site, que fala de tudo e de nada ao mesmo tempo.' },
      { type: 'p', text: 'Cada campanha deveria ter sua própria página. A página de Invisalign fala de Invisalign. A de implante fala de implante. A genérica fala do serviço geral. Isso sozinho já melhora a taxa de conversão de forma visível.' },
      { type: 'h2', text: 'Os 6 elementos que não podem faltar' },
      { type: 'ul', items: [
        '**Título claro acima da dobra.** A pessoa precisa entender em 3 segundos o que você oferece e pra quem. Sem metáfora, sem mistério.',
        '**Um CTA único e visível.** "Agendar avaliação", "Falar no WhatsApp", "Pedir orçamento". Só um. Se a página tem 3 botões diferentes, ela não tem nenhum.',
        '**Prova social.** Depoimentos, avaliações do Google, logos de clientes, número de atendimentos. Quem não te conhece precisa de uma razão pra confiar.',
        '**Endereço e contato visíveis.** Pra negócio local, isso é obrigatório. Quem busca "dentista em [cidade]" quer saber que você é daquela cidade.',
        '**Velocidade no celular.** Mais de 70% do tráfego vem do celular. Se a página demora pra carregar, o lead vai embora antes de ver o título.',
        '**Formulário curto ou botão de WhatsApp.** Quanto menos campos, mais gente preenche. Nome e telefone bastam pra iniciar a conversa.',
      ] },
      { type: 'h2', text: 'O que tirar da página' },
      { type: 'p', text: 'Tão importante quanto o que colocar é o que remover. Menu de navegação completo, links pro blog, rodapé cheio de links, pop-ups: tudo isso dá ao visitante uma saída que não é o seu CTA. Landing page boa é caminho de mão única. A pessoa entra, entende, confia e age.' },
      { type: 'h2', text: 'Como saber se a sua página está funcionando' },
      { type: 'p', text: 'Duas métricas resolvem: **taxa de conversão** (quantos dos que entraram viraram lead) e **custo por lead** (quanto você pagou por cada contato). Se a taxa está abaixo de 5%, o problema provavelmente está na página, não no anúncio. E a forma mais rápida de melhorar é testar uma variação: troque o título, mude a oferta ou simplifique o formulário.' },
      { type: 'h2', text: 'Resumo' },
      { type: 'p', text: 'A landing page é onde o dinheiro do anúncio vira (ou não) um cliente. Título claro, CTA único, prova social, endereço, velocidade e formulário curto. Parece simples, e é. O difícil é resistir à tentação de colocar coisa demais. Se quiser, analisamos a sua página atual e mostramos o que está travando a conversão.' },
    ],
  },
  {
    slug: 'google-ads-ou-meta-ads-onde-investir-primeiro',
    title: 'Google Ads ou Meta Ads: onde investir primeiro?',
    description:
      'As duas plataformas funcionam, mas servem pra coisas diferentes. Entenda quando priorizar Google, quando priorizar Meta e quando usar os dois juntos.',
    date: '2026-06-13',
    category: 'Estratégia',
    readingMinutes: 5,
    body: [
      { type: 'p', text: 'É a dúvida mais comum de quem está começando a investir em tráfego pago: coloco o dinheiro no Google ou no Instagram? A resposta depende de uma coisa só: o seu cliente já sabe que precisa do que você vende, ou você precisa mostrar pra ele que precisa?' },
      { type: 'h2', text: 'Google Ads: captura de demanda' },
      { type: 'p', text: 'O Google é o canal da intenção. A pessoa digita "dentista em Presidente Prudente", "advogado trabalhista em São Paulo" ou "apartamento à venda no centro". Ela já tem o problema e está procurando a solução. Você aparece na hora certa, pro público certo.' },
      { type: 'p', text: 'O custo por clique costuma ser mais alto, mas a qualidade do lead compensa: quem busca ativamente está mais perto de fechar. Por isso o Google funciona muito bem pra serviços de necessidade (saúde, jurídico, manutenção, imobiliário) e pra quem quer resultado previsível.' },
      { type: 'h2', text: 'Meta Ads: geração de demanda' },
      { type: 'p', text: 'No Meta (Instagram e Facebook), ninguém está procurando nada. A pessoa está rolando o feed e o seu anúncio interrompe, gera interesse e cria desejo. Funciona muito bem pra serviços de desejo (estética, educação, moda, alimentação) e pra quem precisa construir marca e reconhecimento.' },
      { type: 'p', text: 'O custo por clique é menor, mas o lead costuma ser mais frio: ainda está na fase de curiosidade. Por isso o Meta exige mais do criativo (foto, vídeo, copy) e da oferta (algo que faça a pessoa parar de rolar).' },
      { type: 'h2', text: 'A regra prática' },
      { type: 'ul', items: [
        '**Se o seu serviço é buscado ativamente**, comece pelo Google. Exemplos: clínicas, advogados, contadores, imobiliárias, oficinas.',
        '**Se o seu serviço é desejado, não buscado**, comece pelo Meta. Exemplos: estúdios de estética, personal trainers, cursos, restaurantes.',
        '**Se a verba permite**, use os dois. O Meta gera demanda nova, o Google captura quem já está pronto. Juntos, eles cobrem o funil inteiro.',
      ] },
      { type: 'h2', text: 'O erro de escolher por preço' },
      { type: 'p', text: 'Muita gente escolhe o Meta porque "o clique é mais barato". Clique barato não significa lead barato. Se o custo por clique no Google é R$ 5 mas 1 em cada 10 vira lead, você paga R$ 50 por lead. Se no Meta o clique custa R$ 1 mas só 1 em cada 30 vira lead, o custo é R$ 30, só que a qualidade desse lead pode ser muito menor. O que importa é o custo por cliente fechado, não o custo por clique.' },
      { type: 'h2', text: 'Resumo' },
      { type: 'p', text: 'Google pra quem já busca, Meta pra quem ainda não sabe que precisa. Na dúvida, comece pelo canal que casa com o comportamento do seu cliente. E se a verba permitir, combine os dois. Se quiser entender qual faz mais sentido pro seu negócio, fazemos um diagnóstico gratuito e mostramos onde está a oportunidade.' },
    ],
  },
  {
    slug: 'trafego-pago-para-imobiliarias-como-gerar-leads-qualificados',
    title: 'Tráfego pago para imobiliárias: como gerar leads qualificados',
    description:
      'Imobiliárias gastam muito em anúncio e recebem leads frios. Veja como montar campanhas que atraem quem realmente quer comprar ou alugar.',
    date: '2026-06-06',
    category: 'Google Ads',
    readingMinutes: 6,
    body: [
      { type: 'p', text: 'O mercado imobiliário é um dos que mais investem em tráfego pago no Brasil. Também é um dos que mais reclamam da qualidade dos leads. A maioria dos corretores e imobiliárias recebe centenas de contatos por mês e fecha uma fração mínima. O problema quase nunca é o volume: é a qualidade.' },
      { type: 'h2', text: 'Por que os leads chegam frios' },
      { type: 'p', text: 'A causa mais comum é segmentação ampla demais no Meta Ads. Campanhas de "geração de cadastro" com formulário nativo do Instagram geram volume alto e custo baixo, mas o lead preenche sem pensar: muitas vezes só quer ver o preço, não tem renda compatível ou nem lembra que preencheu. O resultado é uma lista enorme de contatos que não atendem o telefone.' },
      { type: 'h2', text: 'O que muda no Google' },
      { type: 'p', text: 'Quem digita "apartamento 3 quartos à venda em [bairro]" ou "casa com piscina em [cidade]" está numa etapa diferente. Já sabe o que quer, onde quer e está comparando opções. Esse lead chega quente. O custo por clique é mais alto, mas o custo por visita agendada (que é o que realmente importa) costuma ser menor.' },
      { type: 'p', text: 'O segredo no Google para imobiliárias é a especificidade: em vez de anunciar "imóveis em São Paulo", anuncie o tipo, a faixa e o bairro. Quanto mais específica a busca que você captura, mais qualificado é o lead.' },
      { type: 'h2', text: 'Meta Ads funciona pra imobiliária?' },
      { type: 'p', text: 'Funciona, mas com estratégia diferente. O Meta é excelente pra lançamentos (cria buzz e lista de espera), pra imóveis de alto padrão (vídeo tour, drone, lifestyle) e pra remarketing (impactar de novo quem já visitou o site). Onde ele falha é na geração de lead frio em escala, que é justamente o que a maioria faz.' },
      { type: 'ul', items: [
        '**Lançamento:** use o Meta pra gerar cadastro de interesse antes da abertura de vendas. O público aceita preencher porque quer acesso antecipado.',
        '**Alto padrão:** vídeos bem produzidos no Instagram performam muito bem. O comprador de alto padrão se encanta pela experiência visual.',
        '**Remarketing:** mostre o imóvel de novo pra quem já visitou a página. Esse lead já conhece o produto e o custo de conversão é muito menor.',
      ] },
      { type: 'h2', text: 'A landing page faz toda a diferença' },
      { type: 'p', text: 'Mandar o lead pra página geral da imobiliária com 200 imóveis é o mesmo que levá-lo a um shopping e dizer "escolhe aí". A taxa de conversão despenca. Cada campanha precisa de uma página focada: o empreendimento, a faixa de preço, a região. Fotos boas, planta, localização no mapa, condições de pagamento e um formulário simples. Isso converte.' },
      { type: 'h2', text: 'Resumo' },
      { type: 'p', text: 'Pra imobiliária, o caminho é: Google pra capturar quem já busca (com palavras-chave específicas de tipo, bairro e faixa), Meta pra lançamento, alto padrão e remarketing, e landing page dedicada pra cada campanha. O indicador que importa não é quantidade de leads: é quantidade de visitas agendadas. Se quiser, analisamos a operação da sua imobiliária e mostramos onde está o desperdício.' },
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
