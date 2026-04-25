import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/* --------------------------------------------------------------
   DemandLineChart — Evolução NSW vs VIC
   - Grid tracejada e clara (strokeDasharray="3 3")
   - Cores dessaturadas: NSW = slate, VIC = teal
   - Tooltip: bg-white, border sutil, rounded-xl
   -------------------------------------------------------------- */

/* Tooltip customizado — combina com o estilo dos KPI cards */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
        Período {Number(label).toFixed(3)}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 text-sm">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {Number(entry.value).toFixed(3)}
          </span>
        </div>
      ))}
    </div>
  );
}

/* Legend customizada */
function CustomLegend({ payload }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-6 text-xs">
      {payload?.map((entry) => (
        <div key={entry.value} className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-500">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DemandLineChart({ data = [] }) {
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
        >
          {/* Grid horizontal tracejada e clara */}
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"        /* gray-200 */
            vertical={false}
          />

          {/* Eixo X */}
          <XAxis
            dataKey="period"
            tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
            tickFormatter={(v) => v.toFixed(2)}
          />

          {/* Eixo Y */}
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />

          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Legend content={<CustomLegend />} />

          {/* NSW — slate-500 (dessaturado, profissional) */}
          <Line
            type="monotone"
            dataKey="avg_nsw_demand"
            name="NSW Demand"
            stroke="#64748b"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#64748b",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />

          {/* VIC — teal-500 (verde-água, dessaturado) */}
          <Line
            type="monotone"
            dataKey="avg_vic_demand"
            name="VIC Demand"
            stroke="#14b8a6"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: "#14b8a6",
              stroke: "#ffffff",
              strokeWidth: 2,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
