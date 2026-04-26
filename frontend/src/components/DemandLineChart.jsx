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

/* Tooltip customizado — usa os dados reais para mapear o índice */
function CustomTooltip({ active, payload, label, data }) {
  if (!active || !payload?.length) return null;

  const numLabel = Number(label);
  const idx = data?.findIndex(d => Math.abs(d.date - numLabel) < 1e-9) ?? -1;
  const display = idx >= 0 ? `Período ${idx + 1}` : numLabel.toFixed(3);

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
        {display}
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

          {/* Eixo X — Data normalizada → índice real no array */}
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans" }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb", strokeWidth: 1 }}
            tickCount={12}
            interval="preserveStartEnd"
            tickFormatter={(v) => {
              const numV = Number(v);
              const i = data.findIndex(d => Math.abs(d.date - numV) < 1e-9);
              return i >= 0 ? `P${i + 1}` : numV.toFixed(3);
            }}
          />

          {/* Eixo Y */}
          <YAxis
            tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => v.toFixed(2)}
          />

          <Tooltip content={<CustomTooltip data={data} />} cursor={false} />
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
