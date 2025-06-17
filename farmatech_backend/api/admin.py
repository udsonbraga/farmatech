# farmatech_backend/api/admin.py

from django.contrib import admin
from .models import Farmacia, Medicamento, Movimento, Venda, ItemVenda # NOVO: Importar ItemVenda

admin.site.register(Farmacia)
admin.site.register(Medicamento)
admin.site.register(Movimento)
admin.site.register(Venda)
admin.site.register(ItemVenda) # NOVO: Registrar ItemVenda