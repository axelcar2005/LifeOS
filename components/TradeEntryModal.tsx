"use client";

import {
  ChangeEvent,
  ClipboardEvent,
  FormEvent,
  useRef,
  useState,
} from "react";
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
  accounts?: string[];
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
}

export function TradeEntryModal({
  onAddTrade,
  accounts = [],
}: TradeEntryModalProps) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(createInitialForm);
  const dateInputRef = useRef<HTMLInputElement>(null);

  function updateField(field: keyof ReturnType<typeof createInitialForm>, value: string) {
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
    const file = Array.from(event.clipboardData.files).find((item) =>
      item.type.startsWith("image/")
    );

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

  const selectedAccounts =
    form.account === "__all__" ? accounts : [form.account];

  selectedAccounts.forEach((account) => {
    onAddTrade({
      id: `${Date.now()}-${Math.random()}`,
      ...form,
      account,
      status: "Registrado",
    });
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
        Nueva operación
      </button>

      {open && (
        <div className="lifeos-modal fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-3xl rounded-3xl border border-white/10 bg-[#080808] p-5 pb-8 shadow-2xl sm:max-h-[90vh] sm:overflow-y-auto sm:p-6"
          >
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
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-white/50">Fecha</label>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={form.date}
                  onClick={() => dateInputRef.current?.showPicker?.()}
                  onChange={(event) => updateField("date", event.target.value)}
                  required
                  className="w-full cursor-pointer rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/50">Cuenta</label>

                {accounts.length > 0 ? (
                  <select
                    value={form.account}
                    onChange={(event) =>
                      updateField("account", event.target.value)
                    }
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  >
                    <option value="">Selecciona una cuenta</option>

{accounts.length > 1 && (
  <option value="__all__">Todas las cuentas</option>
)}

{accounts.map((account) => (
  <option key={account} value={account}>
    {account}
  </option>
))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.account}
                    onChange={(event) =>
                      updateField("account", event.target.value)
                    }
                    placeholder="Ej: Topstep 50K, Apex PA 25K, Lucid prueba 50K"
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />
                )}
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
                <label className="mb-2 block text-sm text-white/50">
                  Dirección
                </label>
                <select
                  value={form.direction}
                  onChange={(event) =>
                    updateField("direction", event.target.value)
                  }
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
                <label className="mb-2 block text-sm text-white/50">
                  Resultado
                </label>
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
                <label className="mb-2 block text-sm text-white/50">
                  Emoción
                </label>
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

            <div className="mt-5">
              <label className="mb-2 block text-sm text-white/50">
                Imagen del trade
              </label>

              <div
                onPaste={handlePaste}
                tabIndex={0}
                className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/40 p-5 text-center outline-none transition focus:border-emerald-400"
              >
                {form.image ? (
                  <img
                    src={form.image}
                    alt="Captura del trade"
                    className="max-h-[360px] w-full rounded-2xl object-contain"
                  />
                ) : (
                  <>
                    <div className="mb-4 rounded-full bg-white/10 p-4">
                      <ImagePlus className="h-6 w-6 text-white/60" />
                    </div>
                    <p className="font-semibold text-white/80">
                      Pega aquí tu captura con Ctrl + V
                    </p>
                    <p className="mt-2 text-sm text-white/40">
                      También puedes subir una imagen desde tu PC.
                    </p>
                  </>
                )}

                <label className="mt-4 cursor-pointer text-sm text-white/60 hover:text-white">
                  Seleccionar archivo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-white/50">
                Notas del trade
              </label>
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                placeholder="¿Por qué entraste? ¿Respetaste el plan? ¿Qué mejorarías?"
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
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
                Guardar operación
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}