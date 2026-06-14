import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff, TrendingUp, TrendingDown } from 'lucide-react';

const INITIAL_TICKERS = [
  { sym: 'AAPL',    price: 189.42,  chg: +0.84,  pct: +0.45 },
  { sym: 'SPX',     price: 5421.03, chg: +14.2,  pct: +0.26 },
  { sym: 'NVDA',    price: 875.60,  chg: -3.20,  pct: -0.36 },
  { sym: 'BTC/USD', price: 67842.0, chg: +842,   pct: +1.25 },
  { sym: 'TSLA',    price: 248.10,  chg: -1.40,  pct: -0.56 },
  { sym: 'VIX',     price: 14.23,   chg: -0.54,  pct: -3.66 },
  { sym: 'QQQ',     price: 463.21,  chg: +2.10,  pct: +0.46 },
  { sym: 'GLD',     price: 213.88,  chg: +0.34,  pct: +0.16 },
  { sym: 'MSFT',    price: 415.23,  chg: -2.77,  pct: -0.66 },
];

function TickerItem({ sym, price, chg, pct }) {
  const up = chg >= 0;
  return (
    <span className="flex items-center gap-2 shrink-0 px-4 border-l border-slate-100 first:border-l-0 first:pl-0">
      <span className="text-2xs font-mono font-semibold text-slate-400">{sym}</span>
      <span className="text-xs font-mono font-semibold text-slate-800">{price.toLocaleString()}</span>
      <span className={cn(
        'text-2xs font-mono font-semibold flex items-center gap-0.5',
        up ? 'text-green-600' : 'text-red-500',
      )}>
        {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
        {up ? '+' : ''}{pct.toFixed(2)}%
      </span>
    </span>
  );
}

/**
 * DualClock — ticks every second, shows ET and IST in a clean pill design.
 */
function DualClock() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = new Date();

  const formatTime = (tz) =>
    now.toLocaleTimeString('en-US', {
      hour12: false,
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: tz,
    });

  const etTime  = formatTime('America/New_York');
  const istTime = formatTime('Asia/Kolkata');

  // Determine if NYSE is open (ET weekday 09:30–16:00)
  const etHour = parseInt(
    now.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false, timeZone: 'America/New_York' })
  );
  const etMin = parseInt(
    now.toLocaleTimeString('en-US', { minute: '2-digit', timeZone: 'America/New_York' })
  );
  const etDay  = parseInt(now.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' }) === 'Sat' ? 6 : now.getDay());
  const isWeekend = now.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' }) === 'Sat'
    || now.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'America/New_York' }) === 'Sun';
  const marketOpen = !isWeekend && (etHour > 9 || (etHour === 9 && etMin >= 30)) && etHour < 16;

  return (
    <div className="flex items-center gap-2 shrink-0">

      {/* Market status indicator */}
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-2xs font-mono font-bold"
        style={{
          background: marketOpen ? '#f0fdf4' : '#fef2f2',
          border:     `1px solid ${marketOpen ? '#bbf7d0' : '#fecaca'}`,
          color:      marketOpen ? '#15803d'  : '#b91c1c',
        }}
      >
        <div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: marketOpen ? '#16a34a' : '#dc2626', animation: marketOpen ? 'pulse-live 2s ease-in-out infinite' : 'none' }}
        />
        {marketOpen ? 'OPEN' : 'CLOSED'}
      </div>

      {/* ET clock */}
      <div
        className="flex flex-col items-center px-3 py-1.5 rounded-xl"
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
      >
        <span className="text-2xs font-mono font-bold text-slate-800 leading-none tracking-wider tabular-nums">
          {etTime}
        </span>
        <span
          className="text-2xs font-semibold mt-0.5 leading-none"
          style={{ color: '#4f46e5', fontSize: '0.55rem', letterSpacing: '0.08em' }}
        >
          NYSE · ET
        </span>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-slate-200" />

      {/* IST clock */}
      <div
        className="flex flex-col items-center px-3 py-1.5 rounded-xl"
        style={{ background: '#fdf2f8', border: '1px solid #fbcfe8' }}
      >
        <span className="text-2xs font-mono font-bold leading-none tracking-wider tabular-nums"
          style={{ color: '#db2777' }}>
          {istTime}
        </span>
        <span
          className="text-2xs font-semibold mt-0.5 leading-none"
          style={{ color: '#db2777', fontSize: '0.55rem', letterSpacing: '0.08em', opacity: 0.75 }}
        >
          NSE · IST
        </span>
      </div>

    </div>
  );
}

export default function TopBar() {
  const [online] = useState(true);
  const [tickers, setTickers] = useState(INITIAL_TICKERS);

  useEffect(() => {
    const id = setInterval(() => {
      setTickers(prev => prev.map(t => {
        // Random drift roughly relative to price
        const drift = (Math.random() - 0.5) * (t.price * 0.0005);
        const newPrice = Math.max(t.price + drift, 0.01);
        const newChg = t.chg + drift;
        const newPct = (newChg / (newPrice - newChg)) * 100;
        return {
          ...t,
          price: +newPrice.toFixed(2),
          chg: +newChg.toFixed(2),
          pct: +newPct.toFixed(2)
        };
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-12 shrink-0 flex items-center gap-4 px-5 bg-white border-b border-slate-200">
      {/* Ticker strip */}
      <div className="flex-1 overflow-hidden min-w-0">
        <div className="flex items-center overflow-x-auto no-scrollbar">
          {tickers.map(t => <TickerItem key={t.sym} {...t} />)}
        </div>
      </div>

      {/* Right: dual clock + connection */}
      <div className="flex items-center gap-3 shrink-0">
        <DualClock />

        {/* Connection badge */}
        <span
          className={cn(
            'flex items-center gap-1.5 text-2xs font-mono font-bold px-2.5 py-1.5 rounded-lg',
            online ? 'text-green-700' : 'text-red-600',
          )}
          style={{
            background: online ? '#f0fdf4' : '#fef2f2',
            border:     `1px solid ${online ? '#bbf7d0' : '#fecaca'}`,
          }}
        >
          {online ? <Wifi size={10} /> : <WifiOff size={10} />}
          {online ? 'CONNECTED' : 'OFFLINE'}
        </span>
      </div>
    </header>
  );
}
