import { prisma } from '../config/prisma';

interface RecommendedFilterInput {
  caminhoFinalIds: number[]; // IDs das opções/ramificações finais atingidas pelo aluno no quiz
}

interface ProfessorRecomendado {
  id: number;
  nome: string;
  email: string;
  fotoUrl: string | null;
  biografia: string | null;
  vagasTotais: number;
  vagasOcupadas: number;
  vagasRestantes: number;
  afinidadePontos: number;
  especialidades: Array<{
    id: number;
    codigoRamificacao: string | null;
    template: {
      nomeTemplate: string | null;
    } | null;
  }>;
}

export async function getRecommendedTeachers({ caminhoFinalIds }: RecommendedFilterInput) {
  const professores = await prisma.usuario.findMany({
    where: {
      // 1. Deve ser um perfil de professor
      perfil: 'PROFESSOR',

      // 2. Filtro de Vagas Disponíveis na tabela relacionada DetalhesProfessor
      detalhesProfessor: {
        isNot: null,
        // 3. Garante que possui especialidade vinculada a pelo menos um dos caminhos do aluno
        is: {
          especialidades: {
            some: {
              caminhoFinalId: {
                in: caminhoFinalIds,
              },
            },
          },
        },
      },
    },
    // Traz os dados formatados do professor e suas especialidades
    select: {
      id: true,
      nome: true,
      email: true,
      curso: true,
      fotoUrl: true,
      detalhesProfessor: {
        select: {
          vagasTotais: true,
          vagasOcupadas: true,
          biografia: true,
          especialidades: {
            select: {
              caminhoFinal: {
                select: {
                  id: true,
                  codigoRamificacao: true,
                  template: {
                    select: {
                      nomeTemplate: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Mapeia e calcula a quantidade de vagas restantes e o nível de afinidade
  const resultadoFormatado = professores
    .map((prof) => {
      const detalhes = prof.detalhesProfessor!;
      const vagasRestantes = detalhes.vagasTotais - detalhes.vagasOcupadas;

      // Conta quantas especialidades do professor bateram com a seleção do aluno
      const especialidadesEmComum = detalhes.especialidades.filter((esp) =>
        caminhoFinalIds.includes(esp.caminhoFinal.id)
      ).length;

      return {
        id: prof.id,
        nome: prof.nome,
        email: prof.email,
        fotoUrl: prof.fotoUrl,
        biografia: detalhes.biografia,
        vagasTotais: detalhes.vagasTotais,
        vagasOcupadas: detalhes.vagasOcupadas,
        vagasRestantes,
        afinidadePontos: especialidadesEmComum,
        especialidades: detalhes.especialidades.map((e) => e.caminhoFinal),
      };
    })
    // Garante que ainda há vagas (vagasTotais > vagasOcupadas); feito aqui em vez do
    // "where" porque o Prisma não suporta comparar duas colunas de uma relação aninhada.
    .filter((prof) => prof.vagasRestantes > 0);

  // Ordena do professor com MAIOR afinidade para o de MENOR afinidade
  resultadoFormatado.sort((a, b) => b.afinidadePontos - a.afinidadePontos);

  return resultadoFormatado;
}