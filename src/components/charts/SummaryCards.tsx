
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowUp, TrendingUp, DollarSign } from 'lucide-react';

interface SummaryCardsProps {
  totalEntradas: number;
  totalSaidas: number;
  saldoTotal: number;
  totalVendasPeriodo: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalEntradas,
  totalSaidas,
  saldoTotal,
  totalVendasPeriodo
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-2 border-farmatech-teal/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-farmatech-teal/10 rounded-full">
              <ArrowDown className="h-5 w-5 text-farmatech-teal" />
            </div>
            <div>
              <div className="text-2xl font-bold text-farmatech-teal">{totalEntradas}</div>
              <div className="text-sm text-muted-foreground">Total de Entradas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-farmatech-orange/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-farmatech-orange/10 rounded-full">
              <ArrowUp className="h-5 w-5 text-farmatech-orange" />
            </div>
            <div>
              <div className="text-2xl font-bold text-farmatech-orange">{totalSaidas}</div>
              <div className="text-sm text-muted-foreground">Total de Saídas</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-farmatech-blue/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-farmatech-blue/10 rounded-full">
              <TrendingUp className="h-5 w-5 text-farmatech-blue" />
            </div>
            <div>
              <div className={`text-2xl font-bold ${saldoTotal >= 0 ? 'text-farmatech-teal' : 'text-farmatech-orange'}`}>
                {saldoTotal >= 0 ? '+' : ''}{saldoTotal}
              </div>
              <div className="text-sm text-muted-foreground">Saldo Geral</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-farmatech-blue/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-farmatech-blue/10 rounded-full">
              <DollarSign className="h-5 w-5 text-farmatech-blue" />
            </div>
            <div>
              <div className="text-2xl font-bold text-farmatech-blue">R$ {totalVendasPeriodo.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Vendas do Período</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
