from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('electricity', '0002_alter_electricityrecord_day_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='electricityrecord',
            name='date',
            field=models.FloatField(db_index=True),
        ),
    ]
