import { createClient } from "@supabase/supabase-js";

/* Branchement Supabase.
   Tant que les variables d'env sont vides, l'app utilise le store en mémoire
   (lib/store.tsx). Renseigne NEXT_PUBLIC_SUPABASE_URL + ANON_KEY pour activer
   la vraie base, puis remplace les actions du store par des appels Supabase. */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && key);
export const supabase = supabaseEnabled ? createClient(url!, key!) : null;
