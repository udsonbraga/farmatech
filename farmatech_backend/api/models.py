# farmatech_backend/api/models.py

from django.db import models
from django.contrib.auth.models import User

# Extensão do modelo User para incluir a relação com a Farmacia
# Um usuário terá uma farmácia, e uma farmácia terá um usuário
class Farmacia(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='farmacia')
    nome = models.CharField(max_length=200)
    responsavel = models.CharField(max_length=200)
    telefone = models.CharField(max_length=20)
    endereco = models.CharField(max_length=255, blank=True, null=True)
    cidade = models.CharField(max_length=100, blank=True, null=True)
    estado = models.CharField(max_length=100, blank=True, null=True)
    cep = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return self.nome

class Medicamento(models.Model):
    farmacia = models.ForeignKey(Farmacia, on_delete=models.CASCADE, related_name='medicamentos')
    nome = models.CharField(max_length=200)
    quantidade = models.IntegerField()
    quantidade_minima = models.IntegerField(default=0)
    categoria = models.CharField(max_length=100)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField()

    def __str__(self):
        return self.nome

class Movimento(models.Model):
    medicamento = models.ForeignKey(Medicamento, on_delete=models.CASCADE, related_name='movimentos')
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    ]
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    quantidade = models.IntegerField()
    data = models.DateTimeField(auto_now_add=True)
    observacoes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.tipo} de {self.quantidade} unidades de {self.medicamento.nome}"

class Venda(models.Model):
    farmacia = models.ForeignKey(Farmacia, on_delete=models.CASCADE, related_name='vendas')
    total = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateTimeField(auto_now_add=True)
    FORMA_PAGAMENTO_CHOICES = [
        ('dinheiro', 'Dinheiro'),
        ('cartao_credito', 'Cartão de Crédito'),
        ('cartao_debito', 'Cartão de Débito'),
        ('pix', 'Pix'),
    ]
    forma_pagamento = models.CharField(max_length=20, choices=FORMA_PAGAMENTO_CHOICES)

    def __str__(self):
        return f"Venda #{self.id} - Total: R${self.total}"

# NOVO: Modelo para os itens de uma venda
class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE, related_name='itens')
    medicamento = models.ForeignKey(Medicamento, on_delete=models.PROTECT, related_name='itens_vendidos') # PROTECT para não deletar medicamento se houver venda
    quantidade = models.IntegerField()
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2) # Preço do medicamento no momento da venda

    def __str__(self):
        return f"{self.quantidade}x {self.medicamento.nome} em Venda #{self.venda.id}"

