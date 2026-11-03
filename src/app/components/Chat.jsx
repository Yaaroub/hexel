"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaRobot, FaUser } from "react-icons/fa";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";

const API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL?.trim();

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("chat_messages_v3");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    try { localStorage.setItem("chat_messages_v3", JSON.stringify(messages)); } catch {}
  }, [messages]);

  const lastTurns = useMemo(() => {
    return messages
      .filter(m => m.content && m.type !== "placeholder")
      .slice(-6)
      .map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.content }));
  }, [messages]);

  async function send() {
    const text = inputValue.trim();
    if (!text || loading) return;

    if (!API_URL) {
      setMessages(prev => [...prev, { id: uid(), sender: "bot", content: "⚠️ API-URL fehlt. Bitte NEXT_PUBLIC_CHAT_API_URL setzen." }]);
      return;
    }

    const placeholderId = uid();
    setMessages(prev => [
      ...prev,
      { id: uid(), sender: "user", content: text },
      { id: placeholderId, sender: "bot", content: "Tippt …", type: "placeholder" },
    ]);
    setInputValue("");
    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: lastTurns }),
        signal: controller.signal,
      });

      let payload;
      try { payload = await res.json(); } catch { payload = { error: "Ungültige Server-Antwort" }; }

      const reply = res.ok && payload?.reply
        ? String(payload.reply)
        : `⚠️ ${payload?.error || "Fehler beim Abrufen der Antwort."}`;

      setMessages(prev => prev.map(m =>
        m.id === placeholderId ? { id: uid(), sender: "bot", content: reply } : m
      ));
    } catch (e) {
      const msg = e?.name === "AbortError"
        ? "⚠️ Zeitüberschreitung – bitte erneut senden."
        : "⚠️ Netzwerkfehler – bitte später erneut versuchen.";
      setMessages(prev => prev.filter(m => m.id !== placeholderId).concat({ id: uid(), sender: "bot", content: msg }));
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-12 h-12 bg-[#b29d88] text-white rounded-full shadow-lg hover:bg-[#a08a76] focus:outline-none focus:ring-2 focus:ring-[#b29d88]"
          aria-label="Chat öffnen"
        >
          <IoChatbubbleEllipsesOutline size={24} />
        </button>
      )}

      {isOpen && (
        <div className="w-80 h-[500px] bg-white rounded-lg shadow-lg flex flex-col">
          <header className="flex items-center justify-between p-4 bg-[#b29d88] text-white rounded-t-lg">
            <h2 className="text-lg font-semibold">Chat</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 p-2 rounded-full bg-[#b29d88] hover:bg-[#a08a76] transition"
              aria-label="Chat schließen"
            >
              ✕
            </button>
          </header>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-sm text-gray-600">
                👋 Hallo! Stell mir gern Fragen zu Produkten, Preisen, Versand & Support.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex items-start ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                {m.sender === "bot" && <FaRobot className="w-6 h-6 text-[#b29d88] mr-2" />}
                <div className={`p-3 rounded-lg ${m.sender === "user" ? "bg-[#b29d88] text-white" : "bg-gray-200 text-gray-800"}`}>
                  {m.content}
                </div>
                {m.sender === "user" && <FaUser className="w-6 h-6 text-[#b29d88] ml-2" />}
              </div>
            ))}
          </div>

          <div className="p-3 border-t bg-white w-full">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={loading ? "Antwort wird erstellt …" : "Nachricht eingeben..."}
                className="flex-1 px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#b29d88]"
                disabled={loading}
                aria-disabled={loading}
              />
              <button
                onClick={send}
                disabled={loading || !inputValue.trim()}
                className="px-4 py-2 bg-[#b29d88] text-white rounded-lg hover:bg-[#a08a76] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#b29d88] text-sm transition"
              >
                {loading ? "Senden…" : "Senden"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
