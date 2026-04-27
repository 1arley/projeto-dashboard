from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('electricity', '0003_add_date_index'),
    ]

    operations = [
        migrations.AlterField(
            model_name='electricityrecord',
            name='day',
            field=models.IntegerField(choices=[(1, 'Monday'), (2, 'Tuesday'), (3, 'Wednesday'), (4, 'Thursday'), (5, 'Friday'), (6, 'Saturday'), (7, 'Sunday')], db_index=True),
        ),
        migrations.AlterField(
            model_name='electricityrecord',
            name='demand_class',
            field=models.CharField(choices=[('UP', 'UP'), ('DOWN', 'DOWN')], db_column='class', db_index=True, max_length=10),
        ),
        migrations.AlterModelOptions(
            name='electricityrecord',
            options={'db_table': 'electricity_records'},
        ),
    ]
