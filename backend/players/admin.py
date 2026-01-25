from django.contrib import admin
from django import forms

from .models import Player


class PlayerAdminForm(forms.ModelForm):
    tweet_urls_input = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 80}),
        help_text="Wprowadź linki do tweetów, jeden w każdej linii. Np: https://twitter.com/user/status/123456789",
        label="Linki do tweetów"
    )
    
    gif_urls_input = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'rows': 4, 'cols': 80}),
        help_text="Wprowadź linki do GIFów, jeden w każdej linii. GIFy powinny być uploadowane na S3.",
        label="Linki do GIFów"
    )

    class Meta:
        model = Player
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.tweet_urls:
            self.fields['tweet_urls_input'].initial = '\n'.join(self.instance.tweet_urls)
        if self.instance and self.instance.gif_urls:
            self.fields['gif_urls_input'].initial = '\n'.join(self.instance.gif_urls)

    def clean_tweet_urls_input(self):
        urls = self.cleaned_data.get('tweet_urls_input', '')
        if not urls:
            return []
        # Split by newlines and filter empty lines
        url_list = [url.strip() for url in urls.split('\n') if url.strip()]
        return url_list
    
    def clean_gif_urls_input(self):
        urls = self.cleaned_data.get('gif_urls_input', '')
        if not urls:
            return []
        # Split by newlines and filter empty lines
        url_list = [url.strip() for url in urls.split('\n') if url.strip()]
        return url_list

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.tweet_urls = self.cleaned_data.get('tweet_urls_input', [])
        instance.gif_urls = self.cleaned_data.get('gif_urls_input', [])
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
            'fields': ('summary', 'tweet_urls_input', 'gif_urls_input')
        }),
        ('Oceny', {
            'fields': ('average_rating', 'total_ratings'),
            'classes': ('collapse',)
        }),
    )
