/** @type {import('next').NextConfig} */
import fs from 'fs';
import path from 'path';

// next.config.mjs
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Falls du Bilder mit `next/image` nutzt
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf|png|jpe?g)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });
    return config;
  },
  // Neue Konfiguration für .htaccess
  async afterBuild() {
    const sourcePath = path.join(process.cwd(), '.htaccess');
    const destPath = path.join(process.cwd(), 'out', '.htaccess');

    // .htaccess kopieren und Berechtigungen setzen
    if (fs.existsSync(sourcePath)) {
      try {
        fs.copyFileSync(sourcePath, destPath);
        console.log('.htaccess wurde in den out-Ordner kopiert');
        fs.chmodSync(destPath, 0o644);
        console.log('Berechtigungen für .htaccess erfolgreich gesetzt.');
      } catch (err) {
        console.warn('Fehler beim Kopieren oder Setzen der Berechtigungen:', err.message);
      }
    } else {
      console.warn('.htaccess nicht gefunden! Bitte erstellen Sie die Datei im Projektroot.');
    }
  },
};

export default nextConfig;
