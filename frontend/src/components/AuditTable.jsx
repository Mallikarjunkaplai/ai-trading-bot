import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

const STRATEGIES = ['RSI-MACD Cross', 'Momentum Breakout', 'Mean Reversion', 'News Sentiment', 'Bollinger Squeeze'];
const SYMBOLS    = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'META', 'AMZN', 'GOOGL', 'SPY', 'QQQ'];
const STATUSES   = ['FILLED', 'FILLED', 'FILLED', 'FILLED', 'PARTIAL', 'REJECTED', 'PENDING'];

function seed(id) {
  return {
    id:         `T${String(id + 1).padStart(4, '0')}`,
    strategy:   STRATEGIES[id % STRATEGIES.length],
    symbol:     SYMBOLS[id % SYMBOLS.length],
    side:       id % 3 === 0 ? 'SELL' : 'BUY',
    status:     STATUSES[id % STATUSES.length],
    qty:        Math.floor(id * 17 % 40 + 5) * 5,
    price:      +(150 + (id * 37 % 400)).toFixed(2),
    pnl:        +((id * 73 % 200) - 80).toFixed(2),
    confidence: 55 + (id * 11 % 40),
    time:       new Date(Date.now() - id * 47000).toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    }),
  };
}

const INITIAL = Array.from({ length: 16 }, (_, i) => seed(i));

const STATUS_CONFIG = {
  FILLED:   { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  PARTIAL:  { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  REJECTED: { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  PENDING:  { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' },
};

const COLS = [
  { key: 'id',         label: 'ID',       w: '7%'  },
  { key: 'time',       label: 'Time',     w: '9%'  },
  { key: 'symbol',     label: 'Symbol',   w: '8%'  },
  { key: 'side',       label: 'Side',     w: '7%'  },
  { key: 'strategy',   label: 'Strategy', w: '20%' },
  { key: 'qty',        label: 'Qty',      w: '7%'  },
  { key: 'price',      label: 'Price',    w: '9%'  },
  { key: 'pnl',        label: 'P&L',      w: '9%'  },
  { key: 'confidence', label: 'Conf',     w: '11%' },
  { key: 'status',     label: 'Status',   w: '13%' },
];

function ConfBar({ value }) {
  const color = value >= 80 ? '#16a34a' : value >= 65 ? '#d97706' : '#dc2626';
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-100" style={{ maxWidth: '40px' }}>
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="font-mono text-2xs w-7 text-right font-semibold" style={{ color }}>{value}%</span>
    </div>
  );
}

export default function AuditTable() {
  const [trades, setTrades] = useState(INITIAL);

  useEffect(() => {
    const id = setInterval(() => {
      setTrades(prev => {
        const t = seed(Date.now() % 10000);
        t.time   = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        t.status = Math.random() > 0.15 ? 'FILLED' : 'PARTIAL';
        return [t, ...prev.slice(0, 19)];
      });
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="panel flex flex-col overflow-hidden">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-blue-500" />
          <span className="panel-title">Strategy Execution Audit</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-2xs text-slate-400">
            <div className="dot-live" />
            <span className="font-mono font-semibold text-slate-500">LIVE</span>
          </span>
          <span className="text-2xs font-mono font-semibold px-2 py-0.5 rounded-full"
            style={{ color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            {trades.length} entries
          </span>
        </div>
      </div>

      {/* Column headers */}
      <div
        className="grid text-2xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100 overflow-x-auto shrink-0"
        style={{ gridTemplateColumns: COLS.map(c => c.w).join(' '), minWidth: '720px' }}
      >
        {COLS.map(c => <span key={c.key} className="px-3 py-2.5">{c.label}</span>)}
      </div>

      {/* Rows */}
      <div className="overflow-y-auto overflow-x-auto no-scrollbar" style={{ maxHeight: '280px' }}>
        <div style={{ minWidth: '720px' }}>
          {trades.map((t, i) => {
            const up    = t.pnl >= 0;
            const isBuy = t.side === 'BUY';
            const st    = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.PENDING;
            const isNew = i === 0;

            return (
              <div
                key={`${t.id}-${i}`}
                className={cn('grid border-b border-slate-50 transition-colors duration-150', isNew && 'animate-slide-in')}
                style={{ gridTemplateColumns: COLS.map(c => c.w).join(' ') }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isNew ? '#f0f9ff' : 'transparent'; }}
              >
                <span className="px-3 py-2.5 text-2xs font-mono text-slate-400">{t.id}</span>
                <span className="px-3 py-2.5 text-2xs font-mono text-slate-400">{t.time}</span>
                <span className="px-3 py-2.5 text-2xs font-mono font-bold text-slate-800">{t.symbol}</span>
                <span className="px-3 py-2.5 text-2xs font-bold" style={{ color: isBuy ? '#16a34a' : '#dc2626' }}>
                  {t.side}
                </span>
                <span className="px-3 py-2.5 text-2xs font-semibold truncate" style={{ color: '#4f46e5' }}>
                  {t.strategy}
                </span>
                <span className="px-3 py-2.5 text-2xs font-mono text-slate-500">{t.qty}</span>
                <span className="px-3 py-2.5 text-2xs font-mono text-slate-700">{t.price.toFixed(2)}</span>
                <span className="px-3 py-2.5 text-2xs font-mono font-bold" style={{ color: up ? '#16a34a' : '#dc2626' }}>
                  {up ? '+' : ''}{t.pnl.toFixed(2)}
                </span>
                <span className="px-3 py-2.5"><ConfBar value={t.confidence} /></span>
                <span className="px-3 py-2.5">
                  <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}` }}>
                    {t.status}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
