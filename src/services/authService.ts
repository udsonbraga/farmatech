
// src/services/authService.ts
import { User } from '@/types';

// Opcional: Adicione a biblioteca jwt-decode se quiser decodificar o token no frontend
// Importar jwt_decode - você precisará instalar esta biblioteca: npm install jwt-decode
// import { jwtDecode } from 'jwt-decode';

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
  // Para uma implementação mais completa, você decodificaria o token aqui.
  static getCurrentUser(): User | null {
    const accessToken = AuthService.getAccessToken();
    if (accessToken) {
      // Em uma aplicação real, você decodificaria o accessToken aqui para obter
      // id, email, username e farmacia_id do payload.
      // Ex: const decodedToken = jwtDecode(accessToken);
      // return { id: decodedToken.user_id, email: decodedToken.email, ... };
      // Por enquanto, apenas retornamos um objeto User mínimo se o token existe.
      return { id: 0, email: '', username: '', access: accessToken }; // Valores placeholder
    }
    return null;
  }

  // Função para registrar um novo usuário e fazer login (obtendo JWTs)
  // AJUSTADO: Mapeando os campos do frontend para o que o backend espera (senha, farmaciaName, responsavelName)
  static async register(userData: UserRegistration): Promise<{ success: boolean, user?: User, message: string }> {
    try {
      // O payload deve corresponder EXATAMENTE ao que seu RegisterSerializer no Django espera
      const payload = {
        username: userData.email, // Assume que o username do Django é o email
        password: userData.senha, // Mapeando a senha do formData para 'password'
        email: userData.email, // Incluindo email, caso o serializer precise
        telefone: userData.telefone,
        farmaciaName: userData.farmaciaName, // Este campo é o que o backend está reclamando
        responsavelName: userData.responsavelName, // Este campo é o que o backend está reclamando
        senha: userData.senha, // INCLUÍDO NOVAMENTE: Se o seu serializer espera 'senha' diretamente para validação
      };

      const response = await fetch(`${AuthService.API_BASE_URL}/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        AuthService.setTokens(data.access, data.refresh);
        return { success: true, user: { ...data.user, access: data.access, refresh: data.refresh }, message: data.message || 'Registro realizado com sucesso!' };
      } else {
        const errorMessage = data.message || JSON.stringify(data) || 'Erro no registro.';
        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      return { success: false, message: error.message || 'Erro de rede.' };
    }
  }

  // Função para fazer login e obter JWTs
  static async login(credentials: LoginCredentials): Promise<{ success: boolean, user?: User, message: string }> {
    try {
      const payload = {
        username: credentials.email, // Backend espera 'username' para o email
        password: credentials.senha, // Backend espera 'password' para a senha
      };

      const response = await fetch(`${AuthService.API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload), // Envia o payload com 'username' e 'password'
      });

      const data = await response.json();

      if (response.ok && data.success) {
        AuthService.setTokens(data.access, data.refresh);
        return { success: true, user: { ...data.user, access: data.access, refresh: data.refresh }, message: data.message || 'Login realizado com sucesso!' };
      } else {
        const errorMessage = data.message || JSON.stringify(data) || 'Credenciais inválidas.';
        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      return { success: false, message: error.message || 'Erro de rede.' };
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
