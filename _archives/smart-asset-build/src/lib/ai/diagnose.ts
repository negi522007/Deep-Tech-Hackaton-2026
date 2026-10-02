import Anthropic from "anthropic";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DiagnosisResponse {
  defect_label: string;
  failure_category: string;
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
  recommended_part: string;
  reasoning_brief: string;
}

export async function diagnoseDamage(imageBase64: string): Promise<DiagnosisResponse> {
  const prompt = `You are an expert industrial diagnostician. Analyze this image of industrial equipment damage and provide a structured JSON response ONLY (no markdown, no code blocks, just raw JSON).

Respond with exactly this JSON structure:
{
  "defect_label": "specific defect type (e.g., bearing degradation, seal failure)",
  "failure_category": "category (e.g., mechanical, electrical, hydraulic)",
  "severity": "low|medium|high|critical",
  "confidence": 0.95,
  "recommended_part": "specific part name that should be replaced (e.g., Ball Bearing 6205-2RS)",
  "reasoning_brief": "1-2 sentence explanation"
}

Be precise and realistic. If unsure about severity, default to "medium".`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Defensive parsing: remove markdown code blocks if present
  let cleanJson = responseText.trim();
  if (cleanJson.startsWith("```json")) {
    cleanJson = cleanJson.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (cleanJson.startsWith("```")) {
    cleanJson = cleanJson.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }

  const parsed: DiagnosisResponse = JSON.parse(cleanJson);

  // Validate required fields
  if (
    !parsed.defect_label ||
    !parsed.failure_category ||
    !parsed.severity ||
    parsed.confidence === undefined ||
    !parsed.recommended_part
  ) {
    throw new Error("Invalid diagnosis response: missing required fields");
  }

  return parsed;
}
