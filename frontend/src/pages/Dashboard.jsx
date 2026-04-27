import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Zap,
  BarChart3,
  PieChart,
  CalendarDays,
  Tag,
  TrendingUp,
  Lightbulb,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

import KpiCard from "../components/KpiCard";
import DemandLineChart from "../components/DemandLineChart";
import ClassPieChart from "../components/ClassPieChart";
import DayDemandChart from "../components/DayDemandChart";
import {
  getKpis,
  getDemandChart,
  getClassDistribution,
  getDayDemand,
} from "../services/api";

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
   Skeletons com shimmer
   ============================================================== */

function SkeletonBar({ width = "w-full", height = "h-3" }) {
  return (
    <div className={`skeleton-shimmer rounded-md ${height} ${width}`} />
  );
}

function KpiSkeleton({ delay = 0 }) {
  return (
    <div
      className="animate-fade-in overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
    >
      <div className="space-y-3">
        <SkeletonBar width="w-20" height="h-3" />
        <SkeletonBar width="w-36" height="h-8" />
      </div>
    </div>
  );
}

function ChartSkeleton({ height = "h-[320px]", delay = 0 }) {
  return (
    <div
      className="animate-fade-in overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
    >
      <div className="mb-5 flex items-center gap-2">
        <SkeletonBar width="w-4" height="h-4" />
        <SkeletonBar width="w-36" height="h-3" />
      </div>
      <div className={`skeleton-shimmer relative overflow-hidden rounded-lg ${height}`}>
        <svg
          className="absolute inset-0 h-full w-full opacity-30"
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <polyline
            points="0,150 50,120 100,160 150,90 200,110 250,60 300,80 350,30 400,50"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          <polyline
            points="0,130 50,100 100,140 150,70 200,90 250,40 300,60 350,10 400,30"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            className="opacity-50"
          />
        </svg>
      </div>
    </div>
  );
}

const BAR_SEEDS = [42, 68, 53, 71, 47, 62, 55];

function BarSkeleton({ delay = 0 }) {
  return (
    <div
      className="animate-fade-in overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm"
      style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
    >
      <div className="mb-5 flex items-center gap-2">
        <SkeletonBar width="w-4" height="h-4" />
        <SkeletonBar width="w-36" height="h-3" />
      </div>
      <div className="flex h-[320px] items-end justify-around gap-2 px-4">
        {BAR_SEEDS.map((seed, i) => (
          <div key={i} className="flex w-full flex-col items-center gap-1.5">
            <div
              className="skeleton-shimmer w-full rounded-t-md"
              style={{
                height: `${seed}%`,
                animationDelay: `${delay + i * 0.05}s`,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==============================================================
   Error / Empty blocks
   ============================================================== */

function ErrorBlock({ message }) {
  return (
    <div className="flex animate-fade-in items-center justify-center rounded-xl border border-red-100 bg-red-50 px-4 py-6 text-center text-xs text-red-600">
      {message || "Erro ao carregar"}
    </div>
  );
}

function EmptyBlock({ message }) {
  return (
    <div className="flex animate-fade-in items-center justify-center rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-xs text-gray-400">
      {message || "Nenhum dado encontrado"}
    </div>
  );
}

/* ==============================================================
   Filtro dropdown
   ============================================================== */

function FilterSelect({ icon: Icon, value, onChange, options, placeholder, id, label }) {
  const isActive = value !== "";
  return (
    <div className="relative flex items-center gap-2">
      <Icon
        size={14}
        strokeWidth={1.6}
        className={isActive ? "text-gray-700" : "text-gray-300"}
        aria-hidden="true"
      />
      <label htmlFor={id} className="sr-only">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={`appearance-none rounded-lg border bg-white px-3 py-1.5 pr-7 text-xs font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300
          ${isActive ? "border-gray-300 text-gray-800" : "border-gray-200 text-gray-400"}`}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
        <ChevronDown size={10} strokeWidth={1.5} />
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

    if (dayData?.length > 0) {
      let maxNSW = dayData[0];
      let maxVIC = dayData[0];
      for (const d of dayData) {
        if (d.avg_nsw_demand > maxNSW.avg_nsw_demand) maxNSW = d;
        if (d.avg_vic_demand > maxVIC.avg_vic_demand) maxVIC = d;
      }
      items.push({
        icon: TrendingUp,
        text: `${DAY_PT[maxNSW.day] || maxNSW.day} é o dia com maior demanda NSW`,
        detail: `Média: ${maxNSW.avg_nsw_demand.toFixed(4)}`,
        color: "text-blue-600",
        bg: "bg-blue-50",
      });
      items.push({
        icon: TrendingUp,
        text: `${DAY_PT[maxVIC.day] || maxVIC.day} é o dia com maior demanda VIC`,
        detail: `Média: ${maxVIC.avg_vic_demand.toFixed(4)}`,
        color: "text-teal-600",
        bg: "bg-teal-50",
      });
    }

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
                <p className="text-xs font-semibold leading-tight text-gray-800">
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

  /* ---- parâmetros estáveis para as queries ---- */
  const queryParams = useMemo(
    () => ({
      ...(filterDay && { day: filterDay }),
      ...(filterClass && { class: filterClass }),
    }),
    [filterDay, filterClass],
  );

  /* ---- React Query: 4 blocos, 4 queries independentes ---- */

  const kpisQuery = useQuery({
    queryKey: ["kpis", queryParams],
    queryFn: ({ signal }) => getKpis(queryParams, signal),
    placeholderData: (prev) => prev,
  });

  const demandQuery = useQuery({
    queryKey: ["demand", queryParams],
    queryFn: ({ signal }) => getDemandChart(queryParams, signal),
    placeholderData: (prev) => prev,
  });

  const classQuery = useQuery({
    queryKey: ["classes", queryParams],
    queryFn: ({ signal }) => getClassDistribution(queryParams, signal),
    placeholderData: (prev) => prev,
  });

  const dayQuery = useQuery({
    queryKey: ["days", queryParams],
    queryFn: ({ signal }) => getDayDemand(queryParams, signal),
    placeholderData: (prev) => prev,
  });

  /* ---- KPIs ---- */
  const kpiItems = useMemo(() => [
    { type: "records", value: kpisQuery.data?.total_records },
    { type: "price_nsw", value: kpisQuery.data?.avg_nsw_price },
    { type: "price_vic", value: kpisQuery.data?.avg_vic_price },
    { type: "transfer", value: kpisQuery.data?.avg_transfer },
  ], [kpisQuery.data]);

  const handleClearFilters = useCallback(() => {
    setFilterDay("");
    setFilterClass("");
  }, []);

  /* ---- timestamp da ultima atualizacao bem-sucedida ---- */
  const lastUpdate = Math.max(
    kpisQuery.dataUpdatedAt,
    demandQuery.dataUpdatedAt,
    classQuery.dataUpdatedAt,
    dayQuery.dataUpdatedAt,
  );

  /* ---- render ---- */
  return (
    <div className="mx-auto min-h-screen max-w-[1280px] px-6 py-8 sm:px-8 lg:px-10">
      {/* ============ HEADER ============ */}
      <header className="mb-8 flex animate-fade-in items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="header-icon-glow flex h-10 w-10 items-center justify-center rounded-xl bg-gray-900 text-white">
            <Zap size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              Energy Pulse
            </h1>
            <p className="text-sm text-gray-500">
              Demanda de Eletricidade — NSW / VIC
            </p>
          </div>
        </div>
        <div className="text-right">
          <time className="block text-xs text-gray-400">
            {new Date().toLocaleDateString("pt-BR", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </time>
          {lastUpdate > 0 && (
            <span className="text-[10px] text-gray-300">
              Atualizado às {new Date(lastUpdate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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
        <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
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
          label="Filtrar por dia da semana"
        />

        <div className="h-4 w-px bg-gray-200" aria-hidden />

        <FilterSelect
          id="filter-class"
          icon={SlidersHorizontal}
          value={filterClass}
          onChange={setFilterClass}
          options={CLASSES}
          placeholder="Todas as classes"
          label="Filtrar por classe de demanda"
        />

        {(filterDay || filterClass) && (
          <button
            id="clear-filters"
            onClick={handleClearFilters}
            aria-label="Limpar todos os filtros"
            className="ml-1 rounded-full border border-gray-200 px-3 py-1 text-[11px] font-medium
                       text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
          >
            Limpar filtros
          </button>
        )}

        {(filterDay || filterClass) && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Filtros ativos
          </span>
        )}
      </section>

      {/* ============ KPI CARDS ============ */}
      <section id="kpi-cards" className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisQuery.isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <KpiSkeleton key={i} delay={i * 0.06} />
            ))
          : kpisQuery.isError
            ? <div className="col-span-full"><ErrorBlock message={kpisQuery.error?.message} /></div>
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
      {kpisQuery.data && dayQuery.data && classQuery.data && (
        <InsightsPanel dayData={dayQuery.data} classData={classQuery.data} kpis={kpisQuery.data} />
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
        {demandQuery.isLoading
        ? <ChartSkeleton height="h-[320px]" delay={0.25} />
        : demandQuery.isError
        ? <ErrorBlock message={demandQuery.error?.message} />
        : demandQuery.data?.length === 0
        ? <EmptyBlock message="Nenhum dado encontrado para este filtro" />
        : <DemandLineChart data={demandQuery.data || []} />
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
        {classQuery.isLoading
        ? <ChartSkeleton height="h-[320px]" delay={0.35} />
        : classQuery.isError
        ? <ErrorBlock message={classQuery.error?.message} />
        : classQuery.data?.length === 0
        ? <EmptyBlock message="Nenhum dado encontrado para este filtro" />
        : <ClassPieChart data={classQuery.data || []} />
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
        {dayQuery.isLoading
        ? <BarSkeleton delay={0.45} />
        : dayQuery.isError
        ? <ErrorBlock message={dayQuery.error?.message} />
        : dayQuery.data?.length === 0
        ? <EmptyBlock message="Nenhum dado encontrado para este filtro" />
        : <DayDemandChart data={dayQuery.data || []} />
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
