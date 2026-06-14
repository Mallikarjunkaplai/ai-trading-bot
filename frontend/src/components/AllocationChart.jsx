import createPlotlyComponent from 'react-plotly.js/factory';
import Plotly from 'plotly.js-dist-min';

const Plot = createPlotlyComponent(Plotly);

const ALLOCATION = [
  { label: 'Technology',  value: 38.2 },
  { label: 'Financials',  value: 18.5 },
  { label: 'Healthcare',  value: 12.1 },
  { label: 'Consumer',    value: 10.8 },
  { label: 'Energy',      value: 8.4  },
  { label: 'Industrials', value: 6.7  },
  { label: 'Cash/Other',  value: 5.3  },
];

// Vibrant but professional palette for light background
const COLORS = ['#2563eb', '#16a34a', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#059669'];

export default function AllocationChart() {
  const total = ALLOCATION.reduce((s, a) => s + a.value, 0);

  const trace = {
    type: 'treemap',
    labels: ALLOCATION.map(a => a.label),
    parents: ALLOCATION.map(() => ''),
    values: ALLOCATION.map(a => a.value),
    texttemplate: '<b>%{label}</b><br>%{value:.1f}%',
    hovertemplate: '<b>%{label}</b><br>%{value:.1f}%<extra></extra>',
    marker: {
      colors: COLORS.slice(0, ALLOCATION.length),
      line: { color: '#ffffff', width: 3 },
    },
    textfont: { family: 'Inter, system-ui', size: 11, color: '#ffffff' },
    tiling: { packing: 'squarify' },
  };

  const layout = {
    paper_bgcolor: '#ffffff',
    plot_bgcolor:  '#ffffff',
    margin: { t: 0, r: 0, b: 0, l: 0 },
    font: { family: 'Inter, system-ui', color: '#64748b', size: 10 },
    hoverlabel: {
      bgcolor: '#ffffff',
      bordercolor: '#e2e8f0',
      font: { family: 'Inter, system-ui', size: 12, color: '#0f172a' },
    },
  };

  return (
    <div className="panel flex flex-col">
      <div className="panel-header">
        <span className="panel-title">Portfolio Allocation</span>
        <span className="text-2xs text-slate-400 font-mono">{total.toFixed(1)}% mapped</span>
      </div>

      <Plot
        data={[trace]}
        layout={layout}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: '100%', height: '220px' }}
        useResizeHandler
      />

      <div className="px-5 py-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-slate-100">
        {ALLOCATION.map((a, i) => (
          <div key={a.label} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
            <span className="text-2xs text-slate-500 truncate">{a.label}</span>
            <span className="ml-auto font-mono text-2xs font-bold text-slate-700">{a.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
