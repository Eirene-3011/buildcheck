import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useState, useEffect } from 'react';

/* ── Nav active/idle styles ─────────────────────────────────────────── */
const navLinkClass = ({ isActive }) =>
  `relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 group w-full overflow-hidden ${
    isActive
      ? 'text-white bg-gradient-to-r from-indigo-600/80 to-blue-600/60 border border-indigo-400/40 shadow-md shadow-indigo-500/20'
      : 'text-white/50 hover:text-white/90 hover:bg-white/6 border border-transparent hover:border-white/10'
  }`;

/* ── Sidebar nav items ──────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    to: '/', end: true, label: 'Dashboard',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-3a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" /></svg>,
    badge: null,
  },
  {
    to: '/projects/new', label: 'New Project',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>,
    badge: null,
  },
  {
    to: '/inspection', label: 'Inspection',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
    badge: 'Active',
  },
  {
    to: '/reports', label: 'Reports',
    icon: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    badge: null,
  },
];

/* ─────────────────────────────────────────────────────────────────────
   Sidebar content
────────────────────────────────────────────────────────────────────── */
function SidebarContent({ collapsed, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Logo ──────────────────────────────────────────────────── */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/8 ${collapsed ? 'justify-center' : ''}`}>
        <Link to="/" onClick={onClose} className="flex items-center gap-3 group flex-shrink-0">
          {/* Logo mark */}
          <div className="relative w-9 h-9 rounded-xl flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)', boxShadow: '0 4px 14px rgba(99,102,241,0.5)' }}>
            <span className="absolute inset-0 flex items-center justify-center font-black text-white text-base">B</span>
            <span className="absolute inset-0 logo-shimmer pointer-events-none" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-black text-white leading-tight tracking-tight whitespace-nowrap">BuildCheck</div>
              <div className="text-[9px] font-bold text-white/35 uppercase tracking-[0.18em] leading-tight whitespace-nowrap">Monitor</div>
            </div>
          )}
        </Link>

        {/* Mobile close */}
        {onClose && !collapsed && (
          <button onClick={onClose} className="ml-auto p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/8 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] px-3.5 mb-2">Navigation</p>
        )}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={navLinkClass}
            title={collapsed ? item.label : undefined}
          >
            {/* Active glow strip */}
            {location.pathname === item.to && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4/5 rounded-r-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            )}

            {item.icon}

            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-indigo-300">
                    {item.badge}
                  </span>
                )}
                <svg className="w-3 h-3 text-white/20 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <div className="mx-3 border-t border-white/8" />

      {/* ── User section ──────────────────────────────────────────── */}
      <div className={`px-3 py-4 space-y-1 ${collapsed ? 'flex flex-col items-center' : ''}`}>
        {!collapsed && (
          <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] px-3.5 mb-2">Account</p>
        )}

        {/* User card */}
        <div className={`flex items-center ${collapsed ? 'justify-center w-full' : 'gap-3 px-3 py-2.5'} rounded-xl border border-white/8 bg-white/4 mb-1`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-white truncate">{user?.name}</div>
              <div className="text-[9px] font-bold text-white/40 capitalize uppercase tracking-widest">{user?.role}</div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className={`${collapsed ? 'w-10 h-10 justify-center' : 'w-full px-3 py-2.5 gap-2'} flex items-center rounded-xl text-xs font-black text-white/40 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent hover:border-rose-400/20 transition-all duration-200 uppercase tracking-wider`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      {!collapsed && (
        <div className="px-4 pb-5 pt-3 border-t border-white/8">
          {/* System status pill */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/8 border border-emerald-400/15 mb-3">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[9px] font-black text-emerald-400/80 uppercase tracking-widest">All systems operational</span>
          </div>
          <p className="text-[9px] text-white/20 font-bold">BuildCheck &copy; {new Date().getFullYear()}</p>
          <div className="flex items-center gap-2.5 mt-1 text-[9px] text-white/20">
            {['Privacy', 'Terms', 'Support'].map((t, i, arr) => (
              <span key={t} className="flex items-center gap-2.5">
                <a href="#" className="hover:text-white/40 transition-colors">{t}</a>
                {i < arr.length - 1 && <span className="text-white/10">·</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Main Layout
────────────────────────────────────────────────────────────────────── */
export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  /* Close mobile sidebar on route change */
  useEffect(() => { setIsMobileOpen(false); }, [location.pathname]);

  /* Current page label for topbar */
  const currentPage = NAV_ITEMS.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  )?.label ?? 'BuildCheck';

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{
      background: 'linear-gradient(135deg,#0a0f1e 0%,#0f172a 45%,#0d1829 100%)',
    }}>

      {/* ── Ambient background ──────────────────────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle,rgba(99,102,241,0.18) 0%,transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle,rgba(59,130,246,0.14) 0%,transparent 70%)', animationDelay: '1.2s' }} />
        <div className="absolute top-1/2 -right-20 w-[300px] h-[300px] rounded-full blur-[80px]"
          style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)' }} />
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* ── Mobile overlay ──────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-30 md:hidden transition-all duration-300 ${isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'rgba(5,10,25,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* ── Mobile sidebar ──────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 h-full z-40 md:hidden flex flex-col w-64 transition-transform duration-300 ease-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(180deg,rgba(10,15,30,0.99) 0%,rgba(15,23,42,0.99) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <SidebarContent collapsed={false} onClose={() => setIsMobileOpen(false)} />
      </aside>

      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col relative z-20 flex-shrink-0 transition-all duration-300 ease-out ${
          isCollapsed ? 'w-[68px]' : 'w-60'
        }`}
        style={{
          background: 'linear-gradient(180deg,rgba(255,255,255,0.055) 0%,rgba(255,255,255,0.025) 100%)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
        }}
      >
        <SidebarContent collapsed={isCollapsed} onClose={null} />

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-[82px] w-6 h-6 rounded-full border border-indigo-400/30 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 z-10"
          style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)', boxShadow: '0 2px 12px rgba(99,102,241,0.4)' }}
        >
          <svg className={`w-3 h-3 transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 relative z-10">

        {/* Mobile topbar */}
        <header
          className="md:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 border-b border-white/8 flex-shrink-0 backdrop-blur-xl"
          style={{ background: 'linear-gradient(180deg,rgba(10,15,30,0.95) 0%,rgba(15,23,42,0.90) 100%)' }}
        >
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl border border-white/12 hover:bg-white/8 transition-all text-white/60 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-white text-[10px] flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)' }}>B</div>
            <span className="text-white font-black text-sm tracking-tight truncate">{currentPage}</span>
          </div>

          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)' }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
        </header>

        {/* Desktop topbar */}
        <header
          className="hidden md:flex sticky top-0 z-20 items-center justify-between gap-4 px-6 h-14 border-b border-white/8 flex-shrink-0 backdrop-blur-xl"
          style={{ background: 'linear-gradient(180deg,rgba(10,15,30,0.85) 0%,rgba(15,23,42,0.75) 100%)' }}
        >
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
            <svg className="w-3 h-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-white/15">·</span>
            <span className="text-white/60 font-black">{currentPage}</span>
          </div>

          {/* Right side: time + user */}
          <div className="flex items-center gap-3">
            {/* Live clock */}
            <LiveClock />

            {/* User chip */}
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px] text-white"
                style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)' }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:block">
                <p className="text-[10px] font-black text-white/80 leading-tight">{user?.name}</p>
                <p className="text-[8px] font-bold text-white/35 uppercase tracking-widest leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* ── CSS ─────────────────────────────────────────────────── */}
      <style>{`
        /* Logo shimmer */
        .logo-shimmer {
          background: linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%);
          background-size: 200% 100%;
          background-position: 200% center;
          transition: background-position .5s ease;
        }
        a:hover .logo-shimmer { background-position: -200% center; }

        /* Scrollbar */
        nav::-webkit-scrollbar { width: 3px; }
        nav::-webkit-scrollbar-track { background: transparent; }
        nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 99px; }
        nav::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.22); }

        /* Sidebar entrance */
        @keyframes sidebarIn {
          from { opacity:0; transform:translateX(-8px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </div>
  );
}

/* ── Live clock widget ──────────────────────────────────────────────── */
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const hh = time.getHours().toString().padStart(2, '0');
  const mm = time.getMinutes().toString().padStart(2, '0');
  const ss = time.getSeconds().toString().padStart(2, '0');
  const date = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-white/8 bg-white/3">
      <svg className="w-3 h-3 text-indigo-400/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="hidden sm:flex items-baseline gap-1">
        <span className="text-[11px] font-black text-white/70 tabular-nums tracking-tight">{hh}:{mm}</span>
        <span className="text-[9px] font-bold text-white/30 tabular-nums w-5">{ss}</span>
        <span className="text-[9px] font-bold text-white/25 uppercase tracking-widest hidden lg:inline">{date}</span>
      </div>
    </div>
  );
}
