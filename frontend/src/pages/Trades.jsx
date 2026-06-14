import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { cn } from '@/lib/utils';

export default function Trades() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    holdCount: 0,
    skipCount: 0,
    avgScore: 0,
  });

  useEffect(() => {
    fetchTradingCycles();

    // Set up a real-time subscription to auto-refresh when the python bot runs
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'trading_cycles' },
        () => {
          fetchTradingCycles();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchTradingCycles() {
    try {
      const { data, error } = await supabase
        .from('trading_cycles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setLogs(data);
        calculateStats(data);
      }
    } catch (err) {
      console.error('Error fetching trading cycles:', err.message);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(data) {
    const total = data.length;

    // Filter rows created today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayRows = data.filter(row => new Date(row.created_at) >= todayStart);

    const holdCount = data.filter(row => row.action === 'HOLD').length;
    const skipCount = data.filter(row => row.action === 'SKIP').length;

    // Average sentiment score across non-skipped evaluation rounds
    const scoredRows = data.filter(row => row.action !== 'SKIP');
    const totalScore = scoredRows.reduce((sum, row) => sum + parseFloat(row.sentiment_score || 0), 0);
    const avgScore = scoredRows.length ? (totalScore / scoredRows.length).toFixed(4) : '0.0000';

    setStats({
      total,
      today: todayRows.length,
      holdCount,
      skipCount,
      avgScore,
    });
  }

  const statCards = [
    { label: 'Total Logs', value: stats.total, sub: 'All-time evaluations', color: 'text-slate-900' },
    { label: "Today's Cycles", value: stats.today, sub: 'Updated live', color: 'text-amber-600' },
    { label: 'Hold Decisions', value: stats.holdCount, sub: 'Awaiting market entry', color: 'text-blue-600' },
    { label: 'Skipped Tickers', value: stats.skipCount, sub: 'No news or quiet hours', color: 'text-slate-500' },
    { label: 'Avg Sentiment', value: stats.avgScore, sub: 'FinBERT Aggregated', color: parseFloat(stats.avgScore) < 0 ? 'text-red-600' : 'text-green-600' },
  ];

  return (
    <div className="p-5 md:p-6 space-y-6 w-full min-h-screen bg-slate-50 text-slate-900">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Trade Execution Log</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Real-time feed · Auto-refreshing via Supabase</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-100 rounded-lg">
          <div className="w-2 h-2 rounded-full animate-pulse bg-green-600" />
          <span className="text-xs font-mono font-bold text-green-700">LIVE CONNECTION</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        {statCards.map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all duration-200">
            <div className="text-xs font-semibold tracking-widest text-slate-500 uppercase mb-2">{s.label}</div>
            <div className={cn('font-mono text-xl font-bold leading-none', s.color)}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-2">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Full-width audit table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <span className="font-semibold text-sm text-slate-700">All Executions</span>
          <span className="text-xs font-mono text-slate-500">Real-time DB Rows</span>
        </div>

        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {loading ? (
            <div className="p-8 text-center text-sm font-mono text-slate-500">Fetching cycle history...</div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-sm font-mono text-slate-500">No database rows found. Run your bot to insert data!</div>
          ) : (
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[10px]">
                  <th className="p-3 font-semibold">Timestamp</th>
                  <th className="p-3 font-semibold">Symbol</th>
                  <th className="p-3 font-semibold">Signal/Action</th>
                  <th className="p-3 font-semibold text-right">Sentiment Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-slate-500">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-900">{row.ticker || row.symbol}</td>
                    <td className="p-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        row.action === 'HOLD' && "bg-blue-50 text-blue-700 border border-blue-100",
                        row.action === 'SKIP' && "bg-slate-100 text-slate-600",
                        row.action === 'BUY' && "bg-green-50 text-green-700 border border-green-100",
                        row.action === 'SELL' && "bg-red-50 text-red-700 border border-red-100"
                      )}>
                        {row.action}
                      </span>
                    </td>
                    <td className={cn(
                      "p-3 text-right font-bold",
                      parseFloat(row.sentiment_score) < 0 ? "text-red-600" : parseFloat(row.sentiment_score) > 0 ? "text-green-600" : "text-slate-400"
                    )}>
                      {row.sentiment_score ? parseFloat(row.sentiment_score).toFixed(4) : '0.0000'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}