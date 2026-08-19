import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

interface RotaProtegidaProps {
  children: ReactNode;
  // Se informado, só deixa passar usuários com esse perfil (ALUNO ou PROFESSOR).
  // Quem tentar acessar uma rota do perfil errado é redirecionado pro próprio dashboard.
  perfilPermitido?: 'ALUNO' | 'PROFESSOR';
}

export function RotaProtegida({ children, perfilPermitido }: RotaProtegidaProps) {
  const { autenticado, carregando, usuario } = useAuth();

  if (carregando) {
    return <div>Carregando...</div>;
  }

  if (!autenticado) {
    return <Navigate to="/" replace />;
  }

  if (perfilPermitido && usuario?.perfil !== perfilPermitido) {
    const destinoCorreto = usuario?.perfil === 'PROFESSOR' ? '/professor' : '/home';
    return <Navigate to={destinoCorreto} replace />;
  }

  return children;
}