
import { useMemo } from 'react';
import { Movimento } from '@/types';

interface UseChartDataProps {
  movimentos: Movimento[];
  vendas: any[];
  selectedMonth: number;
  selectedYear: number;
}

export const useChartData = ({ movimentos, vendas, selectedMonth, selectedYear }: UseChartDataProps) => {
  // Filtrar movimentos baseado nos filtros selecionados
  const movimentosFiltrados = useMemo(() => {
    return movimentos.filter(movimento => {
      const dataMovimento = new Date(movimento.data);
      const anoMovimento = dataMovimento.getFullYear();
      const mesMovimento = dataMovimento.getMonth() + 1;

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

  // Processar dados para o gráfico de movimentações
  const movimentacoesData = useMemo(() => {
    if (selectedMonth === 0) {
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
  }, [movimentosFiltrados, selectedMonth, selectedYear]);

  // Processar dados de vendas
  const vendasData = useMemo(() => {
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
  }, [vendasFiltradas, selectedMonth, selectedYear]);

  return {
    movimentosFiltrados,
    vendasFiltradas,
    movimentacoesData,
    vendasData
  };
};
