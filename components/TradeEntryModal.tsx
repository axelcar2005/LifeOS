"use client";

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";

export type Trade = {
  id: string;
  date: string;
  account: string;
  asset: string;
  direction: string;
  risk: string;
  result: string;
  setup: string;
  emotion: string;
  notes: string;
  status: string;
};

type TradeEntryModalProps = {
  onAddTrade: (trade: Trade) => void;
};

const initialForm = {
  date: "",
  account: "Apex PA",
  asset: "MNQ",
  direction: "Long",
  risk: "",
  result: "",
  setup: "IFVG 5m",
  emotion: "Disciplinado",
  notes: "",
};

export function TradeEntryModal({ onAddTrade }: TradeEntryModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onAddTrade({
  id: `${Date.now()}-${Math.random()}`,
  ...form,
  status: "Registrado",
});

    setForm(initialForm);
    setOpen(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
      >
        <Plus size={18} />
        Nueva operación
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Trading Journal</p>
                <h2 className="mt-1 text-2xl font-bold">Registrar operación</h2>
                <p className="mt-2 text-sm text-white/40">
                  Guarda los datos principales de tu trade para analizar tu rendimiento.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
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
                  <label className="mb-2 block text-sm text-white/50">Cuenta</label>
                  <select
                    value={form.account}
                    onChange={(event) => updateField("account", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  >
                    <option>Apex PA</option>
                    <option>Prueba 25K</option>
                    <option>Prueba 50K</option>
                    <option>Cuenta personal</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Activo</label>
                  <select
                    value={form.asset}
                    onChange={(event) => updateField("asset", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  >
                    <option>MNQ</option>
                    <option>NQ</option>
                    <option>ES</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Dirección</label>
                  <select
                    value={form.direction}
                    onChange={(event) => updateField("direction", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  >
                    <option>Long</option>
                    <option>Short</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Riesgo</label>
                  <input
                    type="number"
                    value={form.risk}
                    onChange={(event) => updateField("risk", event.target.value)}
                    placeholder="Ej: 250"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Resultado</label>
                  <input
                    type="number"
                    value={form.result}
                    onChange={(event) => updateField("result", event.target.value)}
                    placeholder="Ej: 500 o -250"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Setup</label>
                  <select
                    value={form.setup}
                    onChange={(event) => updateField("setup", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  >
                    <option>IFVG 5m</option>
                    <option>Liquidity Sweep</option>
                    <option>Break + Retest</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Emoción</label>
                  <select
                    value={form.emotion}
                    onChange={(event) => updateField("emotion", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  >
                    <option>Disciplinado</option>
                    <option>Ansioso</option>
                    <option>Con miedo</option>
                    <option>Impulsivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">Notas del trade</label>
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="¿Por qué entraste? ¿Respetaste el plan? ¿Qué mejorarías?"
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-emerald-300"
                >
                  Guardar operación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}