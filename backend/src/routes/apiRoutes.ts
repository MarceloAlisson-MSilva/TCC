import { Router } from 'express';
import { listarProfessores, vincularOrientador } from '../controllers/professorController';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/professors', listarProfessores);
router.post('/professores/vincular', autenticar, vincularOrientador);

export default router;