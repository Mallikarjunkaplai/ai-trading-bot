import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar     from '@/components/Sidebar';
import TopBar      from '@/components/TopBar';
import Dashboard   from '@/pages/Dashboard';
import Portfolio   from '@/pages/Portfolio';
import Trades      from '@/pages/Trades';
import Analytics   from '@/pages/Analytics';
import Strategies  from '@/pages/Strategies';
import Settings    from '@/pages/Settings';

function Layout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index           element={<Dashboard />} />
          <Route path="portfolio"  element={<Portfolio />} />
          <Route path="trades"     element={<Trades />} />
          <Route path="analytics"  element={<Analytics />} />
          <Route path="strategies" element={<Strategies />} />
          <Route path="settings"   element={<Settings />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
