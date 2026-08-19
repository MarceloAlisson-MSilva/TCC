import { Router } from 'express';
import { AuthController } from '../controllers/authController';

const authRoutes = Router();

authRoutes.post('/cadastrar', (req, res) => {
  console.log('🔥 ENTROU NA ROTA DE CADASTRO!');
  return AuthController.registrar(req, res);
});

authRoutes.post('/login', (req, res) => {
  console.log('🔥 ENTROU NA ROTA DE LOGIN!');
  return AuthController.login(req, res);
});

export { authRoutes };