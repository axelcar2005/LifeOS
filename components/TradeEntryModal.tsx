"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export function TradeEntryModal() {
  const [open, setOpen] = useState(false);

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
                onClick={() => setOpen(false)}
                className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-white/50">Fecha</label>
                  <input
                    type="date"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Cuenta</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400">
                    <option>Apex PA</option>
                    <option>Prueba 25K</option>
                    <option>Prueba 50K</option>
                    <option>Cuenta personal</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Activo</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400">
                    <option>MNQ</option>
                    <option>NQ</option>
                    <option>ES</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Dirección</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400">
                    <option>Long</option>
                    <option>Short</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Riesgo</label>
                  <input
                    type="number"
                    placeholder="Ej: 250"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Resultado</label>
                  <input
                    type="number"
                    placeholder="Ej: 500 o -250"
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Setup</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400">
                    <option>IFVG 5m</option>
                    <option>Liquidity Sweep</option>
                    <option>Break + Retest</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/50">Emoción</label>
                  <select className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400">
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
                  type="button"
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