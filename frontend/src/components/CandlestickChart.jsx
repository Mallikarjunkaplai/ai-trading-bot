import { useMemo } from 'react';
import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';

const Plot = createPlotlyComponent(Plotly);

function generateOHLC(days = 120, startPrice = 175) {
  const dates = [], opens = [], highs = [], lows = [], closes = [], volumes = [];
  let price = startPrice;
  const start = new Date('2025-01-02');
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const open  = +price.toFixed(2);
    const ret   = (Math.random() - 0.47) * 0.022;
    const close = +(price * (1 + ret)).toFixed(2);
    const high  = +(Math.max(open, close) + Math.random() * 1.5).toFixed(2);
    const low   = +(Math.min(open, close) - Math.random() * 1.5).toFixed(2);
    const vol   = Math.floor(Math.random() * 15000000 + 3000000);
    dates.push(d.toISOString().slice(0, 10));
    opens.push(open); highs.push(high); lows.push(low); closes.push(close); volumes.push(vol);
    price = close;
  }
  return { dates, opens, highs, lows, closes, volumes };
}

// Light mode Plotly layout
const LIGHT_LAYOUT = {
  paper_bgcolor: '#ffffff',
  plot_bgcolor:  '#ffffff',
  font: { family: 'JetBrains Mono, monospace', color: '#94a3b8', size: 10 },
  margin: { t: 8, r: 16, b: 40, l: 16 },
  showlegend: false,
  xaxis: {
    gridcolor: '#f1f5f9',
    gridwidth: 1,
    linecolor: '#e2e8f0',
    tickcolor: 'transparent',
    color: '#94a3b8',
    rangeslider: { visible: false },
  },
  yaxis: {
    gridcolor: '#f1f5f9',
    gridwidth: 1,
    linecolor: '#e2e8f0',
    tickcolor: 'transparent',
    color: '#94a3b8',
    tickprefix: '$',
    side: 'right',
  },
  yaxis2: {
    overlaying: 'y',
    side: 'left',
    showgrid: false,
    color: '#94a3b8',
    tickformat: '.2s',
    tickcolor: 'transparent',
  },
  hoverlabel: {
    bgcolor: '#ffffff',
    bordercolor: '#e2e8f0',
    font: { family: 'JetBrains Mono, monospace', size: 11, color: '#0f172a' },
  },
};

export default function CandlestickChart() {
  const { dates, opens, highs, lows, closes, volumes } = useMemo(() => generateOHLC(), []);

  const lastClose = closes[closes.length - 1];
  const lastOpen  = opens[closes.length - 1];
  const lastUp    = lastClose >= lastOpen;

  const candleTrace = {
    type: 'candlestick',
    x: dates, open: opens, high: highs, low: lows, close: closes,
    name: 'AAPL',
    increasing: { line: { color: '#16a34a', width: 1.2 }, fillcolor: '#16a34a' },
    decreasing: { line: { color: '#dc2626', width: 1.2 }, fillcolor: '#dc2626' },
    hovertemplate:
      '<b>%{x}</b><br>O: %{open:.2f}  H: %{high:.2f}<br>L: %{low:.2f}   C: %{close:.2f}<extra></extra>',
  };

  const volColors = closes.map((c, i) =>
    c >= opens[i] ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.20)',
  );

  const volumeTrace = {
    type: 'bar', x: dates, y: volumes, name: 'Volume',
    marker: { color: volColors },
    yaxis: 'y2',
    hovertemplate: 'Vol: %{y:,.0f}<extra></extra>',
  };

  const layout = {
    ...LIGHT_LAYOUT,
    yaxis2: { ...LIGHT_LAYOUT.yaxis2, range: [0, Math.max(...volumes) * 5] },
  };

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <div className="flex items-center gap-2">
          <span className="panel-title">OHLC Candlestick</span>
          <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded-full"
            style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}>
            AAPL
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xs font-mono text-slate-400">{dates[dates.length - 1]}</span>
          <span className="font-mono text-sm font-bold" style={{ color: lastUp ? '#16a34a' : '#dc2626' }}>
            ${lastClose?.toFixed(2)}
          </span>
        </div>
      </div>
      <Plot
        data={[candleTrace, volumeTrace]}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '340px' }}
        useResizeHandler
      />
    </div>
  );
}
