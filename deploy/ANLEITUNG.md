# FUNKNAHT auf einem eigenen Server in Deutschland

Diese Anleitung bringt Website und Portal auf einen kleinen Linux-Server (VPS). Du brauchst dafür etwa eine Stunde. Jeder Schritt ist zum Abschreiben gedacht: Befehle in grauen Kästen kopierst du ins Terminal.

**Warum ein eigener Server und nicht Vercel?** Das Portal speichert Konten, Anfragen und Dateien in einer Datenbank auf der Festplatte. Vercel erlaubt das nicht (dort ist die Festplatte schreibgeschützt). Deshalb konnte man dort kein Konto anlegen. Auf einem eigenen Server liegt alles bei dir, in Deutschland. Für den Datenschutz ist das ein Vorteil.

---

## 1. Server mieten

Geeignet ist jeder VPS mit **Ubuntu 24.04**, **2 GB RAM** und Standort **Deutschland**, zum Beispiel:

- Hetzner Cloud CX22 (Nürnberg/Falkenstein), etwa 4–5 € im Monat
- netcup VPS (Nürnberg)
- IONOS VPS (Rechenzentrum Deutschland)

Mit dem Anbieter schließt du einen **Auftragsverarbeitungsvertrag (AVV)** ab. Das geht bei allen drei Anbietern im Kundenbereich mit einem Klick. Bewahre ihn auf.

Bei der Bestellung einen **SSH-Schlüssel** hinterlegen. Hast du noch keinen, erzeugst du ihn auf deinem Windows-PC in PowerShell:

```powershell
ssh-keygen -t ed25519
type $env:USERPROFILE\.ssh\id_ed25519.pub
```

Die ausgegebene Zeile (beginnt mit `ssh-ed25519`) beim Anbieter einfügen.

## 2. Domain auf den Server zeigen lassen

Beim Domain-Anbieter zwei Einträge anlegen (die IP steht im Kundenbereich des Servers):

| Typ | Name | Wert |
|-----|------|------|
| A | @ | IP deines Servers |
| A | www | IP deines Servers |

Hat der Server auch eine IPv6-Adresse, zusätzlich zwei `AAAA`-Einträge. Es kann bis zu einer Stunde dauern, bis die Domain funktioniert.

## 3. Mit dem Server verbinden und absichern

In PowerShell (IP ersetzen):

```powershell
ssh root@DEINE-IP
```

Auf dem Server, nacheinander:

```bash
apt update && apt upgrade -y
apt install -y git nginx certbot python3-certbot-nginx ufw unattended-upgrades curl
dpkg-reconfigure -plow unattended-upgrades   # „Ja“ wählen: Sicherheitsupdates automatisch

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable                                    # mit „y“ bestätigen
```

Node.js 24 installieren:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
apt install -y nodejs
node -v      # sollte v24… anzeigen
```

Einen eigenen Benutzer für die App anlegen (die App läuft nie als root):

```bash
adduser --system --group --home /opt/funknaht funknaht
```

## 4. Code holen

Dein Repository ist privat. Am einfachsten mit einem **Deploy-Key** (nur Lesezugriff):

```bash
sudo -u funknaht ssh-keygen -t ed25519 -f /opt/funknaht/.ssh/id_ed25519 -N ""
cat /opt/funknaht/.ssh/id_ed25519.pub
```

Die Zeile kopieren und auf GitHub einfügen: Repository → **Settings** → **Deploy keys** → **Add deploy key**. „Allow write access“ **nicht** anhaken.

Dann (Benutzername und Repository-Name ersetzen):

```bash
cd /opt
sudo -u funknaht ssh -o StrictHostKeyChecking=accept-new -T git@github.com   # einmalig, meldet „successfully authenticated“
sudo -u funknaht git clone git@github.com:DEIN-NAME/DEIN-REPO.git /opt/funknaht/app-tmp
sudo -u funknaht sh -c 'mv /opt/funknaht/app-tmp/* /opt/funknaht/app-tmp/.[!.]* /opt/funknaht/ && rmdir /opt/funknaht/app-tmp'
cd /opt/funknaht
```

## 5. Konfiguration ausfüllen

```bash
sudo -u funknaht cp deploy/env.production.beispiel .env.local
chmod 600 .env.local
openssl rand -hex 32          # Ausgabe kopieren, das ist dein CRON_SECRET
sudo -u funknaht nano .env.local
```

Wichtig sind:

- `OWNER_EMAILS`: die E-Mail-Adresse, mit der du dich als Inhaber anmeldest
- `SITE_URL` und `APP_URL`: deine Domain mit `https://`, beide gleich
- `CRON_SECRET`: der eben erzeugte Wert
- `COMPANY_…`: deine echten Angaben für Impressum und Rechnungen
- `SMTP_…`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_TO`: damit E-Mails rausgehen
- `OPENAI_API_KEY`: nur einen **neuen** Schlüssel eintragen. Der alte stand in Git und muss bei OpenAI widerrufen sein.

Speichern mit `Strg+O`, `Enter`, schließen mit `Strg+X`.

## 6. Bauen und als Dienst starten

```bash
sudo -u funknaht mkdir -p .local
sudo -u funknaht npm ci --no-audit --no-fund
sudo -u funknaht npm run build

cp deploy/funknaht.service deploy/funknaht-cron.service deploy/funknaht-cron.timer deploy/funknaht-backup.service deploy/funknaht-backup.timer /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now funknaht funknaht-cron.timer funknaht-backup.timer
systemctl status funknaht --no-pager      # sollte „active (running)“ zeigen
```

Damit `deploy.sh` die App neu starten darf, ohne Passwort:

```bash
echo 'funknaht ALL=(root) NOPASSWD: /usr/bin/systemctl restart funknaht' > /etc/sudoers.d/funknaht
chmod 440 /etc/sudoers.d/funknaht
```

## 7. nginx und HTTPS

In beiden Dateien vorher `funknaht.de` durch deine Domain ersetzen:

```bash
sed -i 's/funknaht\.de/DEINE-DOMAIN.de/g' deploy/nginx-funknaht.conf
cp deploy/nginx-proxy.conf /etc/nginx/funknaht-proxy.conf
cp deploy/nginx-funknaht.conf /etc/nginx/sites-available/funknaht
ln -s /etc/nginx/sites-available/funknaht /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

certbot --nginx -d DEINE-DOMAIN.de -d www.DEINE-DOMAIN.de
```

certbot fragt nach einer E-Mail-Adresse und richtet HTTPS ein. Das Zertifikat erneuert sich danach von selbst.

## 8. Ausprobieren

1. `https://deine-domain.de` öffnen. Die Startseite erscheint.
2. Unter **Konto** ein Konto mit der Adresse aus `OWNER_EMAILS` anlegen.
3. `https://deine-domain.de/inhaber` öffnen und mit dem Passwort entsperren.
4. Im Überblick unter **Dienste** müssen „E-Mail-Versand“ und „Zeitplan“ auf **Eingerichtet** stehen.
5. Im Hilfe-Portal eine Testanfrage stellen. Sie muss im Inhaberbereich unter **Anfragen** erscheinen.

Den Zeitplan kannst du auch von Hand prüfen:

```bash
systemctl start funknaht-cron && journalctl -u funknaht-cron -n 5 --no-pager
```

## 9. Eigene Buchungsseite einrichten

Für den Link „Termin buchen“ in Anfragen brauchst du ein Betriebskonto für FUNKNAHT selbst:

1. Unter **Konto** ein zweites Konto vom Typ **Betrieb** anlegen (z. B. termine@deine-domain.de).
2. Im Betriebsbereich Leistungen (z. B. „Einsatz vor Ort, 60 Min.“) und Öffnungszeiten eintragen.
3. Den Kurznamen der Buchungsseite (steht dort unter „Buchungsseite“) in `.env.local` bei `FUNKNAHT_BOOKING_SLUG` eintragen.
4. `systemctl restart funknaht`

## Neue Version einspielen

Wenn du auf GitHub neue Änderungen hast:

```bash
ssh root@DEINE-IP
cd /opt/funknaht && sudo -u funknaht sh deploy/deploy.sh
```

Das Skript sichert zuerst die Datenbank, holt den neuen Stand, baut und startet neu.

## Sicherungen

Jede Nacht um 3:15 Uhr landen Datenbank und hochgeladene Dateien in `/opt/funknaht-backup`. Sie werden 14 Tage aufbewahrt.

**Zusätzlich außer Haus sichern.** Fällt der Server aus, sind sonst auch die Sicherungen weg. Am einfachsten holst du sie dir einmal pro Woche auf deinen PC (PowerShell):

```powershell
scp -r root@DEINE-IP:/opt/funknaht-backup $env:USERPROFILE\Documents\funknaht-sicherung
```

Oder du buchst beim Anbieter eine Storage Box bzw. Server-Snapshots dazu.

**Wiederherstellen** (nur im Notfall):

```bash
systemctl stop funknaht
cd /opt/funknaht/.local
gunzip -c /opt/funknaht-backup/business-DATUM.sqlite.gz > business.sqlite
tar -xzf /opt/funknaht-backup/uploads-DATUM.tar.gz
chown -R funknaht:funknaht /opt/funknaht/.local
systemctl start funknaht
```

## Wenn etwas nicht geht

| Problem | Lösung |
|---------|--------|
| Seite zeigt „502 Bad Gateway“ | Die App läuft nicht: `journalctl -u funknaht -n 50 --no-pager` zeigt den Grund. |
| Anmelden oder Formulare melden „nicht zulässig“ | `APP_URL` muss genau der Adresse im Browser entsprechen (mit `https://`, ohne `www`, ohne `/` am Ende). Danach `systemctl restart funknaht`. |
| Keine E-Mails | SMTP-Angaben prüfen; im Inhaberbereich unter „Dienste“ nachsehen. |
| Keine Terminerinnerungen, Überwachung meldet nichts | `systemctl list-timers funknaht-cron.timer` muss einen nächsten Lauf zeigen; `CRON_SECRET` muss mindestens 24 Zeichen haben. |
| Impressum zeigt rote Lücken | `COMPANY_…` in `.env.local` ausfüllen, dann `sudo -u funknaht npm run build && systemctl restart funknaht`. |

## Datenschutz-Checkliste für den Betrieb

- [ ] AVV mit dem Server-Anbieter abgeschlossen
- [ ] AVV mit dem E-Mail-Anbieter abgeschlossen
- [ ] Bei KI-Assistent: AVV mit OpenAI (Data Processing Addendum) bzw. KI-Assistent abgeschaltet lassen
- [ ] Impressum und Datenschutzerklärung mit echten Angaben
- [ ] Alter OpenAI-Schlüssel widerrufen
- [ ] Sicherungen außer Haus eingerichtet
- [ ] Verzeichnis der Verarbeitungstätigkeiten angelegt (Vorlagen gibt es bei den Landesdatenschutzbehörden)
