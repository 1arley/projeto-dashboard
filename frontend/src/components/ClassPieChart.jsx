import { useMemo } from "react";
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from "recharts";

/* --------------------------------------------------------------
ClassPieChart - Distribuicao UP / DOWN (Donut)
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

const CLASS_ORDER = ["UP", "DOWN"];

const COLORS = {
    UP: "var(--color-chart-up, #f59e0b)",
    DOWN: "var(--color-chart-down, #94a3b8)",
};

export default function ClassPieChart({ data = [] }) {
    const { total, enriched } = useMemo(() => {
        const t = data.reduce((acc, d) => acc + d.total, 0);
        const safe = t > 0 ? t : 1;
        const enr = data.map((d) => ({
            ...d,
            percent: ((d.total / safe) * 100).toFixed(1),
        }));
        enr.sort(
            (a, b) =>
                CLASS_ORDER.indexOf(a.demand_class) - CLASS_ORDER.indexOf(b.demand_class),
        );
        return { total: t, enriched: enr };
    }, [data]);

    if (total === 0) {
        return (
            <div className="flex h-[280px] items-center justify-center text-xs text-gray-400">
                Sem dados para exibir
            </div>
        );
    }

    return (
        <div className="chart-container relative flex h-full w-full items-center justify-center overflow-hidden" style={{ background: "#ffffff" }}>
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
                        animationDuration={400}
                        animationEasing="ease-in-out"
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

            <CenterLabel total={total} />

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
