"use client";

import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  FinanceEntryModal,
  type FinanceMovement,
} from "@/components/FinanceEntryModal";
import { FinanceGoalsPanel } from "@/components/FinanceGoalsPanel";

const storageKey = "lifeos-finance-movements";

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function parseAmount(value: string) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getTopCategory(movements: FinanceMovement[], type: string) {
  const totals = movements
    .filter((movement) => movement.type === type)
    .reduce<Record<string, number>>((acc, movement) => {
      const category = movement.category || "Sin categoría";

      acc[category] = (acc[category] || 0) + parseAmount(movement.amount);

      return acc;
    }, {});

  const sortedCategories = Object.entries(totals).sort(
    ([, amountA], [, amountB]) => amountB - amountA
  );

  if (sortedCategories.length === 0) {
    return {
      category: "—",
      amount: 0,
    };
  }

  return {
    category: sortedCategories[0][0],
    amount: sortedCategories[0][1],
  };
}
export function FinanceClient() {
  const [movements, setMovements] = useState<FinanceMovement[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const savedMovements = localStorage.getItem(storageKey);

    if (savedMovements) {
      setMovements(JSON.parse(savedMovements));
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(storageKey, JSON.stringify(movements));
  }, [movements, loaded]);

  const currentMonth = getCurrentMonth();

  const monthlyMovements = movements.filter((movement) =>
    movement.date.startsWith(currentMonth)
  );

  const monthlyIncome = monthlyMovements
    .filter((movement) => movement.type === "Ingreso")
    .reduce((total, movement) => total + parseAmount(movement.amount), 0);

  const monthlyExpenses = monthlyMovements
    .filter((movement) => movement.type === "Gasto")
    .reduce((total, movement) => total + parseAmount(movement.amount), 0);

  const monthlySavings = monthlyMovements
    .filter(
      (movement) =>
        movement.type === "Ahorro" || movement.type === "Inversión"
    )
    .reduce((total, movement) => total + parseAmount(movement.amount), 0);

  const availableMoney = monthlyIncome - monthlyExpenses - monthlySavings;
const monthlyBalance = monthlyIncome - monthlyExpenses;
const savingsRate =
  monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;
const expenseRate =
  monthlyIncome > 0 ? Math.round((monthlyExpenses / monthlyIncome) * 100) : 0;

const topExpenseCategory = getTopCategory(monthlyMovements, "Gasto");
const topIncomeCategory = getTopCategory(monthlyMovements, "Ingreso");

const reportMessage =
  monthlyIncome === 0
    ? "Todavía no hay ingresos registrados este mes."
    : availableMoney >= 0
    ? "Vas con margen positivo este mes. Sigue cuidando tus gastos y aportes."
    : "Este mes estás gastando o separando más de lo que ingresó. Revisa tus movimientos.";
  const summaryCards = [
    {
      title: "Ingresos del mes",
      value: formatMoney(monthlyIncome),
      description: "Dinero que entró este mes.",
      icon: ArrowUpRight,
      color: "text-emerald-400",
    },
    {
      title: "Gastos del mes",
      value: formatMoney(monthlyExpenses),
      description: "Dinero gastado este mes.",
      icon: ArrowDownRight,
      color: "text-red-400",
    },
    {
      title: "Ahorro / inversión",
      value: formatMoney(monthlySavings),
      description: "Dinero separado para crecer.",
      icon: PiggyBank,
      color: "text-blue-300",
    },
    {
      title: "Disponible",
      value: formatMoney(availableMoney),
      description: "Ingreso menos gastos y ahorro.",
      icon: Wallet,
      color: availableMoney >= 0 ? "text-white" : "text-red-400",
    },
  ];

  function addMovement(movement: FinanceMovement) {
    setMovements((currentMovements) => [movement, ...currentMovements]);
  }

  function deleteMovement(movementId: string) {
    setMovements((currentMovements) =>
      currentMovements.filter((movement) => movement.id !== movementId)
    );
  }

  function getAmountColor(type: string) {
    if (type === "Ingreso") return "text-emerald-400";
    if (type === "Gasto") return "text-red-400";
    if (type === "Ahorro") return "text-blue-300";
    return "text-yellow-300";
  }

  function getAmountPrefix(type: string) {
    if (type === "Ingreso") return "+";
    return "-";
  }

  return (
    <div>
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Módulo Finanzas
          </div>

          <p className="text-sm text-white/40">Control mensual</p>

          <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Finanzas
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Controla ingresos, gastos, ahorro, inversión y dinero disponible.
          </p>
        </div>

        <FinanceEntryModal onAddMovement={addMovement} />
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
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
            </div>
          );
        })}
      </div>
<section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
  <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
    <div>
      <p className="text-sm text-white/40">Resumen automático</p>
      <h2 className="mt-1 text-2xl font-bold">Reporte mensual</h2>
      <p className="mt-2 text-sm text-white/40">
        Un resumen rápido de cómo va tu dinero este mes.
      </p>
    </div>

    <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-white/50">
      {monthlyMovements.length} movimientos
    </span>
  </div>

  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs text-white/40">Balance del mes</p>
      <p
        className={`mt-2 text-2xl font-bold ${
          monthlyBalance >= 0 ? "text-emerald-400" : "text-red-400"
        }`}
      >
        {formatMoney(monthlyBalance)}
      </p>
      <p className="mt-2 text-xs text-white/40">
        Ingresos menos gastos, sin contar ahorro.
      </p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs text-white/40">Tasa de ahorro</p>
      <p className="mt-2 text-2xl font-bold text-blue-300">
        {savingsRate}%
      </p>
      <p className="mt-2 text-xs text-white/40">
        También gastaste el {expenseRate}% de tus ingresos.
      </p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs text-white/40">Mayor gasto</p>
      <p className="mt-2 text-2xl font-bold text-red-400">
        {topExpenseCategory.category}
      </p>
      <p className="mt-2 text-xs text-white/40">
        {formatMoney(topExpenseCategory.amount)} este mes.
      </p>
    </div>

    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs text-white/40">Mayor ingreso</p>
      <p className="mt-2 text-2xl font-bold text-emerald-400">
        {topIncomeCategory.category}
      </p>
      <p className="mt-2 text-xs text-white/40">
        {formatMoney(topIncomeCategory.amount)} este mes.
      </p>
    </div>
  </div>

  <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
    <p className="text-sm text-white/60">{reportMessage}</p>
  </div>
</section>
      <FinanceGoalsPanel movements={movements} onAddMovement={addMovement} />

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Registro financiero</p>
            <h2 className="mt-1 text-2xl font-bold">Últimos movimientos</h2>
          </div>

          <p className="text-sm text-white/40">
            {monthlyMovements.length} movimientos este mes
          </p>
        </div>

        {movements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
            <p className="text-sm font-semibold text-white">
              Todavía no tienes movimientos registrados.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Agrega tu primer gasto, ingreso, ahorro o inversión.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-white/40">
                <tr>
                  <th className="px-4 py-4">Fecha</th>
                  <th className="px-4 py-4">Tipo</th>
                  <th className="px-4 py-4">Categoría</th>
                  <th className="px-4 py-4">Método</th>
                  <th className="px-4 py-4">Monto</th>
                  <th className="px-4 py-4">Nota</th>
                  <th className="px-4 py-4 text-right">Acción</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-t border-white/10 text-white/70"
                  >
                    <td className="px-4 py-4">{movement.date}</td>
                    <td className="px-4 py-4">{movement.type}</td>
                    <td className="px-4 py-4">{movement.category}</td>
                    <td className="px-4 py-4">{movement.method}</td>
                    <td
                      className={`px-4 py-4 font-bold ${getAmountColor(
                        movement.type
                      )}`}
                    >
                      {getAmountPrefix(movement.type)}
                      {formatMoney(parseAmount(movement.amount))}
                    </td>
                    <td className="max-w-xs truncate px-4 py-4 text-white/50">
                      {movement.note || "—"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => deleteMovement(movement.id)}
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
    </div>
  );
}
