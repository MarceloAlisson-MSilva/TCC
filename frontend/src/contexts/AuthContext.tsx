import { createContext, useState, useEffect, type ReactNode } from 'react';

// Tipagem dos dados do usuário
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: 'ALUNO' | 'PROFESSOR';
}

// O que o nosso contexto vai expor para os componentes
interface AuthContextType {
  usuario: Usuario | null;
  token: string | null;
  autenticado: boolean;
  carregando: boolean;
  login: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  // Assim que a aplicação abre, verifica se já existe token e usuário salvos
  useEffect(() => {
    const tokenSalvo = localStorage.getItem('@TCC:token');
    const usuarioSalvo = localStorage.getItem('@TCC:usuario');

    if (tokenSalvo && usuarioSalvo) {
      setToken(tokenSalvo);
      setUsuario(JSON.parse(usuarioSalvo));
    }
    setCarregando(false);
  }, []);

  // Função para salvar os dados ao fazer login/cadastro
  const login = (novoToken: string, novoUsuario: Usuario) => {
    setToken(novoToken);
    setUsuario(novoUsuario);

    localStorage.setItem('@TCC:token', novoToken);
    localStorage.setItem('@TCC:usuario', JSON.stringify(novoUsuario));
  };

  // Função para deslogar
  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('@TCC:token');
    localStorage.removeItem('@TCC:usuario');
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        token,
        autenticado: !!usuario,
        carregando,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}