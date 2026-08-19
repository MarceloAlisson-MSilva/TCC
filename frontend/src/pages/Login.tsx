import { api } from '../services/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleEntrar = async (e: React.FormEvent) => {
    e.preventDefault(); 

    try {
    const resposta = await api.post('/auth/login', { email, senha });

    login(resposta.data.token, resposta.data.usuario);
    navigate('/home');
  } catch (erro: any) {
    const mensagemErro = erro.response?.data?.error || 'E-mail ou senha incorretos.';
    alert(mensagemErro);
  }
};

  return (
    <div className="login-container">
      <div className="login-box">
        
        {/* Logo */}
        <div className="login-logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="logo-text">TCC Guiado</span>
        </div>

        {/* Textos */}
        <div className="login-header">
          <h1>Bem-vindo!</h1>
          <p>Entre para continuar sua jornada do TCC.</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleEntrar} className="login-form">
          <div className="input-group">
            <label htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email"
              placeholder="aluno@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input 
              type="password" 
              id="senha"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <p>
            Ainda não tem conta?{' '}
            <span onClick={() => navigate('/cadastro')} className="link-destaque">
              Cadastre-se
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}