import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color?: string;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = "text-white",
}: StatCardProps) {
  return (
    <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-3 transition hover:-translate-y-1 hover:bg-white/[0.05] sm:p-5 lg:p-6">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <p className="min-w-0 truncate text-[11px] text-white/40 sm:text-sm">
          {title}
        </p>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-white/10 sm:h-10 sm:w-10">
          <Icon size={16} className={color} />
        </div>
      </div>

      <h3 className={`min-w-0 truncate text-lg font-bold sm:text-3xl ${color}`}>
        {value}
      </h3>

      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-white/40 sm:text-sm">
        {description}
      </p>
    </div>
  );
}