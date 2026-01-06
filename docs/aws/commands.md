# Przydatne komendy

## Monitoring w czasie rzeczywistym
```bash
# Logi backend
sudo journalctl -u grill_ekstraklasa.service -f

# Logi frontend
sudo journalctl -u grill-frontend.service -f

# Logi nginx
sudo tail -f /var/log/nginx/access.log

# Wszystkie logi systemowe
sudo journalctl -f
```

## Restart wszystkich uslug
```bash
sudo systemctl restart grill_ekstraklasa.service
sudo systemctl restart grill-frontend.service
sudo systemctl restart nginx
```

## Sprawdzenie portow
```bash
sudo netstat -tlnp | grep -E ':(80|443|3000|8000|5432)'
# lub z ss
sudo ss -tlnp | grep -E ':(80|443|3000|8000|5432)'
```
