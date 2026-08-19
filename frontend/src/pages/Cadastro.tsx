// Trecho a ser atualizado no Cadastro.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; 
import { api } from '../services/api';
import './Cadastro.css';

export function Cadastro() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [curso, setCurso] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const DOMINIO_ALUNO = '@aluno.uepb.edu.br';

  const handleCriarConta = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      alert('As senhas não coincidem!');
      return;
    }

    if (!email.toLowerCase().endsWith(DOMINIO_ALUNO)) {
      alert(`Use seu e-mail institucional (${DOMINIO_ALUNO}) para se cadastrar.`);
      return;
    }

    try {
      // SUBSTITUIR O FETCH PELO AXIOS
      const resposta = await api.post('/auth/cadastrar', {
        nome,
        email,
        curso,
        senha,
        perfil: 'ALUNO'
      });

      alert('Conta criada com sucesso!');
      
      localStorage.clear();
      
      // O AXIOS GUARDA OS DADOS EM resposta.data
      login(resposta.data.token, resposta.data.usuario);
      navigate('/introducao-quiz');

    } catch (erro: any) {
      // TRATAMENTO DE ERRO DO AXIOS
      console.error('Erro ao conectar com a API:', erro);
      const mensagemErro = erro.response?.data?.error || 'Erro ao criar conta';
      alert(mensagemErro);
    }
  };

  return (
    <div className="cadastro-container">
      <div className="cadastro-content">
        
        {/* Botão de Voltar */}
        <button className="btn-voltar" onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Voltar
        </button>

        {/* Cabeçalho */}
        <div className="cadastro-header">
          <h1>Cadastro de Aluno</h1>
          <p>Use seu e-mail institucional para criar sua conta</p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleCriarConta} className="cadastro-form">
          <div className="input-group">
            <label htmlFor="nome">Nome completo</label>
            <input type="text" id="nome" placeholder="Ex: Maria Fernanda Souza" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="email">E-mail institucional</label>
            <input type="email" id="email" placeholder="nome@aluno.uepb.edu.br" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <span className="hint-text">Apenas e-mails @aluno.uepb.edu.br são aceitos</span>
          </div>

          <div className="input-group">
            <label htmlFor="curso">Curso</label>
            <input type="text" id="curso" placeholder="Ex: Ciência da Computação" value={curso} onChange={(e) => setCurso(e.target.value)} required />
          </div>

          <div className="input-group">
            <label htmlFor="senha">Senha</label>
            <input type="password" id="senha" placeholder="Mínimo 8 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={8} />
          </div>

          <div className="input-group">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <input type="password" id="confirmarSenha" placeholder="Repita a senha" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required minLength={8} />
          </div>

          <button type="submit" className="cadastro-button">
            Criar conta
          </button>
        </form>

        {/* Rodapé */}
        <div className="cadastro-footer">
          <p>
            Já tem conta?{' '}
            <span onClick={() => navigate('/')} className="link-destaque">
              Entrar
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}