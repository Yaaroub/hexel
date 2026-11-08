# FUNKNAHT – entfernt alte Dateien aus der Zeit vor dem Umbau (einmalig ausführen).
# Ausführen im Projektordner:  powershell -ExecutionPolicy Bypass -File .\aufraeumen.ps1
$ErrorActionPreference = 'SilentlyContinue'
$items = @(
  # Alte Komponenten und Stile
  'src\app\components\ui','src\app\components\utils','src\app\components\Carousel.jsx','src\app\components\Chat.jsx',
  'src\app\components\ConnectionMap.jsx','src\app\components\CookieBanner.jsx','src\app\components\GoogleTagManager.jsx',
  'src\app\components\MotionDetails.jsx','src\app\components\ProjectJourney.jsx','src\app\components\Stack.jsx',
  'src\app\components\TechnicalFigure.jsx','src\app\components\WorkspaceScene.jsx','src\app\homepage\components',
  'src\app\portal.css','src\app\business.css','src\app\test.txt','src\lib\portal-store.js','src\lib\constants.js',
  'tailwind.config.mjs','.eslintrc.json',
  # Alte Marke, Bilder und Videos (werden sonst öffentlich ausgeliefert)
  'public\Visuelle-Identitaet.jpg','public\hero-poster.webp','public\hero-intro.mp4','public\hero-intro.webm',
  'public\funknaht-mark-notes.txt','public\fonts\roboto.json','public\illustrations',
  'public\images\HEXEL-logo-start.mp4','public\images\Bogen.jpg','public\images\Briefbogen.jpg','public\images\Insta.jpg',
  'public\images\Postkarte-01.jpg','public\images\Postkarte-02.jpg','public\images\Visitkarte-01.jpg','public\images\Visitkarte-02.jpg',
  'public\images\iphon.jpg','public\images\client1.png','public\images\client2.png','public\images\client3.png',
  'public\images\team1.png','public\images\team2.png','public\images\team3.png','public\images\Titel.png','public\images\X.png',
  'public\images\card.glb','public\images\lanyard.png','public\images\project.jpg','public\images\rental\findern.png','public\images\rental\finder2.png',
  # Altlasten (PHP-Mailer, alter Export, Logs, Screenshots)
  'vendor','composer.json','composer.lock','out','access.log.current','.qodo','.local\portal-tickets.json',
  'funknaht-button-effekt.png','funknaht-handwerkerportal.png','funknaht-it-einheitlich.png','funknaht-neu-dunkel.png',
  'funknaht-neu-hell.png','funknaht-portal-startseite.png','funknaht-portal-vorschau.png','funknaht-projektbuehne.png',
  '.next','.next-dev'
)
foreach ($item in $items) { if (Test-Path $item) { Remove-Item $item -Recurse -Force; Write-Host "entfernt: $item" } }
Write-Host "`nFertig. Jetzt 'npm install' ausführen, damit alte Pakete entfernt werden."
