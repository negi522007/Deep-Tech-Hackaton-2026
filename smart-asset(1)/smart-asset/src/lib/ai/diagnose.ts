import { AiDiagnosis, Severity } from '../types';

export const DIAGNOSE_SYSTEM_PROMPT = `Tu es un ingénieur de maintenance industrielle senior.
À partir d'une photo de panne d'équipement et d'un court contexte, tu produis un diagnostic structuré.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte avant/après, sans balises Markdown.
Schéma exact attendu:
{
  "diagnosis": string,                       // diagnostic en 1-2 phrases
  "probable_causes": string[],               // 2 à 4 causes probables
  "severity": "low"|"medium"|"high"|"critical",
  "confidence": number,                      // 0.0 à 1.0
  "recommended_parts": [{"reference": string, "name": string, "reason": string}],
  "recommended_actions": string[]            // étapes concrètes pour le technicien
}`;

export function buildUserPrompt(ctx: {
  equipmentName?: string;
  category?: string;
  description?: string;
}): string {
  return `Équipement: ${ctx.equipmentName ?? 'inconnu'}
Catégorie panne: ${ctx.category ?? 'inconnue'}
Description fournie par le technicien: ${ctx.description ?? '(aucune)'}
Analyse la photo jointe et renvoie le JSON.`;
}

interface DiagnoseInput {
  imageBase64?: string;     // raw base64 (no data: prefix)
  imageMediaType?: string;  // e.g. image/jpeg
  equipmentName?: string;
  category?: string;
  description?: string;
}

// Calls Anthropic Messages API if ANTHROPIC_API_KEY is set; otherwise returns
// a deterministic mock so the feature works fully offline during the demo.
export async function runDiagnosis(input: DiagnoseInput): Promise<AiDiagnosis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return mockDiagnosis(input);

  const content: any[] = [];
  if (input.imageBase64) {
    content.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: input.imageMediaType || 'image/jpeg',
        data: input.imageBase64,
      },
    });
  }
  content.push({ type: 'text', text: buildUserPrompt(input) });

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5',
        max_tokens: 1024,
        system: DIAGNOSE_SYSTEM_PROMPT,
        messages: [{ role: 'user', content }],
      }),
    });
    const data = await res.json();
    const text: string = (data?.content || [])
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('\n')
      .replace(/```json|```/g, '')
      .trim();
    return JSON.parse(text) as AiDiagnosis;
  } catch {
    return mockDiagnosis(input);
  }
}

// Deterministic, category-aware mock — no network needed.
function mockDiagnosis(input: DiagnoseInput): AiDiagnosis {
  const cat = (input.category || 'mechanical').toLowerCase();
  const table: Record<string, AiDiagnosis> = {
    mechanical: {
      diagnosis: 'Usure avancée d\'un roulement provoquant bruit et vibration.',
      probable_causes: ['Roulement en fin de vie', 'Défaut de lubrification', 'Désalignement d\'arbre'],
      severity: 'high',
      confidence: 0.82,
      recommended_parts: [
        { reference: 'BRG-6204', name: 'Roulement 6204-2RS', reason: 'Remplacement du roulement défaillant' },
      ],
      recommended_actions: ['Arrêter l\'équipement', 'Démonter le palier', 'Remplacer le roulement', 'Contrôler l\'alignement'],
    },
    electrical: {
      diagnosis: 'Surchauffe d\'enroulement moteur, probable défaut d\'isolement.',
      probable_causes: ['Surcharge', 'Ventilation obstruée', 'Isolement dégradé'],
      severity: 'high',
      confidence: 0.78,
      recommended_parts: [
        { reference: 'SEN-PT100', name: 'Sonde température PT100', reason: 'Surveillance thermique' },
      ],
      recommended_actions: ['Couper l\'alimentation', 'Mesurer l\'isolement', 'Nettoyer la ventilation'],
    },
    hydraulic: {
      diagnosis: 'Fuite hydraulique au niveau du circuit de puissance.',
      probable_causes: ['Joint usé', 'Filtre colmaté', 'Surpression'],
      severity: 'critical',
      confidence: 0.85,
      recommended_parts: [
        { reference: 'FLT-HY10', name: 'Filtre hydraulique HY-10', reason: 'Filtre colmaté à remplacer' },
      ],
      recommended_actions: ['Dépressuriser le circuit', 'Localiser la fuite', 'Remplacer joint + filtre'],
    },
  };
  return table[cat] || table.mechanical;
}

export function severityWeight(s: Severity): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[s];
}
