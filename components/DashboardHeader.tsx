import { Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
      <div>
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Dashboard inicial activo
        </div>

        <p className="text-sm text-white/40">Bienvenido de nuevo</p>

        <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
          Axel, controla tu progreso.
        </h2>

        <p className="mt-4 max-w-2xl text-white/50">
          Trading, finanzas, salud, hábitos y organización en un solo lugar. Este
          será tu centro de control personal.
        </p>
      </div>

      <button className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
        <Plus size={18} />
        Nuevo registro
      </button>
    </header>
  );
}