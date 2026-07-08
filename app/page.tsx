import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Circle,
  Dumbbell,
  Flame,
  LayoutDashboard,
  LineChart,
  Plus,
  Scale,
  Sparkles,
  Target,
  TrendingUp,
  Utensils,
  Wallet,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, active: true },
  { name: "Trading", icon: LineChart },
  { name: "Finanzas", icon: Wallet },
  { name: "Salud", icon: Dumbbell },
  { name: "Nutrición", icon: Utensils },
  { name: "Calendario", icon: CalendarDays },
  { name: "Objetivos", icon: Target },
];

const stats = [
  {
    title: "Trading semanal",
    value: "+$0",
    description: "Empieza registrando tus operaciones.",
    icon: TrendingUp,
    color: "text-emerald-400",
  },
  {
    title: "Peso actual",
    value: "100 kg",
    description: "Meta: bajar grasa y mejorar físico.",
    icon: Scale,
    color: "text-white",
  },
  {
    title: "Calorías",
    value: "0 / 1800",
    description: "Déficit diario estimado.",
    icon: Flame,
    color: "text-orange-300",
  },
  {
    title: "Hábitos",
    value: "0 días",
    description: "Racha de disciplina.",
    icon: Activity,
    color: "text-blue-300",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_30%)]" />

      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-72 border-r border-white/10 bg-white/[0.02] p-6 lg:block">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-black">
                <Sparkles size={20} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight">Life OS</h1>
                <p className="text-sm text-white/40">Sistema personal</p>
              </div>
            </div>
          </div>

          <nav className="space-y-2 text-sm">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.name}
                  href="#"
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                    item.active
                      ? "bg-white text-black"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.name}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/40">Estado del sistema</p>
            <h3 className="mt-2 font-semibold">Construyendo versión 1.0</h3>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 w-[24%] rounded-full bg-emerald-400" />
            </div>
            <p className="mt-3 text-xs text-white/40">24% de la base inicial</p>
          </div>
        </aside>

        <section className="flex-1 p-6 lg:p-10">
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
                Trading, finanzas, salud, hábitos y organización en un solo
                lugar. Este será tu centro de control personal.
              </p>
            </div>

            <button className="flex w-fit items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90">
              <Plus size={18} />
              Nuevo registro
            </button>
          </header>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:bg-white/[0.05]"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-sm text-white/40">{stat.title}</p>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                      <Icon size={18} className={stat.color} />
                    </div>
                  </div>

                  <h3 className={`text-3xl font-bold ${stat.color}`}>
                    {stat.value}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-white/40">
                    {stat.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 xl:col-span-2">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/40">Resumen</p>
                  <h3 className="text-2xl font-bold">Tu día de hoy</h3>
                </div>

                <span className="rounded-full bg-white/10 px-4 py-2 text-xs text-white/60">
                  En progreso
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-sm text-white/40">Objetivo principal</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Ser rentable y disciplinado
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-sm text-white/40">Próximo módulo</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Trading Journal
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-sm text-white/40">Salud</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Déficit + gimnasio
                  </h4>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
                  <p className="text-sm text-white/40">Finanzas</p>
                  <h4 className="mt-2 text-lg font-semibold">
                    Ahorros e inversiones
                  </h4>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/40">Plan de construcción</p>
                  <h3 className="mt-2 text-2xl font-bold">Fase 1</h3>
                </div>

                <ArrowUpRight className="text-white/30" size={22} />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <p className="text-sm text-white/70">Proyecto creado</p>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <p className="text-sm text-white/70">Página funcionando</p>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-400" />
                  <p className="text-sm text-white/70">Diseño inicial</p>
                </div>

                <div className="flex items-center gap-3">
                  <Circle size={18} className="text-white/25" />
                  <p className="text-sm text-white/40">Base de datos</p>
                </div>

                <div className="flex items-center gap-3">
                  <Circle size={18} className="text-white/25" />
                  <p className="text-sm text-white/40">Login</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}