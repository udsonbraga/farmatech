
// src/services/authService.ts
import { User } from '@/types';

export interface LoginCredentials {
  email: string;
  senha: string;
}

export interface UserRegistration {
  email: string;
  senha: string;
  telefone?: string;
  farmaciaName: string;
  responsavelName: string;
}

export class AuthService {
  private static readonly API_BASE_URL = 'http://127.0.0.1:8000/api';
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Função para armazenar os tokens JWT
  private static setTokens(access: string, refresh: string) {
    localStorage.setItem(AuthService.ACCESS_TOKEN_KEY, access);
    localStorage.setItem(AuthService.REFRESH_TOKEN_KEY, refresh);
  }

  // Função para remover os tokens JWT (logout)
  static logout() {
    localStorage.removeItem(AuthService.ACCESS_TOKEN_KEY);
    localStorage.removeItem(AuthService.REFRESH_TOKEN_KEY);
  }

  // Função para obter o token de acesso
  static getAccessToken(): string | null {
    return localStorage.getItem(AuthService.ACCESS_TOKEN_KEY);
  }

  // Função para obter o token de refresh
  static getRefreshToken(): string | null {
    return localStorage.getItem(AuthService.REFRESH_TOKEN_KEY);
  }

  // Função para verificar se o usuário está logado (verificando a existência do token)
  static isAuthenticated(): boolean {
    return !!AuthService.getAccessToken();
  }

  // Função para simular o "usuário atual" (baseado nos tokens, não mais em um objeto User completo)
  static getCurrentUser(): User | null {
    const accessToken = AuthService.getAccessToken();
    if (accessToken) {
      return { id: 0, email: '', username: '', access: accessToken };
    }
    return null;
  }

  // Função para registrar um novo usuário e fazer login (obtendo JWTs)
  static async register(userData: UserRegistration): Promise<{ success: boolean, user?: User, message: string }> {
    console.log('Iniciando registro com dados:', userData);
    
    try {
      const payload = {
        username: userData.email,
        password: userData.senha,
        email: userData.email,
        telefone: userData.telefone,
        farmaciaName: userData.farmaciaName,
        responsavelName: userData.responsavelName,
        senha: userData.senha,
      };

      console.log('Enviando payload para registro:', payload);

      const response = await fetch(`${AuthService.API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do servidor:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          return { 
            success: false, 
            message: errorData.message || 'Erro no servidor. Verifique os dados e tente novamente.' 
          };
        } catch {
          return { 
            success: false, 
            message: `Erro do servidor (${response.status}): ${errorText || 'Erro desconhecido'}` 
          };
        }
      }

      const data = await response.json();
      console.log('Dados recebidos do servidor:', data);

      if (data.success) {
        AuthService.setTokens(data.access, data.refresh);
        return { 
          success: true, 
          user: { ...data.user, access: data.access, refresh: data.refresh }, 
          message: data.message || 'Registro realizado com sucesso!' 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Erro no registro.' 
        };
      }
    } catch (error: any) {
      console.error('Erro de rede ou conexão:', error);
      
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        return { 
          success: false, 
          message: 'Não foi possível conectar ao servidor. Verifique se o backend Django está rodando em http://127.0.0.1:8000' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Erro de conexão. Verifique sua internet e tente novamente.' 
      };
    }
  }

  // Função para fazer login e obter JWTs
  static async login(credentials: LoginCredentials): Promise<{ success: boolean, user?: User, message: string }> {
    console.log('Iniciando login com email:', credentials.email);
    
    try {
      const payload = {
        username: credentials.email,
        password: credentials.senha,
      };

      console.log('Enviando payload para login:', { username: payload.username, password: '[HIDDEN]' });

      const response = await fetch(`${AuthService.API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta do servidor:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          return { 
            success: false, 
            message: errorData.message || 'Credenciais inválidas.' 
          };
        } catch {
          return { 
            success: false, 
            message: `Erro do servidor (${response.status}): ${errorText || 'Erro desconhecido'}` 
          };
        }
      }

      const data = await response.json();
      console.log('Dados recebidos do servidor:', data);

      if (data.success) {
        AuthService.setTokens(data.access, data.refresh);
        return { 
          success: true, 
          user: { ...data.user, access: data.access, refresh: data.refresh }, 
          message: data.message || 'Login realizado com sucesso!' 
        };
      } else {
        return { 
          success: false, 
          message: data.message || 'Credenciais inválidas.' 
        };
      }
    } catch (error: any) {
      console.error('Erro de rede ou conexão:', error);
      
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        return { 
          success: false, 
          message: 'Não foi possível conectar ao servidor. Verifique se o backend Django está rodando em http://127.0.0.1:8000' 
        };
      }
      
      return { 
        success: false, 
        message: error.message || 'Erro de conexão. Verifique sua internet e tente novamente.' 
      };
    }
  }

  // Opcional: Função para renovar o token de acesso usando o token de refresh
  static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = AuthService.getRefreshToken();
    if (!refreshToken) {
      AuthService.logout();
      return null;
    }

    try {
      const response = await fetch(`${AuthService.API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();

      if (response.ok && data.access) {
        localStorage.setItem(AuthService.ACCESS_TOKEN_KEY, data.access);
        return data.access;
      } else {
        AuthService.logout();
        return null;
      }
    } catch (error) {
      console.error('Erro ao renovar token de acesso:', error);
      AuthService.logout();
      return null;
    }
  }
}
