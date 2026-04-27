from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status

from apps.electricity.models import ElectricityRecord


class ElectricityAPITestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        records = [
            ElectricityRecord(
                date=0.0, day=1, period=0.0,
                nsw_price=0.05, nsw_demand=0.40,
                vic_price=0.03, vic_demand=0.42,
                transfer=0.01, demand_class="UP"
            ),
            ElectricityRecord(
                date=0.0, day=1, period=0.5,
                nsw_price=0.06, nsw_demand=0.38,
                vic_price=0.04, vic_demand=0.41,
                transfer=0.02, demand_class="DOWN"
            ),
            ElectricityRecord(
                date=0.1, day=2, period=0.0,
                nsw_price=0.07, nsw_demand=0.45,
                vic_price=0.05, vic_demand=0.44,
                transfer=0.03, demand_class="UP"
            ),
            ElectricityRecord(
                date=0.2, day=3, period=0.0,
                nsw_price=0.04, nsw_demand=0.35,
                vic_price=0.02, vic_demand=0.39,
                transfer=0.00, demand_class="DOWN"
            ),
        ]
        ElectricityRecord.objects.bulk_create(records)

    def setUp(self):
        self.client = APIClient()


class KPIViewTests(ElectricityAPITestCase):
    def test_kpis_returns_200(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_kpis_has_all_fields(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/')
        data = response.json()
        self.assertIn('total_records', data)
        self.assertIn('avg_nsw_price', data)
        self.assertIn('avg_vic_price', data)
        self.assertIn('avg_transfer', data)

    def test_kpis_total_records(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/')
        self.assertEqual(response.json()['total_records'], 4)

    def test_kpis_filter_by_day(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/', {'day': 'Monday'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['total_records'], 2)

    def test_kpis_filter_by_class(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/', {'class': 'UP'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['total_records'], 2)

    def test_kpis_filter_combined(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/', {
            'day': 'Monday', 'class': 'UP'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['total_records'], 1)

    def test_kpis_invalid_day_returns_400(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/', {'day': 'InvalidDay'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_kpis_invalid_class_returns_400(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/', {'class': 'INVALID'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_kpis_empty_filter_returns_consistent(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/', {'day': ''})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['total_records'], 4)

    def test_kpis_numeric_values_rounded_to_4_decimals(self):
        response = self.client.get('/api/v1/electricity/dashboard/kpis/')
        data = response.json()
        for key in ('avg_nsw_price', 'avg_vic_price', 'avg_transfer'):
            val = data[key]
            self.assertIsInstance(val, (int, float))
            self.assertGreaterEqual(val, 0)
            parts = str(val).split('.')
            if len(parts) == 2:
                self.assertLessEqual(len(parts[1]), 4)


class DemandChartViewTests(ElectricityAPITestCase):
    def test_demand_returns_200(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/demand/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_demand_returns_list(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/demand/')
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_demand_each_point_has_fields(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/demand/')
        for point in response.json():
            self.assertIn('date', point)
            self.assertIn('avg_nsw_demand', point)
            self.assertIn('avg_vic_demand', point)

    def test_demand_filter_by_day(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/demand/', {'day': 'Tuesday'})
        data = response.json()
        self.assertEqual(len(data), 1)

    def test_demand_invalid_day_returns_400(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/demand/', {'day': 'Xyz'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_demand_sorted_by_date(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/demand/')
        dates = [pt['date'] for pt in response.json()]
        self.assertEqual(dates, sorted(dates))

    def test_demand_nonexistent_filter_returns_empty(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/demand/', {'day': 'Friday'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), [])


class ClassDistributionViewTests(ElectricityAPITestCase):
    def test_classes_returns_200(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/classes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_classes_returns_up_and_down(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/classes/')
        data = response.json()
        classes = {item['demand_class'] for item in data}
        self.assertEqual(classes, {'UP', 'DOWN'})

    def test_classes_counts(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/classes/')
        data = {item['demand_class']: item['total'] for item in response.json()}
        self.assertEqual(data['UP'], 2)
        self.assertEqual(data['DOWN'], 2)

    def test_classes_filter_by_day(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/classes/', {'day': 'Monday'})
        data = {item['demand_class']: item['total'] for item in response.json()}
        self.assertEqual(data['UP'], 1)
        self.assertEqual(data['DOWN'], 1)

    def test_classes_filter_returns_same_structure(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/classes/', {'class': 'UP'})
        for item in response.json():
            self.assertIn('demand_class', item)
            self.assertIn('total', item)
            self.assertIsInstance(item['total'], int)


class DayDemandViewTests(ElectricityAPITestCase):
    def test_days_returns_200(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/days/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_days_returns_correct_day_names(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/days/')
        data = response.json()
        day_names = {item['day'] for item in data}
        self.assertTrue(day_names.issubset(
            {'Monday', 'Tuesday', 'Wednesday', 'Thursday',
             'Friday', 'Saturday', 'Sunday'}
        ))

    def test_days_has_demand_fields(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/days/')
        for item in response.json():
            self.assertIn('day', item)
            self.assertIn('avg_nsw_demand', item)
            self.assertIn('avg_vic_demand', item)

    def test_days_count(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/days/')
        self.assertEqual(len(response.json()), 3)

    def test_days_filter_by_class(self):
        response = self.client.get(
            '/api/v1/electricity/dashboard/charts/days/',
            {'class': 'UP'}
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(len(data), 2)

    def test_days_invalid_class_returns_400(self):
        response = self.client.get(
            '/api/v1/electricity/dashboard/charts/days/',
            {'class': 'INVALID'}
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_days_sorted_by_day_number(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/days/')
        days = [d['day'] for d in response.json()]
        expected_order = ['Monday', 'Tuesday', 'Wednesday']
        self.assertEqual(days, expected_order)

    def test_days_demand_values_rounded_to_4_decimals(self):
        response = self.client.get('/api/v1/electricity/dashboard/charts/days/')
        for item in response.json():
            for key in ('avg_nsw_demand', 'avg_vic_demand'):
                val = item[key]
                parts = str(val).split('.')
                if len(parts) == 2:
                    self.assertLessEqual(len(parts[1]), 4)


class DashboardSummaryViewTests(ElectricityAPITestCase):
    def test_summary_returns_200(self):
        response = self.client.get('/api/v1/electricity/dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_summary_has_kpis_and_charts(self):
        response = self.client.get('/api/v1/electricity/dashboard/')
        data = response.json()
        self.assertIn('kpis', data)
        self.assertIn('charts', data)

    def test_summary_kpis_fields(self):
        response = self.client.get('/api/v1/electricity/dashboard/')
        kpis = response.json()['kpis']
        self.assertIn('total_records', kpis)
        self.assertEqual(kpis['total_records'], 4)

    def test_summary_charts_fields(self):
        response = self.client.get('/api/v1/electricity/dashboard/')
        charts = response.json()['charts']
        self.assertIn('class_distribution', charts)
        self.assertIn('demand_by_date', charts)
        self.assertIn('day_demand', charts)

    def test_summary_filter_invalid_returns_400(self):
        response = self.client.get('/api/v1/electricity/dashboard/', {'day': 'WRONG'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_summary_filter_by_day(self):
        response = self.client.get('/api/v1/electricity/dashboard/', {'day': 'Monday'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['kpis']['total_records'], 2)

    def test_summary_filter_by_class(self):
        response = self.client.get('/api/v1/electricity/dashboard/', {'class': 'UP'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['kpis']['total_records'], 2)

    def test_summary_filter_combined(self):
        response = self.client.get('/api/v1/electricity/dashboard/', {
            'day': 'Monday', 'class': 'UP'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['kpis']['total_records'], 1)

    def test_summary_output_matches_individual_endpoints(self):
        s = self.client.get('/api/v1/electricity/dashboard/')
        k = self.client.get('/api/v1/electricity/dashboard/kpis/')
        self.assertEqual(s.json()['kpis'], k.json())


class HealthCheckViewTests(TestCase):
    def test_health_returns_200(self):
        response = self.client.get('/api/v1/electricity/health/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_health_returns_ok(self):
        response = self.client.get('/api/v1/electricity/health/')
        self.assertEqual(response.json(), {"status": "ok"})


class ElectricityRecordModelTests(TestCase):
    def test_str_representation(self):
        record = ElectricityRecord(
            date=0.5, period=1.0, demand_class="UP"
        )
        self.assertIn("0.5", str(record))
        self.assertIn("UP", str(record))

    def test_day_field_stores_integer(self):
        record = ElectricityRecord.objects.create(
            date=0.5, day=1, period=0.0,
            nsw_price=0.01, nsw_demand=0.01,
            vic_price=0.01, vic_demand=0.01,
            transfer=0.01, demand_class="UP"
        )
        fetched = ElectricityRecord.objects.get(pk=record.pk)
        self.assertEqual(fetched.day, 1)
        self.assertIsInstance(fetched.day, int)

    def test_date_field_is_indexed(self):
        field = ElectricityRecord._meta.get_field('date')
        self.assertTrue(field.db_index)
