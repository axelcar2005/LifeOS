"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  CalendarDays,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Sparkles,
  Wallet,
} from "lucide-react";

import { Sidebar } from "@/components/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

const mobileNavItems = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Trading", href: "/trading", icon: LineChart },
  { name: "Finanzas", href: "/finanzas", icon: Wallet },
  { name: "Salud", href: "/salud", icon: Dumbbell },
  { name: "Estudios", href: "/estudios", icon: GraduationCap },
  { name: "Agenda", href: "/calendario", icon: CalendarDays },
];

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <main className="relative min-h-screen max-w-full overflow-x-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_30%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px] overflow-x-hidden">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="lifeos-mobile-header relative z-10 flex items-center justify-between border-b border-white/10 bg-[#030303]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-black">
                <Sparkles size={18} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold tracking-tight">
                  Life OS
                </h1>
                <p className="truncate text-xs text-white/40">
                  Sistema personal
                </p>
              </div>
            </div>

            <div className="rounded-full border border-white/10 bg-black/40 p-1">
              <UserButton />
            </div>
          </header>

          <div className="hidden lg:block">
            <div className="fixed right-6 top-6 z-40 rounded-full border border-white/10 bg-black/50 p-2 backdrop-blur-xl">
              <UserButton />
            </div>
          </div>

          <section className="relative z-10 min-w-0 flex-1 overflow-x-hidden px-3 pb-28 pt-5 sm:px-5 lg:p-10">
            {children}
          </section>
        </div>
      </div>

      <nav className="lifeos-mobile-nav fixed bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-[#030303]/95 px-2 py-2 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-6 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-w-0 flex-col items-center justify-center rounded-2xl px-1 py-2 text-[10px] font-semibold transition ${
                  isActive
                    ? "bg-white text-black"
                    : "text-white/45 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={17} />
                <span className="mt-1 max-w-full truncate">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </main>
  );
}