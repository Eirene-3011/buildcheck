import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { useWizard } from '../store/wizard';
import StepIndicator from '../components/StepIndicator';
import SiteInspectionStep from './wizard/SiteInspectionStep';
import SafetyInspectionStep from './wizard/SafetyInspectionStep';
import PhotoStep from './wizard/PhotoStep';
import ReviewStep from './wizard/ReviewStep';

/**
 * Enhanced InspectionWizard — same logic, refined visuals:
 * - GPU-smooth orb pulses (scale instead of opacity flicker)
 * - LoadingSpinner: triple-ring with staggered speeds + breathing text
 * - Header badge ping dot matches indigo theme
 * - Project card: shimmer sweep on icon, subtle border glow on hover
 * - Step/phase badge: animated step number transition
 * - Step content area: key-based fade+slide per step change
 * - Exit button: smooth icon rotation on hover (already present, kept)
 * - All slide-in timings unified via CSS classes
 */

/* ── Loading Spinner ────────────────────────────────────────────────── */
const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8">
    <div className="relative w-24 h-24">
      {/* Static track */}
      <div className="absolute inset-0 rounded-full border-4 border-white/10 backdrop-blur-md" />
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-400 border-r-indigo-400/50 spinner-outer" />
      {/* Mid ring */}
      <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-blue-400/70 spinner-mid" />
      {/* Inner ring */}
      <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-white/40 spinner-inner" />
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-indigo-400/60 center-dot-pulse" />
      </div>
    </div>
    <div className="text-center space-y-2">
      <p className="text-white font-bold tracking-widest uppercase text-sm loading-breathe">Loading Project Context</p>
      <p className="text-white/40 text-xs">Preparing inspection workflow…</p>
    </div>
  </div>
);

/* ── Main Component ─────────────────────────────────────────────────── */
export default function InspectionWizard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { projectId, step, setProjectId, goTo, reset } = useWizard();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const qp = params.get('project');
    if (qp && !projectId) setProjectId(Number(qp));
  }, [params, projectId, setProjectId]);

  useEffect(() => {
    if (!projectId) { navigate('/projects/new'); return; }
    api.get(`/projects/${projectId}`)
      .then((r) => setProject(r.data))
      .catch((err) => console.error('Failed to fetch project', err));
  }, [projectId, navigate]);

  if (!projectId || !project) {
    return (
      <div className="min-h-screen pb-20 relative overflow-hidden" style={{
        background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
      }}>
        <Orbs />
        <div className="relative z-10"><LoadingSpinner /></div>
        <SharedStyles />
      </div>
    );
  }

  const getStepLabel = () => {
    switch (step) {
      case 2: return 'Site Assessment';
      case 3: return 'Safety Protocol';
      case 4: return 'Photo Documentation';
      case 5: return 'Final Review';
      default: return 'Inspection';
    }
  };

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden" style={{
      background: 'linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)',
    }}>
      <Orbs />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8 md:py-12 space-y-8">

        {/* ── Header ─────────────────────────────────────────────────── */}
        <div className="space-y-8 section-slide-down">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border border-white/20" style={{
                background: 'linear-gradient(135deg,rgba(99,102,241,.2),rgba(59,130,246,.2))',
              }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Inspection Workflow</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">
                Site Assessment
              </h1>
              <p className="text-white/60 text-lg font-medium max-w-2xl">
                Complete the multi-step inspection process for this project with comprehensive documentation.
              </p>
            </div>

            {/* Exit button */}
            <button
              onClick={() => { reset(); navigate('/'); }}
              className="group relative inline-flex items-center justify-center px-6 py-3 font-bold text-white transition-all duration-300 rounded-xl focus:outline-none active:scale-95 backdrop-blur-md border border-white/20 hover:bg-rose-500/20 hover:border-rose-400/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="hidden sm:inline">Exit</span>
              </span>
            </button>
          </div>

          {/* Step Progress */}
          <div
            className="rounded-2xl overflow-hidden backdrop-blur-xl border border-white/20 p-6 md:p-8 section-slide-up"
            style={{
              background: 'linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.05))',
              animationDelay: '.1s',
            }}
          >
            <StepIndicator current={step} />
          </div>
        </div>

        {/* ── Project Context Card ────────────────────────────────────── */}
        <div className="relative group section-slide-up" style={{ animationDelay: '.2s' }}>
          {/* Hover glow halo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/30 to-blue-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div
            className="relative rounded-3xl overflow-hidden backdrop-blur-xl border border-white/20 p-6 md:p-8 shadow-2xl shadow-black/50 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 group-hover:border-white/30"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.10),rgba(255,255,255,.05))' }}
          >
            {/* Corner accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

            <div className="relative z-10 flex items-center gap-5 flex-1">
              {/* Icon with shimmer */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/50 group-hover:shadow-indigo-500/70 transition-all duration-300 flex-shrink-0 overflow-hidden">
                <svg className="w-8 h-8 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="absolute inset-0 icon-shimmer pointer-events-none" />
              </div>

              <div>
                <p className="text-xs font-black text-white/50 uppercase tracking-[0.2em] mb-2">Active Project</p>
                <h2 className="text-2xl font-black text-white tracking-tight group-hover:text-indigo-300 transition-colors duration-300 drop-shadow-lg line-clamp-1">
                  {project.name}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-xs font-bold text-white/70 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {project.location_name || 'Site Location'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/30" />
                  <span className="text-xs font-bold text-white/60">Ref: {project.ref_number || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Phase badge */}
            <div
              className="relative z-10 flex items-center gap-4 px-6 py-4 rounded-2xl backdrop-blur-md border border-white/20"
              style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.2),rgba(59,130,246,.2))' }}
            >
              <div className="text-right">
                <p className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Current Phase</p>
                <p className="text-sm font-black text-indigo-300 uppercase drop-shadow-lg phase-label-swap" key={step}>
                  {getStepLabel()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xs font-black text-indigo-300 flex-shrink-0 step-counter" key={`counter-${step}`}>
                {step}/5
              </div>
            </div>
          </div>
        </div>

        {/* ── Step Content ─────────────────────────────────────────────── */}
        <div className="relative min-h-[400px] step-content-area" key={step}>
          {step === 2 && <SiteInspectionStep onBack={() => navigate('/projects/new')} />}
          {step === 3 && <SafetyInspectionStep onBack={() => goTo(2)} />}
          {step === 4 && <PhotoStep onBack={() => goTo(3)} />}
          {step === 5 && <ReviewStep project={project} onBack={() => goTo(4)} />}
        </div>
      </div>

      <SharedStyles />
    </div>
  );
}

/* ── Shared sub-components ──────────────────────────────────────────── */
const Orbs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl orb-a" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl orb-b" />
    <div className="absolute top-1/2 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl orb-c" />
  </div>
);

const SharedStyles = () => (
  <style>{`
    /* Orbs — scale-based pulse, GPU-composited */
    .orb-a { animation: orbPulse 7s ease-in-out infinite; }
    .orb-b { animation: orbPulse 7s ease-in-out infinite 2.3s; }
    .orb-c { animation: orbPulse 7s ease-in-out infinite 4.6s; }
    @keyframes orbPulse {
      0%,100% { transform: scale(1);    opacity: .2; }
      50%      { transform: scale(1.18); opacity: .38; }
    }

    /* Section entrances */
    .section-slide-down { animation: slideDown .8s ease-out both; }
    .section-slide-up   { animation: slideUp  .8s ease-out both; }
    @keyframes slideDown { from { opacity:0; transform:translateY(-24px); } to { opacity:1; transform:translateY(0); } }
    @keyframes slideUp   { from { opacity:0; transform:translateY(24px);  } to { opacity:1; transform:translateY(0); } }

    /* Step content fade+lift per step change (key prop triggers re-mount) */
    .step-content-area {
      animation: stepContentIn .45s cubic-bezier(.25,.46,.45,.94) both;
    }
    @keyframes stepContentIn {
      from { opacity:0; transform:translateY(16px); }
      to   { opacity:1; transform:translateY(0); }
    }

    /* Phase label swap — slides up when step changes */
    .phase-label-swap {
      animation: labelSwap .35s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes labelSwap {
      from { opacity:0; transform:translateY(6px) scale(.95); }
      to   { opacity:1; transform:translateY(0)   scale(1); }
    }

    /* Step counter pop */
    .step-counter {
      animation: counterPop .4s cubic-bezier(.34,1.56,.64,1) both;
    }
    @keyframes counterPop {
      from { transform:scale(.7); opacity:0; }
      to   { transform:scale(1);  opacity:1; }
    }

    /* Spinner rings */
    .spinner-outer { animation: spinCW  1.4s linear infinite; }
    .spinner-mid   { animation: spinCCW 2.1s linear infinite; }
    .spinner-inner { animation: spinCW  .9s linear infinite; }
    @keyframes spinCW  { to { transform: rotate(360deg);  } }
    @keyframes spinCCW { to { transform: rotate(-360deg); } }

    /* Spinner center dot */
    .center-dot-pulse {
      animation: dotPulse 1.8s ease-in-out infinite;
    }
    @keyframes dotPulse {
      0%,100% { transform:scale(1);   opacity:.6; }
      50%      { transform:scale(1.5); opacity:1;  }
    }

    /* Loading text breathe */
    .loading-breathe {
      animation: breathe 2.4s ease-in-out infinite;
    }
    @keyframes breathe {
      0%,100% { opacity:.7; }
      50%      { opacity:1;  }
    }

    /* Icon shimmer inside project card icon */
    .icon-shimmer {
      background: linear-gradient(105deg,transparent 30%,rgba(255,255,255,.25) 50%,transparent 70%);
      background-size: 200% 100%;
      animation: shimmer 3s linear infinite;
    }
    @keyframes shimmer {
      from { background-position: 200% center; }
      to   { background-position: -200% center; }
    }

    /* Generic */
    @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  `}</style>
);
