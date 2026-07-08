import { Activity, Flame, Scale, TrendingUp } from "lucide-react";

import { DashboardHeader } from "@/components/DashboardHeader";
import { ProgressPlan } from "@/components/ProgressPlan";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";

const stats = [
  {
    title: "Trading semanal",
    value: "+$0",
    description: "Empieza registrando tus operaciones.",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    title: "Peso actual",
    value: "100 kg",
    description: "Meta: bajar grasa y mejorar físico.",
    icon: Scale,
    color: "text-white",
  },
  {
    title: "Calorías",
    value: "0 / 1800",
    description: "Déficit diario estimado.",
    icon: Flame,
    color: "text-orange-300",
  },
  {
    title: "Hábitos",
    value: "0 días",
    description: "Racha de disciplina.",
    icon: Activity,
    color: "text-blue-300",
  },
];

export default function Home() {
  return (
    <AppShell>
          <DashboardHeader />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/40">Resumen</p>
                  <h3 className="text-2xl font-bold">Tu día de hoy</h3>
                </div>

                <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/60">
                  En progreso
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-sm text-white/40">Objetivo principal</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Ser rentable y disciplinado
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-sm text-white/40">Próximo módulo</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Trading Journal
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-sm text-white/40">Salud</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Déficit + gimnasio
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-sm text-white/40">Finanzas</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Ahorros e inversiones
                  </h4>
                </div>
              </div>
            </div>

            <ProgressPlan />
          </div>
        </AppShell>
  );
}