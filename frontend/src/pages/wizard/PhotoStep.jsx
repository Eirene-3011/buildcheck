import { useState } from 'react';
import { useWizard } from '../../store/wizard';

/* ─────────────────────────────────────────────────────────────────────
   PhotoStep — restyled to match SiteInspectionStep design language
────────────────────────────────────────────────────────────────────── */

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

export default function PhotoStep({ onBack }) {
  const setPhotos = useWizard((s) => s.setPhotos);
  const existing  = useWizard((s) => s.photos);
  const [files, setFiles]         = useState(existing || []);
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (list) => {
    const valid = list.filter((f) => /image\/(jpeg|png|jpg)/.test(f.type) && f.size <= 5 * 1024 * 1024);
    if (valid.length !== list.length)
      alert('Some files were rejected. Only JPG/PNG up to 5MB are allowed.');
    setFiles((prev) => {
      const combined = [...prev, ...valid];
      return combined.slice(0, 10);
    });
  };

  const onChange    = (e)  => processFiles(Array.from(e.target.files || []));
  const onDragOver  = (e)  => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = ()   => setIsDragging(false);
  const onDrop      = (e)  => { e.preventDefault(); setIsDragging(false); processFiles(Array.from(e.dataTransfer.files || [])); };
  const removeFile  = (i)  => setFiles(files.filter((_, idx) => idx !== i));

  const pct     = Math.round((files.length / 10) * 100);
  const allDone = files.length > 0;

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
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Step 04 — Documentation</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">Photo Documentation</h2>
        <p className="text-white/40 text-sm font-medium">Capture and upload visual evidence of the site inspection.</p>
      </div>

      {/* ── Upload card ─────────────────────────────────────────────── */}
      <SectionCard sectionKey="upload" allDone={allDone} animDelay="80ms">

        {/* Dropzone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative group cursor-pointer transition-all duration-300 rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-10 px-6 text-center
            ${isDragging
              ? 'border-indigo-400/80 bg-indigo-500/15 scale-[0.995] shadow-lg shadow-indigo-500/20'
              : 'border-white/15 bg-white/3 hover:border-indigo-400/40 hover:bg-white/6'
            }`}
        >
          <input
            type="file" multiple accept="image/jpeg,image/png,image/jpg"
            onChange={onChange}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
          />

          {/* Icon */}
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 backdrop-blur-md border
            ${isDragging
              ? 'bg-gradient-to-br from-indigo-600/60 to-blue-600/60 border-indigo-400/50 text-white rotate-6 scale-110'
              : 'bg-gradient-to-br from-indigo-500/25 to-blue-500/25 border-white/15 text-white/70 group-hover:border-white/30 group-hover:scale-105'
            }`}>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <h3 className="text-base font-black text-white tracking-tight uppercase mb-1">
            {isDragging ? '✓ Drop to Upload' : 'Click or Drag Photos'}
          </h3>
          <p className="text-[10px] font-black text-white/35 uppercase tracking-widest">
            JPG / PNG · Max 5 MB each · Up to 10 photos
          </p>

          {/* Progress bar */}
          {files.length > 0 && (
            <div className="mt-6 w-full max-w-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Uploaded</span>
                <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">{files.length} / 10</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: pct === 100 ? 'linear-gradient(90deg,#10b981,#34d399)' : 'linear-gradient(90deg,#6366f1,#3b82f6)',
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Gallery ─────────────────────────────────────────────── */}
        {files.length > 0 && (
          <div className="mt-5 space-y-4" style={{ animation: 'slideDown 0.25s ease-out' }}>

            {/* Gallery header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Selected Assets</span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  files.length === 10
                    ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400'
                    : 'bg-white/5 border-white/10 text-white/30'
                }`}>{files.length}/10</span>
              </div>
              <button
                onClick={() => setFiles([])}
                className="flex items-center gap-1.5 text-[10px] font-black text-rose-400/70 uppercase tracking-widest px-2.5 py-1.5 rounded-lg hover:bg-rose-500/15 hover:text-rose-300 transition-all active:scale-95"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="group/item relative aspect-square rounded-xl overflow-hidden border border-white/15 hover:border-indigo-400/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-500/20 chip-enter"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <img
                    src={URL.createObjectURL(f)}
                    alt={f.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/20 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
                    <div className="flex justify-end">
                      <button
                        onClick={() => removeFile(i)}
                        className="w-6 h-6 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center transition-all active:scale-90 border border-rose-400/40"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-white truncate leading-tight">{f.name}</p>
                      <p className="text-[8px] font-black text-indigo-300 uppercase tracking-widest mt-0.5">{(f.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>

                  {/* Index badge */}
                  <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-slate-900/70 backdrop-blur-sm border border-white/15 flex items-center justify-center text-[8px] font-black text-white/60 group-hover/item:opacity-0 transition-opacity duration-200">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────────── */}
        {files.length === 0 && (
          <p className="text-center text-[11px] font-bold text-white/25 uppercase tracking-widest mt-5">
            No photos selected — upload images to document the inspection
          </p>
        )}
      </SectionCard>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl border border-white/10 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-xl module-enter"
        style={{
          background: 'linear-gradient(135deg,rgba(255,255,255,.07),rgba(255,255,255,.03))',
          animationDelay: '200ms',
        }}
      >
        <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest">
          <span className="text-indigo-400 mr-1.5">↑</span>JPG / PNG · max 5 MB · up to 10 photos
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
            onClick={() => setPhotos(files)}
            disabled={files.length === 0}
            className="group flex-[2] md:flex-none px-10 py-3 rounded-xl text-white font-black uppercase tracking-wider text-xs transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 border border-white/20 relative overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
            style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Continue
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

        .btn-shimmer {
          background: linear-gradient(105deg,transparent 0%,rgba(255,255,255,0) 38%,rgba(255,255,255,.14) 50%,rgba(255,255,255,0) 62%,transparent 100%);
          background-size: 200% 100%;
          background-position: 200% center;
          transition: background-position .5s ease;
        }
        button:hover .btn-shimmer { background-position: -200% center; }

        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
      `}</style>
    </div>
  );
}
