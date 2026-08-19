import { Router } from 'express';
import { listarProfessores, vincularOrientador, listarOrientandos } from '../controllers/professorController';
import { autenticar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/professors', listarProfessores);
router.post('/professores/vincular', autenticar, vincularOrientador);
router.get('/professor/orientandos', autenticar, listarOrientandos);

export default router;