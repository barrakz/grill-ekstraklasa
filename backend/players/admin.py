from django.contrib import admin
from django import forms
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime

from .models import Player


class PlayerAdminForm(forms.ModelForm):
    tweet_urls_input = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 80}),
        help_text="Wprowadź linki do tweetów, jeden w każdej linii. Np: https://twitter.com/user/status/123456789",
        label="Linki do tweetów"
    )
    
    new_gif = forms.FileField(
        required=False,
        help_text="Wybierz plik GIF do uploadu (max 25MB). GIF zostanie dodany do listy istniejących.",
        label="Dodaj nowy GIF",
        widget=forms.ClearableFileInput(attrs={'accept': '.gif,image/gif'})
    )

    class Meta:
        model = Player
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.tweet_urls:
            self.fields['tweet_urls_input'].initial = '\n'.join(self.instance.tweet_urls)

    def clean_tweet_urls_input(self):
        urls = self.cleaned_data.get('tweet_urls_input', '')
        if not urls:
            return []
        # Split by newlines and filter empty lines
        url_list = [url.strip() for url in urls.split('\n') if url.strip()]
        return url_list
    
    def clean_new_gif(self):
        gif_file = self.cleaned_data.get('new_gif')
        if not gif_file:
            return None
        
        # Validate file type
        if not gif_file.name.lower().endswith('.gif'):
            raise forms.ValidationError("Plik musi być w formacie GIF")
        
        # Validate file size (max 25MB)
        if gif_file.size > 25 * 1024 * 1024:
            raise forms.ValidationError("Plik jest za duży. Maksymalny rozmiar to 25MB")
        
        return gif_file

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.tweet_urls = self.cleaned_data.get('tweet_urls_input', [])
        
        # Handle new GIF upload
        new_gif = self.cleaned_data.get('new_gif')
        if new_gif:
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"players/gifs/{instance.slug}_{timestamp}.gif"
            
            # Save file to S3
            path = default_storage.save(filename, ContentFile(new_gif.read()))
            gif_url = default_storage.url(path)
            
            # Add URL to player's gif_urls list
            if instance.gif_urls is None:
                instance.gif_urls = []
            instance.gif_urls.append(gif_url)
        
        if commit:
            instance.save()
        return instance


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    form = PlayerAdminForm
    list_display = ("name", "position", "club", "average_rating")
    search_fields = ("name", "club__name", "nationality")
    list_filter = ("position", "club")
    
    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('name', 'slug', 'position', 'club', 'nationality', 'date_of_birth')
        }),
        ('Fizyczne', {
            'fields': ('height', 'weight', 'photo')
        }),
        ('Opis', {
            'fields': ('summary', 'tweet_urls_input')
        }),
        ('GIFy', {
            'fields': ('display_current_gifs', 'new_gif'),
        }),
        ('Oceny', {
            'fields': ('average_rating', 'total_ratings'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['display_current_gifs']
    
    def display_current_gifs(self, obj):
        if not obj or not obj.gif_urls:
            return "Brak GIFów"
        
        from django.utils.html import format_html
        
        html_parts = ['<div style="margin: 10px 0;">']
        for i, gif_url in enumerate(obj.gif_urls, 1):
            # Add delete button for each GIF
            delete_url = f'/api/players/admin/delete-gif/{obj.pk}/{i-1}/'
            html_parts.append(f'''
                <div style="margin-bottom: 15px; padding: 10px; background: #f8f8f8; border-radius: 4px;">
                    <div style="margin-bottom: 5px;">
                        <strong>GIF {i}:</strong>
                        <a href="#" onclick="window.open('{gif_url}', '_blank', 'width=800,height=600'); return false;" 
                           style="margin-left: 10px; color: #417690;">Podgląd</a>
                        <a href="{delete_url}" onclick="return confirm('Czy na pewno chcesz usunąć ten GIF?');" 
                           style="margin-left: 10px; color: #ba2121;">Usuń</a>
                    </div>
                    <img src="{gif_url}" style="max-width: 300px; max-height: 200px; border: 1px solid #ddd; border-radius: 4px;">
                    <div style="margin-top: 5px; font-size: 11px; color: #666;">
                        <code>{gif_url}</code>
                    </div>
                </div>
            ''')
        html_parts.append('</div>')
        
        return format_html(''.join(html_parts))
    
    display_current_gifs.short_description = "Obecne GIFy"
