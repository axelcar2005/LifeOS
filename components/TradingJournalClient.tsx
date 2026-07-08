"use client";

import { useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Pencil,
  Save,
  Target,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import { StatCard } from "@/components/StatCard";
import { TradingCalendar } from "@/components/TradingCalendar";
import { Trade, TradeEntryModal } from "@/components/TradeEntryModal";

const initialTrades: Trade[] = [];

const initialRules = [
  {
    title: "Máximo 2 operaciones",
    description: "Evitar sobreoperar después de una pérdida.",
  },
  {
    title: "RR mínimo 1:2",
    description: "Buscar buenas entradas, no operar por ansiedad.",
  },
  {
    title: "Registrar todo",
    description: "Screenshot, razón de entrada, emoción y resultado.",
  },
];

export function TradingJournalClient() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [rules, setRules] = useState(initialRules);
  const [editingRules, setEditingRules] = useState(false);
  const [rrTarget, setRrTarget] = useState("1:2");
  const [editingRR, setEditingRR] = useState(false);

  function addTrade(trade: Trade) {
    setTrades((currentTrades) => [trade, ...currentTrades]);
  }

  function deleteTrade(tradeId: string) {
    setTrades((currentTrades) =>
      currentTrades.filter((trade) => trade.id !== tradeId)
    );
  }

  function updateRule(
    index: number,
    field: "title" | "description",
    value: string
  ) {
    setRules((currentRules) =>
      currentRules.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [field]: value } : rule
      )
    );
  }

  function addRule() {
    setRules((currentRules) => [
      ...currentRules,
      {
        title: "Nueva regla",
        description: "Describe aquí tu regla.",
      },
    ]);
  }

  function deleteRule(index: number) {
    setRules((currentRules) =>
      currentRules.filter((_, ruleIndex) => ruleIndex !== index)
    );
  }

  const registeredTrades = trades.filter(
    (trade) => trade.status === "Registrado"
  );

  const totalPnL = registeredTrades.reduce(
    (total, trade) => total + Number(trade.result || 0),
    0
  );

  const winningTrades = registeredTrades.filter(
    (trade) => Number(trade.result) > 0
  );

  const winRate =
    registeredTrades.length > 0
      ? Math.round((winningTrades.length / registeredTrades.length) * 100)
      : 0;

  const tradingStats = [
    {
      title: "P&L mensual",
      value: `$${totalPnL}`,
      description: "Ganancia o pérdida acumulada del mes.",
      icon: CircleDollarSign,
      color: totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      description: "Porcentaje de operaciones ganadoras.",
      icon: BarChart3,
      color: "text-blue-300",
    },
    {
      title: "RR objetivo",
      value: rrTarget,
      description: "Ratio riesgo/beneficio que quieres usar.",
      icon: Target,
      color: "text-orange-300",
    },
    {
      title: "Trades",
      value: `${registeredTrades.length}`,
      description: "Operaciones registradas este mes.",
      icon: TrendingUp,
      color: "text-white",
    },
  ];

  return (
    <>
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

        <TradeEntryModal onAddTrade={addTrade} />
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {tradingStats.map((stat) => {
          const Icon = stat.icon;

          if (stat.title === "RR objetivo") {
            return (
              <div
                key={stat.title}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:bg-white/[0.05]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-white/40">{stat.title}</p>

                  <button
                    onClick={() => setEditingRR(!editingRR)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-orange-300 transition hover:bg-white/20"
                    title="Editar RR objetivo"
                  >
                    {editingRR ? <Save size={18} /> : <Pencil size={18} />}
                  </button>
                </div>

                {editingRR ? (
                  <select
                    value={rrTarget}
                    onChange={(event) => setRrTarget(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-2xl font-bold text-orange-300 outline-none focus:border-emerald-400"
                  >
                    <option>1:1</option>
                    <option>1:1.5</option>
                    <option>1:2</option>
                    <option>1:3</option>
                    <option>1:4</option>
                    <option>1:5</option>
                  </select>
                ) : (
                  <h3 className="text-3xl font-bold text-orange-300">
                    {rrTarget}
                  </h3>
                )}

                <p className="mt-3 text-sm leading-relaxed text-white/40">
                  Ratio riesgo/beneficio que quieres usar.
                </p>
              </div>
            );
          }

          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={Icon}
              color={stat.color}
            />
          );
        })}
      </div>

      <div className="mt-6">
        <TradingCalendar trades={trades} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">Registro</p>
              <h3 className="text-2xl font-bold">Últimas operaciones</h3>
            </div>

            <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/60">
              Temporal
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
                  <th className="px-4 py-4 font-medium">Acción</th>
                </tr>
              </thead>

              <tbody>
                {trades.map((trade) => {
                  const resultNumber = Number(trade.result);

                  return (
                    <tr key={trade.id} className="border-t border-white/10">
                      <td className="px-4 py-4 text-white/60">{trade.date}</td>
                      <td className="px-4 py-4 text-white">{trade.account}</td>
                      <td className="px-4 py-4 text-white/60">
                        {trade.setup}
                      </td>
                      <td
                        className={`px-4 py-4 ${
                          resultNumber >= 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }`}
                      >
                        ${trade.result}
                      </td>
                      <td className="px-4 py-4 text-white/40">
                        {trade.status}
                      </td>
                      <td className="px-4 py-4">
                        {trade.status === "Registrado" ? (
                          <button
                            onClick={() => deleteTrade(trade.id)}
                            className="rounded-xl bg-red-400/10 p-2 text-red-400 transition hover:bg-red-400/20"
                            title="Borrar operación"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <CalendarDays size={20} className="text-emerald-400" />
              </div>

              <div>
                <p className="text-sm text-white/40">Plan diario</p>
                <h3 className="text-xl font-bold">Reglas del día</h3>
              </div>
            </div>

            <button
              onClick={() => setEditingRules(!editingRules)}
              className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              title="Editar reglas"
            >
              {editingRules ? <Save size={18} /> : <Pencil size={18} />}
            </button>
          </div>

          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-black/40 p-4"
              >
                {editingRules ? (
                  <div className="space-y-3">
                    <input
                      value={rule.title}
                      onChange={(event) =>
                        updateRule(index, "title", event.target.value)
                      }
                      className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-emerald-400"
                    />

                    <textarea
                      value={rule.description}
                      onChange={(event) =>
                        updateRule(index, "description", event.target.value)
                      }
                      rows={2}
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/70 outline-none focus:border-emerald-400"
                    />

                    <button
                      onClick={() => deleteRule(index)}
                      className="flex items-center gap-2 text-xs text-red-400 transition hover:text-red-300"
                    >
                      <X size={14} />
                      Borrar regla
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold">{rule.title}</p>
                    <p className="mt-1 text-sm text-white/40">
                      {rule.description}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {editingRules && (
            <button
              onClick={addRule}
              className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              + Agregar regla
            </button>
          )}
        </div>
      </div>
    </>
  );
}