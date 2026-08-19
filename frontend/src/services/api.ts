// src/services/api.ts
import axios from 'axios';

// 1. Cria a instância do Axios com a porta atual do backend
// Em produção, defina VITE_API_URL nas env vars do host (ex: https://seu-backend.onrender.com)
// Em dev, cai automaticamente no localhost se a variável não existir
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333';

export const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// 2. Interceptor de Requisição (Antes da chamada sair do frontend)
api.interceptors.request.use(
  (config) => {
    // Busca o token salvo no localStorage
    const token = localStorage.getItem('@TCC:token');

    // Se o token existir, injeta o cabeçalho Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Resposta (Quando o backend responde com erro)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend retornar 401 (token expirado ou inválido) em rotas privadas
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/')) {
      // Limpa os dados de login e força o redirecionamento para a tela inicial
      localStorage.removeItem('@TCC:token');
      localStorage.removeItem('@TCC:usuario');
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);