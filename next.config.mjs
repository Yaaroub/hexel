/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
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
    const fs = require('fs');
    const path = require('path');
    
    // Pfade definieren
    const sourcePath = path.join(__dirname, '.htaccess');
    const destPath = path.join(__dirname, 'out', '.htaccess');
    
    // .htaccess kopieren
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log('.htaccess wurde in den out-Ordner kopiert');
      
      // Berechtigungen setzen (nur für Unix-Systeme relevant)
      try {
        fs.chmodSync(destPath, 0o644);
      } catch (err) {
        console.warn('Konnte Berechtigungen nicht setzen:', err.message);
      }
    } else {
      console.warn('.htaccess nicht gefunden! Bitte erstellen Sie die Datei im Projektroot');
    }
  }
};

export default nextConfig;