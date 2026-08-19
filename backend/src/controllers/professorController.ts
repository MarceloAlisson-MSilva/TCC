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