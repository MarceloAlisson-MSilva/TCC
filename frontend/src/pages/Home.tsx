import './Home.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { Sidebar } from '../components/Sidebar';
import { api } from '../services/api';

export function Home() {
  const [menuAberto, setMenuAberto] = useState(true);
  const navigate = useNavigate();

  // 1. Criando os estados para guardar os dados do banco e o status de carregamento
  const [professores, setProfessores] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  // 2. useEffect para ir no backend buscar os professores reais
  useEffect(() => {
    const buscarProfessores = async () => {
      try {
        // Usa a sua API já configurada para bater na rota que criamos
        const resposta = await api.get('/professors');
        setProfessores(resposta.data);
      } catch (erro) {
        console.error('Erro ao buscar professores da API:', erro);
      } finally {
        setCarregando(false); // Termina o carregamento, dando erro ou não
      }
    };

    buscarProfessores();
  }, []); // O array vazio garante que rode apenas 1x ao entrar na tela

  // 3. Função que salva o professor e envia o usuário para o chat (mantida igual)
  const handleIniciarConversa = async (professor: any) => {
  try {
    // 1. Envia a requisição pro backend salvar a relação na tabela ProjetosTCC.
    // O alunoId não precisa mais ser enviado: o backend identifica o aluno pelo
    // token (enviado automaticamente pelo interceptor do "api").
    const resposta = await api.post('/professores/vincular', {
      professorId: professor.id
    });

    // 2. Salva o projeto ativo (o Chat.tsx depende dessa chave para carregar a sala certa)
    localStorage.setItem('projetoAtivo', JSON.stringify({ id: resposta.data.projetoId }));
    // Mantém no localStorage só para acesso rápido aos dados visuais (foto, nome)
    localStorage.setItem('orientadorSelecionado', JSON.stringify(professor));
    alert("Orientador vinculado!");
    // 3. Vai para a tela de chat
    navigate('/chat');
  } catch (erro) {
    console.error("Erro na conexão:", erro);
    alert('Erro ao vincular orientador.');
  }
};

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
            <span className="breadcrumb">Professores</span>
          </div>
          <div className="topbar-right">
            <div className="bell-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </div>
          </div>
        </header>

        <main className="page-content">
          <div className="page-header">
            <h1>Professores Disponíveis</h1>
            <p>Escolha um orientador para te guiar no processo do TCC.</p>
          </div>

          <div className="search-bar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" placeholder="Buscar por nome, área ou especialidade..." />
          </div>

          {/* 4. Renderização Condicional: Mostra mensagem se estiver carregando, se não, mostra o Grid */}
          {carregando ? (
            <div style={{ textAlign: 'center', marginTop: '40px', color: '#6B7280' }}>
              <h2>Carregando professores...</h2>
            </div>
          ) : (
            <div className="professors-grid">
              {professores.map((prof) => (
                <div key={prof.id} className="professor-card">
                  <div className="card-header">
                    <div className={`avatar ${!prof.disponivel ? 'avatar-disabled' : ''}`}>
                      {prof.iniciais}
                    </div>
                    <div className="prof-info">
                      <h3>{prof.nome}</h3>
                      <p>{prof.departamento}</p>
                      <p>{prof.universidade}</p>
                    </div>
                    <span className={`status-badge ${prof.disponivel ? 'badge-available' : 'badge-unavailable'}`}>
                      {prof.disponivel ? 'Disponível' : 'Indisponível'}
                    </span>
                  </div>

                  <p className="prof-description">{prof.descricao}</p>

                  <div className="vagas-info">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span className={prof.vagasRestantes > 0 ? 'vagas-texto-ok' : 'vagas-texto-cheio'}>
                      {prof.vagasRestantes} de {prof.vagasTotais} {prof.vagasTotais === 1 ? 'vaga disponível' : 'vagas disponíveis'}
                    </span>
                  </div>

                  <div className="tags-container">
                    {/* Validação de segurança para garantir que .map só rode se tags for um array válido */}
                    {Array.isArray(prof.tags) && prof.tags.map((tag: string, index: number) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>

                  <button 
                    className={`btn-action ${!prof.disponivel ? 'btn-disabled' : ''}`} 
                    disabled={!prof.disponivel}
                    onClick={() => handleIniciarConversa(prof)}
                  >
                    {prof.disponivel ? 'Iniciar conversa' : 'Indisponível'}
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