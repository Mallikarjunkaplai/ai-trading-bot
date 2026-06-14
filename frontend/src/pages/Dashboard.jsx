import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '@/lib/utils';

// Keeping ALL your custom components exactly as they were
import KPIStrip from '@/components/KPIStrip';
import OrderBook from '@/components/OrderBook';
import EquityChart from '@/components/EquityChart';
import CandlestickChart from '@/components/CandlestickChart';
import AllocationChart from '@/components/AllocationChart';
import PositionsTable from '@/components/PositionsTable';
import AuditTable from '@/components/AuditTable';

export default function Dashboard() {
  const [marketPulse, setMarketPulse] = useState(0);

  useEffect(() => {
    fetchMarketPulse();

    // Only listening for new trades to update the pulse badge
    const channel = supabase
      .channel('pulse-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trading_cycles' }, () => {
        fetchMarketPulse();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchMarketPulse() {
    const { data: tradeData } = await supabase
      .from('trading_cycles')
      .select('sentiment_score')
      .neq('action', 'SKIP')
      .order('created_at', { ascending: false })
      .limit(10);

    if (tradeData && tradeData.length > 0) {
      const total = tradeData.reduce((sum, row) => sum + parseFloat(row.sentiment_score || 0), 0);
      setMarketPulse((total / tradeData.length).toFixed(4));
    }
  }

  return (
    <div className="p-5 md:p-6 space-y-6 w-full min-h-screen bg-slate-50 text-slate-900">

      {/* ── Heading & AI Market Pulse (INJECTED SAFELY) ────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Smart Trader Overview</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Live Portfolio & Strategy Tracking</p>
        </div>
        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg border shadow-sm transition-colors",
          marketPulse < 0 ? "bg-red-50 border-red-100" : marketPulse > 0 ? "bg-green-50 border-green-100" : "bg-slate-100 border-slate-200"
        )}>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">AI Market Pulse:</span>
          <span className={cn(
            "text-sm font-mono font-bold",
            marketPulse < 0 ? "text-red-700" : marketPulse > 0 ? "text-green-700" : "text-slate-700"
          )}>
            {marketPulse > 0 ? '+' : ''}{marketPulse}
          </span>
        </div>
      </div>

      {/* ── Row 1: KPI Strip (CLAUDE'S GLOWING COMPONENT RETAINED) ── */}
      <KPIStrip />

      {/* ── Row 2: Order Book | Equity + Positions ─────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
        <OrderBook />
        <div className="flex flex-col gap-6">
          <EquityChart />
          <PositionsTable />
        </div>
      </div>

      {/* ── Row 3: Candlestick | Allocation ────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-6">
        <CandlestickChart />
        <AllocationChart />
      </div>

      {/* ── Row 4: Audit Log ───────────────────────────────────── */}
      <AuditTable />

    </div>
  );
}