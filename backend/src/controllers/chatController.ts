import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { RequestAutenticado } from '../middlewares/authMiddleware';

export const chatController = {
  // Busca o histórico de mensagens de um projeto específico (Sala de chat)
  async buscarMensagens(req: Request, res: Response) {
    try {
      // Agora pegamos o projetoId da URL em vez de usuarioId/professorId
      const { projetoId } = req.params;

      const mensagens = await prisma.mensagem.findMany({
        where: {
          projetoId: Number(projetoId),
        },
        include: {
          // Traz os dados de quem enviou para o frontend renderizar corretamente
          autor: {
            select: {
              nome: true,
              perfil: true, 
            }
          }
        },
        orderBy: {
          criadoEm: 'asc', // Corresponde ao map("criado_em") do novo banco
        },
      });

      return res.json(mensagens);
    } catch (erro) {
      console.error('Erro ao buscar mensagens:', erro);
      return res.status(500).json({ erro: 'Erro ao buscar mensagens' });
    }
  },

  // Salva uma nova mensagem (texto, arquivo ou áudio) vinculada ao projeto
  async enviarMensagem(req: RequestAutenticado, res: Response) {
    try {
      // O autor vem do token verificado pelo middleware "autenticar" — não do body,
      // pra ninguém conseguir enviar mensagem se passando por outro usuário.
      const autorId = req.usuario!.id;
      const { projetoId, conteudo, tipo } = req.body;

      // Validação simples de campos obrigatórios
      if (!projetoId || !conteudo) {
        return res.status(400).json({ erro: 'Dados incompletos para enviar mensagem' });
      }

      const novaMensagem = await prisma.mensagem.create({
        data: {
          projetoId: Number(projetoId),
          autorId,
          conteudo,
          tipo: tipo || 'TEXTO', // Utilizando o padrão do Enum em maiúsculo
        },
        include: {
          // Retorna o autor logo após criar para emitir via Socket.io no frontend
          autor: {
            select: {
              nome: true,
              perfil: true,
            }
          }
        }
      });

      return res.status(201).json(novaMensagem);
    } catch (erro) {
      console.error('Erro ao enviar mensagem:', erro);
      return res.status(500).json({ erro: 'Erro ao enviar mensagem' });
    }
  },
};