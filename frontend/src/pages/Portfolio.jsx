// Portfolio — /portfolio route
import PositionsTable from '@/components/PositionsTable';
import AllocationChart from '@/components/AllocationChart';
import { cn } from '@/lib/utils';
import { TrendingUp, DollarSign, BarChart2 } from 'lucide-react';

const METRICS = [
  { label: 'Total Equity',    value: '$142,840.50', sub: '+$12,110 all-time', up: true },
  { label: 'Invested Capital', value: '$128,900.00', sub: '90.2% deployed',   up: null },
  { label: 'Cash / Reserve',   value: '$13,940.50',  sub: '9.8% of portfolio',up: null },
  { label: 'Realized P&L',     value: '+$9,218.75',  sub: 'Current tax year',  up: true },
];

export default function Portfolio() {
  return (
    <div className="p-5 md:p-6 space-y-6 w-full min-h-screen bg-slate-50 text-slate-900">
      {/* Page heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Portfolio Overview</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">As of {new Date().toLocaleDateString('en-US', { weekday:'short', year:'numeric', month:'short', day:'numeric' })}</p>
        </div>
        <span className="text-xs font-mono text-slate-500 border border-slate-200 rounded-lg px-3 py-1.5 bg-white shadow-sm">
          Account: <span className="text-amber-600 font-bold">AT-0042</span>
        </span>
      </div>

      {/* Metric strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {METRICS.map(m => (
          <div key={m.label} className={cn(
            'panel p-5 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 active:scale-95'
          )}>
            <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-2">{m.label}</div>
            <div className={cn(
              'font-mono text-xl font-bold leading-none',
              m.up === true ? 'text-green-600' : m.up === false ? 'text-red-500' : 'text-slate-900',
            )}>{m.value}</div>
            <div className="text-xs text-slate-500 mt-2">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Positions full width */}
      <PositionsTable />

      {/* Allocation chart */}
      <div style={{ maxWidth: '560px' }}>
        <AllocationChart />
      </div>
    </div>
  );
}
