"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CalendarDays,
  Clock3,
  Droplets,
  Dumbbell,
  Flame,
  Footprints,
  Gauge,
  Moon,
  Pill,
  Plus,
  Ruler,
  Scale,
  Settings2,
  Smile,
  Timer,
  Trash2,
  Trophy,
  Utensils,
  X,
  type LucideIcon,
} from "lucide-react";

type HealthCardId =
  | "calories"
  | "weight"
  | "water"
  | "sleep"
  | "energy"
  | "fasting"
  | "creatine"
  | "protein"
  | "mood"
  | "steps"
  | "waist"
  | "trainingDone"
  | "sport"
  | "trainingMinutes"
  | "trainingIntensity"
  | "caloriesBurned";

type HealthCardType = "number" | "select" | "boolean";

type HealthCardGroup = "health" | "sport";

type HealthCardDefinition = {
  id: HealthCardId;
  title: string;
  description: string;
  unit: string;
  type: HealthCardType;
  icon: LucideIcon;
  color: string;
  placeholder: string;
  defaultActive: boolean;
  hasTarget: boolean;
  defaultTarget: string;
  group: HealthCardGroup;
  options?: string[];
};

type HealthCardSetting = {
  active: boolean;
  target: string;
};

type HealthSettings = Record<HealthCardId, HealthCardSetting>;

type HealthDailyLog = {
  id: string;
  date: string;
  values: Partial<Record<HealthCardId, string>>;
  note: string;
};

type HealthLogForm = {
  date: string;
  values: Partial<Record<HealthCardId, string>>;
  note: string;
};

const settingsStorageKey = "lifeos-health-card-settings";
const logsStorageKey = "lifeos-health-daily-logs";

const healthCards: HealthCardDefinition[] = [
  {
    id: "calories",
    title: "Calorías",
    description: "Calorías consumidas en el día.",
    unit: "kcal",
    type: "number",
    icon: Flame,
    color: "text-orange-300",
    placeholder: "Ej: 1800",
    defaultActive: true,
    hasTarget: true,
    defaultTarget: "1800",
    group: "health",
  },
  {
    id: "weight",
    title: "Peso",
    description: "Tu peso actual.",
    unit: "lb",
    type: "number",
    icon: Scale,
    color: "text-emerald-400",
    placeholder: "Ej: 210",
    defaultActive: true,
    hasTarget: false,
    defaultTarget: "",
    group: "health",
  },
  {
    id: "water",
    title: "Agua",
    description: "Litros de agua tomados.",
    unit: "L",
    type: "number",
    icon: Droplets,
    color: "text-sky-300",
    placeholder: "Ej: 3",
    defaultActive: true,
    hasTarget: true,
    defaultTarget: "3",
    group: "health",
  },
  {
    id: "sleep",
    title: "Sueño",
    description: "Horas dormidas.",
    unit: "h",
    type: "number",
    icon: Moon,
    color: "text-indigo-300",
    placeholder: "Ej: 7",
    defaultActive: true,
    hasTarget: true,
    defaultTarget: "8",
    group: "health",
  },
  {
    id: "energy",
    title: "Energía",
    description: "Cómo te sentiste hoy.",
    unit: "",
    type: "select",
    icon: Activity,
    color: "text-yellow-300",
    placeholder: "",
    defaultActive: true,
    hasTarget: false,
    defaultTarget: "",
    group: "health",
    options: ["Baja", "Media", "Alta"],
  },
  {
    id: "fasting",
    title: "Ayuno",
    description: "Si cumpliste ayuno.",
    unit: "",
    type: "boolean",
    icon: Clock3,
    color: "text-purple-300",
    placeholder: "",
    defaultActive: false,
    hasTarget: false,
    defaultTarget: "",
    group: "health",
  },
  {
    id: "creatine",
    title: "Creatina",
    description: "Si tomaste creatina.",
    unit: "",
    type: "boolean",
    icon: Pill,
    color: "text-pink-300",
    placeholder: "",
    defaultActive: false,
    hasTarget: false,
    defaultTarget: "",
    group: "health",
  },
  {
    id: "protein",
    title: "Proteína",
    description: "Proteína consumida.",
    unit: "g",
    type: "number",
    icon: Utensils,
    color: "text-lime-300",
    placeholder: "Ej: 150",
    defaultActive: false,
    hasTarget: true,
    defaultTarget: "150",
    group: "health",
  },
  {
    id: "mood",
    title: "Estado de ánimo",
    description: "Cómo estuvo tu ánimo.",
    unit: "",
    type: "select",
    icon: Smile,
    color: "text-rose-300",
    placeholder: "",
    defaultActive: false,
    hasTarget: false,
    defaultTarget: "",
    group: "health",
    options: ["Bajo", "Normal", "Bueno", "Excelente"],
  },
  {
    id: "steps",
    title: "Pasos",
    description: "Pasos caminados.",
    unit: "pasos",
    type: "number",
    icon: Footprints,
    color: "text-cyan-300",
    placeholder: "Ej: 8000",
    defaultActive: false,
    hasTarget: true,
    defaultTarget: "8000",
    group: "health",
  },
  {
    id: "waist",
    title: "Cintura",
    description: "Medida de cintura.",
    unit: "cm",
    type: "number",
    icon: Ruler,
    color: "text-fuchsia-300",
    placeholder: "Ej: 95",
    defaultActive: false,
    hasTarget: false,
    defaultTarget: "",
    group: "health",
  },
  {
    id: "trainingDone",
    title: "Entrené",
    description: "Si hiciste actividad física hoy.",
    unit: "",
    type: "boolean",
    icon: Dumbbell,
    color: "text-emerald-400",
    placeholder: "",
    defaultActive: true,
    hasTarget: false,
    defaultTarget: "",
    group: "sport",
  },
  {
    id: "sport",
    title: "Deporte",
    description: "Tipo de actividad realizada.",
    unit: "",
    type: "select",
    icon: Trophy,
    color: "text-yellow-300",
    placeholder: "",
    defaultActive: true,
    hasTarget: false,
    defaultTarget: "",
    group: "sport",
    options: [
      "Gym",
      "Vóley",
      "Fútbol",
      "Running",
      "Caminata",
      "Ciclismo",
      "Otro",
    ],
  },
  {
    id: "trainingMinutes",
    title: "Minutos",
    description: "Tiempo total de actividad.",
    unit: "min",
    type: "number",
    icon: Timer,
    color: "text-sky-300",
    placeholder: "Ej: 60",
    defaultActive: true,
    hasTarget: true,
    defaultTarget: "45",
    group: "sport",
  },
  {
    id: "trainingIntensity",
    title: "Intensidad",
    description: "Qué tan fuerte fue el entrenamiento.",
    unit: "",
    type: "select",
    icon: Gauge,
    color: "text-orange-300",
    placeholder: "",
    defaultActive: true,
    hasTarget: false,
    defaultTarget: "",
    group: "sport",
    options: ["Suave", "Media", "Alta", "Muy alta"],
  },
  {
    id: "caloriesBurned",
    title: "Calorías quemadas",
    description: "Calorías aproximadas quemadas.",
    unit: "kcal",
    type: "number",
    icon: Flame,
    color: "text-red-300",
    placeholder: "Ej: 300",
    defaultActive: false,
    hasTarget: false,
    defaultTarget: "",
    group: "sport",
  },
];

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function createDefaultSettings() {
  return healthCards.reduce((settings, card) => {
    settings[card.id] = {
      active: card.defaultActive,
      target: card.defaultTarget,
    };

    return settings;
  }, {} as HealthSettings);
}

function mergeSavedSettings(savedSettings: Partial<HealthSettings>) {
  const defaultSettings = createDefaultSettings();

  healthCards.forEach((card) => {
    if (savedSettings?.[card.id]) {
      defaultSettings[card.id] = {
        ...defaultSettings[card.id],
        ...savedSettings[card.id],
      };
    }
  });

  return defaultSettings;
}

function createEmptyLogForm(): HealthLogForm {
  return {
    date: getTodayDate(),
    values: {},
    note: "",
  };
}

function parseAmount(value: string | undefined) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function formatCardValue(card: HealthCardDefinition, value: string | undefined) {
  if (!value) return "—";

  if (!card.unit) return value;

  return `${value} ${card.unit}`;
}

function getProgress(
  card: HealthCardDefinition,
  value: string | undefined,
  target: string
) {
  if (!card.hasTarget || card.type !== "number") return null;

  const currentValue = parseAmount(value);
  const targetValue = parseAmount(target);

  if (currentValue <= 0 || targetValue <= 0) return null;

  return Math.min((currentValue / targetValue) * 100, 100);
}

function getAverage(logs: HealthDailyLog[], cardId: HealthCardId) {
  const values = logs
    .map((log) => parseAmount(log.values[cardId]))
    .filter((value) => value > 0);

  if (values.length === 0) return null;

  const total = values.reduce((sum, value) => sum + value, 0);

  return total / values.length;
}

function getMostCommonValue(logs: HealthDailyLog[], cardId: HealthCardId) {
  const totals = logs.reduce<Record<string, number>>((acc, log) => {
    const value = log.values[cardId];

    if (!value) return acc;

    acc[value] = (acc[value] || 0) + 1;

    return acc;
  }, {});

  const sortedValues = Object.entries(totals).sort(
    ([, totalA], [, totalB]) => totalB - totalA
  );

  return sortedValues[0]?.[0] ?? "—";
}

function getWeeklyWeightLoss(logs: HealthDailyLog[]) {
  const weightLogs = logs
    .map((log) => ({
      date: log.date,
      weight: parseAmount(log.values.weight),
    }))
    .filter((log) => log.weight > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (weightLogs.length < 2) return null;

  const firstLog = weightLogs[0];
  const lastLog = weightLogs[weightLogs.length - 1];

  const weightLost = firstLog.weight - lastLog.weight;
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysBetween = Math.max(
    Math.abs(
      new Date(lastLog.date).getTime() - new Date(firstLog.date).getTime()
    ) / millisecondsPerDay,
    1
  );

  const weeks = Math.max(daysBetween / 7, 1);

  return weightLost / weeks;
}

export function HealthClient() {
  const dateInputRef = useRef<HTMLInputElement | null>(null);
  const [settings, setSettings] = useState<HealthSettings>(
    createDefaultSettings
  );
  const [logs, setLogs] = useState<HealthDailyLog[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [logForm, setLogForm] = useState<HealthLogForm>(createEmptyLogForm);

  useEffect(() => {
    const savedSettings = localStorage.getItem(settingsStorageKey);
    const savedLogs = localStorage.getItem(logsStorageKey);

    if (savedSettings) {
      setSettings(mergeSavedSettings(JSON.parse(savedSettings)));
    }

    if (savedLogs) {
      const parsedLogs = JSON.parse(savedLogs) as HealthDailyLog[];

      if (Array.isArray(parsedLogs)) {
        setLogs(parsedLogs.sort((a, b) => b.date.localeCompare(a.date)));
      }
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
  }, [settings, loaded]);

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(logsStorageKey, JSON.stringify(logs));
  }, [logs, loaded]);

  const activeCards = healthCards.filter((card) => settings[card.id]?.active);

  const activeHealthCards = activeCards.filter(
    (card) => card.group === "health"
  );

  const activeSportCards = activeCards.filter((card) => card.group === "sport");

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => b.date.localeCompare(a.date));
  }, [logs]);

  const today = getTodayDate();
  const todayLog = sortedLogs.find((log) => log.date === today);
  const featuredLog = todayLog ?? sortedLogs[0];

  const currentMonth = getCurrentMonth();

  const monthlyLogs = sortedLogs.filter((log) =>
    log.date.startsWith(currentMonth)
  );

  const monthlyAverageCalories = getAverage(monthlyLogs, "calories");
  const monthlyAverageWater = getAverage(monthlyLogs, "water");
  const monthlyAverageSleep = getAverage(monthlyLogs, "sleep");

  const monthlyTrainingDays = monthlyLogs.filter((log) => {
    const trained = log.values.trainingDone === "Sí";
    const hasSport = Boolean(log.values.sport);
    const hasMinutes = parseAmount(log.values.trainingMinutes) > 0;

    return trained || hasSport || hasMinutes;
  }).length;

  const totalTrainingMinutes = monthlyLogs.reduce(
    (total, log) => total + parseAmount(log.values.trainingMinutes),
    0
  );

  const averageTrainingMinutes =
    monthlyTrainingDays > 0 ? totalTrainingMinutes / monthlyTrainingDays : null;

  const mainSport = getMostCommonValue(monthlyLogs, "sport");
  const monthlyAverageMood = getMostCommonValue(monthlyLogs, "mood");
  const weeklyWeightLoss = getWeeklyWeightLoss(monthlyLogs);

  function updateSetting(
    cardId: HealthCardId,
    changes: Partial<HealthCardSetting>
  ) {
    setSettings((currentSettings) => ({
      ...currentSettings,
      [cardId]: {
        ...currentSettings[cardId],
        ...changes,
      },
    }));
  }

  function openRegisterModal() {
    const existingTodayLog = logs.find((log) => log.date === today);

    setLogForm({
      date: today,
      values: existingTodayLog?.values ?? {},
      note: existingTodayLog?.note ?? "",
    });

    setRegisterOpen(true);
  }

  function updateLogDate(date: string) {
    const existingLog = logs.find((log) => log.date === date);

    setLogForm({
      date,
      values: existingLog?.values ?? {},
      note: existingLog?.note ?? "",
    });
  }

  function openDatePicker() {
    const input = dateInputRef.current as HTMLInputElement & {
      showPicker?: () => void;
    };

    input?.showPicker?.();
    input?.focus();
  }

  function updateLogValue(cardId: HealthCardId, value: string) {
    setLogForm((currentForm) => ({
      ...currentForm,
      values: {
        ...currentForm.values,
        [cardId]: value,
      },
    }));
  }

  function handleSaveLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanValues: Partial<Record<HealthCardId, string>> = {};

    activeCards.forEach((card) => {
      cleanValues[card.id] = logForm.values[card.id] ?? "";
    });

    const newLog: HealthDailyLog = {
      id: `${Date.now()}-${Math.random()}`,
      date: logForm.date,
      values: cleanValues,
      note: logForm.note,
    };

    setLogs((currentLogs) =>
      [newLog, ...currentLogs.filter((log) => log.date !== logForm.date)].sort(
        (a, b) => b.date.localeCompare(a.date)
      )
    );

    setLogForm(createEmptyLogForm());
    setRegisterOpen(false);
  }

  function deleteLog(logId: string) {
    setLogs((currentLogs) => currentLogs.filter((log) => log.id !== logId));
  }

  return (
    <div>
      <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/60">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Módulo Salud
          </div>

          <p className="text-sm text-white/40">Control personal</p>

          <h1 className="mt-2 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
            Salud
          </h1>

          <p className="mt-4 max-w-2xl text-white/50">
            Controla tus calorías, peso, agua, sueño, hábitos diarios y
            actividad física. Tú decides qué tarjetas quieres ver.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => setSettingsOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Settings2 className="h-4 w-4" />
            Configurar tarjetas
          </button>

          <button
            onClick={openRegisterModal}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Registrar día
          </button>
        </div>
      </header>

      {activeHealthCards.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-white/10 bg-white/[0.035] p-8 text-center">
          <p className="text-sm font-semibold text-white">
            No tienes tarjetas de salud activas.
          </p>
          <p className="mt-2 text-sm text-white/40">
            Abre configuración y activa las tarjetas que quieras ver.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
          {activeHealthCards.map((card) => {
            const Icon = card.icon;
            const value = featuredLog?.values?.[card.id] ?? "";
            const progress = getProgress(card, value, settings[card.id].target);

            return (
              <article
                key={card.id}
                className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 transition hover:-translate-y-1 hover:bg-white/[0.05]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-white/40">{card.title}</p>
                  <div className="rounded-full bg-white/10 p-3">
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                </div>

                <p className={`text-3xl font-bold ${card.color}`}>
                  {formatCardValue(card, value)}
                </p>

                <p className="mt-4 text-sm leading-6 text-white/40">
                  {featuredLog
                    ? featuredLog.date === today
                      ? "Registro de hoy."
                      : `Último registro: ${featuredLog.date}.`
                    : "Sin registro todavía."}
                </p>

                {card.hasTarget && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                      <span>
                        Meta: {settings[card.id].target || "—"} {card.unit}
                      </span>
                      <span>
                        {progress === null ? "0%" : `${progress.toFixed(0)}%`}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${progress ?? 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      {activeSportCards.length > 0 && (
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm text-white/40">Actividad física</p>
              <h2 className="mt-1 text-2xl font-bold">Deporte / ejercicio</h2>
              <p className="mt-2 text-sm text-white/40">
                Personaliza esta parte según tu deporte: gym, vóley, running,
                caminata o lo que hagas.
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-white/50">
              Este mes
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {activeSportCards.map((card) => {
              const Icon = card.icon;
              const value = featuredLog?.values?.[card.id] ?? "";
              const progress = getProgress(
                card,
                value,
                settings[card.id].target
              );

              return (
                <article
                  key={card.id}
                  className="rounded-3xl border border-white/10 bg-black/40 p-6 transition hover:-translate-y-1 hover:bg-white/[0.05]"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <p className="text-sm text-white/40">{card.title}</p>
                    <div className="rounded-full bg-white/10 p-3">
                      <Icon className={`h-5 w-5 ${card.color}`} />
                    </div>
                  </div>

                  <p className={`text-3xl font-bold ${card.color}`}>
                    {formatCardValue(card, value)}
                  </p>

                  <p className="mt-4 text-sm leading-6 text-white/40">
                    {featuredLog
                      ? featuredLog.date === today
                        ? "Registro de hoy."
                        : `Último registro: ${featuredLog.date}.`
                      : "Sin registro todavía."}
                  </p>

                  {card.hasTarget && (
                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between text-xs text-white/40">
                        <span>
                          Meta: {settings[card.id].target || "—"} {card.unit}
                        </span>
                        <span>
                          {progress === null
                            ? "0%"
                            : `${progress.toFixed(0)}%`}
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-emerald-400"
                          style={{ width: `${progress ?? 0}%` }}
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Días entrenados</p>
              <p className="mt-2 text-2xl font-bold text-emerald-400">
                {monthlyTrainingDays}
              </p>
              <p className="mt-2 text-xs text-white/40">
                Días con deporte o ejercicio este mes.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Minutos totales</p>
              <p className="mt-2 text-2xl font-bold text-sky-300">
                {totalTrainingMinutes} min
              </p>
              <p className="mt-2 text-xs text-white/40">
                Tiempo registrado este mes.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Promedio por día activo</p>
              <p className="mt-2 text-2xl font-bold text-yellow-300">
                {averageTrainingMinutes === null
                  ? "—"
                  : `${averageTrainingMinutes.toFixed(0)} min`}
              </p>
              <p className="mt-2 text-xs text-white/40">
                Promedio solo contando días activos.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs text-white/40">Deporte principal</p>
              <p className="mt-2 text-2xl font-bold text-white">{mainSport}</p>
              <p className="mt-2 text-xs text-white/40">
                Actividad más repetida este mes.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Resumen automático</p>
            <h2 className="mt-1 text-2xl font-bold">Resumen del mes</h2>
            <p className="mt-2 text-sm text-white/40">
              Promedios y progreso calculados con los registros de este mes.
            </p>
          </div>

          <span className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs font-semibold text-white/50">
            {currentMonth}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Días registrados</p>
            <p className="mt-2 text-2xl font-bold text-white">
              {monthlyLogs.length}
            </p>
            <p className="mt-2 text-xs text-white/40">
              Días guardados este mes.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Promedio calorías</p>
            <p className="mt-2 text-2xl font-bold text-orange-300">
              {monthlyAverageCalories === null
                ? "—"
                : `${monthlyAverageCalories.toFixed(0)} kcal`}
            </p>
            <p className="mt-2 text-xs text-white/40">
              Calorías promedio por día registrado.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Promedio agua</p>
            <p className="mt-2 text-2xl font-bold text-sky-300">
              {monthlyAverageWater === null
                ? "—"
                : `${monthlyAverageWater.toFixed(1)} L`}
            </p>
            <p className="mt-2 text-xs text-white/40">
              Agua promedio por día registrado.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Promedio sueño</p>
            <p className="mt-2 text-2xl font-bold text-indigo-300">
              {monthlyAverageSleep === null
                ? "—"
                : `${monthlyAverageSleep.toFixed(1)} h`}
            </p>
            <p className="mt-2 text-xs text-white/40">
              Horas promedio de sueño.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Días entrenados</p>
            <p className="mt-2 text-2xl font-bold text-emerald-400">
              {monthlyTrainingDays}
            </p>
            <p className="mt-2 text-xs text-white/40">
              Días con deporte o ejercicio.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs text-white/40">Estado de ánimo promedio</p>
            <p className="mt-2 text-2xl font-bold text-rose-300">
              {monthlyAverageMood}
            </p>
            <p className="mt-2 text-xs text-white/40">
              Estado más repetido este mes.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 md:col-span-2 xl:col-span-3">
            <p className="text-xs text-white/40">Peso perdido por semana</p>
            <p
              className={`mt-2 text-2xl font-bold ${
                weeklyWeightLoss === null
                  ? "text-white"
                  : weeklyWeightLoss >= 0
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {weeklyWeightLoss === null
                ? "—"
                : `${
                    weeklyWeightLoss >= 0 ? "-" : "+"
                  }${Math.abs(weeklyWeightLoss).toFixed(1)} lb/sem`}
            </p>
            <p className="mt-2 text-xs text-white/40">
              Estimado usando tu primer y último peso registrado este mes.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-6">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm text-white/40">Historial</p>
            <h2 className="mt-1 text-2xl font-bold">Registros diarios</h2>
          </div>

          <p className="text-sm text-white/40">{logs.length} registros</p>
        </div>

        {logs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/30 p-8 text-center">
            <p className="text-sm font-semibold text-white">
              Todavía no tienes registros.
            </p>
            <p className="mt-2 text-sm text-white/40">
              Registra tu primer día para empezar a ver tu progreso.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-white/[0.04] text-white/40">
                <tr>
                  <th className="px-4 py-4">Fecha</th>

                  {activeCards.map((card) => (
                    <th key={card.id} className="px-4 py-4">
                      {card.title}
                    </th>
                  ))}

                  <th className="px-4 py-4">Nota</th>
                  <th className="px-4 py-4 text-right">Acción</th>
                </tr>
              </thead>

              <tbody>
                {sortedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-t border-white/10 text-white/70"
                  >
                    <td className="px-4 py-4 font-semibold text-white">
                      {log.date}
                    </td>

                    {activeCards.map((card) => (
                      <td key={card.id} className="px-4 py-4">
                        {formatCardValue(card, log.values[card.id])}
                      </td>
                    ))}

                    <td className="max-w-xs truncate px-4 py-4 text-white/50">
                      {log.note || "—"}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => deleteLog(log.id)}
                        className="rounded-full border border-white/10 p-2 text-white/40 transition hover:border-red-400/40 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Personalización</p>
                <h2 className="mt-1 text-2xl font-bold">
                  Configurar tarjetas
                </h2>
                <p className="mt-2 text-sm text-white/40">
                  Activa solo lo que quieras ver en tu dashboard de salud.
                </p>
              </div>

              <button
                onClick={() => setSettingsOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              {healthCards.map((card) => {
                const Icon = card.icon;
                const cardSetting = settings[card.id];

                return (
                  <article
                    key={card.id}
                    className="rounded-3xl border border-white/10 bg-black/40 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="rounded-full bg-white/10 p-3">
                          <Icon className={`h-5 w-5 ${card.color}`} />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-white">
                              {card.title}
                            </h3>

                            <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-white/40">
                              {card.group === "sport" ? "Deporte" : "Salud"}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-white/40">
                            {card.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          updateSetting(card.id, {
                            active: !cardSetting.active,
                          })
                        }
                        className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                          cardSetting.active
                            ? "bg-emerald-400 text-black"
                            : "border border-white/10 text-white/50 hover:text-white"
                        }`}
                      >
                        {cardSetting.active ? "Activa" : "Oculta"}
                      </button>
                    </div>

                    {card.hasTarget && (
                      <label className="mt-5 block space-y-2">
                        <span className="text-xs text-white/40">
                          Meta diaria {card.unit && `(${card.unit})`}
                        </span>

                        <input
                          type="number"
                          value={cardSetting.target}
                          onChange={(event) =>
                            updateSetting(card.id, {
                              target: event.target.value,
                            })
                          }
                          placeholder={card.defaultTarget}
                          className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                        />
                      </label>
                    )}
                  </article>
                );
              })}
            </div>

            <button
              onClick={() => setSettingsOpen(false)}
              className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-white/90"
            >
              Guardar configuración
            </button>
          </div>
        </div>
      )}

      {registerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveLog}
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-[#080808] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/40">Salud</p>
                <h2 className="mt-1 text-2xl font-bold">Registrar día</h2>
                <p className="mt-2 text-sm text-white/40">
                  Solo aparecen los campos de las tarjetas activas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRegisterOpen(false)}
                className="rounded-full bg-white/10 p-3 text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs text-white/40">Fecha</span>

                <div className="flex gap-2">
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={logForm.date}
                    onChange={(event) => updateLogDate(event.target.value)}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                  />

                  <button
                    type="button"
                    onClick={openDatePicker}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <CalendarDays className="h-5 w-5" />
                  </button>
                </div>
              </label>

              {activeCards.map((card) => (
                <label key={card.id} className="space-y-2">
                  <span className="text-xs text-white/40">
                    {card.title} {card.unit && `(${card.unit})`}
                  </span>

                  {card.type === "number" && (
                    <input
                      type="number"
                      value={logForm.values[card.id] ?? ""}
                      onChange={(event) =>
                        updateLogValue(card.id, event.target.value)
                      }
                      placeholder={card.placeholder}
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    />
                  )}

                  {card.type === "select" && (
                    <select
                      value={logForm.values[card.id] ?? ""}
                      onChange={(event) =>
                        updateLogValue(card.id, event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    >
                      <option value="">Selecciona</option>
                      {card.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {card.type === "boolean" && (
                    <select
                      value={logForm.values[card.id] ?? ""}
                      onChange={(event) =>
                        updateLogValue(card.id, event.target.value)
                      }
                      className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                    >
                      <option value="">Selecciona</option>
                      <option value="Sí">Sí</option>
                      <option value="No">No</option>
                    </select>
                  )}
                </label>
              ))}

              <label className="space-y-2 md:col-span-2">
                <span className="text-xs text-white/40">Nota</span>
                <input
                  type="text"
                  value={logForm.note}
                  onChange={(event) =>
                    setLogForm((currentForm) => ({
                      ...currentForm,
                      note: event.target.value,
                    }))
                  }
                  placeholder="Ej: tuve hambre, dormí mal, buen día de déficit..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRegisterOpen(false)}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-emerald-300"
              >
                Guardar día
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}