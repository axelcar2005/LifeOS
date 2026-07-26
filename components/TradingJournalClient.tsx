"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from "react";
import html2canvas from "html2canvas";
import {
  BarChart3,
  Brain,
  CalendarDays,
  CircleDollarSign,
  Download,
  Eye,
  ImageIcon,
  Pencil,
  Save,
  Search,
  ShieldCheck,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from "lucide-react";

import { StatCard } from "@/components/StatCard";
import { TradingCalendar } from "@/components/TradingCalendar";
import { Trade, TradeEntryModal } from "@/components/TradeEntryModal";
import {
  FundedAccountsPanel,
  type FundedAccount,
} from "@/components/FundedAccountsPanel";

const initialTrades: Trade[] = [];

const initialRules = [
  {
    title: "Máximo 2 operaciones",
    description: "Evitar sobreoperar después de una pérdida.",
  },
  {
    title: "RR mínimo 1:2",
    description: "Buscar buenas entradas, no operar por ansiedad.",
  },
  {
    title: "Registrar todo",
    description: "Screenshot, razón de entrada, emoción y resultado.",
  },
];

const storageKeys = {
  trades: "lifeos-trading-trades",
  rules: "lifeos-trading-rules",
  rrTarget: "lifeos-trading-rr-target",
  accounts: "lifeos-trading-accounts",
};

function createDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - daysFromMonday);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: createDateKey(start),
    end: createDateKey(end),
  };
}

function getWeekdayName(date: string) {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
  }).format(new Date(`${date}T00:00:00`));
}

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getExportColor(color: string) {
  if (color.startsWith("#")) return color;

  const colors: Record<string, string> = {
    "text-emerald-400": "#34d399",
    "text-red-400": "#f87171",
    "text-blue-300": "#93c5fd",
    "text-yellow-300": "#facc15",
    "text-white": "#ffffff",
  };

  return colors[color] ?? "#ffffff";
}

function addDaysToDateKey(dateKey: string, daysToAdd: number) {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + daysToAdd);

  return createDateKey(date);
}

function getWeekCalendarDays(startDate: string) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDaysToDateKey(startDate, index);

    return {
      date,
      day: Number(date.split("-")[2]),
      isCurrentMonth: true,
    };
  });
}

function getMonthCalendarDays(monthKey: string) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);

  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  const days: Array<{
    date: string;
    day: number;
    isCurrentMonth: boolean;
  }> = [];

  const previousMonthLastDay = new Date(year, month - 1, 0).getDate();

  for (let index = startDay - 1; index >= 0; index--) {
    const day = previousMonthLastDay - index;
    const date = new Date(year, month - 2, day);

    days.push({
      date: createDateKey(date),
      day,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);

    days.push({
      date: createDateKey(date),
      day,
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - days.length;

  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month, day);

    days.push({
      date: createDateKey(date),
      day,
      isCurrentMonth: false,
    });
  }

  return days;
}

function getUniqueValues(trades: Trade[], field: keyof Trade) {
  return Array.from(
    new Set(
      trades
        .map((trade) => String(trade[field] || "").trim())
        .filter(Boolean)
    )
  ).sort();
}

function getDirectionLabel(tradeList: Trade[]) {
  const uniqueDirections = [
    ...new Set(tradeList.map((trade) => trade.direction).filter(Boolean)),
  ];

  if (tradeList.length === 0) return "Sin trades";
  if (uniqueDirections.length === 1) return uniqueDirections[0];

  return "Mixto";
}

export function TradingJournalClient() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const [accounts, setAccounts] = useState<FundedAccount[]>([]);
  const [rules, setRules] = useState(initialRules);
  const [editingRules, setEditingRules] = useState(false);
  const [rrTarget, setRrTarget] = useState("1:2");
  const [editingRR, setEditingRR] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [isAccountsOpen, setIsAccountsOpen] = useState(false);

  const [filters, setFilters] = useState({
    account: "Todos",
    asset: "Todos",
    direction: "Todos",
    result: "Todos",
    setup: "Todos",
    emotion: "Todos",
    month: "Todos",
  });

  const selectedTradeExportRef = useRef<HTMLDivElement | null>(null);
const socialPostSquareExportRef = useRef<HTMLDivElement | null>(null);
const socialPostVerticalExportRef = useRef<HTMLDivElement | null>(null);
const weeklyReportExportRef = useRef<HTMLDivElement | null>(null);
const monthlyReportExportRef = useRef<HTMLDivElement | null>(null);

const [socialExportFormat, setSocialExportFormat] = useState<
  "square" | "vertical"
>("vertical");

  useEffect(() => {
  async function loadTradingData() {
    try {
      const savedRules = localStorage.getItem(storageKeys.rules);
      const savedRrTarget = localStorage.getItem(storageKeys.rrTarget);
      const savedAccounts = localStorage.getItem(storageKeys.accounts);

      if (savedRules) setRules(JSON.parse(savedRules));
      if (savedRrTarget) setRrTarget(savedRrTarget);
      if (savedAccounts) setAccounts(JSON.parse(savedAccounts));

      const response = await fetch("/api/trades");
      const data = await response.json();

      if (!response.ok) {
        console.error("Error cargando trades:", data.error);
        setTrades([]);
        return;
      }

      setTrades(data.trades ?? []);
    } catch (error) {
      console.error("Error cargando trading data:", error);
      setTrades([]);
    } finally {
      setLoaded(true);
    }
  }

  loadTradingData();
}, []);



  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKeys.rules, JSON.stringify(rules));
  }, [rules, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKeys.rrTarget, rrTarget);
  }, [rrTarget, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKeys.accounts, JSON.stringify(accounts));
  }, [accounts, loaded]);

  function addAccount(account: FundedAccount) {
    setAccounts((currentAccounts) => [account, ...currentAccounts]);
  }

  function deleteAccount(accountId: string) {
    setAccounts((currentAccounts) =>
      currentAccounts.filter((account) => account.id !== accountId)
    );
  }

  async function addTrade(trade: Trade) {
  try {
    const response = await fetch("/api/trades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(trade),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error guardando trade:", data.error);
      alert(`No se pudo guardar el trade en la nube: ${data.error}`);
      return;
    }

    setTrades((currentTrades) => [data.trade, ...currentTrades]);
  } catch (error) {
    console.error("Error guardando trade:", error);
    alert("Error guardando el trade.");
  }
}
  async function deleteTrade(tradeId: string) {
  try {
    const response = await fetch(`/api/trades?id=${tradeId}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error eliminando trade:", data.error);
      alert(`No se pudo eliminar el trade: ${data.error}`);
      return;
    }

    setTrades((currentTrades) =>
      currentTrades.filter((trade) => trade.id !== tradeId)
    );

    setSelectedTrade((currentTrade) =>
      currentTrade?.id === tradeId ? null : currentTrade
    );

    setEditingTrade((currentTrade) =>
      currentTrade?.id === tradeId ? null : currentTrade
    );
  } catch (error) {
    console.error("Error eliminando trade:", error);
    alert("Error eliminando el trade.");
  }
}

  function openEditTrade(trade: Trade) {
    setEditingTrade({ ...trade });
  }

  function updateEditingTrade(field: keyof Trade, value: string) {
    setEditingTrade((currentTrade) => {
      if (!currentTrade) return currentTrade;

      return {
        ...currentTrade,
        [field]: value,
      };
    });
  }

  function handleEditImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      updateEditingTrade("image", String(reader.result || ""));
    };

    reader.readAsDataURL(file);
  }

  async function saveEditedTrade(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  if (!editingTrade) return;

  try {
    const response = await fetch("/api/trades", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(editingTrade),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Error editando trade:", data.error);
      alert(`No se pudo editar el trade: ${data.error}`);
      return;
    }

    setTrades((currentTrades) =>
      currentTrades.map((trade) =>
        trade.id === data.trade.id ? data.trade : trade
      )
    );

    setSelectedTrade((currentTrade) =>
      currentTrade?.id === data.trade.id ? data.trade : currentTrade
    );

    setEditingTrade(null);
  } catch (error) {
    console.error("Error editando trade:", error);
    alert("Error editando el trade.");
  }
}

  function updateRule(
    index: number,
    field: "title" | "description",
    value: string
  ) {
    setRules((currentRules) =>
      currentRules.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [field]: value } : rule
      )
    );
  }

  function addRule() {
    setRules((currentRules) => [
      ...currentRules,
      {
        title: "Nueva regla",
        description: "Describe aquí tu regla.",
      },
    ]);
  }

  function deleteRule(index: number) {
    setRules((currentRules) =>
      currentRules.filter((_, ruleIndex) => ruleIndex !== index)
    );
  }

  async function exportElementAsImage(
    element: HTMLDivElement | null,
    fileName: string
  ) {
    if (!element) return;

    const canvas = await html2canvas(element, {
      backgroundColor: "#080808",
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imageUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");

    downloadLink.href = imageUrl;
    downloadLink.download = `${sanitizeFileName(fileName) || "lifeos-export"}.png`;
    downloadLink.click();
  }

  function exportSelectedTradeAsImage() {
    if (!selectedTrade) return;

    exportElementAsImage(
      selectedTradeExportRef.current,
      `trade-${selectedTrade.date}-${selectedTrade.account}-${selectedTrade.asset}`
    );
  }

  function exportSocialPostAsImage(format = socialExportFormat) {
  if (!selectedTrade) return;

  const exportRef =
    format === "square" ? socialPostSquareExportRef : socialPostVerticalExportRef;

  exportElementAsImage(
    exportRef.current,
    `${format === "square" ? "post-1x1" : "post-vertical"}-${
      selectedTrade.date
    }-${selectedTrade.account}-${selectedTrade.asset}`
  );
}

  function exportWeeklyReportAsImage() {
    exportElementAsImage(
      weeklyReportExportRef.current,
      `journal-semana-${currentWeekRange.start}-${currentWeekRange.end}`
    );
  }

  function exportMonthlyReportAsImage() {
    exportElementAsImage(
      monthlyReportExportRef.current,
      `journal-mes-${currentMonthKey}`
    );
  }

  function resetFilters() {
    setFilters({
      account: "Todos",
      asset: "Todos",
      direction: "Todos",
      result: "Todos",
      setup: "Todos",
      emotion: "Todos",
      month: "Todos",
    });
  }

  const registeredTrades = trades.filter(
    (trade) => trade.status === "Registrado"
  );

  const totalPnL = registeredTrades.reduce(
    (total, trade) => total + Number(trade.result || 0),
    0
  );

  const winningTrades = registeredTrades.filter(
    (trade) => Number(trade.result) > 0
  );

  const winRate =
    registeredTrades.length > 0
      ? Math.round((winningTrades.length / registeredTrades.length) * 100)
      : 0;

  const tradesByDate = registeredTrades.reduce<Record<string, number>>(
    (totals, trade) => {
      totals[trade.date] =
        (totals[trade.date] || 0) + Number(trade.result || 0);
      return totals;
    },
    {}
  );

  const dailyResults = Object.entries(tradesByDate).map(([date, total]) => ({
    date,
    total,
  }));

  const bestDay =
    dailyResults.length > 0
      ? dailyResults.reduce((best, day) => (day.total > best.total ? day : best))
      : null;

  const worstDay =
    dailyResults.length > 0
      ? dailyResults.reduce((worst, day) =>
          day.total < worst.total ? day : worst
        )
      : null;

  const averagePerTrade =
    registeredTrades.length > 0 ? totalPnL / registeredTrades.length : 0;

  const biggestWin =
    registeredTrades.length > 0
      ? registeredTrades.reduce((best, trade) =>
          Number(trade.result) > Number(best.result) ? trade : best
        )
      : null;

  const biggestLoss =
    registeredTrades.length > 0
      ? registeredTrades.reduce((worst, trade) =>
          Number(trade.result) < Number(worst.result) ? trade : worst
        )
      : null;

  function getMostRepeatedValueFromTrades(
    tradeList: Trade[],
    field: "setup" | "emotion" | "account"
  ) {
    const counts = new Map<string, number>();

    tradeList.forEach((trade) => {
      const value = trade[field]?.trim();

      if (!value) return;

      counts.set(value, (counts.get(value) || 0) + 1);
    });

    let mostRepeated = "—";
    let highestCount = 0;

    counts.forEach((count, value) => {
      if (count > highestCount) {
        highestCount = count;
        mostRepeated = value;
      }
    });

    return mostRepeated;
  }

  function getMostRepeatedValue(field: "setup" | "emotion" | "account") {
    return getMostRepeatedValueFromTrades(registeredTrades, field);
  }

  const insightCards = [
    {
      label: "Mejor día",
      value: bestDay ? `$${bestDay.total}` : "—",
      description: bestDay ? bestDay.date : "Sin datos",
      color: "text-emerald-400",
    },
    {
      label: "Peor día",
      value: worstDay ? `$${worstDay.total}` : "—",
      description: worstDay ? worstDay.date : "Sin datos",
      color: "text-red-400",
    },
    {
      label: "Promedio por trade",
      value:
        registeredTrades.length > 0 ? `$${averagePerTrade.toFixed(0)}` : "—",
      description: "Resultado promedio",
      color: averagePerTrade >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Mayor ganancia",
      value:
        biggestWin && Number(biggestWin.result) > 0
          ? `$${biggestWin.result}`
          : "—",
      description: biggestWin?.setup || "Sin datos",
      color: "text-emerald-400",
    },
    {
      label: "Mayor pérdida",
      value:
        biggestLoss && Number(biggestLoss.result) < 0
          ? `$${biggestLoss.result}`
          : "—",
      description: biggestLoss?.setup || "Sin datos",
      color: "text-red-400",
    },
    {
      label: "Setup más usado",
      value: getMostRepeatedValue("setup"),
      description: "Según tus trades",
      color: "text-white",
    },
    {
      label: "Emoción frecuente",
      value: getMostRepeatedValue("emotion"),
      description: "Tu estado más repetido",
      color: "text-blue-300",
    },
  ];

  const currentWeekRange = getCurrentWeekRange();

  const weeklyTrades = registeredTrades.filter(
    (trade) =>
      trade.date >= currentWeekRange.start && trade.date <= currentWeekRange.end
  );

  const weeklyPnL = weeklyTrades.reduce(
    (total, trade) => total + Number(trade.result || 0),
    0
  );

  const weeklyWinningTrades = weeklyTrades.filter(
    (trade) => Number(trade.result) > 0
  );

  const weeklyWinRate =
    weeklyTrades.length > 0
      ? Math.round((weeklyWinningTrades.length / weeklyTrades.length) * 100)
      : 0;

  const weeklyTradesByDate = weeklyTrades.reduce<
    Record<string, { date: string; total: number; count: number }>
  >((totals, trade) => {
    if (!totals[trade.date]) {
      totals[trade.date] = {
        date: trade.date,
        total: 0,
        count: 0,
      };
    }

    totals[trade.date].total += Number(trade.result || 0);
    totals[trade.date].count += 1;

    return totals;
  }, {});

  const weeklyDailyResults = Object.values(weeklyTradesByDate);

  const weeklyBestDay =
    weeklyDailyResults.length > 0
      ? weeklyDailyResults.reduce((best, day) =>
          day.total > best.total ? day : best
        )
      : null;

  const weeklyWorstDay =
    weeklyDailyResults.length > 0
      ? weeklyDailyResults.reduce((worst, day) =>
          day.total < worst.total ? day : worst
        )
      : null;

  const weeklyReportCards = [
    {
      label: "Trades semana",
      value: `${weeklyTrades.length}`,
      description: `${currentWeekRange.start} a ${currentWeekRange.end}`,
      color: "text-white",
    },
    {
      label: "P&L semanal",
      value: `$${weeklyPnL}`,
      description: "Resultado total de la semana",
      color: weeklyPnL >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Win Rate semanal",
      value: `${weeklyWinRate}%`,
      description: `${weeklyWinningTrades.length} ganadas de ${weeklyTrades.length}`,
      color: "text-blue-300",
    },
    {
      label: "Mejor día",
      value: weeklyBestDay ? `$${weeklyBestDay.total}` : "—",
      description: weeklyBestDay
        ? `${getWeekdayName(weeklyBestDay.date)} · ${weeklyBestDay.date}`
        : "Sin datos",
      color: "text-emerald-400",
    },
    {
      label: "Peor día",
      value: weeklyWorstDay ? `$${weeklyWorstDay.total}` : "—",
      description: weeklyWorstDay
        ? `${getWeekdayName(weeklyWorstDay.date)} · ${weeklyWorstDay.date}`
        : "Sin datos",
      color: "text-red-400",
    },
    {
      label: "Setup semanal",
      value: getMostRepeatedValueFromTrades(weeklyTrades, "setup"),
      description: "Setup más repetido esta semana",
      color: "text-yellow-300",
    },
  ];

  const currentMonthKey = new Date().toISOString().slice(0, 7);

  const monthlyTrades = registeredTrades.filter((trade) =>
    trade.date.startsWith(currentMonthKey)
  );

  const monthlyPnL = monthlyTrades.reduce(
    (total, trade) => total + Number(trade.result || 0),
    0
  );

  const monthlyWinningTrades = monthlyTrades.filter(
    (trade) => Number(trade.result) > 0
  );

  const monthlyWinRate =
    monthlyTrades.length > 0
      ? Math.round((monthlyWinningTrades.length / monthlyTrades.length) * 100)
      : 0;

  const monthlyTradesByDate = monthlyTrades.reduce<
    Record<string, { date: string; total: number; count: number }>
  >((totals, trade) => {
    if (!totals[trade.date]) {
      totals[trade.date] = {
        date: trade.date,
        total: 0,
        count: 0,
      };
    }

    totals[trade.date].total += Number(trade.result || 0);
    totals[trade.date].count += 1;

    return totals;
  }, {});

  const monthlyDailyResults = Object.values(monthlyTradesByDate);

  const monthlyBestDay =
    monthlyDailyResults.length > 0
      ? monthlyDailyResults.reduce((best, day) =>
          day.total > best.total ? day : best
        )
      : null;

  const monthlyWorstDay =
    monthlyDailyResults.length > 0
      ? monthlyDailyResults.reduce((worst, day) =>
          day.total < worst.total ? day : worst
        )
      : null;

  const monthlyReportCards = [
    {
      label: "Trades del mes",
      value: `${monthlyTrades.length}`,
      description: currentMonthKey,
      color: "#ffffff",
    },
    {
      label: "P&L mensual",
      value: `$${monthlyPnL}`,
      description: "Resultado total del mes",
      color: monthlyPnL >= 0 ? "#34d399" : "#f87171",
    },
    {
      label: "Win Rate mensual",
      value: `${monthlyWinRate}%`,
      description: `${monthlyWinningTrades.length} ganadas de ${monthlyTrades.length}`,
      color: "#93c5fd",
    },
    {
      label: "Mejor día",
      value: monthlyBestDay ? `$${monthlyBestDay.total}` : "—",
      description: monthlyBestDay
        ? `${getWeekdayName(monthlyBestDay.date)} · ${monthlyBestDay.date}`
        : "Sin datos",
      color: "#34d399",
    },
    {
      label: "Peor día",
      value: monthlyWorstDay ? `$${monthlyWorstDay.total}` : "—",
      description: monthlyWorstDay
        ? `${getWeekdayName(monthlyWorstDay.date)} · ${monthlyWorstDay.date}`
        : "Sin datos",
      color: "#f87171",
    },
    {
      label: "Setup del mes",
      value: getMostRepeatedValueFromTrades(monthlyTrades, "setup"),
      description: "Setup más repetido este mes",
      color: "#facc15",
    },
  ];

  const weeklyExportDays = getWeekCalendarDays(currentWeekRange.start);
  const monthlyExportDays = getMonthCalendarDays(currentMonthKey);

  function renderExportCalendar(
    days: Array<{ date: string; day: number; isCurrentMonth: boolean }>,
    tradeList: Trade[],
    type: "week" | "month"
  ) {
    const weekLabels =
      type === "month"
        ? ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
        : days.map((day) => getWeekdayName(day.date).slice(0, 3).toUpperCase());

    return (
      <div style={{ marginBottom: "28px" }}>
        <p
          style={{
            color: "#9ca3af",
            fontSize: "15px",
            margin: "0 0 12px",
          }}
        >
          Calendario de operaciones
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          {weekLabels.map((label) => (
            <div
              key={label}
              style={{
                color: "#71717a",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "center",
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px",
          }}
        >
          {days.map((day) => {
            const dayTrades = tradeList.filter(
              (trade) => trade.date === day.date
            );

            const dayPnL = dayTrades.reduce(
              (total, trade) => total + Number(trade.result || 0),
              0
            );

            const isPositive = dayPnL > 0;
            const isNegative = dayPnL < 0;
            const directionLabel = getDirectionLabel(dayTrades);
            const tradeCountLabel =
              dayTrades.length === 1 ? "1 trade" : `${dayTrades.length} trades`;
            const calendarDayLabel =
              dayTrades.length > 0
                ? `${directionLabel} · ${tradeCountLabel}`
                : "Sin trades";

            return (
              <div
                key={day.date}
                style={{
                  minHeight: type === "month" ? "110px" : "140px",
                  border: `1px solid ${
                    isPositive
                      ? "#064e3b"
                      : isNegative
                      ? "#7f1d1d"
                      : "#27272a"
                  }`,
                  background: isPositive
                    ? "#022c22"
                    : isNegative
                    ? "#450a0a"
                    : "#000000",
                  borderRadius: "18px",
                  padding: "14px",
                  opacity: day.isCurrentMonth ? 1 : 0.35,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span
                    style={{
                      color: "#ffffff",
                      fontSize: "18px",
                      fontWeight: 800,
                    }}
                  >
                    {day.day}
                  </span>
                </div>

                {dayTrades.length > 0 ? (
                  <>
                    <p
                      style={{
                        color: isPositive ? "#34d399" : "#f87171",
                        fontSize: "20px",
                        fontWeight: 800,
                        margin: "0 0 8px",
                      }}
                    >
                      ${dayPnL}
                    </p>

                    <p
                      style={{
                        color: "#a1a1aa",
                        fontSize: "12px",
                        margin: 0,
                      }}
                    >
                      {calendarDayLabel}
                    </p>
                  </>
                ) : (
                  <p
                    style={{
                      color: "#3f3f46",
                      fontSize: "12px",
                      margin: 0,
                    }}
                  >
                    Sin trades
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const tradingStats = [
    {
      title: "P&L mensual",
      value: `$${totalPnL}`,
      description: "Ganancia o pérdida acumulada del mes.",
      icon: CircleDollarSign,
      color: totalPnL >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      description: "Porcentaje de operaciones ganadoras.",
      icon: BarChart3,
      color: "text-blue-300",
    },
    {
      title: "RR objetivo",
      value: rrTarget,
      description: "Ratio riesgo/beneficio que quieres usar.",
      icon: Target,
      color: "text-orange-300",
    },
    {
      title: "Trades",
      value: `${registeredTrades.length}`,
      description: "Operaciones registradas este mes.",
      icon: TrendingUp,
      color: "text-white",
    },
  ];

  const availableMonths = Array.from(
    new Set(trades.map((trade) => trade.date.slice(0, 7)).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const accountOptions = getUniqueValues(trades, "account");
  const assetOptions = getUniqueValues(trades, "asset");
  const setupOptions = getUniqueValues(trades, "setup");
  const emotionOptions = getUniqueValues(trades, "emotion");

  const filteredTrades = useMemo(() => {
    return trades.filter((trade) => {
      const resultNumber = Number(trade.result || 0);

      const matchesAccount =
        filters.account === "Todos" || trade.account === filters.account;

      const matchesAsset =
        filters.asset === "Todos" || trade.asset === filters.asset;

      const matchesDirection =
        filters.direction === "Todos" || trade.direction === filters.direction;

      const matchesSetup =
        filters.setup === "Todos" || trade.setup === filters.setup;

      const matchesEmotion =
        filters.emotion === "Todos" || trade.emotion === filters.emotion;

      const matchesMonth =
        filters.month === "Todos" || trade.date.startsWith(filters.month);

      const matchesResult =
        filters.result === "Todos" ||
        (filters.result === "Ganadas" && resultNumber > 0) ||
        (filters.result === "Perdidas" && resultNumber < 0) ||
        (filters.result === "BE" && resultNumber === 0);

      return (
        matchesAccount &&
        matchesAsset &&
        matchesDirection &&
        matchesSetup &&
        matchesEmotion &&
        matchesMonth &&
        matchesResult
      );
    });
  }, [trades, filters]);

  return (
    <>
      <header className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/50">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Módulo Trading Journal
          </div>

          <p className="text-sm text-white/40">Journal y estadísticas</p>

          <h2 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Trading Journal
          </h2>

          <p className="mt-4 max-w-2xl text-white/50">
            Registra tus operaciones, controla tu riesgo, analiza tus errores y
            mide tu progreso como trader.
          </p>
        </div>

        <TradeEntryModal
          onAddTrade={addTrade}
          accounts={accounts.map((account) => account.name)}
        />
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {tradingStats.map((stat) => {
          const Icon = stat.icon;

          if (stat.title === "RR objetivo") {
            return (
              <div
                key={stat.title}
                className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.035] p-3 transition hover:-translate-y-1 hover:bg-white/[0.05] sm:p-5 lg:p-6"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-white/40">{stat.title}</p>

                  <button
                    onClick={() => setEditingRR(!editingRR)}
                    className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-orange-300 transition hover:bg-white/20"
                    title="Editar RR objetivo"
                  >
                    {editingRR ? <Save size={18} /> : <Pencil size={18} />}
                  </button>
                </div>

                {editingRR ? (
                  <select
                    value={rrTarget}
                    onChange={(event) => setRrTarget(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-2xl font-bold text-orange-300 outline-none focus:border-emerald-400"
                  >
                    <option>1:1</option>
                    <option>1:1.5</option>
                    <option>1:2</option>
                    <option>1:3</option>
                    <option>1:4</option>
                    <option>1:5</option>
                  </select>
                ) : (
                  <h3 className="truncate text-xl font-bold text-orange-300 sm:text-3xl">
                    {rrTarget}
                  </h3>
                )}

                <p className="mt-3 text-sm leading-relaxed text-white/40">
                  Ratio riesgo/beneficio que quieres usar.
                </p>
              </div>
            );
          }

          return (
            <StatCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              description={stat.description}
              icon={Icon}
              color={stat.color}
            />
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/40">Control automático</p>
            <h3 className="mt-1 text-2xl font-bold">Cuentas fondeadas</h3>
            <p className="mt-2 max-w-2xl text-sm text-white/40">
              Revisa balance, colchón, drawdown EOD y progreso de tus cuentas.
            </p>
          </div>

          <button
            onClick={() => setIsAccountsOpen(true)}
            className="w-full rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300 sm:w-fit"
          >
            Ver cuentas
          </button>
        </div>
      </div>

      <div className="mt-6">
        <TradingCalendar trades={trades} onSelectTrade={setSelectedTrade} />
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Análisis del journal</p>
            <h3 className="mt-1 text-2xl font-bold">Estadísticas clave</h3>
          </div>

          <button
            onClick={exportMonthlyReportAsImage}
            className="inline-flex w-fit items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-white/90"
          >
            <Download size={16} />
            Exportar mes
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {insightCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-black/40 p-4"
            >
              <p className="text-xs text-white/40">{card.label}</p>
              <p className={`mt-2 text-xl font-bold ${card.color}`}>
                {card.value}
              </p>
              <p className="mt-1 truncate text-xs text-white/35">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Revisión automática</p>
            <h3 className="mt-1 text-2xl font-bold">Reporte semanal</h3>
            <p className="mt-2 text-sm text-white/40">
              Resumen de tus operaciones desde el lunes hasta el domingo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-white/50">
              {currentWeekRange.start} → {currentWeekRange.end}
            </span>

            <button
              onClick={exportWeeklyReportAsImage}
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-white/90"
            >
              <Download size={16} />
              Exportar semana
            </button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {weeklyReportCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-black/40 p-4"
            >
              <p className="text-xs text-white/40">{card.label}</p>
              <p className={`mt-2 text-xl font-bold ${card.color}`}>
                {card.value}
              </p>
              <p className="mt-1 truncate text-xs text-white/35">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
  <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 md:p-6 xl:col-span-2">
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-sm text-white/40">Registro</p>
        <h3 className="text-2xl font-bold">Últimas operaciones</h3>
        <p className="mt-2 text-sm text-white/40">
          Usa filtros para revisar solo pérdidas, setups, emociones o cuentas
          específicas.
        </p>
      </div>

      <span className="w-fit rounded-full bg-white/10 px-4 py-2 text-xs text-white/60">
        {filteredTrades.length} de {trades.length} trades
      </span>
    </div>

    {/* Mobile: filtros rápidos + tarjetas */}
    <div className="md:hidden">
      <div className="mb-5">
        <p className="mb-3 text-sm font-bold text-white">Filtros rápidos</p>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={filters.result}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                result: event.target.value,
              }))
            }
            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-xs text-white outline-none focus:border-emerald-400"
          >
            <option>Todos</option>
            <option>Ganadas</option>
            <option>Perdidas</option>
            <option>BE</option>
          </select>

          <select
            value={filters.direction}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                direction: event.target.value,
              }))
            }
            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-xs text-white outline-none focus:border-emerald-400"
          >
            <option>Todos</option>
            <option>Long</option>
            <option>Short</option>
          </select>

          <select
            value={filters.month}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                month: event.target.value,
              }))
            }
            className="rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-xs text-white outline-none focus:border-emerald-400"
          >
            <option>Todos</option>
            {availableMonths.map((month) => (
              <option key={month}>{month}</option>
            ))}
          </select>

          <button
            onClick={resetFilters}
            className="rounded-2xl border border-white/10 px-3 py-3 text-xs font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTrades.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/40">
            No hay operaciones registradas.
          </div>
        ) : (
          filteredTrades.map((trade) => {
            const resultNumber = Number(trade.result);

            return (
              <div
                key={trade.id}
                className="rounded-2xl border border-white/10 bg-black/35 p-4"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">
                      {trade.date}
                    </p>

                    <p className="mt-1 truncate text-xs text-white/40">
                      {trade.account} · {trade.asset} · {trade.direction}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-lg font-bold ${
                      resultNumber >= 0 ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    ${trade.result}
                  </p>
                </div>

                <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-xs text-white/35">Setup</p>
                  <p className="mt-1 line-clamp-2 text-sm text-white/75">
                    {trade.setup || "Sin setup"}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/45">
                    {trade.emotion || "Sin emoción"}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedTrade(trade)}
                      className="rounded-xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      onClick={() => openEditTrade(trade)}
                      className="rounded-xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
                      title="Editar operación"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() => deleteTrade(trade.id)}
                      className="rounded-xl bg-red-400/10 p-2 text-red-400 transition hover:bg-red-400/20"
                      title="Borrar operación"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>

    {/* Desktop: filtros completos */}
    <div className="mb-5 hidden rounded-3xl border border-white/10 bg-black/30 p-4 md:block">
      <div className="mb-4 flex items-center gap-2">
        <Search size={16} className="text-emerald-400" />
        <p className="text-sm font-bold text-white">Filtros</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <select
          value={filters.account}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              account: event.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
        >
          <option>Todos</option>
          {accountOptions.map((account) => (
            <option key={account}>{account}</option>
          ))}
        </select>

        <select
          value={filters.asset}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              asset: event.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
        >
          <option>Todos</option>
          {assetOptions.map((asset) => (
            <option key={asset}>{asset}</option>
          ))}
        </select>

        <select
          value={filters.direction}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              direction: event.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
        >
          <option>Todos</option>
          <option>Long</option>
          <option>Short</option>
        </select>

        <select
          value={filters.result}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              result: event.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
        >
          <option>Todos</option>
          <option>Ganadas</option>
          <option>Perdidas</option>
          <option>BE</option>
        </select>

        <select
          value={filters.setup}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              setup: event.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
        >
          <option>Todos</option>
          {setupOptions.map((setup) => (
            <option key={setup}>{setup}</option>
          ))}
        </select>

        <select
          value={filters.emotion}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              emotion: event.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
        >
          <option>Todos</option>
          {emotionOptions.map((emotion) => (
            <option key={emotion}>{emotion}</option>
          ))}
        </select>

        <select
          value={filters.month}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              month: event.target.value,
            }))
          }
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
        >
          <option>Todos</option>
          {availableMonths.map((month) => (
            <option key={month}>{month}</option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    {/* Desktop: tabla */}
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-[720px] w-full text-left text-sm">
        <thead className="bg-white/[0.04] text-white/40">
          <tr>
            <th className="px-4 py-4 font-medium">Fecha</th>
            <th className="px-4 py-4 font-medium">Cuenta</th>
            <th className="px-4 py-4 font-medium">Setup</th>
            <th className="px-4 py-4 font-medium">Resultado</th>
            <th className="px-4 py-4 font-medium">Imagen</th>
            <th className="px-4 py-4 font-medium">Acción</th>
          </tr>
        </thead>

        <tbody>
          {filteredTrades.length === 0 ? (
            <tr className="border-t border-white/10">
              <td colSpan={6} className="px-4 py-10 text-center text-white/40">
                No hay operaciones con esos filtros.
              </td>
            </tr>
          ) : (
            filteredTrades.map((trade) => {
              const resultNumber = Number(trade.result);

              return (
                <tr key={trade.id} className="border-t border-white/10">
                  <td className="px-4 py-4 text-white/60">{trade.date}</td>
                  <td className="px-4 py-4 text-white">{trade.account}</td>
                  <td className="px-4 py-4 text-white/60">{trade.setup}</td>
                  <td
                    className={`px-4 py-4 ${
                      resultNumber >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    ${trade.result}
                  </td>
                  <td className="px-4 py-4">
                    {trade.image ? (
                      <ImageIcon size={16} className="text-emerald-400" />
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedTrade(trade)}
                        className="rounded-xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
                        title="Ver detalle"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => openEditTrade(trade)}
                        className="rounded-xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
                        title="Editar operación"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => deleteTrade(trade.id)}
                        className="rounded-xl bg-red-400/10 p-2 text-red-400 transition hover:bg-red-400/20"
                        title="Borrar operación"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>

  <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 md:p-6">
    <div className="mb-6 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
          <CalendarDays size={20} className="text-emerald-400" />
        </div>

        <div>
          <p className="text-sm text-white/40">Plan diario</p>
          <h3 className="text-xl font-bold">Reglas del día</h3>
        </div>
      </div>

      <button
        onClick={() => setEditingRules(!editingRules)}
        className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
        title="Editar reglas"
      >
        {editingRules ? <Save size={18} /> : <Pencil size={18} />}
      </button>
    </div>

    <div className="space-y-4">
      {rules.map((rule, index) => (
        <div
          key={index}
          className="rounded-2xl border border-white/10 bg-black/40 p-3 md:p-4"
        >
          {editingRules ? (
            <div className="space-y-3">
              <input
                value={rule.title}
                onChange={(event) =>
                  updateRule(index, "title", event.target.value)
                }
                className="w-full rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-emerald-400"
              />

              <textarea
                value={rule.description}
                onChange={(event) =>
                  updateRule(index, "description", event.target.value)
                }
                rows={2}
                className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-3 py-2 text-sm text-white/70 outline-none focus:border-emerald-400"
              />

              <button
                onClick={() => deleteRule(index)}
                className="flex items-center gap-2 text-xs text-red-400 transition hover:text-red-300"
              >
                <X size={14} />
                Borrar regla
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold">{rule.title}</p>
              <p className="mt-1 text-sm text-white/40">{rule.description}</p>
            </>
          )}
        </div>
      ))}
    </div>

    {editingRules && (
      <button
        onClick={addRule}
        className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
      >
        + Agregar regla
      </button>
    )}
  </div>
</div>

      <div
        style={{
          position: "fixed",
          left: "-99999px",
          top: "0",
          width: "1100px",
          background: "#080808",
          color: "#ffffff",
          padding: "32px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          ref={weeklyReportExportRef}
          style={{
            width: "100%",
            background: "#080808",
            border: "1px solid #27272a",
            borderRadius: "24px",
            padding: "28px",
          }}
        >
          <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>
            Life OS Trading Journal
          </p>

          <h1 style={{ fontSize: "32px", margin: "8px 0 4px" }}>
            Reporte semanal
          </h1>

          <p style={{ color: "#9ca3af", margin: "0 0 24px" }}>
            {currentWeekRange.start} → {currentWeekRange.end}
          </p>

          {renderExportCalendar(weeklyExportDays, weeklyTrades, "week")}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            {weeklyReportCards.map((card) => (
              <div
                key={card.label}
                style={{
                  border: "1px solid #27272a",
                  background: "#000000",
                  borderRadius: "18px",
                  padding: "18px",
                }}
              >
                <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
                  {card.label}
                </p>

                <p
                  style={{
                    color: getExportColor(card.color),
                    fontSize: "26px",
                    fontWeight: 800,
                    margin: "10px 0 4px",
                  }}
                >
                  {card.value}
                </p>

                <p style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={monthlyReportExportRef}
          style={{
            width: "100%",
            marginTop: "32px",
            background: "#080808",
            border: "1px solid #27272a",
            borderRadius: "24px",
            padding: "28px",
          }}
        >
          <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>
            Life OS Trading Journal
          </p>

          <h1 style={{ fontSize: "32px", margin: "8px 0 4px" }}>
            Reporte mensual
          </h1>

          <p style={{ color: "#9ca3af", margin: "0 0 24px" }}>
            {currentMonthKey}
          </p>

          {renderExportCalendar(monthlyExportDays, monthlyTrades, "month")}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            {monthlyReportCards.map((card) => (
              <div
                key={card.label}
                style={{
                  border: "1px solid #27272a",
                  background: "#000000",
                  borderRadius: "18px",
                  padding: "18px",
                }}
              >
                <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
                  {card.label}
                </p>

                <p
                  style={{
                    color: card.color,
                    fontSize: "26px",
                    fontWeight: 800,
                    margin: "10px 0 4px",
                  }}
                >
                  {card.value}
                </p>

                <p style={{ color: "#71717a", fontSize: "12px", margin: 0 }}>
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {selectedTrade && (
          <>
            <div
              ref={selectedTradeExportRef}
              style={{
                width: "100%",
                marginTop: "32px",
                background: "#080808",
                border: "1px solid #27272a",
                borderRadius: "24px",
                padding: "28px",
              }}
            >
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0 }}>
                Life OS Trading Journal
              </p>

              <h1 style={{ fontSize: "32px", margin: "8px 0 4px" }}>
                Trade report
              </h1>

              <p style={{ color: "#9ca3af", margin: "0 0 24px" }}>
                {selectedTrade.date} · {selectedTrade.account} ·{" "}
                {selectedTrade.asset} · {selectedTrade.direction}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "14px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
                    Dirección
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      margin: "8px 0 0",
                    }}
                  >
                    {selectedTrade.direction}
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
                    Riesgo
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      margin: "8px 0 0",
                    }}
                  >
                    ${selectedTrade.risk}
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
                    Resultado
                  </p>
                  <p
                    style={{
                      color:
                        Number(selectedTrade.result) >= 0
                          ? "#34d399"
                          : "#f87171",
                      fontSize: "18px",
                      fontWeight: 800,
                      margin: "8px 0 0",
                    }}
                  >
                    ${selectedTrade.result}
                  </p>
                </div>

                <div
                  style={{
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
                    Emoción
                  </p>
                  <p
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      margin: "8px 0 0",
                    }}
                  >
                    {selectedTrade.emotion}
                  </p>
                </div>
              </div>

              <div
                style={{
                  border: "1px solid #27272a",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "18px",
                }}
              >
                <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
                  Setup
                </p>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    margin: "8px 0 0",
                  }}
                >
                  {selectedTrade.setup || "Sin setup registrado."}
                </p>
              </div>

              <div
                style={{
                  border: "1px solid #27272a",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: "18px",
                }}
              >
                <p style={{ color: "#9ca3af", fontSize: "12px", margin: 0 }}>
                  Notas
                </p>
                <p
                  style={{
                    color: "#d4d4d8",
                    fontSize: "15px",
                    margin: "8px 0 0",
                    whiteSpace: "pre-line",
                  }}
                >
                  {selectedTrade.notes || "Sin notas registradas."}
                </p>
              </div>

              {selectedTrade.image && (
                <div
                  style={{
                    border: "1px solid #27272a",
                    borderRadius: "16px",
                    padding: "16px",
                  }}
                >
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      margin: "0 0 12px",
                    }}
                  >
                    Imagen del trade
                  </p>

                  <img
                    src={selectedTrade.image}
                    alt="Imagen del trade"
                    style={{
                      width: "100%",
                      maxHeight: "620px",
                      objectFit: "contain",
                      borderRadius: "14px",
                    }}
                  />
                </div>
              )}
            </div>

            <SocialTradeExportCard
  selectedTrade={selectedTrade}
  variant="square"
  cardRef={socialPostSquareExportRef}
/>

<SocialTradeExportCard
  selectedTrade={selectedTrade}
  variant="vertical"
  cardRef={socialPostVerticalExportRef}
/>
          </>
        )}
      </div>

      {isAccountsOpen && (
        <div className="lifeos-modal fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-6xl rounded-3xl border border-white/10 bg-[#080808] p-4 pb-8 shadow-2xl sm:max-h-[90vh] sm:overflow-y-auto sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-white/40">Trading Journal</p>
                <h2 className="text-2xl font-bold text-white">
                  Cuentas fondeadas
                </h2>
              </div>

              <button
                onClick={() => setIsAccountsOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/15 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <FundedAccountsPanel
              accounts={accounts}
              trades={registeredTrades}
              onAddAccount={addAccount}
              onDeleteAccount={deleteAccount}
            />
          </div>
        </div>
      )}

      {selectedTrade && (
        <div className="lifeos-modal fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-[#080808] p-4 pb-8 shadow-2xl sm:max-h-[90vh] sm:overflow-y-auto sm:p-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Detalle del trade</p>
                <h2 className="mt-1 text-2xl font-bold">
                  {selectedTrade.account}
                </h2>
                <p className="mt-2 text-sm text-white/40">
                  {selectedTrade.date} · {selectedTrade.asset} ·{" "}
                  {selectedTrade.direction}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={exportSelectedTradeAsImage}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-bold text-black transition hover:bg-emerald-300"
                >
                  <Download size={16} />
                  Exportar PNG
                </button>

                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1">
  <select
    value={socialExportFormat}
    onChange={(event) =>
      setSocialExportFormat(event.target.value as "square" | "vertical")
    }
    className="rounded-xl border border-white/10 bg-black/70 px-3 py-2 text-xs font-semibold text-white outline-none"
  >
    <option value="vertical">Vertical IG</option>
    <option value="square">Post 1:1</option>
  </select>

  <button
    onClick={() => exportSocialPostAsImage()}
    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-white/90"
  >
    <Download size={15} />
    Descargar
  </button>
</div>

                <button
                  onClick={() => openEditTrade(selectedTrade)}
                  className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
                  title="Editar trade"
                >
                  <Pencil size={20} />
                </button>

                <button
                  onClick={() => setSelectedTrade(null)}
                  className="rounded-2xl bg-white/10 p-2 text-white/60 transition hover:bg-white/20 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/40">Dirección</p>
                <p className="mt-1 font-semibold">
                  {selectedTrade.direction}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/40">Riesgo</p>
                <p className="mt-1 font-semibold">${selectedTrade.risk}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/40">Resultado</p>
                <p
                  className={`mt-1 font-semibold ${
                    Number(selectedTrade.result) >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  ${selectedTrade.result}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs text-white/40">Emoción</p>
                <p className="mt-1 font-semibold">{selectedTrade.emotion}</p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Setup</p>
              <p className="mt-2 text-sm font-semibold text-white/80">
                {selectedTrade.setup || "Sin setup registrado."}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Notas</p>
              <p className="mt-2 whitespace-pre-line text-sm text-white/70">
                {selectedTrade.notes || "Sin notas registradas."}
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Imagen del trade</p>

              {selectedTrade.image ? (
                <img
                  src={selectedTrade.image}
                  alt="Imagen del trade"
                  className="mt-3 max-h-[520px] w-full rounded-2xl object-contain"
                />
              ) : (
                <p className="mt-2 text-sm text-white/40">
                  Este trade no tiene imagen guardada.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {editingTrade && (
        <div className="lifeos-modal fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/85 px-3 py-4 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={saveEditedTrade}
            className="w-full max-w-4xl rounded-3xl border border-white/10 bg-[#080808] p-5 pb-8 shadow-2xl sm:max-h-[90vh] sm:overflow-y-auto sm:p-6"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Trading Journal</p>
                <h2 className="mt-1 text-2xl font-bold">Editar trade</h2>
                <p className="mt-2 text-sm text-white/40">
                  Cambia datos del trade sin borrarlo.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingTrade(null)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs text-white/40">Fecha</span>
                <input
                  type="date"
                  value={editingTrade.date}
                  onChange={(event) =>
                    updateEditingTrade("date", event.target.value)
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Cuenta</span>
                <input
                  value={editingTrade.account}
                  onChange={(event) =>
                    updateEditingTrade("account", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Activo</span>
                <input
                  value={editingTrade.asset}
                  onChange={(event) =>
                    updateEditingTrade("asset", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Dirección</span>
                <select
                  value={editingTrade.direction}
                  onChange={(event) =>
                    updateEditingTrade("direction", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                >
                  <option>Long</option>
                  <option>Short</option>
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Riesgo</span>
                <input
                  type="number"
                  value={editingTrade.risk}
                  onChange={(event) =>
                    updateEditingTrade("risk", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Resultado</span>
                <input
                  type="number"
                  value={editingTrade.result}
                  onChange={(event) =>
                    updateEditingTrade("result", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Setup</span>
                <input
                  value={editingTrade.setup}
                  onChange={(event) =>
                    updateEditingTrade("setup", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2">
                <span className="text-xs text-white/40">Emoción</span>
                <input
                  value={editingTrade.emotion}
                  onChange={(event) =>
                    updateEditingTrade("emotion", event.target.value)
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Notas</span>
                <textarea
                  value={editingTrade.notes}
                  onChange={(event) =>
                    updateEditingTrade("notes", event.target.value)
                  }
                  rows={4}
                  className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Cambiar imagen</span>

                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-white/90">
                    <Upload size={16} />
                    Subir imagen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="hidden"
                    />
                  </label>

                  {editingTrade.image ? (
                    <img
                      src={editingTrade.image}
                      alt="Imagen editada"
                      className="max-h-64 w-full rounded-2xl object-contain"
                    />
                  ) : (
                    <p className="text-sm text-white/40">
                      Este trade no tiene imagen.
                    </p>
                  )}
                </div>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingTrade(null)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Guardar cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
function formatExportMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  const amount = Math.abs(value).toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });

  return `${sign}$${amount}`;
}

function getMetricValueSize(value: string, compact: boolean) {
  if (value.length > 18) return compact ? 26 : 34;
  if (value.length > 12) return compact ? 30 : 40;
  return compact ? 36 : 50;
}

function SocialTradeExportCard({
  selectedTrade,
  variant,
  cardRef,
}: {
  selectedTrade: Trade;
  variant: "square" | "vertical";
  cardRef: RefObject<HTMLDivElement | null>;
}) {
  const resultNumber = Number(selectedTrade.result || 0);
  const riskNumber = Number(selectedTrade.risk || 0);
  const isWin = resultNumber >= 0;
  const isVertical = variant === "vertical";

  const accent = isWin ? "#6EE7B7" : "#FB7185";
  const setupAccent = "#FACC15";

  const cardWidth = 1080;
  const cardHeight = isVertical ? 1920 : 1080;

  const paddingX = isVertical ? 64 : 56;
const paddingTop = isVertical ? 120 : 88;
const paddingBottom = isVertical ? 120 : 88;

  const titleSize = isVertical ? 86 : 68;
  const metaSize = isVertical ? 17 : 16;
  const chartHeight = isVertical ? 860 : 420;
  const setupSize = isVertical ? 34 : 28;

  const metaText = [
    selectedTrade.date,
    selectedTrade.asset || "MNQ",
    selectedTrade.direction || "Long",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      ref={cardRef}
      style={{
        width: `${cardWidth}px`,
        height: `${cardHeight}px`,
        marginTop: "32px",
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        borderRadius: isVertical ? "0px" : "34px",
        padding: `${paddingTop}px ${paddingX}px ${paddingBottom}px`,
        color: "#FFFFFF",
        fontFamily:
          'Inter, "Helvetica Neue", Arial, system-ui, -apple-system, sans-serif',
        background:
          "linear-gradient(180deg, #020617 0%, #020617 34%, #000000 100%)",
      }}
    >
      {/* Fondo elegante sin círculos feos */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(1200px 500px at 100% 18%, rgba(45,212,191,0.16), transparent 42%), radial-gradient(900px 420px at 0% 100%, rgba(16,185,129,0.10), transparent 40%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.08,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: isVertical ? "64px 64px" : "58px 58px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: isVertical ? "240px" : "190px",
          height: "100%",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.08) 100%)",
          filter: "blur(40px)",
          opacity: 0.9,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "24px",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#A7F3D0",
                fontSize: isVertical ? "18px" : "16px",
                fontWeight: 800,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Life OS Trading Journal
            </p>

            <h1
              style={{
                margin: isVertical ? "32px 0 0" : "24px 0 0",
                fontSize: `${titleSize}px`,
                lineHeight: 0.94,
                fontWeight: 900,
                letterSpacing: "-0.055em",
                color: "#FFFFFF",
              }}
            >
              Trade Recap
            </h1>

            <p
              style={{
                margin: "14px 0 0",
                color: "rgba(255,255,255,0.56)",
                fontSize: `${metaSize}px`,
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              {metaText}
            </p>
          </div>

          <div
            style={{
              flexShrink: 0,
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.04)",
              color: isWin ? "#86EFAC" : "#FDA4AF",
              padding: isVertical ? "12px 22px" : "10px 18px",
              fontSize: isVertical ? "15px" : "14px",
              fontWeight: 800,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {selectedTrade.direction || "Trade"}
          </div>
        </div>

        {/* Metrics */}
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: isVertical ? "18px" : "16px",
    marginTop: isVertical ? "34px" : "26px",
  }}
>
          <ExportMetric
            label="Resultado"
            value={formatExportMoney(resultNumber)}
            color={accent}
            compact={!isVertical}
          />

          <ExportMetric
            label="Riesgo"
            value={`$${riskNumber.toLocaleString("en-US", {
              maximumFractionDigits: 2,
            })}`}
            color="#FFFFFF"
            compact={!isVertical}
          />

        
        </div>

        {/* Setup */}
        <div
          style={{
            marginTop: isVertical ? "20px" : "18px",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: isVertical ? "28px" : "24px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            padding: isVertical ? "24px 24px" : "20px 20px",
            boxShadow: "0 16px 50px rgba(0,0,0,0.18)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.56)",
              fontSize: isVertical ? "18px" : "15px",
              fontWeight: 500,
            }}
          >
            Setup
          </p>

          <p
            style={{
              margin: "12px 0 0",
              color: setupAccent,
              fontSize: `${setupSize}px`,
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: "-0.03em",
              wordBreak: "break-word",
            }}
          >
            {selectedTrade.setup || "Sin setup registrado"}
          </p>
        </div>

        {/* Chart heading */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: isVertical ? "22px" : "18px",
            marginBottom: "12px",
          }}
        >
          <p
            style={{
              margin: 0,
              color: "rgba(255,255,255,0.52)",
              fontSize: isVertical ? "14px" : "13px",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Execution Chart
          </p>

          <div
            style={{
              width: isVertical ? "60px" : "44px",
              height: "1px",
              background: "rgba(255,255,255,0.18)",
            }}
          />
        </div>

        {/* Chart */}
        <div
          style={{
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: isVertical ? "28px" : "24px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
            padding: isVertical ? "14px" : "12px",
            boxShadow: "0 20px 70px rgba(0,0,0,0.28)",
          }}
        >
          <div
            style={{
              height: `${chartHeight}px`,
              overflow: "hidden",
              borderRadius: isVertical ? "20px" : "18px",
              background: "#090909",
            }}
          >
            {selectedTrade.image ? (
              <img
                src={selectedTrade.image}
                alt="Chart del trade"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.38)",
                  fontSize: isVertical ? "28px" : "20px",
                  fontWeight: 700,
                }}
              >
                Sin imagen del trade
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Footer */}
        <div
  style={{
    marginTop: isVertical ? "42px" : "30px",
  }}
>
          <div
            style={{
              width: "100%",
              height: "1px",
              background: "rgba(255,255,255,0.10)",
            }}
          />

          <p
            style={{
              margin: isVertical ? "22px 0 0" : "18px 0 0",
              textAlign: "center",
              color: "rgba(255,255,255,0.70)",
              fontSize: isVertical ? "24px" : "20px",
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            Plan. Riesgo. Disciplina.
          </p>

          <p
            style={{
              margin: "10px 0 0",
              textAlign: "center",
              color: "rgba(255,255,255,0.32)",
              fontSize: isVertical ? "15px" : "13px",
              fontWeight: 600,
            }}
          >
            {selectedTrade.account || "Cuenta"} · Life OS
          </p>
        </div>
      </div>
    </div>
  );
}

function ExportMetric({
  label,
  value,
  color,
  compact = false,
}: {
  label: string;
  value: string;
  color: string;
  compact?: boolean;
}) {
  const valueSize = getMetricValueSize(value, compact);

  return (
    <div
      style={{
        minWidth: 0,
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: compact ? "22px" : "26px",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))",
        padding: compact ? "18px 18px" : "24px 24px",
        boxShadow: "0 14px 42px rgba(0,0,0,0.18)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "rgba(255,255,255,0.56)",
            fontSize: compact ? "15px" : "18px",
            fontWeight: 500,
          }}
        >
          {label}
        </p>

        <div
          style={{
            width: compact ? "10px" : "12px",
            height: compact ? "10px" : "12px",
            borderRadius: "999px",
            background: color,
            boxShadow: `0 0 18px ${color}`,
            flexShrink: 0,
          }}
        />
      </div>

      <p
        style={{
          margin: compact ? "18px 0 0" : "22px 0 0",
          color,
          fontSize: `${valueSize}px`,
          fontWeight: 900,
          lineHeight: 1.02,
          letterSpacing: "-0.05em",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </p>
    </div>
  );
}