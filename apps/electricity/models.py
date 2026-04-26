from django.db import models

class ElectricityRecord(models.Model):
    date = models.FloatField() 
    day = models.CharField(max_length=10, db_index=True) 
    period = models.FloatField()
    
    nsw_price = models.FloatField(db_column='nswprice')
    nsw_demand = models.FloatField(db_column='nswdemand')
    vic_price = models.FloatField(db_column='vicprice')
    vic_demand = models.FloatField(db_column='vicdemand')
    transfer = models.FloatField()
    
    demand_class = models.CharField(max_length=10, db_column='class', db_index=True)

    class Meta:
        db_table = 'electricity_records'
        ordering = ['date', 'period']

    def __str__(self):
        return f"Date: {self.date} - Period: {self.period} - Class: {self.demand_class}"