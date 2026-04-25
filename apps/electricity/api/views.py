from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Count
from apps.electricity.models import ElectricityRecord

class DashboardDataView(APIView):
    def get(self, request):
        # KPIs Gerais
        total_records = ElectricityRecord.objects.count()
        avg_nsw_price = ElectricityRecord.objects.aggregate(avg=Avg('nsw_price'))['avg']
        avg_vic_price = ElectricityRecord.objects.aggregate(avg=Avg('vic_price'))['avg']

        # Dados para um Gráfico de Pizza
        class_distribution = ElectricityRecord.objects.values('demand_class').annotate(
            total=Count('id')
        )

        # Dados para um Gráfico de Linhas
        demand_by_period = ElectricityRecord.objects.values('period').annotate(
            avg_nsw_demand=Avg('nsw_demand'),
            avg_vic_demand=Avg('vic_demand')
        ).order_by('period')

        # Formatação da resposta JSON
        return Response({
            "kpis": {
                "total_records": total_records,
                "avg_nsw_price": round(avg_nsw_price, 4) if avg_nsw_price else 0,
                "avg_vic_price": round(avg_vic_price, 4) if avg_vic_price else 0,
            },
            "charts": {
                "class_distribution": list(class_distribution),
                "demand_by_period": list(demand_by_period)
            }
        })