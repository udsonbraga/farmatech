// src/components/MovimentacaoEstoque.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp } from 'lucide-react';
import { Medicamento, Movimento } from '@/types';
import { toast } from 'sonner';
import { MedicamentoService } from '@/services/medicamentoService';
import { MovimentoService } from '@/services/movimentoService'; // Importar o MovimentoService

interface MovimentacaoEstoqueProps {
  onBack: () => void;
}

const MovimentacaoEstoque: React.FC<MovimentacaoEstoqueProps> = ({ onBack }) => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [movimentos, setMovimentos] = useState<Movimento[]>([]); // Agora será populado do backend
  const [loadingMedicamentos, setLoadingMedicamentos] = useState(true);
  const [errorMedicamentos, setErrorMedicamentos] = useState<string | null>(null);
  const [loadingMovimentos, setLoadingMovimentos] = useState(true); // Novo estado para carregamento de movimentos
  const [errorMovimentos, setErrorMovimentos] = useState<string | null>(null); // Novo estado para erro de movimentos

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    medicamentoId: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: '',
    observacoes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Novo estado para controlar o envio do formulário

  // useEffect para carregar MEDICAMENTOS do backend
  useEffect(() => {
    const fetchMedicamentos = async () => {
      setLoadingMedicamentos(true);
      setErrorMedicamentos(null);
      try {
        const data = await MedicamentoService.getMedicamentos();
        setMedicamentos(data);
      } catch (error: any) {
        console.error('Erro ao carregar medicamentos para movimentação:', error);
        setErrorMedicamentos(error.message || 'Falha ao carregar medicamentos.');
        toast.error('Erro ao carregar medicamentos', {
          description: error.message || 'Verifique sua conexão e tente novamente.'
        });
      } finally {
        setLoadingMedicamentos(false);
      }
    };

    fetchMedicamentos();
  }, []);

  // NOVO: useEffect para carregar MOVIMENTOS do backend
  useEffect(() => {
    const fetchMovimentos = async () => {
      setLoadingMovimentos(true);
      setErrorMovimentos(null);
      try {
        const data = await MovimentoService.getMovimentos();
        setMovimentos(data);
      } catch (error: any) {
        console.error('Erro ao carregar histórico de movimentações:', error);
        setErrorMovimentos(error.message || 'Falha ao carregar histórico de movimentações.');
        toast.error('Erro ao carregar histórico de movimentações', {
          description: error.message || 'Verifique sua conexão e tente novamente.'
        });
      } finally {
        setLoadingMovimentos(false);
      }
    };

    fetchMovimentos();
  }, []); // Executar apenas uma vez na montagem do componente

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Inicia o estado de submissão

    const selectedMedicamentoId = parseInt(formData.medicamentoId); 
    const medicamento = medicamentos.find(med => med.id === selectedMedicamentoId);

    if (!medicamento) {
      toast.error('Medicamento não encontrado! Selecione um medicamento válido.');
      setIsSubmitting(false);
      return;
    }

    const quantidade = parseInt(formData.quantidade);
    
    if (isNaN(quantidade) || quantidade <= 0) {
        toast.error('Quantidade inválida! A quantidade deve ser um número positivo.');
        setIsSubmitting(false);
        return;
    }

    if (formData.tipo === 'saida' && quantidade > medicamento.quantidade) {
      toast.error('Quantidade insuficiente em estoque!');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Calcular a nova quantidade do medicamento
      const novaQuantidade = formData.tipo === 'entrada' 
        ? medicamento.quantidade + quantidade
        : medicamento.quantidade - quantidade;

      // 2. Criar a movimentação no backend
      const newMovimento = await MovimentoService.addMovimento({
        medicamentoId: selectedMedicamentoId, // Enviar o ID numérico
        tipo: formData.tipo,
        quantidade,
        observacoes: formData.observacoes,
      });

      // 3. Atualizar o medicamento no backend (estoque)
      const updatedMedicamento = await MedicamentoService.updateMedicamento(selectedMedicamentoId, {
        ...medicamento, // Manter os dados existentes do medicamento
        quantidade: novaQuantidade, // Apenas atualiza a quantidade
      });

      // 4. Atualizar o estado do frontend (lista de medicamentos e lista de movimentos)
      setMedicamentos(prev => prev.map(med => 
        med.id === updatedMedicamento.id 
          ? updatedMedicamento // Usa o objeto atualizado retornado pelo backend
          : med
      ));
      setMovimentos(prev => [newMovimento, ...prev]); // Adiciona a nova movimentação ao início da lista

      toast.success(`${formData.tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
      resetForm();

    } catch (error: any) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error('Erro ao registrar movimentação', {
        description: error.message || 'Verifique sua conexão e tente novamente.'
      });
    } finally {
      setIsSubmitting(false); // Finaliza o estado de submissão
    }
  };

  const resetForm = () => {
    setFormData({
      medicamentoId: '',
      tipo: 'entrada',
      quantidade: '',
      observacoes: ''
    });
    setShowForm(false);
  };

  const getMedicamentoNome = (medicamentoId: number | string) => {
    const medicamento = medicamentos.find(med => med.id == medicamentoId);
    return medicamento?.nome || 'Medicamento removido';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-farmatech-teal/5 to-farmatech-blue/5">
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
              <ArrowRight className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Entradas e Saídas</h1>
              <p className="text-white/80 text-sm">Controle de movimentação</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!showForm ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Histórico de Movimentações</h2>
              <Button
                onClick={() => setShowForm(true)}
                className="farmatech-blue hover:farmatech-blue-light text-white"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Nova Movimentação
              </Button>
            </div>

            <div className="space-y-4">
              {loadingMovimentos ? (
                <p className="text-center text-muted-foreground">Carregando histórico de movimentações...</p>
              ) : errorMovimentos ? (
                <p className="text-center text-red-500">{errorMovimentos}</p>
              ) : movimentos.length === 0 ? (
                <Card className="border-2 border-dashed border-muted-foreground/20">
                  <CardContent className="p-12 text-center">
                    <ArrowRight className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Nenhuma movimentação registrada
                    </h3>
                    <p className="text-muted-foreground">
                      Registre sua primeira entrada ou saída de medicamentos.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                movimentos.map((movimento) => (
                  <Card key={movimento.id} className="hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            movimento.tipo === 'entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {movimento.tipo === 'entrada' ? <ArrowDown className="h-5 w-5" /> : <ArrowUp className="h-5 w-5" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{getMedicamentoNome(movimento.medicamentoId)}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Quantidade: {movimento.quantidade}</span>
                              <span>•</span>
                              <span>{new Date(movimento.data).toLocaleDateString('pt-BR')} às {new Date(movimento.data).toLocaleTimeString('pt-BR')}</span>
                              {movimento.observacoes && (
                                <>
                                  <span>•</span>
                                  <span>{movimento.observacoes}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge variant={movimento.tipo === 'entrada' ? 'secondary' : 'destructive'}>
                          {movimento.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Nova Movimentação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicamentoId">Medicamento</Label>
                  {loadingMedicamentos ? (
                    <p>Carregando medicamentos...</p>
                  ) : errorMedicamentos ? (
                    <p className="text-red-500">{errorMedicamentos}</p>
                  ) : medicamentos.length === 0 ? (
                    <p className="text-muted-foreground">Nenhum medicamento cadastrado. Cadastre um em "Produtos em Estoque" primeiro.</p>
                  ) : (
                    <select
                      id="medicamentoId"
                      value={formData.medicamentoId}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicamentoId: e.target.value }))}
                      className="w-full p-2 border border-input rounded-md"
                      required
                      disabled={isSubmitting} // Desabilita durante o envio
                    >
                      <option value="">Selecione um medicamento</option>
                      {medicamentos.map((medicamento) => (
                        <option key={medicamento.id} value={String(medicamento.id)}> 
                          {medicamento.nome} (Estoque: {medicamento.quantidade})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Movimentação</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'entrada' | 'saida' }))}
                    className="w-full p-2 border border-input rounded-md"
                    required
                    disabled={isSubmitting} // Desabilita durante o envio
                  >
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                    required
                    disabled={isSubmitting} // Desabilita durante o envio
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Motivo, fornecedor, etc."
                    disabled={isSubmitting} // Desabilita durante o envio
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="farmatech-blue hover:farmatech-blue-light text-white" disabled={isSubmitting}>
                    {isSubmitting ? 'Registrando...' : 'Registrar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MovimentacaoEstoque;
