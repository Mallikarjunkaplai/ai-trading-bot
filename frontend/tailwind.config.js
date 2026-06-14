/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bb: {
          /* App shell */
          bg:           '#f3f4f6',
          'bg-2':       '#f8fafc',
          surface:      '#ffffff',
          raised:       '#f8fafc',
          overlay:      '#f1f5f9',

          /* Borders */
          border:       '#e2e8f0',
          'border-dim': '#f1f5f9',
          'border-med': '#cbd5e1',

          /* Positive / green */
          green:        '#16a34a',
          'green-dim':  'rgba(22,163,74,0.10)',
          'green-bg':   '#f0fdf4',

          /* Negative / red */
          red:          '#dc2626',
          'red-dim':    'rgba(220,38,38,0.08)',
          'red-bg':     '#fef2f2',

          /* Blue accent */
          blue:         '#2563eb',
          'blue-dim':   'rgba(37,99,235,0.08)',
          'blue-bg':    '#eff6ff',

          /* Amber — vibrant */
          amber:        '#f59e0b',
          'amber-dim':  'rgba(245,158,11,0.10)',

          /* Deep pink */
          pink:         '#db2777',
          'pink-dim':   'rgba(219,39,119,0.10)',
          'pink-bg':    '#fdf2f8',

          /* Indigo */
          indigo:       '#4f46e5',
          'indigo-dim': 'rgba(79,70,229,0.08)',

          /* Legacy orange alias */
          orange:       '#f59e0b',
          'orange-dim': 'rgba(245,158,11,0.10)',

          /* Text */
          text:         '#0f172a',
          'text-2':     '#64748b',
          'text-3':     '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', '"Cascadia Code"', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '10px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(15,23,42,0.08), 0 1px 2px rgba(15,23,42,0.04)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.06)',
        'sm':         '0 1px 2px rgba(15,23,42,0.05)',
        'md':         '0 4px 6px rgba(15,23,42,0.07), 0 2px 4px rgba(15,23,42,0.04)',
      },
    },
  },
  plugins: [],
}
