// src/components/AnaliseIA.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { AiAnalysisRequest, AiAnalysisResult } from '@/types';
import { AiAnalyzerService } from '@/services/aiAnalyzerService';
import { toast } from 'sonner';

interface AnaliseIAProps {
  onBack: () => void;
}

const AnaliseIA: React.FC<AnaliseIAProps> = ({ onBack }) => {
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AiAnalysisResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // NOVO: Função para disparar a análise de IA automaticamente ao carregar a tela
  // ou através de um botão, se você quiser que o usuário inicie a análise.
  // Por enquanto, vamos manter um botão para iniciar a análise, para dar controle ao usuário.
  const handleAnalyzeAI = async () => {
    setAiLoading(true);
    setAiError(null);
    setAiAnalysisResult(null); // Limpa resultados anteriores

    try {
      // Coletar dados para enviar à IA. Você pode adicionar filtros aqui se a tela tiver inputs de filtro.
      const requestData: AiAnalysisRequest = {
        // Exemplo: startDate: '2023-01-01', endDate: '2023-12-31'
        // Por enquanto, enviaremos um objeto vazio para pegar a análise geral mock do backend
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
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Análise de IA</h1>
              <p className="text-white/80 text-sm">Insights inteligentes para sua farmácia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex justify-center mt-6">
          <Button
            onClick={handleAnalyzeAI}
            className="farmatech-blue hover:farmatech-blue-light text-white font-semibold py-2 px-6 rounded-full shadow-md transition-all duration-300 transform hover:scale-105"
            disabled={aiLoading}
          >
            {aiLoading ? (
              <>
                <Sparkles className="h-5 w-5 animate-spin mr-2" /> Gerando Insights...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" /> Gerar Insights de IA
              </>
            )}
          </Button>
        </div>

        {aiLoading && (
          <div className="text-center text-muted-foreground mt-4 flex items-center justify-center gap-2">
            <Sparkles className="h-5 w-5 animate-spin" /> Processando sua solicitação...
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
              <Sparkles className="h-6 w-6" /> Resultados da Análise de IA
            </h3>
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
              {aiAnalysisResult.summary.split('\n').map((line, index) => (
                // Renderiza cada linha como um parágrafo, adicionando estilos Markdown
                <p key={index} className="mb-1" dangerouslySetInnerHTML={{ 
                  __html: line
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
                    .replace(/^- (.*)/g, '<li>$1</li>') // List items
                    // Você pode adicionar mais substituições para outros formatos Markdown (ex: *italico*)
                }}></p>
              ))}
            </div>
            {/* Opcional: Exibir dados brutos da IA para depuração ou visualização avançada */}
            {aiAnalysisResult.data && (
              <div className="mt-4 text-sm text-muted-foreground">
                <p><strong>Dados Processados:</strong></p>
                <p>Entradas: {aiAnalysisResult.data.total_entradas} | Saídas: {aiAnalysisResult.data.total_saidas}</p>
                <p>Vendas Totais: R$ {aiAnalysisResult.data.total_vendas_valor?.toFixed(2)} | Estoque Total: {aiAnalysisResult.data.medicamentos_em_estoque}</p>
              </div>
            )}
          </div>
        )}

        {!aiLoading && !aiError && !aiAnalysisResult && (
          <div className="text-center text-muted-foreground mt-8">
            Clique em "Gerar Insights de IA" para obter uma análise inteligente dos seus dados.
          </div>
        )}
      </div>
    </div>
  );
};

export default AnaliseIA;
