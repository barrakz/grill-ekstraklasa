# Procesy i zasoby

## Uruchomione procesy aplikacji (przyklad)

```bash
# Nginx
root        2201  nginx: master process
nginx    2660049  nginx: worker process

# Gunicorn (Backend) - 1 master + 3 workers
ec2-user  220946  gunicorn master
ec2-user  735554  gunicorn worker
ec2-user 1153362  gunicorn worker
ec2-user 1165932  gunicorn worker

# Next.js (Frontend)
ec2-user  221133  npm start
ec2-user  221144  next-server (v15.4.6)
```

## Monitoring
```bash
# Sprawdzenie procesow
ps aux | grep -E 'python|node|nginx' | grep -v grep

# Wykorzystanie zasobow
htop
free -h
df -h

# Status wszystkich uslug
systemctl list-units --type=service --state=running
```

## Podejrzane procesy (szybka kontrola)
```bash
ps aux | egrep -i 'moneroocean|xmrig|/var/tmp/.x|/tmp/s|abcdefghijklmnopqrst\\.net' | grep -v egrep
```

## Automatyczne czyszczenie
Systemd timer `kill-cryptominer.timer` uruchamia `kill-cryptominer.service` co 5 minut.
