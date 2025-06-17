// src/services/medicamentoService.ts
import { Medicamento } from '@/types';
import { AuthService } from './authService'; // Importa o AuthService para obter o token

export class MedicamentoService {
  private static readonly API_BASE_URL = 'http://127.0.0.1:8000/api';

  // MODIFICADO: getAuthHeaders agora inclui o token de acesso JWT
  private static getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    const accessToken = AuthService.getAccessToken(); // Obtém o token de acesso
    if (accessToken) {
      // Adiciona o cabeçalho Authorization com o token JWT
      (headers as any)['Authorization'] = `Bearer ${accessToken}`;
    }
    return headers;
  }

  // Obter todos os medicamentos da farmácia do usuário logado
  static async getMedicamentos(): Promise<Medicamento[]> {
    try {
      const response = await fetch(`${MedicamentoService.API_BASE_URL}/medicamentos/`, {
        method: 'GET',
        headers: MedicamentoService.getAuthHeaders(), // Usa o novo getAuthHeaders
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            const newAccessToken = await AuthService.refreshAccessToken();
            if (newAccessToken) {
                const retryResponse = await fetch(`${MedicamentoService.API_BASE_URL}/medicamentos/`, {
                    method: 'GET',
                    headers: MedicamentoService.getAuthHeaders(),
                });
                if (retryResponse.ok) {
                    const data: any[] = await retryResponse.json(); // Use any[] temporariamente para flexibilidade
                    const transformedData = data.map(med => ({
                        ...med,
                        id: med.id,
                        quantidadeMinima: med.quantidade_minima,
                        dataVencimento: med.data_vencimento,
                        preco: parseFloat(med.preco) // MUDANÇA AQUI: Converter preco para número
                    }));
                    return transformedData;
                }
            }
            AuthService.logout();
            throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
        }
        const errorDetail = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
        throw new Error(`Erro ao buscar medicamentos: ${errorDetail.detail || response.statusText}`);
      }

      const data: any[] = await response.json(); // Use any[] temporariamente
      const transformedData = data.map(med => ({
          ...med,
          id: med.id,
          quantidadeMinima: med.quantidade_minima,
          dataVencimento: med.data_vencimento,
          preco: parseFloat(med.preco) // MUDANÇA AQUI: Converter preco para número
      }));
      return transformedData;
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
      throw error;
    }
  }

  // Adicionar um novo medicamento
  static async addMedicamento(medicamentoData: Omit<Medicamento, 'id'>): Promise<Medicamento> {
    try {
        const response = await fetch(`${MedicamentoService.API_BASE_URL}/medicamentos/`, {
            method: 'POST',
            headers: MedicamentoService.getAuthHeaders(),
            body: JSON.stringify({
                nome: medicamentoData.nome,
                quantidade: medicamentoData.quantidade,
                quantidade_minima: medicamentoData.quantidadeMinima,
                categoria: medicamentoData.categoria,
                preco: medicamentoData.preco,
                data_vencimento: medicamentoData.dataVencimento,
            }),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                const newAccessToken = await AuthService.refreshAccessToken();
                if (newAccessToken) {
                    const retryResponse = await fetch(`${MedicamentoService.API_BASE_URL}/medicamentos/`, {
                        method: 'POST',
                        headers: MedicamentoService.getAuthHeaders(),
                        body: JSON.stringify({
                            nome: medicamentoData.nome,
                            quantidade: medicamentoData.quantidade,
                            quantidade_minima: medicamentoData.quantidadeMinima,
                            categoria: medicamentoData.categoria,
                            preco: medicamentoData.preco,
                            data_vencimento: medicamentoData.dataVencimento,
                        }),
                    });
                    if (retryResponse.ok) {
                        const newMedicamentoBackend: any = await retryResponse.json();
                        const newMedicamento: Medicamento = {
                            id: newMedicamentoBackend.id,
                            nome: newMedicamentoBackend.nome,
                            quantidade: newMedicamentoBackend.quantidade,
                            quantidadeMinima: newMedicamentoBackend.quantidade_minima,
                            categoria: newMedicamentoBackend.categoria,
                            preco: parseFloat(newMedicamentoBackend.preco), // MUDANÇA AQUI: Converter preco para número
                            dataVencimento: newMedicamentoBackend.data_vencimento,
                        };
                        return newMedicamento;
                    }
                }
                AuthService.logout();
                throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
            }
            const errorData = await response.json();
            throw new Error(`Erro ao adicionar medicamento: ${JSON.stringify(errorData)}`);
        }

        const newMedicamentoBackend: any = await response.json();
        const newMedicamento: Medicamento = {
            id: newMedicamentoBackend.id,
            nome: newMedicamentoBackend.nome,
            quantidade: newMedicamentoBackend.quantidade,
            quantidadeMinima: newMedicamentoBackend.quantidade_minima,
            categoria: newMedicamentoBackend.categoria,
            preco: parseFloat(newMedicamentoBackend.preco), // MUDANÇA AQUI: Converter preco para número
            dataVencimento: newMedicamentoBackend.data_vencimento,
        };
        return newMedicamento;
    } catch (error) {
        console.error('Erro ao adicionar medicamento:', error);
        throw error;
    }
  }

  // Atualizar um medicamento existente
  static async updateMedicamento(id: number | string, medicamentoData: Omit<Medicamento, 'id'>): Promise<Medicamento> {
    try {
        const response = await fetch(`${MedicamentoService.API_BASE_URL}/medicamentos/${id}/`, {
            method: 'PUT',
            headers: MedicamentoService.getAuthHeaders(),
            body: JSON.stringify({
                nome: medicamentoData.nome,
                quantidade: medicamentoData.quantidade,
                quantidade_minima: medicamentoData.quantidadeMinima,
                categoria: medicamentoData.categoria,
                preco: medicamentoData.preco,
                data_vencimento: medicamentoData.dataVencimento,
            }),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                const newAccessToken = await AuthService.refreshAccessToken();
                if (newAccessToken) {
                    const retryResponse = await fetch(`${MedicamentoService.API_BASE_URL}/medicamentos/${id}/`, {
                        method: 'PUT',
                        headers: MedicamentoService.getAuthHeaders(),
                        body: JSON.stringify({
                            nome: medicamentoData.nome,
                            quantidade: medicamentoData.quantidade,
                            quantidade_minima: medicamentoData.quantidadeMinima,
                            categoria: medicamentoData.categoria,
                            preco: medicamentoData.preco,
                            data_vencimento: medicamentoData.dataVencimento,
                        }),
                    });
                    if (retryResponse.ok) {
                        const updatedMedicamentoBackend: any = await retryResponse.json();
                        const updatedMedicamento: Medicamento = {
                            id: updatedMedicamentoBackend.id,
                            nome: updatedMedicamentoBackend.nome,
                            quantidade: updatedMedicamentoBackend.quantidade,
                            quantidadeMinima: updatedMedicamentoBackend.quantidade_minima,
                            categoria: updatedMedicamentoBackend.categoria,
                            preco: parseFloat(updatedMedicamentoBackend.preco), // MUDANÇA AQUI: Converter preco para número
                            dataVencimento: updatedMedicamentoBackend.data_vencimento,
                        };
                        return updatedMedicamento;
                    }
                }
                AuthService.logout();
                throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
            }
            const errorData = await response.json();
            throw new Error(`Erro ao atualizar medicamento: ${JSON.stringify(errorData)}`);
        }

        const updatedMedicamentoBackend: any = await response.json();
        const updatedMedicamento: Medicamento = {
            id: updatedMedicamentoBackend.id,
            nome: updatedMedicamentoBackend.nome,
            quantidade: updatedMedicamentoBackend.quantidade,
            quantidadeMinima: updatedMedicamentoBackend.quantidade_minima,
            categoria: updatedMedicamentoBackend.categoria,
            preco: parseFloat(updatedMedicamentoBackend.preco), // MUDANÇA AQUI: Converter preco para número
            dataVencimento: updatedMedicamentoBackend.data_vencimento,
        };
        return updatedMedicamento;
    } catch (error) {
        console.error('Erro ao atualizar medicamento:', error);
        throw error;
    }
  }

  // Deletar um medicamento
  static async deleteMedicamento(id: number | string): Promise<void> {
    try {
        const response = await fetch(`${MedicamentoService.API_BASE_URL}/medicamentos/${id}/`, {
            method: 'DELETE',
            headers: MedicamentoService.getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                const newAccessToken = await AuthService.refreshAccessToken();
                if (newAccessToken) {
                    const retryResponse = await fetch(`${MedicamentoService.API_BASE_URL}/medicamentos/${id}/`, {
                        method: 'DELETE',
                        headers: MedicamentoService.getAuthHeaders(),
                    });
                    if (retryResponse.ok) {
                        return;
                    }
                }
                AuthService.logout();
                throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
            }
            const errorData = await response.json();
            throw new Error(`Erro ao deletar medicamento: ${JSON.stringify(errorData)}`);
        }
    } catch (error) {
        console.error('Erro ao deletar medicamento:', error);
        throw error;
    }
  }
}
