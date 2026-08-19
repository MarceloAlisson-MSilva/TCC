import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { RequestAutenticado } from '../middlewares/authMiddleware';

export const listarProfessores = async (req: Request, res: Response) => {
  try {
    const professores = await prisma.usuario.findMany({
      where: { perfil: 'PROFESSOR' },
      select: {
        id: true,
        nome: true,
        curso: true,
        detalhesProfessor: {
          select: {
            vagasTotais: true,
            vagasOcupadas: true,
            biografia: true,
            especialidades: {
              select: {
                caminhoFinal: {
                  select: {
                    template: { select: { nomeTemplate: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Só considera professores que já têm DetalhesProfessor cadastrado (vagas/especialidades)
    const resultado = professores
      .filter((prof) => prof.detalhesProfessor !== null)
      .map((prof) => {
        const detalhes = prof.detalhesProfessor!;
        const vagasRestantes = detalhes.vagasTotais - detalhes.vagasOcupadas;

        return {
          id: prof.id,
          nome: prof.nome,
          iniciais: prof.nome
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((parte) => parte[0])
            .join('')
            .toUpperCase(),
          // O schema atual não tem campo de departamento/universidade para professores;
          // usando "curso" como aproximação até esses campos existirem de fato.
          departamento: prof.curso ?? 'Não informado',
          descricao: detalhes.biografia ?? '',
          disponivel: vagasRestantes > 0,
          vagasTotais: detalhes.vagasTotais,
          vagasRestantes,
          tags: detalhes.especialidades.map((esp) => esp.caminhoFinal.template.nomeTemplate),
        };
      });

    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    return res.status(500).json({ erro: 'Erro interno ao listar professores.' });
  }
};

export const listarOrientandos = async (req: RequestAutenticado, res: Response) => {
  try {
    // O professor vem do token verificado pelo middleware "autenticar" — não do
    // body/params, pra ninguém conseguir ver a lista de orientandos de outro professor.
    const professorId = req.usuario!.id;

    // Busca as vagas do professor (pra mostrar "3/5 vagas ocupadas" no dashboard)
    const detalhes = await prisma.detalhesProfessor.findUnique({
      where: { professorId },
      select: { vagasTotais: true, vagasOcupadas: true },
    });

    // Busca os projetos de TCC vinculados a esse professor, com dados do aluno
    // e a última mensagem trocada (pra dar um preview tipo "última msg: ...")
    const projetos = await prisma.projetosTCC.findMany({
      where: { professorId },
      select: {
        id: true,
        titulo: true,
        status: true,
        criadoEm: true,
        aluno: {
          select: { id: true, nome: true, email: true, curso: true },
        },
        mensagens: {
          orderBy: { criadoEm: 'desc' },
          take: 1,
          select: { conteudo: true, criadoEm: true, autorId: true },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    const orientandos = projetos.map((projeto) => ({
      projetoId: projeto.id,
      titulo: projeto.titulo,
      status: projeto.status,
      aluno: projeto.aluno,
      ultimaMensagem: projeto.mensagens[0]?.conteudo ?? null,
      ultimaMensagemEm: projeto.mensagens[0]?.criadoEm ?? null,
    }));

    return res.json({
      vagasTotais: detalhes?.vagasTotais ?? 0,
      vagasOcupadas: detalhes?.vagasOcupadas ?? 0,
      orientandos,
    });
  } catch (error) {
    console.error('Erro ao listar orientandos:', error);
    return res.status(500).json({ erro: 'Erro interno ao listar orientandos.' });
  }
};

export const vincularOrientador = async (req: RequestAutenticado, res: Response) => {
  try {
    // O aluno vem do token verificado pelo middleware "autenticar" — não do body,
    // pra ninguém conseguir vincular um professor à conta de outro aluno.
    const alunoId = req.usuario!.id;
    const { professorId } = req.body;

    if (!professorId) {
      return res.status(400).json({ erro: 'ID do professor não fornecido.' });
    }

    // 1. Acha o projeto do aluno
    const projeto = await prisma.projetosTCC.findUnique({
      where: { alunoId } 
    });

    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado para este aluno.' });
    }

    // 2. Verifica se o professor ainda tem vagas
    const detalhesProf = await prisma.detalhesProfessor.findUnique({
      where: { professorId: Number(professorId) }
    });

    if (!detalhesProf || detalhesProf.vagasOcupadas >= detalhesProf.vagasTotais) {
      return res.status(400).json({ erro: 'Professor sem vagas disponíveis.' });
    }

    // 3. Atualiza o banco de dados (Usamos o $transaction para garantir que as duas coisas aconteçam juntas)
    await prisma.$transaction([
      // Vincula o professor ao projeto
      prisma.projetosTCC.update({
        where: { id: projeto.id },
        data: { professorId: Number(professorId) }
      }),
      // Aumenta o número de vagas ocupadas do professor
      prisma.detalhesProfessor.update({
        where: { professorId: Number(professorId) },
        data: { vagasOcupadas: detalhesProf.vagasOcupadas + 1 }
      })
    ]);

    // Retornamos os dados do projeto atualizados
    return res.status(200).json({ 
      sucesso: true, 
      mensagem: "Orientador vinculado com sucesso!",
      projetoId: projeto.id 
    });

  } catch (error) {
    console.error('Erro ao vincular orientador:', error);
    return res.status(500).json({ erro: 'Erro interno ao vincular orientador.' });
  }
};