# farmatech_backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_view,
    login_view,
    MedicamentoViewSet,
    FarmaciaViewSet,
    MovimentoViewSet,
    VendaViewSet,
    AiAnalyzeView, # NOVO: Importar a nova view de análise de IA
)

# Importar as views JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'medicamentos', MedicamentoViewSet, basename='medicamento')
router.register(r'farmacias', FarmaciaViewSet, basename='farmacia')
router.register(r'movimentos', MovimentoViewSet, basename='movimento')
router.register(r'vendas', VendaViewSet, basename='venda')


urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),

    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('analyze-ai/', AiAnalyzeView.as_view(), name='ai_analyze'), # NOVO: Rota para análise de IA
    path('', include(router.urls)),
]
