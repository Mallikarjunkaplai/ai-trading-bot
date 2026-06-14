// Strategies — /strategies route
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Square, Cpu } from 'lucide-react';

const INITIAL_STRATEGIES = [
  {
    name: 'RSI-MACD Cross',
    status: 'running',
    trades: 312,
    winRate: 68.2,
    pnl: +4820.50,
    pnlPct: +4.82,
    instruments: ['AAPL','MSFT','GOOGL'],
    interval: '5m',
    risk: 'Medium',
  },
  {
    name: 'Momentum Breakout',
    status: 'running',
    trades: 198,
    winRate: 61.1,
    pnl: +2140.25,
    pnlPct: +2.14,
    instruments: ['NVDA','TSLA'],
    interval: '15m',
    risk: 'High',
  },
  {
    name: 'Mean Reversion',
    status: 'paused',
    trades: 87,
    winRate: 72.4,
    pnl: +980.00,
    pnlPct: +0.98,
    instruments: ['SPY','QQQ'],
    interval: '1h',
    risk: 'Low',
  },
  {
    name: 'News Sentiment',
    status: 'running',
    trades: 250,
    winRate: 59.6,
    pnl: +1278.00,
    pnlPct: +1.28,
    instruments: ['AAPL','META','AMZN'],
    interval: '1m',
    risk: 'High',
  },
  {
    name: 'Bollinger Squeeze',
    status: 'stopped',
    trades: 0,
    winRate: 0,
    pnl: 0,
    pnlPct: 0,
    instruments: ['GLD','SLV'],
    interval: '30m',
    risk: 'Low',
  },
];

const STATUS_DOT = {
  running: 'dot-live',
  paused:  'dot-paused',
  stopped: 'dot-error',
};
const STATUS_LABEL = {
  running: 'text-green-600',
  paused:  'text-amber-600',
  stopped: 'text-slate-400',
};
const RISK_COLOR = {
  Low:    'text-green-600',
  Medium: 'text-amber-600',
  High:   'text-red-500',
};

export default function Strategies() {
  const [strategies, setStrategies] = useState(INITIAL_STRATEGIES);

  useEffect(() => {
    const id = setInterval(() => {
      setStrategies(prev => prev.map(s => {
        if (s.status !== 'running') return s;
        
        // Random drift logic for running strategies
        const pnlDrift = (Math.random() - 0.48) * 15; // slightly positive bias
        const newPnl = s.pnl + pnlDrift;
        const newPnlPct = s.pnlPct + (pnlDrift / 1000);
        
        // Occasionally add a trade
        const addTrade = Math.random() > 0.8;
        const newTrades = addTrade ? s.trades + 1 : s.trades;
        
        // Slight win rate drift if trade added
        const winRateDrift = addTrade ? (Math.random() - 0.45) * 0.2 : 0;
        const newWinRate = Math.min(Math.max(s.winRate + winRateDrift, 0), 100);

        return {
          ...s,
          pnl: newPnl,
          pnlPct: newPnlPct,
          trades: newTrades,
          winRate: newWinRate,
        };
      }));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-5 md:p-6 space-y-6 w-full min-h-screen bg-slate-50 text-slate-900">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Strategy Manager</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {strategies.filter(s => s.status === 'running').length} active ·{' '}
            {strategies.filter(s => s.status === 'paused').length} paused ·{' '}
            {strategies.filter(s => s.status === 'stopped').length} stopped
          </p>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 border border-amber-600 rounded-lg px-3 py-1.5 hover:bg-amber-50 transition-colors">
          <Cpu size={14} />
          Deploy New Strategy
        </button>
      </div>

      {/* Strategy table */}
      <div className="panel overflow-hidden hover:shadow-md transition-shadow">
        {/* Column headers */}
        <div
          className="grid border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider"
          style={{ gridTemplateColumns: '32px 1fr 100px 80px 80px 100px 100px 100px 100px' }}
        >
          <span className="px-3 py-2.5" />
          <span className="px-3 py-2.5">Strategy</span>
          <span className="px-3 py-2.5">Status</span>
          <span className="px-3 py-2.5">Interval</span>
          <span className="px-3 py-2.5">Risk</span>
          <span className="px-3 py-2.5">Trades</span>
          <span className="px-3 py-2.5">Win Rate</span>
          <span className="px-3 py-2.5">P&amp;L</span>
          <span className="px-3 py-2.5">Actions</span>
        </div>

        {/* Rows */}
        {strategies.map(s => {
          const up = s.pnl >= 0;
          return (
            <div
              key={s.name}
              className="grid border-b border-slate-100 hover:bg-slate-50 transition-colors items-center"
              style={{ gridTemplateColumns: '32px 1fr 100px 80px 80px 100px 100px 100px 100px' }}
            >
              {/* Status dot */}
              <div className="px-3 py-3 flex justify-center">
                <div className={STATUS_DOT[s.status]} style={{ background: s.status === 'running' ? '#16a34a' : s.status === 'paused' ? '#f59e0b' : '#94a3b8' }} />
              </div>

              {/* Name + instruments */}
              <div className="px-3 py-3">
                <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">
                  {s.instruments.join(' · ')}
                </div>
              </div>

              {/* Status */}
              <span className={cn('px-3 py-3 text-xs font-mono font-semibold uppercase', STATUS_LABEL[s.status])}>
                {s.status}
              </span>

              {/* Interval */}
              <span className="px-3 py-3 text-xs font-mono text-slate-500">{s.interval}</span>

              {/* Risk */}
              <span className={cn('px-3 py-3 text-xs font-semibold', RISK_COLOR[s.risk])}>{s.risk}</span>

              {/* Trades */}
              <span className="px-3 py-3 text-xs font-mono text-slate-500">{s.trades.toLocaleString()}</span>

              {/* Win Rate */}
              <span className={cn('px-3 py-3 text-xs font-mono', s.winRate >= 60 ? 'text-green-600' : 'text-slate-500')}>
                {s.winRate > 0 ? `${s.winRate.toFixed(1)}%` : '—'}
              </span>

              {/* P&L */}
              <span className={cn('px-3 py-3 text-xs font-mono font-semibold', up ? 'text-green-600' : 'text-red-500')}>
                {s.pnl !== 0 ? `${up ? '+' : ''}$${Math.abs(s.pnl).toFixed(0)}` : '—'}
              </span>

              {/* Actions */}
              <div className="px-3 py-3 flex items-center gap-2">
                {s.status !== 'running' && (
                  <button title="Start" className="text-slate-400 hover:text-green-600 transition-colors">
                    <Play size={14} />
                  </button>
                )}
                {s.status === 'running' && (
                  <button title="Pause" className="text-slate-400 hover:text-amber-600 transition-colors">
                    <Pause size={14} />
                  </button>
                )}
                <button title="Stop" className="text-slate-400 hover:text-red-500 transition-colors">
                  <Square size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
