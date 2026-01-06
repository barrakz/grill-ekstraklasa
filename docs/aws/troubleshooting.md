# Troubleshooting

## Backend nie odpowiada
```bash
sudo systemctl status grill_ekstraklasa.service
sudo journalctl -u grill_ekstraklasa.service -n 100 --no-pager
sudo systemctl restart grill_ekstraklasa.service
```

## Frontend nie odpowiada
```bash
sudo systemctl status grill-frontend.service
sudo journalctl -u grill-frontend.service -n 100 --no-pager
sudo systemctl restart grill-frontend.service
```

## Nginx bledy
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
sudo systemctl restart nginx
```

## Brak miejsca na dysku
```bash
df -h
sudo du -h /home/ec2-user | sort -rh | head -20
sudo journalctl --vacuum-time=7d
```

## Problemy z pamiecia
```bash
free -h
ps aux --sort=-%mem | head -10
sudo systemctl restart grill_ekstraklasa.service
sudo systemctl restart grill-frontend.service
```
