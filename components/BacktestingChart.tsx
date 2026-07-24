"use client";

import type React from "react";

type Candle = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
};

type TradeDraft = {
  direction: "Long" | "Short";
  entry: number;
  stopLoss: number;
  takeProfit: number;
  risk: number;
  notes: string;
};

type BacktestingChartProps = {
  candles: Candle[];
  tradeDraft: TradeDraft;
  setTradeDraft: React.Dispatch<React.SetStateAction<TradeDraft>>;
};

export function BacktestingChart({
  candles,
  tradeDraft,
  setTradeDraft,
}: BacktestingChartProps) {
  const lastCandle = candles[candles.length - 1];

  function moveEntryToLastPrice() {
    if (!lastCandle) return;

    const price = Number(lastCandle.close.toFixed(2));
    const distance = Math.abs(tradeDraft.entry - tradeDraft.stopLoss) || 25;

    setTradeDraft((current) => ({
      ...current,
      entry: price,
      stopLoss:
        current.direction === "Long"
          ? Number((price - distance).toFixed(2))
          : Number((price + distance).toFixed(2)),
      takeProfit:
        current.direction === "Long"
          ? Number((price + distance * 2).toFixed(2))
          : Number((price - distance * 2).toFixed(2)),
    }));
  }

  return (
    <div className="flex h-[620px] w-full items-center justify-center rounded-[2rem] border border-white/10 bg-[#050505] p-8 text-center">
      <div className="max-w-md">
        <p className="text-sm font-semibold text-emerald-300">
          Chart conectado
        </p>

        <h3 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Backtesting chart listo
        </h3>

        <p className="mt-4 text-sm leading-relaxed text-white/45">
          Velas cargadas: {candles.length}. Entrada: {tradeDraft.entry} · SL:{" "}
          {tradeDraft.stopLoss} · TP: {tradeDraft.takeProfit}
        </p>

        <button
          type="button"
          onClick={moveEntryToLastPrice}
          className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
        >
          Probar mover entrada
        </button>
      </div>
    </div>
  );
}