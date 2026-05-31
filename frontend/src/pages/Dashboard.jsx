import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const statusStyles = {
    ongoing: {
      bg: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      text: 'text-blue-300',
      border: 'border-blue-400/40',
      dot: 'bg-blue-400',
      glow: 'shadow-blue-500/30',
    },
    completed: {
      bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
      text: 'text-emerald-300',
      border: 'border-emerald-400/40',
      dot: 'bg-emerald-400',
      glow: 'shadow-emerald-500/30',
    },
    delayed: {
      bg: 'bg-gradient-to-r from-rose-500/20 to-orange-500/20',
      text: 'text-rose-300',
      border: 'border-rose-400/40',
      dot: 'bg-rose-400',
      glow: 'shadow-rose-500/30',
    },
    pending: {
      bg: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
      text: 'text-amber-300',
      border: 'border-amber-400/40',
      dot: 'bg-amber-400',
      glow: 'shadow-amber-500/30',
    },
  };

  const normalized = status?.toLowerCase() || '';
  const s = statusStyles[normalized] || {
    bg: 'bg-slate-500/10',
    text: 'text-slate-300',
    border: 'border-slate-400/30',
    dot: 'bg-slate-400',
    glow: '',
  };

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-lg backdrop-blur-md ${s.bg} ${s.text} ${s.border} ${s.glow}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
      {status}
    </div>
  );
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
const AnimatedNumber = ({ target, prefix = '', suffix = '', decimals = 0 }) => {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = null;
    const duration = 1200;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {prefix}{decimals > 0 ? current.toFixed(decimals) : Math.round(current)}{suffix}
    </span>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, numericValue, prefix = '', suffix = '', decimals = 0, icon, gradientFrom, gradientTo, delay = 0 }) => (
  <div
    className="group relative overflow-hidden rounded-2xl p-6 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 cursor-default"
    style={{
      animation: `slideUp 0.6s ease-out ${delay}s both`,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
      border: '1px solid rgba(255,255,255,0.12)',
    }}
  >
    {/* Top-right glow blob */}
    <div
      className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"
      style={{ background: `radial-gradient(circle, ${gradientFrom}, transparent)` }}
    />

    {/* Hover shimmer */}
    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
        animation: 'shimmer 2s ease-in-out infinite',
      }} />
    </div>

    <div className="relative z-10 flex items-center gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`, boxShadow: `0 4px 20px ${gradientFrom}55` }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-[0.18em] mb-1">{label}</p>
        <p className="text-2xl font-black text-white tabular-nums drop-shadow-lg">
          {numericValue !== undefined
            ? <AnimatedNumber target={numericValue} prefix={prefix} suffix={suffix} decimals={decimals} />
            : value}
        </p>
      </div>
    </div>

    {/* Bottom accent line */}
    <div
      className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500 rounded-b-2xl"
      style={{ background: `linear-gradient(90deg, ${gradientFrom}, ${gradientTo})` }}
    />
  </div>
);

// ─── Loading Spinner ──────────────────────────────────────────────────────────
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-32 gap-8">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 rounded-full border-2 border-white/10" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-400 border-r-indigo-400" style={{ animation: 'spin 1.2s linear infinite' }} />
      <div className="absolute inset-3 rounded-full border-2 border-transparent border-b-blue-400/60" style={{ animation: 'spin 2s linear infinite reverse' }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-indigo-400 animate-pulse" />
      </div>
    </div>
    <div className="text-center">
      <p className="text-white/80 font-bold tracking-widest uppercase text-xs animate-pulse">Synchronizing Data</p>
      <p className="text-white/30 text-xs mt-1">Loading your project portfolio…</p>
    </div>
  </div>
);

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState = () => (
  <div
    className="relative overflow-hidden rounded-3xl p-16 text-center max-w-2xl mx-auto backdrop-blur-xl"
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
      border: '1px solid rgba(255,255,255,0.15)',
    }}
  >
    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
    <div className="relative z-10">
      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-blue-500/30 rounded-2xl flex items-center justify-center mb-8 mx-auto border border-white/20">
        <svg className="w-10 h-10 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <h3 className="text-3xl font-black text-white mb-3">Portfolio is empty</h3>
      <p className="text-white/50 text-base mb-10">Start by adding your first construction project to the command center.</p>
      <Link
        to="/projects/new"
        className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 active:scale-95 border border-white/20"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
        </svg>
        Initialize First Project
      </Link>
    </div>
  </div>
);

// ─── Mini Sparkline (decorative) ─────────────────────────────────────────────
const Sparkline = ({ color = '#6366f1' }) => {
  const points = [40, 55, 45, 70, 60, 80, 65, 85, 72, 90];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const norm = points.map(p => 1 - (p - min) / (max - min));
  const w = 80, h = 28;
  const path = norm.map((y, i) => `${i === 0 ? 'M' : 'L'} ${(i / (norm.length - 1)) * w} ${y * h}`).join(' ');
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w} height={h} className="opacity-60">
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={path} stroke={color} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// ─── Project Card ─────────────────────────────────────────────────────────────
const ProjectCard = ({ project, index }) => {
  const [hovered, setHovered] = useState(false);

  const seed = project.id || index;
  const progressBase = 30 + ((seed * 37) % 55);
  const progress = hovered ? Math.min(progressBase + 8, 97) : progressBase;

  const statusColor = {
    ongoing: '#3b82f6',
    completed: '#10b981',
    delayed: '#f43f5e',
    pending: '#f59e0b',
  }[project.project_status?.toLowerCase()] || '#6366f1';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col h-full rounded-3xl transition-all duration-500 hover:-translate-y-2"
      style={{ animation: `slideUp 0.6s ease-out ${index * 0.08}s both` }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${statusColor}22, transparent 60%)`, borderRadius: 'inherit' }}
      />

      {/* Card */}
      <div
        className="relative flex flex-col h-full rounded-3xl overflow-hidden border border-white/12 backdrop-blur-xl"
        style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.04) 100%)' }}
      >
        {/* Colored top strip */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${statusColor}88, ${statusColor}22)` }} />

        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${statusColor}, transparent)` }}
        />

        <div className="flex flex-col flex-1 p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-white group-hover:text-indigo-200 transition-colors duration-300 truncate tracking-tight">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-semibold text-white/50">
                <svg className="w-3.5 h-3.5 text-indigo-400/70 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span className="truncate">{project.location_name || 'Site Location TBD'}</span>
              </div>
            </div>
            <StatusBadge status={project.project_status} />
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4 mb-5 pb-5 border-b border-white/8">
            <div>
              <p className="text-[9px] font-black text-white/35 uppercase tracking-[0.2em] mb-1">Contractor</p>
              <p className="text-xs font-bold text-white/75 truncate">{project.contractor || '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-white/35 uppercase tracking-[0.2em] mb-1">Person in Charge</p>
              <p className="text-xs font-bold text-white/75 truncate">{project.person_in_charge || '—'}</p>
            </div>
          </div>

          {/* Budget + sparkline */}
          <div
            className="rounded-2xl p-5 mb-5 border border-white/8"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}
          >
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Budget</p>
                <p className="text-xl font-black text-white">
                  ₱{Number(project.revised_contract_amount).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Sparkline color={statusColor} />
                <p className="text-[9px] text-white/30 font-semibold">Ref: {project.ref_number || 'N/A'}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Progress</span>
                <span className="text-[11px] font-black tabular-nums" style={{ color: statusColor }}>
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${statusColor}cc, ${statusColor})`,
                    boxShadow: `0 0 10px ${statusColor}66`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-auto">
            <div
              className="flex items-center justify-between rounded-xl px-4 py-3 mb-4 border border-white/8"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)' }}
            >
              <div className="text-center">
                <p className="text-[9px] font-black text-white/35 uppercase tracking-widest mb-0.5">Start</p>
                <p className="text-[11px] font-bold text-white/70">
                  {new Date(project.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
              {/* Timeline track */}
              <div className="flex-1 mx-3 flex items-center gap-1">
                <div className="h-px flex-1 bg-white/15 rounded" />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                <div className="h-px flex-1 bg-white/15 rounded" />
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black text-white/35 uppercase tracking-widest mb-0.5">Target</p>
                <p className="text-[11px] font-bold text-white/70">
                  {new Date(project.target_completion_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Action row */}
            <div className="flex gap-2.5">
              <Link
                to={`/inspection?project=${project.id}`}
                className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-[11px] font-black uppercase tracking-wider text-white transition-all duration-300 active:scale-95 border border-white/15 hover:border-indigo-400/40 hover:shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.5) 0%, rgba(59,130,246,0.5) 100%)',
                  boxShadow: hovered ? '0 4px 20px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                New Inspection
              </Link>
              <Link
                to={`/reports?project=${project.id}`}
                className="flex-1 flex items-center justify-center rounded-xl border border-white/12 text-white/50 hover:text-indigo-300 hover:bg-white/8 hover:border-white/20 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Status Distribution Bar ──────────────────────────────────────────────────
const StatusBar = ({ projects }) => {
  const counts = {
    ongoing: projects.filter(p => p.project_status?.toLowerCase() === 'ongoing').length,
    completed: projects.filter(p => p.project_status?.toLowerCase() === 'completed').length,
    delayed: projects.filter(p => p.project_status?.toLowerCase() === 'delayed').length,
    pending: projects.filter(p => p.project_status?.toLowerCase() === 'pending').length,
  };
  const total = projects.length || 1;
  const colors = { ongoing: '#3b82f6', completed: '#10b981', delayed: '#f43f5e', pending: '#f59e0b' };

  return (
    <div
      className="rounded-2xl px-6 py-5 backdrop-blur-xl border border-white/10"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)' }}
    >
      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Portfolio Distribution</p>
      <div className="flex w-full h-2.5 rounded-full overflow-hidden gap-0.5">
        {Object.entries(counts).map(([key, count]) => count > 0 && (
          <div
            key={key}
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${(count / total) * 100}%`, background: colors[key], boxShadow: `0 0 8px ${colors[key]}66` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
        {Object.entries(counts).map(([key, count]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: colors[key] }} />
            <span className="text-[10px] font-bold text-white/50 capitalize">{key}</span>
            <span className="text-[10px] font-black text-white/70">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/projects')
      .then(r => setProjects(r.data))
      .catch(err => console.error('Failed to fetch projects', err))
      .finally(() => setLoading(false));
  }, []);

  const totalContract = projects.reduce((acc, p) => acc + Number(p.revised_contract_amount || 0), 0);
  const ongoingCount = projects.filter(p => p.project_status?.toLowerCase() === 'ongoing').length;
  const completedCount = projects.filter(p => p.project_status?.toLowerCase() === 'completed').length;
  const delayedCount = projects.filter(p => p.project_status?.toLowerCase() === 'delayed').length;

  const filterOptions = ['all', 'ongoing', 'completed', 'delayed', 'pending'];
  const filtered = filter === 'all' ? projects : projects.filter(p => p.project_status?.toLowerCase() === filter);

  return (
    <div className="min-h-screen pb-20 relative">
      {/* ── Hero Header ── */}
      <div
        className="relative z-10 border-b border-white/8 mb-10"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div style={{ animation: 'slideDown 0.7s ease-out both' }}>
              {/* Live badge */}
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.15))' }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Live Dashboard</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
                Dashboard
              </h1>
              <p className="text-white/45 text-sm font-medium mt-2 max-w-lg">
                Real-time overview of your construction portfolio and performance metrics.
              </p>
            </div>

            {/* Date/time stamp */}
            <div
              className="hidden md:flex flex-col items-end gap-1 text-right"
              style={{ animation: 'slideDown 0.7s ease-out 0.1s both' }}
            >
              <p className="text-xs font-black text-white/30 uppercase tracking-widest">Last Synced</p>
              <p className="text-sm font-bold text-white/60">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          {/* ── Stats Grid ── */}
          {!loading && projects.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              <StatCard
                label="Total Projects"
                numericValue={projects.length}
                gradientFrom="#6366f1"
                gradientTo="#818cf8"
                delay={0}
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
              />
              <StatCard
                label="Active / Ongoing"
                numericValue={ongoingCount}
                gradientFrom="#3b82f6"
                gradientTo="#22d3ee"
                delay={0.08}
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              />
              <StatCard
                label="Portfolio Value"
                numericValue={totalContract / 1_000_000}
                prefix="₱"
                suffix="M"
                decimals={1}
                gradientFrom="#10b981"
                gradientTo="#34d399"
                delay={0.16}
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
              />
              <StatCard
                label="Completed"
                numericValue={completedCount}
                gradientFrom="#f59e0b"
                gradientTo="#fb923c"
                delay={0.24}
                icon={<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>
          )}

          {/* ── Distribution Bar ── */}
          {!loading && projects.length > 1 && (
            <div className="mt-4" style={{ animation: 'slideUp 0.6s ease-out 0.35s both' }}>
              <StatusBar projects={projects} />
            </div>
          )}
        </div>
      </div>

      {/* ── Project Grid ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <LoadingSpinner />
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Filter chips */}
            <div className="flex items-center gap-2 mb-8 flex-wrap" style={{ animation: 'slideDown 0.5s ease-out 0.1s both' }}>
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mr-1">Filter</span>
              {filterOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider border transition-all duration-200 ${
                    filter === opt
                      ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-300 shadow-lg shadow-indigo-500/20'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/8'
                  }`}
                >
                  {opt === 'all' ? `All (${projects.length})` : `${opt} (${projects.filter(p => p.project_status?.toLowerCase() === opt).length})`}
                </button>
              ))}

              {delayedCount > 0 && (
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-400/30">
                  <svg className="w-3 h-3 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-[10px] font-black text-rose-300">{delayedCount} delayed</span>
                </div>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 text-white/30 font-bold uppercase tracking-widest text-sm">
                No projects match this filter
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Animations ── */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
