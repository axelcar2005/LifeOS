"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  Eye,
  ImageIcon,
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
import {
  FundedAccountsPanel,
  type FundedAccount,
} from "@/components/FundedAccountsPanel";

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

const storageKeys = {
  trades: "lifeos-trading-trades",
  rules: "lifeos-trading-rules",
  rrTarget: "lifeos-trading-rr-target",
  accounts: "lifeos-trading-accounts",
};

export function TradingJournalClient() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [accounts, setAccounts] = useState<FundedAccount[]>([]);
  const [rules, setRules] = useState(initialRules);
  const [editingRules, setEditingRules] = useState(false);
  const [rrTarget, setRrTarget] = useState("1:2");
  const [editingRR, setEditingRR] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);

  useEffect(() => {
  const savedTrades = localStorage.getItem(storageKeys.trades);
  const savedRules = localStorage.getItem(storageKeys.rules);
  const savedRrTarget = localStorage.getItem(storageKeys.rrTarget);
  const savedAccounts = localStorage.getItem(storageKeys.accounts);

  if (savedTrades) setTrades(JSON.parse(savedTrades));
  if (savedRules) setRules(JSON.parse(savedRules));
  if (savedRrTarget) setRrTarget(savedRrTarget);
  if (savedAccounts) setAccounts(JSON.parse(savedAccounts));

  setLoaded(true);
}, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKeys.trades, JSON.stringify(trades));
  }, [trades, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKeys.rules, JSON.stringify(rules));
  }, [rules, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKeys.rrTarget, rrTarget);
  }, [rrTarget, loaded]);

  useEffect(() => {
  if (!loaded) return;

  localStorage.setItem(storageKeys.accounts, JSON.stringify(accounts));
}, [accounts, loaded]);

function addAccount(account: FundedAccount) {
  setAccounts((currentAccounts) => [account, ...currentAccounts]);
}

function deleteAccount(accountId: string) {
  setAccounts((currentAccounts) =>
    currentAccounts.filter((account) => account.id !== accountId)
  );
}

  function addTrade(trade: Trade) {
    setTrades((currentTrades) => [trade, ...currentTrades]);
  }

  function deleteTrade(tradeId: string) {
    setTrades((currentTrades) =>
      currentTrades.filter((trade) => trade.id !== tradeId)
    );

    setSelectedTrade((currentTrade) =>
      currentTrade?.id === tradeId ? null : currentTrade
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
      const tradesByDate = registeredTrades.reduce<Record<string, number>>(
  (totals, trade) => {
    totals[trade.date] = (totals[trade.date] || 0) + Number(trade.result || 0);
    return totals;
  },
  {}
);

const dailyResults = Object.entries(tradesByDate).map(([date, total]) => ({
  date,
  total,
}));

const bestDay =
  dailyResults.length > 0
    ? dailyResults.reduce((best, day) => (day.total > best.total ? day : best))
    : null;

const worstDay =
  dailyResults.length > 0
    ? dailyResults.reduce((worst, day) =>
        day.total < worst.total ? day : worst
      )
    : null;

const averagePerTrade =
  registeredTrades.length > 0 ? totalPnL / registeredTrades.length : 0;

const biggestWin =
  registeredTrades.length > 0
    ? registeredTrades.reduce((best, trade) =>
        Number(trade.result) > Number(best.result) ? trade : best
      )
    : null;

const biggestLoss =
  registeredTrades.length > 0
    ? registeredTrades.reduce((worst, trade) =>
        Number(trade.result) < Number(worst.result) ? trade : worst
      )
    : null;

function getMostRepeatedValue(field: "setup" | "emotion" | "account") {
  const counts = new Map<string, number>();

  registeredTrades.forEach((trade) => {
    const value = trade[field]?.trim();

    if (!value) return;

    counts.set(value, (counts.get(value) || 0) + 1);
  });

  let mostRepeated = "—";
  let highestCount = 0;

  counts.forEach((count, value) => {
    if (count > highestCount) {
      highestCount = count;
      mostRepeated = value;
    }
  });

  return mostRepeated;
}

const insightCards = [
  {
    label: "Mejor día",
    value: bestDay ? `$${bestDay.total}` : "—",
    description: bestDay ? bestDay.date : "Sin datos",
    color: "text-emerald-400",
  },
  {
    label: "Peor día",
    value: worstDay ? `$${worstDay.total}` : "—",
    description: worstDay ? worstDay.date : "Sin datos",
    color: "text-red-400",
  },
  {
    label: "Promedio por trade",
    value: registeredTrades.length > 0 ? `$${averagePerTrade.toFixed(0)}` : "—",
    description: "Resultado promedio",
    color: averagePerTrade >= 0 ? "text-emerald-400" : "text-red-400",
  },
  {
    label: "Mayor ganancia",
    value:
      biggestWin && Number(biggestWin.result) > 0
        ? `$${biggestWin.result}`
        : "—",
    description: biggestWin?.setup || "Sin datos",
    color: "text-emerald-400",
  },
  {
    label: "Mayor pérdida",
    value:
      biggestLoss && Number(biggestLoss.result) < 0
        ? `$${biggestLoss.result}`
        : "—",
    description: biggestLoss?.setup || "Sin datos",
    color: "text-red-400",
  },
  {
    label: "Setup más usado",
    value: getMostRepeatedValue("setup"),
    description: "Según tus trades",
    color: "text-white",
  },
  {
    label: "Emoción frecuente",
    value: getMostRepeatedValue("emotion"),
    description: "Tu estado más repetido",
    color: "text-blue-300",
  },
];

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

        <TradeEntryModal
  onAddTrade={addTrade}
  accounts={accounts.map((account) => account.name)}
/>
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

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-sm text-white/40">Control automático</p>
      <h3 className="mt-1 text-2xl font-bold">Cuentas fondeadas</h3>
      <p className="mt-2 max-w-2xl text-sm text-white/40">
        Revisa balance, colchón, drawdown EOD y progreso de tus cuentas.
      </p>
    </div>

    <button
      onClick={() => setIsAccountsOpen(true)}
      className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
    >
      Ver cuentas
    </button>
  </div>
</div>

      <div className="mt-6">
        <TradingCalendar trades={trades} onSelectTrade={setSelectedTrade} />
      </div>
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
  <div className="mb-6">
    <p className="text-sm text-white/40">Análisis del journal</p>
    <h3 className="mt-1 text-2xl font-bold">Estadísticas clave</h3>
  </div>

  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    {insightCards.map((card) => (
      <div
        key={card.label}
        className="rounded-2xl border border-white/10 bg-black/40 p-4"
      >
        <p className="text-xs text-white/40">{card.label}</p>
        <p className={`mt-2 text-xl font-bold ${card.color}`}>
          {card.value}
        </p>
        <p className="mt-1 truncate text-xs text-white/35">
          {card.description}
        </p>
      </div>
    ))}
  </div>
</div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">Registro</p>
              <h3 className="text-2xl font-bold">Últimas operaciones</h3>
            </div>

            <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/60">
              Guardado local
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
                  <th className="px-4 py-4 font-medium">Imagen</th>
                  <th className="px-4 py-4 font-medium">Acción</th>
                </tr>
              </thead>

              <tbody>
                {trades.length === 0 ? (
                  <tr className="border-t border-white/10">
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-white/40"
                    >
                      Todavía no tienes operaciones registradas.
                    </td>
                  </tr>
                ) : (
                  trades.map((trade) => {
                    const resultNumber = Number(trade.result);
            

                    return (
                      <tr key={trade.id} className="border-t border-white/10">
                        <td className="px-4 py-4 text-white/60">
                          {trade.date}
                        </td>
                        <td className="px-4 py-4 text-white">
                          {trade.account}
                        </td>
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
                        <td className="px-4 py-4">
                          {trade.image ? (
                            <ImageIcon size={16} className="text-emerald-400" />
                          ) : (
                            <span className="text-white/20">—</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedTrade(trade)}
                              className="rounded-xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
                              title="Ver detalle"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => deleteTrade(trade.id)}
                              className="rounded-xl bg-red-400/10 p-2 text-red-400 transition hover:bg-red-400/20"
                              title="Borrar operación"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
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
{isAccountsOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
    <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-white/40">Trading Journal</p>
          <h2 className="text-2xl font-bold text-white">Cuentas fondeadas</h2>
        </div>

        <button
          onClick={() => setIsAccountsOpen(false)}
          className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/15 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <FundedAccountsPanel
        accounts={accounts}
        trades={registeredTrades}
        onAddAccount={addAccount}
        onDeleteAccount={deleteAccount}
      />
    </div>
  </div>
)}
      {selectedTrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Detalle del trade</p>
                <h2 className="mt-1 text-2xl font-bold">
  {selectedTrade.account}
</h2>
<p className="mt-2 text-sm text-white/40">
  {selectedTrade.date} · {selectedTrade.asset} · {selectedTrade.direction}
</p>
              </div>

              <button
                onClick={() => setSelectedTrade(null)}
                className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/40">Dirección</p>
                <p className="mt-1 font-semibold">{selectedTrade.direction}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/40">Riesgo</p>
                <p className="mt-1 font-semibold">${selectedTrade.risk}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/40">Resultado</p>
                <p
                  className={`mt-1 font-semibold ${
                    Number(selectedTrade.result) >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  ${selectedTrade.result}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/40">Emoción</p>
                <p className="mt-1 font-semibold">{selectedTrade.emotion}</p>
              </div>
            </div>
<div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
  <p className="text-xs text-white/40">Setup</p>
  <p className="mt-2 text-sm font-semibold text-white/80">
    {selectedTrade.setup || "Sin setup registrado."}
  </p>
</div>
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Notas</p>
              <p className="mt-2 whitespace-pre-line text-sm text-white/70">
                {selectedTrade.notes || "Sin notas registradas."}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Imagen del trade</p>

              {selectedTrade.image ? (
                <img
                  src={selectedTrade.image}
                  alt="Imagen del trade"
                  className="mt-3 max-h-[520px] w-full rounded-2xl object-contain"
                />
              ) : (
                <p className="mt-2 text-sm text-white/40">
                  Este trade no tiene imagen guardada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}