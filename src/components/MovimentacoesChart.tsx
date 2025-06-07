
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Movimento } from '@/types';
import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';

interface MovimentacoesChartProps {
  movimentos: Movimento[];
}

const MovimentacoesChart: React.FC<MovimentacoesChartProps> = ({ movimentos }) => {
  // Processar dados para o gráfico - últimos 7 dias
  const processMovimentosData = () => {
    const hoje = new Date();
    const ultimosSeteDias = Array.from({ length: 7 }, (_, i) => {
      const data = new Date(hoje);
      data.setDate(data.getDate() - (6 - i));
      return data.toISOString().split('T')[0];
    });

    return ultimosSeteDias.map(dia => {
      const movimentosDia = movimentos.filter(mov => 
        mov.data.split('T')[0] === dia
      );

      const entradas = movimentosDia
        .filter(mov => mov.tipo === 'entrada')
        .reduce((sum, mov) => sum + mov.quantidade, 0);

      const saidas = movimentosDia
        .filter(mov => mov.tipo === 'saida')
        .reduce((sum, mov) => sum + mov.quantidade, 0);

      const diaFormatado = new Date(dia).toLocaleDateString('pt-BR', { 
        weekday: 'short',
        day: '2-digit'
      });

      return {
        dia: diaFormatado,
        entradas,
        saidas,
        saldo: entradas - saidas
      };
    });
  };

  const chartData = processMovimentosData();
  
  const chartConfig = {
    entradas: {
      label: 'Entradas',
      color: 'hsl(var(--farmatech-teal))'
    },
    saidas: {
      label: 'Saídas',
      color: 'hsl(var(--farmatech-orange))'
    },
    saldo: {
      label: 'Saldo',
      color: 'hsl(var(--farmatech-blue))'
    }
  };

  const totalEntradas = movimentos
    .filter(mov => mov.tipo === 'entrada')
    .reduce((sum, mov) => sum + mov.quantidade, 0);

  const totalSaidas = movimentos
    .filter(mov => mov.tipo === 'saida')
    .reduce((sum, mov) => sum + mov.quantidade, 0);

  const saldoTotal = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      {/* Resumo das Movimentações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Gráfico de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Movimentações dos Últimos 7 Dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={chartData}>
              <XAxis dataKey="dia" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="entradas" fill="var(--color-entradas)" name="Entradas" />
              <Bar dataKey="saidas" fill="var(--color-saidas)" name="Saídas" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Linha do Saldo */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência do Saldo Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={chartData}>
              <XAxis dataKey="dia" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="var(--color-saldo)" 
                strokeWidth={3}
                dot={{ fill: "var(--color-saldo)", strokeWidth: 2, r: 4 }}
                name="Saldo"
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default MovimentacoesChart;
