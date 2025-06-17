// src/components/MedicamentosAVencer.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, CalendarDays } from 'lucide-react';
import { Medicamento } from '@/types';
import { MedicamentoService } from '@/services/medicamentoService';
import { toast } from 'sonner';

interface MedicamentosAVencerProps {
  onBack: () => void;
}

const MedicamentosAVencer: React.FC<MedicamentosAVencerProps> = ({ onBack }) => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loadingMedicamentos, setLoadingMedicamentos] = useState(true);
  const [errorMedicamentos, setErrorMedicamentos] = useState<string | null>(null);

  useEffect(() => {
    const fetchMedicamentos = async () => {
      setLoadingMedicamentos(true);
      setErrorMedicamentos(null);
      try {
        const data = await MedicamentoService.getMedicamentos();
        setMedicamentos(data);
      } catch (error: any) {
        console.error('Erro ao carregar medicamentos a vencer:', error);
        setErrorMedicamentos(error.message || 'Falha ao carregar medicamentos a vencer.');
        toast.error('Erro ao carregar', {
          description: error.message || 'Verifique sua conexão e tente novamente.'
        });
      } finally {
        setLoadingMedicamentos(false);
      }
    };

    fetchMedicamentos();
  }, []);

  // Lógica para filtrar medicamentos a vencer (ex: em 90 dias)
  const medicamentosProximosVencimento = medicamentos.filter(med => {
    // Certifique-se de que dataVencimento é um string válido (YYYY-MM-DD)
    if (!med.dataVencimento) return false; 

    const hoje = new Date();
    // Ajustar a data de vencimento para evitar problemas de fuso horário
    const [ano, mes, dia] = med.dataVencimento.split('-').map(Number);
    const vencimento = new Date(ano, mes - 1, dia);

    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Considerar "próximo" se vencer em até 90 dias e ainda não venceu
    return diffDays <= 90 && diffDays > 0;
  }).sort((a, b) => {
      // Ordenar por data de vencimento (os que vencem mais cedo primeiro)
      const dateA = new Date(a.dataVencimento);
      const dateB = new Date(b.dataVencimento);
      return dateA.getTime() - dateB.getTime();
  });

  const getDaysUntilExpiration = (dateString: string) => {
    const hoje = new Date();
    const [ano, mes, dia] = dateString.split('-').map(Number);
    const vencimento = new Date(ano, mes - 1, dia);
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farmatech-teal/5 to-farmatech-blue/5">
      {/* Header */}
      <div className="farmatech-teal text-white p-6 rounded-b-3xl shadow-lg">
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
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Medicamentos a Vencer</h1>
              <p className="text-white/80 text-sm">Monitoramento de datas de validade</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="space-y-4">
          {loadingMedicamentos ? (
            <p className="text-center text-muted-foreground">Carregando medicamentos...</p>
          ) : errorMedicamentos ? (
            <p className="text-center text-red-500">{errorMedicamentos}</p>
          ) : medicamentosProximosVencimento.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/20">
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  Nenhum medicamento com vencimento próximo
                </h3>
                <p className="text-muted-foreground">
                  Todos os medicamentos estão com datas de validade distantes ou já vencidos (não mostrados aqui).
                </p>
              </CardContent>
            </Card>
          ) : (
            medicamentosProximosVencimento.map((med, index) => {
              const daysLeft = getDaysUntilExpiration(med.dataVencimento);
              const cardBorderColor = daysLeft <= 30 ? 'border-farmatech-danger' : 'border-farmatech-orange';
              
              return (
                <Card 
                  key={med.id} 
                  className={`border-l-4 ${cardBorderColor} shadow-md hover:shadow-lg transition-all duration-200 animate-fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-grow">
                      <div className={`p-3 rounded-full ${daysLeft <= 30 ? 'bg-farmatech-danger' : 'bg-farmatech-orange'} text-white flex-shrink-0`}>
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground truncate">{med.nome}</h3>
                        </div>
                        <p className="text-muted-foreground mb-2 break-words">
                          {daysLeft > 0 
                            ? `Vence em ${daysLeft} dia${daysLeft === 1 ? '' : 's'}`
                            : 'Vencido' // Caso a data de vencimento seja hoje ou no passado
                          }
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>Estoque: {med.quantidade} unid.</span>
                          <span>•</span>
                          <span>Categoria: {med.categoria}</span>
                          <span>•</span>
                          <span>R$ {med.preco?.toFixed(2)}</span> 
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm text-muted-foreground">
                        {new Date(med.dataVencimento).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicamentosAVencer;
