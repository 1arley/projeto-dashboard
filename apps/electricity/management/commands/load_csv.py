import os
import pandas as pd
from django.core.management.base import BaseCommand
from apps.electricity.models import ElectricityRecord
from django.conf import settings

DAY_NAME_TO_NUMBER = {
    "Monday": "1", "Tuesday": "2", "Wednesday": "3",
    "Thursday": "4", "Friday": "5", "Saturday": "6", "Sunday": "7",
}

class Command(BaseCommand):
    help = 'Carrega dados do electricity.csv para o banco de dados'

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'electricity.csv')
        
        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'Arquivo não encontrado: {file_path}'))
            return

        self.stdout.write('Lendo o arquivo CSV com Pandas...')
        df = pd.read_csv(file_path)

        self.stdout.write('Limpando formatação das colunas...')
        df['day'] = df['day'].astype(str).str.replace(r"^b'(.*)'$", r'\1', regex=True)
        df['day'] = df['day'].map(DAY_NAME_TO_NUMBER)
        df['class'] = df['class'].astype(str).str.replace(r"^b'(.*)'$", r'\1', regex=True)

        from django.db import transaction

        with transaction.atomic():
            self.stdout.write('Limpando registros existentes...')
            if ElectricityRecord.objects.exists():
                deleted, _ = ElectricityRecord.objects.all().delete()
                self.stdout.write(f'  → {deleted} registos antigos removidos')

            self.stdout.write('Preparando os registros para inserção no PostgreSQL...')

            def record_generator():
                for row in df.itertuples(index=False):
                    yield ElectricityRecord(
                        date=row.date,
                        day=row.day,
                        period=row.period,
                        nsw_price=row.nswprice,
                        nsw_demand=row.nswdemand,
                        vic_price=row.vicprice,
                        vic_demand=row.vicdemand,
                        transfer=row.transfer,
                        demand_class=getattr(row, 'class'),
                    )

            total = df.shape[0]
            self.stdout.write(f'Salvando {total} registos no banco de dados em lote (bulk_create)...')
            ElectricityRecord.objects.bulk_create(record_generator(), batch_size=5000)
        
        self.stdout.write(self.style.SUCCESS(f'Sucesso! {total} registros foram inseridos no banco.'))