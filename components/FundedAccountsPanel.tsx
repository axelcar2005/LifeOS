"use client";

import { FormEvent, useState } from "react";
import { Plus, Trash2, WalletCards, X } from "lucide-react";
import type { Trade } from "@/components/TradeEntryModal";

export type FundedAccount = {
  id: string;
  name: string;
  firm: string;
  type: string;
  initialBalance: string;
  startingBalance: string;
  drawdown: string;
  targetBalance: string;
  drawdownMode: "EOD";
};

type FundedAccountsPanelProps = {
  accounts: FundedAccount[];
  trades: Trade[];
  onAddAccount: (account: FundedAccount) => void;
  onDeleteAccount: (accountId: string) => void;
};

const initialForm = {
  name: "",
  firm: "Apex",
  type: "Prueba",
  initialBalance: "50000",
  startingBalance: "50000",
  drawdown: "2000",
  targetBalance: "53000",
};

function parseMoney(value: string | number) {
  const cleanValue = String(value ?? "").replace(/,/g, "").trim();
  const numberValue = Number(cleanValue);

  if (!Number.isFinite(numberValue)) return 0;

  // Si alguien escribe 4854191, lo interpretamos como 48,541.91
  if (numberValue > 1000000) {
    return numberValue / 100;
  }

  return numberValue;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function calculateAccountStats(account: FundedAccount, trades: Trade[]) {
 const initialBalance = parseMoney(account.initialBalance);
const startingBalance = parseMoney(
  account.startingBalance || account.initialBalance
);
const drawdown = parseMoney(account.drawdown);
const targetBalance = parseMoney(account.targetBalance);
  const accountTrades = trades.filter(
    (trade) => trade.account === account.name && trade.status === "Registrado"
  );

  const totalPnL = accountTrades.reduce(
    (total, trade) => total + Number(trade.result || 0),
    0
  );

  const currentBalance = startingBalance + totalPnL;

  const dailyResults = accountTrades.reduce<Record<string, number>>(
    (totals, trade) => {
      totals[trade.date] = (totals[trade.date] || 0) + Number(trade.result || 0);
      return totals;
    },
    {}
  );

  const sortedDays = Object.keys(dailyResults).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  let runningBalance = startingBalance;
let highestEodBalance = Math.max(initialBalance, startingBalance);
  sortedDays.forEach((day) => {
    runningBalance += dailyResults[day];

    if (runningBalance > highestEodBalance) {
      highestEodBalance = runningBalance;
    }
  });

  const drawdownLine = highestEodBalance - drawdown;
  const cushion = currentBalance - drawdownLine;
  const distanceToTarget = targetBalance - currentBalance;

  const accountProfit = currentBalance - initialBalance;

const targetProfit = targetBalance - initialBalance;
const progress =
  targetProfit > 0
    ? Math.min(Math.max((accountProfit / targetProfit) * 100, 0), 100)
    : 0;


return {
  totalPnL,
  accountProfit,
  currentBalance,
    highestEodBalance,
    drawdownLine,
    cushion,
    distanceToTarget,
    progress,
    tradesCount: accountTrades.length,
  };
}

function getStatus(cushion: number) {
  if (cushion <= 0) {
    return {
      label: "Perdida",
      className: "border-red-400/30 bg-red-400/10 text-red-300",
      bar: "bg-red-400",
    };
  }

  if (cushion < 500) {
    return {
      label: "Riesgo alto",
      className: "border-red-400/30 bg-red-400/10 text-red-300",
      bar: "bg-red-400",
    };
  }

  if (cushion < 1000) {
    return {
      label: "Cuidado",
      className: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
      bar: "bg-yellow-400",
    };
  }

  return {
    label: "Segura",
    className: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    bar: "bg-emerald-400",
  };
}

export function FundedAccountsPanel({
  accounts,
  trades,
  onAddAccount,
  onDeleteAccount,
}: FundedAccountsPanelProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(initialForm);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) return;

    onAddAccount({
      id: `${Date.now()}-${Math.random()}`,
      name: form.name.trim(),
      firm: form.firm.trim(),
      type: form.type,
      initialBalance: form.initialBalance,
startingBalance: form.startingBalance,
drawdown: form.drawdown,
targetBalance: form.targetBalance,
      drawdownMode: "EOD",
    });

    setForm(initialForm);
    setIsCreating(false);
  }

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-white/40">Control automático</p>
          <h3 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <WalletCards className="h-6 w-6 text-emerald-400" />
            Cuentas fondeadas
          </h3>
          <p className="mt-2 max-w-2xl text-sm text-white/40">
            Crea tus cuentas una vez. Luego los trades del journal actualizan
            balance, colchón y drawdown EOD automáticamente.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
        >
          <Plus className="h-4 w-4" />
          Nueva cuenta
        </button>
      </div>

      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-3xl border border-white/10 bg-black/40 p-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Crear cuenta fondeada
              </p>
              <p className="text-xs text-white/40">
                Usa el mismo nombre que vas a escoger en tus trades.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-full border border-white/10 p-2 text-white/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <span className="text-xs text-white/40">Nombre de cuenta</span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ej: Apex PA 50K"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs text-white/40">Empresa</span>
              <input
                value={form.firm}
                onChange={(event) => updateField("firm", event.target.value)}
                placeholder="Apex, Topstep, Lucid..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs text-white/40">Tipo</span>
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              >
                <option>Prueba</option>
                <option>PA</option>
                <option>Live</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs text-white/40">Balance inicial</span>
              <input
                type="number"
                value={form.initialBalance}
                onChange={(event) =>
                  updateField("initialBalance", event.target.value)
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>
            <label className="space-y-2">
  <span className="text-xs text-white/40">Balance actual</span>
  <input
    type="number"
    value={form.startingBalance}
    onChange={(event) =>
      updateField("startingBalance", event.target.value)
    }
    required
    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
  />
</label>

            <label className="space-y-2">
              <span className="text-xs text-white/40">Drawdown permitido</span>
              <input
                type="number"
                value={form.drawdown}
                onChange={(event) =>
                  updateField("drawdown", event.target.value)
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs text-white/40">Objetivo</span>
              <input
                type="number"
                value={form.targetBalance}
                onChange={(event) =>
                  updateField("targetBalance", event.target.value)
                }
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-white/90"
          >
            Guardar cuenta
          </button>
        </form>
      )}

      {accounts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-6 text-center">
          <p className="text-sm font-semibold text-white">
            Todavía no tienes cuentas creadas.
          </p>
          <p className="mt-2 text-sm text-white/40">
            Crea una cuenta 50K, 25K o PA para que tus trades calculen el
            colchón automáticamente.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {accounts.map((account) => {
            const stats = calculateAccountStats(account, trades);
            const status = getStatus(stats.cushion);

            return (
              <article
                key={account.id}
                className="rounded-3xl border border-white/10 bg-black/40 p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-bold text-white">
                        {account.name}
                      </h4>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-white/40">
                      {account.firm} · {account.type} · Drawdown EOD
                    </p>
                  </div>

                  <button
                    onClick={() => onDeleteAccount(account.id)}
                    className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-red-400/40 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Balance actual</p>
                    <p className="mt-2 text-xl font-bold text-white">
                      {formatMoney(stats.currentBalance)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Profit</p>
                    <p
                      className={`mt-2 text-xl font-bold ${
                        stats.totalPnL >= 0
                          ? "text-emerald-400"
                          : "text-red-400"
                      }`}
                    >
                      {formatMoney(stats.totalPnL)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Drawdown line</p>
                    <p className="mt-2 text-xl font-bold text-red-300">
                      {formatMoney(stats.drawdownLine)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Colchón disponible</p>
                    <p
                      className={`mt-2 text-xl font-bold ${
                        stats.cushion >= 1000
                          ? "text-emerald-400"
                          : stats.cushion >= 500
                          ? "text-yellow-300"
                          : "text-red-400"
                      }`}
                    >
                      {formatMoney(stats.cushion)}
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                    <span>Progreso al objetivo</span>
                    <span>{stats.progress.toFixed(0)}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${status.bar}`}
                      style={{ width: `${stats.progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-white/40">
                    <span>Objetivo: {formatMoney(Number(account.targetBalance))}</span>
                    <span>
                      Falta:{" "}
                      {stats.distanceToTarget > 0
                        ? formatMoney(stats.distanceToTarget)
                        : "$0"}
                    </span>
                    <span>{stats.tradesCount} trades</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}