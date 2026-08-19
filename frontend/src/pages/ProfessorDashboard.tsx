import './ProfessorDashboard.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

interface Orientando {
  projetoId: number;
  titulo: string;
  status: string;
  aluno: {
    id: number;
    nome: string;
    email: string;
    curso: string | null;
  };
  ultimaMensagem: string | null;
  ultimaMensagemEm: string | null;
}

interface DashboardData {
  vagasTotais: number;
  vagasOcupadas: number;
  orientandos: Orientando[];
}

// Traduz o enum StatusTCC do backend pra um texto amigável na tela
const STATUS_LABEL: Record<string, string> = {
  ONBOARDING: 'Em definição de tema',
  EM_ANDAMENTO: 'Em andamento',
  AGUARDANDO_AVALIACAO: 'Aguardando avaliação',
  CONCLUIDO: 'Concluído',
};

export function ProfessorDashboard() {
  const [menuAberto, setMenuAberto] = useState(true);
  const navigate = useNavigate();

  const [dados, setDados] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarOrientandos = async () => {
      try {
        const resposta = await api.get('/professor/orientandos');
        setDados(resposta.data);
      } catch (erro) {
        console.error('Erro ao buscar orientandos da API:', erro);
      } finally {
        setCarregando(false);
      }
    };

    buscarOrientandos();
  }, []);

  // Ao clicar num orientando, prepara o mesmo "localStorage" que o Chat.tsx
  // já espera (mesmo mecanismo usado do lado do aluno em Home.tsx), só que
  // aqui quem aparece do "outro lado" da conversa é o aluno, não o professor.
  const handleAbrirConversa = (orientando: Orientando) => {
    localStorage.setItem('projetoAtivo', JSON.stringify({ id: orientando.projetoId, tema: orientando.titulo }));
    localStorage.setItem(
      'orientadorSelecionado',
      JSON.stringify({
        nome: orientando.aluno.nome,
        departamento: orientando.aluno.curso || 'Aluno orientando',
        descricao: orientando.aluno.email,
      })
    );
    navigate('/chat');
  };

  const vagasRestantes = dados ? dados.vagasTotais - dados.vagasOcupadas : 0;

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={menuAberto} />

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <svg
              onClick={() => setMenuAberto(!menuAberto)}
              style={{ cursor: 'pointer' }}
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span className="breadcrumb">Meus Orientandos</span>
          </div>
        </header>

        <main className="page-content">
          <div className="page-header">
            <h1>Meus Orientandos</h1>
            <p>Acompanhe os alunos que você está orientando no TCC.</p>
          </div>

          {!carregando && dados && (
            <div className="vagas-resumo">
              <span className="vagas-numero">{dados.vagasOcupadas}/{dados.vagasTotais}</span>
              <span className="vagas-texto">vagas ocupadas</span>
              <span className="vagas-restantes">{vagasRestantes} {vagasRestantes === 1 ? 'vaga disponível' : 'vagas disponíveis'}</span>
            </div>
          )}

          {carregando ? (
            <div style={{ textAlign: 'center', marginTop: '40px', color: '#6B7280' }}>
              <h2>Carregando orientandos...</h2>
            </div>
          ) : dados && dados.orientandos.length === 0 ? (
            <div className="estado-vazio-orientandos">
              <h2>Nenhum orientando ainda</h2>
              <p>Assim que um aluno escolher você como orientador, ele aparece aqui.</p>
            </div>
          ) : (
            <div className="orientandos-grid">
              {dados?.orientandos.map((orientando) => (
                <div key={orientando.projetoId} className="orientando-card">
                  <div className="card-header">
                    <div className="avatar">
                      {orientando.aluno.nome.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="prof-info">
                      <h3>{orientando.aluno.nome}</h3>
                      <p>{orientando.aluno.curso || 'Curso não informado'}</p>
                    </div>
                    <span className="status-badge badge-status">
                      {STATUS_LABEL[orientando.status] || orientando.status}
                    </span>
                  </div>

                  <p className="prof-description">
                    <strong>Tema:</strong> {orientando.titulo}
                  </p>

                  {orientando.ultimaMensagem && (
                    <p className="ultima-mensagem">
                      "{orientando.ultimaMensagem}"
                    </p>
                  )}

                  <button className="btn-action" onClick={() => handleAbrirConversa(orientando)}>
                    Abrir conversa
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
