from django.contrib.sitemaps import Sitemap
from .models import Player

class PlayerSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Player.objects.all()

    def location(self, obj):
        return f"/players/{obj.slug}/"
