// src/types/index.ts

export interface User {
  id: number; // ID do usuário do Django (geralmente number)
  email: string;
  username: string; // O backend Django usa 'username' para o campo de email que configuramos
  farmacia_id?: number; // ID da farmácia associada ao usuário (number)
  access?: string; // NOVO: Token de acesso JWT
  refresh?: string; // NOVO: Token de refresh JWT
}

export interface Medicamento {
  id?: number; // ID do medicamento do Django (geralmente number). Opcional para criação (POST).
  nome: string;
  quantidade: number;
  quantidadeMinima: number; // Frontend camelCase
  categoria: string;
  preco: number;
  dataVencimento: string; // Frontend camelCase (para input type="date", idealmente YYYY-MM-DD)
}

export interface Alerta {
  id: string;
  medicamento: Medicamento;
  tipo: 'estoque_baixo' | 'vencimento_proximo';
  mensagem: string;
  data: string;
}

export interface Movimento {
  id: string;
  medicamentoId: number;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string;
  observacoes?: string;
}

// Interface para um Item de Venda individual
export interface ItemVenda {
  medicamento: number; // ID do medicamento no backend
  medicamento_nome?: string; // Nome do medicamento (opcional, para exibição no frontend)
  quantidade: number;
  preco_unitario: number;
}

// Interface para o Registro de Venda
export interface VendaRegistro {
  id: string;
  itens: ItemVenda[]; // Agora é uma lista de ItemVenda
  total: number;
  data: string;
  formaPagamento: string; // Backend usa snake_case (forma_pagamento)
}

// NOVO: Interface para a requisição de análise de IA
export interface AiAnalysisRequest {
  startDate?: string; // Data de início para filtros
  endDate?: string;   // Data final para filtros
  medicamentoId?: number | ''; // ID do medicamento específico para análise
  tipo?: 'entrada' | 'saida' | ''; // Tipo de movimento para análise
  analysisType?: 'trends' | 'predictions' | 'anomalies' | 'summary'; // Tipo de análise solicitada
  // Você pode adicionar mais campos aqui conforme a complexidade da sua IA
}

// NOVO: Interface para o resultado da análise de IA
export interface AiAnalysisResult {
  success: boolean;
  summary: string; // O resumo textual da análise de IA
  data?: { // Dados brutos que a IA pode retornar, para gráficos ou mais detalhes
    total_entradas: number;
    total_saidas: number;
    total_vendas_valor: number;
    medicamentos_em_estoque: number;
    // Adicione outros campos de dados se a sua IA retornar
  };
  // Outros campos de insight podem ser adicionados aqui (ex: trends: any[], predictions: any[])
}
