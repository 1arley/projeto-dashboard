import { TrendingUp, TrendingDown, Database, ArrowRightLeft } from "lucide-react";

/* --------------------------------------------------------------
KpiCard — Cartao de indicador principal
- Fundo branco, borda sutil, sombra leve
- Icone com fundo circular tintado
- Label gray-500 text-sm font-medium
- Valor gray-900 font-bold text-3xl
-------------------------------------------------------------- */

const meta = {
records: {
icon: Database,
label: "Registos Processados",
circleBg: "bg-blue-50",
circleIcon: "text-blue-600",
},
price_nsw: {
icon: TrendingUp,
label: "Preco Medio NSW",
circleBg: "bg-indigo-50",
circleIcon: "text-indigo-600",
},
price_vic: {
icon: TrendingDown,
label: "Preco Medio VIC",
circleBg: "bg-emerald-50",
circleIcon: "text-emerald-600",
},
transfer: {
icon: ArrowRightLeft,
label: "Transferencia Media (MW)",
circleBg: "bg-amber-50",
circleIcon: "text-amber-600",
},
};

const NULL_PLACEHOLDER = "\u2014";

export default function KpiCard({ type, value }) {
const config = meta[type] ?? meta.records;
const Icon = config.icon;

const isNull = value === null || value === undefined;

const formatted = isNull
? NULL_PLACEHOLDER
: type === "records"
? Number(value).toLocaleString("pt-BR")
: type === "transfer"
? `${Number(value).toFixed(2)} MW`
: `$${Number(value).toFixed(4)}`;

return (
<article
className="group relative overflow-hidden rounded-xl border border-gray-100
bg-white px-6 py-5 shadow-sm transition-all duration-300
hover:shadow-md hover:-translate-y-0.5"
>
<div className="flex items-start justify-between">
<div className="space-y-1">
<span className="text-sm font-medium text-gray-500">
{config.label}
</span>
<p className={`text-3xl font-bold leading-tight tracking-tight ${isNull ? "text-gray-300" : "text-gray-900"}`}>
{formatted}
</p>
</div>

<div
className={`flex h-10 w-10 items-center justify-center rounded-full
${config.circleBg} ${config.circleIcon}`}
>
<Icon size={18} strokeWidth={1.8} />
</div>
</div>
</article>
);
}
