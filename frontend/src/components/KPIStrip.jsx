import { useState, useEffect, useRef } from 'react';
import { cn, fmtCurrency, fmtPct } from '@/lib/utils';
import { TrendingUp, TrendingDown, Activity, Cpu, DollarSign, BarChart2 } from 'lucide-react';

// ─── Static KPI definitions ─────────────────────────────────────────────────
const KPI_DEFS = [
  {
    id: 'nav',
    label: 'Net Asset Value',
    baseValue: 142840.50,
    change: +8.42,
    fmt: v => fmtCurrency(v, 2),
    icon: DollarSign,
    sub: 'vs. 30d ago',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    drift: 50,        // max ± drift per tick
  },
  {
    id: 'pnl_day',
    label: 'Daily P&L',
    baseValue: 3218.75,
    change: +2.31,
    fmt: v => `${v >= 0 ? '+' : ''}${fmtCurrency(Math.abs(v), 2)}`,
    icon: TrendingUp,
    sub: 'Realized + Unrealized',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    drift: 25,
  },
  {
    id: 'pnl_ytd',
    label: 'YTD Return',
    baseValue: 18.42,
    isPercent: true,
    change: +18.42,
    fmt: v => fmtPct(v, 2),
    icon: BarChart2,
    sub: 'Since Jan 1 2025',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    drift: 0,          // static — percentage doesn't tick
  },
  {
    id: 'trades',
    label: 'Trade Count',
    baseValue: 847,
    change: +12,
    fmt: v => v.toLocaleString(),
    icon: Activity,
    sub: '+12 today',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
    drift: 1,
    integer: true,
  },
  {
    id: 'cycles',
    label: 'Strategy Cycles',
    baseValue: 12904,
    change: +0.2,
    fmt: v => v.toLocaleString(),
    icon: Cpu,
    sub: '99.8% uptime',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    drift: 3,
    integer: true,
  },
];

// ─── Single KPI card ─────────────────────────────────────────────────────────
function StatCard({ kpi, liveValue, flashDir }) {
  const Icon = kpi.icon;
  const up   = kpi.change >= 0;

  return (
    <div
      className={cn(
        'panel p-5 flex flex-col gap-3',
        'cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 active:scale-95',
      )}
    >
      {/* Label + icon */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-slate-500 leading-tight">{kpi.label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', kpi.iconBg)}>
          <Icon size={14} className={kpi.iconColor} />
        </div>
      </div>

      {/* Primary value — flashes green/red on update */}
      <div
        className={cn(
          'font-mono text-xl font-bold leading-none transition-colors duration-500',
          flashDir === 'up'   && 'text-green-600',
          flashDir === 'down' && 'text-red-500',
          !flashDir           && 'text-slate-900',
        )}
      >
        {kpi.fmt(liveValue)}
      </div>

      {/* Change badge + sub */}
      <div className="flex items-center gap-2">
        <span
          className="flex items-center gap-0.5 text-2xs font-mono font-bold px-2 py-0.5 rounded-full"
          style={{
            color:      up ? '#15803d' : '#dc2626',
            background: up ? '#f0fdf4' : '#fef2f2',
            border:     `1px solid ${up ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          {up ? '+' : ''}{kpi.change.toFixed(2)}{kpi.isPercent ? 'pp' : ''}
        </span>
        <span className="text-2xs text-slate-400">{kpi.sub}</span>
      </div>
    </div>
  );
}

// ─── KPI Strip with live simulation ──────────────────────────────────────────
export default function KPIStrip() {
  // Live values stored per KPI id
  const [values, setValues] = useState(() => {
    const map = {};
    KPI_DEFS.forEach(k => { map[k.id] = k.baseValue; });
    return map;
  });

  // Flash direction per KPI id: 'up' | 'down' | null
  const [flash, setFlash] = useState({});
  const flashTimeout = useRef({});

  // Simulate live ticking
  useEffect(() => {
    const id = setInterval(() => {
      setValues(prev => {
        const next = { ...prev };
        const newFlash = {};

        KPI_DEFS.forEach(kpi => {
          if (kpi.drift === 0) return; // static

          const delta = (Math.random() - 0.48) * kpi.drift;
          let val     = prev[kpi.id] + delta;
          if (kpi.integer) val = Math.round(val);
          // Clamp — don't let trade count or cycles go negative
          if (val < 0) val = 0;

          next[kpi.id]  = +val.toFixed(kpi.integer ? 0 : 2);
          newFlash[kpi.id] = delta >= 0 ? 'up' : 'down';
        });

        // Set flash, then clear after 500ms
        setFlash(newFlash);
        Object.keys(flashTimeout.current).forEach(k => clearTimeout(flashTimeout.current[k]));
        const clearId = setTimeout(() => setFlash({}), 600);
        flashTimeout.current = { _all: clearId };

        return next;
      });
    }, 1500);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {KPI_DEFS.map(k => (
        <StatCard
          key={k.id}
          kpi={k}
          liveValue={values[k.id]}
          flashDir={flash[k.id] || null}
        />
      ))}
    </div>
  );
}
