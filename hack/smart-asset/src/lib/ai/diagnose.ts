import { AiDiagnosis, Severity } from '../types';

export const DIAGNOSE_SYSTEM_PROMPT = `Tu es un ingénieur de maintenance industrielle senior spécialisé dans les équipements industriels africains.
À partir d'une photo de panne d'équipement et d'un court contexte, tu produis un diagnostic structuré et précis.
Tu réponds UNIQUEMENT avec un objet JSON valide, sans texte avant/après, sans balises Markdown.
Schéma exact attendu:
{
  "diagnosis": string,
  "probable_causes": string[],
  "severity": "low"|"medium"|"high"|"critical",
  "confidence": number,
  "recommended_parts": [{"reference": string, "name": string, "reason": string}],
  "recommended_actions": string[]
}`;

export function buildUserPrompt(ctx: {
  equipmentName?: string;
  category?: string;
  description?: string;
}): string {
  return `Équipement: ${ctx.equipmentName ?? 'inconnu'}
Catégorie panne: ${ctx.category ?? 'inconnue'}
Description fournie par le technicien: ${ctx.description ?? '(aucune)'}
Analyse la photo jointe et renvoie le diagnostic JSON. Sois précis sur les pièces à commander avec leurs références industrielles standards.`;
}

interface DiagnoseInput {
  imageBase64?: string;
  imageMediaType?: string;
  equipmentName?: string;
  category?: string;
  description?: string;
}

// Gemini 2.0 Flash — gratuit, 1500 req/jour, vision native
// Obtenir clé gratuite : aistudio.google.com
export async function runDiagnosis(input: DiagnoseInput): Promise<AiDiagnosis> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) return mockDiagnosis(input);

  const parts: unknown[] = [];
  if (input.imageBase64) {
    parts.push({
      inline_data: {
        mime_type: input.imageMediaType || 'image/jpeg',
        data: input.imageBase64,
      },
    });
  }
  parts.push({ text: buildUserPrompt(input) });

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: DIAGNOSE_SYSTEM_PROMPT }],
          },
          contents: [{ parts }],
          generation_config: {
            response_mime_type: 'application/json',
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error('Gemini API error:', res.status, await res.text());
      return mockDiagnosis(input);
    }

    const data = await res.json();
    const text: string = (data?.candidates?.[0]?.content?.parts ?? [])
      .filter((p: { text?: string }) => p.text)
      .map((p: { text: string }) => p.text)
      .join('');

    return JSON.parse(text) as AiDiagnosis;
  } catch (err) {
    console.error('Gemini diagnosis error:', err);
    return mockDiagnosis(input);
  }
}

// Fallback déterministe quand pas de clé API ou erreur réseau
function mockDiagnosis(input: DiagnoseInput): AiDiagnosis {
  const cat = (input.category || 'mechanical').toLowerCase();
  const mocks: Record<string, AiDiagnosis> = {
    mechanical: {
      diagnosis: 'Usure avancée d\'un roulement à billes provoquant vibrations et bruit caractéristique.',
      probable_causes: ['Roulement en fin de vie', 'Défaut de lubrification chronique', 'Désalignement d\'arbre', 'Surcharge mécanique'],
      severity: 'high',
      confidence: 0.82,
      recommended_parts: [
        { reference: 'BRG-6204', name: 'Roulement 6204-2RS', reason: 'Remplacement du roulement défaillant' },
      ],
      recommended_actions: ['Arrêter l\'équipement immédiatement', 'Démonter le palier', 'Remplacer le roulement', 'Vérifier l\'alignement et relubrifié'],
    },
    electrical: {
      diagnosis: 'Surchauffe d\'enroulement statorique, probable défaut d\'isolement avec risque de mise à la terre.',
      probable_causes: ['Surcharge thermique prolongée', 'Ventilation obstruée', 'Isolement dégradé par humidité', 'Déséquilibre phases'],
      severity: 'high',
      confidence: 0.78,
      recommended_parts: [
        { reference: 'SEN-PT100', name: 'Sonde température PT100', reason: 'Surveillance thermique préventive' },
      ],
      recommended_actions: ['Couper l\'alimentation électrique', 'Mesurer la résistance d\'isolement', 'Nettoyer la ventilation', 'Contrôler l\'équilibrage des phases'],
    },
    hydraulic: {
      diagnosis: 'Fuite hydraulique au niveau du circuit de puissance avec perte de pression mesurable.',
      probable_causes: ['Joint torique usé ou extrudé', 'Filtre colmaté générant surpression', 'Raccord desserré par vibrations', 'Corrosion du circuit'],
      severity: 'critical',
      confidence: 0.89,
      recommended_parts: [
        { reference: 'FLT-HY10', name: 'Filtre hydraulique HY-10', reason: 'Filtre colmaté à remplacer impérativement' },
      ],
      recommended_actions: ['Dépressuriser le circuit complet', 'Localiser précisément la fuite', 'Remplacer joints + filtre', 'Tester l\'étanchéité à 1.5x pression nominale'],
    },
    pneumatic: {
      diagnosis: 'Fuite dans le circuit pneumatique basse pression avec perte de débit significative.',
      probable_causes: ['Joint de piston usé', 'Raccord rapide détérioré', 'Silencieux colmaté', 'Électrovanne hors service'],
      severity: 'medium',
      confidence: 0.75,
      recommended_parts: [
        { reference: 'VLV-5/2-DN8', name: 'Électrovanne 5/2 DN8', reason: 'Électrovanne de commande défaillante' },
      ],
      recommended_actions: ['Localiser la fuite à l\'eau savonneuse', 'Remplacer l\'électrovanne', 'Vérifier les raccords rapides', 'Purger le filtre-régulateur'],
    },
    structural: {
      diagnosis: 'Fissure structurelle détectée sur le bâti, risque de rupture progressive sous charge.',
      probable_causes: ['Fatigue matériau par cycles répétés', 'Mauvaise répartition des charges', 'Corrosion structurelle', 'Choc non signalé'],
      severity: 'critical',
      confidence: 0.71,
      recommended_parts: [
        { reference: 'ELC-WLD-KIT', name: 'Kit soudure industrielle', reason: 'Réparation structurelle requise' },
      ],
      recommended_actions: ['Arrêt immédiat de l\'équipement', 'Évaluation par ingénieur structure', 'Soudure ou remplacement pièce', 'Contrôle non-destructif post-réparation'],
    },
  };
  return mocks[cat] ?? mocks.mechanical;
}

export function severityWeight(s: Severity): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[s];
}
