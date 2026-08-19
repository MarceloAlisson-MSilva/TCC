import { prisma } from '../src/config/prisma.js';

// ---------------------------------------------------------------------------
// Dados extraídos do fluxograma (PDF) de definição de tipo de TCC.
// 4 "Tipos" de trabalho, cada um com sua própria subárvore de perguntas
// Sim/Não, terminando em um total de 26 templates (Template 1 a Template 26).
//
// OBS: o Template 27 ("previsão de evasão/desempenho") não tinha seta de
// entrada conectada no PDF original — fica de fora por enquanto, por decisão
// do responsável pelo projeto.
// As URLs de arquivo de cada template são placeholders (o PDF só trazia os
// rótulos "Template N", sem links reais).
// ---------------------------------------------------------------------------

interface TemplateDef {
  chave: string; // T1..T26
  metodologia: string;
  quandoUsar: string;
  exemplos: string[];
}

const templates: TemplateDef[] = [
  // ---- Tipo 1: Sistema Proposto ----
  {
    chave: 'T1',
    metodologia: 'Pesquisa aplicada + descritiva + qualitativa + desenvolvimento de artefato computacional.',
    quandoUsar: 'Quando o trabalho apresenta e descreve o sistema implementado.',
    exemplos: ['Descrever o desenvolvimento de um protótipo de sistema para organização de horários de atendimento docente.'],
  },
  {
    chave: 'T2',
    metodologia: 'Pesquisa aplicada + exploratória e descritiva + qualitativa + desenvolvimento de artefato + levantamento de requisitos.',
    quandoUsar: 'Quando o aluno precisa compreender o problema antes de estruturar a solução.',
    exemplos: ['Desenvolvimento de um sistema de apoio à coordenação do curso a partir do levantamento de requisitos com professores e estudantes.'],
  },
  {
    chave: 'T3',
    metodologia: 'Pesquisa aplicada + exploratória e descritiva + mista + desenvolvimento de artefato + avaliação com usuários (experimento).',
    quandoUsar: 'Quando o sistema é validado por percepção dos usuários e dados de uso.',
    exemplos: ['Desenvolvimento e avaliação de um aplicativo educacional para apoio ao ensino de programação introdutória, testando por meio de um experimento controlado o desempenho dos estudantes.'],
  },
  {
    chave: 'T4',
    metodologia: 'Pesquisa aplicada + descritiva + mista + desenvolvimento de artefato + avaliação de usabilidade (survey).',
    quandoUsar: 'Quando o foco está na usabilidade da solução.',
    exemplos: ['Desenvolvimento e avaliação de usabilidade de um sistema de gerenciamento de eventos científicos.'],
  },
  {
    chave: 'T5',
    metodologia: 'Pesquisa aplicada + experimental + quantitativa + desenvolvimento de artefato + testes de desempenho.',
    quandoUsar: 'Quando a evidência principal vem de métricas técnicas.',
    exemplos: ['Desenvolvimento de um sistema de reservas com análise de tempo de resposta sob diferentes cargas de acesso.'],
  },
  {
    chave: 'T6',
    metodologia: 'Pesquisa aplicada + descritiva + qualitativa ou mista + desenvolvimento de artefato + estudo de caso.',
    quandoUsar: 'Quando o sistema é observado em uso real.',
    exemplos: ['Desenvolvimento e aplicação de uma plataforma de gerenciamento de solicitações em uma coordenação de curso, aplicada em um contexto real.'],
  },

  // ---- Tipo 2: Modelo ou Abordagem Proposta ----
  {
    chave: 'T7',
    metodologia: 'Pesquisa aplicada + exploratória e descritiva + qualitativa + desenvolvimento de abordagem conceitual.',
    quandoUsar: 'Usar quando a contribuição principal é a própria estrutura da solução proposta.',
    exemplos: ['Proposta de uma arquitetura conceitual para integração entre sistemas acadêmicos e plataformas de eventos.'],
  },
  {
    chave: 'T8',
    metodologia: 'Pesquisa aplicada + experimental e comparativa + quantitativa + comparação com baseline.',
    quandoUsar: 'Usar quando a proposta é comparada com outra abordagem.',
    exemplos: ['Proposta de um algoritmo para alocação de salas, comparando a uma estratégia manual.'],
  },
  {
    chave: 'T9',
    metodologia: 'Pesquisa aplicada + experimental + quantitativa + experimento computacional.',
    quandoUsar: 'Usar quando a proposta é avaliada por desempenho técnico.',
    exemplos: ['Proposta de um mecanismo de priorização automática de chamados acadêmicos, com avaliação por tempo de processamento e taxa de acerto.'],
  },
  {
    chave: 'T10',
    metodologia: 'Pesquisa aplicada + exploratória e descritiva + mista + prova de conceito + avaliação técnica.',
    quandoUsar: 'Usar quando a proposta é demonstrada de forma prática, mas não apenas por métricas.',
    exemplos: ['Proposta de um pipeline para processamento e organização automática de documentos acadêmicos, com prova de conceito.'],
  },
  {
    chave: 'T11',
    metodologia: 'Pesquisa aplicada + experimental + quantitativa ou mista + testes técnicos, simulação ou validação.',
    quandoUsar: 'Usar quando a solução exige validação técnica especializada.',
    exemplos: ['Proposta de um mecanismo de autenticação para APIs acadêmicas, com validação por testes de segurança.'],
  },
  {
    chave: 'T12',
    metodologia: 'Pesquisa aplicada + exploratória e descritiva + qualitativa + validação por especialistas.',
    quandoUsar: 'Usar quando a qualidade da proposta é julgada por especialistas.',
    exemplos: ['Proposta de um processo de análise de requisitos para sistemas educacionais, validado por especialistas.'],
  },

  // ---- Tipo 3: Objeto de Análise ou Avaliação ----
  {
    chave: 'T13',
    metodologia: 'Pesquisa aplicada + comparativa e experimental + quantitativa + benchmark ou testes controlados.',
    quandoUsar: 'Quando a comparação usa métricas objetivas ou testes técnicos.',
    exemplos: [
      'Comparação de desempenho entre bancos SQL e NoSQL.',
      'Comparação de tempo de execução entre algoritmos.',
      'Benchmark entre frameworks web.',
    ],
  },
  {
    chave: 'T14',
    metodologia: 'Pesquisa aplicada + comparativa e descritiva + qualitativa, quantitativa ou mista + análise comparativa.',
    quandoUsar: 'Quando há comparação organizada por critérios, mas sem experimento controlado.',
    exemplos: [
      'Análise comparativa entre React e Vue.',
      'Comparação entre ferramentas de gestão de projetos.',
      'Comparação entre plataformas educacionais.',
    ],
  },
  {
    chave: 'T15',
    metodologia: 'Pesquisa aplicada + descritiva + mista + avaliação com usuários, survey ou questionário.',
    quandoUsar: 'Quando a análise considera a experiência, percepção ou opinião dos usuários.',
    exemplos: [
      'Avaliação da percepção de estudantes sobre uma plataforma de aprendizagem.',
      'Avaliação da satisfação de usuários com um sistema acadêmico.',
      'Avaliação da facilidade de uso percebida de uma ferramenta.',
      'Survey sobre aceitação de uma tecnologia.',
    ],
  },
  {
    chave: 'T16',
    metodologia: 'Pesquisa aplicada + descritiva + qualitativa ou mista + checklist, inspeção ou avaliação técnica.',
    quandoUsar: 'Quando o objeto é examinado com critérios definidos.',
    exemplos: [
      'Avaliação de acessibilidade com checklist WCAG.',
      'Avaliação de usabilidade por heurísticas de Nielsen.',
      'Inspeção de interface.',
    ],
  },
  {
    chave: 'T17',
    metodologia: 'Pesquisa aplicada + experimental ou descritiva + quantitativa ou mista + testes técnicos ou análise de vulnerabilidades.',
    quandoUsar: 'Quando o foco está em segurança, desempenho ou análise técnica especializada.',
    exemplos: [
      'Avaliação de segurança de uma API.',
      'Análise de vulnerabilidades em uma aplicação web.',
      'Teste de autenticação e autorização.',
    ],
  },
  {
    chave: 'T18',
    metodologia: 'Pesquisa aplicada + descritiva + qualitativa + pesquisa documental.',
    quandoUsar: 'Quando a análise se baseia em documentos ou registros já existentes.',
    exemplos: [
      'Análise documental de políticas de segurança da informação.',
      'Análise de documentação técnica de uma API.',
      'Análise de registros de uso de um sistema.',
    ],
  },
  {
    chave: 'T19',
    metodologia: 'Pesquisa aplicada + descritiva + qualitativa ou mista + estudo de caso.',
    quandoUsar: 'Quando a tecnologia, sistema ou ferramenta é analisada em uso real.',
    exemplos: [
      'Estudo de caso sobre o uso de uma plataforma em uma coordenação de curso.',
      'Análise do uso de uma ferramenta em uma disciplina.',
      'Avaliação da adoção de um sistema em uma instituição.',
    ],
  },

  // ---- Tipo 4: Base de Dados e Abordagem Computacional ----
  {
    chave: 'T20',
    metodologia: 'Pesquisa aplicada + experimental e comparativa + quantitativa + comparação por métricas.',
    quandoUsar: 'Quando o foco está em comparar modelos computacionais.',
    exemplos: ['Comparação entre Random Forest, SVM e Redes Neurais na predição de evasão discente.'],
  },
  {
    chave: 'T21',
    metodologia: 'Pesquisa aplicada + experimental + quantitativa + treinamento, validação e teste de modelos.',
    quandoUsar: 'Quando o trabalho treina modelos e avalia resultados quantitativamente.',
    exemplos: ['Classificação de imagens reais e sintéticas utilizando modelos de aprendizado de máquina.'],
  },
  {
    chave: 'T22',
    metodologia: 'Pesquisa aplicada + experimental e descritiva + mista + métricas quantitativas + interpretação qualitativa dos erros.',
    quandoUsar: 'Quando o trabalho combina resultados numéricos com interpretação dos erros, padrões, limitações ou comportamento dos modelos.',
    exemplos: ['Análise de erros em modelos de classificação de sentimentos em comentários de estudantes.'],
  },
  {
    chave: 'T23',
    metodologia: 'Pesquisa aplicada + exploratória e descritiva + quantitativa + análise exploratória de dados.',
    quandoUsar: 'Quando o foco é compreender os dados e seus padrões, sem necessariamente treinar modelos preditivos.',
    exemplos: ['Análise exploratória de dados acadêmicos para identificação de padrões de desempenho discente.'],
  },
  {
    chave: 'T24',
    metodologia: 'Pesquisa aplicada + descritiva + quantitativa + pesquisa documental + análise de dados.',
    quandoUsar: 'Quando a fonte principal são bases públicas, documentos, registros institucionais, logs, relatórios ou dados já existentes.',
    exemplos: ['Análise de dados públicos sobre matrículas e evasão em cursos de Computação.'],
  },
  {
    chave: 'T25',
    metodologia: 'Pesquisa aplicada + descritiva e quantitativa ou mista + construção de dataset + caracterização dos dados.',
    quandoUsar: 'Quando o trabalho organiza, constrói, limpa, categoriza, rotula ou caracteriza uma base de dados.',
    exemplos: ['Construção e caracterização de uma base de imagens para detecção de defeitos em equipamentos laboratoriais.'],
  },
  {
    chave: 'T26',
    metodologia: 'Pesquisa aplicada + experimental + quantitativa ou mista + pré-processamento especializado + avaliação por métricas.',
    quandoUsar: 'Quando há tratamento técnico dos dados antes da avaliação, como pré-processamento de texto, imagens, áudio, sinais, limpeza, normalização, extração de características ou transformação dos dados.',
    exemplos: ['Classificação de textos acadêmicos com técnicas de pré-processamento textual e modelos de aprendizado de máquina.'],
  },
];

// ---------------------------------------------------------------------------
// Árvore de perguntas (35 perguntas Sim/Não). Cada alvo aponta para outra
// pergunta, para um caminho final (template) ou para "fim" (sem template —
// tratado no frontend com uma mensagem genérica de orientação).
// ---------------------------------------------------------------------------

type Alvo = { tipo: 'pergunta'; chave: string } | { tipo: 'caminho'; chave: string } | { tipo: 'fim' };

interface PerguntaDef {
  chave: string;
  ordem: number;
  texto: string;
  sim: Alvo;
  nao: Alvo;
}

const pergunta = (chave: string): Alvo => ({ tipo: 'pergunta', chave });
const caminho = (chave: string): Alvo => ({ tipo: 'caminho', chave });
const fim: Alvo = { tipo: 'fim' };

const perguntas: PerguntaDef[] = [
  { chave: 'root', ordem: 1, texto: 'A ideia tem uma contribuição computacional clara e mensurável?', sim: pergunta('tipo1_entry'), nao: fim },

  { chave: 'tipo1_entry', ordem: 2, texto: 'O aluno pretende CONSTRUIR uma solução computacional funcional?', sim: pergunta('t1_q1'), nao: pergunta('tipo2_entry') },
  { chave: 't1_q1', ordem: 3, texto: 'O foco é apenas descrever o sistema e suas funcionalidades?', sim: caminho('T1'), nao: pergunta('t1_q2') },
  { chave: 't1_q2', ordem: 4, texto: 'Antes do desenvolvimento, será necessário compreender melhor um problema, contexto ou necessidade dos usuários?', sim: caminho('T2'), nao: pergunta('t1_q3') },
  { chave: 't1_q3', ordem: 5, texto: 'O sistema será avaliado com usuários?', sim: caminho('T3'), nao: pergunta('t1_q4') },
  { chave: 't1_q4', ordem: 6, texto: 'A avaliação principal será de usabilidade?', sim: caminho('T4'), nao: pergunta('t1_q5') },
  { chave: 't1_q5', ordem: 7, texto: 'O objetivo é medir desempenho técnico do sistema?', sim: caminho('T5'), nao: pergunta('t1_q6') },
  { chave: 't1_q6', ordem: 8, texto: 'O sistema será aplicado ou observado em um contexto real?', sim: caminho('T6'), nao: fim },

  { chave: 'tipo2_entry', ordem: 9, texto: 'O aluno pretende PROPOR uma solução técnica, método, modelo, algoritmo, arquitetura ou abordagem?', sim: pergunta('t2_q1'), nao: pergunta('tipo3_entry') },
  { chave: 't2_q1', ordem: 10, texto: 'A proposta é principalmente conceitual, organizacional ou arquitetural?', sim: caminho('T7'), nao: pergunta('t2_q2') },
  { chave: 't2_q2', ordem: 11, texto: 'A proposta será testada em experimento computacional com métricas?', sim: pergunta('t2_q2b'), nao: pergunta('t2_q3') },
  { chave: 't2_q2b', ordem: 12, texto: 'Haverá comparação com uma abordagem de referência (baseline)?', sim: caminho('T8'), nao: caminho('T9') },
  { chave: 't2_q3', ordem: 13, texto: 'A proposta será demonstrada por prova de conceito com avaliação técnica?', sim: caminho('T10'), nao: pergunta('t2_q4') },
  { chave: 't2_q4', ordem: 14, texto: 'A proposta envolve testes técnicos, simulação ou validação de mecanismo especializado, por exemplo, segurança?', sim: caminho('T11'), nao: pergunta('t2_q5') },
  { chave: 't2_q5', ordem: 15, texto: 'A proposta será analisada ou validada por especialistas?', sim: caminho('T12'), nao: fim },

  { chave: 'tipo3_entry', ordem: 16, texto: 'O aluno pretende AVALIAR, ANALISAR ou COMPARAR algo que já existe?', sim: pergunta('t3_q1'), nao: pergunta('tipo4_entry') },
  { chave: 't3_q1', ordem: 17, texto: 'O foco principal é COMPARAR dois ou mais objetos computacionais?', sim: pergunta('t3_q1b'), nao: pergunta('t3_q2') },
  { chave: 't3_q1b', ordem: 18, texto: 'A comparação será baseada em métricas, benchmarks ou testes controlados?', sim: caminho('T13'), nao: pergunta('t3_q1c') },
  { chave: 't3_q1c', ordem: 19, texto: 'A comparação será feita por critérios definidos, mesmo sem benchmark?', sim: caminho('T14'), nao: fim },
  { chave: 't3_q2', ordem: 20, texto: 'O foco principal é AVALIAR A EXPERIÊNCIA OU PERCEPÇÃO DE USUÁRIOS?', sim: pergunta('t3_q2b'), nao: pergunta('t3_q3') },
  { chave: 't3_q2b', ordem: 21, texto: 'A avaliação será feita com usuários via questionário, survey, entrevista, formulário ou roteiro de tarefas?', sim: caminho('T15'), nao: fim },
  { chave: 't3_q3', ordem: 22, texto: 'O foco principal é AVALIAR O OBJETO POR CRITÉRIOS TÉCNICOS?', sim: pergunta('t3_q3b'), nao: pergunta('t3_q4') },
  { chave: 't3_q3b', ordem: 23, texto: 'A avaliação será feita por checklist, inspeção técnica, heurísticas ou critérios de qualidade?', sim: caminho('T16'), nao: pergunta('t3_q3c') },
  { chave: 't3_q3c', ordem: 24, texto: 'A avaliação será baseada em testes técnicos, segurança, vulnerabilidades ou desempenho?', sim: caminho('T17'), nao: fim },
  { chave: 't3_q4', ordem: 25, texto: 'O foco principal é ANALISAR DOCUMENTOS, NORMAS, REGISTROS OU DOCUMENTAÇÃO?', sim: caminho('T18'), nao: pergunta('t3_q5') },
  { chave: 't3_q5', ordem: 26, texto: 'O foco principal é OBSERVAR O OBJETO EM UM CONTEXTO REAL DE USO?', sim: caminho('T19'), nao: fim },

  { chave: 'tipo4_entry', ordem: 27, texto: 'O aluno pretende trabalhar com DADOS, IA, mineração, classificação, predição, detecção, PLN, visão computacional ou análise de dados?', sim: pergunta('t4_q1'), nao: fim },
  // "Não" aqui pularia pro caso especial de previsão de evasão (Template 27) — deixado de fora por ora.
  { chave: 't4_q1', ordem: 28, texto: 'O foco principal é treinar e avaliar modelos computacionais?', sim: pergunta('t4_q1b'), nao: fim },
  { chave: 't4_q1b', ordem: 29, texto: 'Haverá comparação entre modelos por métricas?', sim: caminho('T20'), nao: pergunta('t4_q1c') },
  { chave: 't4_q1c', ordem: 30, texto: 'O objetivo principal é classificação, predição ou detecção com avaliação quantitativa?', sim: caminho('T21'), nao: pergunta('t4_q1d') },
  { chave: 't4_q1d', ordem: 31, texto: 'Além das métricas, haverá interpretação qualitativa dos erros ou padrões?', sim: caminho('T22'), nao: pergunta('t4_q1e') },
  { chave: 't4_q1e', ordem: 32, texto: 'O objetivo principal é fazer análise exploratória e descritiva dos dados?', sim: caminho('T23'), nao: pergunta('t4_q1f') },
  { chave: 't4_q1f', ordem: 33, texto: 'A pesquisa usa base pública, registros institucionais ou documentação como fonte de dados?', sim: caminho('T24'), nao: pergunta('t4_q1g') },
  { chave: 't4_q1g', ordem: 34, texto: 'O trabalho envolve construir, organizar ou caracterizar um dataset?', sim: caminho('T25'), nao: pergunta('t4_q1h') },
  { chave: 't4_q1h', ordem: 35, texto: 'O trabalho envolve pré-processamento textual, imagens ou outro tratamento especializado com avaliação por métricas?', sim: caminho('T26'), nao: fim },
];

// ---------------------------------------------------------------------------
// Professores fictícios distribuídos pelos 4 Tipos, cobrindo os 26 caminhos.
// ---------------------------------------------------------------------------

interface ProfessorDef {
  nome: string;
  email: string;
  curso: string;
  vagasTotais: number;
  vagasOcupadas: number;
  biografia: string;
  especialidades: string[]; // chaves dos templates (T1..T26)
}

const professores: ProfessorDef[] = [
  {
    nome: 'Prof. Dr. Ricardo',
    email: 'ricardo@servido.uepb.edu.br',
    curso: 'Ciência Da Computação',
    vagasTotais: 5,
    vagasOcupadas: 2,
    biografia: 'Doutor em Ciência da Computação com 15 anos de experiência em orientação de TCC e desenvolvimento de sistemas.',
    especialidades: ['T1', 'T2', 'T3'],
  },
  {
    nome: 'Profa. Dra. Mikaele',
    email: 'mikaele@servido.uepb.edu.br',
    curso: 'Ciência Da Computação',
    vagasTotais: 3,
    vagasOcupadas: 1,
    biografia: 'Engenheira de Computação com foco em pesquisa aplicada, propostas de arquitetura e inovação tecnológica.',
    especialidades: ['T7', 'T8', 'T10'],
  },
  {
    nome: 'Prof. Dr. Jucelio',
    email: 'jucelio@servido.uepb.edu.br',
    curso: 'Ciência da Computação',
    vagasTotais: 4,
    vagasOcupadas: 0,
    biografia: 'Pesquisador com experiência em avaliação comparativa de sistemas, usabilidade e análise documental.',
    especialidades: ['T13', 'T15', 'T18'],
  },
  {
    nome: 'Prof. Dr. Pablo',
    email: 'pablo@servido.uepb.edu.br',
    curso: 'Ciência da Computação',
    vagasTotais: 6,
    vagasOcupadas: 3,
    biografia: 'Especialista em engenharia de software, usabilidade e testes de desempenho de sistemas.',
    especialidades: ['T21', 'T23', 'T26'],
  },
  {
    nome: 'Profa. Dra. Rosangela',
    email: 'rosangela@servido.uepb.edu.br',
    curso: 'Ciência da computação',
    vagasTotais: 4,
    vagasOcupadas: 1,
    biografia: 'Doutora em pedagogia',
    especialidades: ['T4', 'T5', 'T6'],
  },
  {
    nome: 'Prof. Dr. Haigo',
    email: 'hiago@servido.uepb.edu.br',
    curso: 'Ciência da Computação',
    vagasTotais: 5,
    vagasOcupadas: 2,
    biografia: 'Arquiteto de software e lider de projetos',
    especialidades: ['T9', 'T11', 'T12'],
  },
  {
    nome: 'Prof. Dr. Francisco',
    email: 'francisco@servido.uepb.edu.br',
    curso: 'Ciência da computação',
    vagasTotais: 4,
    vagasOcupadas: 0,
    biografia: 'Atua com avaliação técnica de sistemas, redes de computadores, segurança da informação e estudos de caso em contexto real.',
    especialidades: ['T14', 'T16', 'T17', 'T19'],
  },
  {
    nome: 'Profa. Dra. Regina',
    email: 'regina@servido.uepb.edu.br',
    curso: 'Ciência da Computação',
    vagasTotais: 5,
    vagasOcupadas: 1,
    biografia: 'Pesquisadora banco de dados, com foco em comparação de modelos, análise exploratória e construção de datasets.',
    especialidades: ['T20', 'T22', 'T24', 'T25'],
  },
];

async function main() {
  console.log('🔄 Limpando dados antigos do quiz...');
  // Limpeza em ordem reversa de chaves estrangeiras para evitar erros de constraint
  await prisma.respostasAlunoQuiz.deleteMany({});
  await prisma.opcoesQuiz.deleteMany({});
  await prisma.perguntasQuiz.deleteMany({});
  await prisma.exemplosTemas.deleteMany({});
  await prisma.caminhosFinaisFluxo.deleteMany({});
  await prisma.templatesTCC.deleteMany({});

  console.log('👨‍🏫 Limpando professores antigos...');
  // Só limpa contas de professor — contas de aluno (e seus ProjetosTCC) não são mexidas aqui.
  await prisma.detalhesProfessor.deleteMany({});
  await prisma.usuario.deleteMany({ where: { perfil: 'PROFESSOR' } });

  console.log('📄 Cadastrando templates e caminhos finais (26 templates)...');
  const caminhoIds: Record<string, number> = {};

  for (const t of templates) {
    const template = await prisma.templatesTCC.create({
      data: {
        nomeTemplate: `Template ${t.chave.replace('T', '')}`,
        descricao: `${t.metodologia} Quando usar: ${t.quandoUsar}`,
        // Placeholder — o PDF de origem só trazia o rótulo do template, sem link real.
        arquivoUrl: `https://exemplo.com/templates/template-${t.chave.replace('T', '')}.docx`,
      },
    });

    const caminhoCriado = await prisma.caminhosFinaisFluxo.create({
      data: {
        codigoRamificacao: `TEMPLATE_${t.chave.replace('T', '')}`,
        templateId: template.id,
        exemplosTemas: {
          create: t.exemplos.map((texto) => ({ textoExemploTema: texto })),
        },
      },
    });

    caminhoIds[t.chave] = caminhoCriado.id;
  }

  console.log('❓ Criando as 35 perguntas da árvore de decisão...');
  const perguntaIds: Record<string, number> = {};

  for (const p of perguntas) {
    const criada = await prisma.perguntasQuiz.create({
      data: {
        textoPergunta: p.texto,
        ordem: p.ordem,
      },
    });
    perguntaIds[p.chave] = criada.id;
  }

  console.log('🔗 Interconectando as opções (Sim/Não) de cada pergunta...');

  const resolverAlvo = (alvo: Alvo) => {
    if (alvo.tipo === 'pergunta') return { proximaPerguntaId: perguntaIds[alvo.chave] };
    if (alvo.tipo === 'caminho') return { caminhoFinalId: caminhoIds[alvo.chave] };
    return {}; // "fim": sem próxima pergunta nem caminho final — tratado no frontend
  };

  for (const p of perguntas) {
    await prisma.opcoesQuiz.create({
      data: {
        perguntaId: perguntaIds[p.chave],
        textoOpcao: 'Sim',
        ...resolverAlvo(p.sim),
      },
    });
    await prisma.opcoesQuiz.create({
      data: {
        perguntaId: perguntaIds[p.chave],
        textoOpcao: 'Não',
        ...resolverAlvo(p.nao),
      },
    });
  }

  console.log('👨‍🏫 Cadastrando professores de teste...');

  for (const p of professores) {
    const usuarioCriado = await prisma.usuario.create({
      data: {
        nome: p.nome,
        email: p.email,
        senha: '123', // Em dev/testes
        perfil: 'PROFESSOR',
        curso: p.curso,
        detalhesProfessor: {
          create: {
            vagasTotais: p.vagasTotais,
            vagasOcupadas: p.vagasOcupadas,
            biografia: p.biografia,
          },
        },
      },
      include: { detalhesProfessor: true },
    });

    // EspecialidadeProfessor.professorId referencia DetalhesProfessor.id (não Usuario.id)
    for (const chaveTemplate of p.especialidades) {
      await prisma.especialidadeProfessor.create({
        data: {
          professorId: usuarioCriado.detalhesProfessor!.id,
          caminhoFinalId: caminhoIds[chaveTemplate],
        },
      });
    }
  }

  console.log('🌱 Seed concluído com sucesso! Banco populado.');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante a execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
