
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Movimento } from '@/types';
import { ArrowDown, ArrowUp, TrendingUp, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import MovimentacoesFiltros from './MovimentacoesFiltros';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface MovimentacoesChartProps {
  movimentos: Movimento[];
}

const MovimentacoesChart: React.FC<MovimentacoesChartProps> = ({ movimentos }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = todos os meses
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [medicamentos] = useLocalStorage('medicamentos', []);
  const [vendas] = useLocalStorage('vendas', []);

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

  // Processar dados para vendas filtradas
  const vendasFiltradas = useMemo(() => {
    return vendas.filter(venda => {
      const dataVenda = new Date(venda.data);
      const anoVenda = dataVenda.getFullYear();
      const mesVenda = dataVenda.getMonth() + 1;

      const anoMatch = anoVenda === selectedYear;
      const mesMatch = selectedMonth === 0 || mesVenda === selectedMonth;

      return anoMatch && mesMatch;
    });
  }, [vendas, selectedMonth, selectedYear]);

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

  // Processar dados de vendas
  const processVendasData = () => {
    if (selectedMonth === 0) {
      const mesesDoAno = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        const nomesMeses = [
          'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
          'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
        ];

        const vendasDoMes = vendasFiltradas.filter(venda => {
          const dataVenda = new Date(venda.data);
          return dataVenda.getMonth() + 1 === mes;
        });

        const totalVendas = vendasDoMes.reduce((sum, venda) => sum + venda.total, 0);
        const quantidadeVendas = vendasDoMes.length;

        return {
          periodo: nomesMeses[i],
          vendas: totalVendas,
          quantidade: quantidadeVendas
        };
      });

      return mesesDoAno;
    } else {
      const diasDoMes = new Date(selectedYear, selectedMonth, 0).getDate();
      
      return Array.from({ length: Math.min(diasDoMes, 30) }, (_, i) => {
        const dia = i + 1;
        const dataFormatada = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;

        const vendasDoDia = vendasFiltradas.filter(venda => 
          venda.data.split('T')[0] === dataFormatada
        );

        const totalVendas = vendasDoDia.reduce((sum, venda) => sum + venda.total, 0);
        const quantidadeVendas = vendasDoDia.length;

        return {
          periodo: `${dia}`,
          vendas: totalVendas,
          quantidade: quantidadeVendas
        };
      });
    }
  };

  // Dados dos alertas
  const alertasData = useMemo(() => {
    const alertasEstoqueBaixo = medicamentos.filter(med => med.quantidade <= med.quantidadeMinima);
    const medicamentosVencendo = medicamentos.filter(med => {
      const hoje = new Date();
      const vencimento = new Date(med.dataVencimento);
      const diffTime = vencimento.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    });

    return [
      { name: 'Estoque OK', value: medicamentos.length - alertasEstoqueBaixo.length, color: 'hsl(var(--farmatech-teal))' },
      { name: 'Estoque Baixo', value: alertasEstoqueBaixo.length, color: 'hsl(var(--farmatech-orange))' },
      { name: 'Vencendo', value: medicamentosVencendo.length, color: 'hsl(var(--farmatech-danger))' }
    ];
  }, [medicamentos]);

  const chartData = processMovimentosData();
  const vendasData = processVendasData();
  
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
    },
    vendas: {
      label: 'Vendas (R$)',
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

  const totalVendasPeriodo = vendasFiltradas.reduce((sum, venda) => sum + venda.total, 0);

  const getPeriodoTexto = () => {
    if (selectedMonth === 0) {
      return `Análise Anual - ${selectedYear}`;
    } else {
      const nomesMeses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      return `Análise Mensal - ${nomesMeses[selectedMonth - 1]} ${selectedYear}`;
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

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Movimentações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Movimentações - {getPeriodoTexto()}
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

        {/* Gráfico de Vendas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Vendas - {getPeriodoTexto()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <BarChart data={vendasData}>
                <XAxis dataKey="periodo" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="vendas" fill="var(--color-vendas)" name="Vendas (R$)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Pizza - Alertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Status do Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={alertasData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {alertasData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linha do Saldo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Tendência do Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
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
    </div>
  );
};

export default MovimentacoesChart;
