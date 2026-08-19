import { Router } from 'express';
import { getRecommendedTeachers } from '../services/teacherService';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

// POST /api/professores/recomendados
router.post('/professores/recomendados', autenticar, async (req, res) => {
  try {
    const { caminhoFinalIds } = req.body;

    if (!caminhoFinalIds || !Array.isArray(caminhoFinalIds) || caminhoFinalIds.length === 0) {
      return res.status(400).json({
        error: 'É necessário fornecer uma lista válida de IDs de caminhos finais (caminhoFinalIds).',
      });
    }

    const professoresRecomendados = await getRecommendedTeachers({ caminhoFinalIds });

    return res.json(professoresRecomendados);
  } catch (error) {
    console.error('Erro ao buscar professores recomendados:', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao processar a recomendação.' });
  }
});

export default router;