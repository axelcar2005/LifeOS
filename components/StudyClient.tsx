"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react";

type StudySubject = {
  id: string;
  name: string;
  description: string;
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

const subjectsStorageKey = "lifeos-study-subjects";
const sessionsStorageKey = "lifeos-study-sessions";
const tasksStorageKey = "lifeos-study-tasks";

const defaultSubjects: StudySubject[] = [
  {
    id: "lenguaje",
    name: "Lenguaje",
    description: "Universidad, escritura, tareas y lecturas.",
  },
  {
    id: "trading",
    name: "Trading / ICT",
    description: "Backtesting, estrategia, psicología y journal.",
  },
  {
    id: "ingles",
    name: "Inglés",
    description: "Vocabulario, escucha, lectura y práctica.",
  },
];

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

function formatHours(minutes: number) {
  const hours = minutes / 60;

  if (hours < 1) {
    return `${minutes.toFixed(0)} min`;
  }

  return `${hours.toFixed(1)} h`;
}

function getSubjectName(subjects: StudySubject[], subjectId: string) {
  return subjects.find((subject) => subject.id === subjectId)?.name ?? "Sin materia";
}

function getFocusScore(focus: string) {
  if (focus === "Bajo") return 1;
  if (focus === "Medio") return 2;
  if (focus === "Alto") return 3;
  return 0;
}

function getFocusLabel(score: number | null) {
  if (score === null) return "—";
  if (score < 1.5) return "Bajo";
  if (score < 2.5) return "Medio";
  return "Alto";
}

function getMostStudiedSubject(
  subjects: StudySubject[],
  sessions: StudySession[]
) {
  const totals = sessions.reduce<Record<string, number>>((acc, session) => {
    acc[session.subjectId] =
      (acc[session.subjectId] || 0) + parseAmount(session.minutes);

    return acc;
  }, {});

  const sortedSubjects = Object.entries(totals).sort(
    ([, minutesA], [, minutesB]) => minutesB - minutesA
  );

  const topSubjectId = sortedSubjects[0]?.[0];

  if (!topSubjectId) return "—";

  return getSubjectName(subjects, topSubjectId);
}

function createInitialSubjectForm() {
  return {
    name: "",
    description: "",
  };
}

function createInitialSessionForm(subjects: StudySubject[]) {
  return {
    date: getTodayDate(),
    subjectId: subjects[0]?.id ?? "",
    minutes: "",
    type: "Repaso",
    focus: "Medio",
    note: "",
  };
}

function createInitialTaskForm(subjects: StudySubject[]) {
  return {
    title: "",
    subjectId: subjects[0]?.id ?? "",
    dueDate: getTodayDate(),
    priority: "Media",
    status: "Pendiente" as StudyTask["status"],
    note: "",
  };
}

export function StudyClient() {
  const [subjects, setSubjects] = useState<StudySubject[]>(defaultSubjects);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const [subjectForm, setSubjectForm] = useState(createInitialSubjectForm);
  const [sessionForm, setSessionForm] = useState(() =>
    createInitialSessionForm(defaultSubjects)
  );
  const [taskForm, setTaskForm] = useState(() =>
    createInitialTaskForm(defaultSubjects)
  );

  useEffect(() => {
    const savedSubjects = localStorage.getItem(subjectsStorageKey);
    const savedSessions = localStorage.getItem(sessionsStorageKey);
    const savedTasks = localStorage.getItem(tasksStorageKey);

    if (savedSubjects) {
      const parsedSubjects = JSON.parse(savedSubjects) as StudySubject[];

      if (Array.isArray(parsedSubjects) && parsedSubjects.length > 0) {
        setSubjects(parsedSubjects);
        setSessionForm(createInitialSessionForm(parsedSubjects));
        setTaskForm(createInitialTaskForm(parsedSubjects));
      }
    }

    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions) as StudySession[];

      if (Array.isArray(parsedSessions)) {
        setSessions(parsedSessions);
      }
    }

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks) as StudyTask[];

      if (Array.isArray(parsedTasks)) {
        setTasks(parsedTasks);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(subjectsStorageKey, JSON.stringify(subjects));
  }, [subjects, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(sessionsStorageKey, JSON.stringify(sessions));
  }, [sessions, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(tasksStorageKey, JSON.stringify(tasks));
  }, [tasks, loaded]);

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [tasks]);

  const currentMonth = getCurrentMonth();

  const monthlySessions = sortedSessions.filter((session) =>
    session.date.startsWith(currentMonth)
  );

  const monthlyTasks = tasks.filter((task) =>
    task.dueDate.startsWith(currentMonth)
  );

  const totalStudyMinutes = monthlySessions.reduce(
    (total, session) => total + parseAmount(session.minutes),
    0
  );

  const pendingTasks = tasks.filter((task) => task.status === "Pendiente");
  const completedTasks = tasks.filter((task) => task.status === "Completada");

  const monthlyCompletedTasks = monthlyTasks.filter(
    (task) => task.status === "Completada"
  );

  const focusScores = monthlySessions
    .map((session) => getFocusScore(session.focus))
    .filter((score) => score > 0);

  const averageFocus =
    focusScores.length > 0
      ? focusScores.reduce((total, score) => total + score, 0) /
        focusScores.length
      : null;

  const mostStudiedSubject = getMostStudiedSubject(subjects, monthlySessions);

  function openSessionModal() {
    setSessionForm(createInitialSessionForm(subjects));
    setSessionModalOpen(true);
  }

  function openTaskModal() {
    setTaskForm(createInitialTaskForm(subjects));
    setTaskModalOpen(true);
  }

  function handleCreateSubject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subjectForm.name.trim()) return;

    const newSubject: StudySubject = {
      id: `${Date.now()}-${Math.random()}`,
      name: subjectForm.name.trim(),
      description: subjectForm.description.trim(),
    };

    setSubjects((currentSubjects) => [newSubject, ...currentSubjects]);
    setSubjectForm(createInitialSubjectForm());
    setSubjectModalOpen(false);
  }

  function handleCreateSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionForm.subjectId) return;

    const newSession: StudySession = {
      id: `${Date.now()}-${Math.random()}`,
      ...sessionForm,
    };

    setSessions((currentSessions) => [newSession, ...currentSessions]);
    setSessionForm(createInitialSessionForm(subjects));
    setSessionModalOpen(false);
  }

  function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!taskForm.title.trim() || !taskForm.subjectId) return;

    const newTask: StudyTask = {
      id: `${Date.now()}-${Math.random()}`,
      ...taskForm,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setTaskForm(createInitialTaskForm(subjects));
    setTaskModalOpen(false);
  }

  function deleteSubject(subjectId: string) {
    setSubjects((currentSubjects) =>
      currentSubjects.filter((subject) => subject.id !== subjectId)
    );

    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.subjectId !== subjectId)
    );

    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.subjectId !== subjectId)
    );
  }

  function deleteSession(sessionId: string) {
    setSessions((currentSessions) =>
      currentSessions.filter((session) => session.id !== sessionId)
    );
  }

  function deleteTask(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
  }

  function toggleTaskStatus(taskId: string) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          status: task.status === "Pendiente" ? "Completada" : "Pendiente",
        };
      })
    );
  }

  const summaryCards = [
    {
      title: "Horas estudiadas",
      value: formatHours(totalStudyMinutes),
      description: "Tiempo registrado este mes.",
      icon: Clock3,
      color: "text-sky-300",
    },
    {
      title: "Tareas pendientes",
      value: pendingTasks.length,
      description: "Tareas que todavía debes completar.",
      icon: ListChecks,
      color: "text-yellow-300",
    },
    {
      title: "Tareas completadas",
      value: completedTasks.length,
      description: "Tareas terminadas en total.",
      icon: CheckCircle2,
      color: "text-emerald-400",
    },
    {
      title: "Enfoque promedio",
      value: getFocusLabel(averageFocus),
      description: "Basado en tus sesiones del mes.",
      icon: Brain,
      color: "text-purple-300",
    },
  ];

  return (
    <div>
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Módulo Estudios
          </div>

          <p className="text-sm text-white/40">Universidad / aprendizaje</p>

          <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Estudios
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Organiza tus materias, registra sesiones de estudio, controla tareas
            y mira tu progreso mensual.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setSubjectModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Nueva materia
          </button>

          <button
            onClick={openTaskModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Nueva tarea
          </button>

          <button
            onClick={openSessionModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Registrar sesión
          </button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
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
            </article>
          );
        })}
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Materias</p>
            <h2 className="mt-1 text-2xl font-bold">Tus áreas de estudio</h2>
            <p className="mt-2 text-sm text-white/40">
              Puedes usar esto para universidad, cursos, trading, inglés o
              cualquier tema que estudies.
            </p>
          </div>

          <p className="text-sm text-white/40">{subjects.length} materias</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject) => {
            const subjectSessions = monthlySessions.filter(
              (session) => session.subjectId === subject.id
            );

            const subjectMinutes = subjectSessions.reduce(
              (total, session) => total + parseAmount(session.minutes),
              0
            );

            const subjectPendingTasks = pendingTasks.filter(
              (task) => task.subjectId === subject.id
            );

            return (
              <article
                key={subject.id}
                className="rounded-3xl border border-white/10 bg-black/40 p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {subject.name}
                    </h3>
                    <p className="mt-1 text-sm text-white/40">
                      {subject.description || "Sin descripción."}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteSubject(subject.id)}
                    className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-red-400/40 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Este mes</p>
                    <p className="mt-2 text-xl font-bold text-sky-300">
                      {formatHours(subjectMinutes)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Pendientes</p>
                    <p className="mt-2 text-xl font-bold text-yellow-300">
                      {subjectPendingTasks.length}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Tareas</p>
            <h2 className="mt-1 text-2xl font-bold">Lista de tareas</h2>
          </div>

          <p className="text-sm text-white/40">
            {pendingTasks.length} pendientes
          </p>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
            <p className="text-sm font-semibold text-white">
              Todavía no tienes tareas.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Crea una tarea para organizar tus pendientes.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {sortedTasks.map((task) => (
              <article
                key={task.id}
                className="rounded-3xl border border-white/10 bg-black/40 p-5"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-lg font-bold ${
                          task.status === "Completada"
                            ? "text-white/40 line-through"
                            : "text-white"
                        }`}
                      >
                        {task.title}
                      </h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          task.status === "Completada"
                            ? "bg-emerald-400/10 text-emerald-300"
                            : "bg-yellow-400/10 text-yellow-300"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-white/40">
                      {getSubjectName(subjects, task.subjectId)} · vence{" "}
                      {task.dueDate}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-red-400/40 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                      Prioridad: {task.priority}
                    </span>

                    {task.note && (
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/50">
                        {task.note}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className="rounded-2xl bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-white/90"
                  >
                    {task.status === "Completada"
                      ? "Marcar pendiente"
                      : "Completar"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Resumen automático</p>
            <h2 className="mt-1 text-2xl font-bold">Resumen del mes</h2>
          </div>

          <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-white/50">
            {currentMonth}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Horas estudiadas</p>
            <p className="mt-2 text-2xl font-bold text-sky-300">
              {formatHours(totalStudyMinutes)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Materia más estudiada</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {mostStudiedSubject}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Tareas completadas</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {monthlyCompletedTasks.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Enfoque promedio</p>
            <p className="mt-2 text-2xl font-bold text-purple-300">
              {getFocusLabel(averageFocus)}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Historial</p>
            <h2 className="mt-1 text-2xl font-bold">Sesiones de estudio</h2>
          </div>

          <p className="text-sm text-white/40">
            {sessions.length} sesiones registradas
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
            <p className="text-sm font-semibold text-white">
              Todavía no tienes sesiones registradas.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Registra una sesión para empezar a medir tu estudio.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.04] text-white/40">
                <tr>
                  <th className="px-4 py-4">Fecha</th>
                  <th className="px-4 py-4">Materia</th>
                  <th className="px-4 py-4">Tiempo</th>
                  <th className="px-4 py-4">Tipo</th>
                  <th className="px-4 py-4">Enfoque</th>
                  <th className="px-4 py-4">Nota</th>
                  <th className="px-4 py-4 text-right">Acción</th>
                </tr>
              </thead>

              <tbody>
                {sortedSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="border-t border-white/10 text-white/70"
                  >
                    <td className="px-4 py-4 font-semibold text-white">
                      {session.date}
                    </td>
                    <td className="px-4 py-4">
                      {getSubjectName(subjects, session.subjectId)}
                    </td>
                    <td className="px-4 py-4">
                      {formatHours(parseAmount(session.minutes))}
                    </td>
                    <td className="px-4 py-4">{session.type}</td>
                    <td className="px-4 py-4">{session.focus}</td>
                    <td className="max-w-xs truncate px-4 py-4 text-white/50">
                      {session.note || "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => deleteSession(session.id)}
                        className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-red-400/40 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {subjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSubject}
            className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Estudios</p>
                <h2 className="mt-1 text-2xl font-bold">Nueva materia</h2>
              </div>

              <button
                type="button"
                onClick={() => setSubjectModalOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4">
              <label className="space-y-2">
                <span className="text-xs text-white/40">Nombre</span>
                <input
                  value={subjectForm.name}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Ej: Matemáticas, Inglés, Trading..."
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Descripción</span>
                <input
                  value={subjectForm.description}
                  onChange={(event) =>
                    setSubjectForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Ej: tareas, lecturas, proyectos..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSubjectModalOpen(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Guardar materia
              </button>
            </div>
          </form>
        </div>
      )}

      {sessionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateSession}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Estudios</p>
                <h2 className="mt-1 text-2xl font-bold">Registrar sesión</h2>
              </div>

              <button
                type="button"
                onClick={() => setSessionModalOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs text-white/40">Fecha</span>
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      date: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Materia</span>
                <select
                  value={sessionForm.subjectId}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      subjectId: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">
                  Tiempo estudiado en minutos
                </span>
                <input
                  type="number"
                  value={sessionForm.minutes}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      minutes: event.target.value,
                    }))
                  }
                  placeholder="Ej: 60"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Tipo</span>
                <select
                  value={sessionForm.type}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Clase</option>
                  <option>Tarea</option>
                  <option>Lectura</option>
                  <option>Repaso</option>
                  <option>Proyecto</option>
                  <option>Backtesting</option>
                  <option>Otro</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Enfoque</span>
                <select
                  value={sessionForm.focus}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      focus: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Bajo</option>
                  <option>Medio</option>
                  <option>Alto</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Nota</span>
                <input
                  value={sessionForm.note}
                  onChange={(event) =>
                    setSessionForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Ej: avancé tarea, repasé, hice backtesting..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setSessionModalOpen(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Guardar sesión
              </button>
            </div>
          </form>
        </div>
      )}

      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTask}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Estudios</p>
                <h2 className="mt-1 text-2xl font-bold">Nueva tarea</h2>
              </div>

              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Título</span>
                <input
                  value={taskForm.title}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Ej: entregar ensayo, estudiar capítulo 2..."
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Materia</span>
                <select
                  value={taskForm.subjectId}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      subjectId: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Fecha límite</span>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      dueDate: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Prioridad</span>
                <select
                  value={taskForm.priority}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      priority: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Estado</span>
                <select
                  value={taskForm.status}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      status: event.target.value as StudyTask["status"],
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Pendiente</option>
                  <option>Completada</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Nota</span>
                <input
                  value={taskForm.note}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Ej: importante para examen, entregar por plataforma..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskModalOpen(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Guardar tarea
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}