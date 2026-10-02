import { NextResponse } from "next/server";
import { DIAGNOSIS_MAP } from "@/lib/data";
import type { Diagnosis, Severity } from "@/lib/types";

export const runtime = "nodejs";

/* Diagnostic visuel par IA.
   - Sans ANTHROPIC_API_KEY (ou sans image) → renvoie un résultat mock déterministe
     basé sur la catégorie : la démo ne casse JAMAIS.
   - Avec clé → vrai appel au modèle de vision, sortie JSON structurée + parsing défensif. */
export async function POST(req: Request) {
  const { category, image } = await req.json();
  const fallback: Diagnosis = DIAGNOSIS_MAP[category] || DIAGNOSIS_MAP["Roulement"];
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || !image) return NextResponse.json(fallback);

  try {
    const [meta, b64] = String(image).split(",");
    const media = meta.match(/data:(.*?);/)?.[1] || "image/jpeg";
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", // mettre à jour selon le modèle dispo
        max_tokens: 400,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: media, data: b64 } },
            { type: "text", text: `Expert maintenance industrielle. Analyse la pièce/machine (catégorie suspectée: ${category}). Réponds UNIQUEMENT en JSON strict, sans aucun texte autour: {"defect": string court, "part": string (pièce de rechange recommandée), "severity": "low"|"medium"|"high"|"critical", "conf": number entre 0 et 1}.` },
          ],
        }],
      }),
    });
    const data = await res.json();
    const text = (data.content || []).map((c: { type: string; text?: string }) => (c.type === "text" ? c.text : "")).join("").replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    const sev: Severity = ["low", "medium", "high", "critical"].includes(parsed.severity) ? parsed.severity : fallback.severity;
    return NextResponse.json({
      defect: String(parsed.defect || fallback.defect),
      part: String(parsed.part || fallback.part),
      severity: sev,
      conf: typeof parsed.conf === "number" ? Math.max(0, Math.min(1, parsed.conf)) : fallback.conf,
    } satisfies Diagnosis);
  } catch {
    return NextResponse.json(fallback);
  }
}
