import {
  CalendarDays,
  Dumbbell,
  LayoutDashboard,
  LineChart,
  Sparkles,
  Target,
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

export function Sidebar() {
  return (
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
  );
}