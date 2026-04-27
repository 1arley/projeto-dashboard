from django.contrib import admin

from apps.electricity.models import ElectricityRecord


@admin.register(ElectricityRecord)
class ElectricityRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'date', 'day', 'period', 'demand_class', 'nsw_price', 'vic_price')
    list_display_links = ('id', 'date')
    list_filter = ('day', 'demand_class')
    search_fields = ('date', 'period')
    readonly_fields = ('id',)
    list_per_page = 50
    ordering = ('date', 'period')
