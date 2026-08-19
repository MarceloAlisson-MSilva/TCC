import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http'; 
import { Server } from 'socket.io'; 

dotenv.config();

import { authRoutes } from './routes/authRoutes';
import routes from './routes/apiRoutes'; 
import chatRoutes from './routes/chatRoutes';
import teacherRoutes from './routes/teacherRoutes';
import quizRoutes from './routes/quizRoutes';

const app = express();

// Em dev, cai no localhost do Vite se FRONTEND_URL não estiver definido no .env
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Suas rotas mantidas intactas
app.use('/api/auth', authRoutes);
app.use('/api', routes);
app.use('/api', chatRoutes);
app.use('/api', teacherRoutes);
app.use('/api', quizRoutes);

// 3. Criando o servidor HTTP acoplado ao Express
const server = http.createServer(app);

// 4. Configurando o Socket.io com permissão de CORS
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// 5. Eventos de conexão em tempo real do Chat
io.on('connection', (socket) => {
  console.log(`🟢 Usuário conectado via WebSocket: ${socket.id}`);

  // Quando o frontend pedir para entrar na sala do TCC
  socket.on('entrarProjeto', (projetoId) => {
    socket.join(`projeto_${projetoId}`);
    console.log(`📍 Usuário entrou na sala do projeto: ${projetoId}`);
  });

  // Quando receber uma mensagem, repassa para os outros na mesma sala
  socket.on('enviarMensagem', (mensagem) => {
    socket.to(`projeto_${mensagem.projetoId}`).emit('novaMensagem', mensagem);
  });

  socket.on('disconnect', () => {
    console.log(`🔴 Usuário desconectado: ${socket.id}`);
  });
});

// Hosts como Render/Railway definem PORT automaticamente; localmente cai na 3333
const PORT = Number(process.env.PORT) || 3333;

// 6. Mudamos de app.listen para server.listen!
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} com Socket.io integrado!`);
});