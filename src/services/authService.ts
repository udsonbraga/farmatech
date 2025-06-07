
import bcrypt from 'bcryptjs';
import { User } from '@/types';

export interface UserRegistration {
  farmaciaName: string;
  responsavelName: string;
  email: string;
  senha: string;
  telefone: string;
}

export interface LoginCredentials {
  email: string;
  senha: string;
}

export class AuthService {
  private static readonly USERS_KEY = 'farmatech-users';
  private static readonly CURRENT_USER_KEY = 'farmatech-current-user';
  private static readonly SALT_ROUNDS = 10;

  // Validações
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { isValid: boolean; message?: string } {
    if (password.length < 6) {
      return { isValid: false, message: 'A senha deve ter pelo menos 6 caracteres' };
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return { isValid: false, message: 'A senha deve conter pelo menos uma letra e um número' };
    }
    return { isValid: true };
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  // Gerenciamento de usuários
  static getUsers(): User[] {
    try {
      const users = localStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      return [];
    }
  }

  static saveUsers(users: User[]): void {
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw new Error('Erro ao salvar dados do usuário');
    }
  }

  static userExists(email: string): boolean {
    const users = this.getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  }

  // Autenticação
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.SALT_ROUNDS);
    } catch (error) {
      console.error('Erro ao gerar hash da senha:', error);
      throw new Error('Erro no processamento da senha');
    }
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Erro ao verificar senha:', error);
      return false;
    }
  }

  // Registro
  static async register(userData: UserRegistration): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Validações
      if (!this.validateEmail(userData.email)) {
        return { success: false, message: 'E-mail inválido' };
      }

      const passwordValidation = this.validatePassword(userData.senha);
      if (!passwordValidation.isValid) {
        return { success: false, message: passwordValidation.message! };
      }

      if (!this.validatePhone(userData.telefone)) {
        return { success: false, message: 'Telefone deve estar no formato (XX) XXXXX-XXXX' };
      }

      if (userData.farmaciaName.trim().length < 2) {
        return { success: false, message: 'Nome da farmácia deve ter pelo menos 2 caracteres' };
      }

      if (userData.responsavelName.trim().length < 2) {
        return { success: false, message: 'Nome do responsável deve ter pelo menos 2 caracteres' };
      }

      // Verificar se usuário já existe
      if (this.userExists(userData.email)) {
        return { success: false, message: 'Este e-mail já está cadastrado' };
      }

      // Criar usuário
      const hashedPassword = await this.hashPassword(userData.senha);
      const newUser: User & { senhaHash: string } = {
        id: Date.now().toString(),
        email: userData.email.toLowerCase(),
        farmaciaName: userData.farmaciaName.trim(),
        responsavelName: userData.responsavelName.trim(),
        telefone: userData.telefone,
        senhaHash: hashedPassword
      };

      // Salvar usuário
      const users = this.getUsers();
      users.push(newUser);
      this.saveUsers(users);

      // Retornar usuário sem a senha hash
      const { senhaHash, ...userWithoutPassword } = newUser;
      return { 
        success: true, 
        message: 'Usuário cadastrado com sucesso!',
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    }
  }

  // Login
  static async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Validações básicas
      if (!this.validateEmail(credentials.email)) {
        return { success: false, message: 'E-mail inválido' };
      }

      if (!credentials.senha || credentials.senha.length < 1) {
        return { success: false, message: 'Senha é obrigatória' };
      }

      // Buscar usuário
      const users = this.getUsers();
      const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

      if (!user) {
        return { success: false, message: 'E-mail ou senha incorretos' };
      }

      // Verificar senha
      const isPasswordValid = await this.verifyPassword(credentials.senha, (user as any).senhaHash);
      
      if (!isPasswordValid) {
        return { success: false, message: 'E-mail ou senha incorretos' };
      }

      // Salvar sessão
      const { senhaHash, ...userWithoutPassword } = user as any;
      this.saveCurrentUser(userWithoutPassword);

      return { 
        success: true, 
        message: 'Login realizado com sucesso!',
        user: userWithoutPassword
      };
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    }
  }

  // Sessão
  static saveCurrentUser(user: User): void {
    try {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  }

  static getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem(this.CURRENT_USER_KEY);
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      return null;
    }
  }

  static logout(): void {
    try {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  }

  // Verificar se está logado
  static isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}
