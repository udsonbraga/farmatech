// src/services/aiAnalyzerService.ts

import { AiAnalysisRequest, AiAnalysisResult } from '@/types'; // Importa as novas interfaces
import { AuthService } from './authService'; // Importa o AuthService para obter o token JWT

export class AiAnalyzerService {
  // ATENÇÃO: Certifique-se de que esta URL corresponde à URL do seu backend Django.
  // Se estiver usando ngrok, use a URL HTTPS do ngrok aqui.
  private static readonly API_BASE_URL = 'http://127.0.0.1:8000/api';

  // Helper para obter os cabeçalhos de autenticação com o token JWT
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

  /**
   * Envia uma requisição para a API de análise de IA no backend.
   * @param requestData Dados e filtros para a análise de IA.
   * @returns Uma promessa que resolve para os resultados da análise de IA.
   */
  static async analyzeData(requestData: AiAnalysisRequest): Promise<AiAnalysisResult> {
    try {
      const response = await fetch(`${AiAnalyzerService.API_BASE_URL}/analyze-ai/`, {
        method: 'POST',
        headers: AiAnalyzerService.getAuthHeaders(),
        body: JSON.stringify(requestData), // Envia os dados da requisição de IA
      });

      if (!response.ok) {
        // Se o token estiver expirado ou não autorizado, tenta renovar e retentar
        if (response.status === 401 || response.status === 403) {
            const newAccessToken = await AuthService.refreshAccessToken();
            if (newAccessToken) {
                // Tenta a requisição novamente com o novo token
                const retryResponse = await fetch(`${AiAnalyzerService.API_BASE_URL}/analyze-ai/`, {
                    method: 'POST',
                    headers: AiAnalyzerService.getAuthHeaders(),
                    body: JSON.stringify(requestData),
                });
                if (retryResponse.ok) {
                    return await retryResponse.json() as AiAnalysisResult;
                }
            }
            // Se não conseguiu renovar ou a retentativa falhou, desloga o usuário
            AuthService.logout();
            throw new Error('Sessão expirada ou não autorizada. Faça login novamente.');
        }
        // Se for outro tipo de erro, lê a mensagem de erro da resposta
        const errorDetail = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
        throw new Error(`Erro ao analisar dados com IA: ${errorDetail.detail || response.statusText}`);
      }

      // Retorna a resposta da IA
      return await response.json() as AiAnalysisResult;

    } catch (error: any) {
      console.error('Erro no serviço AiAnalyzerService:', error);
      throw error;
    }
  }
}
