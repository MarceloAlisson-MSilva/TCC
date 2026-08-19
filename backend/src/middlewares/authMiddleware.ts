import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Formato do payload que o AuthController.login/registrar coloca no token
interface TokenPayload {
  id: number;
  perfil: 'ALUNO' | 'PROFESSOR';
}

// Estende o Request do Express para carregar o usuário autenticado
export interface RequestAutenticado extends Request {
  usuario?: TokenPayload;
}

// Valida o header "Authorization: Bearer <token>" e injeta req.usuario.
// Rotas privadas devem usar req.usuario.id em vez de confiar em IDs vindos do body.
export function autenticar(req: RequestAutenticado, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Token não fornecido.' });
  }

  const [tipo, token] = authHeader.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Formato de token inválido.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
    req.usuario = { id: payload.id, perfil: payload.perfil };
    return next();
  } catch (error) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}
