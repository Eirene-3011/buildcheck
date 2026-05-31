import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../store/auth';

/* ── Quick-fill credentials ─────────────────────────────────────────── */
const QUICK_CREDS = [
  { role: 'Admin',     email: 'admin@buildcheck.com',     pass: 'Admin@123',     color: '#6366f1' },
  { role: 'Inspector', email: 'inspector@buildcheck.com', pass: 'Inspector@123', color: '#3b82f6' },
];

/* ── Left-panel stats ───────────────────────────────────────────────── */
const STATS = [
  { value: '2,400+', label: 'Projects Tracked' },
  { value: '99.8%',  label: 'Uptime SLA' },
  { value: '150+',   label: 'Inspectors' },
];

const TAGS = [
  { label: 'Real-time Sync',  icon: '⚡' },
  { label: 'ISO Certified',   icon: '✓' },
  { label: 'Enterprise Grade', icon: '🛡' },
];

/* ─────────────────────────────────────────────────────────────────────
   Component
────────────────────────────────────────────────────────────────────── */
export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState('');
  const setAuth    = useAuth((s) => s.setAuth);
  const navigate   = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    try {
      const { data: res } = await api.post('/auth/login', data);
      setAuth(res.token, res.user);
      navigate('/');
    } catch (e) {
      setError(e.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCred = (cred) => {
    setValue('email',    cred.email);
    setValue('password', cred.pass);
  };

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#0a0f1e 0%,#0f172a 45%,#0d1829 100%)' }}
    >

      {/* ── Ambient background ──────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px]"
          style={{ background: 'radial-gradient(circle,rgba(79,70,229,0.22) 0%,transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/3 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.16) 0%,transparent 70%)' }} />
        <div className="absolute top-1/2 -right-20 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)' }} />
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
      </div>

      {/* ── Left brand panel ────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center p-14 overflow-hidden">
        {/* Diagonal separator */}
        <div className="absolute right-0 top-0 h-full w-24 pointer-events-none" style={{
          background: 'linear-gradient(to bottom right,transparent 49.9%,rgba(255,255,255,0.025) 50%)',
        }} />

        <div className="relative z-10 max-w-lg w-full panel-enter">

          {/* Logo */}
          <div className="flex items-center gap-4 mb-14">
            <div className="relative w-12 h-12 rounded-xl flex items-center justify-center border border-white/20 overflow-hidden"
              style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)', boxShadow: '0 4px 20px rgba(79,70,229,0.5)' }}>
              <svg className="w-6 h-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="absolute inset-0 logo-shimmer" />
              {/* Live dot */}
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0a0f1e]">
                <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
              </span>
            </div>
            <div>
              <p className="text-lg font-black text-white tracking-tight leading-tight">BuildCheck</p>
              <p className="text-[9px] font-bold text-white/35 uppercase tracking-[0.2em]">Monitor</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="mb-10">
            <h1 className="text-[58px] font-black leading-[1.0] tracking-tight text-white mb-5">
              Precision in<br />
              <span style={{
                background: 'linear-gradient(135deg,#818cf8 0%,#60a5fa 50%,#38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Construction</span><br />
              Monitoring.
            </h1>
            <p className="text-white/40 text-base font-medium leading-relaxed max-w-sm">
              The industry-standard platform for real-time inspection tracking and portfolio intelligence.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mb-12">
            {TAGS.map((tag) => (
              <div key={tag.label} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/45 backdrop-blur-md"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <span className="text-xs">{tag.icon}</span>
                {tag.label}
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="rounded-2xl p-4 border border-white/8 stat-enter"
                style={{
                  background: 'linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)',
                  animationDelay: `${0.4 + i * 0.1}s`,
                }}
              >
                <p className="text-2xl font-black text-white tracking-tight">{stat.value}</p>
                <p className="text-[9px] font-bold text-white/35 uppercase tracking-widest mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right login panel ────────────────────────────────────────── */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-6 sm:p-10 relative z-10">
        <div className="w-full max-w-md form-enter">

          {/* Card */}
          <div
            className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60"
            style={{ background: 'linear-gradient(160deg,rgba(255,255,255,0.08) 0%,rgba(255,255,255,0.04) 100%)', backdropFilter: 'blur(24px)' }}
          >
            {/* Top colour strip */}
            <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg,#6366f188,#3b82f622)' }} />

            <div className="p-8 sm:p-9">

              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/20 overflow-hidden relative"
                  style={{ background: 'linear-gradient(135deg,#4f46e5,#2563eb)' }}>
                  <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="absolute inset-0 logo-shimmer" />
                </div>
                <p className="text-base font-black text-white tracking-tight">BuildCheck Monitor</p>
              </div>

              {/* Heading */}
              <div className="mb-7">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/12 mb-4"
                  style={{ background: 'linear-gradient(135deg,rgba(99,102,241,.15),rgba(59,130,246,.10))' }}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Secure Access</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
                <p className="text-white/35 text-sm font-medium mt-1">Sign in to access your command center.</p>
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-center gap-3 p-3.5 rounded-xl mb-5 border border-rose-500/30 text-rose-200 text-xs font-bold error-shake"
                  style={{ background: 'rgba(244,63,94,0.10)' }}>
                  <svg className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                {/* Email */}
                <InputField
                  label="Email Address"
                  error={errors.email?.message}
                  focused={focused === 'email'}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                >
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                    placeholder="name@company.com"
                    className="block w-full pl-11 pr-4 py-3.5 bg-transparent text-white font-semibold text-sm placeholder:text-white/25 focus:outline-none"
                  />
                </InputField>

                {/* Password */}
                <InputField
                  label="Password"
                  error={errors.password?.message}
                  focused={focused === 'password'}
                  labelRight={
                    <button type="button" className="text-[10px] font-black text-indigo-400/70 hover:text-indigo-300 uppercase tracking-wider transition-colors">
                      Forgot?
                    </button>
                  }
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                >
                  <input
                    type={showPass ? 'text' : 'password'}
                    {...register('password', { required: 'Password is required' })}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused('')}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-12 py-3.5 bg-transparent text-white font-semibold text-sm placeholder:text-white/25 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/8 transition-all"
                  >
                    {showPass ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </InputField>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full py-3.5 rounded-xl text-white font-black uppercase tracking-widest text-xs transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden border border-white/15 mt-2"
                  style={{
                    background: 'linear-gradient(135deg,#4f46e5,#2563eb)',
                    boxShadow: loading ? 'none' : '0 4px 20px rgba(79,70,229,0.45)',
                  }}
                >
                  <span className={`flex items-center justify-center gap-2 transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                    Sign In to Dashboard
                    <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-5 h-5 animate-spin text-white/70" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute inset-0 btn-shimmer pointer-events-none" />
                </button>
              </form>
            </div>
          </div>

          {/* ── Quick-access credentials ─────────────────────────────── */}
          <div
            className="mt-3 rounded-2xl border border-white/8 p-4 backdrop-blur-xl"
            style={{ background: 'linear-gradient(135deg,rgba(255,255,255,0.05) 0%,rgba(255,255,255,0.02) 100%)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
              </span>
              <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.2em]">Quick Access Credentials</p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {QUICK_CREDS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => fillCred(cred)}
                  className="text-left p-3 rounded-xl border border-white/8 hover:border-white/18 hover:bg-white/5 transition-all duration-200 active:scale-95 group"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cred.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: cred.color }}>{cred.role}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-white/45 truncate mb-1.5">{cred.email}</p>
                  <code className="text-[10px] font-black text-white/55 bg-white/5 px-2 py-0.5 rounded border border-white/8">{cred.pass}</code>
                  <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1.5 group-hover:text-white/35 transition-colors">Click to fill →</p>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[9px] text-white/18 font-bold uppercase tracking-widest mt-4">
            BuildCheck Monitor &copy; {new Date().getFullYear()} · Construction Inspection Platform
          </p>
        </div>
      </div>

      {/* ── CSS ─────────────────────────────────────────────────────── */}
      <style>{`
        .panel-enter {
          animation: slideInLeft 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        .form-enter {
          animation: slideInRight 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        .stat-enter {
          opacity: 0;
          animation: statPop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        @keyframes slideInLeft {
          from { opacity:0; transform:translateX(-32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(32px); }
          to   { opacity:1; transform:translateX(0); }
        }
        @keyframes statPop {
          from { opacity:0; transform:translateY(10px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1); }
        }

        .error-shake { animation: shake 0.35s ease-in-out; }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          20%     { transform:translateX(-5px); }
          50%     { transform:translateX(5px); }
          80%     { transform:translateX(-3px); }
        }

        .logo-shimmer {
          background: linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.18) 50%,transparent 70%);
          background-size: 200% 100%;
          background-position: 200% center;
          transition: background-position 0.5s ease;
        }
        a:hover .logo-shimmer,
        button:hover .logo-shimmer { background-position: -200% center; }

        .btn-shimmer {
          background: linear-gradient(105deg,transparent 0%,rgba(255,255,255,0) 38%,rgba(255,255,255,0.14) 50%,rgba(255,255,255,0) 62%,transparent 100%);
          background-size: 200% 100%;
          background-position: 200% center;
          transition: background-position 0.5s ease;
        }
        button:hover .btn-shimmer { background-position: -200% center; }
      `}</style>
    </div>
  );
}

/* ── Reusable input field wrapper ────────────────────────────────────── */
function InputField({ label, labelRight, icon, error, focused, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between ml-0.5">
        <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.18em]">{label}</label>
        {labelRight}
      </div>
      <div
        className="relative rounded-xl border transition-all duration-200 overflow-hidden"
        style={{
          background: 'rgba(15,23,42,0.7)',
          borderColor: focused
            ? 'rgba(99,102,241,0.65)'
            : error
            ? 'rgba(244,63,94,0.50)'
            : 'rgba(255,255,255,0.10)',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.13)' : 'none',
        }}
      >
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
          style={{ color: focused ? '#818cf8' : 'rgba(255,255,255,0.22)' }}
        >
          {icon}
        </div>
        {children}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 ml-0.5" style={{ animation: 'slideDown 0.2s ease-out' }}>
          <svg className="w-3 h-3 text-rose-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-wider">{error}</p>
        </div>
      )}
      <style>{`
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-4px); }
          to   { opacity:1; transform:translateY(0); }
        }
      `}</style>
    </div>
  );
}
