"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Flag,
  Link2,
  Pause,
  Pencil,
  Play,
  Plus,
  Target,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

const goalsStorageKey = "lifeos-goals";
const healthLogsStorageKey = "lifeos-health-daily-logs";

const financeGoalStorageKeys = [
  "lifeos-finance-simple-goals-final",
  "lifeos-finance-simple-goals",
  "lifeos-finance-goals",
];

type GoalCategory = "Trading" | "Finanzas" | "Salud" | "Estudios" | "Personal";
type GoalStatus = "No iniciado" | "En progreso" | "Completado" | "Pausado";
type GoalPriority = "Baja" | "Media" | "Alta";

type GoalConnectionType =
  | "Manual"
  | "Meta financiera"
  | "Salud - entrenos"
  | "Salud - agua"
  | "Salud - peso";

type Goal = {
  id: string;
  title: string;
  category: GoalCategory;
  deadline: string;
  progress: number;
  status: GoalStatus;
  priority: GoalPriority;
  note: string;
  connectionType?: GoalConnectionType;
  linkedFinanceGoalId?: string;
  targetNumber?: number;
  startNumber?: number;
};

type FinanceGoal = {
  id?: string;
  title?: string;
  name?: string;
  target?: number | string;
  current?: number | string;
  saved?: number | string;
  progress?: number;
};

type HealthLog = {
  date?: string;
  calories?: number | string;
  weight?: number | string;
  water?: number | string;
  waterLiters?: number | string;
  trained?: boolean | string;
  workoutDone?: boolean | string;
  exercise?: boolean | string;
};

type GoalForm = {
  title: string;
  category: GoalCategory;
  deadline: string;
  progress: string;
  status: GoalStatus;
  priority: GoalPriority;
  note: string;
  connectionType: GoalConnectionType;
  linkedFinanceGoalId: string;
  targetNumber: string;
  startNumber: string;
};

const categories: GoalCategory[] = [
  "Trading",
  "Finanzas",
  "Salud",
  "Estudios",
  "Personal",
];

const statuses: GoalStatus[] = [
  "No iniciado",
  "En progreso",
  "Completado",
  "Pausado",
];

const priorities: GoalPriority[] = ["Baja", "Media", "Alta"];

const connectionTypes: GoalConnectionType[] = [
  "Manual",
  "Meta financiera",
  "Salud - entrenos",
  "Salud - agua",
  "Salud - peso",
];

const defaultForm: GoalForm = {
  title: "",
  category: "Personal",
  deadline: "",
  progress: "0",
  status: "No iniciado",
  priority: "Media",
  note: "",
  connectionType: "Manual",
  linkedFinanceGoalId: "",
  targetNumber: "",
  startNumber: "",
};

const categoryStyles: Record<
  GoalCategory,
  {
    badge: string;
    border: string;
    icon: typeof Target;
  }
> = {
  Trading: {
    badge: "bg-emerald-400/10 text-emerald-300",
    border: "border-emerald-400/20",
    icon: Target,
  },
  Finanzas: {
    badge: "bg-green-400/10 text-green-300",
    border: "border-green-400/20",
    icon: Wallet,
  },
  Salud: {
    badge: "bg-red-400/10 text-red-300",
    border: "border-red-400/20",
    icon: Dumbbell,
  },
  Estudios: {
    badge: "bg-blue-400/10 text-blue-300",
    border: "border-blue-400/20",
    icon: CalendarDays,
  },
  Personal: {
    badge: "bg-purple-400/10 text-purple-300",
    border: "border-purple-400/20",
    icon: Flag,
  },
};

const priorityStyles: Record<GoalPriority, string> = {
  Baja: "bg-white/10 text-white/50",
  Media: "bg-yellow-400/10 text-yellow-300",
  Alta: "bg-red-400/10 text-red-300",
};

const statusStyles: Record<GoalStatus, string> = {
  "No iniciado": "bg-white/10 text-white/50",
  "En progreso": "bg-blue-400/10 text-blue-300",
  Completado: "bg-emerald-400/10 text-emerald-300",
  Pausado: "bg-orange-400/10 text-orange-300",
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

function createGoalId() {
  return `goal-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getTodayKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonthKey() {
  return getTodayKey().slice(0, 7);
}

function getNumber(value: unknown) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getFinanceGoalId(goal: FinanceGoal, index: number) {
  return goal.id || goal.title || goal.name || `finance-goal-${index}`;
}

function getFinanceGoalTitle(goal: FinanceGoal) {
  return goal.title || goal.name || "Meta financiera";
}

function getFinanceGoalCurrent(goal: FinanceGoal) {
  return getNumber(goal.current ?? goal.saved ?? 0);
}

function getFinanceGoalTarget(goal: FinanceGoal) {
  return getNumber(goal.target ?? 0);
}

function getFinanceGoalProgress(goal: FinanceGoal) {
  if (typeof goal.progress === "number") return clampProgress(goal.progress);

  const current = getFinanceGoalCurrent(goal);
  const target = getFinanceGoalTarget(goal);

  if (target <= 0) return 0;

  return clampProgress((current / target) * 100);
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

function getLatestWeight(healthLogs: HealthLog[]) {
  const logsWithWeight = healthLogs
    .filter((log) => log.date && getNumber(log.weight) > 0)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return logsWithWeight.length > 0 ? getNumber(logsWithWeight[0].weight) : 0;
}

function getDaysUntil(date: string) {
  if (!date) return null;

  const today = new Date(`${getTodayKey()}T00:00:00`);
  const deadline = new Date(`${date}T00:00:00`);
  const difference = deadline.getTime() - today.getTime();

  return Math.ceil(difference / (1000 * 60 * 60 * 24));
}

function getAutomaticStatus(goal: Goal, progress: number): GoalStatus {
  if (goal.status === "Pausado") return "Pausado";
  if (progress >= 100) return "Completado";
  if (progress > 0) return "En progreso";

  return goal.status || "No iniciado";
}

export function GoalsClient() {
  const [loaded, setLoaded] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [financeGoals, setFinanceGoals] = useState<FinanceGoal[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState<GoalForm>(defaultForm);

  useEffect(() => {
    const savedGoals = safeParseArray<Goal>(
      localStorage.getItem(goalsStorageKey)
    );

    const normalizedGoals = savedGoals.map((goal) => ({
      ...goal,
      connectionType: goal.connectionType || "Manual",
    }));

    setGoals(normalizedGoals);

    const loadedFinanceGoals = financeGoalStorageKeys.flatMap((key) =>
      safeParseArray<FinanceGoal>(localStorage.getItem(key))
    );

    const financeGoalsMap = new Map<string, FinanceGoal>();

    loadedFinanceGoals.forEach((goal, index) => {
      financeGoalsMap.set(getFinanceGoalId(goal, index), goal);
    });

    setFinanceGoals(Array.from(financeGoalsMap.values()));

    setHealthLogs(
      safeParseArray<HealthLog>(localStorage.getItem(healthLogsStorageKey))
    );

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(goalsStorageKey, JSON.stringify(goals));
  }, [goals, loaded]);

  const currentMonthKey = getCurrentMonthKey();

  const monthHealthLogs = healthLogs.filter((log) =>
    String(log.date || "").startsWith(currentMonthKey)
  );

  const trainedDays = monthHealthLogs.filter(
    (log) =>
      isTrainingValue(log.trained) ||
      isTrainingValue(log.workoutDone) ||
      isTrainingValue(log.exercise)
  ).length;

  const averageWater =
    monthHealthLogs.length > 0
      ? monthHealthLogs.reduce(
          (total, log) => total + getNumber(log.water ?? log.waterLiters),
          0
        ) / monthHealthLogs.length
      : 0;

  const latestWeight = getLatestWeight(healthLogs);

  const financeGoalOptions = financeGoals.map((goal, index) => ({
    id: getFinanceGoalId(goal, index),
    title: getFinanceGoalTitle(goal),
    current: getFinanceGoalCurrent(goal),
    target: getFinanceGoalTarget(goal),
    progress: getFinanceGoalProgress(goal),
  }));

  function getConnectedProgress(goal: Goal) {
    if (!goal.connectionType || goal.connectionType === "Manual") {
      return clampProgress(goal.status === "Completado" ? 100 : goal.progress);
    }

    if (goal.connectionType === "Meta financiera") {
      const linkedGoal = financeGoalOptions.find(
        (financeGoal) => financeGoal.id === goal.linkedFinanceGoalId
      );

      if (!linkedGoal) return clampProgress(goal.progress);

      return linkedGoal.progress;
    }

    if (goal.connectionType === "Salud - entrenos") {
      const targetDays = getNumber(goal.targetNumber);

      if (targetDays <= 0) return clampProgress(goal.progress);

      return clampProgress((trainedDays / targetDays) * 100);
    }

    if (goal.connectionType === "Salud - agua") {
      const targetWater = getNumber(goal.targetNumber);

      if (targetWater <= 0) return clampProgress(goal.progress);

      return clampProgress((averageWater / targetWater) * 100);
    }

    if (goal.connectionType === "Salud - peso") {
      const startWeight = getNumber(goal.startNumber);
      const targetWeight = getNumber(goal.targetNumber);
      const currentWeight = latestWeight;

      if (startWeight <= 0 || targetWeight <= 0 || currentWeight <= 0) {
        return clampProgress(goal.progress);
      }

      if (startWeight === targetWeight) return 100;

      const progress =
        startWeight > targetWeight
          ? ((startWeight - currentWeight) / (startWeight - targetWeight)) * 100
          : ((currentWeight - startWeight) / (targetWeight - startWeight)) * 100;

      return clampProgress(progress);
    }

    return clampProgress(goal.progress);
  }

  const displayedGoals = useMemo(() => {
    return goals.map((goal) => {
      const progress = getConnectedProgress(goal);
      const status = getAutomaticStatus(goal, progress);

      return {
        ...goal,
        progress,
        status,
      };
    });
  }, [goals, financeGoalOptions, trainedDays, averageWater, latestWeight]);

  const activeGoals = displayedGoals.filter(
    (goal) => goal.status !== "Completado"
  );

  const completedGoals = displayedGoals.filter(
    (goal) => goal.status === "Completado"
  );

  const averageProgress =
    displayedGoals.length > 0
      ? Math.round(
          displayedGoals.reduce((total, goal) => total + goal.progress, 0) /
            displayedGoals.length
        )
      : 0;

  const urgentGoals = displayedGoals.filter((goal) => {
    const daysUntil = getDaysUntil(goal.deadline);

    return (
      goal.status !== "Completado" &&
      daysUntil !== null &&
      daysUntil >= 0 &&
      daysUntil <= 7
    );
  });

  const highPriorityGoals = displayedGoals.filter(
    (goal) => goal.priority === "Alta" && goal.status !== "Completado"
  );

  const connectedGoals = displayedGoals.filter(
    (goal) => goal.connectionType && goal.connectionType !== "Manual"
  );

  const goalsByCategory = categories.map((category) => ({
    category,
    total: displayedGoals.filter((goal) => goal.category === category).length,
    completed: displayedGoals.filter(
      (goal) => goal.category === category && goal.status === "Completado"
    ).length,
  }));

  function openCreateModal() {
    setEditingGoal(null);
    setForm(defaultForm);
    setModalOpen(true);
  }

  function openEditModal(goal: Goal) {
    setEditingGoal(goal);

    setForm({
      title: goal.title,
      category: goal.category,
      deadline: goal.deadline,
      progress: String(goal.progress ?? 0),
      status: goal.status,
      priority: goal.priority,
      note: goal.note,
      connectionType: goal.connectionType || "Manual",
      linkedFinanceGoalId: goal.linkedFinanceGoalId || "",
      targetNumber:
        goal.targetNumber !== undefined ? String(goal.targetNumber) : "",
      startNumber: goal.startNumber !== undefined ? String(goal.startNumber) : "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingGoal(null);
    setForm(defaultForm);
  }

  function saveGoal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) return;

    const progress = clampProgress(Number(form.progress || 0));

    const goalToSave: Goal = {
      id: editingGoal?.id || createGoalId(),
      title: form.title.trim(),
      category: form.category,
      deadline: form.deadline,
      progress,
      status: form.status,
      priority: form.priority,
      note: form.note.trim(),
      connectionType: form.connectionType,
      linkedFinanceGoalId:
        form.connectionType === "Meta financiera"
          ? form.linkedFinanceGoalId
          : "",
      targetNumber: form.targetNumber ? Number(form.targetNumber) : undefined,
      startNumber: form.startNumber ? Number(form.startNumber) : undefined,
    };

    setGoals((currentGoals) => {
      if (!editingGoal) return [goalToSave, ...currentGoals];

      return currentGoals.map((goal) =>
        goal.id === editingGoal.id ? goalToSave : goal
      );
    });

    closeModal();
  }

  function deleteGoal(goalId: string) {
    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== goalId)
    );
  }

  function updateManualProgress(goalId: string, amount: number) {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== goalId) return goal;
        if (goal.connectionType && goal.connectionType !== "Manual") return goal;

        const newProgress = clampProgress(goal.progress + amount);

        return {
          ...goal,
          progress: newProgress,
          status:
            newProgress >= 100
              ? "Completado"
              : newProgress > 0
              ? "En progreso"
              : "No iniciado",
        };
      })
    );
  }

  function completeGoal(goalId: string) {
    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === goalId
          ? {
              ...goal,
              progress: 100,
              status: "Completado",
            }
          : goal
      )
    );
  }

  function togglePauseGoal(goalId: string) {
    setGoals((currentGoals) =>
      currentGoals.map((goal) => {
        if (goal.id !== goalId) return goal;

        if (goal.status === "Pausado") {
          return {
            ...goal,
            status: goal.progress > 0 ? "En progreso" : "No iniciado",
          };
        }

        return {
          ...goal,
          status: "Pausado",
        };
      })
    );
  }

  function getConnectionDescription(goal: Goal) {
    if (!goal.connectionType || goal.connectionType === "Manual") {
      return "Progreso manual";
    }

    if (goal.connectionType === "Meta financiera") {
      const linkedGoal = financeGoalOptions.find(
        (financeGoal) => financeGoal.id === goal.linkedFinanceGoalId
      );

      if (!linkedGoal) return "Meta financiera no encontrada";

      return `$${linkedGoal.current} / $${linkedGoal.target}`;
    }

    if (goal.connectionType === "Salud - entrenos") {
      return `${trainedDays} / ${goal.targetNumber || 0} entrenos este mes`;
    }

    if (goal.connectionType === "Salud - agua") {
      return `${averageWater.toFixed(1)}L promedio / ${
        goal.targetNumber || 0
      }L meta`;
    }

    if (goal.connectionType === "Salud - peso") {
      return `Actual: ${latestWeight || "—"} · Meta: ${
        goal.targetNumber || "—"
      }`;
    }

    return "Conectado";
  }

  function renderGoalCard(goal: Goal) {
    const style = categoryStyles[goal.category];
    const Icon = style.icon;
    const daysUntil = getDaysUntil(goal.deadline);
    const isConnected = goal.connectionType && goal.connectionType !== "Manual";
    const isManual = !isConnected;

    return (
      <div
        key={goal.id}
        className={`rounded-3xl border ${style.border} bg-white/[0.035] p-5`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Icon className="h-5 w-5 text-white/70" />
            </div>

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs ${style.badge}`}>
                  {goal.category}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${priorityStyles[goal.priority]}`}
                >
                  {goal.priority}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs ${statusStyles[goal.status]}`}
                >
                  {goal.status}
                </span>

                {isConnected && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs text-white/50">
                    <Link2 size={12} />
                    Conectado
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-white">{goal.title}</h3>

              {goal.deadline && (
                <p className="mt-1 text-xs text-white/40">
                  Fecha límite: {goal.deadline}
                  {daysUntil !== null && daysUntil >= 0
                    ? ` · faltan ${daysUntil} días`
                    : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(goal)}
              className="rounded-xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              title="Editar objetivo"
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={() => deleteGoal(goal.id)}
              className="rounded-xl bg-red-400/10 p-2 text-red-400 transition hover:bg-red-400/20"
              title="Borrar objetivo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white/40">
              {getConnectionDescription(goal)}
            </span>
            <span className="font-bold text-white">{goal.progress}%</span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full ${
                goal.progress >= 100
                  ? "bg-emerald-400"
                  : goal.progress >= 50
                  ? "bg-blue-400"
                  : "bg-orange-400"
              }`}
              style={{ width: `${goal.progress}%` }}
            />
          </div>
        </div>

        {goal.note && (
          <p className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/50">
            {goal.note}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          {isManual && (
            <>
              <button
                onClick={() => updateManualProgress(goal.id, -10)}
                className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                -10%
              </button>

              <button
                onClick={() => updateManualProgress(goal.id, 10)}
                className="rounded-2xl border border-white/10 px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                +10%
              </button>
            </>
          )}

          <button
            onClick={() => togglePauseGoal(goal.id)}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-xs font-bold text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            {goal.status === "Pausado" ? <Play size={14} /> : <Pause size={14} />}
            {goal.status === "Pausado" ? "Reanudar" : "Pausar"}
          </button>

          <button
            onClick={() => completeGoal(goal.id)}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2 text-xs font-bold text-black transition hover:bg-emerald-300"
          >
            <CheckCircle2 size={14} />
            Completar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Objetivos conectados
          </div>

          <p className="text-sm text-white/40">Dirección y progreso</p>

          <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Objetivos
          </h2>

          <p className="mt-4 max-w-2xl text-white/50">
            Crea objetivos manuales o conéctalos con tus metas financieras y
            registros de salud para actualizar el progreso automáticamente.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex w-fit items-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
        >
          <Plus size={18} />
          Nuevo objetivo
        </button>
      </header>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <p className="text-sm text-white/40">Objetivos activos</p>
          <h3 className="mt-2 text-3xl font-bold">{activeGoals.length}</h3>
          <p className="mt-2 text-sm text-white/35">Pendientes o pausados</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <p className="text-sm text-white/40">Completados</p>
          <h3 className="mt-2 text-3xl font-bold text-emerald-400">
            {completedGoals.length}
          </h3>
          <p className="mt-2 text-sm text-white/35">Objetivos al 100%</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <p className="text-sm text-white/40">Progreso promedio</p>
          <h3 className="mt-2 text-3xl font-bold text-blue-300">
            {averageProgress}%
          </h3>
          <p className="mt-2 text-sm text-white/35">Promedio general</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <p className="text-sm text-white/40">Urgentes</p>
          <h3 className="mt-2 text-3xl font-bold text-orange-300">
            {urgentGoals.length}
          </h3>
          <p className="mt-2 text-sm text-white/35">Vencen en 7 días</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {displayedGoals.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-10 text-center">
              <Target className="mx-auto h-10 w-10 text-white/20" />
              <h3 className="mt-4 text-xl font-bold">Sin objetivos todavía</h3>
              <p className="mt-2 text-sm text-white/40">
                Crea tu primer objetivo para empezar a medir progreso.
              </p>
            </div>
          ) : (
            displayedGoals.map(renderGoalCard)
          )}
        </section>

        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-sm text-white/40">Resumen</p>
            <h3 className="mt-1 text-xl font-bold">Por categoría</h3>

            <div className="mt-5 space-y-3">
              {goalsByCategory.map((item) => {
                const style = categoryStyles[item.category];

                return (
                  <div
                    key={item.category}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-full px-3 py-1 text-xs ${style.badge}`}>
                        {item.category}
                      </span>

                      <span className="text-sm font-bold text-white">
                        {item.completed}/{item.total}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-sm text-white/40">Atención</p>
            <h3 className="mt-1 text-xl font-bold">Alta prioridad</h3>

            <div className="mt-5 space-y-3">
              {highPriorityGoals.length === 0 ? (
                <p className="text-sm text-white/40">
                  No tienes objetivos de alta prioridad pendientes.
                </p>
              ) : (
                highPriorityGoals.slice(0, 5).map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4"
                  >
                    <p className="font-bold text-white">{goal.title}</p>
                    <p className="mt-1 text-xs text-white/40">
                      {goal.deadline || "Sin fecha"} · {goal.progress}%
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-sm text-white/40">Conexiones</p>
            <h3 className="mt-1 text-xl font-bold">Objetivos automáticos</h3>

            <div className="mt-5 space-y-3">
              {connectedGoals.length === 0 ? (
                <p className="text-sm text-white/40">
                  Todavía no conectaste objetivos con finanzas o salud.
                </p>
              ) : (
                connectedGoals.slice(0, 5).map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-2xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Link2 size={14} className="text-emerald-400" />
                      <p className="font-bold text-white">{goal.title}</p>
                    </div>

                    <p className="mt-1 text-xs text-white/40">
                      {goal.connectionType} · {goal.progress}%
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-sm text-white/40">Datos salud</p>
            <h3 className="mt-1 text-xl font-bold">Este mes</h3>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
                <span className="text-white/40">Entrenos</span>
                <span className="font-bold text-white">{trainedDays}</span>
              </div>

              <div className="flex justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
                <span className="text-white/40">Agua promedio</span>
                <span className="font-bold text-white">
                  {averageWater.toFixed(1)}L
                </span>
              </div>

              <div className="flex justify-between rounded-2xl border border-white/10 bg-black/30 p-4">
                <span className="text-white/40">Último peso</span>
                <span className="font-bold text-white">
                  {latestWeight || "—"}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={saveGoal}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Objetivos</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {editingGoal ? "Editar objetivo" : "Nuevo objetivo"}
                </h2>
                <p className="mt-2 text-sm text-white/40">
                  Puedes dejarlo manual o conectarlo con Finanzas/Salud.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Título</span>
                <input
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  required
                  placeholder="Ej: Pasar 2 cuentas PA, bajar 5 kg, ahorrar $1000..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Categoría</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({
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
                  value={form.deadline}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      deadline: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Prioridad</span>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value as GoalPriority,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {priorities.map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Estado</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as GoalStatus,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Conexión</span>
                <select
                  value={form.connectionType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      connectionType: event.target.value as GoalConnectionType,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  {connectionTypes.map((connection) => (
                    <option key={connection}>{connection}</option>
                  ))}
                </select>
              </label>

              {form.connectionType === "Manual" && (
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs text-white/40">Progreso manual</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.progress}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        progress: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </label>
              )}

              {form.connectionType === "Meta financiera" && (
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs text-white/40">
                    Meta financiera conectada
                  </span>
                  <select
                    value={form.linkedFinanceGoalId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        linkedFinanceGoalId: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  >
                    <option value="">Selecciona una meta financiera</option>
                    {financeGoalOptions.map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title} · ${goal.current}/${goal.target}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {form.connectionType === "Salud - entrenos" && (
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs text-white/40">
                    Meta de entrenos este mes
                  </span>
                  <input
                    type="number"
                    value={form.targetNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        targetNumber: event.target.value,
                      }))
                    }
                    placeholder="Ej: 20"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                  <p className="text-xs text-white/35">
                    Actual: {trainedDays} entrenos registrados este mes.
                  </p>
                </label>
              )}

              {form.connectionType === "Salud - agua" && (
                <label className="space-y-2 md:col-span-2">
                  <span className="text-xs text-white/40">
                    Meta de agua promedio diaria
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    value={form.targetNumber}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        targetNumber: event.target.value,
                      }))
                    }
                    placeholder="Ej: 3"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                  <p className="text-xs text-white/35">
                    Actual: {averageWater.toFixed(1)}L promedio este mes.
                  </p>
                </label>
              )}

              {form.connectionType === "Salud - peso" && (
                <>
                  <label className="space-y-2">
                    <span className="text-xs text-white/40">Peso inicial</span>
                    <input
                      type="number"
                      step="0.1"
                      value={form.startNumber}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          startNumber: event.target.value,
                        }))
                      }
                      placeholder="Ej: 97"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-xs text-white/40">Peso meta</span>
                    <input
                      type="number"
                      step="0.1"
                      value={form.targetNumber}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          targetNumber: event.target.value,
                        }))
                      }
                      placeholder="Ej: 90"
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  </label>

                  <p className="text-xs text-white/35 md:col-span-2">
                    Último peso registrado en Salud: {latestWeight || "—"}.
                  </p>
                </>
              )}

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Nota</span>
                <textarea
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      note: event.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Plan, razón del objetivo, reglas o detalles..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                {editingGoal ? "Guardar cambios" : "Crear objetivo"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}