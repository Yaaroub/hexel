"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Prüfe, ob localStorage verfügbar ist
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("cookie_consent");
      if (consent !== "accepted" && consent !== "denied") {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cookie_consent", "accepted");
    }
    setShowBanner(false);
    // Hier z. B. Google Analytics oder andere Tracking-Skripte laden
    console.log("Cookies akzeptiert");
  };

  const handleDeny = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cookie_consent", "denied");
    }
    setShowBanner(false);
    console.log("Cookies abgelehnt");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
        <p className="text-sm">
          Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Durch die Nutzung unserer Website stimmen Sie der Verwendung von Cookies zu.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={handleAccept}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Cookies akzeptieren"
          >
            Akzeptieren
          </button>
          <button
            onClick={handleDeny}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            aria-label="Cookies ablehnen"
          >
            Ablehnen
          </button>
        </div>
      </div>
    </div>
  );
}