from django.db import models


class Player(models.Model):
    POSITION_CHOICES = [
        ("GK", "Goalkeeper"),
        ("DF", "Defender"),
        ("MF", "Midfielder"),
        ("FW", "Forward"),
    ]

    name = models.CharField(max_length=100)
    position = models.CharField(max_length=2, choices=POSITION_CHOICES)
    club = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    rating_avg = models.DecimalField(
        max_digits=4, decimal_places=2, default=0.0
    )

    def __str__(self):
        return f"{self.name} ({self.get_position_display()})"
