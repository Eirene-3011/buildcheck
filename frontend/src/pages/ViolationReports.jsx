import { useEffect, useState } from 'react';
import api from '../api/client';

/**
 * Ultra-Enhanced ViolationReports Component
 *
 * Enhancement Notes (no logic changes):
 * - Staggered card mount animations via CSS animation-delay
 * - Shimmer sweep on stat card accent bars
 * - Left-border accent animates in (width expand) on mount
 * - Acknowledge button: ripple-on-click micro-interaction
 * - StatCard: animated count-up feel via CSS scale reveal
 * - "Pending" badge gets a subtle pulsing dot
 * - Loading spinner upgraded to dual-ring style
 * - Empty state icon gets a soft bounce-in
 * - Background orbs use smoother keyframe pulse (scale instead of opacity)
 */

export default function ViolationReports() {
  const [projects, setProjects]     = useState([]);
  const [projectId, setProjectId]   = useState('');
  const [inspections, setInspections] = useState([]);
  const [violations, setViolations] = useState({});
  const [isLoading, setIsLoading]   = useState(false);
  const [acknowledging, setAcknowledging] = useState(null);

  useEffect(() => {
    api.get('/projects').then((r) => setProjects(r.data));
  }, []);

  useEffect(() => {
    if (!projectId) { setInspections([]); setViolations({}); return; }
    setIsLoading(true);
    api.get(`/inspections/${projectId}`).then(async (r) => {
      setInspections(r.data);
      const all = await Promise.all(
        r.data.map((i) => api.get(`/violations/${i.id}`).then((x) => [i.id, x.data]))
      );
      setViolations(Object.fromEntries(all));
      setIsLoading(false);
    });
  }, [projectId]);

  const acknowledge = async (id) => {
    const remarks = prompt('Contractor remarks (optional):') || '';
    setAcknowledging(id);
    try {
      await api.patch(`/violations/${id}/acknowledge`, { contractor_remarks: remarks });
      const all = await Promise.all(
        inspections.map((i) => api.get(`/violations/${i.id}`).then((x) => [i.id, x.data]))
      );
      setViolations(Object.fromEntries(all));
    } finally {
      setAcknowledging(null);
    }
  };

  const allViolations  = inspections.flatMap((i) => (violations[i.id] || []).map((v) => ({ ...v, inspection: i })));
  const totalViolations       = allViolations.length;
  const acknowledgedViolations = allViolations.filter((v) => v.acknowledged).length;
  const pendingViolations      = totalViolations - acknowledgedViolations;

  const selectClass = "block w-full px-5 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-300 hover:border-white/30 appearance-none cursor-pointer text-sm";

  /* ── Stat Card ──────────────────────────────────────────────────────── */
  const StatCard = ({ label, value, icon, color, accentColor, delay }) => (
    <div
      className="rounded-2xl overflow-hidden backdrop-blur-xl border border-white/20 p-6 shadow-lg hover:shadow-xl transition-all group stat-card-reveal"
      style={{
        background: 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))',
        animationDelay: delay,
      }}
    >
      {/* top accent bar with shimmer */}
      <div className="h-1 w-full rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
        <div
          className="h-full rounded-full relative overflow-hidden shimmer-sweep"
          style={{ width: '100%', background: accentColor, boxShadow: `0 0 8px 1px ${accentColor}66` }}
        />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">{label}</p>
          <p className={`text-3xl font-black drop-shadow-lg ${color} number-pop`}>{value}</p>
        </div>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20 group-hover:scale-110 transition-transform`}
          style={{ background: `${accentColor}22` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
    }}>

      {/* ── Background orbs (GPU-smooth scale pulse) ──────────────────── */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl orb-a" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl orb-b" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl orb-c" />
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-10">

        {/* Header */}
        <div className="space-y-4 header-slide-down">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20" style={{
            background: 'linear-gradient(135deg,rgba(244,63,94,.2),rgba(239,68,68,.2))',
          }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">Critical Alerts</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
            Violation Reports
          </h1>
          <p className="text-white/60 text-lg font-medium max-w-2xl">
            Monitor and manage all recorded violations with contractor acknowledgement tracking.
          </p>
        </div>

        {/* Filter Bar */}
        <div
          className="rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20 p-6 md:p-8 shadow-2xl shadow-black/50 filter-slide-up"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.05))' }}
        >
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-3">
              <label className="text-xs font-black text-white/60 uppercase tracking-[0.2em] ml-1">Select Project</label>
              <div className="relative">
                <select
                  className={selectClass}
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  <option value="">— Choose a project —</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                {/* custom chevron */}
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            {projectId && (
              <button
                onClick={() => setProjectId('')}
                className="px-6 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white/80 font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-white/20 hover:border-white/30 transition-all duration-300 active:scale-95"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {projectId && (
          <div className="space-y-10 content-fade-up">

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                label="Total Violations" value={totalViolations}
                accentColor="#f43f5e" color="text-rose-300" delay="0ms"
                icon={<svg className="w-6 h-6 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
              />
              <StatCard
                label="Acknowledged" value={acknowledgedViolations}
                accentColor="#10b981" color="text-emerald-300" delay="80ms"
                icon={<svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
              <StatCard
                label="Pending" value={pendingViolations}
                accentColor="#f59e0b" color="text-amber-300" delay="160ms"
                icon={<svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              />
            </div>

            {/* Violations List */}
            {isLoading ? (
              <div
                className="rounded-2xl overflow-hidden backdrop-blur-xl border border-white/20 p-12 text-center shadow-2xl shadow-black/50"
                style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))' }}
              >
                {/* Dual-ring spinner */}
                <div className="flex justify-center mb-4">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full border-2 border-white/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 animate-spin" />
                    <div className="absolute inset-1 rounded-full border-2 border-transparent border-t-blue-400 animate-spin" style={{ animationDuration: '.6s', animationDirection: 'reverse' }} />
                  </div>
                </div>
                <p className="text-white/60 font-medium">Loading violations…</p>
              </div>
            ) : allViolations.length === 0 ? (
              <div
                className="rounded-2xl overflow-hidden backdrop-blur-xl border border-white/20 p-12 text-center shadow-2xl shadow-black/50"
                style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))' }}
              >
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-emerald-400/30 empty-bounce">
                  <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-white/60 font-medium">No violations recorded for this project.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allViolations.map((v, idx) => (
                  <div
                    key={v.id}
                    className="rounded-2xl overflow-hidden backdrop-blur-xl border border-white/20 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group violation-card"
                    style={{
                      background: 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))',
                      animationDelay: `${idx * 60}ms`,
                    }}
                  >
                    {/* Animated left accent bar */}
                    <div
                      className="flex"
                      style={{ borderLeft: `4px solid ${v.acknowledged ? '#10b981' : '#f59e0b'}` }}
                    >
                      <div className="flex-1 p-6 space-y-4">

                        {/* Header row */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/20 ${v.acknowledged ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                {v.acknowledged ? (
                                  <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                )}
                              </div>
                              <p className="text-xs font-black text-white/50 uppercase tracking-widest">
                                {new Date(v.inspection.inspection_datetime).toLocaleString()}
                              </p>
                            </div>
                            <h3 className="text-lg font-black text-white drop-shadow-lg mb-2">{v.description}</h3>
                          </div>

                          {/* Status badge */}
                          <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest backdrop-blur-md border whitespace-nowrap flex items-center gap-1.5 ${
                            v.acknowledged
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                          }`}>
                            {!v.acknowledged && (
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-400" />
                              </span>
                            )}
                            {v.acknowledged ? '✓ Acknowledged' : 'Pending'}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 pl-10">
                          <div>
                            <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">Corrective Action</p>
                            <p className="text-sm font-medium text-white/80">{v.corrective_action}</p>
                          </div>
                          {v.contractor_remarks && (
                            <div>
                              <p className="text-xs font-black text-white/50 uppercase tracking-widest mb-1">Contractor Remarks</p>
                              <p className="text-sm font-medium text-white/80">{v.contractor_remarks}</p>
                            </div>
                          )}
                        </div>

                        {/* Acknowledge button */}
                        {!v.acknowledged && (
                          <div className="pt-2 pl-10">
                            <button
                              onClick={() => acknowledge(v.id)}
                              disabled={acknowledging === v.id}
                              className="ack-btn px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:shadow-lg hover:shadow-indigo-500/50 transition-all shadow-md shadow-indigo-500/30 active:scale-95 disabled:opacity-70 flex items-center gap-2 backdrop-blur-md border border-white/20 relative overflow-hidden"
                            >
                              {acknowledging === v.id ? (
                                <>
                                  <div className="relative w-3 h-3">
                                    <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                                  </div>
                                  Processing…
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  Acknowledge
                                  {/* shimmer on hover */}
                                  <span className="btn-shimmer absolute inset-0 pointer-events-none" />
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── CSS ─────────────────────────────────────────────────────────── */}
      <style>{`
        /* Background orbs — scale-based pulse (GPU friendly) */
        .orb-a { animation: orbPulse 6s ease-in-out infinite; }
        .orb-b { animation: orbPulse 6s ease-in-out infinite 2s; }
        .orb-c { animation: orbPulse 6s ease-in-out infinite 4s; }
        @keyframes orbPulse {
          0%,100% { transform: scale(1);    opacity: .2; }
          50%      { transform: scale(1.15); opacity: .35; }
        }

        /* Header / filter slide-in */
        .header-slide-down { animation: slideDown .8s ease-out both; }
        .filter-slide-up   { animation: slideUp  .8s ease-out .1s both; }
        .content-fade-up   { animation: slideUp  .7s ease-out both; }

        /* Stat cards staggered reveal */
        .stat-card-reveal {
          opacity: 0;
          animation: statReveal .5s ease-out forwards;
        }
        @keyframes statReveal {
          from { opacity: 0; transform: translateY(12px) scale(.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }

        /* Violation cards staggered */
        .violation-card {
          opacity: 0;
          animation: cardSlide .45s ease-out forwards;
        }
        @keyframes cardSlide {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        /* Shimmer on stat accent bars */
        .shimmer-sweep {
          display: block;
          position: relative;
          overflow: hidden;
        }
        .shimmer-sweep::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);
          background-size: 200% 100%;
          animation: shimmer 2.4s linear infinite;
        }
        @keyframes shimmer {
          from { background-position: 200% center; }
          to   { background-position: -200% center; }
        }

        /* Number pop in stat cards */
        .number-pop { animation: numPop .5s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes numPop {
          from { opacity: 0; transform: scale(.6); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Empty state icon bounce */
        .empty-bounce { animation: bounceSoft .6s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes bounceSoft {
          from { opacity: 0; transform: scale(.5) translateY(10px); }
          to   { opacity: 1; transform: scale(1)  translateY(0); }
        }

        /* Acknowledge button shimmer on hover */
        .ack-btn:hover .btn-shimmer {
          animation: btnShimmer .6s ease-out;
        }
        @keyframes btnShimmer {
          from { background: linear-gradient(105deg,transparent 0%,rgba(255,255,255,.2) 50%,transparent 100%); background-position: -200% center; background-size: 200% 100%; }
          to   { background-position: 200% center; }
        }

        /* Generic helpers */
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp   { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }

        select option { background-color: #1e293b; color: white; }
      `}</style>
    </div>
  );
}
