import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, TrendingUp, BarChart2,
  Cpu, Settings, PanelLeftClose, PanelLeftOpen,
  User, Activity, Hexagon,
} from 'lucide-react';

const NAV = [
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, to: '/' },
  { id: 'portfolio',  label: 'Portfolio',   icon: TrendingUp,      to: '/portfolio' },
  { id: 'trades',     label: 'Trades',      icon: Activity,        to: '/trades', badge: 3 },
  { id: 'analytics',  label: 'Analytics',   icon: BarChart2,       to: '/analytics' },
  { id: 'strategies', label: 'Strategies',  icon: Cpu,             to: '/strategies' },
];

const FOOTER_NAV = [
  { id: 'settings', label: 'Settings', icon: Settings, to: '/settings' },
];

function NavItem({ item, collapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      id={`nav-${item.id}`}
      end={item.to === '/'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) => cn(
        'nav-item group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ease-out',
        isActive 
          ? 'bg-white shadow-sm border border-indigo-100/50 text-indigo-700 font-bold translate-x-1' 
          : 'text-slate-500 hover:bg-indigo-50/50 hover:text-indigo-900 hover:translate-x-1'
      )}
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            className={cn(
              'shrink-0 transition-transform duration-300 ease-out group-hover:scale-110',
              isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500',
            )}
          />
          {!collapsed && (
            <span className="truncate">{item.label}</span>
          )}
          {!collapsed && item.badge && (
            <span className="ml-auto text-[0.65rem] font-mono font-bold px-2 py-0.5 rounded-md transition-colors duration-300"
              style={{ background: isActive ? '#e0e7ff' : '#f1f5f9', color: isActive ? '#4338ca' : '#64748b' }}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'h-full flex flex-col shrink-0 transition-[width] duration-300 ease-out overflow-hidden',
        'bg-[#f8fafc] border-r border-slate-200/60 z-20 relative',
        collapsed ? 'w-[80px]' : 'w-[280px]',
      )}
    >
      {/* ── Logo ────────────────────────────────────────────────── */}
      <div className={cn(
        'flex items-center gap-3 border-b border-slate-200/60 transition-all duration-300',
        collapsed ? 'p-5 justify-center' : 'px-6 py-6',
      )}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-transform duration-300 hover:scale-105 hover:rotate-3 cursor-pointer">
          <Hexagon size={22} strokeWidth={2.5} className="fill-white/10" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">Smart Trader</div>
            <div className="text-[0.65rem] text-indigo-500 font-bold tracking-widest uppercase mt-0.5 whitespace-nowrap">v2.4 · Enterprise</div>
          </div>
        )}
      </div>

      {/* ── Navigation ──────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 space-y-1.5">
        {!collapsed && (
          <div className="px-3 pb-2 text-[0.65rem] font-extrabold tracking-[0.2em] text-slate-400 uppercase">
            Main
          </div>
        )}
        {NAV.map(item => <NavItem key={item.id} item={item} collapsed={collapsed} />)}

        {!collapsed && (
          <div className="px-3 pb-2 pt-6 text-[0.65rem] font-extrabold tracking-[0.2em] text-slate-400 uppercase">
            System
          </div>
        )}
        {collapsed && <div className="my-5 mx-4 h-px bg-slate-200/60" />}
        {FOOTER_NAV.map(item => <NavItem key={item.id} item={item} collapsed={collapsed} />)}
      </nav>

      {/* ── Bot status pill ─────────────────────────────────────── */}
      {!collapsed && (
        <div className="mx-5 mb-5 px-4 py-3.5 rounded-2xl bg-white border border-slate-200/60 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse" />
            <span className="text-xs font-bold tracking-wide text-slate-900 group-hover:text-emerald-600 transition-colors duration-300">BOT ACTIVE</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 font-medium">3 strategies running</div>
        </div>
      )}

      {/* ── User ────────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-6 py-5 border-t border-slate-200/60 bg-white hover:bg-slate-50 transition-colors duration-300 cursor-pointer">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <User size={18} className="text-indigo-600" />
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <div className="text-sm font-bold text-slate-900 truncate">Mallikarjun K.</div>
              <div className="text-xs text-slate-500 font-medium truncate mt-0.5">Pro · Live Account</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Collapse toggle ─────────────────────────────────────── */}
      <button
        id="sidebar-collapse"
        onClick={() => setCollapsed(c => !c)}
        className={cn(
          'w-full flex items-center py-4 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all duration-300 border-t border-slate-200/60',
          collapsed ? 'justify-center' : 'justify-end px-6',
        )}
        title={collapsed ? 'Expand' : 'Collapse'}
      >
        {collapsed
          ? <PanelLeftOpen size={18} className="transition-transform hover:scale-110" />
          : <><PanelLeftClose size={18} className="transition-transform hover:-translate-x-1" /><span className="ml-2.5 text-xs font-bold tracking-wide">Collapse Sidebar</span></>
        }
      </button>
    </aside>
  );
}
