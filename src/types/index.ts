
export interface User {
  id: string;
  email: string;
  farmaciaName: string;
  responsavelName: string;
  telefone: string;
}

export interface UserWithPassword extends User {
  senhaHash: string;
}

export interface Medicamento {
  id: string;
  nome: string;
  quantidade: number;
  quantidadeMinima: number;
  categoria: string;
  preco: number;
  dataVencimento: string;
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
  medicamentoId: string;
  tipo: 'entrada' | 'saida';
  quantidade: number;
  data: string;
  observacoes?: string;
}

export interface VendaRegistro {
  id: string;
  medicamentos: Array<{
    medicamentoId: string;
    quantidade: number;
    preco: number;
  }>;
  total: number;
  data: string;
  formaPagamento: string;
}
