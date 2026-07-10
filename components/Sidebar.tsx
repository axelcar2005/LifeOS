"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CalendarDays,
  Dumbbell,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Sparkles,
  Target,
  Utensils,
  Wallet,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Trading", href: "/trading", icon: LineChart },
  { name: "Finanzas", href: "/finanzas", icon: Wallet },
  { name: "Salud", href: "/salud", icon: Dumbbell },
  { name: "Estudios", href: "/estudios", icon: GraduationCap },
  { name: "Calendario", href: "/calendario", icon: CalendarDays },
  { name: "Objetivos", href: "/objetivos", icon: Target },
];

export function Sidebar() {
  const pathname = usePathname();

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

      
    </aside>
  );
}