# api/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Farmacia, Medicamento, Movimento, Venda, ItemVenda # NOVO: Importar ItemVenda

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class FarmaciaSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Farmacia
        fields = '__all__'

class MedicamentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicamento
        fields = '__all__'
        extra_kwargs = {
            'farmacia': {'required': False, 'allow_null': True}
        }

class MovimentoSerializer(serializers.ModelSerializer):
    medicamento = serializers.PrimaryKeyRelatedField(queryset=Medicamento.objects.all())

    class Meta:
        model = Movimento
        fields = '__all__'
        read_only_fields = ['id', 'data']

    def create(self, validated_data):
        medicamento = validated_data['medicamento']
        tipo = validated_data['tipo']
        quantidade = validated_data['quantidade']

        if tipo == 'entrada':
            medicamento.quantidade += quantidade
        elif tipo == 'saida':
            if medicamento.quantidade < quantidade:
                raise serializers.ValidationError("Quantidade insuficiente em estoque.")
            medicamento.quantidade -= quantidade
        medicamento.save()

        movimento = Movimento.objects.create(**validated_data)
        return movimento

# NOVO: Serializer para Item de Venda (para lidar com a lista de medicamentos em uma venda)
class ItemVendaSerializer(serializers.ModelSerializer):
    medicamento_nome = serializers.CharField(source='medicamento.nome', read_only=True) # Para exibir o nome do medicamento

    class Meta:
        model = ItemVenda
        fields = ['id', 'medicamento', 'medicamento_nome', 'quantidade', 'preco_unitario']
        read_only_fields = ['id']

# MODIFICADO: VendaSerializer para incluir itens aninhados e lógica de estoque
class VendaSerializer(serializers.ModelSerializer):
    # Usar um campo de escrita para receber a lista de itens e um campo de leitura para retornar
    itens = ItemVendaSerializer(many=True) # Permitir múltiplos itens de venda aninhados
    
    class Meta:
        model = Venda
        fields = ['id', 'farmacia', 'total', 'data', 'forma_pagamento', 'itens']
        read_only_fields = ['id', 'farmacia', 'data'] # Farmacia será definida no ViewSet

    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        farmacia = self.context['request'].user.farmacia # Obtém a farmácia do usuário logado

        # Calcula o total da venda a partir dos itens, se não foi fornecido
        total_venda = sum(item['quantidade'] * item['preco_unitario'] for item in itens_data)
        validated_data['total'] = total_venda
        validated_data['farmacia'] = farmacia

        venda = Venda.objects.create(**validated_data)

        for item_data in itens_data:
            medicamento = item_data['medicamento']
            quantidade_vendida = item_data['quantidade']

            # Atualiza o estoque do medicamento
            if medicamento.quantidade < quantidade_vendida:
                raise serializers.ValidationError(f"Quantidade insuficiente em estoque para {medicamento.nome}.")
            medicamento.quantidade -= quantidade_vendida
            medicamento.save()

            ItemVenda.objects.create(venda=venda, **item_data)
        
        return venda

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True)
    farmaciaName = serializers.CharField(max_length=200)
    responsavelName = serializers.CharField(max_length=200)
    telefone = serializers.CharField(max_length=20)

    def create(self, validated_data):
        email = validated_data['email']
        senha = validated_data['senha']
        farmacia_name = validated_data['farmaciaName']
        responsavel_name = validated_data['responsavelName']
        telefone = validated_data['telefone']

        user = User.objects.create_user(username=email, email=email, password=senha)
        
        farmacia = Farmacia.objects.create(
            user=user,
            nome=farmacia_name,
            responsavel=responsavel_name,
            telefone=telefone
        )
        return {'user': user, 'farmacia': farmacia}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este e-mail já está em uso.")
        return value
