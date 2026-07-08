import { AppShell } from "@/components/AppShell";
import { TradingJournalClient } from "@/components/TradingJournalClient";

export default function TradingPage() {
  return (
    <AppShell>
      <TradingJournalClient />
    </AppShell>
  );
}