"use client";

import { useEffect } from "react";

export default function GoogleTagManager() {
  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (consent === "accepted" && process.env.NEXT_PUBLIC_GTM_ID) {
      const script = document.createElement("script");
      script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GTM_ID}`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return null;
}