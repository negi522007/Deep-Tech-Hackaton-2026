import Link from 'next/link';
import { ClipboardList, History, ArrowRight, Zap } from 'lucide-react';

export default function TechHome() {
  return (
    <div className="py-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-chalk mb-3">
          Bienvenue sur <span className="gradient-text">AssetIQ</span>
        </h1>
        <p className="text-steel max-w-md mx-auto">
          Déclarez une panne, uploadez vos preuves visuelles — notre IA analyse et vos admins sont alertés instantanément.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Link href="/technicien/soumettre" className="glass glass-hover p-6 flex flex-col gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan/10 text-cyan">
            <ClipboardList size={24} />
          </div>
          <div>
            <h2 className="font-bold text-chalk text-lg">Nouvelle demande</h2>
            <p className="text-steel text-sm mt-1">Déclarez une panne avec photos et description. L&apos;IA diagnostique, les admins reçoivent tout immédiatement.</p>
          </div>
          <div className="flex items-center gap-1 text-cyan text-sm font-medium mt-auto">
            Commencer <ArrowRight size={15} />
          </div>
        </Link>

        <Link href="/technicien/suivi" className="glass glass-hover p-6 flex flex-col gap-4">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber/10 text-amber">
            <History size={24} />
          </div>
          <div>
            <h2 className="font-bold text-chalk text-lg">Mes demandes</h2>
            <p className="text-steel text-sm mt-1">Suivez l&apos;avancement de vos demandes en temps réel. Historique complet avec dates, pièces et délais.</p>
          </div>
          <div className="flex items-center gap-1 text-amber text-sm font-medium mt-auto">
            Voir le suivi <ArrowRight size={15} />
          </div>
        </Link>
      </div>

      <div className="glass p-5 flex items-start gap-4 border-cyan/20">
        <Zap size={20} className="text-cyan shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-chalk">Diagnostic IA inclus</p>
          <p className="text-xs text-steel mt-1">
            Après votre soumission, notre IA analyse vos photos et identifie automatiquement la pièce à commander — réduisant le délai de sourcing de 72%.
          </p>
        </div>
      </div>
    </div>
  );
}
