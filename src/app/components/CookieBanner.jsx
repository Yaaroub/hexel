"use client";

import { useEffect, useState } from "react";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Prüfe, ob der Nutzer bereits zugestimmt hat
    const consent = localStorage.getItem("cookie_consent");
    if (consent !== "accepted" && consent !== "denied") {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShowBanner(false);
    // Hier z. B. Google Analytics laden
  };

  const handleDeny = () => {
    localStorage.setItem("cookie_consent", "denied");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex flex-col md:flex-row justify-between items-center gap-4 z-50">
      <p>
        Wir verwenden Cookies für ein besseres Erlebnis.{" "}
        <a href="/datenschutz" className="underline">
          Mehr erfahren
        </a>.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleDeny}
          className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700"
        >
          Ablehnen
        </button>
        <button
          onClick={handleAccept}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          Akzeptieren
        </button>
      </div>
    </div>
  );
}