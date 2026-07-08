import { ArrowUpRight, CheckCircle2, Circle } from "lucide-react";

export function ProgressPlan() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/40">Plan de construcción</p>
          <h3 className="mt-2 text-2xl font-bold">Fase 1</h3>
        </div>

        <ArrowUpRight className="text-white/30" size={22} />
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <p className="text-sm text-white/70">Proyecto creado</p>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <p className="text-sm text-white/70">Página funcionando</p>
        </div>

        <div className="flex items-center gap-3">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <p className="text-sm text-white/70">Diseño inicial</p>
        </div>

        <div className="flex items-center gap-3">
          <Circle size={18} className="text-white/25" />
          <p className="text-sm text-white/40">Base de datos</p>
        </div>

        <div className="flex items-center gap-3">
          <Circle size={18} className="text-white/25" />
          <p className="text-sm text-white/40">Login</p>
        </div>
      </div>
    </div>
  );
}