import { useMemo } from "react";
import {
ResponsiveContainer,
BarChart,
Bar,
XAxis,
YAxis,
Tooltip,
Legend,
} from "recharts";

/* --------------------------------------------------------------
DayDemandChart — Procura Media por Dia da Semana (Barras Horizontais)
-------------------------------------------------------------- */

const DAY_ORDER = [
"Monday", "Tuesday", "Wednesday",
"Thursday", "Friday", "Saturday", "Sunday",
];

const DAY_PT = {
Monday: "Segunda", Tuesday: "Terça", Wednesday: "Quarta",
Thursday: "Quinta", Friday: "Sexta", Saturday: "Sábado", Sunday: "Domingo",
};

function CustomTooltip({ active, payload, label }) {
if (!active || !payload?.length) return null;

return (
<div className="rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
<p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
{DAY_PT[label] ?? label}
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

export default function DayDemandChart({ data = [] }) {
const sorted = useMemo(
() =>
[...data].sort(
(a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day)
),
[data]
);

const localized = useMemo(
() => sorted.map((d) => ({
...d,
dayLabel: DAY_PT[d.day] ?? d.day,
})),
[sorted]
);

return (
    <div className="chart-container h-full w-full overflow-hidden" style={{ background: "#ffffff" }}>
<ResponsiveContainer width="100%" height={320}>
<BarChart
data={localized}
          animationDuration={400}
          animationEasing="ease-out"
layout="vertical"
margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
barSize={14}
barGap={6}
>
<XAxis
type="number"
tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans" }}
tickLine={false}
axisLine={{ stroke: "var(--color-gray-200, #e5e7eb)", strokeWidth: 1 }}
tickFormatter={(v) => v.toFixed(2)}
/>
<YAxis
type="category"
dataKey="dayLabel"
tick={{ fontSize: 12, fill: "#6b7280", fontFamily: "DM Sans", fontWeight: 500 }}
tickLine={false}
axisLine={false}
width={80}
/>
<Tooltip content={<CustomTooltip />} cursor={false} />
<Legend content={<CustomLegend />} />

<Bar
dataKey="avg_nsw_demand"
name="Demanda NSW"
fill="var(--color-chart-nsw)"
radius={[0, 4, 4, 0]}
/>
<Bar
dataKey="avg_vic_demand"
name="Demanda VIC"
fill="var(--color-chart-vic)"
radius={[0, 4, 4, 0]}
/>
</BarChart>
</ResponsiveContainer>
</div>
);
}
