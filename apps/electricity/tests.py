from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.electricity.models import ElectricityRecord


class ElectricityAPITestCase(TestCase):
    """Base com dados de teste para todos os testes da API."""

    @classmethod
    def setUpTestData(cls):
        """Cria registos de teste uma vez para toda a classe."""
        records = [
            # Monday (day=1), UP
            ElectricityRecord(
                date=0.0, day="1", period=0.0,
                nsw_price=0.05, nsw_demand=0.40,
                vic_price=0.03, vic_demand=0.42,
                transfer=0.01, demand_class="UP"
            ),
            # Monday (day=1), DOWN
            ElectricityRecord(
                date=0.0, day="1", period=0.5,
                nsw_price=0.06, nsw_demand=0.38,
                vic_price=0.04, vic_demand=0.41,
                transfer=0.02, demand_class="DOWN"
            ),
            # Tuesday (day=2), UP
            ElectricityRecord(
                date=0.1, day="2", period=0.0,
                nsw_price=0.07, nsw_demand=0.45,
                vic_price=0.05, vic_demand=0.44,
                transfer=0.03, demand_class="UP"
            ),
            # Wednesday (day=3), DOWN
            ElectricityRecord(
                date=0.2, day="3", period=0.0,
                nsw_price=0.04, nsw_demand=0.35,
                vic_price=0.02, vic_demand=0.39,
                transfer=0.00, demand_class="DOWN"
            ),
        ]
        ElectricityRecord.objects.bulk_create(records)

    def setUp(self):
        self.client = APIClient()


# ==================================================================
# KPIs
# ==================================================================

class KPIViewTests(ElectricityAPITestCase):
    """Testes para GET /api/electricity/dashboard/kpis/"""

    def test_kpis_returns_200(self):
        response = self.client.get('/api/electricity/dashboard/kpis/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_kpis_has_all_fields(self):
        response = self.client.get('/api/electricity/dashboard/kpis/')
        data = response.json()
        self.assertIn('total_records', data)
        self.assertIn('avg_nsw_price', data)
        self.assertIn('avg_vic_price', data)
        self.assertIn('avg_transfer', data)

    def test_kpis_total_records(self):
        response = self.client.get('/api/electricity/dashboard/kpis/')
        self.assertEqual(response.json()['total_records'], 4)

    def test_kpis_filter_by_day(self):
        """Filtrar por Monday deve retornar apenas 2 registos."""
        response = self.client.get('/api/electricity/dashboard/kpis/', {'day': 'Monday'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['total_records'], 2)

    def test_kpis_filter_by_class(self):
        """Filtrar por UP deve retornar 2 registos."""
        response = self.client.get('/api/electricity/dashboard/kpis/', {'class': 'UP'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['total_records'], 2)

    def test_kpis_filter_combined(self):
        """Filtrar Monday + UP deve retornar 1 registo."""
        response = self.client.get('/api/electricity/dashboard/kpis/', {
            'day': 'Monday', 'class': 'UP'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['total_records'], 1)

    def test_kpis_invalid_day_returns_400(self):
        response = self.client.get('/api/electricity/dashboard/kpis/', {'day': 'InvalidDay'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_kpis_invalid_class_returns_400(self):
        response = self.client.get('/api/electricity/dashboard/kpis/', {'class': 'INVALID'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ==================================================================
# Demand Chart
# ==================================================================

class DemandChartViewTests(ElectricityAPITestCase):
    """Testes para GET /api/electricity/dashboard/charts/demand/"""

    def test_demand_returns_200(self):
        response = self.client.get('/api/electricity/dashboard/charts/demand/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_demand_returns_list(self):
        response = self.client.get('/api/electricity/dashboard/charts/demand/')
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_demand_each_point_has_fields(self):
        response = self.client.get('/api/electricity/dashboard/charts/demand/')
        for point in response.json():
            self.assertIn('date', point)
            self.assertIn('avg_nsw_demand', point)
            self.assertIn('avg_vic_demand', point)

    def test_demand_filter_by_day(self):
        response = self.client.get('/api/electricity/dashboard/charts/demand/', {'day': 'Tuesday'})
        data = response.json()
        self.assertEqual(len(data), 1)  # Apenas date=0.1

    def test_demand_invalid_day_returns_400(self):
        response = self.client.get('/api/electricity/dashboard/charts/demand/', {'day': 'Xyz'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ==================================================================
# Class Distribution
# ==================================================================

class ClassDistributionViewTests(ElectricityAPITestCase):
    """Testes para GET /api/electricity/dashboard/charts/classes/"""

    def test_classes_returns_200(self):
        response = self.client.get('/api/electricity/dashboard/charts/classes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_classes_returns_up_and_down(self):
        response = self.client.get('/api/electricity/dashboard/charts/classes/')
        data = response.json()
        classes = {item['demand_class'] for item in data}
        self.assertEqual(classes, {'UP', 'DOWN'})

    def test_classes_counts(self):
        response = self.client.get('/api/electricity/dashboard/charts/classes/')
        data = {item['demand_class']: item['total'] for item in response.json()}
        self.assertEqual(data['UP'], 2)
        self.assertEqual(data['DOWN'], 2)

    def test_classes_filter_by_day(self):
        response = self.client.get('/api/electricity/dashboard/charts/classes/', {'day': 'Monday'})
        data = {item['demand_class']: item['total'] for item in response.json()}
        self.assertEqual(data['UP'], 1)
        self.assertEqual(data['DOWN'], 1)


# ==================================================================
# Day Demand
# ==================================================================

class DayDemandViewTests(ElectricityAPITestCase):
    """Testes para GET /api/electricity/dashboard/charts/days/"""

    def test_days_returns_200(self):
        response = self.client.get('/api/electricity/dashboard/charts/days/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_days_returns_correct_day_names(self):
        response = self.client.get('/api/electricity/dashboard/charts/days/')
        data = response.json()
        day_names = {item['day'] for item in data}
        self.assertTrue(day_names.issubset(
            {'Monday', 'Tuesday', 'Wednesday', 'Thursday',
             'Friday', 'Saturday', 'Sunday'}
        ))

    def test_days_has_demand_fields(self):
        response = self.client.get('/api/electricity/dashboard/charts/days/')
        for item in response.json():
            self.assertIn('day', item)
            self.assertIn('avg_nsw_demand', item)
            self.assertIn('avg_vic_demand', item)

    def test_days_count(self):
        """Temos dados para 3 dias distintos (1, 2, 3)."""
        response = self.client.get('/api/electricity/dashboard/charts/days/')
        self.assertEqual(len(response.json()), 3)


# ==================================================================
# Summary (endpoint agregado)
# ==================================================================

class DashboardSummaryViewTests(ElectricityAPITestCase):
    """Testes para GET /api/electricity/dashboard/"""

    def test_summary_returns_200(self):
        response = self.client.get('/api/electricity/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_summary_has_kpis_and_charts(self):
        response = self.client.get('/api/electricity/dashboard/')
        data = response.json()
        self.assertIn('kpis', data)
        self.assertIn('charts', data)

    def test_summary_kpis_fields(self):
        response = self.client.get('/api/electricity/dashboard/')
        kpis = response.json()['kpis']
        self.assertIn('total_records', kpis)
        self.assertEqual(kpis['total_records'], 4)

    def test_summary_charts_fields(self):
        response = self.client.get('/api/electricity/dashboard/')
        charts = response.json()['charts']
        self.assertIn('class_distribution', charts)
        self.assertIn('demand_by_date', charts)
        self.assertIn('day_demand', charts)

    def test_summary_filter_invalid_returns_400(self):
        response = self.client.get('/api/electricity/dashboard/', {'day': 'WRONG'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_summary_filter_by_day(self):
        response = self.client.get('/api/electricity/dashboard/', {'day': 'Monday'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['kpis']['total_records'], 2)


# ==================================================================
# Modelo
# ==================================================================

class ElectricityRecordModelTests(TestCase):
    """Testes para o modelo ElectricityRecord."""

    def test_str_representation(self):
        record = ElectricityRecord(
            date=0.5, period=1.0, demand_class="UP"
        )
        self.assertIn("0.5", str(record))
        self.assertIn("UP", str(record))

    def test_default_ordering(self):
        r1 = ElectricityRecord.objects.create(
            date=0.9, day="1", period=0.5,
            nsw_price=0.01, nsw_demand=0.01,
            vic_price=0.01, vic_demand=0.01,
            transfer=0.01, demand_class="UP"
        )
        r2 = ElectricityRecord.objects.create(
            date=0.1, day="1", period=0.0,
            nsw_price=0.01, nsw_demand=0.01,
            vic_price=0.01, vic_demand=0.01,
            transfer=0.01, demand_class="UP"
        )
        records = list(ElectricityRecord.objects.all())
        self.assertEqual(records[0].pk, r2.pk)  # 0.1 vem antes de 0.9
        self.assertEqual(records[1].pk, r1.pk)
