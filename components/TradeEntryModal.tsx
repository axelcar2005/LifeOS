"use client";

import { ChangeEvent, ClipboardEvent, FormEvent, useState } from "react";
import { ImagePlus, Plus, X } from "lucide-react";

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
  image?: string;
};

type TradeEntryModalProps = {
  onAddTrade: (trade: Trade) => void;
};

const initialForm = {
  date: "",
  account: "",
  asset: "MNQ",
  direction: "Long",
  risk: "",
  result: "",
  setup: "",
  emotion: "Disciplinado",
  notes: "",
  image: "",
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

  function readImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = () => {
      updateField("image", String(reader.result));
    };

    reader.readAsDataURL(file);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const items = Array.from(event.clipboardData.items);
    const imageItem = items.find((item) => item.type.startsWith("image/"));
    const file = imageItem?.getAsFile();

    if (file) {
      event.preventDefault();
      readImageFile(file);
    }
  }

  function handleImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      readImageFile(file);
    }
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
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Trading Journal</p>
                <h2 className="mt-1 text-2xl font-bold">Registrar operación</h2>
                <p className="mt-2 text-sm text-white/40">
                  Guarda tu trade con setup, emoción, notas y captura.
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
  <input
    type="text"
    value={form.account}
    onChange={(event) => updateField("account", event.target.value)}
    placeholder="Ej: Topstep 50K, Apex PA 25K, Lucid prueba 50K"
    required
    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
  />
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
                    <option>MES</option>
                    <option>YM</option>
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
                  <input
                    type="text"
                    value={form.setup}
                    onChange={(event) => updateField("setup", event.target.value)}
                    placeholder="Ej: IFVG 5m + liquidez"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
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
                    <option>Confiado</option>
                    <option>Cansado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Imagen del trade
                </label>

                <div
                  tabIndex={0}
                  onPaste={handlePaste}
                  className="rounded-2xl border border-dashed border-white/15 bg-black/40 p-4 outline-none transition focus:border-emerald-400"
                >
                  {form.image ? (
                    <div className="space-y-3">
                      <img
                        src={form.image}
                        alt="Captura del trade"
                        className="max-h-72 w-full rounded-2xl object-contain"
                      />

                      <button
                        type="button"
                        onClick={() => updateField("image", "")}
                        className="rounded-xl bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-400/20"
                      >
                        Quitar imagen
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white/50">
                        <ImagePlus size={22} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-white/70">
                          Pega aquí tu captura con Ctrl + V
                        </p>
                        <p className="mt-1 text-xs text-white/40">
                          También puedes subir una imagen desde tu PC.
                        </p>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-xs text-white/50"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">
                  Notas del trade
                </label>
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