from rest_framework import serializers

from apps.electricity.models import DAY_NAME_TO_NUMBER, DEMAND_CLASS_CHOICES


# ------------------------------------------------------------------
# Serializers — Dashboard API
# ------------------------------------------------------------------

class KpiSerializer(serializers.Serializer):
    """KPIs agregados do dashboard."""
    total_records = serializers.IntegerField()
    avg_nsw_price = serializers.FloatField()
    avg_vic_price = serializers.FloatField()
    avg_transfer = serializers.FloatField()


class DemandPointSerializer(serializers.Serializer):
    """Um ponto da série temporal de demanda."""
    date = serializers.FloatField()
    avg_nsw_demand = serializers.FloatField()
    avg_vic_demand = serializers.FloatField()


class ClassDistributionSerializer(serializers.Serializer):
    """Distribuição de uma classe (UP / DOWN)."""
    demand_class = serializers.CharField()
    total = serializers.IntegerField()


class DayDemandSerializer(serializers.Serializer):
    """Demanda média por dia da semana."""
    day = serializers.CharField()
    avg_nsw_demand = serializers.FloatField()
    avg_vic_demand = serializers.FloatField()


# ------------------------------------------------------------------
# Filtros — Validação dos query parameters
# ------------------------------------------------------------------

VALID_DAYS = set(DAY_NAME_TO_NUMBER.keys())
VALID_CLASSES = {c[0] for c in DEMAND_CLASS_CHOICES}


class DashboardFilterSerializer(serializers.Serializer):
    """Valida os query parameters dos endpoints do dashboard."""
    day = serializers.CharField(required=False, allow_blank=True, max_length=10)
    demand_class = serializers.CharField(
        required=False, allow_blank=True, max_length=10
    )

    def validate_day(self, value):
        if value and value not in VALID_DAYS:
            raise serializers.ValidationError(
                f"Dia inválido: '{value}'. "
                f"Valores aceites: {', '.join(sorted(VALID_DAYS))}"
            )
        return value

    def validate_demand_class(self, value):
        if value and value not in VALID_CLASSES:
            raise serializers.ValidationError(
                f"Classe inválida: '{value}'. "
                f"Valores aceites: {', '.join(sorted(VALID_CLASSES))}"
            )
        return value
