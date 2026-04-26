import os
import pandas as pd
from django.core.management.base import BaseCommand
from apps.electricity.models import ElectricityRecord
from django.conf import settings

class Command(BaseCommand):
    help = 'Carrega dados do electricity.csv para o banco de dados'

    def handle(self, *args, **kwargs):
        # Caminho absoluto para o arquivo CSV na raiz do projeto
        file_path = os.path.join(settings.BASE_DIR, 'electricity.csv')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Arquivo não encontrado: {file_path}'))
            return

        self.stdout.write('Lendo o arquivo CSV com Pandas...')
        df = pd.read_csv(file_path)

        # Limpeza: O CSV possui strings sujas no formato de bytes do Python (ex: b'UP')
        self.stdout.write('Limpando formatação das colunas...')
        df['day'] = df['day'].astype(str).str.replace(r"^b'(.*)'$", r'\1', regex=True)
        df['class'] = df['class'].astype(str).str.replace(r"^b'(.*)'$", r'\1', regex=True)

        from django.db import transaction

        with transaction.atomic():
            # Garantir que não duplicamos dados ao re-executar
            self.stdout.write('Limpando registros existentes...')
            if ElectricityRecord.objects.exists():
                deleted, _ = ElectricityRecord.objects.all().delete()
                self.stdout.write(f'  → {deleted} registos antigos removidos')

            self.stdout.write('Preparando os registros para inserção no PostgreSQL...')
            records = [
                ElectricityRecord(
                    date=row['date'],
                    day=row['day'],
                    period=row['period'],
                    nsw_price=row['nswprice'],
                    nsw_demand=row['nswdemand'],
                    vic_price=row['vicprice'],
                    vic_demand=row['vicdemand'],
                    transfer=row['transfer'],
                    demand_class=row['class'],
                )
                for row in df.to_dict('records')
            ]

            self.stdout.write('Salvando no banco de dados em lote (bulk_create)...')
            # O bulk_create é infinitamente mais rápido que salvar linha por linha
            ElectricityRecord.objects.bulk_create(records, batch_size=5000)
        
        self.stdout.write(self.style.SUCCESS(f'Sucesso! {len(records)} registros foram inseridos no banco.'))