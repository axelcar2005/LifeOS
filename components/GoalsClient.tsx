"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  GraduationCap,
  HeartPulse,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  User,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

type GoalCategory = "Trading" | "Finanzas" | "Salud" | "Estudios" | "Personal";

type GoalStatus = "No iniciado" | "En progreso" | "Completado" | "Pausado";

type GoalPriority = "Baja" | "Media" | "Alta";

type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  deadline: string;
  progress: string;
  status: GoalStatus;
  priority: GoalPriority;
  note: string;
};

type GoalForm = {
  title: string;
  category: GoalCategory;
  deadline: string;
  progress: string;
  status: GoalStatus;
  priority: GoalPriority;
  note: string;
};

const goalsStorageKey = "lifeos-goals";

const categories: GoalCategory[] = [
  "Trading",
  "Finanzas",
  "Salud",
  "Estudios",
  "Personal",
];

const categoryStyles: Record<
  GoalCategory,
  {
    icon: LucideIcon;
    dot: string;
    text: string;
    bg: string;
    border: string;
  }
> = {
  Trading: {
    icon: TrendingUp,
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  Finanzas: {
    icon: Wallet,
    dot: "bg-blue-300",
    text: "text-blue-300",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  Salud: {
    icon: HeartPulse,
    dot: "bg-rose-300",
    text: "text-rose-300",
    bg: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
  Estudios: {
    icon: GraduationCap,
    dot: "bg-yellow-300",
    text: "text-yellow-300",
    bg: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  Personal: {
    icon: User,
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

function getFutureDate(daysToAdd: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseProgress(value: string | undefined) {
  const numberValue = Number(value || 0);

  if (!Number.isFinite(numberValue)) return 0;

  return Math.min(Math.max(numberValue, 0), 100);
}

function createInitialForm(): GoalForm {
  return {
    title: "",
    category: "Personal",
    deadline: getFutureDate(30),
    progress: "0",
    status: "No iniciado",
    priority: "Media",
    note: "",
  };
}

function sortGoals(goals: Goal[]) {
  return [...goals].sort((goalA, goalB) => {
    if (goalA.status === "Completado" && goalB.status !== "Completado") {
      return 1;
    }

    if (goalA.status !== "Completado" && goalB.status === "Completado") {
      return -1;
    }

    return goalA.deadline.localeCompare(goalB.deadline);
  });
}

function getDaysLeft(deadline: string) {
  const today = new Date(getTodayDate()).getTime();
  const target = new Date(deadline).getTime();
  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return Math.ceil((target - today) / millisecondsPerDay);
}

function getStatusClass(status: GoalStatus) {
  if (status === "Completado") {
    return "bg-emerald-400/10 text-emerald-300";
  }

  if (status === "En progreso") {
    return "bg-blue-400/10 text-blue-300";
  }

  if (status === "Pausado") {
    return "bg-yellow-400/10 text-yellow-300";
  }

  return "bg-white/10 text-white/50";
}

function getPriorityClass(priority: GoalPriority) {
  if (priority === "Alta") {
    return "bg-red-400/10 text-red-300";
  }

  if (priority === "Media") {
    return "bg-yellow-400/10 text-yellow-300";
  }

  return "bg-white/10 text-white/50";
}

export function GoalsClient() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState<GoalForm>(createInitialForm);

  useEffect(() => {
    const savedGoals = localStorage.getItem(goalsStorageKey);

    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals) as Goal[];

      if (Array.isArray(parsedGoals)) {
        setGoals(parsedGoals);
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(goalsStorageKey, JSON.stringify(goals));
  }, [goals, loaded]);

  const sortedGoals = useMemo(() => sortGoals(goals), [goals]);

  const activeGoals = goals.filter((goal) => goal.status !== "Completado");
  const completedGoals = goals.filter((goal) => goal.status === "Completado");
  const highPriorityGoals = activeGoals.filter((goal) => goal.priority === "Alta");

  const averageProgress =
    goals.length > 0
      ? goals.reduce((total, goal) => total + parseProgress(goal.progress), 0) /
        goals.length
      : 0;

  const closeDeadlines = activeGoals.filter((goal) => {
    const daysLeft = getDaysLeft(goal.deadline);

    return daysLeft >= 0 && daysLeft <= 7;
  });

  const categoryCounts = categories.map((category) => ({
    category,
    total: goals.filter((goal) => goal.category === category).length,
    completed: goals.filter(
      (goal) => goal.category === category && goal.status === "Completado"
    ).length,
  }));

  function handleCreateGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!goalForm.title.trim()) return;

    const progress = parseProgress(goalForm.progress);
    const status =
      progress >= 100 ? "Completado" : goalForm.status;

    const newGoal: Goal = {
      id: `${Date.now()}-${Math.random()}`,
      title: goalForm.title.trim(),
      category: goalForm.category,
      deadline: goalForm.deadline,
      progress: String(progress),
      status,
      priority: goalForm.priority,
      note: goalForm.note.trim(),
    };

    setGoals((currentGoals) => sortGoals([newGoal, ...currentGoals]));
    setGoalForm(createInitialForm());
    setGoalModalOpen(false);
  }

  function deleteGoal(goalId: string) {
    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== goalId)
    );
  }

  function updateGoalProgress(goalId: string, amount: number) {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== goalId) return goal;

        const newProgress = parseProgress(String(parseProgress(goal.progress) + amount));

        return {
          ...goal,
          progress: String(newProgress),
          status:
            newProgress >= 100
              ? "Completado"
              : goal.status === "Completado"
              ? "En progreso"
              : goal.status,
        };
      })
    );
  }

  function completeGoal(goalId: string) {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== goalId) return goal;

        return {
          ...goal,
          progress: "100",
          status: "Completado",
        };
      })
    );
  }

  function togglePauseGoal(goalId: string) {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== goalId) return goal;

        return {
          ...goal,
          status: goal.status === "Pausado" ? "En progreso" : "Pausado",
        };
      })
    );
  }

  const summaryCards = [
    {
      title: "Objetivos activos",
      value: activeGoals.length,
      description: "Metas que todavía estás trabajando.",
      icon: Target,
      color: "text-emerald-400",
    },
    {
      title: "Completados",
      value: completedGoals.length,
      description: "Objetivos que ya terminaste.",
      icon: CheckCircle2,
      color: "text-blue-300",
    },
    {
      title: "Progreso promedio",
      value: `${averageProgress.toFixed(0)}%`,
      description: "Promedio general de todos tus objetivos.",
      icon: Clock3,
      color: "text-yellow-300",
    },
    {
      title: "Urgentes",
      value: closeDeadlines.length,
      description: "Objetivos con fecha límite en 7 días.",
      icon: AlertTriangle,
      color: "text-red-300",
    },
  ];

  return (
    <div>
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Módulo Objetivos
          </div>

          <p className="text-sm text-white/40">Dirección personal</p>

          <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Objetivos
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Define tus metas de trading, finanzas, salud, estudios y vida
            personal. Controla progreso, prioridad y fecha límite.
          </p>
        </div>

        <button
          onClick={() => {
            setGoalForm(createInitialForm());
            setGoalModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo objetivo
        </button>
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
        <div className="mb-6">
          <p className="text-sm text-white/40">Resumen por áreas</p>
          <h2 className="mt-1 text-2xl font-bold">Categorías</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {categoryCounts.map(({ category, total, completed }) => {
            const styles = categoryStyles[category];
            const Icon = styles.icon;

            return (
              <article
                key={category}
                className={`rounded-2xl border ${styles.border} ${styles.bg} p-4`}
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${styles.dot}`} />
                    <p className={`text-sm font-bold ${styles.text}`}>
                      {category}
                    </p>
                  </div>

                  <Icon className={`h-4 w-4 ${styles.text}`} />
                </div>

                <p className="text-2xl font-bold text-white">{total}</p>
                <p className="mt-2 text-xs text-white/40">
                  {completed} completados
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Lista principal</p>
            <h2 className="mt-1 text-2xl font-bold">Mis objetivos</h2>
            <p className="mt-2 text-sm text-white/40">
              Usa los botones rápidos para subir progreso, pausar o completar.
            </p>
          </div>

          <p className="text-sm text-white/40">{goals.length} objetivos</p>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
            <p className="text-sm font-semibold text-white">
              Todavía no tienes objetivos.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Crea tu primer objetivo para empezar a medir tu progreso.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {sortedGoals.map((goal) => {
              const styles = categoryStyles[goal.category];
              const progress = parseProgress(goal.progress);
              const daysLeft = getDaysLeft(goal.deadline);
              const isExpired =
                daysLeft < 0 && goal.status !== "Completado";

              return (
                <article
                  key={goal.id}
                  className={`rounded-3xl border ${styles.border} bg-black/40 p-5`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border ${styles.border} ${styles.bg} px-3 py-1 text-xs font-bold ${styles.text}`}
                        >
                          {goal.category}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                            goal.status
                          )}`}
                        >
                          {goal.status}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${getPriorityClass(
                            goal.priority
                          )}`}
                        >
                          {goal.priority}
                        </span>
                      </div>

                      <h3
                        className={`text-xl font-bold ${
                          goal.status === "Completado"
                            ? "text-white/40 line-through"
                            : "text-white"
                        }`}
                      >
                        {goal.title}
                      </h3>

                      <p
                        className={`mt-2 text-sm ${
                          isExpired ? "text-red-300" : "text-white/40"
                        }`}
                      >
                        {goal.status === "Completado"
                          ? "Objetivo completado."
                          : isExpired
                          ? `Venció hace ${Math.abs(daysLeft)} días.`
                          : daysLeft === 0
                          ? "Vence hoy."
                          : `Faltan ${daysLeft} días.`}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-red-400/40 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                      <span>Progreso</span>
                      <span>{progress.toFixed(0)}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {goal.note && (
                    <p className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/50">
                      {goal.note}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, -10)}
                      className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
                    >
                      -10%
                    </button>

                    <button
                      onClick={() => updateGoalProgress(goal.id, 10)}
                      className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
                    >
                      +10%
                    </button>

                    <button
                      onClick={() => togglePauseGoal(goal.id)}
                      className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
                    >
                      {goal.status === "Pausado" ? "Reanudar" : "Pausar"}
                    </button>

                    <button
                      onClick={() => completeGoal(goal.id)}
                      className="rounded-2xl bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-white/90"
                    >
                      Completar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {highPriorityGoals.length > 0 && (
        <section className="mt-6 rounded-3xl border border-red-400/20 bg-red-400/5 p-6">
          <div className="mb-6">
            <p className="text-sm text-red-300/70">Atención</p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              Objetivos de prioridad alta
            </h2>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {highPriorityGoals.slice(0, 4).map((goal) => (
              <article
                key={goal.id}
                className="rounded-2xl border border-red-400/20 bg-black/40 p-4"
              >
                <p className="text-sm font-bold text-white">{goal.title}</p>
                <p className="mt-2 text-xs text-white/40">
                  {goal.category} · vence {goal.deadline}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleCreateGoal}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Objetivos</p>
                <h2 className="mt-1 text-2xl font-bold">Nuevo objetivo</h2>
                <p className="mt-2 text-sm text-white/40">
                  Define una meta clara, una fecha límite y un progreso inicial.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Título</span>
                <input
                  value={goalForm.title}
                  onChange={(event) =>
                    setGoalForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Ej: pasar 3 cuentas, bajar a 190 lb, ahorrar $1000..."
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Categoría</span>
                <select
                  value={goalForm.category}
                  onChange={(event) =>
                    setGoalForm((current) => ({
                      ...current,
                      category: event.target.value as GoalCategory,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {categories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Fecha límite</span>
                <input
                  type="date"
                  value={goalForm.deadline}
                  onChange={(event) =>
                    setGoalForm((current) => ({
                      ...current,
                      deadline: event.target.value,
                    }))
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Progreso inicial</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={goalForm.progress}
                  onChange={(event) =>
                    setGoalForm((current) => ({
                      ...current,
                      progress: event.target.value,
                    }))
                  }
                  placeholder="Ej: 25"
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Estado</span>
                <select
                  value={goalForm.status}
                  onChange={(event) =>
                    setGoalForm((current) => ({
                      ...current,
                      status: event.target.value as GoalStatus,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>No iniciado</option>
                  <option>En progreso</option>
                  <option>Completado</option>
                  <option>Pausado</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Prioridad</span>
                <select
                  value={goalForm.priority}
                  onChange={(event) =>
                    setGoalForm((current) => ({
                      ...current,
                      priority: event.target.value as GoalPriority,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Baja</option>
                  <option>Media</option>
                  <option>Alta</option>
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Nota</span>
                <input
                  value={goalForm.note}
                  onChange={(event) =>
                    setGoalForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Ej: por qué es importante, plan, regla o recordatorio..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setGoalModalOpen(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Guardar objetivo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}