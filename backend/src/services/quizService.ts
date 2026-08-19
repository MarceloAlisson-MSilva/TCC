import { prisma } from '../config/prisma';
import { getRecommendedTeachers } from './teacherService';

export async function getFluxoQuiz() {
  return prisma.perguntasQuiz.findMany({
    orderBy: { ordem: 'asc' },
    select: {
      id: true,
      textoPergunta: true,
      ordem: true,
      opcoes: {
        select: {
          id: true,
          textoOpcao: true,
          proximaPerguntaId: true,
          caminhoFinalId: true,
        },
      },
    },
  });
}

// Ao chegar num nó final do fluxo, monta a tela de resultado: template sugerido,
// exemplos de temas e os professores compatíveis (com vaga disponível).
export async function getResultadoCaminho(caminhoFinalId: number) {
  const caminho = await prisma.caminhosFinaisFluxo.findUnique({
    where: { id: caminhoFinalId },
    select: {
      id: true,
      codigoRamificacao: true,
      template: {
        select: {
          nomeTemplate: true,
          descricao: true,
          arquivoUrl: true,
        },
      },
      exemplosTemas: {
        select: {
          id: true,
          textoExemploTema: true,
        },
      },
    },
  });

  if (!caminho) {
    return null;
  }

  const professores = await getRecommendedTeachers({ caminhoFinalIds: [caminhoFinalId] });

  return { caminho, professores };
}
