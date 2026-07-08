import { BarChart3, CalendarDays, CircleDollarSign, Target, TrendingUp } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { TradeEntryModal } from "@/components/TradeEntryModal";

const tradingStats = [
  {
    title: "P&L mensual",
    value: "$0",
    description: "Ganancia o pérdida acumulada del mes.",
    icon: CircleDollarSign,
    color: "text-emerald-400",
  },
  {
    title: "Win Rate",
    value: "0%",
    description: "Porcentaje de operaciones ganadoras.",
    icon: BarChart3,
    color: "text-blue-300",
  },
  {
    title: "RR promedio",
    value: "1:2",
    description: "Relación riesgo/beneficio objetivo.",
    icon: Target,
    color: "text-orange-300",
  },
  {
    title: "Trades",
    value: "0",
    description: "Operaciones registradas este mes.",
    icon: TrendingUp,
    color: "text-white",
  },
];

const recentTrades = [
  {
    date: "Pendiente",
    account: "Apex PA",
    setup: "IFVG 5m",
    result: "$0",
    status: "Sin registrar",
  },
  {
    date: "Pendiente",
    account: "Prueba 25K",
    setup: "Liquidity Sweep",
    result: "$0",
    status: "Sin registrar",
  },
  {
    date: "Pendiente",
    account: "Apex PA",
    setup: "Break + Retest",
    result: "$0",
    status: "Sin registrar",
  },
];

export default function TradingPage() {
  return (
    <AppShell>
      <header className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Módulo Trading Journal
          </div>

          <p className="text-sm text-white/40">Journal y estadísticas</p>

          <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Trading Journal
          </h2>

          <p className="mt-4 max-w-2xl text-white/50">
            Registra tus operaciones, controla tu riesgo, analiza tus errores y
            mide tu progreso como trader.
          </p>
        </div>

        <TradeEntryModal />
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tradingStats.map((stat) => (
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
              <p className="text-sm text-white/40">Registro</p>
              <h3 className="text-2xl font-bold">Últimas operaciones</h3>
            </div>

            <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/60">
              Demo visual
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/40">
                <tr>
                  <th className="px-4 py-4 font-medium">Fecha</th>
                  <th className="px-4 py-4 font-medium">Cuenta</th>
                  <th className="px-4 py-4 font-medium">Setup</th>
                  <th className="px-4 py-4 font-medium">Resultado</th>
                  <th className="px-4 py-4 font-medium">Estado</th>
                </tr>
              </thead>

              <tbody>
                {recentTrades.map((trade, index) => (
                  <tr key={index} className="border-t border-white/10">
                    <td className="px-4 py-4 text-white/60">{trade.date}</td>
                    <td className="px-4 py-4 text-white">{trade.account}</td>
                    <td className="px-4 py-4 text-white/60">{trade.setup}</td>
                    <td className="px-4 py-4 text-emerald-400">{trade.result}</td>
                    <td className="px-4 py-4 text-white/40">{trade.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
              <CalendarDays size={20} className="text-emerald-400" />
            </div>

            <div>
              <p className="text-sm text-white/40">Plan diario</p>
              <h3 className="text-xl font-bold">Reglas del día</h3>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm font-semibold">Máximo 2 operaciones</p>
              <p className="mt-1 text-sm text-white/40">
                Evitar sobreoperar después de una pérdida.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm font-semibold">RR mínimo 1:2</p>
              <p className="mt-1 text-sm text-white/40">
                Buscar buenas entradas, no operar por ansiedad.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-sm font-semibold">Registrar todo</p>
              <p className="mt-1 text-sm text-white/40">
                Screenshot, razón de entrada, emoción y resultado.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}