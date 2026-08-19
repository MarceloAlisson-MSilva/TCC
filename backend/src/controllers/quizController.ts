import { Request, Response } from 'express';
import { getFluxoQuiz, getResultadoCaminho } from '../services/quizService';

export const listarFluxo = async (req: Request, res: Response) => {
  try {
    const perguntas = await getFluxoQuiz();
    return res.json(perguntas);
  } catch (error) {
    console.error('Erro ao buscar fluxo do quiz:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar o fluxo do quiz.' });
  }
};

export const buscarResultado = async (req: Request, res: Response) => {
  try {
    const caminhoFinalId = Number(req.params.caminhoFinalId);

    if (Number.isNaN(caminhoFinalId)) {
      return res.status(400).json({ erro: 'ID de caminho final inválido.' });
    }

    const resultado = await getResultadoCaminho(caminhoFinalId);

    if (!resultado) {
      return res.status(404).json({ erro: 'Caminho final não encontrado.' });
    }

    return res.json(resultado);
  } catch (error) {
    console.error('Erro ao buscar resultado do quiz:', error);
    return res.status(500).json({ erro: 'Erro interno ao buscar o resultado do quiz.' });
  }
};
