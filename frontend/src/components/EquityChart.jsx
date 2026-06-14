import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { cn } from '@/lib/utils';

function generateEquity() {
  const data = [];
  let equity    = 100000;
  let benchmark = 100000;          // S&P 500-style benchmark
  const start = new Date('2025-01-02');
  for (let i = 0; i < 120; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    equity    *= (1 + (Math.random() - 0.47) * 0.012);
    benchmark *= (1 + (Math.random() - 0.49) * 0.009); // slightly lower return
    data.push({
      date:      d.toISOString().slice(0, 10),
      label:     d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value:     +equity.toFixed(2),
      benchmark: +benchmark.toFixed(2),
    });
  }
  return data;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const val   = payload.find(p => p.dataKey === 'value')?.value ?? 0;
  const bench = payload.find(p => p.dataKey === 'benchmark')?.value ?? 0;
  const pnl   = val - 100000;
  const pct   = (pnl / 100000) * 100;
  const bPct  = ((bench - 100000) / 100000) * 100;
  const up    = pnl >= 0;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-md text-left" style={{ minWidth: '160px' }}>
      <div className="text-2xs text-slate-400 font-mono mb-2">{label}</div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: up ? '#16a34a' : '#dc2626' }} />
            <span className="text-2xs text-slate-500 font-mono">Portfolio</span>
          </div>
          <span className={cn('text-2xs font-mono font-bold', up ? 'text-green-600' : 'text-red-500')}>
            {up ? '+' : ''}{pct.toFixed(2)}%
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm" style={{ background: '#db2777' }} />
            <span className="text-2xs text-slate-500 font-mono">Benchmark</span>
          </div>
          <span className="text-2xs font-mono font-bold" style={{ color: '#db2777' }}>
            {bPct >= 0 ? '+' : ''}{bPct.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
};

const TIMEFRAMES = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

export default function EquityChart() {
  const data  = useMemo(generateEquity, []);
  const first = data[0]?.value ?? 100000;
  const last  = data[data.length - 1]?.value ?? 100000;
  const pnl   = last - first;
  const pct   = (pnl / first) * 100;
  const up    = pnl >= 0;
  const color = up ? '#16a34a' : '#dc2626';

  const minY = Math.min(...data.map(d => d.value));
  const maxY = Math.max(...data.map(d => d.value));
  const pad  = (maxY - minY) * 0.12;

  return (
    <div className="panel flex flex-col hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="panel-header">
        <span className="panel-title">Equity Curve</span>
        <div className="flex items-center gap-3">
          {/* Legend pills */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-1.5 rounded-full" style={{ background: color }} />
            <span className="text-2xs text-slate-500 font-mono">Portfolio</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-px rounded-full" style={{ background: '#db2777', borderTop: '2px dashed #db2777' }} />
            <span className="text-2xs text-slate-500 font-mono">Benchmark</span>
          </div>
          <span
            className="font-mono text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              color:      up ? '#15803d' : '#dc2626',
              background: up ? '#f0fdf4' : '#fef2f2',
              border:     `1px solid ${up ? '#bbf7d0' : '#fecaca'}`,
            }}
          >
            {up ? '+' : ''}{pct.toFixed(2)}% YTD
          </span>
          <span className="font-mono text-sm font-bold text-slate-900">${last.toLocaleString()}</span>
        </div>
      </div>

      {/* Timeframe selector */}
      <div className="flex items-center gap-1 px-5 py-3 border-b border-slate-100">
        {TIMEFRAMES.map((t, i) => (
          <button
            key={t}
            className={cn(
              'px-3 py-1.5 text-2xs font-semibold rounded-lg transition-all duration-150',
              i === 2
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-4 py-4" style={{ height: '260px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor={color} stopOpacity={0.15} />
                <stop offset="70%"  stopColor={color} stopOpacity={0.03} />
                <stop offset="100%" stopColor={color} stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="benchGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#db2777" stopOpacity={0.06} />
                <stop offset="100%" stopColor="#db2777" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false} tickLine={false}
              interval={Math.floor(data.length / 6)}
            />
            <YAxis
              domain={[minY - pad, maxY + pad]}
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}
              axisLine={false} tickLine={false}
              width={68}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
            <ReferenceLine y={first} stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth={1} />
            {/* Benchmark line — deep pink, dashed, no fill */}
            <Area
              type="monotone" dataKey="benchmark"
              stroke="#db2777" strokeWidth={1.5} strokeDasharray="5 3"
              fill="url(#benchGrad)" dot={false}
              activeDot={{ r: 3, fill: '#db2777', stroke: '#fff', strokeWidth: 2 }}
            />
            {/* Portfolio equity line — primary */}
            <Area
              type="monotone" dataKey="value"
              stroke={color} strokeWidth={2.2}
              fill="url(#eqGrad)" dot={false}
              activeDot={{ r: 4, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
