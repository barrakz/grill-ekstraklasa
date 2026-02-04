# Przydatne komendy

## Monitoring w czasie rzeczywistym
Logi sa zebrane w osobnym pliku: `docs/aws/logs.md`.

## Restart wszystkich uslug
```bash
sudo systemctl restart grill_ekstraklasa.service
sudo systemctl restart grill-frontend.service
sudo systemctl restart nginx
```

## Wymuszenie czyszczenia podejrzanych procesow
```bash
sudo systemctl start kill-cryptominer.service
sudo journalctl -u kill-cryptominer.service -n 50 --no-pager
```

## Sprawdzenie portow
```bash
sudo netstat -tlnp | grep -E ':(80|443|3000|8000|5432)'
# lub z ss
sudo ss -tlnp | grep -E ':(80|443|3000|8000|5432)'
```
