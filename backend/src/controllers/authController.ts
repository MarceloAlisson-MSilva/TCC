// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma'; 

export class AuthController {  
  // 1. Rota de Cadastro (Registrar)
  static async registrar(req: Request, res: Response): Promise<any> {
    try {
      const { nome, email, senha, perfil, curso } = req.body;

      // Alunos só podem se cadastrar com o e-mail institucional
      const DOMINIO_ALUNO = '@aluno.uepb.edu.br';
      if (perfil === 'ALUNO' && !email?.toLowerCase().endsWith(DOMINIO_ALUNO)) {
        return res.status(400).json({ error: `Use seu e-mail institucional (${DOMINIO_ALUNO}) para se cadastrar.` });
      }

      // Verifica se o email já existe no banco
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { email },
      });

      if (usuarioExistente) {
        return res.status(400).json({ error: 'Este email já está cadastrado.' });
      }

      // Criptografa a senha (nunca salvamos a senha em texto puro!)
      const salt = await bcrypt.genSalt(10);
      const senhaCriptografada = await bcrypt.hash(senha, salt);

      // Cria o usuário no banco de dados
      const novoUsuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaCriptografada,
          perfil, // Espera-se "ALUNO" ou "PROFESSOR" (conforme seu Enum)
          curso,
        },
      });

      // Se for professor, já cria os detalhes vazios
      if (perfil === 'PROFESSOR') {
        await prisma.detalhesProfessor.create({
          data: {
            professorId: novoUsuario.id,
            vagasTotais: 5,
            vagasOcupadas: 0,
          }
        });
      }

      // Se for aluno, já cria o projeto de TCC vazio (usa os defaults do schema:
      // titulo "Tema em Definição", status ONBOARDING). É esse registro que
      // vincularOrientador espera encontrar depois pelo alunoId.
      if (perfil === 'ALUNO') {
        await prisma.projetosTCC.create({
          data: {
            alunoId: novoUsuario.id,
          }
        });
      }

      // Gera o Token JWT ("O Crachá")
      const token = jwt.sign(
        { id: novoUsuario.id, perfil: novoUsuario.perfil },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' } // Token vale por 1 dia
      );

      // Retorna o token e os dados básicos (sem a senha)
      return res.status(201).json({
        mensagem: 'Usuário criado com sucesso!',
        token,
        usuario: {
          id: novoUsuario.id,
          nome: novoUsuario.nome,
          email: novoUsuario.email,
          perfil: novoUsuario.perfil
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno no servidor ao cadastrar.' });
    }
  }

  // 2. Rota de Login (Entrar)
  static async login(req: Request, res: Response): Promise<any> {
    try {
      const { email, senha } = req.body;

      // Busca o usuário pelo email
      const usuario = await prisma.usuario.findUnique({
        where: { email },
      });

      if (!usuario) {
        return res.status(401).json({ error: 'Email ou senha inválidos.' });
      }

      // Compara a senha digitada com a senha criptografada do banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        return res.status(401).json({ error: 'Email ou senha inválidos.' });
      }

      // Se a senha bater, gera o Token JWT
      const token = jwt.sign(
        { id: usuario.id, perfil: usuario.perfil },
        process.env.JWT_SECRET as string,
        { expiresIn: '1d' }
      );

      return res.json({
        mensagem: 'Login realizado com sucesso!',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Erro interno no servidor ao fazer login.' });
    }
  }
}