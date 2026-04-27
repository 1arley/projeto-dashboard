from django.db import models


DAY_CHOICES = (
    (1, "Monday"),
    (2, "Tuesday"),
    (3, "Wednesday"),
    (4, "Thursday"),
    (5, "Friday"),
    (6, "Saturday"),
    (7, "Sunday"),
)

DEMAND_CLASS_CHOICES = (
    ("UP", "UP"),
    ("DOWN", "DOWN"),
)

DAY_NUMBER_TO_NAME = {num: name for num, name in DAY_CHOICES}
DAY_NAME_TO_NUMBER = {name: num for num, name in DAY_CHOICES}


class ElectricityRecord(models.Model):
    date = models.FloatField(db_index=True)
    day = models.IntegerField(choices=DAY_CHOICES, db_index=True)
    period = models.FloatField()

    nsw_price = models.FloatField(db_column='nswprice')
    nsw_demand = models.FloatField(db_column='nswdemand')
    vic_price = models.FloatField(db_column='vicprice')
    vic_demand = models.FloatField(db_column='vicdemand')
    transfer = models.FloatField()

    demand_class = models.CharField(
        max_length=10, db_column='class', db_index=True,
        choices=DEMAND_CLASS_CHOICES,
    )

    class Meta:
        db_table = 'electricity_records'

    def __str__(self):
        return f"Date: {self.date} - Period: {self.period} - Class: {self.demand_class}"
