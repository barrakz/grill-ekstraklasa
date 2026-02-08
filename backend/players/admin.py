from django.contrib import admin
from django import forms
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime

from .models import Player, PlayerMedia


def sync_player_media_lists(player):
    gif_urls = list(
        PlayerMedia.objects.filter(player=player, media_type=PlayerMedia.MEDIA_GIF)
        .order_by('-created_at')
        .values_list('url', flat=True)
    )
    tweet_urls = list(
        PlayerMedia.objects.filter(player=player, media_type=PlayerMedia.MEDIA_TWEET)
        .order_by('-created_at')
        .values_list('url', flat=True)
    )
    player.gif_urls = gif_urls
    player.tweet_urls = tweet_urls
    player.save(update_fields=['gif_urls', 'tweet_urls'])


class PlayerMediaAdminForm(forms.ModelForm):
    upload_gif = forms.FileField(
        required=False,
        help_text="Opcjonalnie wgraj plik GIF (zostanie zapisany jako URL).",
        label="Upload GIF",
        widget=forms.ClearableFileInput(attrs={'accept': '.gif,image/gif'})
    )

    class Meta:
        model = PlayerMedia
        fields = ['player', 'media_type', 'url', 'created_at']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Allow "file-only" uploads: url/media_type will be derived on save().
        if 'url' in self.fields:
            self.fields['url'].required = False
        if 'media_type' in self.fields:
            self.fields['media_type'].required = False
        if 'created_at' in self.fields:
            self.fields['created_at'].required = False

    def clean(self):
        cleaned_data = super().clean()
        media_type = cleaned_data.get('media_type')
        url = cleaned_data.get('url')
        upload_gif = cleaned_data.get('upload_gif')

        if upload_gif:
            # If a file is uploaded, we can infer everything else.
            cleaned_data['media_type'] = PlayerMedia.MEDIA_GIF
            return cleaned_data

        # If user pasted only a URL, try to infer media type if not selected.
        if url and not media_type:
            lowered = url.lower()
            if '/status/' in lowered or 'twitter.com' in lowered or 'x.com' in lowered:
                cleaned_data['media_type'] = PlayerMedia.MEDIA_TWEET
                media_type = PlayerMedia.MEDIA_TWEET
            elif lowered.endswith('.gif') or 'giphy.com' in lowered:
                cleaned_data['media_type'] = PlayerMedia.MEDIA_GIF
                media_type = PlayerMedia.MEDIA_GIF

        if not media_type:
            raise forms.ValidationError("Wybierz typ media lub dodaj URL / wgraj plik GIF.")

        if media_type == PlayerMedia.MEDIA_GIF:
            if not url:
                raise forms.ValidationError("Dodaj URL lub wgraj plik GIF.")
        if media_type == PlayerMedia.MEDIA_TWEET:
            if not url:
                raise forms.ValidationError("Dodaj URL tweeta.")
        if media_type == PlayerMedia.MEDIA_TWEET and upload_gif:
            raise forms.ValidationError("Plik GIF możesz dodać tylko dla typu GIF.")

        return cleaned_data

    def save(self, commit=True):
        instance = super().save(commit=False)
        upload_gif = self.cleaned_data.get('upload_gif')

        if upload_gif:
            if not upload_gif.name.lower().endswith('.gif'):
                raise forms.ValidationError("Plik musi być w formacie GIF")
            if upload_gif.size > 25 * 1024 * 1024:
                raise forms.ValidationError("Plik jest za duży. Maksymalny rozmiar to 25MB")

            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            player = instance.player or self.cleaned_data.get('player')
            if not player:
                raise forms.ValidationError("Wybierz piłkarza dla media.")
            slug = player.slug or str(player.id)
            filename = f"players/gifs/{slug}_{timestamp}.gif"
            path = default_storage.save(filename, ContentFile(upload_gif.read()))
            instance.url = default_storage.url(path)
            instance.media_type = PlayerMedia.MEDIA_GIF

        if commit:
            instance.save()
            sync_player_media_lists(instance.player)
        return instance


class PlayerMediaInlineForm(PlayerMediaAdminForm):
    class Meta(PlayerMediaAdminForm.Meta):
        fields = ['media_type', 'url', 'created_at']


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
        if self.instance and self.instance.pk:
            media_tweets = list(
                PlayerMedia.objects.filter(player=self.instance, media_type=PlayerMedia.MEDIA_TWEET)
                .order_by('-created_at')
                .values_list('url', flat=True)
            )
            if media_tweets:
                self.fields['tweet_urls_input'].initial = '\n'.join(media_tweets)
            elif self.instance.tweet_urls:
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
            PlayerMedia.objects.get_or_create(
                player=instance,
                media_type=PlayerMedia.MEDIA_GIF,
                url=gif_url,
            )
        
        if commit:
            instance.save()
            for url in instance.tweet_urls or []:
                PlayerMedia.objects.get_or_create(
                    player=instance,
                    media_type=PlayerMedia.MEDIA_TWEET,
                    url=url,
                )
            sync_player_media_lists(instance)
        return instance


class PlayerMediaInline(admin.TabularInline):
    model = PlayerMedia
    form = PlayerMediaInlineForm
    extra = 0
    fields = ("media_type", "url", "upload_gif", "created_at")
    readonly_fields = ("created_at",)


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    form = PlayerAdminForm
    list_display = ("name", "position", "club", "average_rating")
    search_fields = ("name", "club__name", "nationality")
    list_filter = ("position", "club")
    inlines = [PlayerMediaInline]
    
    fieldsets = (
        ('Podstawowe informacje', {
            'fields': ('name', 'slug', 'position', 'club', 'nationality', 'date_of_birth')
        }),
        ('Fizyczne', {
            'fields': ('height', 'weight', 'photo')
        }),
        ('Karta (Magic)', {
            'fields': ('card_image',),
            'description': 'Wgraj pionową kartę 2:3 (np. 1024x1536 PNG). System automatycznie zmniejszy plik do 512x768.'
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
        if not obj:
            return "Brak GIFów"

        gif_urls = list(
            PlayerMedia.objects.filter(player=obj, media_type=PlayerMedia.MEDIA_GIF)
            .order_by('-created_at')
            .values_list('url', flat=True)
        )

        if not gif_urls:
            return "Brak GIFów"
        
        from django.utils.html import format_html
        
        html_parts = ['<div style="margin: 10px 0;">']
        for i, gif_url in enumerate(gif_urls, 1):
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

    def save_related(self, request, form, formsets, change):
        super().save_related(request, form, formsets, change)
        sync_player_media_lists(form.instance)


@admin.register(PlayerMedia)
class PlayerMediaAdmin(admin.ModelAdmin):
    form = PlayerMediaAdminForm
    list_display = ("player", "media_type", "created_at")
    list_filter = ("media_type",)
    search_fields = ("player__name", "url")

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        sync_player_media_lists(obj.player)
