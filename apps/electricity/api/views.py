from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Avg, Count

from apps.electricity.models import ElectricityRecord


class HealthCheckView(APIView):
    def get(self, request):
        return Response({"status": "ok"})
from .serializers import (
    KpiSerializer,
    DemandPointSerializer,
    ClassDistributionSerializer,
    DayDemandSerializer,
    DashboardFilterSerializer,
)

# ------------------------------------------------------------------
# Constantes
# ------------------------------------------------------------------

DAY_NAME_TO_NUMBER = {
    "Monday": "1", "Tuesday": "2", "Wednesday": "3",
    "Thursday": "4", "Friday": "5", "Saturday": "6", "Sunday": "7",
}

DAY_NUMBER_TO_NAME = {v: k for k, v in DAY_NAME_TO_NUMBER.items()}


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

def _validate_filters(request):
    """
    Valida os query params do dashboard.
    Retorna (is_valid: bool, validated_data|None, errors|None).
    """
    filter_ser = DashboardFilterSerializer(data={
        'day': request.GET.get('day', ''),
        'demand_class': request.GET.get('class', ''),
    })
    if not filter_ser.is_valid():
        return False, None, filter_ser.errors
    return True, filter_ser.validated_data, None


def _build_queryset(filters):
    """Aplica filtros validados à queryset base."""
    qs = ElectricityRecord.objects.all()

    day = filters.get('day')
    if day:
        day_value = DAY_NAME_TO_NUMBER.get(day, day)
        qs = qs.filter(day=day_value)

    demand_class = filters.get('demand_class')
    if demand_class:
        qs = qs.filter(demand_class=demand_class)

    return qs


def _get_kpi_data(qs):
    """Retorna dict com total_records + 3 medias agregadas."""
    agg = qs.aggregate(
        total_records=Count('id'),
        avg_nsw_price=Avg('nsw_price'),
        avg_vic_price=Avg('vic_price'),
        avg_transfer=Avg('transfer'),
    )
    total = agg.get('total_records') or 0
    if total == 0:
        return {
            "total_records": 0,
            "avg_nsw_price": 0,
            "avg_vic_price": 0,
            "avg_transfer": 0,
        }
    return {
        "total_records": total,
        "avg_nsw_price": round(agg['avg_nsw_price'], 4) if agg['avg_nsw_price'] is not None else 0,
        "avg_vic_price": round(agg['avg_vic_price'], 4) if agg['avg_vic_price'] is not None else 0,
        "avg_transfer": round(agg['avg_transfer'], 4) if agg['avg_transfer'] is not None else 0,
    }


def _get_class_distribution(qs):
    """Retorna queryset anotado com total por demand_class."""
    return qs.values('demand_class').annotate(total=Count('id'))


def _get_demand_by_date(qs):
    """Retorna queryset anotado com medias NSW/VIC agrupadas por date."""
    return qs.values('date').annotate(
        avg_nsw_demand=Avg('nsw_demand'),
        avg_vic_demand=Avg('vic_demand'),
    ).order_by('date')


def _get_day_demand(qs):
    """Retorna lista enriquecida com nome do dia e medias NSW/VIC."""
    rows = qs.values('day').annotate(
        avg_nsw_demand=Avg('nsw_demand'),
        avg_vic_demand=Avg('vic_demand'),
    ).order_by('day')
    return [
        {
            "day": DAY_NUMBER_TO_NAME.get(r["day"], r["day"]),
            "avg_nsw_demand": round(r["avg_nsw_demand"], 4) if r["avg_nsw_demand"] is not None else 0,
            "avg_vic_demand": round(r["avg_vic_demand"], 4) if r["avg_vic_demand"] is not None else 0,
        }
        for r in rows
    ]


# ------------------------------------------------------------------
# /api/electricity/dashboard/kpis/
# ------------------------------------------------------------------

class DashboardKPIView(APIView):
    """Retorna os 4 KPIs principais do dashboard."""

    def get(self, request):
        valid, filters, errors = _validate_filters(request)
        if not valid:
            return Response(
                {"detail": "Filtros inválidos", "errors": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = _build_queryset(filters)
        data = _get_kpi_data(qs)

        serializer = KpiSerializer(data)
        return Response(serializer.data)


# ------------------------------------------------------------------
# /api/electricity/dashboard/charts/demand/
# ------------------------------------------------------------------

class DemandChartView(APIView):
    """Retorna a série temporal da demanda NSW vs VIC."""

    def get(self, request):
        valid, filters, errors = _validate_filters(request)
        if not valid:
            return Response(
                {"detail": "Filtros inválidos", "errors": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = _build_queryset(filters)
        demand_by_date = _get_demand_by_date(qs)

        serializer = DemandPointSerializer(demand_by_date, many=True)
        return Response(serializer.data)


# ------------------------------------------------------------------
# /api/electricity/dashboard/charts/classes/
# ------------------------------------------------------------------

class ClassDistributionView(APIView):
    """Retorna a distribuição de registos por classe (UP / DOWN)."""

    def get(self, request):
        valid, filters, errors = _validate_filters(request)
        if not valid:
            return Response(
                {"detail": "Filtros inválidos", "errors": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = _build_queryset(filters)
        distribution = _get_class_distribution(qs)

        serializer = ClassDistributionSerializer(distribution, many=True)
        return Response(serializer.data)


# ------------------------------------------------------------------
# /api/electricity/dashboard/charts/days/
# ------------------------------------------------------------------

class DayDemandView(APIView):
    """Retorna a procura média por dia da semana."""

    def get(self, request):
        valid, filters, errors = _validate_filters(request)
        if not valid:
            return Response(
                {"detail": "Filtros inválidos", "errors": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = _build_queryset(filters)
        enriched = _get_day_demand(qs)

        serializer = DayDemandSerializer(enriched, many=True)
        return Response(serializer.data)


# ------------------------------------------------------------------
# /api/electricity/dashboard/summary/
#   Endpoint único com todos os dados — útil para carga inicial
# ------------------------------------------------------------------

class DashboardSummaryView(APIView):
    """Retorna KPIs + dados de todos os gráficos numa só resposta."""

    def get(self, request):
        valid, filters, errors = _validate_filters(request)
        if not valid:
            return Response(
                {"detail": "Filtros inválidos", "errors": errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = _build_queryset(filters)

        kpi_data = _get_kpi_data(qs)
        class_distribution = _get_class_distribution(qs)
        demand_by_date = _get_demand_by_date(qs)
        day_enriched = _get_day_demand(qs)

        return Response({
            "kpis": kpi_data,
            "charts": {
                "class_distribution": ClassDistributionSerializer(class_distribution, many=True).data,
                "demand_by_date": DemandPointSerializer(demand_by_date, many=True).data,
                "day_demand": DayDemandSerializer(day_enriched, many=True).data,
            }
        })
