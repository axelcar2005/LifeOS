"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";

type CalendarCategory =
  | "Trading"
  | "Finanzas"
  | "Salud"
  | "Estudios"
  | "Personal";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  category: CalendarCategory;
  note: string;
};

type EventForm = {
  title: string;
  date: string;
  time: string;
  category: CalendarCategory;
  note: string;
};

const eventsStorageKey = "lifeos-calendar-events";

const categories: CalendarCategory[] = [
  "Trading",
  "Finanzas",
  "Salud",
  "Estudios",
  "Personal",
];

const categoryStyles: Record<
  CalendarCategory,
  {
    dot: string;
    text: string;
    bg: string;
    border: string;
  }
> = {
  Trading: {
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  Finanzas: {
    dot: "bg-blue-300",
    text: "text-blue-300",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  Salud: {
    dot: "bg-rose-300",
    text: "text-rose-300",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
  Estudios: {
    dot: "bg-yellow-300",
    text: "text-yellow-300",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  Personal: {
    dot: "bg-purple-300",
    text: "text-purple-300",
    bg: "bg-purple-400/10",
    border: "border-purple-400/20",
  },
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createDateFromString(date: string) {
  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function createDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function getMonthTitle(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDayNumber(dateKey: string) {
  return Number(dateKey.split("-")[2]);
}

function createInitialForm(selectedDate?: string): EventForm {
  return {
    title: "",
    date: selectedDate ?? getTodayDate(),
    time: "",
    category: "Personal",
    note: "",
  };
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const days: Array<{
    dateKey: string;
    isCurrentMonth: boolean;
  }> = [];

  const previousMonthLastDay = new Date(year, month, 0).getDate();

  for (let index = startDay - 1; index >= 0; index--) {
    const day = previousMonthLastDay - index;
    const date = new Date(year, month - 1, day);

    days.push({
      dateKey: createDateKey(date),
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);

    days.push({
      dateKey: createDateKey(date),
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - days.length;

  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);

    days.push({
      dateKey: createDateKey(date),
      isCurrentMonth: false,
    });
  }

  return days;
}

function sortEvents(events: CalendarEvent[]) {
  return [...events].sort((eventA, eventB) => {
    if (eventA.date !== eventB.date) {
      return eventA.date.localeCompare(eventB.date);
    }

    return eventA.time.localeCompare(eventB.time);
  });
}

export function CalendarClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(getTodayDate);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState<EventForm>(() =>
    createInitialForm(getTodayDate())
  );

  useEffect(() => {
    const savedEvents = localStorage.getItem(eventsStorageKey);

    if (savedEvents) {
      const parsedEvents = JSON.parse(savedEvents) as CalendarEvent[];

      if (Array.isArray(parsedEvents)) {
        setEvents(parsedEvents);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(eventsStorageKey, JSON.stringify(events));
  }, [events, loaded]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonthDate),
    [currentMonthDate]
  );

  const currentMonthKey = getMonthKey(currentMonthDate);
  const today = getTodayDate();

  const monthEvents = events.filter((event) =>
    event.date.startsWith(currentMonthKey)
  );

  const selectedDateEvents = sortEvents(
    events.filter((event) => event.date === selectedDate)
  );

  const upcomingEvents = sortEvents(
    events.filter((event) => event.date >= today)
  ).slice(0, 6);

  const categoryCounts = categories.map((category) => ({
    category,
    total: monthEvents.filter((event) => event.category === category).length,
  }));

  function goToPreviousMonth() {
    setCurrentMonthDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setCurrentMonthDate(
      (currentDate) =>
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  }

  function goToToday() {
    const todayDate = new Date();

    setCurrentMonthDate(todayDate);
    setSelectedDate(getTodayDate());
  }

  function openEventModal(dateKey?: string) {
    const targetDate = dateKey ?? selectedDate;

    setEventForm(createInitialForm(targetDate));
    setSelectedDate(targetDate);
    setEventModalOpen(true);
  }

  function handleCreateEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!eventForm.title.trim()) return;

    const newEvent: CalendarEvent = {
      id: `${Date.now()}-${Math.random()}`,
      title: eventForm.title.trim(),
      date: eventForm.date,
      time: eventForm.time,
      category: eventForm.category,
      note: eventForm.note.trim(),
    };

    setEvents((currentEvents) => sortEvents([newEvent, ...currentEvents]));
    setSelectedDate(eventForm.date);
    setCurrentMonthDate(createDateFromString(eventForm.date));
    setEventForm(createInitialForm(eventForm.date));
    setEventModalOpen(false);
  }

  function deleteEvent(eventId: string) {
    setEvents((currentEvents) =>
      currentEvents.filter((event) => event.id !== eventId)
    );
  }

  return (
    <div>
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Módulo Calendario
          </div>

          <p className="text-sm text-white/40">Vista general</p>

          <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Calendario
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Organiza eventos importantes de trading, finanzas, salud, estudios
            y vida personal en una sola vista mensual.
          </p>
        </div>

        <button
          onClick={() => openEventModal()}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo evento
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-white/40">Eventos del mes</p>
            <div className="rounded-full bg-white/10 p-3">
              <CalendarDays className="h-5 w-5 text-emerald-400" />
            </div>
          </div>

          <p className="text-3xl font-bold text-white">{monthEvents.length}</p>
          <p className="mt-4 text-sm text-white/40">
            Eventos registrados en {currentMonthKey}.
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-white/40">Día seleccionado</p>
            <div className="rounded-full bg-white/10 p-3">
              <CalendarCheck className="h-5 w-5 text-sky-300" />
            </div>
          </div>

          <p className="text-3xl font-bold text-sky-300">
            {selectedDateEvents.length}
          </p>
          <p className="mt-4 text-sm text-white/40">
            Eventos para {selectedDate}.
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-white/40">Próximos</p>
            <div className="rounded-full bg-white/10 p-3">
              <Clock3 className="h-5 w-5 text-yellow-300" />
            </div>
          </div>

          <p className="text-3xl font-bold text-yellow-300">
            {upcomingEvents.length}
          </p>
          <p className="mt-4 text-sm text-white/40">
            Próximos eventos guardados.
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-white/40">Categorías</p>
            <div className="rounded-full bg-white/10 p-3">
              <Tag className="h-5 w-5 text-purple-300" />
            </div>
          </div>

          <p className="text-3xl font-bold text-purple-300">
            {categories.length}
          </p>
          <p className="mt-4 text-sm text-white/40">
            Trading, finanzas, salud, estudios y personal.
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-white/40">Calendario mensual</p>
              <h2 className="mt-1 text-2xl font-bold capitalize">
                {getMonthTitle(currentMonthDate)}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={goToPreviousMonth}
                className="rounded-2xl border border-white/10 bg-black/40 p-3 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={goToToday}
                className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Hoy
              </button>

              <button
                onClick={goToNextMonth}
                className="rounded-2xl border border-white/10 bg-black/40 p-3 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-white/40">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day) => {
              const dayEvents = events.filter(
                (event) => event.date === day.dateKey
              );
              const isToday = day.dateKey === today;
              const isSelected = day.dateKey === selectedDate;

              return (
                <button
                  key={day.dateKey}
                  onClick={() => setSelectedDate(day.dateKey)}
                  onDoubleClick={() => openEventModal(day.dateKey)}
                  className={`min-h-28 rounded-2xl border p-3 text-left transition ${
                    isSelected
                      ? "border-emerald-400/60 bg-emerald-400/10"
                      : "border-white/10 bg-black/40 hover:bg-white/[0.05]"
                  } ${day.isCurrentMonth ? "opacity-100" : "opacity-35"}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                        isToday
                          ? "bg-white text-black"
                          : isSelected
                          ? "text-emerald-300"
                          : "text-white/70"
                      }`}
                    >
                      {getDayNumber(day.dateKey)}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/50">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => {
                      const styles = categoryStyles[event.category];

                      return (
                        <div
                          key={event.id}
                          className="flex items-center gap-1 truncate text-[11px] text-white/60"
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${styles.dot}`}
                          />
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}

                    {dayEvents.length > 3 && (
                      <p className="text-[11px] text-white/35">
                        +{dayEvents.length - 3} más
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-white/35">
            Tip: doble click en un día para crear un evento rápido.
          </p>
        </div>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Día seleccionado</p>
                <h2 className="mt-1 text-2xl font-bold">{selectedDate}</h2>
              </div>

              <button
                onClick={() => openEventModal(selectedDate)}
                className="rounded-2xl bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-white/90"
              >
                + Evento
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-5 text-center">
                <p className="text-sm font-semibold text-white">
                  No hay eventos este día.
                </p>
                <p className="mt-2 text-xs text-white/40">
                  Agrega uno para organizar tu día.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => {
                  const styles = categoryStyles[event.category];

                  return (
                    <article
                      key={event.id}
                      className={`rounded-2xl border ${styles.border} ${styles.bg} p-4`}
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <p className={`text-xs font-bold ${styles.text}`}>
                            {event.category}
                          </p>
                          <h3 className="mt-1 font-bold text-white">
                            {event.title}
                          </h3>
                        </div>

                        <button
                          onClick={() => deleteEvent(event.id)}
                          className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-red-400/40 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-sm text-white/50">
                        {event.time || "Sin hora"}
                      </p>

                      {event.note && (
                        <p className="mt-2 text-sm text-white/40">
                          {event.note}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
            <div className="mb-6">
              <p className="text-sm text-white/40">Próximos eventos</p>
              <h2 className="mt-1 text-2xl font-bold">Agenda</h2>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-5 text-center">
                <p className="text-sm font-semibold text-white">
                  No hay próximos eventos.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const styles = categoryStyles[event.category];

                  return (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedDate(event.date);
                        setCurrentMonthDate(createDateFromString(event.date));
                      }}
                      className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 text-left transition hover:bg-white/[0.05]"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="font-bold text-white">{event.title}</p>
                        <span className={`text-xs font-bold ${styles.text}`}>
                          {event.category}
                        </span>
                      </div>

                      <p className="text-xs text-white/40">
                        {event.date} {event.time && `· ${event.time}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </aside>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6">
          <p className="text-sm text-white/40">Resumen del mes</p>
          <h2 className="mt-1 text-2xl font-bold">Eventos por categoría</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {categoryCounts.map(({ category, total }) => {
            const styles = categoryStyles[category];

            return (
              <article
                key={category}
                className={`rounded-2xl border ${styles.border} ${styles.bg} p-4`}
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                  <p className={`text-sm font-bold ${styles.text}`}>
                    {category}
                  </p>
                </div>

                <p className="text-2xl font-bold text-white">{total}</p>
                <p className="mt-2 text-xs text-white/40">
                  eventos este mes
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {eventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateEvent}
            className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Calendario</p>
                <h2 className="mt-1 text-2xl font-bold">Nuevo evento</h2>
                <p className="mt-2 text-sm text-white/40">
                  Agrega algo importante a tu calendario personal.
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

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Título</span>
                <input
                  value={eventForm.title}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Ej: examen, pago Apex, revisión journal..."
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Fecha</span>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Hora</span>
                <input
                  type="time"
                  value={eventForm.time}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      time: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Categoría</span>
                <select
                  value={eventForm.category}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      category: event.target.value as CalendarCategory,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Nota</span>
                <input
                  value={eventForm.note}
                  onChange={(event) =>
                    setEventForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Ej: preparar tarea, revisar cuenta, hacer seguimiento..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
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
    </div>
  );
}