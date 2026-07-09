"use client";

import { FormEvent, useEffect, useState } from "react";
import { PiggyBank, Plus, Trash2, X } from "lucide-react";
import type { FinanceMovement } from "@/components/FinanceEntryModal";

type SavingsGoal = {
  id: string;
  title: string;
  targetAmount: string;
};

type FinanceGoalsPanelProps = {
  movements: FinanceMovement[];
  onAddMovement: (movement: FinanceMovement) => void;
};

const storageKey = "lifeos-finance-savings-goals";

const initialForm = {
  title: "",
  targetAmount: "",
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function parseAmount(value: string) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

// 👇 Única fuente de verdad: el "actual" de una meta se calcula
// sumando los movimientos de tipo "Ahorro" que apuntan a ese goalId.
function getGoalCurrentAmount(
  movements: FinanceMovement[] | undefined,
  goalId: string
) {
  return (movements ?? [])
    .filter((movement) => movement.type === "Ahorro" && movement.goalId === goalId)
    .reduce((total, movement) => total + parseAmount(movement.amount), 0);
}

export function FinanceGoalsPanel({
  movements = [],
  onAddMovement,
}: FinanceGoalsPanelProps) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [contributionGoalId, setContributionGoalId] = useState<string | null>(
    null
  );
  const [contributionAmount, setContributionAmount] = useState("");

  useEffect(() => {
    const savedGoals = localStorage.getItem(storageKey);

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKey, JSON.stringify(goals));
  }, [goals, loaded]);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title.trim()) return;

    setGoals((currentGoals) => [
      {
        id: `${Date.now()}-${Math.random()}`,
        title: form.title.trim(),
        targetAmount: form.targetAmount,
      },
      ...currentGoals,
    ]);

    setForm(initialForm);
    setIsCreating(false);
  }

  function deleteGoal(goalId: string) {
    setGoals((currentGoals) =>
      currentGoals.filter((goal) => goal.id !== goalId)
    );
  }

  function addContribution(goal: SavingsGoal) {
    const amount = parseAmount(contributionAmount);

    if (amount <= 0) return;

    // 👇 El aporte SOLO crea el movimiento. Nada de guardar el monto
    // en dos lugares distintos: así "Ahorro/inversión" y "Disponible"
    // en FinanceClient se actualizan automáticamente, porque leen
    // de la misma lista de movements.
    onAddMovement({
      id: `${Date.now()}-${Math.random()}`,
      date: getTodayDate(),
      type: "Ahorro",
      category: "Meta",
      amount: String(amount),
      method: "Meta",
      note: `Aporte a meta: ${goal.title}`,
      goalId: goal.id,
    });

    setContributionAmount("");
    setContributionGoalId(null);
  }

  const totalTarget = goals.reduce(
    (total, goal) => total + parseAmount(goal.targetAmount),
    0
  );

  const totalSaved = goals.reduce(
    (total, goal) => total + getGoalCurrentAmount(movements, goal.id),
    0
  );

  const totalProgress =
    totalTarget > 0 ? Math.min((totalSaved / totalTarget) * 100, 100) : 0;

  return (
    <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm text-white/40">Objetivos de ahorro</p>
          <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold">
            <PiggyBank className="h-6 w-6 text-emerald-400" />
            Metas de ahorro
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/40">
            Crea una meta simple y aporta dinero. Cada aporte cuenta como ahorro
            y baja tu disponible.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
        >
          <Plus className="h-4 w-4" />
          Nueva meta
        </button>
      </div>

      {goals.length > 0 && (
        <div className="mb-6 rounded-3xl border border-white/10 bg-black/40 p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-white/40">Progreso total</span>
            <span className="font-bold text-white">
              {totalProgress.toFixed(0)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${totalProgress}%` }}
            />
          </div>

          <div className="mt-3 flex flex-wrap justify-between gap-2 text-xs text-white/40">
            <span>Ahorrado en metas: {formatMoney(totalSaved)}</span>
            <span>Objetivo total: {formatMoney(totalTarget)}</span>
            <span>
              Falta: {formatMoney(Math.max(totalTarget - totalSaved, 0))}
            </span>
          </div>
        </div>
      )}

      {isCreating && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 rounded-3xl border border-white/10 bg-black/40 p-5"
        >
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">
                Crear meta de ahorro
              </p>
              <p className="text-xs text-white/40">
                Solo necesitas un título y un objetivo.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="rounded-full border border-white/10 p-2 text-white/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 md:col-span-2">
              <span className="text-xs text-white/40">Título</span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                placeholder="Ej: Mudanza"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs text-white/40">Objetivo</span>
              <input
                type="number"
                value={form.targetAmount}
                onChange={(event) =>
                  updateField("targetAmount", event.target.value)
                }
                placeholder="Ej: 5000"
                required
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-5 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-white/90"
          >
            Guardar meta
          </button>
        </form>
      )}

      {goals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
          <p className="text-sm font-semibold text-white">
            Todavía no tienes metas de ahorro.
          </p>
          <p className="mt-2 text-sm text-white/40">
            Crea una meta como mudanza, fondo de emergencia o PC.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {goals.map((goal) => {
            const target = parseAmount(goal.targetAmount);
            const current = getGoalCurrentAmount(movements, goal.id);
            const remaining = Math.max(target - current, 0);
            const progress =
              target > 0 ? Math.min((current / target) * 100, 100) : 0;

            return (
              <article
                key={goal.id}
                className="rounded-3xl border border-white/10 bg-black/40 p-5"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {goal.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/40">
                      Falta {formatMoney(remaining)} para cumplirla.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setContributionGoalId(
                          contributionGoalId === goal.id ? null : goal.id
                        )
                      }
                      className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-bold text-emerald-300 transition hover:bg-emerald-400/20"
                    >
                      + Aporte
                    </button>

                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-red-400/40 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {contributionGoalId === goal.id && (
                  <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 sm:flex-row sm:items-end">
                    <label className="flex-1 space-y-2">
                      <span className="text-xs text-white/40">
                        Monto del aporte
                      </span>
                      <input
                        type="number"
                        value={contributionAmount}
                        onChange={(event) =>
                          setContributionAmount(event.target.value)
                        }
                        placeholder="Ej: 200"
                        className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => addContribution(goal)}
                      className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
                    >
                      Guardar aporte
                    </button>
                  </div>
                )}

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Actual</p>
                    <p className="mt-2 text-xl font-bold text-emerald-400">
                      {formatMoney(current)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Objetivo</p>
                    <p className="mt-2 text-xl font-bold text-white">
                      {formatMoney(target)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs text-white/40">Progreso</p>
                    <p className="mt-2 text-xl font-bold text-blue-300">
                      {progress.toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                    <span>Avance</span>
                    <span>{progress.toFixed(0)}%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
