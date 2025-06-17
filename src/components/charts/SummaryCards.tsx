// src/components/charts/SummaryCards.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDown, ArrowUp, DollarSign, Scale } from 'lucide-react'; // Ícones para os cards

interface SummaryCardsProps {
  totalEntradas: number;
  totalSaidas: number;
  saldoGeral: number;
  vendasPeriodo: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalEntradas,
  totalSaidas,
  saldoGeral,
  vendasPeriodo,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card: Total de Entradas */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
          <ArrowDown className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{totalEntradas}</div>
          <p className="text-xs text-muted-foreground">Unidades recebidas no período</p>
        </CardContent>
      </Card>

      {/* Card: Total de Saídas */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
          <ArrowUp className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{totalSaidas}</div>
          <p className="text-xs text-muted-foreground">Unidades dispensadas no período</p>
        </CardContent>
      </Card>

      {/* Card: Saldo Geral */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Geral</CardTitle>
          <Scale className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{saldoGeral}</div>
          <p className="text-xs text-muted-foreground">Variação total de estoque</p>
        </CardContent>
      </Card>

      {/* Card: Vendas do Período */}
      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendas do Período</CardTitle>
          <DollarSign className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">R$ {vendasPeriodo.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Valor total de vendas</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
