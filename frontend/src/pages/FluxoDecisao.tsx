import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import './FluxoDecisao.css';

interface OpcaoQuiz {
  id: number;
  textoOpcao: string;
  proximaPerguntaId: number | null;
  caminhoFinalId: number | null;
}

interface PerguntaQuiz {
  id: number;
  textoPergunta: string;
  ordem: number;
  opcoes: OpcaoQuiz[];
}

interface ProfessorRecomendado {
  id: number;
  nome: string;
  biografia: string | null;
  vagasTotais: number;
  vagasRestantes: number;
}

interface ResultadoQuiz {
  caminho: {
    id: number;
    codigoRamificacao: string;
    template: {
      nomeTemplate: string;
      descricao: string | null;
      arquivoUrl: string;
    };
    exemplosTemas: { id: number; textoExemploTema: string }[];
  };
  professores: ProfessorRecomendado[];
}

// Transforma "DEV_WEB_IA" em "Dev Web IA", só para exibição — o código em si vem do banco
function formatarCodigoRamificacao(codigo: string) {
  return codigo
    .toLowerCase()
    .split('_')
    .map((parte) => parte.charAt(0).toUpperCase() + parte.slice(1))
    .join(' ');
}

export function FluxoDecisao() {
  const navigate = useNavigate();

  // Árvore de perguntas vinda do banco (carregada uma única vez)
  const [perguntas, setPerguntas] = useState<PerguntaQuiz[]>([]);
  const [carregandoFluxo, setCarregandoFluxo] = useState(true);
  const [erroFluxo, setErroFluxo] = useState<string | null>(null);

  // Estados de Controle do Fluxo
  const [perguntaAtualId, setPerguntaAtualId] = useState<number | null>(null);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState<number | null>(null);
  const [historico, setHistorico] = useState<number[]>([]); // Para o botão "Voltar"

  // Busca o resultado salvo no navegador (se existir)
  const [resultadoFinalId, setResultadoFinalId] = useState<number | null>(() => {
    const salvo = localStorage.getItem('resultadoFluxoTCC');
    return salvo ? Number(salvo) : null;
  });

  const [resultadoFinal, setResultadoFinal] = useState<ResultadoQuiz | null>(null);
  const [carregandoResultado, setCarregandoResultado] = useState(false);

  // Carrega a árvore de perguntas do backend uma única vez
  useEffect(() => {
    const carregarFluxo = async () => {
      try {
        const resposta = await api.get<PerguntaQuiz[]>('/quiz/fluxo');
        setPerguntas(resposta.data);

        // Se não tiver um resultado salvo, começa pela pergunta de ordem 1
        if (!resultadoFinalId) {
          const primeira = resposta.data.find((p) => p.ordem === 1);
          setPerguntaAtualId(primeira?.id ?? null);
        }
      } catch (erro) {
        console.error('Erro ao carregar o fluxo do quiz:', erro);
        setErroFluxo('Não foi possível carregar as perguntas. Tente novamente mais tarde.');
      } finally {
        setCarregandoFluxo(false);
      }
    };

    carregarFluxo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Busca os dados do resultado (template, exemplos e professores) sempre que o caminho final muda
  useEffect(() => {
    if (!resultadoFinalId) {
      setResultadoFinal(null);
      return;
    }

    const carregarResultado = async () => {
      setCarregandoResultado(true);
      try {
        const resposta = await api.get<ResultadoQuiz>(`/quiz/resultado/${resultadoFinalId}`);
        setResultadoFinal(resposta.data);
      } catch (erro) {
        console.error('Erro ao carregar o resultado do quiz:', erro);
        setErroFluxo('Não foi possível carregar o resultado. Tente novamente mais tarde.');
      } finally {
        setCarregandoResultado(false);
      }
    };

    carregarResultado();
  }, [resultadoFinalId]);

  const perguntaAtual = perguntas.find((p) => p.id === perguntaAtualId);

  // Calcula, para uma pergunta, o pior caso de quantas perguntas ainda faltam
  // até chegar em algum resultado (segue Sim/Não, o que for mais longo).
  // Memoizado porque a árvore não muda durante a sessão.
  const profundidadeRestanteCache = new Map<number, number>();
  const profundidadeRestante = (perguntaId: number): number => {
    if (profundidadeRestanteCache.has(perguntaId)) return profundidadeRestanteCache.get(perguntaId)!;

    const p = perguntas.find((item) => item.id === perguntaId);
    if (!p) return 1;

    const restantePorOpcao = p.opcoes.map((opcao) =>
      opcao.proximaPerguntaId ? 1 + profundidadeRestante(opcao.proximaPerguntaId) : 1
    );
    const resultado = Math.max(...restantePorOpcao, 1);
    profundidadeRestanteCache.set(perguntaId, resultado);
    return resultado;
  };

  // Progresso real: perguntas já respondidas / (respondidas + pior caso restante a partir daqui)
  const progresso = (() => {
    if (resultadoFinalId) return 100;
    if (!perguntaAtual) return 0;

    const respondidas = historico.length;
    const restantes = profundidadeRestante(perguntaAtual.id);
    return Math.round((respondidas / (respondidas + restantes)) * 100);
  })();

  // Ação: Selecionar Alternativa (sem avançar)
  const handleSelecionarOpcao = (opcaoId: number) => {
    setOpcaoSelecionada(opcaoId);
  };

  // Ação: Clicar em "Próxima"
  const handleProxima = () => {
    if (!opcaoSelecionada || !perguntaAtual) return;

    const opcao = perguntaAtual.opcoes.find((o) => o.id === opcaoSelecionada);
    if (!opcao) return;

    // Salva a pergunta atual no histórico para poder voltar
    setHistorico([...historico, perguntaAtual.id]);

    // Lógica de Ramificação: Vai para outra pergunta OU para o Resultado
    if (opcao.proximaPerguntaId) {
      setPerguntaAtualId(opcao.proximaPerguntaId);
      setOpcaoSelecionada(null); // Reseta a seleção para a nova tela
    } else if (opcao.caminhoFinalId) {
      setResultadoFinalId(opcao.caminhoFinalId);
      localStorage.setItem('resultadoFluxoTCC', String(opcao.caminhoFinalId));
    }
  };

  // Ação: Voltar para a pergunta anterior
  const handleVoltar = () => {
    if (historico.length === 0) return;

    const novoHistorico = [...historico];
    const perguntaAnteriorId = novoHistorico.pop(); // Remove e pega a última

    setHistorico(novoHistorico);
    setPerguntaAtualId(perguntaAnteriorId!);
    setOpcaoSelecionada(null);
    setResultadoFinalId(null);
  };

  // Ação: Contatar um professor recomendado direto da tela de resultado
  const handleContatar = async (professor: ProfessorRecomendado) => {
    try {
      const resposta = await api.post('/professores/vincular', { professorId: professor.id });
      localStorage.setItem('projetoAtivo', JSON.stringify({ id: resposta.data.projetoId }));
      localStorage.setItem(
        'orientadorSelecionado',
        JSON.stringify({ id: professor.id, nome: professor.nome, departamento: null, descricao: professor.biografia })
      );
      navigate('/chat');
    } catch (erro) {
      console.error('Erro ao vincular orientador:', erro);
      alert('Erro ao vincular orientador. Talvez ele não tenha mais vagas disponíveis — tente outro.');
    }
  };

  return (
    <div className="fluxo-container">
      {/* HEADER E BARRA DE PROGRESSO */}
      <header className="fluxo-header">
        <div className="fluxo-header-left">
          <div className="fluxo-logo" onClick={() => navigate('/home')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <span className="fluxo-title">TCC Guiado</span>
        </div>

        <div className="fluxo-progress-container">
          <div className="progress-labels">
            <span>Fluxo de Decisão</span>
            <span>{progresso}%</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progresso}%` }}></div>
          </div>
        </div>

        <button className="btn-pular" onClick={() => navigate('/home')}>
          Sair <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </header>

      {/* ÁREA PRINCIPAL */}
      <main className="fluxo-main">
        <div className="fluxo-content-wrapper">

          {erroFluxo && (
            <div className="pergunta-container">
              <p className="pergunta-subtitulo">{erroFluxo}</p>
            </div>
          )}

          {!erroFluxo && (carregandoFluxo || (resultadoFinalId !== null && carregandoResultado)) && (
            <div className="pergunta-container">
              <p className="pergunta-subtitulo">Carregando...</p>
            </div>
          )}

          {/* SE TIVER RESULTADO, MOSTRA A TELA FINAL */}
          {!erroFluxo && !carregandoResultado && resultadoFinal ? (
            <div className="resultado-container">
              <div className="success-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h1 className="resultado-title">Seu perfil de TCC foi identificado!</h1>
              <p className="resultado-subtitle">Com base nas suas respostas, encontramos o tipo de pesquisa mais adequado para você.</p>

              {/* Card do Tipo de TCC */}
              <div className="resultado-card">
                <div className="resultado-card-header">
                  <div className="numero-badge">1</div>
                  <div>
                    <span className="tipo-label">{resultadoFinal.caminho.template.nomeTemplate}</span>
                    <h2 className="tipo-nome">{formatarCodigoRamificacao(resultadoFinal.caminho.codigoRamificacao)}</h2>
                  </div>
                </div>
                {resultadoFinal.caminho.template.descricao && (
                  <div className="resultado-detalhes">
                    <h4>METODOLOGIA</h4>
                    <p>{resultadoFinal.caminho.template.descricao}</p>
                  </div>
                )}
                {/* REQUISITO 2: Link para o Template */}
                <div className="template-section">
                  <a href={resultadoFinal.caminho.template.arquivoUrl} target="_blank" rel="noreferrer" className="btn-acessar-template">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Acessar {resultadoFinal.caminho.template.nomeTemplate}
                  </a>
                </div>
              </div>

              {/* Sugestões de Temas */}
              {resultadoFinal.caminho.exemplosTemas.length > 0 && (
                <div className="sugestoes-section">
                  <h3>Sugestões de Temas</h3>
                  <div className="sugestoes-list">
                    {resultadoFinal.caminho.exemplosTemas.map((sugestao, idx) => (
                      <div key={sugestao.id} className="sugestao-item">
                        <div className="sugestao-number">{idx + 1}</div>
                        <p>{sugestao.textoExemploTema}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REQUISITO 3: Professores Compatíveis */}
              <div className="professores-section">
                <h3>Professores Compatíveis</h3>
                {resultadoFinal.professores.length === 0 ? (
                  <p className="pergunta-subtitulo">Nenhum professor com vaga disponível para esse perfil no momento.</p>
                ) : (
                  <div className="professores-list-mini">
                    {resultadoFinal.professores.map((prof) => (
                      <div key={prof.id} className="prof-item-mini">
                        <div className="prof-avatar-mini">
                          {prof.nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
                        </div>
                        <div className="prof-info-mini">
                          <h4>{prof.nome}</h4>
                          <p>{prof.vagasRestantes} de {prof.vagasTotais} vagas disponíveis</p>
                        </div>
                        <button className="btn-contatar" onClick={() => handleContatar(prof)}>Contatar</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botões Finais */}
              <div className="resultado-acoes">
                <button className="btn-refazer" onClick={() => {
                  setHistorico([]);
                  const primeira = perguntas.find((p) => p.ordem === 1);
                  setPerguntaAtualId(primeira?.id ?? null);
                  setResultadoFinalId(null);
                  setOpcaoSelecionada(null);
                  localStorage.removeItem('resultadoFluxoTCC');
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  Refazer
                </button>
                <button className="btn-comecar" onClick={() => navigate('/home')}>
                  Ir para página inicial <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          ) :

          /* SENÃO, MOSTRA A PERGUNTA ATUAL */
          !erroFluxo && !carregandoFluxo && perguntaAtual && (
            <div className="pergunta-container">
              {historico.length > 0 && (
                <button className="btn-voltar" onClick={handleVoltar}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                  Voltar
                </button>
              )}

              <div className="pergunta-card">
                <div className="pergunta-header">
                  <div className="pergunta-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                  </div>
                  <span className="pergunta-ordem">PERGUNTA {historico.length + 1}</span>
                </div>

                <h2 className="pergunta-titulo">{perguntaAtual.textoPergunta}</h2>

                <div className="opcoes-lista">
                  {perguntaAtual.opcoes.map((opcao) => (
                    <button
                      key={opcao.id}
                      className={`opcao-botao ${opcaoSelecionada === opcao.id ? 'selecionada' : ''}`}
                      onClick={() => handleSelecionarOpcao(opcao.id)}
                    >
                      {opcao.textoOpcao}
                    </button>
                  ))}
                </div>

                {/* REQUISITO 1: Botão Próxima (só ativa se tiver opção selecionada) */}
                <div className="acao-proxima-container">
                  <button
                    className="btn-avancar"
                    onClick={handleProxima}
                    disabled={!opcaoSelecionada}
                  >
                    Próxima <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
