
// src/services/vendaService.ts

import { VendaRegistro } from '@/types';
import { AuthService } from './authService'; // Para obter o token JWT


export class VendaService {
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

  // Método para obter todas as vendas
  static async getVendas(): Promise<VendaRegistro[]> {
    try {
      const response = await fetch(`${VendaService.API_BASE_URL}/vendas/`, {
        method: 'GET',
        headers: VendaService.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const newAccessToken = await AuthService.refreshAccessToken();
            if (newAccessToken) {
                const retryResponse = await fetch(`${VendaService.API_BASE_URL}/vendas/`, {
                    method: 'GET',
                    headers: VendaService.getAuthHeaders(),
                });
                if (retryResponse.ok) {
                    const data: any[] = await retryResponse.json();
                    return data.map(venda => ({
                        id: venda.id.toString(),
                        itens: venda.itens, // Assumindo que o backend retorna isso corretamente
                        total: parseFloat(venda.total),
                        data: venda.data,
                        formaPagamento: venda.forma_pagamento, // snake_case do backend
                    }));
                }
            }
            AuthService.logout();
            throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
        }
        const errorDetail = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
        throw new Error(`Erro ao buscar vendas: ${errorDetail.detail || response.statusText}`);
      }

      const data: any[] = await response.json();
      return data.map(venda => ({
          id: venda.id.toString(),
          itens: venda.itens,
          total: parseFloat(venda.total),
          data: venda.data,
          formaPagamento: venda.forma_pagamento,
      }));
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      throw error;
    }
  }

  // Método para adicionar uma nova venda
  static async addVenda(vendaData: Omit<VendaRegistro, 'id' | 'data'>): Promise<VendaRegistro> {
    try {
        const response = await fetch(`${VendaService.API_BASE_URL}/vendas/`, {
            method: 'POST',
            headers: VendaService.getAuthHeaders(),
            body: JSON.stringify({
                itens: vendaData.itens.map(item => ({ // Mapear para o formato do backend
                    medicamento: item.medicamento,
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario,
                })),
                total: vendaData.total,
                forma_pagamento: vendaData.formaPagamento, // snake_case para o backend
            }),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                const newAccessToken = await AuthService.refreshAccessToken();
                if (newAccessToken) {
                    const retryResponse = await fetch(`${VendaService.API_BASE_URL}/vendas/`, {
                        method: 'POST',
                        headers: VendaService.getAuthHeaders(),
                        body: JSON.stringify({
                            itens: vendaData.itens.map(item => ({
                                medicamento: item.medicamento,
                                quantidade: item.quantidade,
                                preco_unitario: item.preco_unitario,
                            })),
                            total: vendaData.total,
                            forma_pagamento: vendaData.formaPagamento,
                        }),
                    });
                    if (retryResponse.ok) {
                        const newVendaBackend: any = await retryResponse.json();
                        return {
                            id: newVendaBackend.id.toString(),
                            itens: newVendaBackend.itens,
                            total: parseFloat(newVendaBackend.total),
                            data: newVendaBackend.data,
                            formaPagamento: newVendaBackend.forma_pagamento,
                        };
                    }
                }
                AuthService.logout();
                throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
            }
            const errorData = await response.json();
            throw new Error(`Erro ao registrar venda: ${JSON.stringify(errorData)}`);
        }

        const newVendaBackend: any = await response.json();
        return {
            id: newVendaBackend.id.toString(),
            itens: newVendaBackend.itens,
            total: parseFloat(newVendaBackend.total),
            data: newVendaBackend.data,
            formaPagamento: newVendaBackend.forma_pagamento,
        };
    } catch (error) {
      console.error('Erro ao adicionar venda:', error);
      throw error;
    }
  }
}
