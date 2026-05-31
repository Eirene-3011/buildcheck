/**
 * Ultra-Enhanced StepIndicator Component
 *
 * Enhancement Notes (no logic changes):
 * - Richer stagger animations on mount via CSS animation-delay per step
 * - Shimmer sweep on connector fill lines (completed + active)
 * - Crisp number → checkmark swap animation (scale + fade)
 * - "Done" badge gets a subtle inner-glow ring to match active treatment
 * - Tooltip arrow added for polish
 * - Mobile card: animated percentage bar mirrors top progress bar
 * - Active pulse rings use transform-scale instead of box-shadow for GPU smoothness
 * - Step badge active state adds a rotating gradient border ring
 */

const STEPS = [
  'Project Details',
  'Site Inspection',
  'Safety Inspection',
  'Photo Documentation',
  'Review & Submit',
];

export default function StepIndicator({ current }) {
  return (
    <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">

      {/* ── Enhanced Progress Bar Container ─────────────────────────────── */}
      <div className="mb-10 space-y-2">
        <div
          className="h-2 rounded-full overflow-hidden backdrop-blur-md border border-white/20 shadow-lg shadow-black/30"
          style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))' }}
        >
          <div
            className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
            style={{
              width: `${((current - 1) / (STEPS.length - 1)) * 100}%`,
              background: 'linear-gradient(90deg,#4f46e5,#3b82f6,#4f46e5)',
              boxShadow: '0 0 12px 2px rgba(99,102,241,.5)',
            }}
          >
            {/* shimmer sweep */}
            <span className="absolute inset-0 shimmer-sweep" />
          </div>
        </div>
        <div className="flex justify-between px-1">
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Start</span>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Complete</span>
        </div>
      </div>

      {/* ── Steps Container ───────────────────────────────────────────────── */}
      <ol className="flex flex-wrap items-center gap-2 md:gap-3">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < current ? 'done' : n === current ? 'active' : 'todo';
          const delay = `${i * 90}ms`;

          return (
            <li
              key={label}
              className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none step-stagger"
              style={{ animationDelay: delay }}
            >
              {/* ── Step Badge ──────────────────────────────────────────── */}
              <div className="relative flex-shrink-0 group">

                {/* Rotating gradient border ring — active only */}
                {state === 'active' && (
                  <div
                    className="absolute -inset-[3px] rounded-full z-0 rotating-ring"
                    style={{
                      background: 'conic-gradient(from 0deg,#6366f1,#3b82f6,#818cf8,#6366f1)',
                    }}
                  />
                )}

                <div
                  className={`relative z-10 w-12 h-12 grid place-items-center rounded-full text-sm font-black border-2 transition-all duration-500 backdrop-blur-md flex items-center justify-center shadow-lg
                    ${
                      state === 'done'
                        ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 text-white border-emerald-400 shadow-emerald-500/50 scale-100 hover:scale-105'
                        : state === 'active'
                        ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-transparent shadow-indigo-500/60 scale-110 hover:scale-[1.15]'
                        : 'bg-white/10 text-white/60 border-white/20 hover:border-white/40 hover:bg-white/20 hover:scale-105'
                    }`}
                >
                  {state === 'done' ? (
                    <svg
                      className="w-6 h-6 check-pop"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className={`transition-all duration-300 font-black ${state === 'active' ? 'text-lg' : 'text-base'}`}>
                      {n}
                    </span>
                  )}
                </div>

                {/* Done inner-glow ring (mirrors active treatment) */}
                {state === 'done' && (
                  <div className="absolute inset-0 rounded-full ring-2 ring-emerald-400/40 done-glow" />
                )}

                {/* Active pulse rings */}
                {state === 'active' && (
                  <>
                    <div className="absolute inset-0 rounded-full pulse-ring-a" />
                    <div className="absolute inset-0 rounded-full pulse-ring-b" />
                  </>
                )}

                {/* Active ambient glow */}
                {state === 'active' && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600/20 to-blue-600/20 blur-lg opacity-50 pointer-events-none" />
                )}

                {/* Tooltip */}
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                  <div className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-[10px] font-bold text-white whitespace-nowrap shadow-lg relative">
                    {state === 'done' ? 'Completed' : state === 'active' ? 'Current' : 'Pending'}
                    {/* arrow */}
                    <span
                      className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: '5px solid rgba(255,255,255,.25)',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* ── Step Label ──────────────────────────────────────────── */}
              <div className="hidden sm:block">
                <p
                  className={`text-xs font-black uppercase tracking-widest transition-all duration-300 drop-shadow-lg
                    ${
                      state === 'active'
                        ? 'text-indigo-300'
                        : state === 'done'
                        ? 'text-emerald-300'
                        : 'text-white/50'
                    }`}
                >
                  {label}
                </p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mt-0.5">
                  {state === 'done' ? 'Completed' : state === 'active' ? 'Current' : 'Pending'}
                </p>
              </div>

              {/* ── Connector Line ──────────────────────────────────────── */}
              {n < STEPS.length && (
                <div className="hidden md:flex flex-1 items-center px-2 min-w-[60px]">
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden backdrop-blur-md border border-white/20 relative shadow-md"
                    style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.08),rgba(255,255,255,.03))' }}
                  >
                    {n < current && (
                      <div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{
                          width: '100%',
                          background: 'linear-gradient(90deg,#059669,#10b981,#059669)',
                          boxShadow: '0 0 8px 1px rgba(16,185,129,.4)',
                          transition: 'width .7s ease',
                        }}
                      >
                        <span className="absolute inset-0 shimmer-sweep" />
                      </div>
                    )}
                    {n === current && (
                      <div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{
                          width: '50%',
                          background: 'linear-gradient(90deg,#4f46e5,#3b82f6,#4f46e5)',
                          boxShadow: '0 0 8px 1px rgba(99,102,241,.4)',
                          transition: 'width .7s ease',
                        }}
                      >
                        <span className="absolute inset-0 shimmer-sweep" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* ── Mobile Step Info Card ─────────────────────────────────────────── */}
      <div
        className="sm:hidden mt-8 p-5 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg shadow-black/30 animate-in fade-in slide-in-from-bottom-2 duration-500"
        style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.05))' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 backdrop-blur-md
              ${current === STEPS.length
                ? 'bg-gradient-to-br from-emerald-600 to-emerald-500 border-emerald-400 text-white'
                : 'bg-gradient-to-br from-indigo-600 to-blue-600 border-indigo-400 text-white'
              }`}
          >
            {current === STEPS.length ? (
              <svg className="w-5 h-5 check-pop" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            ) : current}
          </div>
          <div>
            <p className="text-xs font-black text-white/60 uppercase tracking-widest">Current Step</p>
            <p className="text-sm font-black text-indigo-300 drop-shadow-lg">{STEPS[current - 1]}</p>
          </div>
        </div>

        {/* Animated mini-bar */}
        <div
          className="h-1.5 w-full rounded-full overflow-hidden mb-3"
          style={{ background: 'rgba(255,255,255,.08)' }}
        >
          <div
            className="h-full rounded-full relative overflow-hidden"
            style={{
              width: `${((current - 1) / (STEPS.length - 1)) * 100}%`,
              background: 'linear-gradient(90deg,#4f46e5,#3b82f6)',
              transition: 'width .7s ease',
              boxShadow: '0 0 8px 2px rgba(99,102,241,.45)',
            }}
          >
            <span className="absolute inset-0 shimmer-sweep" />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
            {current} of {STEPS.length}
          </p>
          <div className="text-[10px] font-black text-white/50 uppercase tracking-widest">
            {Math.round(((current - 1) / (STEPS.length - 1)) * 100)}% Complete
          </div>
        </div>
      </div>

      {/* ── CSS ───────────────────────────────────────────────────────────── */}
      <style>{`
        /* Stagger mount */
        .step-stagger {
          opacity: 0;
          animation: stepFadeUp .5s ease-out forwards;
        }
        @keyframes stepFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Checkmark pop */
        .check-pop {
          animation: checkPop .35s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes checkPop {
          from { opacity: 0; transform: scale(0.4) rotate(-20deg); }
          to   { opacity: 1; transform: scale(1)   rotate(0deg); }
        }

        /* Shimmer sweep on connector / progress fills */
        .shimmer-sweep {
          display: block;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255,255,255,.25) 50%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: shimmer 2.2s linear infinite;
        }
        @keyframes shimmer {
          from { background-position: 200% center; }
          to   { background-position: -200% center; }
        }

        /* Active pulse rings — GPU-friendly (transform + opacity) */
        .pulse-ring-a,
        .pulse-ring-b {
          border: 2px solid rgba(99,102,241,.7);
          pointer-events: none;
        }
        .pulse-ring-a { animation: pulseScale 2s cubic-bezier(.4,0,.6,1) infinite; }
        .pulse-ring-b { border-color: rgba(59,130,246,.4); animation: pulseScale 3s cubic-bezier(.4,0,.6,1) infinite; }
        @keyframes pulseScale {
          0%   { transform: scale(1);    opacity: .8; }
          70%  { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }

        /* Done glow */
        .done-glow {
          animation: doneGlow 3s ease-in-out infinite alternate;
        }
        @keyframes doneGlow {
          from { box-shadow: 0 0 0 0 rgba(52,211,153,.0); }
          to   { box-shadow: 0 0 10px 4px rgba(52,211,153,.35); }
        }

        /* Rotating gradient ring for active badge */
        .rotating-ring {
          animation: spinRing 4s linear infinite;
        }
        @keyframes spinRing {
          to { transform: rotate(360deg); }
        }

        /* Generic animate-in helpers */
        .animate-in { animation: fadeIn .7s ease-out; }
        .fade-in    { animation: fadeIn .7s ease-out; }
        .slide-in-from-top-4    { animation: slideDown .7s ease-out; }
        .slide-in-from-bottom-2 { animation: slideUp  .5s ease-out; }
        @keyframes fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp   { from { opacity:0; transform:translateY(20px);  } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}
