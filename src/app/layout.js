import CookieBanner from "./components/CookieBanner";
import GoogleTagManager from "./components/GoogleTagManager";
import Head from "next/head";
import "./globals.css";
import Navigation from "./components/ui/Navigation";
import Footer from "./components/ui/Footer";
export const metadata = {
  title: "HEXEL tech | Software & Design Lösungen",
  description: "Individuelle Softwareentwicklung, Webdesign und App-Entwicklung aus Deutschland - maßgeschneiderte digitale Lösungen für Ihr Business",
  keywords: ["Softwareentwicklung", "Webdesign Schleswig-Holstein", "Webdesign Deutschlan", "Webentwicklung in Kiel ", "App Entwicklung", "Digitalagentur", "hexel-tech.de"],
  openGraph: {
    title: 'HEXEL tech | Digitale Lösungen aus Deutschland',
    description: 'Professionelle Softwareentwicklung und Webdesign für mittelständische Unternehmen',
    url: 'https://www.hexel-tech.de',
    siteName: 'HEXEL tech',
    images: [
      {
        url: 'https://www.hexel-tech.de/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HEXEL tech - Digitale Transformation',
      },
    ],
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hexeltech',
    creator: '@hexeltech',
    title: 'HEXEL tech | Software & Design',
    description: 'Ihr Partner für digitale Lösungen in Deutschland',
    images: ['https://www.hexel-tech.de/images/twitter-card.jpg'],
  },
  alternates: {
    canonical: 'https://www.hexel-tech.de',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="de" dir="ltr">
      <Head>
        {/* Basis Meta Tags */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="geo.region" content="DE-BY" />
        <meta name="geo.placename" content="München" />
        
        {/* Favicon & Touch Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0066FF" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Firmenspezifische Meta Tags */}
        <meta name="author" content="HEXEL tech GmbH" />
        <meta name="copyright" content="HEXEL tech" />
        <meta name="robots" content="index, follow" />
      </Head>
      <body className="bg-white text-gray-800 font-inter antialiased">
        <GoogleTagManager gtmId="GTM-XXXXXX" />
        <Navigation />
        <main className="min-h-[calc(100vh-320px)] pt-14">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}