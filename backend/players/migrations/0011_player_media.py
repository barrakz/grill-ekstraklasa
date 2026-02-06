from django.db import migrations, models
import django.db.models.deletion
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0010_player_gif_urls_alter_player_photo'),
    ]

    operations = [
        migrations.CreateModel(
            name='PlayerMedia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('media_type', models.CharField(choices=[('gif', 'GIF'), ('tweet', 'Tweet')], db_index=True, max_length=16)),
                ('url', models.URLField(max_length=500)),
                ('created_at', models.DateTimeField(db_index=True, default=timezone.now)),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='media', to='players.player')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddIndex(
            model_name='playermedia',
            index=models.Index(fields=['player', '-created_at'], name='player_media_date_idx'),
        ),
    ]
