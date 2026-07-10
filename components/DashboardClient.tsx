"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Dumbbell,
  GraduationCap,
  LineChart,
  Plus,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

const storageKeys = {
  trades: "lifeos-trading-trades",
  financeMovements: "lifeos-finance-movements",
  healthLogs: "lifeos-health-daily-logs",
  studySessions: "lifeos-study-sessions",
  studyTasks: "lifeos-study-tasks",
  calendarEvents: "lifeos-calendar-events",
};

type Trade = {
  id?: string;
  date?: string;
  account?: string;
  asset?: string;
  direction?: string;
  result?: string | number;
  status?: string;
  setup?: string;
  emotion?: string;
};

type FinanceMovement = {
  id?: string;
  title?: string;
  concept?: string;
  description?: string;
  type?: string;
  category?: string;
  amount?: string | number;
  date?: string;
  note?: string;
};

type HealthLog = {
  id?: string;
  date?: string;
  calories?: string | number;
  weight?: string | number;
  water?: string | number;
  waterLiters?: string | number;
  sleep?: string | number;
  energy?: string | number;
  trained?: boolean | string;
  workoutDone?: boolean | string;
  exercise?: boolean | string;
  sport?: string;
  mood?: string;
};

type StudyTask = {
  id?: string;
  title?: string;
  subject?: string;
  dueDate?: string;
  deadline?: string;
  date?: string;
  priority?: string;
  status?: string;
  note?: string;
};

type StudySession = {
  id?: string;
  date?: string;
  subject?: string;
  minutes?: string | number;
  time?: string | number;
  duration?: string | number;
  type?: string;
  focus?: string;
  note?: string;
};

type CalendarEvent = {
  id?: string;
  title?: string;
  date?: string;
  time?: string;
  category?: string;
  note?: string;
  sourceLabel?: string;
};

type QuickAction = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

function safeParseArray<T>(value: string | null): T[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createMonthKey(date: Date) {
  return createDateKey(date).slice(0, 7);
}

function formatDateTitle(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function getNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function isRegisteredTrade(trade: Trade) {
  if (!trade.status) return true;
  return trade.status === "Registrado";
}

function isCompletedTask(status?: string) {
  if (!status) return false;

  const cleanStatus = status.toLowerCase();

  return (
    cleanStatus.includes("complet") ||
    cleanStatus.includes("done") ||
    cleanStatus.includes("termin")
  );
}

function getTaskDate(task: StudyTask) {
  return task.dueDate || task.deadline || task.date || "";
}

function isTrainingValue(value: unknown) {
  if (value === true) return true;

  const cleanValue = String(value || "").toLowerCase();

  return (
    cleanValue === "true" ||
    cleanValue === "sí" ||
    cleanValue === "si" ||
    cleanValue === "yes" ||
    cleanValue === "entrené" ||
    cleanValue === "entrene"
  );
}

function getMovementTitle(movement: FinanceMovement) {
  return (
    movement.title ||
    movement.concept ||
    movement.description ||
    movement.type ||
    "Movimiento financiero"
  );
}

function isIncome(movement: FinanceMovement) {
  const type = String(movement.type || movement.category || "").toLowerCase();
  return type.includes("ingreso") || type.includes("income");
}

function isExpense(movement: FinanceMovement) {
  const type = String(movement.type || movement.category || "").toLowerCase();
  return type.includes("gasto") || type.includes("expense");
}

function isSavingOrInvestment(movement: FinanceMovement) {
  const type = String(movement.type || movement.category || "").toLowerCase();

  return (
    type.includes("ahorro") ||
    type.includes("invers") ||
    type.includes("saving") ||
    type.includes("investment")
  );
}

function getSessionMinutes(session: StudySession) {
  return getNumber(session.minutes ?? session.time ?? session.duration);
}

export function DashboardClient() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [financeMovements, setFinanceMovements] = useState<FinanceMovement[]>(
    []
  );
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const today = createDateKey(new Date());
  const currentMonth = createMonthKey(new Date());

  useEffect(() => {
    setTrades(safeParseArray<Trade>(localStorage.getItem(storageKeys.trades)));

    setFinanceMovements(
      safeParseArray<FinanceMovement>(
        localStorage.getItem(storageKeys.financeMovements)
      )
    );

    setHealthLogs(
      safeParseArray<HealthLog>(localStorage.getItem(storageKeys.healthLogs))
    );

    setStudySessions(
      safeParseArray<StudySession>(
        localStorage.getItem(storageKeys.studySessions)
      )
    );

    setStudyTasks(
      safeParseArray<StudyTask>(localStorage.getItem(storageKeys.studyTasks))
    );

    setCalendarEvents(
      safeParseArray<CalendarEvent>(
        localStorage.getItem(storageKeys.calendarEvents)
      )
    );
  }, []);

  const registeredTrades = trades.filter(isRegisteredTrade);

  const monthlyTrades = registeredTrades.filter((trade) =>
    String(trade.date || "").startsWith(currentMonth)
  );

  const todayTrades = registeredTrades.filter((trade) => trade.date === today);

  const monthlyPnL = monthlyTrades.reduce(
    (total, trade) => total + getNumber(trade.result),
    0
  );

  const winningTrades = monthlyTrades.filter(
    (trade) => getNumber(trade.result) > 0
  );

  const winRate =
    monthlyTrades.length > 0
      ? Math.round((winningTrades.length / monthlyTrades.length) * 100)
      : 0;

  const todayPnL = todayTrades.reduce(
    (total, trade) => total + getNumber(trade.result),
    0
  );

  const monthlyMovements = financeMovements.filter((movement) =>
    String(movement.date || "").startsWith(currentMonth)
  );

  const monthlyIncome = monthlyMovements
    .filter(isIncome)
    .reduce((total, movement) => total + Math.abs(getNumber(movement.amount)), 0);

  const monthlyExpenses = monthlyMovements
    .filter(isExpense)
    .reduce((total, movement) => total + Math.abs(getNumber(movement.amount)), 0);

  const monthlySavings = monthlyMovements
    .filter(isSavingOrInvestment)
    .reduce((total, movement) => total + Math.abs(getNumber(movement.amount)), 0);

  const availableMoney = monthlyIncome - monthlyExpenses - monthlySavings;

  const todayHealthLog = healthLogs.find((log) => log.date === today);

  const latestHealthLog = [...healthLogs]
    .filter((log) => log.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];

  const trainedToday =
    isTrainingValue(todayHealthLog?.trained) ||
    isTrainingValue(todayHealthLog?.workoutDone) ||
    isTrainingValue(todayHealthLog?.exercise);

  const monthlyStudySessions = studySessions.filter((session) =>
    String(session.date || "").startsWith(currentMonth)
  );

  const studyMinutesMonth = monthlyStudySessions.reduce(
    (total, session) => total + getSessionMinutes(session),
    0
  );

  const pendingTasks = studyTasks.filter(
    (task) => !isCompletedTask(task.status)
  );

  const overdueTasks = pendingTasks.filter((task) => {
    const taskDate = getTaskDate(task);
    return taskDate && taskDate < today;
  });

  const dueTodayTasks = pendingTasks.filter((task) => getTaskDate(task) === today);

  const automaticTaskEvents: CalendarEvent[] = pendingTasks
    .map((task) => {
      const date = getTaskDate(task);

      if (!date) return null;

      return {
        id: `task-${task.id || task.title || date}`,
        title: `Tarea: ${task.title || "Sin título"}`,
        date,
        category: "Estudios",
        note: task.subject || "",
        sourceLabel: "Estudios",
      };
    })
    .filter(Boolean) as CalendarEvent[];

  const financeDateEvents: CalendarEvent[] = financeMovements
    .filter((movement) => movement.date)
    .map((movement) => ({
      id: `finance-${movement.id || getMovementTitle(movement)}`,
      title: getMovementTitle(movement),
      date: movement.date,
      category: "Finanzas",
      note:
        movement.amount !== undefined && movement.amount !== ""
          ? formatMoney(getNumber(movement.amount))
          : "",
      sourceLabel: "Finanzas",
    }));

  const agendaEvents = useMemo(() => {
    return [...calendarEvents, ...automaticTaskEvents, ...financeDateEvents]
      .filter((event) => event.date && event.date >= today)
      .sort((a, b) => {
        if (a.date !== b.date) {
          return String(a.date).localeCompare(String(b.date));
        }

        return String(a.time || "").localeCompare(String(b.time || ""));
      })
      .slice(0, 6);
  }, [calendarEvents, automaticTaskEvents, financeDateEvents, today]);

  const todayAgendaEvents = agendaEvents.filter((event) => event.date === today);

  const quickActions: QuickAction[] = [
    {
      title: "Registrar trade",
      description: "Añade una operación al journal.",
      href: "/trading",
      icon: LineChart,
    },
    {
      title: "Nuevo movimiento",
      description: "Registra ingreso, gasto o ahorro.",
      href: "/finanzas",
      icon: Wallet,
    },
    {
      title: "Registrar salud",
      description: "Anota peso, agua, calorías o entreno.",
      href: "/salud",
      icon: Dumbbell,
    },
    {
      title: "Estudio / tarea",
      description: "Registra sesión o pendiente.",
      href: "/estudios",
      icon: GraduationCap,
    },
    {
      title: "Nuevo evento",
      description: "Agenda una fecha importante.",
      href: "/calendario",
      icon: CalendarDays,
    },
  ];

  const moduleCards = [
    {
      title: "Trading",
      href: "/trading",
      icon: LineChart,
      mainValue: formatMoney(monthlyPnL),
      label: "P&L del mes",
      description: `${monthlyTrades.length} trades · ${winRate}% win rate`,
      color: monthlyPnL >= 0 ? "text-emerald-400" : "text-red-400",
      bg: "bg-emerald-400/10",
    },
    {
      title: "Finanzas",
      href: "/finanzas",
      icon: Wallet,
      mainValue: formatMoney(availableMoney),
      label: "Disponible",
      description: `${formatMoney(monthlyIncome)} ingresos · ${formatMoney(
        monthlyExpenses
      )} gastos`,
      color: availableMoney >= 0 ? "text-emerald-400" : "text-red-400",
      bg: "bg-green-400/10",
    },
    {
      title: "Salud",
      href: "/salud",
      icon: Dumbbell,
      mainValue: todayHealthLog ? "Registrado" : "Pendiente",
      label: "Registro de hoy",
      description: trainedToday
        ? "Entreno marcado hoy"
        : latestHealthLog?.weight
        ? `Último peso: ${latestHealthLog.weight}`
        : "Registra tu día",
      color: todayHealthLog ? "text-emerald-400" : "text-white/60",
      bg: "bg-red-400/10",
    },
    {
      title: "Estudios",
      href: "/estudios",
      icon: BookOpen,
      mainValue: `${pendingTasks.length}`,
      label: "Tareas pendientes",
      description: `${Math.round(studyMinutesMonth / 60)}h estudiadas este mes`,
      color: pendingTasks.length > 0 ? "text-blue-300" : "text-emerald-400",
      bg: "bg-blue-400/10",
    },
    {
      title: "Calendario",
      href: "/calendario",
      icon: CalendarDays,
      mainValue: `${todayAgendaEvents.length}`,
      label: "Eventos de hoy",
      description: `${agendaEvents.length} próximos en agenda`,
      color: "text-orange-300",
      bg: "bg-orange-400/10",
    },
  ];

  return (
    <>
      <header className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Life OS
          </div>

          <p className="text-sm capitalize text-white/40">
            {formatDateTitle(new Date())}
          </p>

          <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Tu panel principal
          </h2>

          <p className="mt-4 max-w-2xl text-white/50">
            Revisa tu trading, dinero, salud, estudios y agenda desde un solo
            lugar.
          </p>
        </div>

        <Link
          href="/calendario"
          className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
        >
          Abrir calendario
          <ArrowRight size={18} />
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-5">
        {moduleCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
             className="group min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-3 transition hover:-translate-y-1 hover:bg-white/[0.06] sm:p-5"
            >
              <div className="mb-5 flex items-center justify-between">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${card.bg}`}
                >
                  <Icon className="h-5 w-5 text-white/80" />
                </div>

                <ArrowRight className="h-4 w-4 text-white/25 transition group-hover:translate-x-1 group-hover:text-white" />
              </div>

              <p className="text-sm text-white/40">{card.label}</p>
              <h3 className={`mt-2 truncate text-xl font-bold sm:text-2xl ${card.color}`}>
                {card.mainValue}
              </h3>
              <p className="mt-2 text-sm text-white/35">{card.description}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Resumen del día</p>
                <h3 className="mt-1 text-2xl font-bold">Hoy</h3>
              </div>

              <span className="rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white/50">
                {today}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <LineChart className="h-5 w-5 text-emerald-400" />
                  <p className="font-bold">Trading</p>
                </div>

                <p
                  className={`text-2xl font-bold ${
                    todayPnL >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {formatMoney(todayPnL)}
                </p>

                <p className="mt-2 text-sm text-white/40">
                  {todayTrades.length} operaciones hoy
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <Dumbbell className="h-5 w-5 text-red-300" />
                  <p className="font-bold">Salud</p>
                </div>

                <p className="text-2xl font-bold text-white">
                  {todayHealthLog ? "Registrado" : "Pendiente"}
                </p>

                <p className="mt-2 text-sm text-white/40">
                  {trainedToday
                    ? "Entreno marcado"
                    : todayHealthLog
                    ? "Registro guardado"
                    : "Aún no registras tu día"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-blue-300" />
                  <p className="font-bold">Estudios</p>
                </div>

                <p className="text-2xl font-bold text-blue-300">
                  {dueTodayTasks.length}
                </p>

                <p className="mt-2 text-sm text-white/40">
                  tareas vencen hoy · {overdueTasks.length} atrasadas
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-orange-300" />
                  <p className="font-bold">Agenda</p>
                </div>

                <p className="text-2xl font-bold text-orange-300">
                  {todayAgendaEvents.length}
                </p>

                <p className="mt-2 text-sm text-white/40">
                  eventos o pendientes para hoy
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Próximos pendientes</p>
                <h3 className="mt-1 text-2xl font-bold">Agenda</h3>
              </div>

              <Link
                href="/calendario"
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Ver todo
              </Link>
            </div>

            <div className="space-y-3">
              {agendaEvents.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-white/40">
                  No tienes eventos próximos.
                </div>
              ) : (
                agendaEvents.map((event) => (
                  <div
                    key={`${event.id}-${event.date}-${event.title}`}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
                          {event.sourceLabel || event.category || "Calendario"}
                        </span>

                        {event.time && (
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                            {event.time}
                          </span>
                        )}
                      </div>

                      <p className="font-bold text-white">
                        {event.title || "Evento sin título"}
                      </p>

                      {event.note && (
                        <p className="mt-1 text-sm text-white/40">
                          {event.note}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-white/50">
                      {event.date}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <p className="text-sm text-white/40">Accesos rápidos</p>
            <h3 className="mt-1 text-2xl font-bold">Crear registro</h3>

            <div className="mt-5 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 transition hover:bg-white/[0.06]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white/10 p-3">
                        <Icon className="h-5 w-5 text-white/70" />
                      </div>

                      <div>
                        <p className="font-bold text-white">{action.title}</p>
                        <p className="mt-1 text-xs text-white/40">
                          {action.description}
                        </p>
                      </div>
                    </div>

                    <Plus className="h-4 w-4 text-white/25 transition group-hover:text-white" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <p className="text-sm text-white/40">Finanzas del mes</p>
            <h3 className="mt-1 text-2xl font-bold">Resumen</h3>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-3">
                  <CircleDollarSign className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-white/50">Ingresos</span>
                </div>

                <span className="font-bold text-emerald-400">
                  {formatMoney(monthlyIncome)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-red-400" />
                  <span className="text-sm text-white/50">Gastos</span>
                </div>

                <span className="font-bold text-red-400">
                  {formatMoney(monthlyExpenses)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-300" />
                  <span className="text-sm text-white/50">Ahorro</span>
                </div>

                <span className="font-bold text-blue-300">
                  {formatMoney(monthlySavings)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <p className="text-sm text-white/40">Estado rápido</p>
            <h3 className="mt-1 text-2xl font-bold">Checklist</h3>

            <div className="mt-5 space-y-3">
              {[
                {
                  label: "Trading registrado",
                  done: todayTrades.length > 0,
                },
                {
                  label: "Salud registrada",
                  done: Boolean(todayHealthLog),
                },
                {
                  label: "Sin tareas atrasadas",
                  done: overdueTasks.length === 0,
                },
                {
                  label: "Agenda revisada",
                  done: todayAgendaEvents.length === 0,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4"
                >
                  <span className="text-sm text-white/60">{item.label}</span>

                  <CheckCircle2
                    className={`h-5 w-5 ${
                      item.done ? "text-emerald-400" : "text-white/20"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}