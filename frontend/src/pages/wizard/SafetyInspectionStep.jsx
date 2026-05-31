import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useWizard } from '../../store/wizard';
import {
  SAFETY_GENERAL_ITEMS, SAFETY_GEN_STATUS,
  RISK_AREAS, RISK_LEVELS,
  ENV_ITEMS, ENV_STATUS,
  OVERALL_ASSESSMENT,
} from '../../utils/options';

/* ── Shared input styles (ProjectEntry palette) ─────────────────────── */
const inputClass = `block w-full px-4 py-3 rounded-xl text-white font-semibold placeholder:text-white/40
  focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-400/60
  transition-all duration-300 hover:border-white/30 text-sm
  bg-slate-700/60 backdrop-blur-md border border-white/20
  focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]`;

const selectClass = `${inputClass} appearance-none cursor-pointer`;

/* ── Field wrapper ──────────────────────────────────────────────────── */
const Field = ({ label, children, error, full, icon }) => (
  <div className={`${full ? 'md:col-span-2' : ''} space-y-2`}>
    <label className="flex items-center gap-1.5 text-[10px] font-black text-white/50 uppercase tracking-[0.18em] ml-0.5">
      {icon && <span className="text-indigo-400/80">{icon}</span>}
      {label}
    </label>
    <div className="relative">{children}</div>
    {error && (
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 ml-0.5 error-shake">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    )}
  </div>
);

/* ── Select with chevron ────────────────────────────────────────────── */
const Sel = React.forwardRef(({ children, ...props }, ref) => (
  <div className="relative">
    <select className={selectClass} ref={ref} {...props}>{children}</select>
    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
));

/* ── Section Header (collapsible + progress ring) ───────────────────── */
const SectionHeader = ({ title, subtitle, icon, sectionKey, expanded, onToggle, completedCount, totalCount }) => {
  const pct     = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = completedCount === totalCount && totalCount > 0;

  return (
    <button
      type="button"
      onClick={() => onToggle(sectionKey)}
      className="w-full flex items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10 hover:border-white/20 transition-all duration-300 group"
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-md border transition-all duration-300 flex-shrink-0 ${
          allDone
            ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/30 border-emerald-400/40 text-emerald-300'
            : 'bg-gradient-to-br from-indigo-500/25 to-blue-500/25 border-white/15 text-white/70 group-hover:border-white/30'
        }`}>
          {allDone
            ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            : icon}
        </div>
        <div className="text-left flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-white tracking-tight uppercase">{title}</h3>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              allDone
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-white/30'
            }`}>{completedCount}/{totalCount}</span>
          </div>
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle
              cx="16" cy="16" r="12" fill="none"
              stroke={allDone ? '#10b981' : '#6366f1'}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - pct / 100)}`}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white/60">{pct}%</span>
        </div>
        <svg className={`w-4 h-4 text-white/40 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  );
};

/* ── Section Card shell ─────────────────────────────────────────────── */
const SectionCard = ({ sectionKey, allDone, animDelay, children }) => (
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

/* ── Add Row button ─────────────────────────────────────────────────── */
const AddRowBtn = ({ onClick, label = 'Add Row' }) => (
  <button
    type="button"
    className="group w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/25 transition-all active:scale-95"
    onClick={onClick}
  >
    <svg className="w-3 h-3 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
    </svg>
    {label}
  </button>
);

/* ── Remove button ──────────────────────────────────────────────────── */
const RemoveBtn = ({ onClick }) => (
  <button
    type="button"
    className="flex justify-center text-rose-400/70 hover:text-rose-300 transition-all p-1.5 rounded-lg hover:bg-rose-500/15 active:scale-90"
    onClick={onClick}
  >
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
);

/* ── Icon constants ─────────────────────────────────────────────────── */
const ShieldIcon  = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const AlertIcon   = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const LeafIcon    = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>;
const BoltIcon    = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const S = {
  check: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  grid:  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
};

/* ─────────────────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────────────────── */
export default function SafetyInspectionStep({ onBack }) {
  const setSafety = useWizard((s) => s.setSafety);
  const existing  = useWizard((s) => s.safety);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: existing || {
      safety_general: SAFETY_GENERAL_ITEMS.slice(0, 4).map((item) => ({ item, status: 'Compliant', remarks: '' })),
      safety_risk:    [{ risk_type: 'Working at Heights', risk_level: 'Low', measures: '' }],
      environmental:  ENV_ITEMS.slice(0, 3).map((item) => ({ item, status: 'Satisfactory', remarks: '' })),
      overall_assessment: 'Good',
    },
  });

  const sg = useFieldArray({ control, name: 'safety_general' });
  const sr = useFieldArray({ control, name: 'safety_risk' });
  const en = useFieldArray({ control, name: 'environmental' });

  const sgWatch = watch('safety_general');
  const srWatch = watch('safety_risk');

  const [expanded, setExpanded] = useState({
    general:     true,
    risk:        true,
    environment: true,
    assessment:  true,
  });
  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  const onSubmit = (data) => setSafety(data);

  /* ── completion counters ── */
  const genDone = sg.fields.length;
  const riskDone = sr.fields.length;
  const envDone = en.fields.length;
  const assessDone = watch('overall_assessment') ? 1 : 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 form-fade-in">

      {/* ── Step badge + title ──────────────────────────────────────── */}
      <div className="space-y-3 module-enter" style={{ animationDelay: '0ms' }}>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15" style={{
          background: 'linear-gradient(135deg,rgba(99,102,241,.2),rgba(59,130,246,.15))',
        }}>
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Step 03 — Safety &amp; Health</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Safety Inspection</h2>
        <p className="text-white/40 text-sm font-medium">Comprehensive safety and health assessment with risk identification and control measures.</p>
      </div>

      {/* ── Section 1: General Site Safety ─────────────────────────── */}
      <SectionCard sectionKey="general" allDone={genDone > 0} animDelay="80ms">
        <SectionHeader
          title="General Site Safety & Health" subtitle="Safety compliance checklist"
          icon={ShieldIcon} sectionKey="general"
          expanded={expanded.general} onToggle={toggle}
          completedCount={Math.min(genDone, 1)} totalCount={1}
        />
        {expanded.general && (
          <div className="space-y-3" style={{ animation: 'slideDown 0.25s ease-out' }}>

            {/* Column headers */}
            <div className="grid grid-cols-12 gap-2 px-0.5">
              <span className="col-span-5 text-[9px] font-black text-white/30 uppercase tracking-widest">Safety Item</span>
              <span className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Status</span>
              <span className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Remarks</span>
            </div>

            <div className="space-y-2 mb-4">
              {sg.fields.map((f, i) => {
                const status = sgWatch?.[i]?.status;
                return (
                  <div key={f.id} className="row-slide-left" style={{ animationDelay: `${i * 35}ms` }}>
                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <Sel {...register(`safety_general.${i}.item`, { required: true })}>
                          {SAFETY_GENERAL_ITEMS.map((it) => <option key={it}>{it}</option>)}
                        </Sel>
                      </div>
                      <div className="col-span-3">
                        <Sel {...register(`safety_general.${i}.status`, { required: true })}>
                          {SAFETY_GEN_STATUS.map((s) => <option key={s}>{s}</option>)}
                        </Sel>
                      </div>
                      <div className="col-span-3">
                        <input
                          className={inputClass}
                          placeholder={status === 'Non-Compliant' ? 'Remarks (required)' : 'Remarks…'}
                          {...register(`safety_general.${i}.remarks`, {
                            validate: (v) =>
                              status !== 'Non-Compliant' || (v && v.trim().length) || 'Required for non-compliant',
                          })}
                        />
                      </div>
                      <div className="col-span-1 pt-1">
                        <RemoveBtn onClick={() => sg.remove(i)} />
                      </div>
                    </div>
                    {errors.safety_general?.[i]?.remarks && (
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 mt-1.5 ml-0.5 error-shake">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {errors.safety_general[i].remarks.message}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <AddRowBtn
              label="Add Item"
              onClick={() => sg.append({ item: SAFETY_GENERAL_ITEMS[0], status: 'Compliant', remarks: '' })}
            />
          </div>
        )}
      </SectionCard>

      {/* ── Section 2: High-Risk Safety Areas ──────────────────────── */}
      <SectionCard sectionKey="risk" allDone={riskDone > 0} animDelay="140ms">
        <SectionHeader
          title="High-Risk Safety Areas" subtitle="Risk assessment and mitigation"
          icon={AlertIcon} sectionKey="risk"
          expanded={expanded.risk} onToggle={toggle}
          completedCount={Math.min(riskDone, 1)} totalCount={1}
        />
        {expanded.risk && (
          <div className="space-y-3" style={{ animation: 'slideDown 0.25s ease-out' }}>

            <div className="grid grid-cols-12 gap-2 px-0.5">
              <span className="col-span-5 text-[9px] font-black text-white/30 uppercase tracking-widest">Risk Area</span>
              <span className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Level</span>
              <span className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Measures</span>
            </div>

            <div className="space-y-2 mb-4">
              {sr.fields.map((f, i) => {
                const level = srWatch?.[i]?.risk_level;
                const levelColor =
                  level === 'Low'    ? 'border-l-emerald-400/50' :
                  level === 'Medium' ? 'border-l-amber-400/50'   :
                  level === 'High'   ? 'border-l-rose-400/50'    : 'border-l-white/10';

                return (
                  <div
                    key={f.id}
                    className={`row-slide-right rounded-xl border-l-2 pl-3 ${levelColor} transition-colors duration-300`}
                    style={{ animationDelay: `${i * 35}ms` }}
                  >
                    <div className="grid grid-cols-12 gap-2 items-start">
                      <div className="col-span-5">
                        <Sel {...register(`safety_risk.${i}.risk_type`, { required: true })}>
                          {RISK_AREAS.map((it) => <option key={it}>{it}</option>)}
                        </Sel>
                      </div>
                      <div className="col-span-3">
                        <Sel {...register(`safety_risk.${i}.risk_level`, { required: true })}>
                          {RISK_LEVELS.map((s) => <option key={s}>{s}</option>)}
                        </Sel>
                      </div>
                      <div className="col-span-3">
                        <input
                          className={inputClass}
                          placeholder="Safety measures…"
                          {...register(`safety_risk.${i}.measures`)}
                        />
                      </div>
                      <div className="col-span-1 pt-1">
                        <RemoveBtn onClick={() => sr.remove(i)} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <AddRowBtn
              label="Add Risk"
              onClick={() => sr.append({ risk_type: RISK_AREAS[0], risk_level: 'Low', measures: '' })}
            />
          </div>
        )}
      </SectionCard>

      {/* ── Section 3: Environmental & Health Control ───────────────── */}
      <SectionCard sectionKey="environment" allDone={envDone > 0} animDelay="200ms">
        <SectionHeader
          title="Environmental & Health Control" subtitle="Environmental compliance assessment"
          icon={LeafIcon} sectionKey="environment"
          expanded={expanded.environment} onToggle={toggle}
          completedCount={Math.min(envDone, 1)} totalCount={1}
        />
        {expanded.environment && (
          <div className="space-y-3" style={{ animation: 'slideDown 0.25s ease-out' }}>

            <div className="grid grid-cols-12 gap-2 px-0.5">
              <span className="col-span-5 text-[9px] font-black text-white/30 uppercase tracking-widest">ENV Item</span>
              <span className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Status</span>
              <span className="col-span-3 text-[9px] font-black text-white/30 uppercase tracking-widest">Remarks</span>
            </div>

            <div className="space-y-2 mb-4">
              {en.fields.map((f, i) => (
                <div key={f.id} className="row-slide-left" style={{ animationDelay: `${i * 35}ms` }}>
                  <div className="grid grid-cols-12 gap-2 items-start">
                    <div className="col-span-5">
                      <Sel {...register(`environmental.${i}.item`, { required: true })}>
                        {ENV_ITEMS.map((it) => <option key={it}>{it}</option>)}
                      </Sel>
                    </div>
                    <div className="col-span-3">
                      <Sel {...register(`environmental.${i}.status`, { required: true })}>
                        {ENV_STATUS.map((s) => <option key={s}>{s}</option>)}
                      </Sel>
                    </div>
                    <div className="col-span-3">
                      <input
                        className={inputClass}
                        placeholder="Remarks…"
                        {...register(`environmental.${i}.remarks`)}
                      />
                    </div>
                    <div className="col-span-1 pt-1">
                      <RemoveBtn onClick={() => en.remove(i)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <AddRowBtn
              label="Add Item"
              onClick={() => en.append({ item: ENV_ITEMS[0], status: 'Satisfactory', remarks: '' })}
            />
          </div>
        )}
      </SectionCard>

      {/* ── Section 4: Overall Assessment ──────────────────────────── */}
      <SectionCard sectionKey="assessment" allDone={assessDone === 1} animDelay="260ms">
        <SectionHeader
          title="Overall Assessment" subtitle="Inspector's safety evaluation"
          icon={BoltIcon} sectionKey="assessment"
          expanded={expanded.assessment} onToggle={toggle}
          completedCount={assessDone} totalCount={1}
        />
        {expanded.assessment && (
          <div style={{ animation: 'slideDown 0.25s ease-out' }}>
            <Field label="Inspector's Overall Safety Assessment *" error={errors.overall_assessment?.message} icon={S.check}>
              <Sel {...register('overall_assessment', { required: 'Required' })}>
                {OVERALL_ASSESSMENT.map((s) => <option key={s}>{s}</option>)}
              </Sel>
            </Field>
          </div>
        )}
      </SectionCard>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-white/10 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl module-enter"
        style={{
          background: 'linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.03))',
          animationDelay: '320ms',
        }}
      >
        <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
          <span className="text-indigo-400 mr-1.5">*</span>All starred fields are mandatory
        </p>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            type="button" onClick={onBack}
            className="group flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/8 border border-white/12 text-white/70 font-black uppercase tracking-wider text-xs hover:bg-white/12 hover:border-white/20 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>
          <button
            type="submit"
            className="group flex-[2] md:flex-none px-10 py-3 rounded-xl text-white font-black uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 border border-white/20 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Continue to Photos
              <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
            <span className="absolute inset-0 btn-shimmer pointer-events-none" />
          </button>
        </div>
      </div>

      {/* ── CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        .form-fade-in { animation: fadeIn .6s ease-out both; }

        .module-enter {
          opacity: 0;
          animation: moduleReveal .5s ease-out forwards;
        }
        @keyframes moduleReveal {
          from { opacity:0; transform:translateY(12px) scale(.99); }
          to   { opacity:1; transform:translateY(0)    scale(1);   }
        }

        .row-slide-left  { opacity:0; animation: rowL .3s ease-out forwards; }
        .row-slide-right { opacity:0; animation: rowR .3s ease-out forwards; }
        @keyframes rowL { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
        @keyframes rowR { from { opacity:0; transform:translateX(8px);  } to { opacity:1; transform:translateX(0); } }

        .error-shake { animation: shake .3s ease-out both; }
        @keyframes shake {
          0%,100% { transform:translateX(0);   }
          20%      { transform:translateX(-4px); }
          50%      { transform:translateX(3px);  }
          80%      { transform:translateX(-2px); }
        }

        .btn-shimmer {
          background: linear-gradient(105deg,transparent 0%,rgba(255,255,255,0) 38%,rgba(255,255,255,.14) 50%,rgba(255,255,255,0) 62%,transparent 100%);
          background-size: 200% 100%;
          background-position: 200% center;
          transition: background-position .5s ease;
        }
        button:hover .btn-shimmer { background-position: -200% center; }

        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }

        select option { background-color: #1e3a5f; color: #f1f5f9; font-weight: 600; }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { opacity: 0.3; }
      `}</style>
    </form>
  );
}
