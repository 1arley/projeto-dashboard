import { useMemo } from "react";
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

function CustomTooltip({ active, payload, label, indexMap }) {
if (!active || !payload?.length) return null;

const numLabel = Number(label);
const idx = indexMap?.get(numLabel) ?? -1;
const display = idx >= 0 ? `Periodo ${idx + 1}` : numLabel.toFixed(3);

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

export default function DemandLineChart({ data = [] }) {
const indexMap = useMemo(() => {
const map = new Map();
data.forEach((d, i) => map.set(d.date, i));
return map;
}, [data]);

const tickFormatter = useMemo(
() => (v) => {
const numV = Number(v);
const i = indexMap.get(numV);
return i !== undefined ? `P${i + 1}` : numV.toFixed(3);
},
[indexMap]
);

const tooltipContent = useMemo(
() => <CustomTooltip indexMap={indexMap} />,
[indexMap]
);

  return (
    <div className="chart-container h-full w-full overflow-hidden" style={{ background: "#ffffff" }}>
    <ResponsiveContainer width="100%" height={320}>
    <LineChart
      data={data}
      animationDuration={0}
      animationEasing="ease-in-out"
margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
style={{ background: "#ffffff" }}
>
<CartesianGrid
strokeDasharray="3 3"
stroke="var(--color-gray-200, #e5e7eb)"
vertical={false}
/>

<XAxis
dataKey="date"
tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans" }}
tickLine={false}
axisLine={{ stroke: "var(--color-gray-200, #e5e7eb)", strokeWidth: 1 }}
tickCount={12}
interval="preserveStartEnd"
tickFormatter={tickFormatter}
/>

<YAxis
tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "DM Sans" }}
tickLine={false}
axisLine={false}
tickFormatter={(v) => v.toFixed(2)}
/>

<Tooltip content={tooltipContent} cursor={false} />
<Legend content={<CustomLegend />} />

        <Line
          type="monotone"
          dataKey="avg_nsw_demand"
          name="Demanda NSW"
          stroke="var(--color-chart-nsw)"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
          activeDot={{
            r: 5,
            fill: "var(--color-chart-nsw)",
            stroke: "#ffffff",
            strokeWidth: 2,
          }}
        />
        <Line
          type="monotone"
          dataKey="avg_vic_demand"
          name="Demanda VIC"
          stroke="var(--color-chart-vic)"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive={false}
          activeDot={{
            r: 5,
            fill: "var(--color-chart-vic)",
            stroke: "#ffffff",
            strokeWidth: 2,
          }}
        />
</LineChart>
</ResponsiveContainer>
</div>
);
}
