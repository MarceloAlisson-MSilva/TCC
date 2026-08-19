import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

export function RotaProtegida({ children }: { children: ReactNode }) {
  const { autenticado, carregando } = useAuth();

  if (carregando) {
    return <div>Carregando...</div>;
  }

  if (!autenticado) {
    return <Navigate to="/" replace />;
  }

  return children;
}