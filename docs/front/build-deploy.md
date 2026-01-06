# 🚀 Build i deploy frontendu

## Komendy lokalne
```bash
cd frontend
npm install
npm run build
npm start
```

Build uruchamia `next build --no-lint` zgodnie ze skryptem w `package.json`.

## Produkcja (EC2)
Workflow CI/CD buduje frontend na serwerze i restartuje usluge systemd:
- `npm install`
- `npm run build`
- `sudo systemctl restart grill-frontend`

Wazne:
- build nie usuwa katalogu `.next` przed sukcesem, aby nie wylaczyc dzialajacej wersji w razie bledu.
- jesli `nvm.sh` jest niedostepny, deploy przerywa sie z bledem.

Szczegoly CI/CD: `docs/deployment.md`.
