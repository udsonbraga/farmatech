# Generated by Django 5.2.2 on 2025-06-15 15:36

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='farmacia',
            name='cep',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
        migrations.AddField(
            model_name='farmacia',
            name='cidade',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='farmacia',
            name='endereco',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='farmacia',
            name='estado',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AlterField(
            model_name='farmacia',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='farmacia', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='medicamento',
            name='farmacia',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='medicamentos', to='api.farmacia'),
        ),
        migrations.AlterField(
            model_name='medicamento',
            name='quantidade_minima',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='movimento',
            name='medicamento',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='movimentos', to='api.medicamento'),
        ),
        migrations.AlterField(
            model_name='movimento',
            name='observacoes',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='venda',
            name='farmacia',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='vendas', to='api.farmacia'),
        ),
        migrations.AlterField(
            model_name='venda',
            name='forma_pagamento',
            field=models.CharField(choices=[('dinheiro', 'Dinheiro'), ('cartao_credito', 'Cartão de Crédito'), ('cartao_debito', 'Cartão de Débito'), ('pix', 'Pix')], max_length=20),
        ),
        migrations.CreateModel(
            name='ItemVenda',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantidade', models.IntegerField()),
                ('preco_unitario', models.DecimalField(decimal_places=2, max_digits=10)),
                ('medicamento', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='itens_vendidos', to='api.medicamento')),
                ('venda', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='itens', to='api.venda')),
            ],
        ),
    ]
