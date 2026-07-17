"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import {
  BarChart3,
  CalendarDays,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Pencil,
  Sparkles,
  Target,
  Wallet,
  X,
} from "lucide-react";

const sidebarStorageKey = "lifeos-sidebar-visible-sections";

const dashboardItem = {
  name: "Dashboard",
  href: "/",
  icon: LayoutDashboard,
};

const configurableMenuItems = [
  { name: "Trading", href: "/trading", icon: LineChart },
  { name: "Finanzas", href: "/finanzas", icon: Wallet },
  { name: "Salud", href: "/salud", icon: Dumbbell },
  { name: "Estudios", href: "/estudios", icon: GraduationCap },
  { name: "Calendario", href: "/calendario", icon: CalendarDays },
  { name: "Backtesting", href: "/backtesting", icon: BarChart3 },
];

function createDefaultVisibleSections() {
  return configurableMenuItems.reduce<Record<string, boolean>>((acc, item) => {
    acc[item.name] = true;
    return acc;
  }, {});
}

function mergeSavedSections(savedSections: Record<string, boolean>) {
  const defaultSections = createDefaultVisibleSections();

  configurableMenuItems.forEach((item) => {
    if (typeof savedSections[item.name] === "boolean") {
      defaultSections[item.name] = savedSections[item.name];
    }
  });

  return defaultSections;
}

type SidebarProps = {
  variant?: "desktop" | "mobile";
};

export function Sidebar({ variant = "desktop" }: SidebarProps) {
  const pathname = usePathname();
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [visibleSections, setVisibleSections] = useState(
    createDefaultVisibleSections
  );

  useEffect(() => {
    const savedSections = localStorage.getItem(sidebarStorageKey);

    if (savedSections) {
      setVisibleSections(mergeSavedSections(JSON.parse(savedSections)));
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(sidebarStorageKey, JSON.stringify(visibleSections));
  }, [visibleSections, loaded]);

  const visibleMenuItems = configurableMenuItems.filter(
    (item) => visibleSections[item.name]
  );

  function toggleSection(sectionName: string) {
    setVisibleSections((currentSections) => ({
      ...currentSections,
      [sectionName]: !currentSections[sectionName],
    }));
  }

  function resetSections() {
    setVisibleSections(createDefaultVisibleSections());
  }

  return (
    <>
      <aside
  className={`${
    variant === "desktop" ? "hidden w-72 lg:block" : "block h-full w-full"
  } border-r border-white/10 bg-white/[0.02] p-6`}
>
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
          <Link
            href={dashboardItem.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
              pathname === dashboardItem.href
                ? "bg-white text-black"
                : "text-white/55 hover:bg-white/5 hover:text-white"
            }`}
          >
            <dashboardItem.icon size={18} />
            <span className="font-medium">{dashboardItem.name}</span>
          </Link>

          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                  isActive
                    ? "bg-white text-black"
                    : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setCustomizeOpen(true)}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/55 transition hover:bg-white/[0.07] hover:text-white"
        >
          <Pencil size={16} />
          Personalizar secciones
        </button>
      </aside>

      {customizeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Life OS</p>
                <h2 className="mt-1 text-2xl font-bold">
                  Personalizar secciones
                </h2>
                <p className="mt-2 text-sm text-white/40">
                  Elige qué módulos quieres ver en el menú. Dashboard siempre se
                  mantiene fijo.
                </p>
              </div>

              <button
                onClick={() => setCustomizeOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/10 p-3">
                    <LayoutDashboard className="h-5 w-5 text-white/70" />
                  </div>

                  <div>
                    <p className="font-bold text-white">Dashboard</p>
                    <p className="text-xs text-white/40">Pantalla principal</p>
                  </div>
                </div>

                <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
                  Fijo
                </span>
              </div>

              {configurableMenuItems.map((item) => {
                const Icon = item.icon;
                const isVisible = visibleSections[item.name];

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-white/10 p-3">
                        <Icon className="h-5 w-5 text-white/70" />
                      </div>

                      <div>
                        <p className="font-bold text-white">{item.name}</p>
                        <p className="text-xs text-white/40">{item.href}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSection(item.name)}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                        isVisible
                          ? "bg-emerald-400 text-black hover:bg-emerald-300"
                          : "border border-white/10 text-white/50 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {isVisible ? "Visible" : "Oculta"}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button
                onClick={resetSections}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Mostrar todo
              </button>

              <button
                onClick={() => setCustomizeOpen(false)}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}