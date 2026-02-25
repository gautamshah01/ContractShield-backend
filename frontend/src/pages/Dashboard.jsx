import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCall } from '../context/CallContext';
import api from '../api';
import { appointmentsApi } from '../api/appointments';
import { agentApi } from '../api/agent';
import WebRTCCallModal from '../components/WebRTCCallModal';
import PaymentQRModal from '../components/PaymentQRModal';
import ProfileEditModal from '../components/ProfileEditModal';
import {
  LayoutDashboard, FileText, BarChart2, Scale, CalendarCheck,
  Plus, AlertTriangle, CheckCircle, Shield, LogOut, Upload,
  Clock, GitCompare, Star, MapPin, Send, Phone, Video,
  MessageSquare, Mic, MicOff, VideoOff, PhoneOff, User,
  Camera, TrendingUp, ChevronRight, Bell, Trash2, Eye,
  XCircle, X, RefreshCw, Bot, Sparkles, RotateCcw, Copy, Check, Paperclip,
  IndianRupee, CreditCard, Edit2
} from 'lucide-react';
import {
  ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Cell, PieChart, Pie, Legend
} from 'recharts';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MODAL HELPERS
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ChatPanel({ appointment, onClose, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const myId = (() => {
    try { return JSON.parse(atob(user?.token?.split('.')[1] || '')).sub; } catch { return ''; }
  })();

  const load = async () => {
    try { const { data } = await appointmentsApi.getMessages(appointment.id); setMessages(data.messages || []); } catch { }
  };

  useEffect(() => { load(); }, [appointment.id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { const t = setInterval(load, 4000); return () => clearInterval(t); }, [appointment.id]);

  const send = async () => {
    if (!input.trim()) return;
    setSending(true);
    try { await appointmentsApi.sendMessage(appointment.id, input.trim()); setInput(''); await load(); }
    finally { setSending(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg flex flex-col shadow-2xl" style={{ height: 580 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="font-bold text-white">{appointment.lawyer_name}</p>
            <p className="text-xs text-green-400 flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full" /> Active consultation</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"><X size={16} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && <p className="text-slate-500 text-center text-sm mt-16">No messages yet ... start the conversation!</p>}
          {messages.map(m => {
            const isMe = String(m.sender_id) === String(myId);
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-br-sm'
                  : 'bg-white/10 text-slate-200 rounded-bl-sm'}`}>
                  <p>{m.message}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-slate-500'}`}>
                    {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="px-4 pb-4 pt-2 border-t border-white/10 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <button onClick={send} disabled={sending || !input.trim()}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2.5 rounded-xl disabled:opacity-40 hover:shadow-lg transition">
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}


// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// SIDEBAR CONFIG
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const NAV = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'contracts', label: 'Contracts', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'lawyers', label: 'Find a Lawyer', icon: Scale },
  { id: 'appointments', label: 'My Appointments', icon: CalendarCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'agent', label: 'AI Legal Agent', icon: Bot },
];

// â”€â”€ Simple markdown renderer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Markdown({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (/^## (.+)/.test(line)) {
      elements.push(<h3 key={i} className="text-blue-400 font-bold text-sm mt-4 mb-1 flex items-center gap-2"><span className="w-1 h-4 bg-blue-500 rounded-full inline-block" />{line.replace(/^## /, '')}</h3>);
    } else if (/^### (.+)/.test(line)) {
      elements.push(<h4 key={i} className="text-purple-400 font-semibold text-sm mt-3 mb-1">{line.replace(/^### /, '')}</h4>);
    } else if (/^- (.+)/.test(line)) {
      elements.push(<li key={i} className="text-slate-300 text-sm ml-4 list-disc leading-relaxed">{line.replace(/^- /, '').replace(/\*\*(.+?)\*\*/g, (_, t) => t)}</li>);
    } else if (/^\d+\./.test(line)) {
      elements.push(<li key={i} className="text-slate-300 text-sm ml-4 list-decimal leading-relaxed">{line.replace(/^\d+\.\s*/, '')}</li>);
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="h-1" />);
    } else {
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      elements.push(<p key={i} className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatted }} />);
    }
    i++;
  }
  return <div className="space-y-0.5">{elements}</div>;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// MAIN DASHBOARD
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { initiateCall, onCallAccepted, onCallRejected, cancelCall } = useCall();
  const [activeTab, setActiveTab] = useState('overview');

  /* Contract state */
  const [contracts, setContracts] = useState([]);
  const [cLoading, setCLoading] = useState(true);
  const [cError, setCError] = useState('');

  /* Lawyer / appointment state */
  const [lawyers, setLawyers] = useState([]);
  const [myAppts, setMyAppts] = useState([]);
  const [bookingId, setBookingId] = useState(null);
  const [bookMsg, setBookMsg] = useState('');
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState('');
  const [chatAppt, setChatAppt] = useState(null);
  const [callAppt, setCallAppt] = useState(null);
  const [callMode, setCallMode] = useState('video');
  const [remoteSocket, setRemoteSocket] = useState(null);   // filled when caller accepts/callee accepts
  const [showProfile, setShowProfile] = useState(false);
  const [profileUser, setProfileUser] = useState(null);   // live copy updated after save

  /* Payment / notification state */
  const [notifications, setNotifications] = useState([]);     // { id, appt, type, read, ts }
  const [payAppt, setPayAppt] = useState(null);   // appointment to pay for
  const [prevApptStatuses, setPrevApptStatuses] = useState({});    // { [apptId]: status }

  /* AI Agent state */
  const [agentMessages, setAgentMessages] = useState([]);
  const [agentInput, setAgentInput] = useState('');
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState('');
  const [copied, setCopied] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);  // { name, text }
  const agentBottomRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchContracts();
    fetchLawyers();
    fetchMyAppts();
    // Poll every 15 s so payment notifications auto-appear when lawyer approves
    const t = setInterval(fetchMyAppts, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When client initiates a call to lawyer and lawyer picks up
  useEffect(() => {
    const off = onCallAccepted?.(({ callee_socket_id }) => {
      setRemoteSocket(callee_socket_id);
    });
    return () => off?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close caller modal when remote rejects the call
  useEffect(() => {
    const off = onCallRejected?.((_) => {
      setCallAppt(null);
      setRemoteSocket(null);
    });
    return () => off?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Client initiates outgoing call to their lawyer
  function startCall(appt, mode) {
    setCallMode(mode);
    // Tag the callAppt so WebRTCCallModal knows this is a caller role
    setCallAppt({ ...appt, __role: 'caller' });
    setRemoteSocket(null);
    initiateCall(appt, mode, appt.lawyer_id);
  }

  useEffect(() => {
    agentBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [agentMessages]);

  const fetchContracts = async () => {
    try { setCLoading(true); const r = await api.get('/contracts/'); setContracts(r.data.contracts || []); }
    catch { setCError('Failed to load contracts'); }
    finally { setCLoading(false); }
  };

  const fetchLawyers = async () => {
    try { const r = await appointmentsApi.getLawyers(); setLawyers(r.data.lawyers || []); } catch { }
  };


  const deleteContract = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this contract?')) return;
    try { await api.delete(`/contracts/${id}`); setContracts(p => p.filter(c => c.id !== id)); }
    catch { alert('Failed to delete'); }
  };

  const bookAppointment = async (lawyerId) => {
    setBookLoading(true);
    try {
      await appointmentsApi.book(lawyerId, bookMsg || 'I would like to consult you about a contract review.');
      setBookSuccess('✓ Booking request sent! The lawyer will respond shortly.');
      setBookingId(null); setBookMsg('');
      fetchMyAppts();
    } catch (e) { alert(e.response?.data?.error || 'Booking failed'); }
    finally { setBookLoading(false); }
  };

  const getApptWithLawyer = id => myAppts.find(a => String(a.lawyer_id) === String(id));

  /* Derived stats */
  const avgRisk = contracts.length
    ? (contracts.reduce((s, c) => s + (c.risk_score || 0), 0) / contracts.length).toFixed(1)
    : '0.0';
  const high = contracts.filter(c => (c.risk_score || 0) >= 70).length;
  const medium = contracts.filter(c => (c.risk_score || 0) >= 30 && (c.risk_score || 0) < 70).length;
  const low = contracts.filter(c => (c.risk_score || 0) < 30).length;

  const riskColor = s => s >= 70 ? 'text-red-500' : s >= 30 ? 'text-amber-500' : 'text-emerald-500';
  const riskBg = s => s >= 70 ? 'bg-red-500' : s >= 30 ? 'bg-amber-500' : 'bg-emerald-500';
  const riskBadge = s => s >= 70
    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
    : s >= 30
      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
      : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
  const riskLabel = s => s >= 70 ? 'High Risk' : s >= 30 ? 'Medium' : 'Low Risk';

  const fetchMyAppts = async () => {
    try {
      const { data } = await appointmentsApi.myAppointments();
      const list = data.appointments || [];
      setMyAppts(list);

      // â”€â”€ Notification detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      setPrevApptStatuses(prev => {
        const isFirstLoad = Object.keys(prev).length === 0;
        const newNotifs = [];
        list.forEach(a => {
          const was = prev[a.id];
          const isNewlyApproved = was && was !== 'approved' && a.status === 'approved';
          // On first load, seed notifications for existing approved appts
          const isFirstApproved = isFirstLoad && a.status === 'approved';
          if (isNewlyApproved || isFirstApproved) {
            newNotifs.push({
              id: `pay-${a.id}-${Date.now()}`,
              appt: a,
              type: 'payment',
              read: false,
              ts: new Date().toISOString(),
            });
          }
        });
        if (newNotifs.length) {
          setNotifications(n => {
            // Avoid duplicates on re-runs
            const existingApptIds = new Set(n.map(x => x.appt?.id));
            const fresh = newNotifs.filter(x => !existingApptIds.has(x.appt?.id));
            return [...fresh, ...n];
          });
        }
        const snap = {};
        list.forEach(a => { snap[a.id] = a.status; });
        return snap;
      });
    } catch { }
  };

  const pendingAppts = myAppts.filter(a => a.status === 'pending').length;
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  const dismissNotif = (id) => setNotifications(ns => ns.filter(n => n.id !== id));

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden font-sans">

      {/* â”€â”€ MODALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {chatAppt && <ChatPanel appointment={chatAppt} onClose={() => setChatAppt(null)} user={user} />}
      {callAppt && (
        <WebRTCCallModal
          appointment={callAppt}
          mode={callMode}
          role={callAppt.__role || 'callee'}
          remoteSocketId={remoteSocket}
          onClose={() => { setCallAppt(null); setRemoteSocket(null); }}
        />
      )}
      {showProfile && (
        <ProfileEditModal
          user={profileUser || user}
          role="client"
          onSave={(u) => { setProfileUser(u); setShowProfile(false); }}
          onDelete={logout}
          onClose={() => setShowProfile(false)}
        />
      )}
      {payAppt && (
        <PaymentQRModal
          appointment={payAppt}
          onClose={() => setPayAppt(null)}
          onPaid={() => {
            // Mark associated notification as read after payment
            setNotifications(ns => ns.map(n =>
              n.appt?.id === payAppt.id ? { ...n, read: true } : n
            ));
          }}
        />
      )}

      {/* Booking modal */}
      {bookingId && (() => {
        const lw = lawyers.find(l => l.id === bookingId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="font-bold text-white mb-1 text-lg">Book Appointment</h3>
              <p className="text-purple-400 font-semibold mb-4">{lw?.full_name}</p>
              <textarea rows={3} value={bookMsg} onChange={e => setBookMsg(e.target.value)}
                placeholder="Briefly describe your contract issue..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2.5 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none mb-4" />
              <div className="flex gap-2">
                <button onClick={() => bookAppointment(bookingId)} disabled={bookLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-xl font-semibold disabled:opacity-40 text-sm transition hover:shadow-lg hover:shadow-purple-500/30">
                  {bookLoading ? 'Sending...' : 'Send Request'}
                </button>
                <button onClick={() => { setBookingId(null); setBookMsg(''); }}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-slate-300 transition">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* â”€â”€ SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <aside className="w-60 flex-shrink-0 flex flex-col bg-slate-900 border-r border-white/8">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">ContractShield</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Analytics Platform</p>
            </div>
          </div>
        </div>

        {/* User card — click to edit profile */}
        <div className="px-4 py-3 border-b border-white/8">
          <button onClick={() => setShowProfile(true)}
            title="Click to edit your profile"
            className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-all group"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-lg shadow-violet-500/20">
              {user?.full_name?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-white text-xs font-semibold truncate group-hover:text-violet-300 transition">{user?.full_name || 'User'}</p>
              <p className="text-slate-500 text-[10px] truncate">{user?.email || ''}</p>
            </div>
            <Edit2 size={11} className="text-slate-700 group-hover:text-violet-400 transition shrink-0" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest px-3 py-2">Main Menu</p>
          {NAV.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            // Badge logic
            const badge =
              id === 'appointments' && pendingAppts > 0 ? pendingAppts :
                id === 'notifications' && unreadNotifs > 0 ? unreadNotifs :
                  null;
            return (
              <button key={id} onClick={() => { setActiveTab(id); if (id === 'notifications') markAllRead(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/20 text-white border border-blue-500/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}>
                <Icon size={17} className={isActive ? 'text-blue-400' : ''} />
                <span className="flex-1 text-left">{label}</span>
                {badge && (
                  <span className={`text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${id === 'notifications' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                    }`}>{badge}</span>
                )}
                {isActive && <ChevronRight size={13} className="text-blue-400" />}
              </button>
            );
          })}

          <div className="pt-4">
            <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest px-3 py-2">Quick Actions</p>
            <Link to="/upload"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition">
              <Plus size={17} /> Upload Contract
            </Link>
            {contracts.length >= 2 && (
              <Link to="/compare"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition">
                <GitCompare size={17} /> Compare
              </Link>
            )}
          </div>
        </nav>

        {/* Sign Out only */}
        <div className="px-3 py-4 border-t border-white/8">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
            style={{ border: '1px solid transparent' }}>
            <LogOut size={17} /> Sign Out
          </button>
        </div>
      </aside>

      {/* â”€â”€ MAIN CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <main className="flex-1 overflow-y-auto bg-slate-950">

        {/* Floating payment notification toast ... visible on any tab */}
        {unreadNotifs > 0 && activeTab !== 'notifications' && (
          <div className="fixed top-4 right-4 z-40 max-w-sm w-full"
            style={{ pointerEvents: 'auto' }}>
            <div className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 backdrop-blur-xl border border-emerald-500/40 rounded-2xl p-4 shadow-2xl shadow-emerald-500/20 flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/40 animate-pulse">
                <IndianRupee size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Payment Required!</p>
                <p className="text-emerald-200 text-xs mt-0.5 truncate">
                  {unreadNotifs} appointment{unreadNotifs > 1 ? 's' : ''} approved ... payment pending
                </p>
                <button
                  onClick={() => { setActiveTab('notifications'); markAllRead(); }}
                  className="mt-2 flex items-center gap-1.5 text-xs text-emerald-300 hover:text-white font-semibold transition">
                  <Eye size={11} /> View notifications →
                </button>
              </div>
              <button onClick={markAllRead}
                className="text-emerald-500 hover:text-white transition shrink-0">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/8 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-white font-bold text-xl">{NAV.find(n => n.id === activeTab)?.label}</h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {activeTab === 'overview' && 'Your activity at a glance'}
              {activeTab === 'contracts' && `${contracts.length} contract${contracts.length !== 1 ? 's' : ''} total`}
              {activeTab === 'analytics' && 'Risk intelligence charts'}
              {activeTab === 'lawyers' && `${lawyers.length} lawyers available`}
              {activeTab === 'appointments' && `${myAppts.length} appointment${myAppts.length !== 1 ? 's' : ''}`}
              {activeTab === 'notifications' && `${notifications.length} notification${notifications.length !== 1 ? 's' : ''} · ${unreadNotifs} unread`}
              {activeTab === 'discussion' && 'Ask questions, share legal insights, connect with lawyers'}
              {activeTab === 'agent' && 'Powered by Groq · llama-3.3-70b · Employment contract expertise'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Bell shortcut */}
            <button onClick={() => { setActiveTab('notifications'); markAllRead(); }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
              <Bell size={15} />
              {unreadNotifs > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full text-[9px] flex items-center justify-center text-white font-bold animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>
            <button onClick={() => { fetchContracts(); fetchLawyers(); fetchMyAppts(); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition">
              <RefreshCw size={15} />
            </button>
            <Link to="/upload"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition">
              <Plus size={16} /> New Analysis
            </Link>
          </div>
        </div>


        <div className="p-8">

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              OVERVIEW
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Contracts', value: contracts.length, sub: 'uploaded', icon: FileText, color: 'from-blue-600 to-blue-500', glow: 'shadow-blue-500/20' },
                  { label: 'Avg Risk Score', value: avgRisk, sub: '/ 100', icon: TrendingUp, color: 'from-orange-600 to-amber-500', glow: 'shadow-amber-500/20' },
                  { label: 'High Risk', value: high, sub: 'need action', icon: AlertTriangle, color: 'from-red-700 to-red-500', glow: 'shadow-red-500/20' },
                  { label: 'Active Consults', value: myAppts.filter(a => a.status === 'approved').length, sub: 'with lawyers', icon: Scale, color: 'from-purple-700 to-purple-500', glow: 'shadow-purple-500/20' },
                ].map(s => (
                  <div key={s.label} className={`relative overflow-hidden bg-gradient-to-br ${s.color} rounded-2xl p-5 shadow-xl ${s.glow}`}>
                    <div className="absolute top-3 right-3 opacity-20"><s.icon size={40} className="text-white" /></div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-2">{s.label}</p>
                    <p className="text-white text-4xl font-black">{s.value}</p>
                    <p className="text-white/60 text-xs mt-1">{s.sub}</p>
                  </div>
                ))}
              </div>

              {/* Recent contracts + mini chart */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Recent contracts */}
                <div className="lg:col-span-2 bg-slate-900 border border-white/8 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
                    <h2 className="font-bold text-white text-sm">Recent Contracts</h2>
                    <button onClick={() => setActiveTab('contracts')}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition">
                      View all <ChevronRight size={13} />
                    </button>
                  </div>
                  {cLoading ? (
                    <div className="p-10 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
                  ) : contracts.length === 0 ? (
                    <div className="p-10 text-center">
                      <Upload size={36} className="text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-500 text-sm">No contracts yet</p>
                      <Link to="/upload" className="inline-block mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">Upload first contract</Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {contracts.slice(0, 5).map(c => (
                        <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-white/3 transition group">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center shrink-0">
                              <FileText size={15} className="text-blue-400" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-white text-sm font-semibold truncate">{c.title}</p>
                              <p className="text-slate-500 text-xs">{c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '...'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${riskBadge(c.risk_score || 0)}`}>
                              {riskLabel(c.risk_score || 0)}
                            </span>
                            <Link to={`/analysis/${c.id}`}
                              className="opacity-0 group-hover:opacity-100 transition text-blue-400 hover:text-blue-300">
                              <Eye size={15} />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Risk donut */}
                <div className="rounded-2xl p-5" style={{ background: '#0a1020', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <h2 className="font-bold text-white text-sm mb-3">Risk Distribution</h2>
                  {contracts.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center gap-2" style={{ color: '#334155' }}>
                      <BarChart2 size={28} />
                      <span className="text-sm">Upload a contract first</span>
                    </div>
                  ) : (
                    <>
                      <ResponsiveContainer width="100%" height={190}>
                        <PieChart>
                          <Pie data={[
                            { name: 'High Risk', value: high, fill: '#f87171' },
                            { name: 'Medium', value: medium, fill: '#fbbf24' },
                            { name: 'Low Risk', value: low, fill: '#4ade80' },
                          ].filter(d => d.value > 0)}
                            cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="value" />
                          <Tooltip
                            contentStyle={{
                              background: '#1e293b',
                              border: '1px solid rgba(255,255,255,0.15)',
                              borderRadius: 10,
                              color: '#f8fafc',
                              fontSize: 13,
                              fontWeight: 600,
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                            labelStyle={{ color: '#cbd5e1', fontSize: 11 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2.5 mt-1">
                        {[['High Risk', high, '#f87171'], ['Medium', medium, '#fbbf24'], ['Low Risk', low, '#4ade80']].map(([l, v, clr]) => (
                          <div key={l} className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-2 text-slate-400">
                              <span className="w-3 h-3 rounded-full" style={{ background: clr, boxShadow: `0 0 6px ${clr}90` }} />
                              {l}
                            </span>
                            <span className="font-black text-white text-sm">{v}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Quick links */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Upload Contract', icon: Upload, to: '/upload', color: 'from-blue-600 to-blue-500' },
                  { label: 'Compare Contracts', icon: GitCompare, to: '/compare', color: 'from-purple-600 to-purple-500' },
                  { label: 'Find a Lawyer', icon: Scale, action: () => setActiveTab('lawyers'), color: 'from-emerald-600 to-emerald-500' },
                  { label: 'My Appointments', icon: CalendarCheck, action: () => setActiveTab('appointments'), color: 'from-amber-600 to-amber-500' },
                ].map(item => {
                  const cls = `relative overflow-hidden bg-gradient-to-br ${item.color} rounded-2xl p-4 flex items-center gap-3 text-white font-semibold text-sm hover:shadow-xl transition hover:-translate-y-0.5 cursor-pointer`;
                  const inner = <><item.icon size={20} />{item.label}</>;
                  return item.to
                    ? <Link key={item.label} to={item.to} className={cls}>{inner}</Link>
                    : <button key={item.label} onClick={item.action} className={cls}>{inner}</button>;
                })}
              </div>
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              CONTRACTS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'contracts' && (
            <div>
              {cLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-slate-500">Loading contracts...</p>
                </div>
              ) : cError ? (
                <div className="text-center py-16 text-red-400">{cError}</div>
              ) : contracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mb-5">
                    <Upload size={36} className="text-blue-500" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">No contracts yet</h3>
                  <p className="text-slate-500 mb-6 text-center max-w-sm">Upload your first contract to get AI-powered risk analysis and clause detection.</p>
                  <Link to="/upload" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition">
                    Upload Contract
                  </Link>
                </div>
              ) : (
                <div className="bg-slate-900 border border-white/8 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/8">
                        {['Contract', 'Risk Score', 'Status', 'Clauses', 'Date', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {contracts.map(c => (
                        <tr key={c.id} className="hover:bg-white/3 transition group">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-blue-600/15 rounded-xl flex items-center justify-center shrink-0">
                                <FileText size={16} className="text-blue-400" />
                              </div>
                              <div>
                                <p className="text-white font-semibold text-sm">{c.title}</p>
                                <p className="text-slate-500 text-xs uppercase">{c.file_type}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${riskBg(c.risk_score || 0)}`}
                                  style={{ width: `${Math.min(c.risk_score || 0, 100)}%` }} />
                              </div>
                              <span className={`text-sm font-bold ${riskColor(c.risk_score || 0)}`}>
                                {(c.risk_score || 0).toFixed(0)}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${riskBadge(c.risk_score || 0)}`}>
                              {(c.risk_score || 0) >= 70 ? <><AlertTriangle size={10} /> High Risk</> :
                                (c.risk_score || 0) >= 30 ? <><Clock size={10} /> Needs Review</> :
                                  <><CheckCircle size={10} /> Low Risk</>}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-sm">{c.total_clauses || 0}</td>
                          <td className="px-5 py-4 text-slate-500 text-sm">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '...'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Link to={`/analysis/${c.id}`}
                                className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-semibold transition">
                                <Eye size={14} /> View
                              </Link>
                              <button onClick={e => deleteContract(c.id, e)}
                                className="flex items-center gap-1.5 text-slate-600 hover:text-red-400 text-sm font-semibold transition">
                                <Trash2 size={14} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              ANALYTICS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {contracts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-20 h-20 bg-purple-600/10 rounded-full flex items-center justify-center mb-5">
                    <BarChart2 size={36} className="text-purple-500" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">No data to visualise</h3>
                  <p className="text-slate-500 mb-6">Upload at least one contract to see analytics.</p>
                  <Link to="/upload" className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition">Upload Contract</Link>
                </div>
              ) : (
                <>
                  {/* Summary row */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'High Risk', value: high, pct: contracts.length ? ((high / contracts.length) * 100).toFixed(0) : 0, color: 'text-red-400', bg: 'bg-red-500/10', bar: 'bg-red-500' },
                      { label: 'Medium Risk', value: medium, pct: contracts.length ? ((medium / contracts.length) * 100).toFixed(0) : 0, color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500' },
                      { label: 'Low Risk', value: low, pct: contracts.length ? ((low / contracts.length) * 100).toFixed(0) : 0, color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500' },
                    ].map(s => (
                      <div key={s.label} className={`${s.bg} border border-white/8 rounded-2xl p-5`}>
                        <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                        <p className="text-slate-400 text-sm mt-1">{s.label}</p>
                        <div className="mt-3 h-1.5 bg-white/10 rounded-full">
                          <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} />
                        </div>
                        <p className="text-slate-500 text-xs mt-1">{s.pct}% of all contracts</p>
                      </div>
                    ))}
                  </div>

                  {/* Bar chart */}
                  <div className="bg-slate-900 border border-white/8 rounded-2xl p-6">
                    <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                      <BarChart2 size={17} className="text-blue-400" /> Risk Score per Contract
                    </h3>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={contracts.slice(-10).map(c => ({
                        name: c.title.length > 12 ? c.title.slice(0, 12) + '...' : c.title,
                        score: parseFloat((c.risk_score || 0).toFixed(1))
                      }))} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                        <Tooltip
                          formatter={v => [v + '/100', 'Risk Score']}
                          contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#f1f5f9', fontSize: 12 }}
                        />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                          {contracts.slice(-10).map((c, i) => (
                            <Cell key={i} fill={(c.risk_score || 0) >= 70 ? '#ef4444' : (c.risk_score || 0) >= 30 ? '#f59e0b' : '#22c55e'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-5 text-xs mt-3 justify-center">
                      {[['#22c55e', 'Low (<30)'], ['#f59e0b', 'Medium (30 - 69)'], ['#ef4444', 'High (>=70)']].map(([col, lbl]) => (
                        <span key={lbl} className="flex items-center gap-1.5 text-slate-400">
                          <span className="w-3 h-3 rounded-sm" style={{ background: col }} />{lbl}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Compare CTA */}
                  {contracts.length >= 2 && (
                    <div className="bg-gradient-to-r from-blue-700 to-purple-700 rounded-2xl p-5 flex items-center justify-between border border-white/10">
                      <div>
                        <p className="text-white font-bold">AI Contract Comparison</p>
                        <p className="text-blue-200 text-sm mt-0.5">Diff two contracts side-by-side and see risk changes</p>
                      </div>
                      <Link to="/compare"
                        className="bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:shadow-lg transition text-sm shrink-0">
                        <GitCompare size={16} /> Compare Now
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              LAWYERS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'lawyers' && (
            <div className="space-y-5">
              {bookSuccess && (
                <div className="bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm font-medium">
                  {bookSuccess}
                </div>
              )}
              {lawyers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Scale size={40} className="text-slate-600 mb-4" />
                  <p className="text-slate-500">No lawyers available at the moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {lawyers.map(lw => {
                    const appt = getApptWithLawyer(lw.id);
                    return (
                      <div key={lw.id} className="bg-slate-900 border border-white/8 rounded-2xl p-5 hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/5 transition hover:-translate-y-0.5">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/30">
                            <User size={22} className="text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-white">{lw.full_name}</p>
                            <div className="flex items-center gap-1.5">
                              <Star size={11} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-xs text-yellow-400 font-semibold">{lw.rating}</span>
                              <span className="text-slate-600">·</span>
                              <span className="text-xs text-slate-500">{lw.experience_yrs} yrs</span>
                            </div>
                          </div>
                          <div className="ml-auto">
                            {lw.available
                              ? <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">Available</span>
                              : <span className="text-[10px] bg-red-500/15 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">Busy</span>}
                          </div>
                        </div>

                        <p className="text-xs text-purple-400 font-semibold mb-1">{lw.specialization}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mb-2"><MapPin size={10} /> {lw.location}</p>
                        <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">{lw.bio}</p>

                        <div className="flex items-center justify-between mb-4 py-3 border-y border-white/8">
                          <div className="text-center">
                            <p className="text-white font-bold text-sm">₹{lw.hourly_rate?.toLocaleString('en-IN')}</p>
                            <p className="text-slate-500 text-[10px]">per hour</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold text-sm">{lw.experience_yrs} yrs</p>
                            <p className="text-slate-500 text-[10px]">experience</p>
                          </div>
                          <div className="text-center">
                            <p className="text-white font-bold text-sm">{lw.bar_council_id?.split('/')[0]}</p>
                            <p className="text-slate-500 text-[10px]">bar council</p>
                          </div>
                        </div>

                        {!appt ? (
                          <button onClick={() => { setBookingId(lw.id); setBookSuccess(''); }}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-purple-500/30 transition">
                            📅 Book Appointment
                          </button>
                        ) : appt.status === 'pending' ? (
                          <div className="w-full bg-amber-500/10 border border-amber-500/30 text-amber-400 py-2.5 rounded-xl text-sm font-semibold text-center">
                            Request Pending...
                          </div>
                        ) : appt.status === 'approved' ? (
                          <div className="flex gap-1.5">
                            <button onClick={() => startCall(appt, 'audio')}
                              className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition">
                              <Phone size={13} /> Call
                            </button>
                            <button onClick={() => startCall(appt, 'video')}
                              className="flex-1 bg-blue-700 hover:bg-blue-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition">
                              <Video size={13} /> Video
                            </button>
                            <button onClick={() => setChatAppt(appt)}
                              className="flex-1 bg-purple-700 hover:bg-purple-600 text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition">
                              <MessageSquare size={13} /> Chat
                            </button>
                          </div>
                        ) : (
                          <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-2.5 rounded-xl text-sm font-semibold text-center">
                            ✕ Request Declined
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              APPOINTMENTS
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {myAppts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="w-20 h-20 bg-purple-600/10 rounded-full flex items-center justify-center mb-5">
                    <CalendarCheck size={36} className="text-purple-500" />
                  </div>
                  <h3 className="text-white text-xl font-bold mb-2">No appointments yet</h3>
                  <p className="text-slate-500 mb-6">Book an appointment with a lawyer to get started.</p>
                  <button onClick={() => setActiveTab('lawyers')}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition">
                    Find a Lawyer
                  </button>
                </div>
              ) : (
                <>
                  {/* Status chips */}
                  <div className="flex gap-3">
                    {[
                      { label: 'All', value: myAppts.length, color: 'bg-white/10 text-white' },
                      { label: 'Pending', value: myAppts.filter(a => a.status === 'pending').length, color: 'bg-amber-500/15 text-amber-400' },
                      { label: 'Approved', value: myAppts.filter(a => a.status === 'approved').length, color: 'bg-emerald-500/15 text-emerald-400' },
                      { label: 'Declined', value: myAppts.filter(a => a.status === 'rejected').length, color: 'bg-red-500/15 text-red-400' },
                    ].map(s => (
                      <div key={s.label} className={`${s.color} px-3 py-1.5 rounded-xl text-xs font-semibold`}>
                        {s.label}: {s.value}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {myAppts.map(a => (
                      <div key={a.id} className="bg-slate-900 border border-white/8 rounded-2xl p-5 flex items-center justify-between gap-4 hover:border-white/15 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <User size={20} className="text-white" />
                          </div>
                          <div>
                            <p className="text-white font-bold">{a.lawyer_name}</p>
                            <p className="text-slate-500 text-xs">{a.lawyer_email}</p>
                            <p className="text-slate-600 text-xs mt-0.5 flex items-center gap-1">
                              <Clock size={11} /> {new Date(a.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 ml-auto shrink-0">
                          {/* Status badge */}
                          <span className={`text-xs px-3 py-1.5 rounded-xl font-bold ${a.status === 'approved' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            a.status === 'pending' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                              'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}>
                            {a.status === 'approved' ? '✓ Approved' : a.status === 'pending' ? '⏳ Pending' : '✕ Declined'}
                          </span>

                          {/* Action buttons for approved */}
                          {a.status === 'approved' && (
                            <div className="flex gap-1.5">
                              <button onClick={() => startCall(a, 'audio')}
                                title="Audio Call"
                                className="w-9 h-9 bg-emerald-700 hover:bg-emerald-600 rounded-xl flex items-center justify-center transition">
                                <Phone size={15} className="text-white" />
                              </button>
                              <button onClick={() => startCall(a, 'video')}
                                title="Video Call"
                                className="w-9 h-9 bg-blue-700 hover:bg-blue-600 rounded-xl flex items-center justify-center transition">
                                <Video size={15} className="text-white" />
                              </button>
                              <button onClick={() => setChatAppt(a)}
                                title="Open Chat"
                                className="w-9 h-9 bg-purple-700 hover:bg-purple-600 rounded-xl flex items-center justify-center transition">
                                <MessageSquare size={15} className="text-white" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
              NOTIFICATIONS TAB
          â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-white text-xl font-bold flex items-center gap-2">
                    <Bell size={20} className="text-emerald-400" />
                    Notifications
                    {notifications.length > 0 && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                        {notifications.length}
                      </span>
                    )}
                  </h2>
                  <p className="text-slate-500 text-sm mt-0.5">Payment alerts and appointment updates</p>
                </div>
                {notifications.length > 0 && (
                  <button onClick={() => setNotifications([])}
                    className="text-xs text-slate-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5">
                    <Trash2 size={12} /> Clear all
                  </button>
                )}
              </div>

              {/* Empty state */}
              {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-28">
                  <div className="w-20 h-20 bg-slate-800/60 rounded-full flex items-center justify-center mb-5 border border-white/8">
                    <Bell size={34} className="text-slate-600" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">All caught up!</h3>
                  <p className="text-slate-500 text-sm text-center max-w-xs">
                    You'll receive payment alerts here when a lawyer approves your appointment request.
                  </p>
                </div>
              )}

              {/* Notification cards */}
              {notifications.map(notif => {
                const a = notif.appt;
                const isPaid = notif.read && notif.paidAt;
                return (
                  <div key={notif.id}
                    className={`relative border rounded-2xl p-5 transition overflow-hidden ${notif.read
                      ? 'bg-slate-900/50 border-white/8'
                      : 'bg-gradient-to-br from-emerald-950/40 to-blue-950/40 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                      }`}>

                    {/* Unread glow dot */}
                    {!notif.read && (
                      <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/60" />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${notif.type === 'payment'
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                        }`}>
                        {notif.type === 'payment'
                          ? <IndianRupee size={22} className="text-white" />
                          : <CheckCircle size={22} className="text-white" />
                        }
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">
                          Appointment Approved ... Payment Required
                        </p>
                        <p className="text-slate-400 text-sm mt-0.5">
                          <span className="text-white font-medium">{a?.lawyer_name}</span> has approved your consultation request.
                        </p>

                        {/* Details row */}
                        <div className="flex flex-wrap gap-3 mt-3">
                          <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
                            <IndianRupee size={11} className="text-emerald-400" />
                            <span className="text-emerald-400 font-bold text-sm">{a?.hourly_rate || 500}</span>
                            <span className="text-slate-500 text-xs">/ hr</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
                            <Clock size={11} className="text-slate-400" />
                            <span className="text-slate-400 text-xs">
                              {new Date(notif.ts).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                            </span>
                          </div>
                          {isPaid && (
                            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5">
                              <CheckCircle size={11} className="text-emerald-400" />
                              <span className="text-emerald-400 text-xs font-semibold">Paid</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setPayAppt(a);
                          // Mark as read when opening payment
                          setNotifications(ns => ns.map(n => n.id === notif.id ? { ...n, read: true } : n));
                        }}
                        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/30 transition">
                        <CreditCard size={14} />
                        View Payment QR
                      </button>
                      <button
                        onClick={() => startCall(a, 'video')}
                        className="flex items-center gap-2 bg-blue-700/60 hover:bg-blue-600/80 text-white px-4 py-2 rounded-xl text-sm font-medium transition border border-blue-500/20">
                        <Video size={14} />
                        Start Video Call
                      </button>
                      <button onClick={() => dismissNotif(notif.id)}
                        className="ml-auto w-9 h-9 flex items-center justify-center text-slate-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-xl transition border border-white/8">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Info panel */}
              <div className="bg-blue-500/8 border border-blue-500/15 rounded-2xl p-4 flex gap-3">
                <Bell size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-300 text-sm font-semibold">How notifications work</p>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                    When a lawyer approves your appointment, you'll see a payment alert here automatically. Complete the UPI payment to confirm your consultation session.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI LEGAL AGENT TAB */}
          {activeTab === 'agent' && (() => {

            const SUGGESTED = [
              'Review this non-compete clause: [paste clause here]',
              'What are my rights if terminated without notice?',
              'Is an NDA that lasts forever enforceable in India?',
              'Explain what an arbitration clause means for me',
              'How should I negotiate my severance package?',
              'Difference between an employee and a contractor?',
            ];
            const sendMessage = async () => {
              const text = agentInput.trim();
              if ((!text && !attachedFile) || agentLoading) return;
              setAgentError('');
              // Build user message ... prepend file content if attached
              let content = text;
              if (attachedFile) {
                content = ` **Attached document: ${attachedFile.name}**\n\n\`\`\`\n${attachedFile.text.slice(0, 6000)}\n\`\`\`\n\n${text || 'Please review this contract document and provide your analysis.'}`;
              }
              const userMsg = { role: 'user', content };
              const updated = [...agentMessages, userMsg];
              setAgentMessages(updated);
              setAgentInput('');
              setAttachedFile(null);
              setAgentLoading(true);
              try {
                const { data } = await agentApi.chat(updated);
                setAgentMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
              } catch (e) {
                setAgentError(e.response?.data?.error || 'Agent unavailable. Check your Groq API key.');
              } finally { setAgentLoading(false); }
            };
            const handleFileAttach = (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const MAX = 500 * 1024; // 500KB
              if (file.size > MAX) {
                setAgentError('File too large (max 500 KB). Please paste the text instead.');
                return;
              }
              const reader = new FileReader();
              reader.onload = (ev) => {
                setAttachedFile({ name: file.name, text: ev.target.result });
                setAgentError('');
              };
              reader.onerror = () => setAgentError('Could not read file.');
              reader.readAsText(file, 'UTF-8');
              // Reset input so same file can be re-selected
              e.target.value = '';
            };
            const copyText = (text, idx) => {
              navigator.clipboard.writeText(text);
              setCopied(idx);
              setTimeout(() => setCopied(null), 2000);
            };
            return (
              <div className="flex flex-col" style={{ height: 'calc(100vh - 130px)' }}>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/20 rounded-2xl p-4 mb-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30 shrink-0">
                    <Bot size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-white font-bold">Expert Employment Contract Lawyer</h2>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                        <Sparkles size={9} /> AI · llama3-8b
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">20+ yrs experience · Employment law · Contract review · Negotiation</p>
                  </div>
                  {agentMessages.length > 0 && (
                    <button onClick={() => { setAgentMessages([]); setAgentError(''); }}
                      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition shrink-0">
                      <RotateCcw size={12} /> Clear
                    </button>
                  )}
                </div>

                {/* Chat window */}
                <div className="flex-1 bg-slate-900 border border-white/8 rounded-2xl flex flex-col overflow-hidden">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto">
                    {agentMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-5 shadow-2xl shadow-blue-500/30">
                          <Bot size={28} className="text-white" />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-1">Ask Your Legal Agent</h3>
                        <p className="text-slate-500 text-sm mb-8 text-center max-w-md">
                          Expert analysis on employment contracts, clause risks, negotiation strategy, and workplace law.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full max-w-2xl">
                          {SUGGESTED.map((s, i) => (
                            <button key={i} onClick={() => setAgentInput(s)}
                              className="text-left bg-white/5 hover:bg-white/10 border border-white/8 hover:border-blue-500/30 rounded-xl px-4 py-3 text-slate-400 hover:text-white text-xs transition group">
                              <span className="text-blue-400 mr-2 group-hover:text-blue-300">→</span>{s}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 space-y-5">
                        {agentMessages.map((m, idx) => (
                          <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {m.role === 'assistant' && (
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-lg">
                                <Bot size={15} className="text-white" />
                              </div>
                            )}
                            <div className={`max-w-[85%] ${m.role === 'user'
                              ? 'bg-gradient-to-br from-blue-700 to-blue-600 rounded-2xl rounded-br-sm px-4 py-3'
                              : 'bg-slate-800 border border-white/8 rounded-2xl rounded-bl-sm px-5 py-4'}`}>
                              {m.role === 'user'
                                ? <p className="text-white text-sm leading-relaxed">{m.content}</p>
                                : (
                                  <>
                                    <Markdown text={m.content} />
                                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                      <span className="text-[10px] text-slate-600">General info ... not a substitute for licensed legal advice</span>
                                      <button onClick={() => copyText(m.content, idx)}
                                        className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-white transition ml-3 shrink-0">
                                        {copied === idx ? <><Check size={11} className="text-green-400" /> Copied</> : <><Copy size={11} /> Copy</>}
                                      </button>
                                    </div>
                                  </>
                                )}
                            </div>
                            {m.role === 'user' && (
                              <div className="w-8 h-8 bg-slate-700 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                <User size={15} className="text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                        {agentLoading && (
                          <div className="flex gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shrink-0">
                              <Bot size={15} className="text-white" />
                            </div>
                            <div className="bg-slate-800 border border-white/8 rounded-2xl rounded-bl-sm px-5 py-4 flex items-center gap-2">
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                              <span className="text-slate-500 text-xs ml-1">Analysing...</span>
                            </div>
                          </div>
                        )}
                        {agentError && (
                          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                            [!] {agentError}
                          </div>
                        )}
                        <div ref={agentBottomRef} />
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-white/8 bg-slate-900/80 backdrop-blur-sm">
                    {/* Attached file pill */}
                    {attachedFile && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-2 bg-blue-500/15 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded-xl text-xs font-medium max-w-xs truncate">
                          <Paperclip size={11} />
                          <span className="truncate">{attachedFile.name}</span>
                          <span className="text-blue-500 shrink-0">({Math.round(attachedFile.text.length / 1024)}KB)</span>
                        </div>
                        <button onClick={() => setAttachedFile(null)}
                          className="w-5 h-5 flex items-center justify-center text-slate-500 hover:text-red-400 transition">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2 items-end">
                      {/* Hidden file input */}
                      <input ref={fileInputRef} type="file"
                        accept=".txt,.md,.text,.doc,.docx,.pdf,.rtf"
                        onChange={handleFileAttach} className="hidden" />
                      {/* Attach button */}
                      <button onClick={() => fileInputRef.current?.click()} title="Attach contract document"
                        className={`w-10 h-10 flex items-center justify-center rounded-xl border transition shrink-0 ${attachedFile
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                          }`}>
                        <Paperclip size={16} />
                      </button>
                      <textarea value={agentInput} onChange={e => setAgentInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                        placeholder={attachedFile
                          ? `Add a question about "${attachedFile.name}" or press Ask to get full analysis...`
                          : 'Ask about employment clauses, termination rights, NDAs... or attach a contract file (Enter to send)'}
                        rows={2}
                        className="flex-1 bg-white/5 border border-white/10 focus:border-blue-500/50 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 outline-none text-sm resize-none transition leading-relaxed" />
                      <button onClick={sendMessage} disabled={agentLoading || (!agentInput.trim() && !attachedFile)}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 hover:shadow-lg hover:shadow-blue-500/30 transition shrink-0">
                        {agentLoading ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                        {agentLoading ? 'Thinking...' : 'Ask'}
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-600 mt-2 text-center">
                      Powered by Groq · llama-3.3-70b · Attach .txt/.pdf/.docx contracts · General legal information only.
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

        </div>{/* /p-8 */}
      </main>
    </div>
  );
}
