import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@assetiq.app';

export interface NotifyPayload {
  submitter: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    company: string;
  };
  equipment: {
    name: string;
    serial_number: string;
    location: string;
    category: string;
  };
  failure: {
    title: string;
    description: string;
    category: string;
    severity: string;
    reported_at: string;
  };
  ai?: {
    diagnosis: string;
    confidence: number;
    recommended_part: string;
    recommended_actions: string[];
  } | null;
}

function severityColor(s: string) {
  const map: Record<string, string> = {
    critical: '#FF5C7A',
    high:     '#FBBF24',
    medium:   '#60A5FA',
    low:      '#34E5A1',
  };
  return map[s] ?? '#8A95A3';
}

function buildHtml(p: NotifyPayload): string {
  const color = severityColor(p.failure.severity);
  const date = new Date(p.failure.reported_at).toLocaleString('fr-FR', {
    dateStyle: 'full', timeStyle: 'short',
  });

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0E1013;font-family:'Segoe UI',system-ui,sans-serif;color:#F2F4F7;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#FF6A1A,#FFB22E);border-radius:16px;padding:24px 28px;margin-bottom:24px;">
      <div style="font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">AssetIQ</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:2px;letter-spacing:0.12em;text-transform:uppercase;">Nouvelle demande de pièce — intervention requise</div>
    </div>

    <!-- Sévérité -->
    <div style="background:#15181D;border:1px solid rgba(255,255,255,0.08);border-left:4px solid ${color};border-radius:12px;padding:16px 20px;margin-bottom:16px;">
      <div style="font-size:10px;color:#8A95A3;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:6px;">Sévérité</div>
      <div style="font-size:18px;font-weight:700;color:${color};text-transform:uppercase;">${p.failure.severity}</div>
      <div style="font-size:13px;color:#8A95A3;margin-top:4px;">${date}</div>
    </div>

    <!-- Soumetteur -->
    <div style="background:#15181D;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <div style="font-size:10px;color:#FF6A1A;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px;">Demandeur</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Nom', `${p.submitter.firstName} ${p.submitter.lastName}`)}
        ${row('Entreprise', p.submitter.company)}
        ${row('Email', p.submitter.email)}
        ${row('Téléphone', p.submitter.phone)}
      </table>
    </div>

    <!-- Équipement -->
    <div style="background:#15181D;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <div style="font-size:10px;color:#FF6A1A;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px;">Équipement concerné</div>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Nom', p.equipment.name)}
        ${row('N° de série', p.equipment.serial_number)}
        ${row('Catégorie', p.equipment.category)}
        ${row('Emplacement', p.equipment.location)}
      </table>
    </div>

    <!-- Panne -->
    <div style="background:#15181D;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <div style="font-size:10px;color:#FF6A1A;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px;">Description de la panne</div>
      <div style="font-size:15px;font-weight:600;color:#F2F4F7;margin-bottom:10px;">${p.failure.title}</div>
      <div style="font-size:13px;color:#8A95A3;line-height:1.6;">${p.failure.description || 'Aucune description fournie.'}</div>
      ${row('Catégorie', p.failure.category)}
    </div>

    <!-- Diagnostic IA -->
    ${p.ai ? `
    <div style="background:#1C2026;border:1px solid rgba(255,106,26,0.25);border-radius:12px;padding:20px;margin-bottom:16px;">
      <div style="font-size:10px;color:#FF6A1A;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:14px;">🤖 Diagnostic IA — confiance ${Math.round(p.ai.confidence * 100)}%</div>
      <div style="font-size:13px;color:#F2F4F7;line-height:1.6;margin-bottom:12px;">${p.ai.diagnosis}</div>
      <div style="font-size:12px;color:#FFB22E;font-weight:600;margin-bottom:8px;">Pièce recommandée : ${p.ai.recommended_part}</div>
      ${p.ai.recommended_actions.length ? `
      <div style="font-size:11px;color:#8A95A3;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Actions recommandées</div>
      <ul style="margin:0;padding-left:18px;">
        ${p.ai.recommended_actions.map(a => `<li style="font-size:12px;color:#8A95A3;margin-bottom:4px;">${a}</li>`).join('')}
      </ul>` : ''}
    </div>` : ''}

    <!-- CTA -->
    <div style="text-align:center;padding:8px 0 24px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/admin"
         style="display:inline-block;background:#FF6A1A;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
        Ouvrir AssetIQ Admin →
      </a>
    </div>

    <div style="text-align:center;font-size:11px;color:#576070;">
      AssetIQ · Plateforme d'intelligence industrielle
    </div>
  </div>
</body>
</html>`;
}

function row(label: string, value: string) {
  return `<tr>
    <td style="font-size:12px;color:#8A95A3;padding:5px 0;width:40%;">${label}</td>
    <td style="font-size:13px;color:#F2F4F7;padding:5px 0;font-family:monospace;">${value || '—'}</td>
  </tr>`;
}

export async function POST(req: NextRequest) {
  try {
    const payload: NotifyPayload = await req.json();

    const subject = `[AssetIQ] Nouvelle panne ${payload.failure.severity.toUpperCase()} — ${payload.equipment.name} · ${payload.submitter.company}`;

    const { error } = await resend.emails.send({
      from:    'AssetIQ <onboarding@resend.dev>',
      to:      ADMIN_EMAIL,
      subject,
      html:    buildHtml(payload),
      replyTo: payload.submitter.email || undefined,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ ok: false, error }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Email notify error:', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
