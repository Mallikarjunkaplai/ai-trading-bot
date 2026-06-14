import { TrendingUp, TrendingDown } from 'lucide-react';

const POSITIONS = [
  { sym: 'AAPL',  side: 'Long',  qty: 150, avgPx: 181.20, lastPx: 189.42, pnl: +1233.0, pnlPct: +4.54,  mktVal: 28413, strategy: 'RSI-MACD' },
  { sym: 'NVDA',  side: 'Long',  qty: 20,  avgPx: 820.50, lastPx: 875.60, pnl: +1102.0, pnlPct: +6.71,  mktVal: 17512, strategy: 'Momentum' },
  { sym: 'TSLA',  side: 'Short', qty: 40,  avgPx: 253.10, lastPx: 248.10, pnl: +200.0,  pnlPct: +1.98,  mktVal: 9924,  strategy: 'Mean Rev' },
  { sym: 'MSFT',  side: 'Long',  qty: 50,  avgPx: 418.00, lastPx: 415.23, pnl: -138.5,  pnlPct: -0.66,  mktVal: 20762, strategy: 'RSI-MACD' },
  { sym: 'META',  side: 'Long',  qty: 25,  avgPx: 495.00, lastPx: 508.92, pnl: +348.0,  pnlPct: +2.81,  mktVal: 12723, strategy: 'Breakout' },
  { sym: 'AMZN',  side: 'Long',  qty: 30,  avgPx: 190.00, lastPx: 187.34, pnl: -79.8,   pnlPct: -1.40,  mktVal: 5620,  strategy: 'Sentiment' },
];

const totalUnreal = POSITIONS.filter(p => p.pnl >= 0).reduce((s, p) => s + p.pnl, 0);

const COLS = [
  { key: 'sym',      label: 'Symbol',   w: '11%' },
  { key: 'side',     label: 'Side',     w: '8%'  },
  { key: 'qty',      label: 'Qty',      w: '7%'  },
  { key: 'avgPx',    label: 'Avg Px',   w: '11%' },
  { key: 'lastPx',   label: 'Last',     w: '10%' },
  { key: 'pnl',      label: 'P&L $',    w: '12%' },
  { key: 'pnlPct',   label: 'P&L %',    w: '10%' },
  { key: 'mktVal',   label: 'Mkt Val',  w: '13%' },
  { key: 'strategy', label: 'Strategy', w: '18%' },
];

export default function PositionsTable() {
  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="panel-header">
        <span className="panel-title">Open Positions</span>
        <div className="flex items-center gap-2">
          <span className="text-2xs text-slate-400 font-mono">{POSITIONS.length} open</span>
          <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{ color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            +${totalUnreal.toFixed(0)} unrealized
          </span>
        </div>
      </div>

      {/* Col headers */}
      <div
        className="grid text-2xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 overflow-x-auto"
        style={{ gridTemplateColumns: COLS.map(c => c.w).join(' '), minWidth: '640px' }}
      >
        {COLS.map(col => <span key={col.key} className="px-3 py-2.5">{col.label}</span>)}
      </div>

      {/* Rows */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: '640px' }}>
          {POSITIONS.map(pos => {
            const up     = pos.pnl >= 0;
            const isLong = pos.side === 'Long';
            return (
              <div
                key={pos.sym}
                className="grid border-b border-slate-50 cursor-default transition-colors duration-100 hover:bg-slate-50"
                style={{ gridTemplateColumns: COLS.map(c => c.w).join(' ') }}
              >
                <span className="px-3 py-2.5 text-xs font-mono font-bold text-slate-800">{pos.sym}</span>
                <span className="px-3 py-2.5 text-xs font-semibold" style={{ color: isLong ? '#16a34a' : '#dc2626' }}>
                  {pos.side}
                </span>
                <span className="px-3 py-2.5 text-2xs font-mono text-slate-500">{pos.qty.toLocaleString()}</span>
                <span className="px-3 py-2.5 text-2xs font-mono text-slate-500">{pos.avgPx.toFixed(2)}</span>
                <span className="px-3 py-2.5 text-2xs font-mono font-semibold text-slate-800">{pos.lastPx.toFixed(2)}</span>
                <span className="px-3 py-2.5 text-2xs font-mono font-bold" style={{ color: up ? '#16a34a' : '#dc2626' }}>
                  {up ? '+' : ''}{pos.pnl.toFixed(2)}
                </span>
                <span className="px-3 py-2.5 text-2xs font-mono flex items-center gap-0.5" style={{ color: up ? '#16a34a' : '#dc2626' }}>
                  {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                  {up ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                </span>
                <span className="px-3 py-2.5 text-2xs font-mono text-slate-500">${pos.mktVal.toLocaleString()}</span>
                <span className="px-3 py-2.5 text-2xs font-semibold" style={{ color: '#4f46e5' }}>{pos.strategy}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
