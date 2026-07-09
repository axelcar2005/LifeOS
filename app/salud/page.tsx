import { AppShell } from "@/components/AppShell";
import { HealthClient } from "@/components/HealthClient";

export default function SaludPage() {
  return (
    <AppShell>
      <HealthClient />
    </AppShell>
  );
}