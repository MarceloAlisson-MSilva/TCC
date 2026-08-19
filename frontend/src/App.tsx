import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Home } from './pages/Home';
import { IntroducaoQuiz } from './pages/IntroducaoQuiz';
import { FluxoDecisao } from './pages/FluxoDecisao';
import { Chat } from './pages/Chat'; 
import { AuthProvider } from './contexts/AuthContext';
import { RotaProtegida } from './components/RotaProtegida';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rotas Protegidas (Só acessa se estiver logado) */}
          <Route 
            path="/introducao-quiz" 
            element={
              <RotaProtegida>
                <IntroducaoQuiz />
              </RotaProtegida>
            } 
          />
          <Route 
            path="/quiz" 
            element={
              <RotaProtegida>
                <FluxoDecisao />
              </RotaProtegida>
            } 
          />
          <Route 
            path="/home" 
            element={
              <RotaProtegida>
                <Home />
              </RotaProtegida>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <RotaProtegida>
                <Chat />
              </RotaProtegida>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}