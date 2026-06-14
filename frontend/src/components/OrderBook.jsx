import { useState, useEffect } from 'react';
import { cn, randomBetween } from '@/lib/utils';

const SYMBOL    = 'AAPL';
const MID_PRICE = 189.43;
const LEVELS    = 10;

function generateBook(mid) {
  const tick = 0.01;
  const asks = Array.from({ length: LEVELS }, (_, i) => {
    const price = mid + (i + 1) * tick + Math.random() * tick * 0.5;
    const size  = Math.floor(randomBetween(200, 8000) / 100) * 100;
    return { price: +price.toFixed(2), size };
  }).sort((a, b) => a.price - b.price);

  const bids = Array.from({ length: LEVELS }, (_, i) => {
    const price = mid - (i + 1) * tick - Math.random() * tick * 0.5;
    const size  = Math.floor(randomBetween(200, 8000) / 100) * 100;
    return { price: +price.toFixed(2), size };
  }).sort((a, b) => b.price - a.price);

  let cumAsk = 0;
  const asksWithCum = asks.map(r => { cumAsk += r.size; return { ...r, cum: cumAsk }; });
  let cumBid = 0;
  const bidsWithCum = bids.map(r => { cumBid += r.size; return { ...r, cum: cumBid }; });

  const maxCum = Math.max(cumAsk, cumBid);
  return {
    asks: asksWithCum.map(r => ({ ...r, pct: r.cum / maxCum })),
    bids: bidsWithCum.map(r => ({ ...r, pct: r.cum / maxCum })),
    spread:  +(asks[0]?.price - bids[0]?.price).toFixed(2),
    bestAsk: asks[0]?.price ?? mid,
    bestBid: bids[0]?.price ?? mid,
  };
}

function OrderRow({ row, side }) {
  const isAsk = side === 'ask';
  return (
    <div className="trow relative grid overflow-hidden" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
      {/* Depth fill */}
      <div
        className="absolute inset-y-0 right-0 transition-[width] duration-300"
        style={{
          width: `${(row.pct * 100).toFixed(1)}%`,
          background: isAsk ? 'rgba(220,38,38,0.07)' : 'rgba(22,163,74,0.07)',
        }}
      />
      <span className={cn('relative px-3 py-1.5 font-mono font-bold text-xs leading-none',
        isAsk ? 'text-red-500' : 'text-green-600')}>
        {row.price.toFixed(2)}
      </span>
      <span className="relative px-3 py-1.5 font-mono text-2xs text-slate-500 text-right leading-none">
        {row.size.toLocaleString()}
      </span>
      <span className="relative px-3 py-1.5 font-mono text-2xs text-slate-400 text-right leading-none">
        {row.cum.toLocaleString()}
      </span>
    </div>
  );
}

export default function OrderBook() {
  const [book, setBook] = useState(() => generateBook(MID_PRICE));

  useEffect(() => {
    const id = setInterval(() => {
      setBook(prev => {
        const drift = (Math.random() - 0.5) * 0.04;
        const mid   = prev.bestBid + prev.spread / 2 + drift;
        return generateBook(Math.max(mid, 0.01));
      });
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="panel flex flex-col hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <div className="dot-live" />
          <span className="panel-title">Order Book</span>
        </div>
        <span className="text-xs font-bold font-mono text-slate-700">{SYMBOL}</span>
      </div>

      {/* Column headers */}
      <div
        className="grid text-2xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100"
        style={{ gridTemplateColumns: '1fr 1fr 1fr' }}
      >
        <span className="px-3 py-2">Price</span>
        <span className="px-3 py-2 text-right">Size</span>
        <span className="px-3 py-2 text-right">Total</span>
      </div>

      {/* Asks */}
      <div className="flex flex-col-reverse">
        {book.asks.slice(0, LEVELS).map((row, i) => (
          <OrderRow key={`ask-${i}`} row={row} side="ask" />
        ))}
      </div>

      {/* Spread */}
      <div className="px-4 py-2.5 flex items-center justify-between bg-slate-50 border-y border-slate-100">
        <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider">Spread</span>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-amber-600">${book.spread.toFixed(2)}</span>
          <span className="text-2xs font-mono text-slate-400">
            {((book.spread / book.bestBid) * 100).toFixed(3)}%
          </span>
        </div>
      </div>

      {/* Bids */}
      <div className="flex flex-col">
        {book.bids.slice(0, LEVELS).map((row, i) => (
          <OrderRow key={`bid-${i}`} row={row} side="bid" />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between bg-slate-50 border-t border-slate-100">
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{ color: '#15803d', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
          B {book.bestBid.toFixed(2)}
        </span>
        <span className="text-2xs text-slate-400 font-mono">
          Mid {((book.bestBid + book.bestAsk) / 2).toFixed(3)}
        </span>
        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg"
          style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca' }}>
          A {book.bestAsk.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
