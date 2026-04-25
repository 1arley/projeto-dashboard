from django.urls import path
from .views import (
    DashboardSummaryView,
    DashboardKPIView,
    DemandChartView,
    ClassDistributionView,
    DayDemandView,
)

urlpatterns = [
    # Endpoint agregado (todos os dados numa resposta)
    path('dashboard/', DashboardSummaryView.as_view(), name='dashboard-summary'),

    # Endpoints separados (RESTful)
    path('dashboard/kpis/', DashboardKPIView.as_view(), name='dashboard-kpis'),
    path('dashboard/charts/demand/', DemandChartView.as_view(), name='dashboard-chart-demand'),
    path('dashboard/charts/classes/', ClassDistributionView.as_view(), name='dashboard-chart-classes'),
    path('dashboard/charts/days/', DayDemandView.as_view(), name='dashboard-chart-days'),
]
