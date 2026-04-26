import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

/* --------------------------------------------------------------
   DayDemandChart — Procura Média por Dia da Semana (Barras Horizontais)
   -------------------------------------------------------------- */

const DAY_ORDER = [
  "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday",
];

const COLORS = {
  NSW: "#64748b",
  VIC: "#14b8a6",
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {Number(entry.value).toFixed(4)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DayDemandChart({ data = [] }) {
  const sorted = useMemo(
    () =>
      [...data].sort(
        (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
      ),
    [data]
  );

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
          barSize={14}
          barGap={6}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
          />
          <YAxis
            type="category"
            dataKey="day"
            tick={{ fontSize: 12, fill: "#6b7280", fontFamily: "DM Sans", fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />

          <Bar
            dataKey="avg_nsw_demand"
            name="NSW Demand"
            fill={COLORS.NSW}
            radius={[0, 4, 4, 0]}
            animationDuration={300}
          />

          <Bar
            dataKey="avg_vic_demand"
            name="VIC Demand"
            fill={COLORS.VIC}
            radius={[0, 4, 4, 0]}
            animationDuration={300}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
