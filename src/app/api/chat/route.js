// src/app/api/chat/route.js
import { NextResponse } from "next/server";

/**
 * ✅ Wichtig:
 * - Diese Route funktioniert NICHT mit `output: "export"` (static export).
 * - Nutze dafür normales Next.js (Server / Vercel) ODER ein separates Backend.
 */

const cors = {
  "Access-Control-Allow-Origin":
    process.env.ALLOWED_ORIGIN || "https://hexel-tech.de",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: cors });
}

export async function GET() {
  return NextResponse.json(
    { ok: true, hint: 'POST { message, history?, system?, model? }' },
    { headers: cors }
  );
}

/**
 * Router: OpenAI-kompatible Chat-Completions
 * Docs: base_url "https://router.huggingface.co/v1"
 */
const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";

function normalizeModel(maybeModel) {
  // Viele Beispiele hängen Provider an, z.B. ":hf-inference"
  // Wenn du keinen Suffix angibst, kann es je nach Account/Provider scheitern.
  // -> wir defaulten auf hf-inference, falls kein ":" enthalten ist.
  if (!maybeModel || typeof maybeModel !== "string") return null;
  return maybeModel.includes(":") ? maybeModel : `${maybeModel}:hf-inference`;
}

function clampHistory(history, max = 8) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && typeof m === "object")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content || "").slice(0, 4000),
    }))
    .slice(-max);
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = typeof body.message === "string" ? body.message.trim() : "";
    const system =
      typeof body.system === "string" && body.system.trim()
        ? body.system.trim()
        : "Du bist der Website-Assistent von HEXEL tech. Antworte kurz, präzise und auf Deutsch. Wenn etwas unklar ist, stelle maximal 1 Rückfrage.";

    if (!message) {
      return NextResponse.json(
        { error: "message fehlt oder ist ungültig" },
        { status: 400, headers: cors }
      );
    }

    const HF_API_KEY = process.env.HF_API_KEY;
    if (!HF_API_KEY) {
      return NextResponse.json(
        { error: "HF_API_KEY fehlt (in .env.local / Vercel setzen)" },
        { status: 500, headers: cors }
      );
    }

    // ✅ Default: ein Router-Chat-Modell, das typischerweise Chat kann.
    // Wenn du ein anderes Modell willst: als env setzen oder per body.model schicken.
    const model =
      normalizeModel(body.model) ||
      normalizeModel(process.env.HF_MODEL) ||
      "google/gemma-2-2b-it:hf-inference";

    const history = clampHistory(body.history, 8);

    const payload = {
      model,
      messages: [
        { role: "system", content: system },
        ...history,
        { role: "user", content: message },
      ],
      temperature: 0.3,
      top_p: 0.9,
      max_tokens: 256,
    };

    const r = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const raw = await r.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      // bleibt null, raw ist dann vermutlich HTML/Plaintext
    }

    if (!r.ok) {
      // HF Router liefert häufig: { error: { message, ... } }
      const details =
        data?.error?.message ||
        data?.error ||
        raw ||
        `HF-Fehler (HTTP ${r.status})`;

      return NextResponse.json(
        {
          error: "HF-Fehler",
          status: r.status,
          details: data || details,
          model,
          endpoint: HF_CHAT_URL,
        },
        { status: 502, headers: cors }
      );
    }

    // OpenAI-Style: choices[0].message.content
    const reply =
      data?.choices?.[0]?.message?.content?.trim?.() ||
      data?.choices?.[0]?.text?.trim?.() ||
      "";

    return NextResponse.json(
      { reply: reply || "…", model },
      { headers: cors }
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Serverfehler", details: String(e?.message || e) },
      { status: 500, headers: cors }
    );
  }
}
