"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";

export type FinanceMovement = {
  id: string;
  date: string;
  type: string;
  category: string;
  amount: string;
  method: string;
  note: string;
  goalId?: string;
};

type FinanceEntryModalProps = {
  onAddMovement: (movement: FinanceMovement) => void;
};


function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialForm() {
  return {
    date: getTodayDate(),
    type: "Gasto",
    category: "Comida",
    amount: "",
    method: "Efectivo",
    note: "",
  };
}

export function FinanceEntryModal({ onAddMovement }: FinanceEntryModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(createInitialForm);

  function updateField(field: keyof ReturnType<typeof createInitialForm>, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onAddMovement({
      id: `${Date.now()}-${Math.random()}`,
      ...form,
    });

    setForm(createInitialForm());
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        <Plus size={18} />
        Nuevo movimiento
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Finanzas</p>
                <h2 className="mt-1 text-2xl font-bold">Nuevo movimiento</h2>
                <p className="mt-2 text-sm text-white/40">
                  Registra ingresos, gastos, ahorro o inversión.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/50">Fecha</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">Tipo</label>
                <select
                  value={form.type}
                  onChange={(event) => updateField("type", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Ingreso</option>
                  <option>Gasto</option>
                  <option>Ahorro</option>
                  <option>Inversión</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Comida</option>
                  <option>Transporte</option>
                  <option>Gym</option>
                  <option>Trading</option>
                  <option>Ropa</option>
                  <option>Salidas</option>
                  <option>Casa</option>
                  <option>Suscripciones</option>
                  <option>Ahorro</option>
                  <option>Inversión</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">Monto</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(event) => updateField("amount", event.target.value)}
                  placeholder="Ej: 25"
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">Método</label>
                <select
                  value={form.method}
                  onChange={(event) => updateField("method", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Efectivo</option>
                  <option>Tarjeta</option>
                  <option>Transferencia</option>
                  <option>Banco</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">Nota</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(event) => updateField("note", event.target.value)}
                  placeholder="Ej: almuerzo, retiro Apex, gasolina..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Guardar movimiento
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
