"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Dumbbell,
  Plus,
  Trash2,
  X,
} from "lucide-react";

const calendarStorageKey = "lifeos-calendar-events";
const studyTasksStorageKey = "lifeos-study-tasks";
const financeMovementsStorageKey = "lifeos-finance-movements";

const possibleFinanceGoalKeys = [
  "lifeos-finance-simple-goals-final",
  "lifeos-finance-simple-goals",
  "lifeos-finance-goals",
];

type EventCategory =
  | "Trading"
  | "Finanzas"
  | "Salud"
  | "Estudios"
  | "Personal";

type EventSource =
  | "manual"
  | "study-task"
  | "finance-movement"
  | "finance-goal";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time?: string;
  category: EventCategory;
  note?: string;
  source: EventSource;
  sourceLabel: string;
  canDelete: boolean;
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

type FinanceGoal = {
  id?: string;
  title?: string;
  name?: string;
  deadline?: string;
  dueDate?: string;
  targetDate?: string;
  target?: string | number;
  current?: string | number;
  saved?: string | number;
};

const categories: EventCategory[] = [
  "Trading",
  "Finanzas",
  "Salud",
  "Estudios",
  "Personal",
];

const categoryStyles: Record<
  EventCategory,
  {
    dot: string;
    badge: string;
    border: string;
    icon: typeof CalendarDays;
  }
> = {
  Trading: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-400/10 text-emerald-300",
    border: "border-emerald-400/20",
    icon: CalendarDays,
  },
  Finanzas: {
    dot: "bg-green-400",
    badge: "bg-green-400/10 text-green-300",
    border: "border-green-400/20",
    icon: CircleDollarSign,
  },
  Salud: {
    dot: "bg-red-400",
    badge: "bg-red-400/10 text-red-300",
    border: "border-red-400/20",
    icon: Dumbbell,
  },
  Estudios: {
    dot: "bg-blue-400",
    badge: "bg-blue-400/10 text-blue-300",
    border: "border-blue-400/20",
    icon: BookOpen,
  },
  Personal: {
    dot: "bg-purple-400",
    badge: "bg-purple-400/10 text-purple-300",
    border: "border-purple-400/20",
    icon: CalendarDays,
  },
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
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getTodayKey() {
  return createDateKey(new Date());
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
  const totalDays = lastDay.getDate();

  const days: Array<{
    date: string;
    day: number;
    isCurrentMonth: boolean;
  }> = [];

  const previousMonthLastDay = new Date(year, month, 0).getDate();

  for (let index = firstWeekDay - 1; index >= 0; index--) {
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

function normalizeCategory(value?: string): EventCategory {
  if (!value) return "Personal";

  const cleanValue = value.toLowerCase();

  if (cleanValue.includes("trading")) return "Trading";
  if (cleanValue.includes("finanza")) return "Finanzas";
  if (cleanValue.includes("salud")) return "Salud";
  if (cleanValue.includes("estudio")) return "Estudios";
  if (cleanValue.includes("personal")) return "Personal";

  return "Personal";
}

function isCompletedStatus(status?: string) {
  if (!status) return false;

  const cleanStatus = status.toLowerCase();

  return (
    cleanStatus.includes("complet") ||
    cleanStatus.includes("done") ||
    cleanStatus.includes("termin")
  );
}

function getFinanceMovementTitle(movement: FinanceMovement) {
  if (movement.title) return movement.title;
  if (movement.concept) return movement.concept;
  if (movement.description) return movement.description;
  if (movement.type) return `${movement.type} financiero`;

  return "Movimiento financiero";
}

function createManualEventId() {
  return `manual-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function CalendarClient() {
  const [loaded, setLoaded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayKey());

  const [manualEvents, setManualEvents] = useState<CalendarEvent[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [financeMovements, setFinanceMovements] = useState<FinanceMovement[]>(
    []
  );
  const [financeGoals, setFinanceGoals] = useState<FinanceGoal[]>([]);

  const [showAutomaticEvents, setShowAutomaticEvents] = useState(true);
  const [eventModalOpen, setEventModalOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: getTodayKey(),
    time: "",
    category: "Personal" as EventCategory,
    note: "",
  });

  useEffect(() => {
    const savedManualEvents = safeParseArray<CalendarEvent>(
      localStorage.getItem(calendarStorageKey)
    );

    const normalizedManualEvents = savedManualEvents.map((event) => ({
      id: String(event.id || createManualEventId()),
      title: String(event.title || "Evento sin título"),
      date: String(event.date || getTodayKey()),
      time: event.time || "",
      category: normalizeCategory(String(event.category || "Personal")),
      note: event.note || "",
      source: "manual" as EventSource,
      sourceLabel: "Manual",
      canDelete: true,
    }));

    setManualEvents(normalizedManualEvents);

    setStudyTasks(
      safeParseArray<StudyTask>(localStorage.getItem(studyTasksStorageKey))
    );

    setFinanceMovements(
      safeParseArray<FinanceMovement>(
        localStorage.getItem(financeMovementsStorageKey)
      )
    );

    const loadedFinanceGoals = possibleFinanceGoalKeys.flatMap((key) =>
      safeParseArray<FinanceGoal>(localStorage.getItem(key))
    );

    setFinanceGoals(loadedFinanceGoals);

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(calendarStorageKey, JSON.stringify(manualEvents));
  }, [manualEvents, loaded]);

  const automaticEvents = useMemo(() => {
    const studyTaskEvents: CalendarEvent[] = studyTasks
      .map((task, index) => {
        const date = task.dueDate || task.deadline || task.date;

        if (!date || isCompletedStatus(task.status)) return null;

        return {
          id: `study-task-${task.id || index}`,
          title: `Tarea: ${task.title || "Sin título"}`,
          date,
          category: "Estudios" as EventCategory,
          note: `${task.subject || "Sin materia"}${
            task.priority ? ` · Prioridad ${task.priority}` : ""
          }${task.note ? ` · ${task.note}` : ""}`,
          source: "study-task" as EventSource,
          sourceLabel: "Estudios",
          canDelete: false,
        };
      })
      .filter(Boolean) as CalendarEvent[];

    const financeMovementEvents: CalendarEvent[] = financeMovements
      .map((movement, index) => {
        if (!movement.date) return null;

        const amountText =
          movement.amount !== undefined && movement.amount !== ""
            ? ` · $${movement.amount}`
            : "";

        return {
          id: `finance-movement-${movement.id || index}`,
          title: getFinanceMovementTitle(movement),
          date: movement.date,
          category: "Finanzas" as EventCategory,
          note: `${movement.type || "Movimiento"}${amountText}${
            movement.category ? ` · ${movement.category}` : ""
          }${movement.note ? ` · ${movement.note}` : ""}`,
          source: "finance-movement" as EventSource,
          sourceLabel: "Finanzas",
          canDelete: false,
        };
      })
      .filter(Boolean) as CalendarEvent[];

    const financeGoalEvents: CalendarEvent[] = financeGoals
      .map((goal, index) => {
        const date = goal.deadline || goal.dueDate || goal.targetDate;

        if (!date) return null;

        const title = goal.title || goal.name || "Meta financiera";

        return {
          id: `finance-goal-${goal.id || index}`,
          title: `Meta financiera: ${title}`,
          date,
          category: "Finanzas" as EventCategory,
          note: `Objetivo: $${goal.target || 0} · Actual: $${
            goal.current || goal.saved || 0
          }`,
          source: "finance-goal" as EventSource,
          sourceLabel: "Finanzas",
          canDelete: false,
        };
      })
      .filter(Boolean) as CalendarEvent[];

    return [...studyTaskEvents, ...financeMovementEvents, ...financeGoalEvents];
  }, [studyTasks, financeMovements, financeGoals]);

  const allEvents = useMemo(() => {
    const events = showAutomaticEvents
      ? [...manualEvents, ...automaticEvents]
      : manualEvents;

    return events.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (a.time || "").localeCompare(b.time || "");
    });
  }, [manualEvents, automaticEvents, showAutomaticEvents]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const currentMonthKey = createMonthKey(currentMonth);

  const monthEvents = allEvents.filter((event) =>
    event.date.startsWith(currentMonthKey)
  );

  const selectedDateEvents = allEvents.filter(
    (event) => event.date === selectedDate
  );

  const upcomingEvents = allEvents
    .filter((event) => event.date >= getTodayKey())
    .slice(0, 8);

  const categorySummary = categories.map((category) => ({
    category,
    total: monthEvents.filter((event) => event.category === category).length,
  }));

  const automaticSummary = {
    study: automaticEvents.filter((event) => event.source === "study-task")
      .length,
    finance: automaticEvents.filter(
      (event) =>
        event.source === "finance-movement" || event.source === "finance-goal"
    ).length,
    manual: manualEvents.length,
  };

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
    const today = new Date();

    setCurrentMonth(today);
    setSelectedDate(createDateKey(today));
  }

  function openNewEventModal(date?: string) {
    const eventDate = date || selectedDate;

    setNewEvent({
      title: "",
      date: eventDate,
      time: "",
      category: "Personal",
      note: "",
    });

    setEventModalOpen(true);
  }

  function addManualEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newEvent.title.trim()) return;

    const eventToSave: CalendarEvent = {
      id: createManualEventId(),
      title: newEvent.title.trim(),
      date: newEvent.date,
      time: newEvent.time,
      category: newEvent.category,
      note: newEvent.note.trim(),
      source: "manual",
      sourceLabel: "Manual",
      canDelete: true,
    };

    setManualEvents((currentEvents) => [...currentEvents, eventToSave]);
    setSelectedDate(newEvent.date);
    setCurrentMonth(new Date(`${newEvent.date}T00:00:00`));
    setEventModalOpen(false);
  }

  function deleteManualEvent(eventId: string) {
    setManualEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== eventId)
    );
  }

  function renderEventCard(event: CalendarEvent) {
    const style = categoryStyles[event.category];
    const Icon = style.icon;

    return (
      <div
        key={`${event.source}-${event.id}`}
        className={`rounded-2xl border ${style.border} bg-black/40 p-4`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 gap-3">
            <div className="mt-1 rounded-full bg-white/10 p-2">
              <Icon className="h-4 w-4 text-white/70" />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs ${style.badge}`}
                >
                  {event.category}
                </span>

                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                  {event.sourceLabel}
                </span>
              </div>

              <p className="truncate font-bold text-white">{event.title}</p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-white/40">
                <span>{event.date}</span>

                {event.time && (
                  <span className="inline-flex items-center gap-1">
                    <Clock size={12} />
                    {event.time}
                  </span>
                )}
              </div>

              {event.note && (
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/45">
                  {event.note}
                </p>
              )}
            </div>
          </div>

          {event.canDelete && (
            <button
              onClick={() => deleteManualEvent(event.id)}
              className="rounded-xl bg-red-400/10 p-2 text-red-400 transition hover:bg-red-400/20"
              title="Borrar evento"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="mb-6 flex flex-col justify-between gap-5 lg:mb-10 lg:flex-row lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Calendario conectado
          </div>

          <p className="text-sm text-white/40">Agenda central</p>

          <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Calendario
          </h2>

          <p className="mt-3 max-w-2xl text-sm text-white/50 sm:text-base">
            Mira tus eventos manuales junto con tareas de estudios y fechas
            importantes de finanzas.
          </p>
        </div>

        <button
          onClick={() => openNewEventModal()}
          className="inline-flex w-fit items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
        >
          <Plus size={18} />
          Nuevo evento
        </button>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <p className="text-xs text-white/40 sm:text-sm">Eventos mes</p>
          <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
            {monthEvents.length}
          </h3>
          <p className="mt-2 text-xs text-white/35 sm:text-sm">
            {currentMonthKey}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <p className="text-xs text-white/40 sm:text-sm">Tareas</p>
          <h3 className="mt-2 text-2xl font-bold text-blue-300 sm:text-3xl">
            {automaticSummary.study}
          </h3>
          <p className="mt-2 text-xs text-white/35 sm:text-sm">Estudios</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <p className="text-xs text-white/40 sm:text-sm">Finanzas</p>
          <h3 className="mt-2 text-2xl font-bold text-green-300 sm:text-3xl">
            {automaticSummary.finance}
          </h3>
          <p className="mt-2 text-xs text-white/35 sm:text-sm">
            Fechas conectadas
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
          <p className="text-xs text-white/40 sm:text-sm">Manuales</p>
          <h3 className="mt-2 text-2xl font-bold text-purple-300 sm:text-3xl">
            {automaticSummary.manual}
          </h3>
          <p className="mt-2 text-xs text-white/35 sm:text-sm">Creados por ti</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-4 md:p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/40">Vista mensual</p>
              <h3 className="mt-1 text-2xl font-bold capitalize">
                {formatMonthTitle(currentMonth)}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goToToday}
                className="rounded-2xl border border-white/10 px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Hoy
              </button>

              <button
                onClick={() => setShowAutomaticEvents(!showAutomaticEvents)}
                className={`rounded-2xl px-4 py-2 text-sm font-bold transition ${
                  showAutomaticEvents
                    ? "bg-emerald-400 text-black hover:bg-emerald-300"
                    : "border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                Auto eventos
              </button>

              <button
                onClick={goToPreviousMonth}
                className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={goToNextMonth}
                className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold uppercase text-white/35">
              {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-7 gap-2">
              {calendarDays.map((day) => {
                const eventsForDay = allEvents.filter(
                  (event) => event.date === day.date
                );
                const isSelected = selectedDate === day.date;
                const isToday = getTodayKey() === day.date;

                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDate(day.date)}
                    onDoubleClick={() => openNewEventModal(day.date)}
                    className={`min-h-[120px] rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? "border-emerald-400 bg-emerald-400/10"
                        : "border-white/10 bg-black/30 hover:bg-white/[0.06]"
                    } ${day.isCurrentMonth ? "opacity-100" : "opacity-35"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                          isToday ? "bg-white text-black" : "text-white/70"
                        }`}
                      >
                        {day.day}
                      </span>

                      {eventsForDay.length > 0 && (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/50">
                          {eventsForDay.length}
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      {eventsForDay.slice(0, 3).map((event) => {
                        const style = categoryStyles[event.category];

                        return (
                          <div
                            key={`${event.source}-${event.id}`}
                            className="flex items-center gap-1 truncate text-xs text-white/55"
                          >
                            <span
                              className={`h-2 w-2 shrink-0 rounded-full ${style.dot}`}
                            />
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}

                      {eventsForDay.length > 3 && (
                        <p className="text-[10px] text-white/30">
                          +{eventsForDay.length - 3} más
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:hidden">
            <p className="mb-3 text-sm text-white/40">Días del mes</p>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {calendarDays
                .filter((day) => day.isCurrentMonth)
                .map((day) => {
                  const eventsForDay = allEvents.filter(
                    (event) => event.date === day.date
                  );
                  const isSelected = selectedDate === day.date;
                  const isToday = getTodayKey() === day.date;

                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDate(day.date)}
                      className={`flex min-w-16 flex-col items-center justify-center rounded-2xl border px-3 py-3 transition ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-400/10"
                          : "border-white/10 bg-black/30"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-2xl text-sm font-bold ${
                          isToday ? "bg-white text-black" : "bg-white/10 text-white"
                        }`}
                      >
                        {day.day}
                      </span>

                      <span className="mt-2 text-[10px] text-white/40">
                        {eventsForDay.length} evt
                      </span>
                    </button>
                  );
                })}
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-white/40">Día seleccionado</p>
                  <h4 className="text-lg font-bold text-white">
                    {selectedDate}
                  </h4>
                </div>

                <button
                  onClick={() => openNewEventModal(selectedDate)}
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black"
                >
                  +
                </button>
              </div>

              <div className="space-y-2">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-sm text-white/40">
                    No hay eventos este día.
                  </p>
                ) : (
                  selectedDateEvents.map((event) => {
                    const style = categoryStyles[event.category];

                    return (
                      <div
                        key={`${event.source}-${event.id}`}
                        className="rounded-2xl border border-white/10 bg-black/40 p-3"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${style.dot}`}
                          />
                          <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/50">
                            {event.category}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-white">
                          {event.title}
                        </p>

                        {event.note && (
                          <p className="mt-1 text-xs text-white/40">
                            {event.note}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 hidden text-xs text-white/30 md:block">
            Tip: doble click en un día para crear evento rápido.
          </p>
        </section>

        <aside className="space-y-6">
          <section className="hidden rounded-3xl border border-white/10 bg-white/[0.035] p-5 md:block">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">Día seleccionado</p>
                <h3 className="mt-1 text-xl font-bold">{selectedDate}</h3>
              </div>

              <button
                onClick={() => openNewEventModal(selectedDate)}
                className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-white/90"
              >
                +
              </button>
            </div>

            <div className="space-y-3">
              {selectedDateEvents.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/40">
                  No hay eventos este día.
                </p>
              ) : (
                selectedDateEvents.map(renderEventCard)
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-sm text-white/40">Próximos eventos</p>
            <h3 className="mt-1 text-xl font-bold">Agenda</h3>

            <div className="mt-5 space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-white/40">
                  No hay eventos próximos.
                </p>
              ) : (
                upcomingEvents.map(renderEventCard)
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-sm text-white/40">Resumen del mes</p>
            <h3 className="mt-1 text-xl font-bold">Por categoría</h3>

            <div className="mt-5 space-y-3">
              {categorySummary.map((item) => {
                const style = categoryStyles[item.category];

                return (
                  <div
                    key={item.category}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-3 w-3 rounded-full ${style.dot}`} />
                      <span className="text-sm text-white/70">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-sm font-bold text-white">
                      {item.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {eventModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/80 p-3 pb-28 pt-4 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={addManualEvent}
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Calendario</p>
                <h2 className="mt-1 text-2xl font-bold">Nuevo evento</h2>
                <p className="mt-2 text-sm text-white/40">
                  Este evento será manual. Los eventos automáticos vienen de
                  otros módulos.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-xs text-white/40">Título</span>
                <input
                  value={newEvent.title}
                  onChange={(event) =>
                    setNewEvent((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                  placeholder="Ej: Pago Apex, examen, cita, reunión..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs text-white/40">Fecha</span>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(event) =>
                      setNewEvent((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </label>

                <label className="block space-y-2">
                  <span className="text-xs text-white/40">Hora opcional</span>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(event) =>
                      setNewEvent((current) => ({
                        ...current,
                        time: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-xs text-white/40">Categoría</span>
                <select
                  value={newEvent.category}
                  onChange={(event) =>
                    setNewEvent((current) => ({
                      ...current,
                      category: event.target.value as EventCategory,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs text-white/40">Nota opcional</span>
                <textarea
                  value={newEvent.note}
                  onChange={(event) =>
                    setNewEvent((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Detalles importantes..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEventModalOpen(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Guardar evento
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}