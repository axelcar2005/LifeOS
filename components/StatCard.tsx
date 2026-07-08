import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  color: string;
};

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:bg-white/[0.05]">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-white/40">{title}</p>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
          <Icon size={18} className={color} />
        </div>
      </div>

      <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>

      <p className="mt-3 text-sm leading-relaxed text-white/40">
        {description}
      </p>
    </div>
  );
}