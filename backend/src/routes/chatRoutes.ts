import { Router } from 'express';
import { chatController } from '../controllers/chatController.js';
import { autenticar } from '../middlewares/authMiddleware.js';

const router = Router();

// Rota para buscar o histórico de mensagens de um Projeto (Sala de chat)
router.get('/projetos/:projetoId/mensagens', autenticar, chatController.buscarMensagens);

// Rota para enviar uma nova mensagem
router.post('/mensagens', autenticar, chatController.enviarMensagem);

export default router;