import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield, Mail, Lock, User, Briefcase, AlertCircle, Hash,
  MapPin, BookOpen, ArrowLeft, ArrowRight, Eye, EyeOff,
  CheckCircle, Sparkles, FileText, Scale, Brain
} from 'lucide-react';

/* ── Floating label input ── */
function FloatingInput({ id, label, type = 'text', icon: Icon, value, onChange, required, autoComplete, placeholder, min, max, rows }) {
  const [focused, setFocused] = useState(false);
  const [show, setShow] = useState(false);
  const active = focused || value;
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  if (rows) {
    return (
      <div className="relative">
        <label htmlFor={id}
          className={`absolute left-4 transition-all duration-200 pointer-events-none font-medium z-10 ${active ? 'top-2 text-[10px] text-violet-400' : 'top-4 text-sm text-slate-500'}`}>
          {label}
        </label>
        <textarea id={id} rows={rows} value={value} onChange={onChange} placeholder={focused ? placeholder : ''}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full bg-[#0d1528] border border-white/[0.08] focus:border-violet-500/60 rounded-xl px-4 pt-7 pb-3 text-white text-sm outline-none resize-none transition-all leading-relaxed focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]" />
      </div>
    );
  }

  return (
    <div className="relative">
      {Icon && <Icon size={15} className={`absolute left-4 transition-colors ${active ? 'top-5 text-violet-400' : 'top-1/2 -translate-y-1/2 text-slate-600'}`} />}
      <label htmlFor={id}
        className={`absolute transition-all duration-200 pointer-events-none font-medium z-10 ${Icon ? 'left-10' : 'left-4'} ${active ? 'top-2 text-[10px] text-violet-400' : 'top-1/2 -translate-y-1/2 text-sm text-slate-500'}`}>
        {label}
      </label>
      <input id={id} type={inputType} value={value} onChange={onChange} required={required}
        autoComplete={autoComplete} placeholder={focused ? placeholder : ''}
        min={min} max={max}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        className={`w-full bg-[#0d1528] border border-white/[0.08] focus:border-violet-500/60 rounded-xl px-4 pt-7 pb-3 text-white text-sm outline-none transition-all focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] ${Icon ? 'pl-10' : ''} ${isPassword ? 'pr-10' : ''}`} />
      {isPassword && (
        <button type="button" tabIndex={-1}
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors">
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [barCouncilId, setBarCouncilId] = useState('');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const { login } = useAuth();
  const isRegister = mode !== 'login';
  const isLawyer = mode === 'register-lawyer';

  const TABS = [
    { id: 'login', label: 'Sign In' },
    { id: 'register-client', label: 'Client' },
    { id: 'register-lawyer', label: 'Lawyer' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        const body = { email, password, full_name: fullName, role: isLawyer ? 'lawyer' : 'client' };
        if (isLawyer) Object.assign(body, { specialization, bar_council_id: barCouncilId, experience_yrs: parseInt(experience) || null, location, bio });
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/auth/register`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        setSuccess(isLawyer
          ? 'Lawyer account created! Pending admin approval — you will be notified once approved.'
          : 'Client account created! Please sign in below.');
        setMode('login'); setPassword('');
      }
    } catch (err) {
      const isPending = err.response?.data?.pending_approval;
      setError(isPending ? 'Your lawyer account is pending admin approval. Check back soon.' : (err.message || 'Something went wrong.'));
    } finally { setLoading(false); }
  };



  /* ── Left-panel feature bullets ── */
  const bullets = [
    { icon: Brain, text: 'AI clause extraction with spaCy NLP' },
    { icon: Scale, text: 'Indian Contract Act compliance checks' },
    { icon: AlertCircle, text: 'Weighted risk scoring on 50+ keywords' },
    { icon: FileText, text: 'Plain-English summaries via Groq LLM' },
  ];

  return (
    <div className="min-h-screen bg-[#050812] flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── LEFT PANEL (desktop only) ── */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-gradient-to-b from-[#09091a] to-[#0b0e25] border-r border-white/[0.05] relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute w-72 h-72 bg-violet-600/10 rounded-full blur-3xl -top-20 -left-20 pointer-events-none" />
        <div className="absolute w-64 h-64 bg-blue-600/8 rounded-full blur-3xl bottom-20 -right-10 pointer-events-none" />

        <div className="flex flex-col flex-1 p-10 relative z-10">
          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-16 group w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-shadow">
              <Shield size={17} className="text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">ContractShield <span className="text-violet-400 text-xs font-semibold">AI</span></span>
          </button>

          {/* Hero text */}
          <div className="mb-12">
            <h1 className="text-3xl font-extrabold text-white leading-tight mb-3">
              Legal intelligence<br />at your fingertips.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Upload a contract, get a risk score, understand every clause — in under 4 minutes.
              Built for the Indian legal system.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 mb-auto">
            {bullets.map(({ icon: I, text }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <I size={14} className="text-violet-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
              </div>
            ))}
          </div>

          {/* Mock risk card */}
          <div className="mt-10 bg-[#0d1426] border border-white/[0.07] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-500 text-xs">Sample Analysis</span>
              <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" /> Done
              </span>
            </div>
            <div className="flex items-end gap-3 mb-3">
              <span className="text-3xl font-extrabold text-amber-400">68</span>
              <span className="text-slate-600 mb-1">/100 · Medium Risk</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
              <div className="h-full w-[68%] bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            </div>
            <div className="space-y-1.5">
              {['Unlimited liability clause', 'Non-compete > 3 years'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i === 0 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-white/[0.04]">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-500 hover:text-white text-sm transition-colors">
            <ArrowLeft size={15} /> Back to home
          </button>
          {mode === 'login' && (
            <span className="text-slate-500 text-sm">
              No account?{' '}
              <button onClick={() => setMode('register-client')} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                Sign up free
              </button>
            </span>
          )}
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center px-6 py-12">
          <div className="w-full max-w-md">

            {/* Mode tabs */}
            <div className="flex gap-1 bg-white/[0.04] border border-white/[0.07] p-1 rounded-2xl mb-8">
              {TABS.map(t => (
                <button key={t.id}
                  onClick={() => { setMode(t.id); setError(''); setSuccess(''); }}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${mode === t.id
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20'
                    : 'text-slate-500 hover:text-slate-300'}`}>
                  {t.id === 'login' ? 'Sign In' : t.id === 'register-client' ? 'Client Signup' : 'Lawyer Signup'}
                </button>
              ))}
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold text-white mb-1.5">
                {mode === 'login' ? 'Welcome back' : isLawyer ? 'Join as Advocate' : 'Create your account'}
              </h2>
              <p className="text-slate-500 text-sm">
                {mode === 'login'
                  ? 'Sign in to your ContractShield account'
                  : isLawyer
                    ? 'Apply to join our verified lawyer network'
                    : 'Start analysing contracts for free — no credit card needed'}
              </p>
            </div>



            {/* Error / Success */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 px-4 py-3 rounded-xl mb-5 flex items-start gap-2.5 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 px-4 py-3 rounded-xl mb-5 flex items-start gap-2.5 text-sm">
                <CheckCircle size={16} className="shrink-0 mt-0.5 text-emerald-400" />
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <FloatingInput id="fullName" label="Full Name" icon={User}
                  value={fullName} onChange={e => setFullName(e.target.value)}
                  required placeholder="Your full name" />
              )}

              <FloatingInput id="email" label="Email Address" type="email" icon={Mail}
                value={email} onChange={e => setEmail(e.target.value)}
                required autoComplete="email" placeholder="name@example.com" />

              <FloatingInput id="password" label="Password" type="password" icon={Lock}
                value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'Min. 8 characters' : '••••••••'} />

              {/* Lawyer extra fields */}
              {isLawyer && (
                <div className="pt-2 border-t border-white/[0.06]">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-4">Lawyer Profile</p>
                  <div className="space-y-4">
                    <FloatingInput id="spec" label="Specialization" icon={Briefcase}
                      value={specialization} onChange={e => setSpecialization(e.target.value)}
                      required placeholder="e.g. Corporate Law, IP, Employment" />
                    <FloatingInput id="barId" label="Bar Council ID" icon={Hash}
                      value={barCouncilId} onChange={e => setBarCouncilId(e.target.value)}
                      required placeholder="e.g. MH/12345/2016" />
                    <div className="grid grid-cols-2 gap-3">
                      <FloatingInput id="exp" label="Experience (yrs)" type="number" icon={BookOpen}
                        value={experience} onChange={e => setExperience(e.target.value)}
                        min="0" max="60" placeholder="5" />
                      <FloatingInput id="location" label="City / Location" icon={MapPin}
                        value={location} onChange={e => setLocation(e.target.value)}
                        placeholder="Mumbai" />
                    </div>
                    <FloatingInput id="bio" label="Professional Bio" rows={3}
                      value={bio} onChange={e => setBio(e.target.value)}
                      placeholder="Brief professional summary…" />
                  </div>
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${isLawyer
                  ? 'bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-600 hover:to-indigo-600'
                  : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500'
                  } text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30 hover:scale-[1.01] mt-2`}>
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing…</>
                ) : mode === 'login' ? (
                  <>Sign In <ArrowRight size={16} /></>
                ) : isLawyer ? 'Submit Application' : 'Create Free Account'}
              </button>
            </form>

            {/* Pending lawyer note */}
            {isLawyer && (
              <p className="text-slate-600 text-xs text-center mt-4">
                Lawyer applications are reviewed by our admin team within 24 hours.
              </p>
            )}

            {/* Admin hint */}
            {mode === 'login' && (
              <p className="text-slate-700 text-[10px] text-center mt-6 font-mono">
                Admin → admin@contractshield.com
              </p>
            )}

            {/* Security footer */}
            <div className="flex items-center justify-center gap-4 mt-8 text-slate-700 text-[10px]">
              <span className="flex items-center gap-1"><Lock size={9} /> TLS 1.3</span>
              <span className="flex items-center gap-1"><Shield size={9} /> JWT + Bcrypt</span>
              <span className="flex items-center gap-1"><CheckCircle size={9} /> CORS Protected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inline global styles for focus bg */}
      <style>{`
        input:-webkit-autofill { -webkit-box-shadow: 0 0 0 100px #0d1528 inset !important; -webkit-text-fill-color: white !important; }
        input:-webkit-autofill:focus { -webkit-box-shadow: 0 0 0 100px #0d1528 inset, 0 0 0 3px rgba(139,92,246,0.08) !important; }
        @keyframes fade-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease forwards; }
      `}</style>
    </div>
  );
}
