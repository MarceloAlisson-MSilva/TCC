import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { Home } from './pages/Home';
import { IntroducaoQuiz } from './pages/IntroducaoQuiz';
import { FluxoDecisao } from './pages/FluxoDecisao';
import { Chat } from './pages/Chat'; 
import { ProfessorDashboard } from './pages/ProfessorDashboard';
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

          {/* Rotas Protegidas — só para ALUNO */}
          <Route 
            path="/introducao-quiz" 
            element={
              <RotaProtegida perfilPermitido="ALUNO">
                <IntroducaoQuiz />
              </RotaProtegida>
            } 
          />
          <Route 
            path="/quiz" 
            element={
              <RotaProtegida perfilPermitido="ALUNO">
                <FluxoDecisao />
              </RotaProtegida>
            } 
          />
          <Route 
            path="/home" 
            element={
              <RotaProtegida perfilPermitido="ALUNO">
                <Home />
              </RotaProtegida>
            } 
          />

          {/* Rota Protegida — só para PROFESSOR */}
          <Route 
            path="/professor" 
            element={
              <RotaProtegida perfilPermitido="PROFESSOR">
                <ProfessorDashboard />
              </RotaProtegida>
            } 
          />

          {/* Rota Protegida — compartilhada entre ALUNO e PROFESSOR */}
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