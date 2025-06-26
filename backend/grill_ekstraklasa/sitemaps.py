from django.contrib.sitemaps import Sitemap
from players.models import Player
from clubs.models import Club
from django.urls import reverse

class PlayerSitemap(Sitemap):
    changefreq = "weekly"
    priority = 0.8

    def items(self):
        return Player.objects.all()

    def location(self, obj):
        return f"/players/{obj.slug}/"

class ClubSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.7

    def items(self):
        return Club.objects.all()

    def location(self, obj):
        return f"/clubs/{obj.id}/"  # Jeśli w przyszłości dodasz slug dla klubów, zmień na obj.slug

class StaticViewSitemap(Sitemap):
    changefreq = "monthly"
    priority = 0.5

    def items(self):
        return ['home', 'players', 'clubs']  # Nazwy URL-i dla widoków statycznych

    def location(self, item):
        if item == 'home':
            return '/'
        return f'/{item}/'
