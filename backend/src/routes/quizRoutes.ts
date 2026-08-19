import { Router } from 'express';
import { listarFluxo, buscarResultado } from '../controllers/quizController';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/quiz/fluxo', autenticar, listarFluxo);
router.get('/quiz/resultado/:caminhoFinalId', autenticar, buscarResultado);

export default router;
