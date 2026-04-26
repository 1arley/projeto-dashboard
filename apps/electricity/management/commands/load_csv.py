import os
import pandas as pd
from django.core.management.base import BaseCommand
from apps.electricity.models import ElectricityRecord
from django.conf import settings

VALID_DAYS = {'1', '2', '3', '4', '5', '6', '7'}
VALID_CLASSES = {'UP', 'DOWN'}
CHUNK_SIZE = 10_000


class Command(BaseCommand):
    help = 'Carrega dados do electricity.csv para o banco de dados'

    def _clean_chunk(self, df):
        df['day'] = df['day'].astype(str).str.replace(
            r"^b'(.*)'$", r'\1', regex=True
        )
        invalid_days = set(df['day'].unique()) - VALID_DAYS
        if invalid_days:
            raise ValueError(
                f"Dias invalidos encontrados: {invalid_days}. "
                f"Valores esperados: 1-7"
            )

        df['class'] = df['class'].astype(str).str.replace(
            r"^b'(.*)'$", r'\1', regex=True
        )
        invalid_classes = set(df['class'].unique()) - VALID_CLASSES
        if invalid_classes:
            raise ValueError(
                f"Classes invalidas encontradas: {invalid_classes}. "
                f"Valores esperados: UP, DOWN"
            )
        return df

    def handle(self, *args, **kwargs):
        file_path = os.path.join(settings.BASE_DIR, 'electricity.csv')

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(
                f'Arquivo nao encontrado: {file_path}'
            ))
            return

        self.stdout.write('Limpando registros existentes...')
        from django.db import transaction

        with transaction.atomic():
            if ElectricityRecord.objects.exists():
                deleted, _ = ElectricityRecord.objects.all().delete()
                self.stdout.write(
                    f'  -> {deleted} registos antigos removidos'
                )

        total_rows = 0
        chunk_count = 0

        self.stdout.write(
            f'Lendo CSV em chunks de {CHUNK_SIZE:,} linhas...'
        )
        for chunk in pd.read_csv(file_path, chunksize=CHUNK_SIZE):
            chunk_count += 1
            chunk = self._clean_chunk(chunk)

            self.stdout.write(
                f'  Chunk #{chunk_count}: {chunk.shape[0]:,} linhas -> '
                f'inserindo no PostgreSQL...'
            )

            def record_generator():
                for _, row in chunk.iterrows():
                    yield ElectricityRecord(
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

            ElectricityRecord.objects.bulk_create(
                record_generator(), batch_size=5000
            )
            total_rows += chunk.shape[0]

        self.stdout.write(self.style.SUCCESS(
            f'Sucesso! {total_rows:,} registros inseridos no banco '
            f'({chunk_count} chunks).'
        ))
