"use client";

import { BacktestingChart } from "@/components/BacktestingChart";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  CircleDot,
  FastForward,
  Pause,
  Play,
  RefreshCcw,
  Target,
  Wallet,
  type LucideIcon,
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

type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

const storageKeys = {
  sessions: "lifeos-backtesting-sessions",
  trades: "lifeos-backtesting-trades",
};

const demoCandles: Candle[] = [
  { time: "09:30", open: 22400, high: 22420, low: 22388, close: 22410 },
  { time: "09:31", open: 22410, high: 22428, low: 22402, close: 22422 },
  { time: "09:32", open: 22422, high: 22440, low: 22415, close: 22435 },
  { time: "09:33", open: 22435, high: 22450, low: 22424, close: 22430 },
  { time: "09:34", open: 22430, high: 22455, low: 22420, close: 22448 },
  { time: "09:35", open: 22448, high: 22468, low: 22438, close: 22460 },
  { time: "09:36", open: 22460, high: 22482, low: 22450, close: 22474 },
  { time: "09:37", open: 22474, high: 22490, low: 22460, close: 22466 },
  { time: "09:38", open: 22466, high: 22478, low: 22435, close: 22442 },
  { time: "09:39", open: 22442, high: 22458, low: 22418, close: 22425 },
  { time: "09:40", open: 22425, high: 22452, low: 22410, close: 22445 },
  { time: "09:41", open: 22445, high: 22470, low: 22438, close: 22464 },
  { time: "09:42", open: 22464, high: 22496, low: 22458, close: 22490 },
  { time: "09:43", open: 22490, high: 22518, low: 22482, close: 22510 },
  { time: "09:44", open: 22510, high: 22535, low: 22500, close: 22525 },
  { time: "09:45", open: 22525, high: 22542, low: 22495, close: 22505 },
  { time: "09:46", open: 22505, high: 22512, low: 22470, close: 22478 },
  { time: "09:47", open: 22478, high: 22492, low: 22442, close: 22450 },
  { time: "09:48", open: 22450, high: 22480, low: 22435, close: 22472 },
  { time: "09:49", open: 22472, high: 22505, low: 22466, close: 22498 },
  { time: "09:50", open: 22498, high: 22528, low: 22490, close: 22520 },
  { time: "09:51", open: 22520, high: 22545, low: 22510, close: 22538 },
  { time: "09:52", open: 22538, high: 22550, low: 22500, close: 22508 },
  { time: "09:53", open: 22508, high: 22518, low: 22472, close: 22480 },
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

export function BacktestingSessionClient({ sessionId }: { sessionId: string }) {
  const [loaded, setLoaded] = useState(false);
  const [sessions, setSessions] = useState<BacktestSession[]>([]);
  const [trades, setTrades] = useState<BacktestTrade[]>([]);
  const [visibleCandles, setVisibleCandles] = useState(12);
  const [isPlaying, setIsPlaying] = useState(false);

  const [tradeDraft, setTradeDraft] = useState({
    direction: "Long" as "Long" | "Short",
    entry: 22450,
    stopLoss: 22425,
    takeProfit: 22500,
    risk: 250,
    notes: "",
  });

  useEffect(() => {
    const savedSessions = localStorage.getItem(storageKeys.sessions);
    const savedTrades = localStorage.getItem(storageKeys.trades);

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    if (savedTrades) {
      setTrades(JSON.parse(savedTrades));
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKeys.trades, JSON.stringify(trades));
  }, [trades, loaded]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = window.setInterval(() => {
      setVisibleCandles((current) => {
        if (current >= demoCandles.length) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 700);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const cleanSessionId = String(sessionId).trim();

  const session = sessions.find(
    (item) => String(item.id).trim() === cleanSessionId
  );

  const sessionTrades = useMemo(() => {
    return trades.filter(
      (trade) => String(trade.sessionId).trim() === cleanSessionId
    );
  }, [trades, cleanSessionId]);

  const stats = useMemo(() => {
    const wins = sessionTrades.filter((trade) => trade.status === "Win").length;
    const losses = sessionTrades.filter(
      (trade) => trade.status === "Loss"
    ).length;

    const totalResult = sessionTrades.reduce(
      (total, trade) => total + trade.result,
      0
    );

    const totalR = sessionTrades.reduce((total, trade) => total + trade.rr, 0);

    const initialBalance = session?.initialBalance ?? 0;
    const currentBalance = initialBalance + totalResult;

    const winrate =
      sessionTrades.length > 0 ? (wins / sessionTrades.length) * 100 : 0;

    return {
      wins,
      losses,
      totalResult,
      totalR,
      initialBalance,
      currentBalance,
      winrate,
      totalTrades: sessionTrades.length,
    };
  }, [sessionTrades, session]);

  const visibleData = demoCandles.slice(0, visibleCandles);

  function resetReplay() {
    setVisibleCandles(12);
    setIsPlaying(false);
  }

  function nextCandle() {
    setVisibleCandles((current) => Math.min(current + 1, demoCandles.length));
  }

  function calculateResult() {
    const direction = tradeDraft.direction;
    const entry = tradeDraft.entry;
    const stopLoss = tradeDraft.stopLoss;
    const takeProfit = tradeDraft.takeProfit;
    const risk = tradeDraft.risk;

    const futureCandles = demoCandles.slice(visibleCandles);

    const riskPoints =
      direction === "Long" ? entry - stopLoss : stopLoss - entry;

    const rewardPoints =
      direction === "Long" ? takeProfit - entry : entry - takeProfit;

    if (riskPoints <= 0 || rewardPoints <= 0 || risk <= 0) {
      return {
        status: "Pendiente" as const,
        result: 0,
        rr: 0,
      };
    }

    const rr = rewardPoints / riskPoints;

    for (const candle of futureCandles) {
      if (direction === "Long") {
        const touchedStop = candle.low <= stopLoss;
        const touchedTakeProfit = candle.high >= takeProfit;

        if (touchedStop) {
          return {
            status: "Loss" as const,
            result: -risk,
            rr: -1,
          };
        }

        if (touchedTakeProfit) {
          return {
            status: "Win" as const,
            result: risk * rr,
            rr,
          };
        }
      }

      if (direction === "Short") {
        const touchedStop = candle.high >= stopLoss;
        const touchedTakeProfit = candle.low <= takeProfit;

        if (touchedStop) {
          return {
            status: "Loss" as const,
            result: -risk,
            rr: -1,
          };
        }

        if (touchedTakeProfit) {
          return {
            status: "Win" as const,
            result: risk * rr,
            rr,
          };
        }
      }
    }

    return {
      status: "Pendiente" as const,
      result: 0,
      rr: 0,
    };
  }

  function executeTrade() {
    if (!session) return;

    const calculated = calculateResult();

    const trade: BacktestTrade = {
      id: createId(),
      sessionId: cleanSessionId,
      direction: tradeDraft.direction,
      entry: tradeDraft.entry,
      stopLoss: tradeDraft.stopLoss,
      takeProfit: tradeDraft.takeProfit,
      risk: tradeDraft.risk,
      result: calculated.result,
      rr: calculated.rr,
      status: calculated.status,
      notes: tradeDraft.notes,
      createdAt: new Date().toISOString(),
    };

    setTrades((current) => [trade, ...current]);
  }

  function deleteTrade(tradeId: string) {
    setTrades((current) => current.filter((trade) => trade.id !== tradeId));
  }

  if (!loaded) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <p className="text-sm text-white/50">Cargando backtesting...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="space-y-5">
        <Link
          href="/backtesting"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white"
        >
          <ArrowLeft size={16} />
          Volver a Backtesting
        </Link>

        <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6">
          <h1 className="text-2xl font-bold">Sesión no encontrada</h1>

          <p className="mt-2 text-sm text-white/50">
            Vuelve a crear o seleccionar una sesión de backtesting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/backtesting"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="min-w-0">
            <p className="text-xs font-semibold text-emerald-400">
              Strategy Lab
            </p>

            <h1 className="truncate text-2xl font-bold tracking-tight">
              {session.name}
            </h1>

            <p className="mt-1 text-xs text-white/40">
              {session.instrument} • {session.testedDate} •{" "}
              {session.timeframe} • {session.setup}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsPlaying((current) => !current)}
            className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black"
          >
            {isPlaying ? (
              <>
                <Pause size={15} className="mr-2 inline" />
                Pausar
              </>
            ) : (
              <>
                <Play size={15} className="mr-2 inline" />
                Play
              </>
            )}
          </button>

          <button
            onClick={nextCandle}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10"
          >
            <FastForward size={15} className="mr-2 inline" />
            Siguiente
          </button>

          <button
            onClick={resetReplay}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 hover:bg-white/10"
          >
            <RefreshCcw size={15} className="mr-2 inline" />
            Reiniciar
          </button>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_335px]">
        <div className="min-h-[760px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#050505]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <p className="text-sm font-bold">{session.instrument}</p>

              <p className="text-xs text-white/35">
                Replay demo • {visibleCandles}/{demoCandles.length} velas
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-white/40">
              <span>Entrada {tradeDraft.entry}</span>

              <span className="text-red-300">SL {tradeDraft.stopLoss}</span>

              <span className="text-emerald-300">
                TP {tradeDraft.takeProfit}
              </span>
            </div>
          </div>

          <BacktestingChart
            candles={visibleData}
            tradeDraft={tradeDraft}
            setTradeDraft={setTradeDraft}
          />
        </div>

        <aside className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MiniStat
              title="Balance"
              value={formatMoney(stats.currentBalance)}
              icon={Wallet}
              positive={stats.totalResult >= 0}
            />

            <MiniStat
              title="P&L"
              value={formatMoney(stats.totalResult)}
              icon={BarChart3}
              positive={stats.totalResult >= 0}
            />

            <MiniStat
              title="Winrate"
              value={`${stats.winrate.toFixed(0)}%`}
              icon={Target}
              positive
            />

            <MiniStat
              title="R total"
              value={`${stats.totalR.toFixed(2)}R`}
              icon={CircleDot}
              positive={stats.totalR >= 0}
            />
          </div>

          <button
            type="button"
            onClick={executeTrade}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-white/90"
          >
            Guardar operación en journal
          </button>

          <div className="max-h-[620px] overflow-y-auto rounded-[2rem] border border-white/10 bg-white/[0.035] p-5">
            <h2 className="mb-4 text-lg font-bold">Journal de sesión</h2>

            <div className="space-y-3">
              {sessionTrades.length === 0 ? (
                <p className="text-sm text-white/40">
                  Todavía no hay trades en esta sesión.
                </p>
              ) : (
                sessionTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
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
          </div>
        </aside>
      </section>
    </div>
  );
}

function MiniStat({
  title,
  value,
  icon: Icon,
  positive,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  positive: boolean;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-white/40">{title}</p>

        <Icon
          size={17}
          className={positive ? "text-emerald-400" : "text-red-400"}
        />
      </div>

      <p
        className={`text-xl font-bold ${
          positive ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {value}
      </p>
    </div>
  );
}