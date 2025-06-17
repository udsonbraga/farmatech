// src/services/movimentoService.ts

import { Movimento } from '@/types';
import { AuthService } from './authService'; // Para obter o token JWT

export class MovimentoService {
  private static readonly API_BASE_URL = 'http://127.0.0.1:8000/api';

  private static getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const accessToken = AuthService.getAccessToken();
    if (accessToken) {
      (headers as any)['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  // Método para registrar uma nova movimentação
  static async addMovimento(movimentoData: Omit<Movimento, 'id' | 'data'> & { medicamentoId: number }): Promise<Movimento> {
    try {
      const response = await fetch(`${MovimentoService.API_BASE_URL}/movimentos/`, {
        method: 'POST',
        headers: MovimentoService.getAuthHeaders(),
        body: JSON.stringify({
          medicamento: movimentoData.medicamentoId, // O backend espera 'medicamento' (ID)
          tipo: movimentoData.tipo,
          quantidade: movimentoData.quantidade,
          observacoes: movimentoData.observacoes,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const newAccessToken = await AuthService.refreshAccessToken();
            if (newAccessToken) {
                const retryResponse = await fetch(`${MovimentoService.API_BASE_URL}/movimentos/`, {
                    method: 'POST',
                    headers: MovimentoService.getAuthHeaders(),
                    body: JSON.stringify({
                      medicamento: movimentoData.medicamentoId,
                      tipo: movimentoData.tipo,
                      quantidade: movimentoData.quantidade,
                      observacoes: movimentoData.observacoes,
                    }),
                });
                if (retryResponse.ok) {
                    const newMovimentoBackend: any = await retryResponse.json();
                    return {
                        id: newMovimentoBackend.id.toString(), // Convertendo para string conforme seu tipo
                        medicamentoId: newMovimentoBackend.medicamento.toString(), // ID do medicamento retornado
                        tipo: newMovimentoBackend.tipo,
                        quantidade: newMovimentoBackend.quantidade,
                        data: newMovimentoBackend.data,
                        observacoes: newMovimentoBackend.observacoes,
                    };
                }
            }
            AuthService.logout();
            throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
        }
        const errorData = await response.json();
        throw new Error(`Erro ao registrar movimentação: ${JSON.stringify(errorData)}`);
      }

      const newMovimentoBackend: any = await response.json();
      return {
          id: newMovimentoBackend.id.toString(),
          medicamentoId: newMovimentoBackend.medicamento.toString(),
          tipo: newMovimentoBackend.tipo,
          quantidade: newMovimentoBackend.quantidade,
          data: newMovimentoBackend.data,
          observacoes: newMovimentoBackend.observacoes,
      };
    } catch (error) {
      console.error('Erro ao adicionar movimentação:', error);
      throw error;
    }
  }

  // Método para obter todas as movimentações
  static async getMovimentos(): Promise<Movimento[]> {
    try {
      const response = await fetch(`${MovimentoService.API_BASE_URL}/movimentos/`, {
        method: 'GET',
        headers: MovimentoService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const newAccessToken = await AuthService.refreshAccessToken();
            if (newAccessToken) {
                const retryResponse = await fetch(`${MovimentoService.API_BASE_URL}/movimentos/`, {
                    method: 'GET',
                    headers: MovimentoService.getAuthHeaders(),
                });
                if (retryResponse.ok) {
                    const data: any[] = await retryResponse.json();
                    return data.map(mov => ({
                        id: mov.id.toString(),
                        medicamentoId: mov.medicamento.toString(),
                        tipo: mov.tipo,
                        quantidade: mov.quantidade,
                        data: mov.data,
                        observacoes: mov.observacoes,
                    }));
                }
            }
            AuthService.logout();
            throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
        }
        const errorDetail = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
        throw new Error(`Erro ao buscar movimentações: ${errorDetail.detail || response.statusText}`);
      }

      const data: any[] = await response.json();
      return data.map(mov => ({
          id: mov.id.toString(),
          medicamentoId: mov.medicamento.toString(),
          tipo: mov.tipo,
          quantidade: mov.quantidade,
          data: mov.data,
          observacoes: mov.observacoes,
      }));
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      throw error;
    }
  }
}
