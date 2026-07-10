"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import type { Trade } from "@/components/TradeEntryModal";

type TradingCalendarProps = {
  trades: Trade[];
  onSelectTrade?: (trade: Trade) => void;
};

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export function TradingCalendar({ trades, onSelectTrade }: TradingCalendarProps) {
  const today = new Date();

  const [calendarDate, setCalendarDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const monthName = calendarDate.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  function goToPreviousMonth() {
    setCalendarDate(new Date(year, month - 1, 1));
  }

  function goToNextMonth() {
    setCalendarDate(new Date(year, month + 1, 1));
  }

  function goToCurrentMonth() {
    setCalendarDate(new Date(today.getFullYear(), today.getMonth(), 1));
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const mondayFirstIndex = (firstDay + 6) % 7;

  const emptyDays = Array.from({ length: mondayFirstIndex });
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm text-white/40">Calendario de rendimiento</p>
          <h3 className="mt-1 text-2xl font-bold capitalize">{monthName}</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={goToCurrentMonth}
            className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            Hoy
          </button>

          <button
            onClick={goToNextMonth}
            className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>

          <span className="rounded-full bg-emerald-400/10 px-3 py-2 text-xs text-emerald-400">
            Día positivo
          </span>
          <span className="rounded-full bg-red-400/10 px-3 py-2 text-xs text-red-400">
            Día negativo
          </span>
          <span className="rounded-full bg-white/10 px-3 py-2 text-xs text-white/50">
            Sin operar
          </span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div key={day} className="pb-2 text-center text-xs text-white/40">
            {day}
          </div>
        ))}

        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} />
        ))}

        {days.map((day) => {
          const date = formatDate(year, month, day);

          const dayTrades = trades.filter(
            (trade) => trade.date === date && trade.status === "Registrado"
          );
          const uniqueDirections = [
  ...new Set(dayTrades.map((trade) => trade.direction)),
];

const directionLabel =
  dayTrades.length === 0
    ? "Sin trades"
    : uniqueDirections.length === 1
    ? uniqueDirections[0]
    : "Mixto";

const tradeCountLabel =
  dayTrades.length === 1 ? "1 trade" : `${dayTrades.length} trades`;

const calendarDayLabel =
  dayTrades.length > 0
    ? `${directionLabel} · ${tradeCountLabel}`
    : "—";

const latestTrade = dayTrades[0];

const dailyPnL = dayTrades.reduce(
            (total, trade) => total + Number(trade.result || 0),
            0
          );

          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

          const pnlClass =
            dailyPnL > 0
              ? "text-emerald-400"
              : dailyPnL < 0
              ? "text-red-400"
              : "text-white/30";

          const bgClass =
            dailyPnL > 0
              ? "bg-emerald-400/10 border-emerald-400/20"
              : dailyPnL < 0
              ? "bg-red-400/10 border-red-400/20"
              : "bg-black/35 border-white/10";

          return (
            <div
  key={date}
  onClick={() => {
    if (latestTrade) {
      onSelectTrade?.(latestTrade);
    }
  }}
  className={`min-h-24 rounded-2xl border p-3 transition hover:bg-white/[0.06] ${bgClass} ${
    isToday ? "ring-1 ring-white/30" : ""
  } ${latestTrade ? "cursor-pointer" : ""}`}
>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white/70">
                  {day}
                </span>

            
              </div>

              <div className="mt-5">
  <p className={`text-sm font-bold ${pnlClass}`}>
    {dailyPnL !== 0 ? `$${dailyPnL}` : "—"}
  </p>

  {dayTrades.length > 0 && (
  <p className="mt-1 text-xs font-medium text-white/40">
    {calendarDayLabel}
  </p>
)}
</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}