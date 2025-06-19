from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver

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

@receiver(pre_delete, sender=Club)
def delete_club_logo(sender, instance, **kwargs):
    # Delete the file from S3 if it exists
    if instance.logo:
        instance.logo.delete(save=False)
