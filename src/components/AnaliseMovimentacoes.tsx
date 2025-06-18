// src/components/AnaliseMovimentacoes.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LineChart, Filter, Sparkles } from 'lucide-react'; // NOVO: Adicionado Sparkles icon
import { Movimento, Medicamento, VendaRegistro, AiAnalysisRequest, AiAnalysisResult } from '@/types'; // NOVO: Importar AiAnalysisRequest, AiAnalysisResult
import { MovimentoService } from '@/services/movimentoService';
import { MedicamentoService } from '@/services/medicamentoService';
import { VendaService } from '@/services/vendaService';
import { AiAnalyzerService } from '@/services/aiAnalyzerService'; // NOVO: Importar AiAnalyzerService
import { toast } from 'sonner';

// Importar componentes de gráficos e cards
import EstoquePieChart from './charts/EstoquePieChart';
import MovimentacoesBarChart from './charts/MovimentacoesBarChart';
import SaldoLineChart from './charts/SaldoLineChart';
import SummaryCards from './charts/SummaryCards';
import VendasBarChart from './charts/VendasBarChart';

// Componente de filtro
import MovimentacoesFiltros from './MovimentacoesFiltros';


interface AnaliseMovimentacoesProps {
  onBack: () => void;
}

const AnaliseMovimentacoes: React.FC<AnaliseMovimentacoesProps> = ({ onBack }) => {
  const [movimentos, setMovimentos] = useState<Movimento[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [vendas, setVendas] = useState<VendaRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para filtros
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [filterMedicamentoId, setFilterMedicamentoId] = useState<number | ''>('');
  const [filterTipo, setFilterTipo] = useState<'entrada' | 'saida' | ''>('');
  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState<number>(new Date().getFullYear());

  // NOVO: Estados para a funcionalidade de Análise IA
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);


  // Carregar dados de movimentos, medicamentos e vendas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedMovimentos, fetchedMedicamentos, fetchedVendas] = await Promise.all([
          MovimentoService.getMovimentos(),
          MedicamentoService.getMedicamentos(),
          VendaService.getVendas()
        ]);
        setMovimentos(fetchedMovimentos);
        setMedicamentos(fetchedMedicamentos);
        setVendas(fetchedVendas);
      } catch (err: any) {
        console.error('Erro ao carregar dados para análise de movimentações:', err);
        setError(err.message || 'Falha ao carregar dados.');
        toast.error('Erro', {
          description: err.message || 'Falha ao carregar dados para análise de movimentações.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Lógica para aplicar filtros aos movimentos e vendas (mantida)
  const filteredMovimentos = movimentos.filter(mov => {
    const movDate = new Date(mov.data);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    if (startDate && movDate < startDate) return false;
    if (endDate && movDate > endDate) return false;
    // Note: medicamentoId in Movimento is string, filterMedicamentoId is number|''
    if (filterMedicamentoId && mov.medicamentoId.toString() !== filterMedicamentoId.toString()) return false;
    if (filterTipo && mov.tipo !== filterTipo) return false;
    
    if (filterMonth && movDate.getMonth() + 1 !== filterMonth) return false;
    if (filterYear && movDate.getFullYear() !== filterYear) return false;

    return true;
  });

  const filteredVendas = vendas.filter(venda => {
    const vendaDate = new Date(venda.data);
    const startDate = filterStartDate ? new Date(filterStartDate) : null;
    const endDate = filterEndDate ? new Date(filterEndDate) : null;

    if (startDate && vendaDate < startDate) return false;
    if (endDate && vendaDate > endDate) return false;
    
    if (filterMonth && vendaDate.getMonth() + 1 !== filterMonth) return false;
    if (filterYear && vendaDate.getFullYear() !== filterYear) return false;

    return true;
  });

  // Cálculo de dados para os SummaryCards (mantida)
  const totalEntradas = filteredMovimentos
    .filter(mov => mov.tipo === 'entrada')
    .reduce((sum, mov) => sum + mov.quantidade, 0);

  const totalSaidas = filteredMovimentos
    .filter(mov => mov.tipo === 'saida')
    .reduce((sum, mov) => sum + mov.quantidade, 0);

  const saldoGeral = totalEntradas - totalSaidas;

  const vendasPeriodo = filteredVendas.reduce((sum, venda) => sum + venda.total, 0);

  // NOVO: Função para disparar a análise de IA
  const handleAnalyzeAI = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiAnalysisResult(null); // Limpa resultados anteriores

    try {
      // Coletar dados para enviar à IA. Você pode enviar os dados filtrados
      // ou apenas os parâmetros de filtro para o backend buscar novamente.
      // Neste exemplo, vamos enviar os parâmetros de filtro atuais.
      const requestData: AiAnalysisRequest = {
        startDate: filterStartDate,
        endDate: filterEndDate,
        medicamentoId: filterMedicamentoId,
        tipo: filterTipo,
        // analysisType: 'summary', // Pode ser enviado para pedir um tipo específico de análise
      };

      const result = await AiAnalyzerService.analyzeData(requestData);
      setAiAnalysisResult(result);
      toast.success('Análise de IA concluída!', {
        description: 'Os insights foram gerados com sucesso.'
      });
    } catch (err: any) {
      console.error('Erro ao analisar com IA:', err);
      setAiError(err.message || 'Falha ao gerar insights de IA.');
      toast.error('Erro na Análise de IA', {
        description: err.message || 'Não foi possível gerar insights. Tente novamente.'
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Preparar dados para o VendasBarChart
  const vendasChartData = useMemo(() => {
    const monthlyVendas = new Map<string, { vendas: number; quantidade: number }>();

    filteredVendas.forEach(venda => {
      const date = new Date(venda.data);
      const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      
      if (!monthlyVendas.has(monthYear)) {
        monthlyVendas.set(monthYear, { vendas: 0, quantidade: 0 });
      }
      
      const data = monthlyVendas.get(monthYear)!;
      data.vendas += venda.total;
      data.quantidade += venda.itens.reduce((sum, item) => sum + item.quantidade, 0);
    });

    return Array.from(monthlyVendas.entries())
      .map(([monthYear, data]) => {
        const [year, month] = monthYear.split('-');
        const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString('pt-BR', { month: 'short' });
        return {
          periodo: `${monthName} ${year}`,
          ...data
        };
      })
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  }, [filteredVendas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-farmatech-blue/5 to-farmatech-teal/5">
      {/* Header */}
      <div className="farmatech-blue text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-white/20 p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-full">
              <LineChart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Análise de Movimentações</h1>
              <p className="text-white/80 text-sm">Visão geral e tendências</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {loading ? (
          <p className="text-center text-muted-foreground">Carregando dados para análise...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <>
            {/* Componente de Filtros */}
            <MovimentacoesFiltros
              medicamentos={medicamentos}
              filterStartDate={filterStartDate}
              setFilterStartDate={setFilterStartDate}
              filterEndDate={filterEndDate}
              setFilterEndDate={setFilterEndDate}
              filterMedicamentoId={filterMedicamentoId}
              setFilterMedicamentoId={setFilterMedicamentoId}
              filterTipo={filterTipo}
              setFilterTipo={setFilterTipo}
              filterMonth={filterMonth}
              setFilterMonth={setFilterMonth}
              filterYear={filterYear}
              setFilterYear={setFilterYear}
            />

            {/* Botão para Análise de IA */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleAnalyzeAI}
                className="farmatech-blue hover:farmatech-blue-light text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
                disabled={aiLoading || loading}
              >
                {aiLoading ? (
                  <>
                    <Sparkles className="h-5 w-5 animate-spin mr-2" /> Analisando com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" /> Analisar com IA
                  </>
                )}
              </Button>
            </div>

            {/* Área para exibir os resultados da Análise de IA */}
            {aiLoading && (
              <div className="text-center text-muted-foreground mt-4 flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 animate-spin" /> Gerando insights de IA...
              </div>
            )}
            {aiError && (
              <div className="text-center text-red-500 mt-4 p-4 border border-red-300 bg-red-50 rounded-md">
                <p className="font-semibold">Erro na Análise de IA:</p>
                <p>{aiError}</p>
              </div>
            )}
            {aiAnalysisResult && aiAnalysisResult.success && (
              <div className="mt-6 p-6 bg-card rounded-lg shadow-md border border-farmatech-blue/20">
                <h3 className="text-xl font-bold text-farmatech-blue mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6" /> Insights de IA
                </h3>
                {/* Renderiza o resumo da IA, dividindo por linhas para melhor visualização */}
                <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
                  {aiAnalysisResult.summary.split('\n').map((line, index) => (
                    <p key={index} className="mb-1">{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Cards de Resumo */}
            <SummaryCards
              totalEntradas={totalEntradas}
              totalSaidas={totalSaidas}
              saldoGeral={saldoGeral}
              vendasPeriodo={vendasPeriodo}
            />

            {/* Componentes de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MovimentacoesBarChart
                movimentos={filteredMovimentos}
                medicamentos={medicamentos}
              />
              <VendasBarChart
                data={vendasChartData}
                periodoTexto="Vendas por Período"
              />
              <EstoquePieChart
                medicamentos={medicamentos}
              />
              <SaldoLineChart
                movimentos={filteredMovimentos}
              />
            </div>

            {filteredMovimentos.length === 0 && filteredVendas.length === 0 && !aiLoading && !aiAnalysisResult && (
                <div className="text-center text-muted-foreground mt-4">
                    Nenhum dado de movimentação ou venda encontrado com os filtros aplicados.
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnaliseMovimentacoes;
