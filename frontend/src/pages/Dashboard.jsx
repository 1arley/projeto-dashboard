import { useEffect, useState } from "react";
import { Zap, BarChart3, PieChart, RefreshCw } from "lucide-react";

import KpiCard from "../components/KpiCard";
import DemandLineChart from "../components/DemandLineChart";
import ClassPieChart from "../components/ClassPieChart";
import { getDashboardData } from "../services/api";

/* --------------------------------------------------------------
   Dashboard — Página principal
   Layout: 12-col grid (Tailwind)
     Header  → full width
     KPIs    → 3 colunas no desktop, 1 no mobile
     Charts  → Linhas (col-span-2) + Donut (col-span-1)
   -------------------------------------------------------------- */

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4 text-gray-400">
        <RefreshCw size={32} className="animate-spin" />
        <p className="text-sm">A carregar dashboard...</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData()
      .then((res) => setData(res))
      .catch((err) => console.error("Erro ao carregar dados:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const { kpis, charts } = data ?? {};
  const kpiItems = [
    { type: "records", value: kpis?.total_records },
    { type: "price_nsw", value: kpis?.avg_nsw_price },
    { type: "price_vic", value: kpis?.avg_vic_price },
  ];

  return (
    <div className="mx-auto min-h-screen max-w-[1280px] px-6 py-8 sm:px-8 lg:px-10">
      {/* ============ HEADER ============ */}
      <header
        className="mb-8 flex animate-fade-in items-center justify-between"
        style={{ animationDelay: "0s" }}
      >
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

        <time className="text-xs text-gray-400">
          {new Date().toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </time>
      </header>

      {/* ============ KPI CARDS ============ */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpiItems.map((item, i) => (
          <div
            key={item.type}
            className="animate-fade-in"
            style={{
              animationDelay: `${0.15 + i * 0.1}s`,
              animationFillMode: "both",
            }}
          >
            <KpiCard type={item.type} value={item.value} />
          </div>
        ))}
      </section>

      {/* ============ CHARTS ============ */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Gráfico de Linhas — 2/3 */}
        <div
          className="animate-fade-in lg:col-span-2"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={16} className="text-gray-400" strokeWidth={1.6} />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Evolução da Demanda
              </h2>
            </div>
            <DemandLineChart data={charts?.demand_by_period} />
          </div>
        </div>

        {/* Gráfico Donut — 1/3 */}
        <div
          className="animate-fade-in"
          style={{ animationDelay: "0.5s", animationFillMode: "both" }}
        >
          <div className="h-full rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <PieChart size={16} className="text-gray-400" strokeWidth={1.6} />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Distribuição UP / DOWN
              </h2>
            </div>
            <ClassPieChart data={charts?.class_distribution} />
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="mt-10 border-t border-gray-100 pt-5 text-center text-xs text-gray-400">
        Energy Pulse &copy; {new Date().getFullYear()} &mdash; Dados processados via API Django
      </footer>
    </div>
  );
}
