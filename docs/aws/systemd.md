# Uslugi systemd

Aplikacja dziala jako zestaw uslug systemd, ktore automatycznie uruchamiaja sie przy starcie serwera.

## Backend: `grill_ekstraklasa.service`

**Lokalizacja**: `/etc/systemd/system/grill_ekstraklasa.service`

```ini
[Unit]
Description=Gunicorn instance to serve grill_ekstraklasa
After=network.target

[Service]
User=ec2-user
Group=ec2-user
WorkingDirectory=/home/ec2-user/grill-ekstraklasa/backend
EnvironmentFile=/home/ec2-user/grill-ekstraklasa/backend/.env
Environment="PATH=/home/ec2-user/grill-ekstraklasa/backend/venv/bin"
ExecStart=/home/ec2-user/grill-ekstraklasa/backend/venv/bin/gunicorn -w 3 --bind 0.0.0.0:8000 grill_ekstraklasa.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

**Zarzadzanie**:
```bash
sudo systemctl status grill_ekstraklasa.service
sudo systemctl restart grill_ekstraklasa.service
sudo journalctl -u grill_ekstraklasa.service -f
```

**Hardening (override)**: `/etc/systemd/system/grill_ekstraklasa.service.d/override.conf`
- `NoNewPrivileges=true`
- `PrivateTmp=true`
- `ProtectSystem=full`
- `ProtectKernelTunables=true`
- `ProtectKernelModules=true`
- `ProtectControlGroups=true`
- `RestrictSUIDSGID=true`
- `ProtectHome=read-only`
- `ReadWritePaths=/home/ec2-user/grill-ekstraklasa/backend`
- `PrivateDevices=true`
- `LockPersonality=true`
- `RestrictRealtime=true`
- `SystemCallArchitectures=native`
- `UMask=027`

## Frontend: `grill-frontend.service`

**Lokalizacja**: `/etc/systemd/system/grill-frontend.service`

```ini
[Unit]
Description=Grill Ekstraklasa Frontend (Next.js)
After=network.target

[Service]
User=ec2-user
WorkingDirectory=/home/ec2-user/grill-ekstraklasa/frontend
ExecStart=/home/ec2-user/.nvm/versions/node/v18.20.7/bin/npm start
Restart=always
Environment=PORT=3000
Environment=NODE_ENV=production
Environment=PATH=/home/ec2-user/.nvm/versions/node/v18.20.7/bin:/usr/bin:/bin

[Install]
WantedBy=multi-user.target
```

**Zarzadzanie**:
```bash
sudo systemctl status grill-frontend.service
sudo systemctl restart grill-frontend.service
sudo journalctl -u grill-frontend.service -f
```

**Hardening (override)**: `/etc/systemd/system/grill-frontend.service.d/override.conf`
- `NoNewPrivileges=true`
- `PrivateTmp=true`
- `ProtectSystem=full`
- `ProtectKernelTunables=true`
- `ProtectKernelModules=true`
- `ProtectControlGroups=true`
- `RestrictSUIDSGID=true`
- `ProtectHome=read-only`
- `ReadWritePaths=/home/ec2-user/grill-ekstraklasa/frontend`
- `PrivateDevices=true`
- `LockPersonality=true`
- `RestrictRealtime=true`
- `SystemCallArchitectures=native`
- `UMask=027`

## Baza danych: `postgresql.service`

**Status**: aktywna lokalnie na serwerze. Szczegoly konfiguracji sa w `backend/.env`.

```bash
sudo systemctl status postgresql
```

## Inne uslugi systemowe
- **SSH**: `sshd.service` (OpenSSH)
- **Chronyd**: synchronizacja czasu
- **Amazon SSM Agent**: zarzadzanie przez AWS Systems Manager
- **Auditd**: security auditing service
- **Docker/Containerd**: zainstalowane, ale kontenery nie sa uzywane przez aplikacje
