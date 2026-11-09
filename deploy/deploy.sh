#!/bin/sh
# Neue Version einspielen. Auf dem Server als Benutzer funknaht ausführen:
#   cd /opt/funknaht && sh deploy/deploy.sh
set -eu
cd /opt/funknaht
echo "1/5 Sicherung vor dem Update …"
sh deploy/backup.sh
echo "2/5 Neueste Version holen …"
git pull --ff-only
echo "3/5 Pakete installieren …"
npm ci --no-audit --no-fund
echo "4/5 Bauen …"
npm run build
echo "5/5 Neu starten …"
sudo systemctl restart funknaht
sleep 3
if curl -fsS -o /dev/null http://127.0.0.1:3000/; then echo "Fertig. Die Seite läuft."; else echo "Achtung: Die Seite antwortet nicht. Log ansehen mit: sudo journalctl -u funknaht -n 50"; exit 1; fi
