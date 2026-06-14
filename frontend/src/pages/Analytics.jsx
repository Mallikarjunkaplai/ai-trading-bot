// Analytics — /analytics route
import EquityChart from '@/components/EquityChart';
import CandlestickChart from '@/components/CandlestickChart';
import AllocationChart from '@/components/AllocationChart';
import { cn } from '@/lib/utils';

const RISK_METRICS = [
  { label: 'Sharpe Ratio',    value: '2.14',   sub: 'Annualized (rf=5%)',  good: true },
  { label: 'Sortino Ratio',   value: '3.02',   sub: 'Downside deviation',  good: true },
  { label: 'Max Drawdown',    value: '-8.3%',  sub: 'From peak equity',    good: false },
  { label: 'Volatility',      value: '14.2%',  sub: 'Annualized daily σ',  good: null },
  { label: 'Beta (vs SPX)',   value: '0.72',   sub: 'Rolling 90-day',      good: null },
  { label: 'Calmar Ratio',    value: '2.21',   sub: 'Return / MaxDD',      good: true },
];

export default function Analytics() {
  return (
    <div className="p-5 md:p-6 space-y-6 w-full min-h-screen bg-slate-50 text-slate-900">
      {/* Heading */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Performance Analytics</h2>
        <p className="text-xs text-slate-500 font-mono mt-0.5">
          Risk-adjusted metrics · YTD 2025
        </p>
      </div>

      {/* Risk metrics strip */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6">
        {RISK_METRICS.map(m => (
          <div key={m.label} className={cn(
            'panel p-5 cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-200 active:scale-95'
          )}>
            <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-2 leading-tight">{m.label}</div>
            <div className={
              m.good === true ? 'font-mono text-xl font-bold text-green-600' :
              m.good === false ? 'font-mono text-xl font-bold text-red-500' :
              'font-mono text-xl font-bold text-slate-900'
            }>{m.value}</div>
            <div className="text-xs text-slate-500 mt-2 leading-tight">{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Equity curve — full width */}
      <div style={{ height: '320px' }}>
        <EquityChart />
      </div>

      {/* Candlestick + Allocation */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <CandlestickChart />
        <AllocationChart />
      </div>
    </div>
  );
}
