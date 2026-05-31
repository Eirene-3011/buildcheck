import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useWizard } from '../store/wizard';
import StepIndicator from '../components/StepIndicator';

const PROCUREMENT_MODES = [
  'Public Bidding',
  'Small Value Procurement',
  'Shopping',
  'Negotiated Procurement',
  'Direct Contracting',
  'Repeat Order',
  'Limited Source Bidding',
];

const PROJECT_STATUSES = ['Ongoing', 'Completed', 'Suspended', 'Terminated', 'Pending'];

const STATUS_COLORS = {
  Ongoing:    { from: '#3b82f6', to: '#22d3ee' },
  Completed:  { from: '#10b981', to: '#34d399' },
  Suspended:  { from: '#f59e0b', to: '#fb923c' },
  Terminated: { from: '#f43f5e', to: '#fb7185' },
  Pending:    { from: '#8b5cf6', to: '#a78bfa' },
};

// ─── Completion tracker ───────────────────────────────────────────────────────
const REQUIRED_FIELDS = [
  'year','ref_number','name',
  'location_id','person_in_charge','contractor','mode_of_procurement',
  'funding_source','project_status','duration',
  'approved_budget','contract_amount','revised_contract_amount',
  'start_date','target_completion_date','revised_expiry_date',
];

const SECTIONS = {
  identity:   ['year','ref_number','name'],
  logistics:  ['location_id','person_in_charge','contractor','mode_of_procurement'],
  financials: ['funding_source','project_status','duration','approved_budget','contract_amount','revised_contract_amount'],
  timeline:   ['start_date','target_completion_date','revised_expiry_date'],
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
const Field = ({ label, children, error, full, icon }) => (
  <div className={`${full ? 'md:col-span-2' : ''} space-y-2`}>
    <label className="flex items-center gap-1.5 text-[10px] font-black text-white/50 uppercase tracking-[0.18em] ml-0.5">
      {icon && <span className="text-indigo-400/80">{icon}</span>}
      {label}
    </label>
    <div className="relative">{children}</div>
    {error && (
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-400 ml-0.5" style={{ animation: 'slideDown 0.2s ease-out' }}>
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {error}
      </div>
    )}
  </div>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, subtitle, icon, section, expanded, onToggle, completedCount, totalCount }) => {
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allDone = completedCount === totalCount;

  return (
    <button
      type="button"
      onClick={() => onToggle(section)}
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
            : icon
          }
        </div>
        <div className="text-left flex-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-black text-white tracking-tight uppercase">{title}</h3>
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              allDone
                ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                : 'bg-white/5 border-white/10 text-white/30'
            }`}>
              {completedCount}/{totalCount}
            </span>
          </div>
          <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Mini progress ring */}
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

// ─── Overall progress bar ─────────────────────────────────────────────────────
const OverallProgress = ({ watchedValues }) => {
  const filled = REQUIRED_FIELDS.filter(f => {
    const v = watchedValues[f];
    return v !== undefined && v !== '' && v !== null;
  }).length;
  const pct = Math.round((filled / REQUIRED_FIELDS.length) * 100);

  return (
    <div
      className="rounded-2xl px-6 py-4 border border-white/10 backdrop-blur-xl"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Form Completion</p>
          <p className="text-sm font-black text-white mt-0.5">{filled} of {REQUIRED_FIELDS.length} fields filled</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black" style={{
            background: pct === 100 ? 'linear-gradient(135deg, #10b981, #34d399)' : 'linear-gradient(135deg, #6366f1, #3b82f6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{pct}%</span>
        </div>
      </div>
      <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden border border-white/5">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: pct === 100
              ? 'linear-gradient(90deg, #10b981, #34d399)'
              : 'linear-gradient(90deg, #6366f1, #3b82f6)',
            boxShadow: pct === 100 ? '0 0 12px #10b98166' : '0 0 12px #6366f166',
          }}
        />
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProjectEntry() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      variation_orders: 0,
      year: new Date().getFullYear(),
      project_status: 'Ongoing',
    },
  });
  const navigate = useNavigate();
  const setProjectId = useWizard((s) => s.setProjectId);

  const [locations, setLocations] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [expanded, setExpanded] = useState({ identity: true, logistics: true, financials: true, timeline: true });

  useEffect(() => {
    api.get('/projects/lookup/locations').then(r => setLocations(r.data)).catch(() => {});
    api.get('/projects/lookup/inspectors').then(r => setInspectors(r.data)).catch(() => {});
  }, []);

  const watchedValues = watch();
  const start = watchedValues.start_date;
  const selectedStatus = watchedValues.project_status || 'Ongoing';
  const statusColor = STATUS_COLORS[selectedStatus] || STATUS_COLORS.Ongoing;

  const onSubmit = async (data) => {
    try {
      const { data: res } = await api.post('/projects', {
        ...data,
        year: Number(data.year),
        location_id: Number(data.location_id),
        approved_budget: Number(data.approved_budget),
        contract_amount: Number(data.contract_amount),
        variation_orders: Number(data.variation_orders),
        revised_contract_amount: Number(data.revised_contract_amount),
      });
      setProjectId(res.id);
      navigate('/inspection');
    } catch (e) {
      alert(e.response?.data?.error || 'Failed to create project');
    }
  };

  const toggleSection = (section) => setExpanded(prev => ({ ...prev, [section]: !prev[section] }));

  const getSectionCompletion = (section) => {
    const fields = SECTIONS[section];
    const filled = fields.filter(f => {
      const v = watchedValues[f];
      return v !== undefined && v !== '' && v !== null;
    }).length;
    return { filled, total: fields.length };
  };

  const inputClass = `block w-full px-4 py-3 rounded-xl text-white font-semibold placeholder:text-white/40
    focus:outline-none focus:ring-2 focus:ring-indigo-500/70 focus:border-indigo-400/60
    transition-all duration-300 hover:border-white/30 text-sm
    bg-slate-700/60 backdrop-blur-md border border-white/20`;

  const selectClass = `${inputClass} appearance-none cursor-pointer [&>option]:bg-slate-800 [&>option]:text-white`;

  const sections = [
    {
      key: 'identity',
      title: 'Project Identity',
      subtitle: 'Basic identification and naming',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0a2 2 0 012-2h2a2 2 0 012 2v1" /></svg>,
    },
    {
      key: 'logistics',
      title: 'Logistics & Personnel',
      subtitle: 'Location and responsible officers',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      key: 'financials',
      title: 'Financials & Status',
      subtitle: 'Budget allocation and current state',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
    {
      key: 'timeline',
      title: 'Project Timeline',
      subtitle: 'Key dates and milestones',
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
  ];

  return (
    <div className="min-h-screen pb-20 relative">
      {/* ── Header ── */}
      <div
        className="relative z-10 border-b border-white/8 mb-8"
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)', backdropFilter: 'blur(20px)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div style={{ animation: 'slideDown 0.7s ease-out both' }}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/15 mb-4"
                style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(59,130,246,0.15))' }}
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Project Initialization</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">New Project Entry</h1>
              <p className="text-white/40 text-sm font-medium mt-2">Initialize a new construction project with comprehensive details.</p>
            </div>
            <div className="hidden md:block" style={{ animation: 'slideDown 0.7s ease-out 0.1s both' }}>
              <StepIndicator current={1} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Layout: sidebar + form ── */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Sticky Sidebar ── */}
          <div className="w-full lg:w-60 flex-shrink-0 lg:sticky lg:top-6 flex flex-col gap-4" style={{ animation: 'slideUp 0.6s ease-out 0.1s both' }}>
            {/* Overall progress */}
            <OverallProgress watchedValues={watchedValues} />

            {/* Section nav pills */}
            <div
              className="rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)' }}
            >
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest px-4 pt-4 pb-2">Sections</p>
              {sections.map((s, i) => {
                const { filled, total } = getSectionCompletion(s.key);
                const done = filled === total;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      if (!expanded[s.key]) toggleSection(s.key);
                      document.getElementById(`section-${s.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 border-t border-white/5 hover:bg-white/5 ${i === 0 ? 'border-t-0' : ''}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${done ? 'bg-emerald-400' : 'bg-white/20'}`} />
                    <span className={`text-xs font-bold truncate ${done ? 'text-emerald-300' : 'text-white/50'}`}>{s.title}</span>
                    <span className={`ml-auto text-[9px] font-black flex-shrink-0 ${done ? 'text-emerald-400' : 'text-white/25'}`}>{filled}/{total}</span>
                  </button>
                );
              })}
            </div>

            {/* Status preview */}
            <div
              className="rounded-2xl border border-white/10 p-4 backdrop-blur-xl"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)' }}
            >
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">Status Preview</p>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                style={{
                  background: `linear-gradient(135deg, ${statusColor.from}20, ${statusColor.to}10)`,
                  borderColor: `${statusColor.from}40`,
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse flex-shrink-0" style={{ background: statusColor.from }} />
                <span className="text-xs font-black" style={{ color: statusColor.from }}>{selectedStatus}</span>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="flex-1 min-w-0" style={{ animation: 'slideUp 0.6s ease-out 0.2s both' }}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* ── Section cards ── */}
              {sections.map((s) => {
                const { filled, total } = getSectionCompletion(s.key);
                return (
                  <div
                    key={s.key}
                    id={`section-${s.key}`}
                    className="rounded-2xl border border-white/10 overflow-hidden backdrop-blur-xl scroll-mt-6"
                    style={{ background: 'linear-gradient(160deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)' }}
                  >
                    {/* Colored top strip per section */}
                    <div className="h-0.5 w-full" style={{
                      background: filled === total
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : 'linear-gradient(90deg, #6366f188, #3b82f622)'
                    }} />

                    <div className="p-6">
                      <SectionHeader
                        title={s.title}
                        subtitle={s.subtitle}
                        icon={s.icon}
                        section={s.key}
                        expanded={expanded[s.key]}
                        onToggle={toggleSection}
                        completedCount={filled}
                        totalCount={total}
                      />

                      {expanded[s.key] && (
                        <div style={{ animation: 'slideDown 0.25s ease-out' }}>
                          {/* ── Identity fields ── */}
                          {s.key === 'identity' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                              <Field label="Fiscal Year *" error={errors.year?.message}
                                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                                <input type="number" min="2000" max="2100" className={inputClass}
                                  {...register('year', { required: 'Required', min: 2000, max: 2100 })} />
                              </Field>
                              <Field label="Reference Number *" error={errors.ref_number?.message} full
                                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}>
                                <input className={inputClass} placeholder="e.g. 2026-001-CONST"
                                  {...register('ref_number', { required: 'Required' })} />
                              </Field>
                              <Field label="Project Name *" error={errors.name?.message} full
                                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                                <input className={inputClass} placeholder="Enter full project title…"
                                  {...register('name', { required: 'Required' })} />
                              </Field>
                            </div>
                          )}

                          {/* ── Logistics fields ── */}
                          {s.key === 'logistics' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <Field label="Project Location *" error={errors.location_id?.message}
                                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}>
                                <div className="relative">
                                  <select className={selectClass} {...register('location_id', { required: 'Required' })}>
                                    <option value="">— Select location —</option>
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                  </select>
                                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                              </Field>
                              <Field label="Person-In-Charge *" error={errors.person_in_charge?.message}
                                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}>
                                <input list="inspector-list" className={inputClass} placeholder="Type or pick from roster"
                                  {...register('person_in_charge', { required: 'Required' })} />
                                <datalist id="inspector-list">
                                  {inspectors.map(i => <option key={i.id} value={i.name} />)}
                                </datalist>
                              </Field>
                              <Field label="Contractor *" error={errors.contractor?.message}
                                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}>
                                <input className={inputClass} placeholder="e.g. R.M. Mangubat Construction"
                                  {...register('contractor', { required: 'Required' })} />
                              </Field>
                              <Field label="Mode of Procurement *" error={errors.mode_of_procurement?.message}
                                icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}>
                                <div className="relative">
                                  <select className={selectClass} {...register('mode_of_procurement', { required: 'Required' })}>
                                    <option value="">— Select mode —</option>
                                    {PROCUREMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                  </select>
                                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                </div>
                              </Field>
                            </div>
                          )}

                          {/* ── Financials fields ── */}
                          {s.key === 'financials' && (
                            <div className="space-y-5">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <Field label="Funding Source *" error={errors.funding_source?.message}
                                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}>
                                  <input className={inputClass} placeholder="e.g. Fund 101 / GAA 2026"
                                    {...register('funding_source', { required: 'Required' })} />
                                </Field>
                                <Field label="Project Status *" error={errors.project_status?.message}
                                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                                  <div className="relative">
                                    <select className={selectClass} {...register('project_status', { required: 'Required' })}>
                                      {PROJECT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                    <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                  </div>
                                </Field>
                                <Field label="Duration (Days) *" error={errors.duration?.message}
                                  icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}>
                                  <input type="number" className={inputClass} placeholder="e.g. 180"
                                    {...register('duration', { required: 'Required' })} />
                                </Field>
                              </div>

                              {/* Budget trio with comparison */}
                              <div
                                className="rounded-xl p-4 border border-white/8"
                                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)' }}
                              >
                                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-4">Budget Breakdown</p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                  {[
                                    { field: 'approved_budget', label: 'Approved Budget (ABC) *', err: errors.approved_budget },
                                    { field: 'contract_amount', label: 'Contract Amount *', err: errors.contract_amount },
                                    { field: 'revised_contract_amount', label: 'Revised Amount *', err: errors.revised_contract_amount },
                                  ].map(({ field, label, err }) => (
                                    <Field key={field} label={label} error={err?.message}
                                      icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}>
                                      <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm">₱</span>
                                        <input type="number" step="0.01" className={`${inputClass} pl-8`}
                                          {...register(field, { required: 'Required', min: 0 })} />
                                      </div>
                                    </Field>
                                  ))}
                                </div>
                                {/* Budget comparison bar */}
                                {watchedValues.approved_budget && watchedValues.contract_amount && (
                                  <div className="mt-4 pt-4 border-t border-white/8">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Contract vs ABC</span>
                                      <span className={`text-[10px] font-black ${
                                        Number(watchedValues.contract_amount) > Number(watchedValues.approved_budget)
                                          ? 'text-rose-400' : 'text-emerald-400'
                                      }`}>
                                        {Number(watchedValues.approved_budget) > 0
                                          ? `${Math.round((Number(watchedValues.contract_amount) / Number(watchedValues.approved_budget)) * 100)}%`
                                          : '—'}
                                      </span>
                                    </div>
                                    <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
                                      <div
                                        className="h-full rounded-full transition-all duration-700"
                                        style={{
                                          width: `${Math.min((Number(watchedValues.contract_amount) / Number(watchedValues.approved_budget)) * 100, 100)}%`,
                                          background: Number(watchedValues.contract_amount) > Number(watchedValues.approved_budget)
                                            ? 'linear-gradient(90deg, #f43f5e, #fb7185)'
                                            : 'linear-gradient(90deg, #10b981, #34d399)',
                                        }}
                                      />
                                    </div>
                                    <div className="flex justify-between mt-1.5 text-[9px] text-white/25 font-bold">
                                      <span>₱0</span>
                                      <span>ABC: ₱{Number(watchedValues.approved_budget).toLocaleString()}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ── Timeline fields ── */}
                          {s.key === 'timeline' && (
                            <div className="space-y-5">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {[
                                  { field: 'start_date', label: 'Date of Start *', err: errors.start_date, validate: undefined },
                                  { field: 'target_completion_date', label: 'Target Completion *', err: errors.target_completion_date, validate: v => !start || v >= start || 'Must be after start date' },
                                  { field: 'revised_expiry_date', label: 'Revised Expiry *', err: errors.revised_expiry_date, validate: v => !start || v >= start || 'Must be after start date' },
                                ].map(({ field, label, err, validate }) => (
                                  <Field key={field} label={label} error={err?.message}
                                    icon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}>
                                    <input type="date" className={inputClass}
                                      {...register(field, { required: 'Required', validate })} />
                                  </Field>
                                ))}
                              </div>

                              {/* Visual timeline */}
                              {watchedValues.start_date && watchedValues.target_completion_date && (
                                <div
                                  className="rounded-xl p-4 border border-white/8"
                                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)' }}
                                >
                                  <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">Timeline Preview</p>
                                  <div className="flex items-center gap-3">
                                    <div className="text-center flex-shrink-0">
                                      <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Start</p>
                                      <p className="text-xs font-black text-white/70 mt-0.5">
                                        {new Date(watchedValues.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                      </p>
                                    </div>
                                    <div className="flex-1 flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
                                      <div className="flex-1 h-0.5 bg-gradient-to-r from-indigo-400/60 to-blue-400/30 relative mx-1">
                                        {(() => {
                                          const s = new Date(watchedValues.start_date);
                                          const e = new Date(watchedValues.target_completion_date);
                                          const now = new Date();
                                          const pct = Math.min(Math.max(((now - s) / (e - s)) * 100, 0), 100);
                                          return pct > 0 && pct < 100 ? (
                                            <div
                                              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 border-indigo-400 shadow-lg shadow-indigo-400/50"
                                              style={{ left: `${pct}%` }}
                                            />
                                          ) : null;
                                        })()}
                                      </div>
                                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                                    </div>
                                    <div className="text-center flex-shrink-0">
                                      <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Target</p>
                                      <p className="text-xs font-black text-white/70 mt-0.5">
                                        {new Date(watchedValues.target_completion_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                      </p>
                                    </div>
                                  </div>
                                  {(() => {
                                    const s = new Date(watchedValues.start_date);
                                    const e = new Date(watchedValues.target_completion_date);
                                    const days = Math.round((e - s) / (1000 * 60 * 60 * 24));
                                    return days > 0 ? (
                                      <p className="text-center text-[10px] font-bold text-white/30 mt-3">{days} calendar days</p>
                                    ) : null;
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* ── Footer ── */}
              <div
                className="rounded-2xl border border-white/10 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)' }}
              >
                <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
                  <span className="text-indigo-400 mr-1.5">*</span>All starred fields are mandatory
                </p>
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/8 border border-white/12 text-white/70 font-black uppercase tracking-wider text-xs hover:bg-white/12 hover:border-white/20 transition-all duration-300 active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] md:flex-none px-10 py-3 rounded-xl text-white font-black uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/20"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5, #2563eb)',
                      boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                    }}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin 0.8s linear infinite' }} />
                    ) : (
                      <>
                        Save & Continue
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        select option {
          background-color: #1e3a5f;
          color: #f1f5f9;
          font-weight: 600;
        }
        input::-webkit-calendar-picker-indicator {
          filter: invert(1) brightness(0.7);
          cursor: pointer;
          opacity: 0.5;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          opacity: 0.3;
        }
      `}</style>
    </div>
  );
}
