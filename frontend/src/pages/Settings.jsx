// Settings — /settings route
import { cn } from '@/lib/utils';
import { Save, RefreshCw } from 'lucide-react';

function Section({ title, children }) {
  return (
    <div className="panel overflow-hidden">
      <div className="panel-header">
        <span className="panel-title">{title}</span>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, sub, children }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-bb-text">{label}</div>
        {sub && <div className="text-2xs text-bb-text-3 mt-0.5">{sub}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Input({ defaultValue, mono = false }) {
  return (
    <input
      defaultValue={defaultValue}
      className={cn(
        'bg-bb-raised border border-bb-border rounded px-2.5 py-1.5 text-xs text-bb-text',
        'focus:outline-none focus:border-bb-orange placeholder:text-bb-text-3',
        'transition-colors w-48',
        mono && 'font-mono',
      )}
    />
  );
}

function Toggle({ defaultOn = false }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={defaultOn} className="sr-only peer" />
      <div className={cn(
        'w-9 h-5 rounded-full border border-bb-border bg-bb-raised',
        'peer-checked:bg-bb-orange peer-checked:border-bb-orange',
        'transition-colors relative',
        "after:content-[''] after:absolute after:top-0.5 after:left-0.5",
        'after:w-4 after:h-4 after:rounded-full after:bg-bb-text-3',
        'after:transition-transform peer-checked:after:translate-x-4',
        'peer-checked:after:bg-white',
      )} />
    </label>
  );
}

function Select({ options, defaultValue }) {
  return (
    <select
      defaultValue={defaultValue}
      className={cn(
        'bg-bb-raised border border-bb-border rounded px-2.5 py-1.5 text-xs text-bb-text',
        'focus:outline-none focus:border-bb-orange transition-colors w-48',
        'font-mono',
      )}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

export default function Settings() {
  return (
    <div className="p-3 space-y-3 min-w-[900px] max-w-[860px]">
      {/* Heading */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-bb-text tracking-tight">Settings</h2>
          <p className="text-2xs text-bb-text-3 font-mono mt-0.5">Account · API · Execution · Notifications</p>
        </div>
        <button className="flex items-center gap-1.5 text-2xs font-semibold text-white bg-bb-orange rounded px-3 py-1.5 hover:opacity-90 transition-opacity">
          <Save size={11} />
          Save Changes
        </button>
      </div>

      {/* API Configuration */}
      <Section title="API Configuration">
        <Field label="Broker API Key" sub="Alpaca / Interactive Brokers key">
          <Input defaultValue="pk_••••••••••••••••••" mono />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="API Secret" sub="Keep this confidential">
          <Input defaultValue="••••••••••••••••••••••••" mono />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Base URL" sub="Paper or live trading endpoint">
          <Select
            options={['https://paper-api.alpaca.markets', 'https://api.alpaca.markets']}
            defaultValue="https://paper-api.alpaca.markets"
          />
        </Field>
      </Section>

      {/* Execution Settings */}
      <Section title="Order Execution">
        <Field label="Default Order Type" sub="Market or limit for strategy entries">
          <Select options={['MARKET','LIMIT','STOP_LIMIT']} defaultValue="MARKET" />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Max Position Size" sub="% of portfolio per single trade">
          <Input defaultValue="5.0%" mono />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Daily Loss Limit" sub="Auto-halt if daily P&L drops below">
          <Input defaultValue="-$2,500" mono />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Paper Trading Mode" sub="Execute against paper broker (no real orders)">
          <Toggle defaultOn={true} />
        </Field>
      </Section>

      {/* Display */}
      <Section title="Display & Interface">
        <Field label="Order Book Depth" sub="Number of price levels to display">
          <Select options={['5','10','15','20']} defaultValue="10" />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Refresh Interval" sub="Live data update frequency (ms)">
          <Select options={['500ms','800ms','1000ms','2000ms']} defaultValue="800ms" />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Show Closed Positions" sub="Include closed trades in positions table">
          <Toggle defaultOn={false} />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Sound Alerts" sub="Audio notification on order fill">
          <Toggle defaultOn={false} />
        </Field>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <Field label="Email Alerts" sub="Daily P&L summary and risk breach emails">
          <Toggle defaultOn={true} />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Notification Email" sub="Recipient for trade and risk alerts">
          <Input defaultValue="mallikarjun@example.com" />
        </Field>
        <div className="border-t border-bb-border-dim" />
        <Field label="Webhook URL" sub="POST trade events to external endpoint">
          <Input defaultValue="https://hooks.example.com/..." mono />
        </Field>
      </Section>

      {/* Danger zone */}
      <div className="panel border-bb-red overflow-hidden" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
        <div className="panel-header" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <span className="panel-title text-bb-red">Danger Zone</span>
        </div>
        <div className="p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-bb-text">Reset All Strategies</div>
            <div className="text-2xs text-bb-text-3 mt-0.5">Stop all running bots and clear execution history</div>
          </div>
          <button className="flex items-center gap-1.5 text-2xs font-semibold text-bb-red border border-bb-red rounded px-3 py-1.5 hover:bg-bb-red-dim transition-colors">
            <RefreshCw size={11} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
