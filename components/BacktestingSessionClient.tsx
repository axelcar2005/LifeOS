"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CircleDot,
  ExternalLink,
  Target,
  Wallet,
  X,
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

const storageKeys = {
  sessions: "lifeos-backtesting-sessions",
  trades: "lifeos-backtesting-trades",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BacktestingSessionClient({ sessionId }: { sessionId: string }) {
  const [loaded, setLoaded] = useState(false);
  const [sessions, setSessions] = useState<BacktestSession[]>([]);
  const [trades, setTrades] = useState<BacktestTrade[]>([]);
  const [showJournal, setShowJournal] = useState(false);

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
      (total, trade) => total + Number(trade.result || 0),
      0
    );

    const totalR = sessionTrades.reduce(
      (total, trade) => total + Number(trade.rr || 0),
      0
    );

    const initialBalance = Number(session?.initialBalance ?? 0);
    const currentBalance = initialBalance + totalResult;

    const winrate =
      sessionTrades.length > 0 ? (wins / sessionTrades.length) * 100 : 0;

    return {
      wins,
      losses,
      totalResult,
      totalR,
      currentBalance,
      winrate,
      totalTrades: sessionTrades.length,
    };
  }, [sessionTrades, session]);

  function deleteTrade(tradeId: string) {
    const nextTrades = trades.filter((trade) => trade.id !== tradeId);

    setTrades(nextTrades);
    localStorage.setItem(storageKeys.trades, JSON.stringify(nextTrades));
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
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/backtesting"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/60 hover:text-white"
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

            <p className="mt-1 text-sm text-white/40">
              {session.instrument} • {session.testedDate} •{" "}
              {session.timeframe} • {session.setup}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowJournal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
        >
          <BookOpen size={16} />
          Ver journal
        </button>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MiniStat
          title="Balance simulado"
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
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-[#050505] p-6">
        <div className="mx-auto flex min-h-[520px] max-w-5xl flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/15 bg-white/[0.025] p-8 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-black">
            <ExternalLink size={26} />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
            TradingView Charting Library
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight">
            Chart profesional pendiente
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/45">
            Dejamos pausado el intento custom. Para que Backtesting se sienta
            como TradingView de verdad, usaremos TradingView Charting Library
            cuando tengamos el permiso. Aquí irá el gráfico real con
            herramientas, dibujos, indicadores y posiciones Long/Short.
          </p>

          <div className="mt-8 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-2">
            <InfoBox label="Instrumento" value={session.instrument} />
            <InfoBox label="Timeframe" value={session.timeframe} />
            <InfoBox label="Fecha testeada" value={session.testedDate} />
            <InfoBox label="Riesgo base" value={formatMoney(session.riskPerTrade)} />
          </div>
        </div>
      </section>

      {showJournal && (
        <div className="fixed inset-0 z-[9999] flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="h-full w-full max-w-[430px] overflow-y-auto border-l border-white/10 bg-[#050505] p-5 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-emerald-400">
                  Backtesting Journal
                </p>

                <h2 className="mt-1 text-2xl font-bold">Trades de la sesión</h2>

                <p className="mt-2 text-xs text-white/40">
                  {stats.totalTrades} trades • {formatMoney(stats.totalResult)}{" "}
                  • {stats.winrate.toFixed(0)}% winrate
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowJournal(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {sessionTrades.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-white/45">
                  Todavía no hay trades guardados en esta sesión.
                </p>
              ) : (
                sessionTrades.map((trade) => (
                  <div
                    key={trade.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
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
                      type="button"
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
        </div>
      )}
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

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="text-xs text-white/35">{label}</p>
      <p className="mt-1 font-bold text-white">{value}</p>
    </div>
  );
}