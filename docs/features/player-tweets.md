# Player Tweets Feature

## Overview

Display selected tweets from players on their profile pages. Administrators can add Twitter/X URLs which are then embedded using Twitter's official widget.

## Backend Implementation

### Database Model

**File:** `backend/players/models.py`

```python
class Player(models.Model):
    # ... existing fields ...
    tweet_urls = models.JSONField(null=True, blank=True, default=list)
```

- **Field Type:** JSONField
- **Storage:** Array of strings (tweet URLs)
- **Default:** Empty list
- **Nullable:** Yes (for players without tweets)

### Migration

**File:** `backend/players/migrations/0009_player_tweet_urls.py`

Created with:
```bash
python manage.py makemigrations
python manage.py migrate
```

### API Serializer

**File:** `backend/players/serializers.py`

```python
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = [
            'id', 'name', 'slug', 'position', 'club_name', 'club_id',
            'nationality', 'date_of_birth', 'height', 'weight', 'photo_url',
            'summary', 'average_rating', 'rating_avg', 'total_ratings',
            'user_rating', 'recent_comments', 'tweet_urls'  # Added
        ]
```

### Django Admin Interface

**File:** `backend/players/admin.py`

Custom form with textarea input for easy tweet URL management:

```python
class PlayerAdminForm(forms.ModelForm):
    tweet_urls_input = forms.CharField(
        widget=forms.Textarea(attrs={'rows': 5, 'cols': 80}),
        required=False,
        label='Tweet URLs',
        help_text='Enter tweet URLs, one per line (twitter.com or x.com)'
    )

    def clean_tweet_urls_input(self):
        data = self.cleaned_data['tweet_urls_input']
        if not data:
            return []
        urls = [url.strip() for url in data.split('\n') if url.strip()]
        return urls
```

**Admin Display:**
- Textarea input (one URL per line)
- Supports both `twitter.com` and `x.com` URLs
- Automatically converts to JSON array on save
- Pre-populates with existing URLs when editing

## Frontend Implementation

### TypeScript Type

**File:** `frontend/src/app/types/player.ts`

```typescript
export interface Player {
  // ... existing fields ...
  tweet_urls: string[] | null;
}
```

### Player Details Component

**File:** `frontend/src/app/components/PlayerDetails.tsx`

#### Tweet Section Display

```tsx
{/* Tweets Section */}
{player.tweet_urls && player.tweet_urls.length > 0 && (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
      Tweety
    </h2>
    <div className="space-y-4">
      {player.tweet_urls.map((url, index) => {
        const twitterUrl = url.replace('x.com', 'twitter.com');
        const tweetId = twitterUrl.split('/status/')[1]?.split('?')[0];
        return (
          <blockquote 
            key={index} 
            className="twitter-tweet" 
            data-theme={theme}
          >
            <a href={twitterUrl}></a>
          </blockquote>
        );
      })}
    </div>
  </div>
)}
```

#### Twitter Widget Script Loading

```tsx
useEffect(() => {
  if (player.tweet_urls && player.tweet_urls.length > 0) {
    const script = document.createElement('script');
    script.src = 'https://platform.twitter.com/widgets.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const existingScript = document.querySelector(
        'script[src="https://platform.twitter.com/widgets.js"]'
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }
}, [player.tweet_urls]);
```

### Important Notes

- **URL Format:** Only `twitter.com` URLs work with the embed widget. `x.com` URLs are automatically converted to `twitter.com`
- **Theme Support:** Tweets respect light/dark mode via `data-theme` attribute
- **Dynamic Loading:** Twitter widget script loads only when tweets are present
- **Cleanup:** Script is removed when component unmounts

## Usage

### Adding Tweets via Django Admin

1. Go to Django admin: `http://localhost:8000/admin/players/player/`
2. Select a player to edit
3. Scroll to "Tweet URLs" textarea
4. Enter tweet URLs, one per line:
   ```
   https://twitter.com/player_username/status/1234567890
   https://x.com/player_username/status/9876543210
   ```
5. Save the player

### Adding Tweets via API

**Endpoint:** `PATCH /api/players/{slug}/`

**Authentication:** Token required

**Request:**
```bash
curl -X PATCH https://grillekstraklasa.pl/api/players/arkadiusz-reca/ \
  -H "Authorization: Token YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tweet_urls": [
      "https://twitter.com/player/status/1234567890",
      "https://x.com/player/status/9876543210"
    ]
  }'
```

**Response:**
```json
{
  "id": 813,
  "name": "Arkadiusz Reca",
  "slug": "arkadiusz-reca",
  "tweet_urls": [
    "https://twitter.com/player/status/1234567890",
    "https://x.com/player/status/9876543210"
  ]
}
```

## Example

### Production Example

Player: **Josué** (`josue-pesqueira`)

Admin input:
```
https://twitter.com/JosuePesqueira/status/1860030246725828667
```

Frontend display:
- Embedded tweet with full Twitter card
- Responsive design
- Dark/light theme support
- Interactive (likes, retweets visible)

## Testing

### Local Testing

1. Add tweet URL to a player via admin
2. Visit player profile: `http://localhost:3000/pilkarze/player-slug`
3. Verify tweet embeds correctly
4. Test theme switching (light/dark mode)

### Production Testing

```bash
# Check player has tweets
curl -s "https://grillekstraklasa.pl/api/players/josue-pesqueira/" | jq '.tweet_urls'

# Should return:
[
  "https://twitter.com/JosuePesqueira/status/1860030246725828667"
]
```

## Troubleshooting

### Tweets Not Displaying

1. **Check URL format:** Must be `twitter.com`, not `x.com`
2. **Verify tweet exists:** Open URL in browser
3. **Check console errors:** Open browser DevTools
4. **Script loading:** Verify `widgets.js` loads in Network tab

### x.com URLs

The component automatically converts `x.com` to `twitter.com`:
```tsx
const twitterUrl = url.replace('x.com', 'twitter.com');
```

This is required because Twitter's widget doesn't support x.com URLs yet.

### Empty Section

If `tweet_urls` is `null`, `[]`, or contains empty strings, the entire section is hidden via conditional rendering.

## Related Documentation

- [Player Summary Feature](player-summaries.md)
- [Backend API Reference](../api-reference.md)
- [Frontend Components](../front/README.md)
