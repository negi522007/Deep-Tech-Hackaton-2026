#!/usr/bin/env bash
# =============================================================
# AssetIQ — Script de setup
# Usage : bash setup.sh
# =============================================================

set -e

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}╔══════════════════════════════════════╗${NC}"
echo -e "${CYAN}║   AssetIQ — Setup automatique        ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════╝${NC}"
echo ""

# ── 1. Vérification Node.js ───────────────────────────────────
echo -e "${CYAN}[1/4]${NC} Vérification Node.js..."
if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js non trouvé. Installer depuis https://nodejs.org (version ≥ 18)${NC}"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js $NODE_VERSION détecté. Version ≥ 18 requise.${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) — OK${NC}"

# ── 2. Installation des dépendances ──────────────────────────
echo ""
echo -e "${CYAN}[2/4]${NC} Installation des dépendances npm..."
npm install --silent
echo -e "${GREEN}✓ Dépendances installées${NC}"

# ── 3. Variables d'environnement ─────────────────────────────
echo ""
echo -e "${CYAN}[3/4]${NC} Configuration de l'environnement..."
if [ ! -f ".env.local" ]; then
  cp .env.example .env.local
  echo -e "${YELLOW}⚠  .env.local créé depuis .env.example${NC}"
  echo -e "${YELLOW}   → Ouvrir .env.local et remplir les clés API avant de continuer${NC}"
  echo -e "   Clés importantes :"
  echo -e "   • ANTHROPIC_API_KEY  → https://console.anthropic.com"
  echo -e "   • RESEND_API_KEY     → https://resend.com"
  echo -e "   • ADMIN_EMAIL        → votre adresse email"
else
  echo -e "${GREEN}✓ .env.local déjà présent${NC}"
fi

# ── 4. Vérification du build ─────────────────────────────────
echo ""
echo -e "${CYAN}[4/4]${NC} Vérification TypeScript..."
if npm run typecheck --silent 2>/dev/null; then
  echo -e "${GREEN}✓ TypeScript — aucune erreur${NC}"
else
  echo -e "${YELLOW}⚠  Des erreurs TypeScript ont été détectées. Lancer 'npm run typecheck' pour les voir.${NC}"
fi

# ── Résumé ───────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup terminé !                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "Pour démarrer l'application :"
echo -e "  ${CYAN}npm run dev${NC}"
echo ""
echo -e "L'app sera disponible sur ${CYAN}http://localhost:3000${NC}"
echo -e "  • Portail Technicien : ${CYAN}http://localhost:3000/technicien${NC}"
echo -e "  • Portail Admin      : ${CYAN}http://localhost:3000/dashboard${NC}"
echo ""
echo -e "Documentation complète : ${CYAN}README.md${NC} et ${CYAN}docs/ARCHITECTURE.md${NC}"
echo ""
