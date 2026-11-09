#!/bin/sh
# Sichert Datenbank und hochgeladene Dateien nach /opt/funknaht-backup.
# Die Datenbank wird im laufenden Betrieb konsistent kopiert (VACUUM INTO).
# Sicherungen älter als 14 Tage werden gelöscht.
set -eu
APP=/opt/funknaht
OUT=/opt/funknaht-backup
STAMP=$(date +%Y-%m-%d_%H%M)
mkdir -p "$OUT"
cd "$APP"
node -e "const {DatabaseSync}=require('node:sqlite');const db=new DatabaseSync('.local/business.sqlite');db.exec(\"VACUUM INTO '$OUT/business-$STAMP.sqlite'\");db.close()"
tar -czf "$OUT/uploads-$STAMP.tar.gz" -C "$APP/.local" uploads 2>/dev/null || true
gzip -f "$OUT/business-$STAMP.sqlite"
find "$OUT" -type f -mtime +14 -delete
echo "Sicherung fertig: $OUT ($STAMP)"
