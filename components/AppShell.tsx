import { Sidebar } from "@/components/Sidebar";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030303] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.16),transparent_35%),radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_30%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1800px]">
        <Sidebar />

        <section className="flex-1 p-6 lg:p-10">{children}</section>
      </div>
    </main>
  );
}