import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useWizard } from '../../store/wizard';

/* ── Shared input styles ────────────────────────────────────────────── */
const inputClass = `block w-full px-4 py-3 rounded-xl text-white font-semibold placeholder:text-white/40
  focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-400/60
  transition-all duration-300 hover:border-white/30 text-sm
  bg-slate-700/60 backdrop-blur-md border border-white/20
  focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]`;

/* ── Field wrapper ──────────────────────────────────────────────────── */
const Field = ({ label, children }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-white/50 uppercase tracking-[0.18em] ml-0.5 block">
      {label}
    </label>
    <div className="relative">{children}</div>
  </div>
);

/* ── Section Card shell ─────────────────────────────────────────────── */
const SectionCard = ({ sectionKey, allDone = false, animDelay = '0ms', children }) => (
  <div
    id={`section-${sectionKey}`}
    className="rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl scroll-mt-6 module-enter"
    style={{
      background: 'linear-gradient(160deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.04) 100%)',
      animationDelay: animDelay,
    }}
  >
    <div className="h-0.5 w-full" style={{
      background: allDone
        ? 'linear-gradient(90deg,#10b981,#34d399)'
        : 'linear-gradient(90deg,#6366f188,#3b82f622)',
    }} />
    <div className="p-6">{children}</div>
  </div>
);

/* ── Section header (non-collapsible, display-only) ─────────────────── */
const SecHead = ({ title, subtitle, icon }) => (
  <div className="flex items-center gap-4 mb-5 pb-4 border-b border-white/10">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/15 bg-gradient-to-br from-indigo-500/25 to-blue-500/25 text-white/70 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="text-base font-black text-white tracking-tight uppercase">{title}</h3>
      <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mt-0.5">{subtitle}</p>
    </div>
  </div>
);

/* ── Data pill ──────────────────────────────────────────────────────── */
const Pill = ({ children, color = 'default' }) => {
  const palette = {
    default: 'bg-white/8 border-white/15 text-white/70',
    indigo:  'bg-indigo-500/15 border-indigo-400/30 text-indigo-300',
    rose:    'bg-rose-500/15 border-rose-400/30 text-rose-300',
    amber:   'bg-amber-500/15 border-amber-400/30 text-amber-300',
    emerald: 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-tight backdrop-blur-md ${palette[color]}`}>
      {children}
    </span>
  );
};

/* ── Stat block ─────────────────────────────────────────────────────── */
const Stat = ({ label, value, accent }) => (
  <div className="space-y-1">
    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</p>
    <p className={`text-sm font-black drop-shadow-lg ${accent ? 'text-indigo-300' : 'text-white'}`}>{value}</p>
  </div>
);

/* ── Icons ──────────────────────────────────────────────────────────── */
const Icons = {
  building: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  clipboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  shield:    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  photo:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  alert:     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

/* ─────────────────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────────────────── */
export default function ReviewStep({ project, onBack }) {
  const navigate = useNavigate();
  const { projectId, site, safety, photos, reset } = useWizard();
  const [submitting, setSubmitting] = useState(false);
  const [violationStep, setViolationStep] = useState(null);
  const [violation, setViolation] = useState({
    description: '', corrective_action: '', contractor_remarks: '', acknowledged: false,
  });

  /* ── Incomplete guard ───────────────────────────────────────────── */
  if (!site || !safety) {
    return (
      <div className="form-fade-in">
        <SectionCard sectionKey="error" animDelay="0ms">
          <div className="flex flex-col items-center text-center py-8 gap-5">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-500/30 to-rose-600/20 border border-rose-400/30 text-rose-300">
              {Icons.alert}
            </div>
            <div>
              <h3 className="text-base font-black text-white tracking-tight uppercase mb-1">Incomplete Data</h3>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Some previous steps are missing. Please go back and complete all sections.</p>
            </div>
            <button
              onClick={onBack}
              className="group px-6 py-3 rounded-xl bg-white/8 border border-white/12 text-white/70 font-black uppercase tracking-wider text-xs hover:bg-white/12 hover:border-white/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              Return to Steps
            </button>
          </div>
        </SectionCard>
        <style>{sharedCSS}</style>
      </div>
    );
  }

  /* ── Submit handlers ────────────────────────────────────────────── */
  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = { project_id: projectId, ...site, ...safety };
      const fd = new FormData();
      fd.append('payload', JSON.stringify(payload));
      photos.forEach((f) => fd.append('photos', f));
      const { data } = await api.post('/inspections', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.requires_violation) {
        setViolationStep({ inspectionId: data.id });
      } else {
        alert('Inspection saved successfully!');
        reset();
        navigate(`/reports?project=${projectId}`);
      }
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to submit inspection');
    } finally {
      setSubmitting(false);
    }
  };

  const submitViolation = async () => {
    if (!violation.description || !violation.corrective_action) {
      alert('Description and Corrective Action are required.');
      return;
    }
    if (!violation.acknowledged) {
      alert('Contractor acknowledgement is required.');
      return;
    }
    try {
      await api.post('/violations', { inspection_id: violationStep.inspectionId, ...violation });
      alert('Violation recorded with contractor acknowledgement.');
      reset();
      navigate(`/reports?project=${projectId}`);
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to record violation');
    }
  };

  /* ── Violation flow ─────────────────────────────────────────────── */
  if (violationStep) {
    return (
      <div className="space-y-4 form-fade-in">

        {/* Alert banner */}
        <div
          className="rounded-2xl border border-rose-400/30 overflow-hidden backdrop-blur-xl module-enter"
          style={{
            background: 'linear-gradient(160deg,rgba(244,63,94,0.18) 0%,rgba(244,63,94,0.07) 100%)',
            animationDelay: '0ms',
          }}
        >
          <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg,#f43f5e,#fb7185)' }} />
          <div className="p-6 flex flex-col sm:flex-row items-center gap-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-rose-500/40 to-rose-600/30 border border-rose-400/40 text-rose-300 flex-shrink-0 animate-pulse">
              {Icons.alert}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-base font-black text-white tracking-tight uppercase mb-1">Violation Triggered</h2>
              <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">
                Critical non-compliance detected — record the violation and obtain contractor acknowledgement.
              </p>
            </div>
          </div>
        </div>

        {/* Violation form */}
        <SectionCard sectionKey="violation" animDelay="80ms">
          <div className="space-y-4">
            <Field label="Violation Description *">
              <textarea
                className={inputClass} rows="3"
                placeholder="Describe the specific violation..."
                value={violation.description}
                onChange={(e) => setViolation({ ...violation, description: e.target.value })}
              />
            </Field>
            <Field label="Corrective Actions *">
              <textarea
                className={inputClass} rows="3"
                placeholder="Specify required corrective measures..."
                value={violation.corrective_action}
                onChange={(e) => setViolation({ ...violation, corrective_action: e.target.value })}
              />
            </Field>
            <Field label="Contractor Remarks">
              <textarea
                className={inputClass} rows="2"
                placeholder="Any comments from the contractor..."
                value={violation.contractor_remarks}
                onChange={(e) => setViolation({ ...violation, contractor_remarks: e.target.value })}
              />
            </Field>

            {/* Acknowledgement toggle */}
            <button
              type="button"
              onClick={() => setViolation({ ...violation, acknowledged: !violation.acknowledged })}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left
                ${violation.acknowledged
                  ? 'bg-indigo-500/15 border-indigo-400/30'
                  : 'bg-white/5 border-white/12 hover:bg-white/8 hover:border-white/20'
                }`}
            >
              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                ${violation.acknowledged
                  ? 'bg-gradient-to-br from-indigo-500 to-blue-500 border-indigo-400 text-white'
                  : 'bg-white/8 border-white/25'
                }`}>
                {violation.acknowledged && (
                  <svg className="w-3.5 h-3.5 check-pop" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-xs font-black text-white/70 uppercase tracking-wide">
                Contractor officially acknowledges this violation report
              </span>
            </button>
          </div>
        </SectionCard>

        {/* Violation footer */}
        <div
          className="rounded-2xl border border-white/10 px-6 py-5 flex justify-end backdrop-blur-xl module-enter"
          style={{
            background: 'linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.03))',
            animationDelay: '160ms',
          }}
        >
          <button
            onClick={submitViolation}
            className="group px-10 py-3 rounded-xl text-white font-black uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 flex items-center gap-2 border border-rose-400/30 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#e11d48,#be123c)', boxShadow: '0 4px 20px rgba(225,29,72,0.4)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Submit Violation &amp; Finalize
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className="absolute inset-0 btn-shimmer pointer-events-none" />
          </button>
        </div>

        <style>{sharedCSS}</style>
      </div>
    );
  }

  /* ── Main review ────────────────────────────────────────────────── */
  return (
    <div className="space-y-4 form-fade-in">

      {/* ── Step badge + title ──────────────────────────────────────── */}
      <div className="space-y-3 module-enter" style={{ animationDelay: '0ms' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15" style={{
          background: 'linear-gradient(135deg,rgba(99,102,241,.2),rgba(59,130,246,.15))',
        }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Step 05 — Finalization</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Review &amp; Submit</h2>
        <p className="text-white/40 text-sm font-medium">Verify all inspection data before official submission to the registry.</p>
      </div>

      {/* ── 1: Project Context ──────────────────────────────────────── */}
      <SectionCard sectionKey="project" allDone animDelay="80ms">
        <SecHead title="Project Context" subtitle="Target identification" icon={Icons.building} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-base font-black text-white drop-shadow-lg">{project.name}</p>
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{project.funding_source}</p>
          </div>
          <Pill color="indigo">Ref: {project.ref_number || 'N/A'}</Pill>
        </div>
      </SectionCard>

      {/* ── 2: Site Assessment ─────────────────────────────────────── */}
      <SectionCard sectionKey="site" allDone animDelay="130ms">
        <SecHead title="Site Assessment" subtitle="Operational data" icon={Icons.clipboard} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-5">
          <Stat label="Date & Time"  value={new Date(site.inspection_datetime).toLocaleString()} />
          <Stat label="Weather"      value={site.weather + (site.weather_other ? ` (${site.weather_other})` : '')} />
          <Stat label="Cleanliness"  value={site.site_cleanliness} />
          <Stat label="Compliance"   value={site.compliance_status} accent />
        </div>

        {/* Activities */}
        <div className="mb-4">
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Active Activities</p>
          <div className="flex flex-wrap gap-1.5">
            {site.activities.map((a, i) => <Pill key={i}>{a}</Pill>)}
          </div>
        </div>

        {/* Manpower */}
        <div>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Manpower Distribution</p>
          <div className="flex flex-wrap gap-2">
            {site.manpower.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white/60">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/70 flex-shrink-0" />
                {m.category}
                <span className="font-black text-indigo-300 ml-0.5">{m.count}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* ── 3: Safety & Risk ───────────────────────────────────────── */}
      <SectionCard sectionKey="safety" allDone animDelay="180ms">
        <SecHead title="Safety & Risk" subtitle="Protocol verification" icon={Icons.shield} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-4">
          <Stat label="Overall Assessment" value={safety.overall_assessment} accent />
          <Stat label="Safety Items"       value={`${safety.safety_general.length} Verified`} />
          <Stat label="ENV Items"          value={`${safety.environmental?.length ?? 0} Checked`} />
        </div>

        {/* Risk area pills */}
        <div>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Risk Areas</p>
          <div className="flex flex-wrap gap-1.5">
            {safety.safety_risk.map((r, i) => {
              const color = r.risk_level === 'High' ? 'rose' : r.risk_level === 'Medium' ? 'amber' : 'emerald';
              return (
                <Pill key={i} color={color}>
                  {r.risk_type} · {r.risk_level}
                </Pill>
              );
            })}
          </div>
        </div>
      </SectionCard>

      {/* ── 4: Media Assets ────────────────────────────────────────── */}
      <SectionCard sectionKey="media" allDone={photos.length > 0} animDelay="230ms">
        <SecHead title="Media Assets" subtitle="Visual documentation" icon={Icons.photo} />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-500/25 to-blue-500/25 border border-white/15 text-indigo-300 font-black text-lg backdrop-blur-md">
            {photos.length}
          </div>
          <div>
            <p className="text-sm font-black text-white drop-shadow-lg">
              {photos.length} Photo{photos.length !== 1 ? 's' : ''} Attached
            </p>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mt-0.5">Ready for upload</p>
          </div>
        </div>
      </SectionCard>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-white/10 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl module-enter"
        style={{
          background: 'linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.03))',
          animationDelay: '300ms',
        }}
      >
        <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
          <span className="text-indigo-400 mr-1.5">✓</span>Review all sections before finalizing
        </p>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={onBack}
            className="group flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/8 border border-white/12 text-white/70 font-black uppercase tracking-wider text-xs hover:bg-white/12 hover:border-white/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="group flex-[2] md:flex-none px-10 py-3 rounded-xl text-white font-black uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2 border border-white/20 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              {submitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  Finalize &amp; Submit
                  <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </span>
            <span className="absolute inset-0 btn-shimmer pointer-events-none" />
          </button>
        </div>
      </div>

      <style>{sharedCSS}</style>
    </div>
  );
}

/* ── Shared CSS (same keyframes as SiteInspectionStep) ──────────────── */
const sharedCSS = `
  .form-fade-in { animation: fadeIn .6s ease-out both; }

  .module-enter {
    opacity: 0;
    animation: moduleReveal .5s ease-out forwards;
  }
  @keyframes moduleReveal {
    from { opacity:0; transform:translateY(12px) scale(.99); }
    to   { opacity:1; transform:translateY(0)    scale(1);   }
  }

  .check-pop { animation: checkPop .28s cubic-bezier(.34,1.56,.64,1) both; }
  @keyframes checkPop {
    from { opacity:0; transform:scale(.3) rotate(-15deg); }
    to   { opacity:1; transform:scale(1)  rotate(0deg);   }
  }

  .btn-shimmer {
    background: linear-gradient(105deg,transparent 0%,rgba(255,255,255,0) 38%,rgba(255,255,255,.14) 50%,rgba(255,255,255,0) 62%,transparent 100%);
    background-size: 200% 100%;
    background-position: 200% center;
    transition: background-position .5s ease;
  }
  button:hover .btn-shimmer { background-position: -200% center; }

  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }

  select option { background-color: #1e3a5f; color: #f1f5f9; font-weight: 600; }
`;
