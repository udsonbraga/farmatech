
import React, { useState, useMemo } from 'react';
import { Movimento } from '@/types';
import MovimentacoesFiltros from './MovimentacoesFiltros';
import SummaryCards from './charts/SummaryCards';
import MovimentacoesBarChart from './charts/MovimentacoesBarChart';
import VendasBarChart from './charts/VendasBarChart';
import EstoquePieChart from './charts/EstoquePieChart';
import SaldoLineChart from './charts/SaldoLineChart';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useChartData } from '@/hooks/useChartData';

interface MovimentacoesChartProps {
  movimentos: Movimento[];
}

const MovimentacoesChart: React.FC<MovimentacoesChartProps> = ({ movimentos }) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [medicamentos] = useLocalStorage('medicamentos', []);
  const [vendas] = useLocalStorage('vendas', []);

  const { movimentosFiltrados, vendasFiltradas, movimentacoesData, vendasData } = useChartData({
    movimentos,
    vendas,
    selectedMonth,
    selectedYear
  });

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
        medicamentos={medicamentos}
        filterStartDate=""
        setFilterStartDate={() => {}}
        filterEndDate=""
        setFilterEndDate={() => {}}
        filterMedicamentoId=""
        setFilterMedicamentoId={() => {}}
        filterTipo=""
        setFilterTipo={() => {}}
        filterMonth={selectedMonth}
        setFilterMonth={setSelectedMonth}
        filterYear={selectedYear}
        setFilterYear={setSelectedYear}
      />

      {/* Resumo das Movimentações */}
      <SummaryCards
        totalEntradas={totalEntradas}
        totalSaidas={totalSaidas}
        saldoGeral={saldoTotal}
        vendasPeriodo={totalVendasPeriodo}
      />

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MovimentacoesBarChart 
          movimentos={movimentosFiltrados}
          medicamentos={medicamentos}
        />
        
        <VendasBarChart 
          data={vendasData} 
          periodoTexto={getPeriodoTexto()} 
        />
        
        <EstoquePieChart medicamentos={medicamentos} />
        
        <SaldoLineChart movimentos={movimentosFiltrados} />
      </div>
    </div>
  );
};

export default MovimentacoesChart;
