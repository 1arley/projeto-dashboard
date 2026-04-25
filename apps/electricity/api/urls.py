from django.urls import path
from .views import DashboardDataView

urlpatterns = [
    # O endpoint final será /api/electricity/dashboard/
    path('dashboard/', DashboardDataView.as_view(), name='dashboard-data'),
]