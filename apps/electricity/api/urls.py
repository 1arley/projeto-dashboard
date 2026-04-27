from django.urls import path

from .views import (
HealthCheckView,
DashboardSummaryView,
DashboardKPIView,
DemandChartView,
ClassDistributionView,
DayDemandView,
)

app_name = 'electricity'

urlpatterns = [
path('health/', HealthCheckView.as_view(), name='health-check'),

path('dashboard/', DashboardSummaryView.as_view(), name='dashboard-summary'),

path('dashboard/kpis/', DashboardKPIView.as_view(), name='dashboard-kpis'),
path('dashboard/charts/demand/', DemandChartView.as_view(), name='dashboard-chart-demand'),
path('dashboard/charts/classes/', ClassDistributionView.as_view(), name='dashboard-chart-classes'),
path('dashboard/charts/days/', DayDemandView.as_view(), name='dashboard-chart-days'),
]
