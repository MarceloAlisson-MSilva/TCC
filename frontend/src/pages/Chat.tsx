import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import './Chat.css';

// 1. Tipagem atualizada para bater com o Schema Prisma (Opção 1)
type TipoMensagem = 'TEXTO' | 'ARQUIVO' | 'AUDIO';

interface Mensagem {
  id: number;
  projetoId: number;
  autorId: number;
  conteudo: string;
  tipo: TipoMensagem;
  criadoEm: string;
  autor?: {
    nome: string;
    perfil: string;
  };
}

export function Chat() {
  const navigate = useNavigate();
  const chatFimRef = useRef<HTMLDivElement>(null);
  const { usuario: usuarioLogado, token } = useAuth();

  // Estados
  const [socket, setSocket] = useState<Socket | null>(null);
  const [projetoAtual, setProjetoAtual] = useState<any>(null);
  const [orientador, setOrientador] = useState<any>(null);
  
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [menuAberto, setMenuAberto] = useState(true);

  useEffect(() => {
    // 2. Setup Inicial: Pegar projeto ativo e orientador salvos após o vínculo em Home.tsx
    const projeto = JSON.parse(localStorage.getItem('projetoAtivo') || 'null');
    const orientadorSalvo = JSON.parse(localStorage.getItem('orientadorSelecionado') || 'null');

    setProjetoAtual(projeto);
    setOrientador(orientadorSalvo);

    if (projeto?.id) {
      // 3. Conexão WebSocket (Substitua a URL pela do seu backend)
      const socketIo = io(API_URL); 
      setSocket(socketIo);

      // Entrar na "Sala" do Projeto TCC
      socketIo.emit('entrarProjeto', projeto.id);

      // Ouvir mensagens recebidas em tempo real
      socketIo.on('novaMensagem', (novaMsg: Mensagem) => {
        setMensagens((prev) => [...prev, novaMsg]);
      });

      // 4. Buscar histórico de mensagens via API REST
      const carregarHistorico = async () => {
        try {
          const response = await fetch(`${API_URL}/api/projetos/${projeto.id}/mensagens`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setMensagens(data);
          }
        } catch (error) {
          console.error("Erro ao buscar histórico:", error);
        }
      };

      carregarHistorico();

      // Limpeza do socket ao desmontar o componente
      return () => {
        socketIo.disconnect();
      };
    }
  }, []);

  // Rolar para o fim do chat automaticamente
  useEffect(() => {
    chatFimRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  // 5. Função de Envio Atualizada
  const handleEnviar = async (e?: React.FormEvent, tipoEnvio: TipoMensagem = 'TEXTO', conteudoExtra?: string) => {
    if (e) e.preventDefault();
    
    const conteudoMensagem = conteudoExtra || novaMensagem;
    console.log("Tentando enviar...", { 
      texto: conteudoMensagem, 
      idProjeto: projetoAtual?.id, 
      idUsuario: usuarioLogado?.id 
    });

    if (!conteudoMensagem.trim() || !projetoAtual?.id || !usuarioLogado?.id) return;
    const payload = {
      projetoId: projetoAtual.id,
      autorId: usuarioLogado.id,
      conteudo: conteudoMensagem,
      tipo: tipoEnvio,
    };

    try {
      // Envia para a API salvar no banco
      const response = await fetch(`${API_URL}/api/mensagens`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const mensagemSalva = await response.json();
        // Emite via Socket para o outro usuário ver instantaneamente
        socket?.emit('enviarMensagem', mensagemSalva);
        
        // Adiciona na própria tela (se o backend já não emitir de volta para o remetente)
        setMensagens((prev) => [...prev, mensagemSalva]);
        setNovaMensagem('');
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  const handleEnviarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const nomeArquivo = e.target.files[0].name;
      // TODO: Implementar upload real de arquivo para AWS S3, Cloudinary ou servidor local
      handleEnviar(undefined, 'ARQUIVO', nomeArquivo);
    }
  };

  const handleTrocarOrientador = () => {
    navigate('/home');
  };

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={menuAberto} />

      <div className="main-content" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        
        <header className="topbar" style={{ padding: '20px 32px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center' }}>
          <div className="topbar-left" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <svg 
              onClick={() => setMenuAberto(!menuAberto)}
              style={{ cursor: 'pointer' }}
              width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
            <span className="breadcrumb">Chat do Projeto</span>
          </div>
        </header>

        {!projetoAtual ? (
          <div className="chat-container estagio-vazio" style={{ flex: 1 }}>
            {/* ... Seu Layout de estado vazio mantido igual ... */}
            <aside className="sidebar-chat">
              <div className="sidebar-header">STATUS DO PROJETO</div>
              <div className="avatar-vazio">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <p className="msg-sidebar-vazia">Nenhum projeto de TCC ativo</p>
              <button className="btn-escolher-prof" onClick={() => navigate('/home')}>
                Ir para o Dashboard
              </button>
            </aside>
            
            <main className="chat-main area-vazia">
              <div className="mensagem-central-vazia">
                <h2>Nenhum projeto selecionado</h2>
                <p>Você precisa de um projeto TCC em andamento para usar o chat.</p>
              </div>
            </main>
          </div>
        ) : (
          <div className="chat-container" style={{ flex: 1 }}>
            <aside className="sidebar-chat">
              <div className="sidebar-header">SOBRE O ORIENTADOR</div>
              
              {orientador && (
                <div className="perfil-orientador">
                  <div className="avatar-orientador">
                    {orientador.nome?.substring(0, 2).toUpperCase()}
                  </div>
                  <h3 className="nome-orientador">{orientador.nome}</h3>
                  <p className="departamento-orientador">{orientador.departamento || 'Orientador'}</p>
                  {orientador.descricao && (
                    <p className="bio-orientador">{orientador.descricao}</p>
                  )}
                </div>
              )}

              <button className="btn-trocar-prof" onClick={handleTrocarOrientador}>
                Trocar Orientador
              </button>

              <p className="tema-projeto">{projetoAtual.tema}</p>
            </aside>

            <main className="chat-main">
              <div className="chat-feed">
                {mensagens.map((msg) => {
                  // 6. Lógica visual: Verifica se a mensagem é minha ou do outro
                  const isMinhaMensagem = msg.autorId === usuarioLogado?.id;
                  
                  // Mantendo as suas classes originais 'aluno' e 'professor' para não quebrar o seu Chat.css
                  // Assumindo que 'aluno' era quem mandava da direita (você), e 'professor' da esquerda (outro).
                  const classeCSSRemetente = isMinhaMensagem ? 'aluno' : 'professor';

                  return (
                    <div key={msg.id} className={`mensagem-wrapper ${classeCSSRemetente}`}>
                      
                      {!isMinhaMensagem && (
                        <div className="mensagem-avatar-pequeno">
                          {msg.autor?.nome?.substring(0, 2).toUpperCase() || 'OR'}
                        </div>
                      )}
                      
                      <div className={`balao-mensagem ${classeCSSRemetente}`}>
                        {msg.tipo === 'TEXTO' && <p>{msg.conteudo}</p>}
                        
                        {msg.tipo === 'ARQUIVO' && (
                          <div className="anexo-fake">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                            <span>{msg.conteudo}</span>
                          </div>
                        )}

                        {msg.tipo === 'AUDIO' && (
                          <div className="audio-fake">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                            <span>Áudio enviado</span>
                          </div>
                        )}
                        <span className="hora-mensagem">
                          {new Date(msg.criadoEm).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                      {isMinhaMensagem && (
                        <div className="mensagem-avatar-pequeno aluno">
                          {usuarioLogado?.nome?.substring(0, 2).toUpperCase() || 'ME'}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={chatFimRef} />
              </div>

              <form className="chat-input-area" onSubmit={(e) => handleEnviar(e, 'TEXTO')}>
                <label className="btn-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                  <input type="file" style={{ display: 'none' }} onChange={handleEnviarArquivo} />
                </label>
                
                <button type="button" className="btn-icon" onClick={() => handleEnviar(undefined, 'AUDIO', 'Áudio gravado (mock)')}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                </button>
                
                <input 
                  type="text" 
                  placeholder="Escreva sua mensagem... (Enter para enviar)" 
                  value={novaMensagem}
                  onChange={(e) => setNovaMensagem(e.target.value)}
                />
                
                <button type="submit" className="btn-enviar" disabled={!novaMensagem.trim()}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
              </form>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}