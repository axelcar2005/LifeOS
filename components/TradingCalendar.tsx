"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { Trade } from "@/components/TradeEntryModal";

type TradingCalendarProps = {
  trades: Trade[];
  onSelectTrade: (trade: Trade) => void;
};

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function createDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekDay = firstDay.getDay();
  const emptyDaysBefore = firstWeekDay === 0 ? 6 : firstWeekDay - 1;

  const totalDays = lastDay.getDate();

  const days: Array<{
    date: string;
    day: number;
    isCurrentMonth: boolean;
  }> = [];

  const previousMonthLastDay = new Date(year, month, 0).getDate();

  for (let index = emptyDaysBefore - 1; index >= 0; index--) {
    const day = previousMonthLastDay - index;
    const date = new Date(year, month - 1, day);

    days.push({
      date: createDateKey(date),
      day,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);

    days.push({
      date: createDateKey(date),
      day,
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - days.length;

  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);

    days.push({
      date: createDateKey(date),
      day,
      isCurrentMonth: false,
    });
  }

  return days;
}

function getDirectionLabel(tradeList: Trade[]) {
  const uniqueDirections = Array.from(
    new Set(tradeList.map((trade) => trade.direction).filter(Boolean))
  );

  if (tradeList.length === 0) return "Sin trades";
  if (uniqueDirections.length === 1) return uniqueDirections[0];

  return "Mixto";
}

export function TradingCalendar({ trades, onSelectTrade }: TradingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const todayKey = createDateKey(new Date());

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const monthKey = createDateKey(currentMonth).slice(0, 7);

  const registeredTrades = trades.filter(
    (trade) => trade.status === "Registrado"
  );

  function getDayTrades(date: string) {
    return registeredTrades.filter((trade) => trade.date === date);
  }

  function getDayData(date: string) {
    const dayTrades = getDayTrades(date);

    const dailyPnL = dayTrades.reduce(
      (total, trade) => total + Number(trade.result || 0),
      0
    );

    const directionLabel = getDirectionLabel(dayTrades);

    const tradeCountLabel =
      dayTrades.length === 1 ? "1 trade" : `${dayTrades.length} trades`;

    const calendarDayLabel =
      dayTrades.length > 0
        ? `${directionLabel} · ${tradeCountLabel}`
        : "—";

    const latestTrade = dayTrades[0];

    return {
      dayTrades,
      dailyPnL,
      directionLabel,
      tradeCountLabel,
      calendarDayLabel,
      latestTrade,
    };
  }

  const mobileTradingDays = calendarDays.filter((day) => {
    const dayTrades = getDayTrades(day.date);

    return day.isCurrentMonth && dayTrades.length > 0;
  });

  function goToPreviousMonth() {
    setCurrentMonth(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  }

  function goToToday() {
    setCurrentMonth(new Date());
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-white/40">Calendario de rendimiento</p>
          <h3 className="mt-1 text-2xl font-bold capitalize">
            {formatMonthTitle(currentMonth)}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={goToToday}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Hoy
          </button>

          <button
            onClick={goToNextMonth}
            className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
          >
            <ChevronRight size={18} />
          </button>

          <span className="hidden rounded-full bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300 md:inline-flex">
            Día positivo
          </span>

          <span className="hidden rounded-full bg-red-400/10 px-4 py-2 text-xs font-bold text-red-300 md:inline-flex">
            Día negativo
          </span>

          <span className="hidden rounded-full bg-white/10 px-4 py-2 text-xs font-bold text-white/40 md:inline-flex">
            Sin operar
          </span>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-white/35">
          {weekDays.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const {
              dayTrades,
              dailyPnL,
              calendarDayLabel,
              latestTrade,
            } = getDayData(day.date);

            const isToday = todayKey === day.date;
            const isPositive = dailyPnL > 0;
            const isNegative = dailyPnL < 0;

            return (
              <button
                key={day.date}
                onClick={() => {
                  if (latestTrade) {
                    onSelectTrade(latestTrade);
                  }
                }}
                className={`min-h-24 rounded-2xl border p-3 text-left transition hover:bg-white/[0.06] ${
                  isPositive
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : isNegative
                    ? "border-red-400/30 bg-red-400/10"
                    : "border-white/10 bg-black/30"
                } ${day.isCurrentMonth ? "opacity-100" : "opacity-30"} ${
                  latestTrade ? "cursor-pointer" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      isToday ? "bg-white text-black" : "text-white/70"
                    }`}
                  >
                    {day.day}
                  </span>

                  {dayTrades.length > 0 && (
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/45">
                      {dayTrades.length}
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  {dayTrades.length > 0 ? (
                    <>
                      <p
                        className={`text-sm font-bold ${
                          dailyPnL >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        ${dailyPnL}
                      </p>

                      <p className="mt-1 text-xs font-medium text-white/40">
                        {calendarDayLabel}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-white/25">—</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        <p className="text-sm text-white/40">Días operados del mes</p>

        {mobileTradingDays.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/40">
            No tienes operaciones registradas en {monthKey}.
          </div>
        ) : (
          mobileTradingDays.map((day) => {
            const {
              dayTrades,
              dailyPnL,
              calendarDayLabel,
              latestTrade,
            } = getDayData(day.date);

            const isPositive = dailyPnL > 0;
            const isNegative = dailyPnL < 0;

            return (
              <button
                key={day.date}
                onClick={() => {
                  if (latestTrade) {
                    onSelectTrade(latestTrade);
                  }
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  isPositive
                    ? "border-emerald-400/30 bg-emerald-400/10"
                    : isNegative
                    ? "border-red-400/30 bg-red-400/10"
                    : "border-white/10 bg-black/30"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{day.date}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {calendarDayLabel}
                    </p>
                  </div>

                  <p
                    className={`text-xl font-bold ${
                      dailyPnL >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    ${dailyPnL}
                  </p>
                </div>

                <p className="mt-3 text-xs text-white/30">
                  Toca para ver el último trade de este día.
                </p>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}