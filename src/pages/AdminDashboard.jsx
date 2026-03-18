import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Tableau de bord', icon: '🏠', href: '/admin', active: true },
  { label: 'Utilisateurs', icon: '👥', href: '/users' },
  { label: 'Réclamations', icon: '📩', href: '/admin/reclamations' },
  { label: 'Classes', icon: '🎓', href: '/classes' },
  { label: 'Matières', icon: '📖', href: '/subjects' },
  { label: 'Salles', icon: '🏫', href: '/classrooms' },
  { label: 'Emploi du temps', icon: '📅', href: '/entries' },
  { label: 'Inviter un utilisateur', icon: '👤', href: '/invite' },
];

const DAYS_MAP = { Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi', Friday: 'Vendredi', Saturday: 'Samedi' };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ classes: 0, subjects: 0, classrooms: 0, users: 0, reclamations: 0 });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/timetable/classes').then(r => r.json()),
      apiFetch('/api/timetable/subjects').then(r => r.json()),
      apiFetch('/api/timetable/classrooms').then(r => r.json()),
      apiFetch('/api/timetable/entries').then(r => r.json()),
      apiFetch('/api/users/getUsers').then(r => r.json()),
      apiFetch('/api/reclamations/all').then(r => r.json()),
    ]).then(([cs, ss, crs, es, us, recs]) => {
      setStats({
        classes: Array.isArray(cs) ? cs.length : 0,
        subjects: Array.isArray(ss) ? ss.length : 0,
        classrooms: Array.isArray(crs) ? crs.length : 0,
        users: Array.isArray(us) ? us.length : 0,
        reclamations: Array.isArray(recs) ? recs.filter(r => r.status === 'PENDING').length : 0
      });
      setEntries(Array.isArray(es) ? es : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const today = DAYS[new Date().getDay() - 1] || 'Monday';

  return (
    <DashboardLayout navItems={NAV} role="ADMIN" roleLabel="Gouvernance" roleColor="violet">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Welcome Hero Section */}
        <header className="relative p-10 md:p-14 bg-slate-900 rounded-[3rem] text-white shadow-2xl shadow-blue-900/20 overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                Console d'Administration
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                Contrôle <span className="text-blue-400">Total</span> de l'Établissement.
              </h1>
              <p className="text-slate-400 font-bold mt-6 text-lg leading-relaxed">
                Bonjour, <span className="text-white italic">{user?.firstName}</span>. Vous supervisez actuellement <span className="text-blue-300 underline decoration-2 underline-offset-4">{stats.users} comptes</span> actifs et l'organisation de <span className="text-blue-300 underline decoration-2 underline-offset-4">{stats.classes} classes</span>.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button 
                onClick={() => navigate('/invite')} 
                className="px-8 py-5 rounded-2xl bg-white text-slate-900 font-black shadow-xl transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-widest whitespace-nowrap"
              >
                Nouvelle Invitation
              </button>
              {stats.reclamations > 0 && (
                <button 
                  onClick={() => navigate('/admin/reclamations')} 
                  className="px-8 py-5 rounded-2xl bg-rose-600 text-white font-black shadow-xl shadow-rose-900/20 transition-all hover:scale-105 active:scale-95 text-sm uppercase tracking-widest whitespace-nowrap flex items-center gap-3 animate-pulse"
                >
                  <span>📩</span> {stats.reclamations} Nouvelles Demandes
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Utilisateurs', value: stats.users, icon: '👥', color: 'from-blue-500 to-indigo-600' },
            { label: 'Classes', value: stats.classes, icon: '🎓', color: 'from-indigo-500 to-violet-600' },
            { label: 'Matières', value: stats.subjects, icon: '📖', color: 'from-blue-400 to-cyan-500' },
            { label: 'Salles', value: stats.classrooms, icon: '🏫', color: 'from-slate-700 to-slate-900' },
          ].map((s, i) => (
            <div key={s.label} className="group bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[3rem] -translate-y-2 translate-x-2 group-hover:bg-blue-50 transition-colors"></div>
              <div className="relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-inner bg-slate-50 group-hover:scale-110 transition-transform`}>
                  {s.icon}
                </div>
                <p className="text-3xl font-black text-slate-900 tracking-tighter mb-1">
                  {loading ? <span className="animate-pulse bg-slate-100 h-10 w-16 block rounded"></span> : s.value}
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Operations / Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <span className="text-3xl">🗓️</span> Activité du Jour
                  </h2>
                  <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    {DAYS_MAP[today]}
                  </div>
               </div>

               {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl"></div>)}
                </div>
              ) : entries.filter(e => e.dayOfWeek === today).length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                  <span className="text-6xl mb-4 grayscale opacity-20">☕</span>
                  <p className="text-slate-400 font-bold max-w-xs">Aucun cours n'est programmé aujourd'hui dans l'établissement.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.filter(e => e.dayOfWeek === today).slice(0, 6).map((e) => (
                    <div key={e._id} className="flex items-center gap-6 p-5 rounded-[1.5rem] bg-slate-50 border border-slate-50 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group">
                      <div className="flex flex-col items-center min-w-[70px]">
                        <span className="text-slate-900 font-black text-sm">{e.startTime}</span>
                        <span className="text-[10px] text-slate-400 font-bold">{e.endTime}</span>
                      </div>
                      <div className="flex-1 border-l-2 border-slate-200 pl-6">
                        <h4 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors">{e.subjectId?.name}</h4>
                        <div className="flex flex-wrap gap-4 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><span className="text-blue-400">🎓</span> {e.classId?.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-widest"><span className="text-blue-400">🏫</span> {e.classroomId?.name}</span>
                        </div>
                      </div>
                      <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Enseignant</span>
                        <span className="text-[10px] font-bold text-slate-600">{e.teacherId?.lastName?.toUpperCase()} {e.teacherId?.firstName?.[0]}.</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-8">
            <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100">
               <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tighter">Actions Rapides</h3>
               <div className="space-y-3">
                  {[
                    { label: 'Réclamations', href: '/admin/reclamations', icon: '📩', color: 'hover:bg-rose-50 hover:text-rose-600' },
                    { label: 'Utilisateurs', href: '/users', icon: '👥', color: 'hover:bg-blue-50 hover:text-blue-600' },
                    { label: 'Classes', href: '/classes', icon: '🎓', color: 'hover:bg-indigo-50 hover:text-indigo-600' },
                    { label: 'Matières', href: '/subjects', icon: '📖', color: 'hover:bg-violet-50 hover:text-violet-600' },
                  ].map(item => (
                    <button 
                      key={item.label}
                      onClick={() => navigate(item.href)}
                      className={`w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-slate-200/50 shadow-sm transition-all group ${item.color} active:scale-95`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="font-black text-xs uppercase tracking-widest">{item.label}</span>
                      </div>
                      <span className="text-slate-300 group-hover:translate-x-1 transition-transform">➔</span>
                    </button>
                  ))}
               </div>
            </div>

            {/* Newsletter/Alert Box */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-900/30 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
               <h4 className="text-xl font-black mb-4 tracking-tight">Optimisation</h4>
               <p className="text-blue-100/80 text-sm font-medium leading-relaxed mb-8">Votre plateforme est à jour. Pensez à vérifier les disponibilités des salles avant la période d'examen.</p>
               <button className="w-full py-4 bg-white text-blue-700 font-extrabold rounded-2xl text-xs uppercase tracking-widest transition-all hover:bg-blue-50 active:scale-95">
                  Consulter les Logs
               </button>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
