from django.contrib.sitemaps import Sitemap
from players.models import Player
from clubs.models import Club
from django.urls import reverse

class PlayerSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Player.objects.exclude(club__name="Loan")

    def location(self, obj):
        return f"/players/{obj.slug}/"
    
    def lastmod(self, obj):
        return obj.updated_at

class StaticViewSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5

    def items(self):
        return ['home', 'players', 'clubs']  # Nazwy URL-i dla widoków statycznych

    def location(self, item):
        if item == 'home':
            return '/'
        return f'/{item}/'
