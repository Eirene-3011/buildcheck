import React, { useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useWizard } from '../../store/wizard';
import {
  WEATHER, ACTIVITIES, MANPOWER_CATEGORIES, EQUIPMENT_CONDITIONS,
  CLEANLINESS, COMPLIANCE,
} from '../../utils/options';

/**
 * SiteInspectionStep — restyled to match ProjectEntry's design language:
 * - Compact Field wrapper with icon slot and inline error (ProjectEntry style)
 * - SectionHeader with collapsible toggle + mini SVG progress ring
 * - Coloured top-strip per card (indigo → emerald when complete)
 * - bg-slate-700/60 inputs replacing heavy glassmorphism panels
 * - Activity chips tightened to match card density
 * - Collapsible sections with slideDown reveal
 * - All logic identical to previous version
 */

const nowLocalISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

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
  const allDone = completedCount === totalCount;

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

/* ── Icon constants ─────────────────────────────────────────────────── */
const ClockIcon   = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PeopleIcon  = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const GearIcon    = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ShieldIcon  = <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const S = {
  cal:   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  cloud: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>,
  grid:  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  check: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

/* ─────────────────────────────────────────────────────────────────────
   Main component
────────────────────────────────────────────────────────────────────── */
export default function SiteInspectionStep({ onBack }) {
  const setSite  = useWizard((s) => s.setSite);
  const existing = useWizard((s) => s.site);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: existing || {
      inspection_datetime: nowLocalISO(),
      weather: 'Sunny',
      weather_other: '',
      activities: [],
      manpower:  [{ category: 'Skilled Workers', count: 0 }],
      equipment: [{ condition: 'Good', remarks: '' }],
      site_cleanliness: 'Clean',
      compliance_status: 'Fully Compliant',
      compliance_remarks: '',
    },
  });

  const mp = useFieldArray({ control, name: 'manpower' });
  const eq = useFieldArray({ control, name: 'equipment' });

  const watchedValues = watch();
  const compliance    = watchedValues.compliance_status;
  const weather       = watchedValues.weather;

  const [expanded, setExpanded] = useState({
    conditions: true,
    manpower:   true,
    equipment:  true,
    compliance: true,
  });
  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  /* completion counters */
  const condDone = [
    watchedValues.inspection_datetime,
    watchedValues.weather,
    watchedValues.activities?.length > 0 ? 'ok' : '',
  ].filter(Boolean).length;

  const compDone = [
    watchedValues.site_cleanliness,
    watchedValues.compliance_status,
    compliance !== 'Fully Compliant' ? (watchedValues.compliance_remarks?.trim() || '') : 'ok',
  ].filter(Boolean).length;

  const onSubmit = (data) => setSite(data);

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
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Step 02 — Operational Data</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Site Inspection</h2>
        <p className="text-white/40 text-sm font-medium">Record current site conditions, activities, and resource distribution.</p>
      </div>

      {/* ── Section 1: General Conditions ──────────────────────────── */}
      <SectionCard sectionKey="conditions" allDone={condDone === 3} animDelay="80ms">
        <SectionHeader
          title="General Conditions" subtitle="Temporal and environmental context"
          icon={ClockIcon} sectionKey="conditions"
          expanded={expanded.conditions} onToggle={toggle}
          completedCount={condDone} totalCount={3}
        />
        {expanded.conditions && (
          <div className="space-y-5" style={{ animation: 'slideDown 0.25s ease-out' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Date & Time *" error={errors.inspection_datetime?.message} icon={S.cal}>
                <input type="datetime-local" className={inputClass}
                  {...register('inspection_datetime', { required: 'Required' })} />
              </Field>
              <Field label="Weather Condition *" error={errors.weather?.message} icon={S.cloud}>
                <Sel {...register('weather', { required: 'Required' })}>
                  {WEATHER.map((w) => <option key={w}>{w}</option>)}
                </Sel>
              </Field>
              {weather === 'Others' && (
                <Field label="Specify Weather" full icon={S.cloud}>
                  <input className={inputClass} placeholder="Describe current weather..."
                    {...register('weather_other')} />
                </Field>
              )}
            </div>

            {/* Activities */}
            <Field label="Current Site Activities *" error={errors.activities?.message} full icon={S.grid}>
              <Controller
                control={control}
                name="activities"
                rules={{ validate: (v) => v.length > 0 || 'Select at least one activity' }}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-1">
                    {ACTIVITIES.map((a, idx) => {
                      const checked = field.value.includes(a);
                      return (
                        <label
                          key={a}
                          className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer transition-all duration-200 chip-enter
                            ${checked
                              ? 'bg-indigo-600/40 border-indigo-400/60 text-white shadow-md shadow-indigo-500/20 scale-[1.01]'
                              : 'bg-slate-700/40 border-white/12 text-white/60 hover:border-white/25 hover:bg-slate-700/60 hover:scale-[1.01]'}`}
                          style={{ animationDelay: `${idx * 25}ms` }}
                        >
                          <input type="checkbox" className="hidden" checked={checked}
                            onChange={() => field.onChange(
                              checked ? field.value.filter((x) => x !== a) : [...field.value, a]
                            )} />
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-200 flex-shrink-0
                            ${checked
                              ? 'bg-indigo-500 border-indigo-400 text-white'
                              : 'bg-white/8 border-white/20 group-hover:border-indigo-400/40'}`}>
                            {checked && (
                              <svg className="w-2.5 h-2.5 check-pop" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-tight">{a}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </Field>
          </div>
        )}
      </SectionCard>

      {/* ── Sections 2 & 3: Manpower + Equipment ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <SectionCard sectionKey="manpower" allDone={mp.fields.length > 0} animDelay="160ms">
          <SectionHeader
            title="Manpower" subtitle="Personnel distribution"
            icon={PeopleIcon} sectionKey="manpower"
            expanded={expanded.manpower} onToggle={toggle}
            completedCount={mp.fields.length > 0 ? 1 : 0} totalCount={1}
          />
          {expanded.manpower && (
            <div style={{ animation: 'slideDown 0.25s ease-out' }}>
              <div className="space-y-3 mb-4">
                {mp.fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-12 gap-2 items-center row-slide-left" style={{ animationDelay: `${i * 35}ms` }}>
                    <div className="col-span-7">
                      <Sel {...register(`manpower.${i}.category`, { required: true })}>
                        {MANPOWER_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </Sel>
                    </div>
                    <div className="col-span-4">
                      <input type="number" min="0" className={inputClass}
                        {...register(`manpower.${i}.count`, { required: true, valueAsNumber: true, min: 0 })} />
                    </div>
                    <button type="button"
                      className="col-span-1 flex justify-center text-rose-400/70 hover:text-rose-300 transition-all p-1.5 rounded-lg hover:bg-rose-500/15 active:scale-90"
                      onClick={() => mp.remove(i)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button"
                className="group w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/25 transition-all active:scale-95"
                onClick={() => mp.append({ category: 'Laborers', count: 0 })}>
                <svg className="w-3 h-3 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Add Row
              </button>
            </div>
          )}
        </SectionCard>

        <SectionCard sectionKey="equipment" allDone={eq.fields.length > 0} animDelay="200ms">
          <SectionHeader
            title="Equipment" subtitle="Machinery status"
            icon={GearIcon} sectionKey="equipment"
            expanded={expanded.equipment} onToggle={toggle}
            completedCount={eq.fields.length > 0 ? 1 : 0} totalCount={1}
          />
          {expanded.equipment && (
            <div style={{ animation: 'slideDown 0.25s ease-out' }}>
              <div className="space-y-3 mb-4">
                {eq.fields.map((f, i) => (
                  <div key={f.id} className="grid grid-cols-12 gap-2 items-start row-slide-right" style={{ animationDelay: `${i * 35}ms` }}>
                    <div className="col-span-4">
                      <Sel {...register(`equipment.${i}.condition`)}>
                        {EQUIPMENT_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                      </Sel>
                    </div>
                    <div className="col-span-7">
                      <input className={inputClass} placeholder="Remarks..."
                        {...register(`equipment.${i}.remarks`)} />
                    </div>
                    <button type="button"
                      className="col-span-1 mt-1 flex justify-center text-rose-400/70 hover:text-rose-300 transition-all p-1.5 rounded-lg hover:bg-rose-500/15 active:scale-90"
                      onClick={() => eq.remove(i)}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              <button type="button"
                className="group w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-400/25 text-indigo-300 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500/25 transition-all active:scale-95"
                onClick={() => eq.append({ condition: 'Good', remarks: '' })}>
                <svg className="w-3 h-3 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </button>
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Section 4: Compliance & Cleanliness ────────────────────── */}
      <SectionCard sectionKey="compliance" allDone={compDone === 3} animDelay="260ms">
        <SectionHeader
          title="Compliance & Cleanliness" subtitle="Standards and adherence"
          icon={ShieldIcon} sectionKey="compliance"
          expanded={expanded.compliance} onToggle={toggle}
          completedCount={Math.min(compDone, 3)} totalCount={3}
        />
        {expanded.compliance && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5" style={{ animation: 'slideDown 0.25s ease-out' }}>
            <Field label="Site Cleanliness *" error={errors.site_cleanliness?.message} icon={S.check}>
              <Sel {...register('site_cleanliness', { required: 'Required' })}>
                {CLEANLINESS.map((c) => <option key={c}>{c}</option>)}
              </Sel>
            </Field>
            <Field label="Compliance with Plans *" error={errors.compliance_status?.message} icon={S.check}>
              <Sel {...register('compliance_status', { required: 'Required' })}>
                {COMPLIANCE.map((c) => <option key={c}>{c}</option>)}
              </Sel>
            </Field>
            {compliance !== 'Fully Compliant' && (
              <Field label="Compliance Remarks *" error={errors.compliance_remarks?.message} full icon={S.grid}>
                <textarea
                  className={`${inputClass} border-rose-400/30 focus:ring-rose-500/60 focus:border-rose-400/60`}
                  rows="3"
                  placeholder="Explain the non-compliance issues..."
                  {...register('compliance_remarks', {
                    validate: (v) =>
                      compliance === 'Fully Compliant' || (v && v.trim().length) || 'Remarks are required for non-compliant status',
                  })}
                />
              </Field>
            )}
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
              Continue to Safety
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

        .chip-enter {
          opacity: 0;
          animation: chipFade .3s ease-out forwards;
        }
        @keyframes chipFade {
          from { opacity:0; transform:scale(.94); }
          to   { opacity:1; transform:scale(1);   }
        }

        .check-pop { animation: checkPop .28s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes checkPop {
          from { opacity:0; transform:scale(.3) rotate(-15deg); }
          to   { opacity:1; transform:scale(1)  rotate(0deg);   }
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
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(0.7); cursor: pointer; opacity: 0.5;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { opacity: 0.3; }
      `}</style>
    </form>
  );
}
