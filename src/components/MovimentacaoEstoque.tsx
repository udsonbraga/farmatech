
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, ArrowDown, ArrowUp } from 'lucide-react';
import { Medicamento, Movimento } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

interface MovimentacaoEstoqueProps {
  onBack: () => void;
}

const MovimentacaoEstoque: React.FC<MovimentacaoEstoqueProps> = ({ onBack }) => {
  const [medicamentos, setMedicamentos] = useLocalStorage<Medicamento[]>('medicamentos', []);
  const [movimentos, setMovimentos] = useLocalStorage<Movimento[]>('movimentos', []);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    medicamentoId: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    quantidade: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const medicamento = medicamentos.find(med => med.id === formData.medicamentoId);
    if (!medicamento) {
      toast.error('Medicamento não encontrado!');
      return;
    }

    const quantidade = parseInt(formData.quantidade);
    
    if (formData.tipo === 'saida' && quantidade > medicamento.quantidade) {
      toast.error('Quantidade insuficiente em estoque!');
      return;
    }

    const movimento: Movimento = {
      id: Date.now().toString(),
      medicamentoId: formData.medicamentoId,
      tipo: formData.tipo,
      quantidade,
      data: new Date().toISOString(),
      observacoes: formData.observacoes
    };

    // Atualizar estoque do medicamento
    const novaQuantidade = formData.tipo === 'entrada' 
      ? medicamento.quantidade + quantidade
      : medicamento.quantidade - quantidade;

    setMedicamentos(prev => prev.map(med => 
      med.id === formData.medicamentoId 
        ? { ...med, quantidade: novaQuantidade }
        : med
    ));

    setMovimentos(prev => [movimento, ...prev]);
    
    toast.success(`${formData.tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada com sucesso!`);
    resetForm();
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

  const getMedicamentoNome = (medicamentoId: string) => {
    const medicamento = medicamentos.find(med => med.id === medicamentoId);
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
              {movimentos.map((movimento) => (
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
              ))}

              {movimentos.length === 0 && (
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
                  <select
                    id="medicamentoId"
                    value={formData.medicamentoId}
                    onChange={(e) => setFormData(prev => ({ ...prev, medicamentoId: e.target.value }))}
                    className="w-full p-2 border border-input rounded-md"
                    required
                  >
                    <option value="">Selecione um medicamento</option>
                    {medicamentos.map((medicamento) => (
                      <option key={medicamento.id} value={medicamento.id}>
                        {medicamento.nome} (Estoque: {medicamento.quantidade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Movimentação</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as 'entrada' | 'saida' }))}
                    className="w-full p-2 border border-input rounded-md"
                    required
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
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações (opcional)</Label>
                  <Input
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Motivo, fornecedor, etc."
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="farmatech-blue hover:farmatech-blue-light text-white">
                    Registrar
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
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
