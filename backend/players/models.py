from django.db import models
from clubs.models import Club


# Player model represents football players in the Ekstraklasa league
# Each player belongs to a specific club (ForeignKey relationship with Club model)
# The model stores basic information like name, position, and statistics
# Added comment to trigger redeployment - 2024
class Player(models.Model):
    POSITION_CHOICES = [
        ("GK", "Goalkeeper"),
        ("DF", "Defender"),
        ("MF", "Midfielder"),
        ("FW", "Forward"),
    ]

    name = models.CharField(max_length=100)
    position = models.CharField(max_length=2, choices=POSITION_CHOICES)
    club = models.ForeignKey(Club, on_delete=models.SET_NULL, related_name='players', null=True)
    date_of_birth = models.DateField(null=True, blank=True)
    rating_avg = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    jersey_number = models.IntegerField(null=True, blank=True)
    nationality = models.CharField(max_length=100, null=True, blank=True)
    image = models.ImageField(upload_to='players/images/', null=True, blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_position_display()})"
    
    class Meta:
        ordering = ['name']
