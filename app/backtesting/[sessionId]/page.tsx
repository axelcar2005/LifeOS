import { AppShell } from "@/components/AppShell";
import { BacktestingSessionClient } from "@/components/BacktestingSessionClient";

type BacktestingSessionPageProps = {
  params: Promise<{
    sessionId: string;
  }>;
};

export default async function BacktestingSessionPage({
  params,
}: BacktestingSessionPageProps) {
  const { sessionId } = await params;

  return (
    <AppShell>
      <BacktestingSessionClient sessionId={sessionId} />
    </AppShell>
  );
}