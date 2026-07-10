"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  HeartPulse,
  PiggyBank,
  Plus,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

type FinanceMovement = {
  id: string;
  date: string;
  type: string;
  category: string;
  amount: string;
  method: string;
  note: string;
  goalId?: string;
};

type HealthLog = {
  id: string;
  date: string;
  values: Record<string, string>;
  note: string;
};

type StudySession = {
  id: string;
  date: string;
  subjectId: string;
  minutes: string;
  type: string;
  focus: string;
  note: string;
};

type StudyTask = {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  priority: string;
  status: "Pendiente" | "Completada";
  note: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  note: string;
};

type Goal = {
  id: string;
  title: string;
  category: string;
  deadline: string;
  progress: string;
  status: string;
  priority: string;
  note: string;
};

const financeStorageKey = "lifeos-finance-movements";
const healthStorageKey = "lifeos-health-daily-logs";
const studySessionsStorageKey = "lifeos-study-sessions";
const studyTasksStorageKey = "lifeos-study-tasks";
const calendarStorageKey = "lifeos-calendar-events";
const goalsStorageKey = "lifeos-goals";

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function parseAmount(value: string | undefined) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function parseProgress(value: string | undefined) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) return 0;

  return Math.min(Math.max(numberValue, 0), 100);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatHours(minutes: number) {
  const hours = minutes / 60;

  if (hours < 1) {
    return `${minutes.toFixed(0)} min`;
  }

  return `${hours.toFixed(1)} h`;
}

function readLocalStorageArray<T>(key: string): T[] {
  try {
    const savedValue = localStorage.getItem(key);

    if (!savedValue) return [];

    const parsedValue = JSON.parse(savedValue);

    if (!Array.isArray(parsedValue)) return [];

    return parsedValue as T[];
  } catch {
    return [];
  }
}

function sortUpcomingEvents(events: CalendarEvent[]) {
  const today = getTodayDate();

  return [...events]
    .filter((event) => event.date >= today)
    .sort((eventA, eventB) => {
      if (eventA.date !== eventB.date) {
        return eventA.date.localeCompare(eventB.date);
      }

      return eventA.time.localeCompare(eventB.time);
    });
}

export function DashboardClient() {
  const [financeMovements, setFinanceMovements] = useState<FinanceMovement[]>(
    []
  );
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setFinanceMovements(
      readLocalStorageArray<FinanceMovement>(financeStorageKey)
    );
    setHealthLogs(readLocalStorageArray<HealthLog>(healthStorageKey));
    setStudySessions(
      readLocalStorageArray<StudySession>(studySessionsStorageKey)
    );
    setStudyTasks(readLocalStorageArray<StudyTask>(studyTasksStorageKey));
    setCalendarEvents(readLocalStorageArray<CalendarEvent>(calendarStorageKey));
    setGoals(readLocalStorageArray<Goal>(goalsStorageKey));
  }, []);

  const today = getTodayDate();
  const currentMonth = getCurrentMonth();

  const monthlyFinanceMovements = financeMovements.filter((movement) =>
    movement.date.startsWith(currentMonth)
  );

  const monthlyIncome = monthlyFinanceMovements
    .filter((movement) => movement.type === "Ingreso")
    .reduce((total, movement) => total + parseAmount(movement.amount), 0);

  const monthlyExpenses = monthlyFinanceMovements
    .filter((movement) => movement.type === "Gasto")
    .reduce((total, movement) => total + parseAmount(movement.amount), 0);

  const monthlySavings = monthlyFinanceMovements
    .filter(
      (movement) =>
        movement.type === "Ahorro" || movement.type === "Inversión"
    )
    .reduce((total, movement) => total + parseAmount(movement.amount), 0);

  const availableMoney = monthlyIncome - monthlyExpenses - monthlySavings;

  const monthlyHealthLogs = healthLogs.filter((log) =>
    log.date.startsWith(currentMonth)
  );

  const todayHealthLog = healthLogs.find((log) => log.date === today);

  const monthlyTrainingDays = monthlyHealthLogs.filter((log) => {
    const trained = log.values?.trainingDone === "Sí";
    const hasSport = Boolean(log.values?.sport);
    const hasMinutes = parseAmount(log.values?.trainingMinutes) > 0;

    return trained || hasSport || hasMinutes;
  }).length;

  const monthlyStudySessions = studySessions.filter((session) =>
    session.date.startsWith(currentMonth)
  );

  const monthlyStudyMinutes = monthlyStudySessions.reduce(
    (total, session) => total + parseAmount(session.minutes),
    0
  );

  const pendingStudyTasks = studyTasks.filter(
    (task) => task.status === "Pendiente"
  );

  const upcomingEvents = useMemo(
    () => sortUpcomingEvents(calendarEvents).slice(0, 5),
    [calendarEvents]
  );

  const todayEvents = calendarEvents.filter((event) => event.date === today);

  const activeGoals = goals.filter((goal) => goal.status !== "Completado");
  const completedGoals = goals.filter((goal) => goal.status === "Completado");

  const averageGoalProgress =
    goals.length > 0
      ? goals.reduce((total, goal) => total + parseProgress(goal.progress), 0) /
        goals.length
      : 0;

 
  const mainCards = [
    {
      title: "Finanzas",
      value: formatMoney(availableMoney),
      description: "Disponible este mes.",
      href: "/finanzas",
      icon: Wallet,
      color: availableMoney >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      title: "Salud",
      value: `${monthlyHealthLogs.length} días`,
      description: `${monthlyTrainingDays} días entrenados este mes.`,
      href: "/salud",
      icon: HeartPulse,
      color: "text-rose-300",
    },
    {
      title: "Estudios",
      value: formatHours(monthlyStudyMinutes),
      description: `${pendingStudyTasks.length} tareas pendientes.`,
      href: "/estudios",
      icon: BookOpen,
      color: "text-yellow-300",
    },
    {
      title: "Objetivos",
      value: `${averageGoalProgress.toFixed(0)}%`,
      description: `${activeGoals.length} activos · ${completedGoals.length} completados.`,
      href: "/objetivos",
      icon: Target,
      color: "text-purple-300",
    },
  ];

  const quickActions = [
    {
      title: "Registrar trade",
      description: "Ir al journal de trading.",
      href: "/trading",
      icon: TrendingUp,
    },
    {
      title: "Nuevo movimiento",
      description: "Agregar ingreso, gasto o ahorro.",
      href: "/finanzas",
      icon: PiggyBank,
    },
    {
      title: "Registrar salud",
      description: "Peso, calorías, agua y deporte.",
      href: "/salud",
      icon: Activity,
    },
    {
      title: "Registrar estudio",
      description: "Guardar sesión o tarea.",
      href: "/estudios",
      icon: BookOpen,
    },
    {
      title: "Nuevo evento",
      description: "Agregar algo al calendario.",
      href: "/calendario",
      icon: CalendarDays,
    },
    {
      title: "Nuevo objetivo",
      description: "Crear meta nueva.",
      href: "/objetivos",
      icon: Target,
    },
  ];

  return (
    <div>
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Life OS Dashboard
          </div>

          <p className="text-sm text-white/40">Resumen general</p>

          <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Tu vida en un solo panel.
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Mira rápidamente cómo vas en finanzas, salud, estudios, calendario y
            objetivos. Desde aquí puedes saltar a cualquier módulo.
          </p>
        </div>

        
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {mainCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:bg-white/[0.05]"
            >
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-white/40">{card.title}</p>
                <div className="rounded-full bg-white/10 p-3">
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>

              <p className={`text-3xl font-bold ${card.color}`}>
                {card.value}
              </p>

              <p className="mt-4 text-sm leading-6 text-white/40">
                {card.description}
              </p>
            </Link>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-6">
            <p className="text-sm text-white/40">Hoy</p>
            <h2 className="mt-1 text-2xl font-bold">Resumen del día</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <HeartPulse className="h-5 w-5 text-rose-300" />
                <p className="font-bold text-white">Salud de hoy</p>
              </div>

              {todayHealthLog ? (
                <div className="space-y-2 text-sm text-white/50">
                  <p>
                    Calorías:{" "}
                    <span className="text-white">
                      {todayHealthLog.values?.calories || "—"}
                    </span>
                  </p>
                  <p>
                    Agua:{" "}
                    <span className="text-white">
                      {todayHealthLog.values?.water || "—"}
                    </span>
                  </p>
                  <p>
                    Entrené:{" "}
                    <span className="text-white">
                      {todayHealthLog.values?.trainingDone || "—"}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="text-sm text-white/40">
                  Todavía no registraste salud hoy.
                </p>
              )}
            </article>

            <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-sky-300" />
                <p className="font-bold text-white">Eventos de hoy</p>
              </div>

              {todayEvents.length === 0 ? (
                <p className="text-sm text-white/40">
                  No tienes eventos para hoy.
                </p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <p className="text-sm font-bold text-white">
                        {event.title}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {event.category} {event.time && `· ${event.time}`}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-yellow-300" />
                <p className="font-bold text-white">Tareas pendientes</p>
              </div>

              {pendingStudyTasks.length === 0 ? (
                <p className="text-sm text-white/40">
                  No tienes tareas pendientes.
                </p>
              ) : (
                <div className="space-y-2">
                  {pendingStudyTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                    >
                      <p className="text-sm font-bold text-white">
                        {task.title}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        Vence {task.dueDate}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-2xl border border-white/10 bg-black/40 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-emerald-400" />
                <p className="font-bold text-white">Actividad física</p>
              </div>

              <p className="text-sm text-white/40">
                Este mes llevas{" "}
                <span className="font-bold text-emerald-300">
                  {monthlyTrainingDays}
                </span>{" "}
                días entrenados.
              </p>
            </article>
          </div>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-6">
            <p className="text-sm text-white/40">Agenda</p>
            <h2 className="mt-1 text-2xl font-bold">Próximos eventos</h2>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-6 text-center">
              <p className="text-sm font-semibold text-white">
                No tienes próximos eventos.
              </p>
              <p className="mt-2 text-xs text-white/40">
                Crea eventos en el calendario para verlos aquí.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href="/calendario"
                  className="block rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:bg-white/[0.05]"
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="font-bold text-white">{event.title}</p>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
                      {event.category}
                    </span>
                  </div>

                  <p className="text-xs text-white/40">
                    {event.date} {event.time && `· ${event.time}`}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Accesos rápidos</p>
            <h2 className="mt-1 text-2xl font-bold">¿Qué quieres registrar?</h2>
          </div>

          <p className="text-sm text-white/40">Life OS</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-2xl border border-white/10 bg-black/40 p-5 transition hover:-translate-y-1 hover:bg-white/[0.05]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="rounded-full bg-white/10 p-3">
                    <Icon className="h-5 w-5 text-white/70" />
                  </div>

                  <Plus className="h-4 w-4 text-white/30 transition group-hover:text-white" />
                </div>

                <p className="font-bold text-white">{action.title}</p>
                <p className="mt-2 text-sm text-white/40">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      
    </div>
  );
}