"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  LineChart,
  Play,
  Plus,
  RefreshCcw,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

type BacktestSession = {
  id: string;
  name: string;
  instrument: string;
  testedDate: string;
  timeframe: string;
  initialBalance: number;
  riskPerTrade: number;
  setup: string;
  notes: string;
  createdAt: string;
};

type BacktestTrade = {
  id: string;
  sessionId: string;
  direction: "Long" | "Short";
  entry: number;
  stopLoss: number;
  takeProfit: number;
  risk: number;
  result: number;
  rr: number;
  status: "Win" | "Loss" | "BE" | "Pendiente";
  notes: string;
  createdAt: string;
};

const storageKeys = {
  sessions: "lifeos-backtesting-sessions",
  trades: "lifeos-backtesting-trades",
};

const sampleCandles = [
  { time: "09:30", open: 22400, high: 22420, low: 22390, close: 22410 },
  { time: "09:35", open: 22410, high: 22430, low: 22405, close: 22425 },
  { time: "09:40", open: 22425, high: 22445, low: 22415, close: 22438 },
  { time: "09:45", open: 22438, high: 22460, low: 22430, close: 22450 },
  { time: "09:50", open: 22450, high: 22470, low: 22440, close: 22465 },
  { time: "09:55", open: 22465, high: 22480, low: 22455, close: 22472 },
  { time: "10:00", open: 22472, high: 22478, low: 22445, close: 22452 },
  { time: "10:05", open: 22452, high: 22465, low: 22420, close: 22430 },
  { time: "10:10", open: 22430, high: 22455, low: 22410, close: 22448 },
  { time: "10:15", open: 22448, high: 22490, low: 22440, close: 22482 },
  { time: "10:20", open: 22482, high: 22510, low: 22475, close: 22500 },
  { time: "10:25", open: 22500, high: 22525, low: 22492, close: 22518 },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function createId() {
  return crypto.randomUUID();
}

export function BacktestingClient() {
  const [loaded, setLoaded] = useState(false);
  const [sessions, setSessions] = useState<BacktestSession[]>([]);
  const [trades, setTrades] = useState<BacktestTrade[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const [sessionForm, setSessionForm] = useState({
    name: "Backtest IFVG NY AM",
    instrument: "MNQ",
    testedDate: new Date().toISOString().slice(0, 10),
    timeframe: "1m",
    initialBalance: "50000",
    riskPerTrade: "250",
    setup: "IFVG 1M Y 5M",
    notes: "",
  });

  const [tradeForm, setTradeForm] = useState({
    direction: "Long" as "Long" | "Short",
    entry: "22450",
    stopLoss: "22425",
    takeProfit: "22500",
    risk: "250",
    notes: "",
  });

  useEffect(() => {
    const savedSessions = localStorage.getItem(storageKeys.sessions);
    const savedTrades = localStorage.getItem(storageKeys.trades);

    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions) as BacktestSession[];
      setSessions(parsedSessions);
      setSelectedSessionId(parsedSessions[0]?.id ?? null);
    }

    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKeys.sessions, JSON.stringify(sessions));
  }, [sessions, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKeys.trades, JSON.stringify(trades));
  }, [trades, loaded]);

  const selectedSession = sessions.find(
    (session) => session.id === selectedSessionId
  );

  const sessionTrades = useMemo(() => {
    if (!selectedSessionId) return [];
    return trades.filter((trade) => trade.sessionId === selectedSessionId);
  }, [trades, selectedSessionId]);

  const stats = useMemo(() => {
    const wins = sessionTrades.filter((trade) => trade.status === "Win");
    const losses = sessionTrades.filter((trade) => trade.status === "Loss");
    const totalResult = sessionTrades.reduce(
      (total, trade) => total + trade.result,
      0
    );

    const initialBalance = selectedSession?.initialBalance ?? 0;
    const currentBalance = initialBalance + totalResult;
    const winrate =
      sessionTrades.length > 0 ? (wins.length / sessionTrades.length) * 100 : 0;
    const totalR = sessionTrades.reduce((total, trade) => total + trade.rr, 0);

    return {
      totalTrades: sessionTrades.length,
      wins: wins.length,
      losses: losses.length,
      winrate,
      totalResult,
      totalR,
      initialBalance,
      currentBalance,
    };
  }, [sessionTrades, selectedSession]);

  function createSession(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const session: BacktestSession = {
      id: createId(),
      name: sessionForm.name,
      instrument: sessionForm.instrument,
      testedDate: sessionForm.testedDate,
      timeframe: sessionForm.timeframe,
      initialBalance: Number(sessionForm.initialBalance || 0),
      riskPerTrade: Number(sessionForm.riskPerTrade || 0),
      setup: sessionForm.setup,
      notes: sessionForm.notes,
      createdAt: new Date().toISOString(),
    };

    setSessions((current) => [session, ...current]);
    setSelectedSessionId(session.id);
  }

  function calculateTradeResult() {
    const direction = tradeForm.direction;
    const entry = Number(tradeForm.entry);
    const stopLoss = Number(tradeForm.stopLoss);
    const takeProfit = Number(tradeForm.takeProfit);
    const risk = Number(tradeForm.risk || selectedSession?.riskPerTrade || 0);

    const riskPoints =
      direction === "Long" ? entry - stopLoss : stopLoss - entry;
    const rewardPoints =
      direction === "Long" ? takeProfit - entry : entry - takeProfit;

    if (riskPoints <= 0 || rewardPoints <= 0 || risk <= 0) {
      return {
        result: 0,
        rr: 0,
        status: "Pendiente" as const,
      };
    }

    const rr = rewardPoints / riskPoints;

    /*
      Por ahora este primer prototipo calcula el resultado al TP.
      En el siguiente paso le metemos el replay real vela por vela:
      si toca SL primero = Loss, si toca TP primero = Win.
    */
    return {
      result: risk * rr,
      rr,
      status: "Win" as const,
    };
  }

  function addBacktestTrade(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedSession) {
      alert("Primero crea o selecciona una sesión.");
      return;
    }

    const calculated = calculateTradeResult();

    const trade: BacktestTrade = {
      id: createId(),
      sessionId: selectedSession.id,
      direction: tradeForm.direction,
      entry: Number(tradeForm.entry),
      stopLoss: Number(tradeForm.stopLoss),
      takeProfit: Number(tradeForm.takeProfit),
      risk: Number(tradeForm.risk || selectedSession.riskPerTrade),
      result: calculated.result,
      rr: calculated.rr,
      status: calculated.status,
      notes: tradeForm.notes,
      createdAt: new Date().toISOString(),
    };

    setTrades((current) => [trade, ...current]);
  }

  function deleteSession(sessionId: string) {
    setSessions((current) => current.filter((session) => session.id !== sessionId));
    setTrades((current) => current.filter((trade) => trade.sessionId !== sessionId));

    if (selectedSessionId === sessionId) {
      const nextSession = sessions.find((session) => session.id !== sessionId);
      setSelectedSessionId(nextSession?.id ?? null);
    }
  }

  function deleteTrade(tradeId: string) {
    setTrades((current) => current.filter((trade) => trade.id !== tradeId));
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-400">
            Strategy Lab
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Backtesting
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/45">
            Crea sesiones de práctica, simula operaciones y separa tu
            backtesting del journal real. Este es el primer paso del simulador
            con velas históricas.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
          <p className="text-xs text-white/40">Sesión activa</p>
          <p className="mt-1 text-lg font-bold">
            {selectedSession?.name ?? "Sin sesión"}
          </p>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Balance actual"
          value={formatMoney(stats.currentBalance)}
          description="Balance simulado de la sesión"
          icon={Wallet}
          color={stats.totalResult >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <StatCard
          title="P&L"
          value={formatMoney(stats.totalResult)}
          description={`${stats.totalR.toFixed(2)}R acumulado`}
          icon={TrendingUp}
          color={stats.totalResult >= 0 ? "text-emerald-400" : "text-red-400"}
        />
        <StatCard
          title="Winrate"
          value={`${stats.winrate.toFixed(0)}%`}
          description={`${stats.wins} ganadas / ${stats.losses} perdidas`}
          icon={Target}
          color="text-cyan-300"
        />
        <StatCard
          title="Trades"
          value={`${stats.totalTrades}`}
          description="Operaciones simuladas"
          icon={Activity}
          color="text-white"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <Panel title="Nueva sesión" icon={Plus}>
            <form onSubmit={createSession} className="space-y-4">
              <Field label="Nombre">
                <input
                  value={sessionForm.name}
                  onChange={(event) =>
                    setSessionForm({ ...sessionForm, name: event.target.value })
                  }
                  className="input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Instrumento">
                  <input
                    value={sessionForm.instrument}
                    onChange={(event) =>
                      setSessionForm({
                        ...sessionForm,
                        instrument: event.target.value,
                      })
                    }
                    className="input"
                  />
                </Field>

                <Field label="Timeframe">
                  <select
                    value={sessionForm.timeframe}
                    onChange={(event) =>
                      setSessionForm({
                        ...sessionForm,
                        timeframe: event.target.value,
                      })
                    }
                    className="input"
                  >
                    <option value="1m">1m</option>
                    <option value="5m">5m</option>
                    <option value="15m">15m</option>
                  </select>
                </Field>
              </div>

              <Field label="Fecha testeada">
                <input
                  type="date"
                  value={sessionForm.testedDate}
                  onChange={(event) =>
                    setSessionForm({
                      ...sessionForm,
                      testedDate: event.target.value,
                    })
                  }
                  className="input"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Balance inicial">
                  <input
                    type="number"
                    value={sessionForm.initialBalance}
                    onChange={(event) =>
                      setSessionForm({
                        ...sessionForm,
                        initialBalance: event.target.value,
                      })
                    }
                    className="input"
                  />
                </Field>

                <Field label="Riesgo">
                  <input
                    type="number"
                    value={sessionForm.riskPerTrade}
                    onChange={(event) =>
                      setSessionForm({
                        ...sessionForm,
                        riskPerTrade: event.target.value,
                      })
                    }
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Setup">
                <input
                  value={sessionForm.setup}
                  onChange={(event) =>
                    setSessionForm({ ...sessionForm, setup: event.target.value })
                  }
                  className="input"
                />
              </Field>

              <button className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-white/90">
                Crear sesión
              </button>
            </form>
          </Panel>

          <Panel title="Sesiones" icon={CalendarDays}>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-sm text-white/40">
                  Todavía no tienes sesiones. Crea una para empezar.
                </p>
              ) : (
                sessions.map((session) => (
                  <div
  key={session.id}
  className={`w-full rounded-2xl border p-4 text-left transition ${
    selectedSessionId === session.id
      ? "border-emerald-400/50 bg-emerald-400/10"
      : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
  }`}
>
  <button
    type="button"
    onClick={() => setSelectedSessionId(session.id)}
    className="w-full text-left"
  >
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-bold">{session.name}</p>
        <p className="mt-1 text-xs text-white/40">
          {session.instrument} • {session.testedDate} • {session.timeframe}
        </p>
      </div>

      <ChevronRight size={18} className="text-white/30" />
    </div>
  </button>

  <div className="mt-3 flex items-center gap-4">
    <Link
      href={`/backtesting/${session.id}`}
      className="text-xs font-bold text-emerald-300 hover:text-emerald-200"
    >
      Abrir simulador
    </Link>

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        deleteSession(session.id);
      }}
      className="text-xs font-semibold text-red-300"
    >
      Eliminar
    </button>
  </div>
</div>
                ))
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Replay de velas" icon={LineChart}>
            <div className="mb-4 flex flex-wrap gap-2">
              <button className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black">
                <Play size={15} className="mr-2 inline" />
                Play
              </button>
              <button className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70">
                Siguiente vela
              </button>
              <button className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70">
                <RefreshCcw size={15} className="mr-2 inline" />
                Reiniciar
              </button>
            </div>

            <FakeCandleChart />
          </Panel>

          <section className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
            <Panel title="Nueva operación simulada" icon={Target}>
              <form onSubmit={addBacktestTrade} className="space-y-4">
                <Field label="Dirección">
                  <select
                    value={tradeForm.direction}
                    onChange={(event) =>
                      setTradeForm({
                        ...tradeForm,
                        direction: event.target.value as "Long" | "Short",
                      })
                    }
                    className="input"
                  >
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </select>
                </Field>

                <div className="grid grid-cols-3 gap-3">
                  <Field label="Entrada">
                    <input
                      type="number"
                      value={tradeForm.entry}
                      onChange={(event) =>
                        setTradeForm({ ...tradeForm, entry: event.target.value })
                      }
                      className="input"
                    />
                  </Field>

                  <Field label="SL">
                    <input
                      type="number"
                      value={tradeForm.stopLoss}
                      onChange={(event) =>
                        setTradeForm({
                          ...tradeForm,
                          stopLoss: event.target.value,
                        })
                      }
                      className="input"
                    />
                  </Field>

                  <Field label="TP">
                    <input
                      type="number"
                      value={tradeForm.takeProfit}
                      onChange={(event) =>
                        setTradeForm({
                          ...tradeForm,
                          takeProfit: event.target.value,
                        })
                      }
                      className="input"
                    />
                  </Field>
                </div>

                <Field label="Riesgo">
                  <input
                    type="number"
                    value={tradeForm.risk}
                    onChange={(event) =>
                      setTradeForm({ ...tradeForm, risk: event.target.value })
                    }
                    className="input"
                  />
                </Field>

                <Field label="Notas">
                  <textarea
                    value={tradeForm.notes}
                    onChange={(event) =>
                      setTradeForm({ ...tradeForm, notes: event.target.value })
                    }
                    className="input min-h-24 resize-none"
                    placeholder="Qué viste, por qué entrarías, qué mejorar..."
                  />
                </Field>

                <button className="w-full rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-300">
                  Guardar trade simulado
                </button>
              </form>
            </Panel>

            <Panel title="Journal de backtesting" icon={BarChart3}>
              <div className="space-y-3">
                {sessionTrades.length === 0 ? (
                  <p className="text-sm text-white/40">
                    Esta sesión todavía no tiene operaciones simuladas.
                  </p>
                ) : (
                  sessionTrades.map((trade) => (
                    <div
                      key={trade.id}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold">
                            {trade.direction} • {trade.status}
                          </p>
                          <p className="mt-1 text-xs text-white/40">
                            Entrada {trade.entry} • SL {trade.stopLoss} • TP{" "}
                            {trade.takeProfit}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              trade.result >= 0
                                ? "text-emerald-400"
                                : "text-red-400"
                            }`}
                          >
                            {formatMoney(trade.result)}
                          </p>
                          <p className="text-xs text-white/40">
                            {trade.rr.toFixed(2)}R
                          </p>
                        </div>
                      </div>

                      {trade.notes && (
                        <p className="mt-3 text-sm text-white/50">
                          {trade.notes}
                        </p>
                      )}

                      <button
                        onClick={() => deleteTrade(trade.id)}
                        className="mt-3 text-xs font-semibold text-red-300"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </section>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-white/40">{title}</p>
        <Icon size={18} className={color} />
      </div>
      <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
      <p className="mt-2 text-xs text-white/35">{description}</p>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold text-white/40">
        {label}
      </span>
      {children}
    </label>
  );
}

function FakeCandleChart() {
  const minPrice = Math.min(...sampleCandles.map((candle) => candle.low));
  const maxPrice = Math.max(...sampleCandles.map((candle) => candle.high));
  const range = maxPrice - minPrice || 1;

  function y(price: number) {
    return 260 - ((price - minPrice) / range) * 220;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#080808] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-bold text-white/70">MNQ Replay Preview</p>
        <p className="text-xs text-white/35">Datos demo / CSV próximamente</p>
      </div>

      <svg viewBox="0 0 720 300" className="h-[320px] w-full">
        <rect x="0" y="0" width="720" height="300" fill="#050505" />

        {[0, 1, 2, 3, 4].map((line) => (
          <line
            key={line}
            x1="0"
            x2="720"
            y1={40 + line * 50}
            y2={40 + line * 50}
            stroke="rgba(255,255,255,0.07)"
          />
        ))}

        <rect
          x="405"
          y={y(22510)}
          width="170"
          height={y(22470) - y(22510)}
          fill="rgba(16,185,129,0.14)"
          stroke="rgba(16,185,129,0.35)"
        />

        <rect
          x="405"
          y={y(22425)}
          width="170"
          height={y(22450) - y(22425)}
          fill="rgba(239,68,68,0.14)"
          stroke="rgba(239,68,68,0.35)"
        />

        {sampleCandles.map((candle, index) => {
          const x = 45 + index * 52;
          const isBull = candle.close >= candle.open;
          const bodyTop = y(Math.max(candle.open, candle.close));
          const bodyBottom = y(Math.min(candle.open, candle.close));

          return (
            <g key={candle.time}>
              <line
                x1={x}
                x2={x}
                y1={y(candle.high)}
                y2={y(candle.low)}
                stroke={isBull ? "#34d399" : "#f87171"}
                strokeWidth="3"
              />
              <rect
                x={x - 11}
                y={bodyTop}
                width="22"
                height={Math.max(4, bodyBottom - bodyTop)}
                rx="3"
                fill={isBull ? "#34d399" : "#f87171"}
              />
              <text
                x={x}
                y="286"
                textAnchor="middle"
                fill="rgba(255,255,255,0.35)"
                fontSize="12"
              >
                {candle.time}
              </text>
            </g>
          );
        })}

        <line
          x1="385"
          x2="610"
          y1={y(22450)}
          y2={y(22450)}
          stroke="rgba(255,255,255,0.5)"
          strokeDasharray="8 8"
        />
        <text x="615" y={y(22450) + 4} fill="white" fontSize="14">
          Entrada
        </text>

        <line
          x1="385"
          x2="610"
          y1={y(22500)}
          y2={y(22500)}
          stroke="#34d399"
          strokeDasharray="8 8"
        />
        <text x="615" y={y(22500) + 4} fill="#34d399" fontSize="14">
          TP
        </text>

        <line
          x1="385"
          x2="610"
          y1={y(22425)}
          y2={y(22425)}
          stroke="#f87171"
          strokeDasharray="8 8"
        />
        <text x="615" y={y(22425) + 4} fill="#f87171" fontSize="14">
          SL
        </text>
      </svg>
    </div>
  );
}