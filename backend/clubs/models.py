from django.db import models

# Create your models here.

class Club(models.Model):
    name = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    founded_year = models.IntegerField(null=True, blank=True)
    logo = models.ImageField(upload_to='clubs/logos/', null=True, blank=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']
