import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Zap,
  BarChart3,
  PieChart,
  CalendarDays,
  Tag,
  RefreshCw,
  TrendingUp,
  Lightbulb,
} from "lucide-react";

import KpiCard from "../components/KpiCard";
import DemandLineChart from "../components/DemandLineChart";
import ClassPieChart from "../components/ClassPieChart";
import DayDemandChart from "../components/DayDemandChart";
import { getDashboardData } from "../services/api";

/* --------------------------------------------------------------
   Dashboard — Página principal
   Cada bloco (KPIs, gráficos) carrega independentemente.
   -------------------------------------------------------------- */

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

const DAY_PT = {
  Monday: "Segunda", Tuesday: "Terça", Wednesday: "Quarta",
  Thursday: "Quinta", Friday: "Sexta", Saturday: "Sábado", Sunday: "Domingo",
};

const CLASSES = ["UP", "DOWN"];

/* ==============================================================
   Componentes de loading / erro (compactos, por bloco)
   ============================================================== */

function MiniSkeleton({ height = "h-24" }) {
  return (
    <div className={`flex items-center justify-center ${height} rounded-xl border border-gray-100 bg-white`}>
      <RefreshCw size={16} className="animate-spin text-gray-300" />
    </div>
  );
}

function ErrorBlock({ message }) {
  return (
    <div className="flex items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-xs text-red-600">
      {message || "Erro ao carregar"}
    </div>
  );
}

/* ==============================================================
   Filtro dropdown
   ============================================================== */

function FilterSelect({ icon: Icon, value, onChange, options, placeholder, id }) {
  const isActive = value !== "";
  return (
    <div className="relative flex items-center gap-2">
      <Icon
        size={14}
        strokeWidth={1.6}
        className={isActive ? "text-gray-700" : "text-gray-300"}
      />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-lg border bg-white px-3 py-1.5 pr-7 text-xs font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300
          ${isActive ? "border-gray-300 text-gray-800" : "border-gray-200 text-gray-400"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
    </div>
  );
}

/* ==============================================================
   Painel de Insights
   ============================================================== */

function InsightsPanel({ dayData, classData, kpis }) {
  const insights = useMemo(() => {
    const items = [];

    // Insight 1: Dia com maior demanda NSW
    if (dayData?.length > 0) {
      const maxDay = dayData.reduce((max, d) =>
        d.avg_nsw_demand > max.avg_nsw_demand ? d : max, dayData[0]);
      items.push({
        icon: TrendingUp,
        text: `${DAY_PT[maxDay.day] || maxDay.day} é o dia com maior demanda NSW`,
        detail: `Média: ${maxDay.avg_nsw_demand.toFixed(4)}`,
        color: "text-blue-600",
        bg: "bg-blue-50",
      });
    }

    // Insight 2: Dia com maior demanda VIC
    if (dayData?.length > 0) {
      const maxVIC = dayData.reduce((max, d) =>
        d.avg_vic_demand > max.avg_vic_demand ? d : max, dayData[0]);
      items.push({
        icon: TrendingUp,
        text: `${DAY_PT[maxVIC.day] || maxVIC.day} é o dia com maior demanda VIC`,
        detail: `Média: ${maxVIC.avg_vic_demand.toFixed(4)}`,
        color: "text-teal-600",
        bg: "bg-teal-50",
      });
    }

    // Insight 3: Proporção UP/DOWN
    const up = classData?.find(c => c.demand_class === "UP");
    const down = classData?.find(c => c.demand_class === "DOWN");
    const total = (up?.total ?? 0) + (down?.total ?? 0);
    if (up && total > 0) {
      const pct = ((up.total / total) * 100).toFixed(1);
      const dominant = up.total > total / 2 ? "UP" : "DOWN";
      items.push({
        icon: PieChart,
        text: `Classe dominante: ${dominant}`,
        detail: `UP representa ${pct}% dos registos`,
        color: dominant === "UP" ? "text-amber-600" : "text-slate-600",
        bg: dominant === "UP" ? "bg-amber-50" : "bg-slate-50",
      });
    }

    // Insight 4: Diferença de preço entre estados
    if (kpis) {
      const diff = Math.abs(kpis.avg_nsw_price - kpis.avg_vic_price);
      const maisCaroState = kpis.avg_nsw_price > kpis.avg_vic_price ? "NSW" : "VIC";
      items.push({
        icon: Lightbulb,
        text: `${maisCaroState} tem preço médio superior`,
        detail: `Diferença de $${diff.toFixed(4)} entre estados`,
        color: "text-purple-600",
        bg: "bg-purple-50",
      });
    }

    return items;
  }, [dayData, classData, kpis]);

  if (insights.length === 0) return null;

  return (
    <section
      className="mb-8 animate-fade-in"
      style={{ animationDelay: "0.5s", animationFillMode: "both" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <Lightbulb size={16} className="text-gray-400" strokeWidth={1.6} />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Insights Automáticos
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {insights.map((insight, i) => {
          const IIcon = insight.icon;
          return (
            <div
              key={i}
              className="animate-fade-in group flex items-start gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              style={{ animationDelay: `${0.55 + i * 0.06}s`, animationFillMode: "both" }}
            >
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${insight.bg}`}>
                <IIcon size={14} className={insight.color} strokeWidth={1.8} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {insight.text}
                </p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {insight.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ==============================================================
   Dashboard
   ============================================================== */

export default function Dashboard() {
  /* ---- filtros ---- */
  const [filterDay, setFilterDay] = useState("");
  const [filterClass, setFilterClass] = useState("");

  /* ---- dados individuais + loading + erro ---- */
  const [kpis, setKpis] = useState(null);
  const [kpisLoading, setKpisLoading] = useState(true);
  const [kpisError, setKpisError] = useState(null);

  const [demandData, setDemandData] = useState(null);
  const [demandLoading, setDemandLoading] = useState(true);
  const [demandError, setDemandError] = useState(null);

  const [classData, setClassData] = useState(null);
  const [classLoading, setClassLoading] = useState(true);
  const [classError, setClassError] = useState(null);

  const [dayData, setDayData] = useState(null);
  const [dayLoading, setDayLoading] = useState(true);
  const [dayError, setDayError] = useState(null);

  /* ---- última atualização ---- */
  const [lastUpdate, setLastUpdate] = useState(null);

  /* ---- função central de fetch paralelo ---- */
  const buildParams = useCallback(() => {
    const params = {};
    if (filterDay) params.day = filterDay;
    if (filterClass) params.class = filterClass;
    return params;
  }, [filterDay, filterClass]);

  const fetchIdRef = useRef(0);

  const fetchAll = useCallback(() => {
    const id = ++fetchIdRef.current;
    const params = buildParams();

    setKpisLoading(true);
    setDemandLoading(true);
    setClassLoading(true);
    setDayLoading(true);
    
    setKpisError(null);
    setDemandError(null);
    setClassError(null);
    setDayError(null);

    getDashboardData(params)
      .then((data) => {
        if (id !== fetchIdRef.current) return;
        setKpis(data.kpis);
        setDemandData(data.charts.demand_by_date);
        setClassData(data.charts.class_distribution);
        setDayData(data.charts.day_demand);
      })
      .catch((e) => {
        if (id !== fetchIdRef.current) return;
        const msg = e.message;
        setKpisError(msg);
        setDemandError(msg);
        setClassError(msg);
        setDayError(msg);
      })
      .finally(() => {
        if (id !== fetchIdRef.current) return;
        setKpisLoading(false);
        setDemandLoading(false);
        setClassLoading(false);
        setDayLoading(false);
        setLastUpdate(new Date());
      });
  }, [buildParams]);

  /* Correr ao montar e quando os filtros mudam */
  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ---- estado global de loading ---- */
  const allLoaded = !kpisLoading && !demandLoading && !classLoading && !dayLoading;

  /* ---- KPIs ---- */
  const kpiItems = [
    { type: "records", value: kpis?.total_records },
    { type: "price_nsw", value: kpis?.avg_nsw_price },
    { type: "price_vic", value: kpis?.avg_vic_price },
    { type: "transfer", value: kpis?.avg_transfer },
  ];

  /* ---- render ---- */
  return (
    <div className="mx-auto min-h-screen max-w-[1280px] px-6 py-8 sm:px-8 lg:px-10">
      {/* ============ HEADER ============ */}
      <header className="mb-8 flex animate-fade-in items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
            <Zap size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              Energy Pulse
            </h1>
            <p className="text-sm text-gray-500">
              Demanda de Electricidade — NSW / VIC
            </p>
          </div>
        </div>
        <div className="text-right">
          <time className="block text-xs text-gray-400">
            {new Date().toLocaleDateString("pt-BR", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </time>
          {lastUpdate && (
            <span className="text-[10px] text-gray-300">
              Atualizado às {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
        </div>
      </header>

      {/* ============ FILTER BAR ============ */}
      <section
        id="filter-bar"
        className="mb-6 animate-fade-in flex flex-wrap items-center gap-3"
        style={{ animationDelay: "0.05s", animationFillMode: "both" }}
      >
        <span className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wider">
          <Tag size={12} strokeWidth={1.6} />
          Filtros
        </span>

        <FilterSelect
          id="filter-day"
          icon={CalendarDays}
          value={filterDay}
          onChange={setFilterDay}
          options={DAYS}
          placeholder="Todos os dias"
        />

        <div className="h-4 w-px bg-gray-200" aria-hidden />

        <FilterSelect
          id="filter-class"
          icon={Tag}
          value={filterClass}
          onChange={setFilterClass}
          options={CLASSES}
          placeholder="Todas as classes"
        />

        {(filterDay || filterClass) && (
          <button
            id="clear-filters"
            onClick={() => { setFilterDay(""); setFilterClass(""); }}
            className="ml-1 rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium
                       text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
          >
            Limpar filtros
          </button>
        )}

        {/* Indicador de filtro ativo */}
        {(filterDay || filterClass) && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Filtros ativos
          </span>
        )}
      </section>

      {/* ============ KPI CARDS ============ */}
      <section id="kpi-cards" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s`, animationFillMode: "both" }}>
                <MiniSkeleton height="h-24" />
              </div>
            ))
          : kpisError
            ? <div className="col-span-full"><ErrorBlock message={kpisError} /></div>
            : kpiItems.map((item, i) => (
                <div
                  key={item.type}
                  className="animate-fade-in"
                  style={{ animationDelay: `${0.1 + i * 0.06}s`, animationFillMode: "both" }}
                >
                  <KpiCard type={item.type} value={item.value} />
                </div>
              ))
        }
      </section>

      {/* ============ INSIGHTS ============ */}
      {allLoaded && !kpisError && !dayError && !classError && (
        <InsightsPanel dayData={dayData} classData={classData} kpis={kpis} />
      )}

      {/* ============ CHARTS ============ */}
      <section id="charts" className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* --- Gráfico de Linhas (2/3) --- */}
        <div
          className="animate-fade-in lg:col-span-2"
          style={{ animationDelay: "0.25s", animationFillMode: "both" }}
        >
          <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-400" strokeWidth={1.6} />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Evolução da Demanda
              </h2>
            </div>
            {demandLoading
              ? <MiniSkeleton height="h-[320px]" />
              : demandError
                ? <ErrorBlock message={demandError} />
                : <DemandLineChart data={demandData} />
            }
          </div>
        </div>

        {/* --- Gráfico Donut (1/3) --- */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: "0.35s", animationFillMode: "both" }}
        >
          <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <PieChart size={16} className="text-gray-400" strokeWidth={1.6} />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Distribuição UP / DOWN
              </h2>
            </div>
            {classLoading
              ? <MiniSkeleton height="h-[320px]" />
              : classError
                ? <ErrorBlock message={classError} />
                : <ClassPieChart data={classData} />
            }
          </div>
        </div>

        {/* --- Gráfico de Barras (full width) --- */}
        <div
          className="animate-fade-in lg:col-span-3"
          style={{ animationDelay: "0.45s", animationFillMode: "both" }}
        >
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-400" strokeWidth={1.6} />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Procura Média por Dia da Semana
              </h2>
            </div>
            {dayLoading
              ? <MiniSkeleton height="h-[320px]" />
              : dayError
                ? <ErrorBlock message={dayError} />
                : <DayDemandChart data={dayData} />
            }
          </div>
        </div>

      </section>

      {/* ============ FOOTER ============ */}
      <footer className="mt-10 border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
        Energy Pulse &copy; {new Date().getFullYear()} &mdash; Dados processados via API Django REST Framework
      </footer>
    </div>
  );
}
