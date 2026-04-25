import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";

/* --------------------------------------------------------------
   ClassPieChart — Distribuição UP / DOWN (Donut)
   - Donut com innerRadius ≈ 73% do outer (elegante)
   - UP: amber (destaque elegante e caloroso)
   - DOWN: slate (neutro, sóbrio)
   -------------------------------------------------------------- */

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const { demand_class, total, percent } = payload[0].payload;

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-gray-400">
        Classe {demand_class}
      </p>
      <p className="text-sm text-gray-900">
        <span className="font-semibold">{total.toLocaleString("pt-BR")}</span>
        <span className="ml-1 text-gray-400">({percent}%)</span>
      </p>
    </div>
  );
}

function CenterLabel({ total }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
        Total
      </span>
      <span className="text-2xl font-bold leading-tight text-gray-900">
        {total.toLocaleString("pt-BR")}
      </span>
    </div>
  );
}

const COLORS = {
  UP: "#f59e0b",   /* amber-500 — destaque elegante */
  DOWN: "#94a3b8", /* slate-400 — neutro */
};

export default function ClassPieChart({ data = [] }) {
  const total = data.reduce((acc, d) => acc + d.total, 0);

  const enriched = data.map((d) => ({
    ...d,
    percent: ((d.total / total) * 100).toFixed(1),
  }));

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={enriched}
            dataKey="total"
            nameKey="demand_class"
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={110}
            paddingAngle={4}
            strokeWidth={0}
            animationBegin={200}
            animationDuration={700}
          >
            {enriched.map((entry) => (
              <Cell
                key={entry.demand_class}
                fill={COLORS[entry.demand_class]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Rótulo central */}
      <CenterLabel total={total} />

      {/* Legenda abaixo */}
      <div className="absolute -bottom-1 flex items-center gap-6 text-xs">
        {enriched.map((entry) => (
          <div key={entry.demand_class} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[entry.demand_class] }}
            />
            <span className="text-gray-500">{entry.demand_class}</span>
            <span className="font-semibold text-gray-700">{entry.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
