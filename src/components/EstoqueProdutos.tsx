
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Medicamento } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

interface EstoqueProdutosProps {
  onBack: () => void;
}

const EstoqueProdutos: React.FC<EstoqueProdutosProps> = ({ onBack }) => {
  const [medicamentos, setMedicamentos] = useLocalStorage<Medicamento[]>('medicamentos', []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    nome: '',
    quantidade: '',
    quantidadeMinima: '',
    categoria: '',
    preco: '',
    dataVencimento: ''
  });

  const filteredMedicamentos = medicamentos.filter(med =>
    med.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const medicamento: Medicamento = {
      id: editingId || Date.now().toString(),
      nome: formData.nome,
      quantidade: parseInt(formData.quantidade),
      quantidadeMinima: parseInt(formData.quantidadeMinima),
      categoria: formData.categoria,
      preco: parseFloat(formData.preco),
      dataVencimento: formData.dataVencimento
    };

    if (editingId) {
      setMedicamentos(prev => prev.map(med => med.id === editingId ? medicamento : med));
      toast.success('Medicamento atualizado com sucesso!');
    } else {
      setMedicamentos(prev => [...prev, medicamento]);
      toast.success('Medicamento cadastrado com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      quantidade: '',
      quantidadeMinima: '',
      categoria: '',
      preco: '',
      dataVencimento: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (medicamento: Medicamento) => {
    setFormData({
      nome: medicamento.nome,
      quantidade: medicamento.quantidade.toString(),
      quantidadeMinima: medicamento.quantidadeMinima.toString(),
      categoria: medicamento.categoria,
      preco: medicamento.preco.toString(),
      dataVencimento: medicamento.dataVencimento
    });
    setEditingId(medicamento.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setMedicamentos(prev => prev.filter(med => med.id !== id));
    toast.success('Medicamento removido com sucesso!');
  };

  const getStatusBadge = (medicamento: Medicamento) => {
    if (medicamento.quantidade <= medicamento.quantidadeMinima) {
      return <Badge variant="destructive">Estoque Baixo</Badge>;
    }
    return <Badge variant="secondary">Disponível</Badge>;
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
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Produtos em Estoque</h1>
              <p className="text-white/80 text-sm">Gerencie seu inventário</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {!showForm ? (
          <>
            {/* Search and Add Button */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar medicamentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                onClick={() => setShowForm(true)}
                className="farmatech-teal hover:farmatech-teal-light text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Medicamentos List */}
            <div className="space-y-4">
              {filteredMedicamentos.map((medicamento) => (
                <Card key={medicamento.id} className="hover:shadow-lg transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{medicamento.nome}</h3>
                          {getStatusBadge(medicamento)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Quantidade:</span> {medicamento.quantidade}
                          </div>
                          <div>
                            <span className="font-medium">Categoria:</span> {medicamento.categoria}
                          </div>
                          <div>
                            <span className="font-medium">Preço:</span> R$ {medicamento.preco.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Vencimento:</span> {new Date(medicamento.dataVencimento).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(medicamento)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(medicamento.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {filteredMedicamentos.length === 0 && (
                <Card className="border-2 border-dashed border-muted-foreground/20">
                  <CardContent className="p-12 text-center">
                    <Package className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      Nenhum medicamento encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm ? 'Tente uma busca diferente.' : 'Adicione seu primeiro medicamento ao estoque.'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        ) : (
          /* Form */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar' : 'Adicionar'} Medicamento</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome do Medicamento</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input
                      id="categoria"
                      value={formData.categoria}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidade">Quantidade</Label>
                    <Input
                      id="quantidade"
                      type="number"
                      value={formData.quantidade}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantidadeMinima">Quantidade Mínima</Label>
                    <Input
                      id="quantidadeMinima"
                      type="number"
                      value={formData.quantidadeMinima}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantidadeMinima: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço (R$)</Label>
                    <Input
                      id="preco"
                      type="number"
                      step="0.01"
                      value={formData.preco}
                      onChange={(e) => setFormData(prev => ({ ...prev, preco: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dataVencimento">Data de Vencimento</Label>
                    <Input
                      id="dataVencimento"
                      type="date"
                      value={formData.dataVencimento}
                      onChange={(e) => setFormData(prev => ({ ...prev, dataVencimento: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button type="submit" className="farmatech-teal hover:farmatech-teal-light text-white">
                    {editingId ? 'Atualizar' : 'Cadastrar'}
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

export default EstoqueProdutos;
