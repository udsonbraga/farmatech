# farmatech_backend/api/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import User
from .models import Farmacia, Medicamento, Movimento, Venda, ItemVenda
from .serializers import (
    FarmaciaSerializer,
    MedicamentoSerializer,
    MovimentoSerializer,
    VendaSerializer,
    UserSerializer,
    RegisterSerializer
)

# Importar componentes JWT
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# Importar Google Generative AI
import google.generativeai as genai
import os # Para acessar variáveis de ambiente

# Configurar a Gemini API Key
genai.configure(api_key="AIzaSyA0q1moqQ_6j6BPvEricBOX-9uaYRofUEo") 

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            result = serializer.save()
            user = result['user']
            farmacia = result['farmacia']

            jwt_serializer = TokenObtainPairSerializer(data={
                'username': user.email,
                'password': serializer.validated_data['senha']
            })
            if jwt_serializer.is_valid(raise_exception=True):
                tokens = jwt_serializer.validated_data

                return Response({
                    'success': True,
                    'message': 'Usuário e Farmácia registrados com sucesso!',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'farmacia_id': farmacia.id
                    },
                    'access': str(tokens['access']),
                    'refresh': str(tokens['refresh']),
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({'success': False, 'message': 'Erro ao gerar tokens JWT'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({'success': False, 'message': f'Erro ao processar registro: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('username')
    senha = request.data.get('password')

    user = authenticate(request, username=email, password=senha)

    if user is not None:
        jwt_serializer = TokenObtainPairSerializer(data={'username': email, 'password': senha})
        if jwt_serializer.is_valid(raise_exception=True):
            tokens = jwt_serializer.validated_data

            farmacia_id = None
            try:
                farmacia = Farmacia.objects.get(user=user)
                farmacia_id = farmacia.id
            except Farmacia.DoesNotExist:
                pass 

            return Response({
                'success': True,
                'message': 'Login realizado com sucesso!',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'farmacia_id': farmacia_id
                },
                'access': str(tokens['access']),
                'refresh': str(tokens['refresh']),
            }, status=status.HTTP_200_OK)
        else:
            return Response({'success': False, 'message': 'Erro ao gerar tokens JWT'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        return Response({'success': False, 'message': 'Credenciais inválidas'}, status=status.HTTP_400_BAD_REQUEST)

# ViewSets de API existentes - usarão JWTAuthentication
class FarmaciaViewSet(viewsets.ModelViewSet):
    queryset = Farmacia.objects.all()
    serializer_class = FarmaciaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Farmacia.objects.filter(user=self.request.user)

class MedicamentoViewSet(viewsets.ModelViewSet):
    serializer_class = MedicamentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            try:
                farmacia = Farmacia.objects.get(user=self.request.user)
                return Medicamento.objects.filter(farmacia=farmacia)
            except Farmacia.DoesNotExist:
                return Medicamento.objects.none()
        return Medicamento.objects.none()

    def perform_create(self, serializer):
        try:
            farmacia = Farmacia.objects.get(user=self.request.user)
            serializer.save(farmacia=farmacia)
        except Farmacia.DoesNotExist:
            raise status.HTTP_400_BAD_REQUEST({"detail": "Farmácia do usuário não encontrada."})

class MovimentoViewSet(viewsets.ModelViewSet):
    queryset = Movimento.objects.all()
    serializer_class = MovimentoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            try:
                farmacia = Farmacia.objects.get(user=self.request.user)
                return Movimento.objects.filter(medicamento__farmacia=farmacia)
            except Farmacia.DoesNotExist:
                return Movimento.objects.none()
        return Movimento.objects.none()

class VendaViewSet(viewsets.ModelViewSet):
    queryset = Venda.objects.all()
    serializer_class = VendaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Filtra vendas pela farmácia do usuário logado
        if self.request.user.is_authenticated:
            try:
                farmacia = Farmacia.objects.get(user=self.request.user)
                return Venda.objects.filter(farmacia=farmacia)
            except Farmacia.DoesNotExist:
                return Venda.objects.none()
        return Venda.objects.none()

    def perform_create(self, serializer):
        # Associa a venda à farmácia do usuário logado
        try:
            farmacia = Farmacia.objects.get(user=self.request.user)
            serializer.save(farmacia=farmacia)
        except Farmacia.DoesNotExist:
            raise status.HTTP_400_BAD_REQUEST({"detail": "Farmácia do usuário não encontrada."})

# View para Análise de IA (INTEGRAÇÃO COM GEMINI)
class AiAnalyzeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        filters = request.data
        
        try:
            farmacia = request.user.farmacia
            print("Farmácia encontrada:", farmacia.nome)
        except Farmacia.DoesNotExist:
            print("Erro: Farmácia do usuário não encontrada.")
            return Response({'detail': 'Farmácia do usuário não encontrada.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            medicamentos_data = Medicamento.objects.filter(farmacia=farmacia)
            movimentos_data = Movimento.objects.filter(medicamento__farmacia=farmacia)
            vendas_data = Venda.objects.filter(farmacia=farmacia)
            print(f"Dados coletados: {medicamentos_data.count()} medicamentos, {movimentos_data.count()} movimentos, {vendas_data.count()} vendas.")

            medicamentos_list = []
            for med in medicamentos_data:
                medicamentos_list.append(
                    f"- Nome: {med.nome}, Estoque: {med.quantidade}, Mínimo: {med.quantidade_minima}, Categoria: {med.categoria}, Preço: R${med.preco:.2f}, Vencimento: {med.data_vencimento}"
                )

            movimentos_list = []
            for mov in movimentos_data:
                movimentos_list.append(
                    f"- Medicamento: {mov.medicamento.nome}, Tipo: {mov.tipo}, Qtd: {mov.quantidade}, Data: {mov.data.strftime('%Y-%m-%d %H:%M')}, Obs: {mov.observacoes or 'N/A'}"
                )
            
            vendas_list = []
            for venda in vendas_data:
                itens_vendidos = []
                if hasattr(venda, 'itens') and venda.itens.exists():
                    for item in venda.itens.all(): 
                        itens_vendidos.append(f"{item.quantidade}x {item.medicamento.nome} (R${item.preco_unitario:.2f}/unid)")
                vendas_list.append(
                    f"- Venda ID: {venda.id}, Total: R${venda.total:.2f}, Data: {venda.data.strftime('%Y-%m-%d %H:%M')}, Forma Pagamento: {venda.forma_pagamento}, Itens: {', '.join(itens_vendidos or ['N/A'])}"
                )
            print("Dados formatados para prompt.")

            prompt = (
                f"Você é um analista de dados de farmácia inteligente. Analise os seguintes dados "
                f"da Farmácia '{farmacia.nome}' e forneça insights sobre o estoque, vendas e movimentações.\n"
                f"Os insights devem cobrir: Visão Geral, Tendências, Alertas e Recomendações.\n"
                f"Formate a resposta de forma clara, usando títulos e bullet points, mas em texto corrido e não JSON.\n\n"
                f"--- Dados da Farmácia ---\n"
                f"Medicamentos em estoque:\n{'- N/A' if not medicamentos_list else '\\n'.join(medicamentos_list)}\n\n"
                f"Movimentações de estoque recentes:\n{'- N/A' if not movimentos_list else '\\n'.join(movimentos_list)}\n\n"
                f"Histórico de vendas:\n{'- N/A' if not vendas_list else '\\n'.join(vendas_list)}\n\n"
                f"--- Análise Solicitada ---\n"
                f"1. Visão Geral do Período: Resumo dos principais números (total de unidades em estoque, total de vendas, etc.).\n"
                f"2. Insights de Tendência: Quais padrões ou mudanças você observa nos dados de vendas ou estoque ao longo do tempo? Há picos, quedas, sazonalidade?\n"
                f"3. Alertas de Anomalias: Existem dados incomuns, discrepâncias ou situações que requerem atenção imediata (ex: estoque negativo, vendas muito altas/baixas de um item específico)?\n"
                f"4. Recomendações: Com base na análise, quais ações você sugere para otimizar o estoque, aumentar vendas ou melhorar a gestão da farmácia?\n"
                f"--- Fim da Análise Solicitada ---\n"
            )
            print("Prompt construído. Enviando para Gemini API...")

            # CORRIGIDO: Usando 'gemini-1.5-flash-latest'
            model = genai.GenerativeModel('gemini-1.5-flash-latest') 
            response_ia = model.generate_content(prompt)
            ai_summary = response_ia.text
            print("Resposta do Gemini recebida.")
            
            return Response({
                'success': True,
                'summary': ai_summary,
                'data': { # Dados brutos que podem ser usados para gráficos ou mais detalhes
                    'total_entradas': sum(m.quantidade for m in movimentos_data if m.tipo == 'entrada'),
                    'total_saidas': sum(m.quantidade for m in movimentos_data if m.tipo == 'saida'),
                    'total_vendas_valor': sum(v.total for v in vendas_data),
                    'medicamentos_em_estoque': sum(m.quantidade for m in medicamentos_data)
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Erro ao chamar Gemini API ou processar dados: {e}")
            return Response({
                'success': False,
                'summary': 'Erro ao gerar insights de IA. Por favor, tente novamente mais tarde. (Detalhes: ' + str(e) + ')',
                'data': {}
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
