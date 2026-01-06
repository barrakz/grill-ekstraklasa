# Konfiguracja Nginx

## Pliki konfiguracyjne
- **Glowny plik**: `/etc/nginx/nginx.conf`
- **Konfiguracja aplikacji**: `/etc/nginx/conf.d/grill_ekstraklasa.conf`

```nginx
# HTTP – przekierowanie na HTTPS
server {
    listen 80;
    server_name grillekstraklasa.pl www.grillekstraklasa.pl;

    return 301 https://$host$request_uri;
}

# HTTPS – wlasciwa aplikacja
server {
    listen 443 ssl;
    server_name grillekstraklasa.pl www.grillekstraklasa.pl;

    ssl_certificate /etc/letsencrypt/live/grillekstraklasa.pl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/grillekstraklasa.pl/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # lokalizacja dla sitemap.xml
    location = /sitemap.xml {
        proxy_pass http://127.0.0.1:8000/sitemap.xml;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django API
    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend Next.js
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Routing
- **/** → Next.js Frontend (port 3000)
- **/api/** → Django Backend (port 8000)
- **/admin/** → Django Admin (port 8000)
- **/sitemap.xml** → Django Backend (port 8000)

## Zarzadzanie Nginx
```bash
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```
