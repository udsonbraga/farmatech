
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Movimento } from '@/types';
import { ArrowDown, ArrowUp, TrendingUp } from 'lucide-react';
import MovimentacoesFiltros from './MovimentacoesFiltros';

interface MovimentacoesChartProps {
  movimentos: Movimento[];
}

const MovimentacoesChart: React.FC<MovimentacoesChartProps> = ({ movimentos }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = todos os meses
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Filtrar movimentos baseado nos filtros selecionados
  const movimentosFiltrados = useMemo(() => {
    return movimentos.filter(movimento => {
      const dataMovimento = new Date(movimento.data);
      const anoMovimento = dataMovimento.getFullYear();
      const mesMovimento = dataMovimento.getMonth() + 1; // getMonth() retorna 0-11, queremos 1-12

      const anoMatch = anoMovimento === selectedYear;
      const mesMatch = selectedMonth === 0 || mesMovimento === selectedMonth;

      return anoMatch && mesMatch;
    });
  }, [movimentos, selectedMonth, selectedYear]);

  // Processar dados para o gráfico - baseado no período filtrado
  const processMovimentosData = () => {
    if (selectedMonth === 0) {
      // Mostrar dados mensais do ano selecionado
      const mesesDoAno = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const nomesMeses = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];

        const movimentosDoMes = movimentosFiltrados.filter(mov => {
          const dataMovimento = new Date(mov.data);
          return dataMovimento.getMonth() + 1 === mes;
        });

        const entradas = movimentosDoMes
          .filter(mov => mov.tipo === 'entrada')
          .reduce((sum, mov) => sum + mov.quantidade, 0);

        const saidas = movimentosDoMes
          .filter(mov => mov.tipo === 'saida')
          .reduce((sum, mov) => sum + mov.quantidade, 0);

        return {
          periodo: nomesMeses[i],
          entradas,
          saidas,
          saldo: entradas - saidas
        };
      });

      return mesesDoAno;
    } else {
      // Mostrar dados diários do mês selecionado
      const diasDoMes = new Date(selectedYear, selectedMonth, 0).getDate();
      
      return Array.from({ length: Math.min(diasDoMes, 30) }, (_, i) => {
        const dia = i + 1;
        const dataFormatada = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

        const movimentosDoDia = movimentosFiltrados.filter(mov => 
          mov.data.split('T')[0] === dataFormatada
        );

        const entradas = movimentosDoDia
          .filter(mov => mov.tipo === 'entrada')
          .reduce((sum, mov) => sum + mov.quantidade, 0);

        const saidas = movimentosDoDia
          .filter(mov => mov.tipo === 'saida')
          .reduce((sum, mov) => sum + mov.quantidade, 0);

        return {
          periodo: `${dia}`,
          entradas,
          saidas,
          saldo: entradas - saidas
        };
      });
    }
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

  const totalEntradas = movimentosFiltrados
    .filter(mov => mov.tipo === 'entrada')
    .reduce((sum, mov) => sum + mov.quantidade, 0);

  const totalSaidas = movimentosFiltrados
    .filter(mov => mov.tipo === 'saida')
    .reduce((sum, mov) => sum + mov.quantidade, 0);

  const saldoTotal = totalEntradas - totalSaidas;

  const getPeriodoTexto = () => {
    if (selectedMonth === 0) {
      return `Movimentações Mensais de ${selectedYear}`;
    } else {
      const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `Movimentações Diárias - ${nomesMeses[selectedMonth - 1]} ${selectedYear}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <MovimentacoesFiltros
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
      />

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
            {getPeriodoTexto()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <BarChart data={chartData}>
              <XAxis dataKey="periodo" />
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
          <CardTitle>Tendência do Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={chartData}>
              <XAxis dataKey="periodo" />
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
