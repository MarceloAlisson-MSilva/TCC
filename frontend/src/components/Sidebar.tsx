import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Propriedade para controlar se a barra está aberta ou fechada a partir da página mãe
interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { usuario, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`sidebar ${!isOpen ? 'oculta' : ''}`}>
      
      {/* Cabeçalho da Sidebar */}
      <div className="sidebar-top">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <span className="logo-text">TCC Guiado</span>
        </div>
      </div>

      {/* Navegação */}
      <nav className="sidebar-nav">
        <span className="nav-section-title">APRENDER</span>
        
        <button 
          className={`nav-item ${isActive('/home') ? 'active' : ''}`} 
          onClick={() => navigate('/home')}
          title="Professores"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
          <span>Professores</span>
        </button>
        
        <button 
          className={`nav-item ${isActive('/chat') ? 'active' : ''}`} 
          onClick={() => navigate('/chat')}
          title="Chat"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          <span>Chat</span>
        </button>

        <button 
          className={`nav-item ${isActive('/quiz') ? 'active' : ''}`} 
          onClick={() => navigate('/quiz')}
          title="Fluxo de Decisão"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>
          <span>Fluxo de Decisão</span>
        </button>
      </nav>

      {/* Perfil e Sair */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <div className="user-info">
            <strong>{usuario ? usuario.nome : 'Carregando...'}</strong>
            <span>{usuario ? usuario.email : '...'}</span>
          </div>
        </div>

        <button className="btn-logout" onClick={handleLogout} title="Sair da conta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="21" x2="9" y2="3"></line><line x1="15" y1="12" x2="21" y2="12"></line><polyline points="18 9 21 12 18 15"></polyline></svg>
          <span>Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}