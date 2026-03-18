import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Ma Famille', icon: '🏠', href: '#', active: true },
];

const DAYS_MAP = { Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi', Friday: 'Vendredi', Saturday: 'Samedi' };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function HomeParentDashboard() {
  const { user, token, login } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      apiFetch(`/api/users/getUserById/${user._id}`)
        .then(res => res.json())
        .then(updatedUser => {
          if (updatedUser) login(updatedUser, token);
        })
        .catch(err => console.error("Error syncing user:", err));
    }
  }, []);

  useEffect(() => {
    if (user?._id) {
      apiFetch(`/api/timetable/parent/${user._id}/entries`)
        .then(r => r.json())
        .then(data => { setEntries(Array.isArray(data) ? data : []); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user?._id]);

  const childrenCount = user?.children?.length || 0;
  const today = DAYS[new Date().getDay() - 1] || 'Monday';

  return (
    <DashboardLayout navItems={NAV} role="PARENT" roleLabel="Espace Famille" roleColor="amber">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Warm Parent Welcome */}
        <header className="relative p-10 md:p-14 bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-80 animate-pulse pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-black uppercase tracking-widest mb-6 border border-amber-100">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                Portail Parent
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                Bonjour, {user?.firstName} 👋 <br />
                <span className="text-amber-500">Suivi Scolaire Tactique.</span>
              </h1>
              <p className="text-slate-500 font-bold mt-6 text-lg max-w-xl leading-relaxed">
                Vous gérez actuellement le planning de <span className="text-slate-900 underline decoration-amber-400 decoration-4 underline-offset-4">{childrenCount} enfant{childrenCount > 1 ? 's' : ''}</span>. Toutes les informations sont synchronisées en temps réel.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
               {user?.children?.map((c, i) => (
                  <div key={i} className="px-6 py-4 rounded-3xl bg-slate-900 text-white shadow-xl shadow-slate-900/10 flex flex-col items-center min-w-32 transform hover:scale-105 transition-transform">
                     <span className="text-3xl mb-1">{i % 2 === 0 ? '🎒' : '📚'}</span>
                     <span className="text-sm font-black uppercase tracking-tight">{c.name}</span>
                     <span className="text-xs font-bold text-amber-400 uppercase tracking-widest mt-1">
                        {c.classId?.name || '—'}
                     </span>
                  </div>
               ))}
            </div>
          </div>
        </header>

        {/* Per-Child Timetables */}
        {(user?.children || []).map((child, childIdx) => {
          const childClassId = child.classId?._id || child.classId;
          const childEntries = entries.filter(e => e.classId?._id === childClassId);
          const childTodayEntries = childEntries.filter(e => e.dayOfWeek === today);
          const childIcon = childIdx % 2 === 0 ? '🎒' : '📚';

          return (
            <div key={childIdx} className="space-y-8 pb-12 border-b border-slate-100 last:border-b-0">
              {/* Child Header */}
              <div className="flex items-center gap-4 px-6 py-4 bg-amber-50 rounded-2xl border border-amber-200">
                <span className="text-4xl">{childIcon}</span>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{child.name}</h2>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Classe • {child.classId?.name || '—'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Today's Focus Card */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl shadow-amber-900/5 relative overflow-hidden h-full">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-2xl font-black tracking-tight">Focus Journée</h2>
                      <div className="px-3 py-1 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest border border-white/10 backdrop-blur-md">
                        {DAYS_MAP[today]}
                      </div>
                    </div>

                    {loading ? (
                      <div className="space-y-4">
                        {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl"></div>)}
                      </div>
                    ) : childTodayEntries.length === 0 ? (
                      <div className="py-20 text-center flex flex-col items-center border border-white/10 rounded-2xl bg-white/5">
                        <span className="text-5xl mb-4 grayscale opacity-40">🛋️</span>
                        <p className="font-black text-amber-200 uppercase tracking-widest text-xs">Repos total</p>
                        <p className="text-slate-400 font-bold mt-2 text-sm leading-relaxed px-6">{child.name} n'a pas de cours programmé pour aujourd'hui.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {childTodayEntries.map((e, i) => (
                          <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default overflow-hidden relative">
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 rounded-full"></div>
                            <div className="flex justify-between items-start mb-4">
                              <span className="text-3xl">{i % 2 === 0 ? '🧠' : '✏️'}</span>
                              <span className="text-xs font-black uppercase tracking-widest text-amber-400">{e.startTime}</span>
                            </div>
                            <h4 className="text-lg font-black leading-tight mb-2 group-hover:text-amber-400 transition-colors uppercase">{e.subjectId?.name}</h4>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Enfant : {child.name}</span>
                              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Lieu : {e.classroomId?.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Master Weekly View */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
                    <div className="flex items-center justify-between mb-12">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Calendrier <span className="text-amber-500">Hebdomadaire</span></h2>
                      <div className="w-12 h-1 bg-amber-400 rounded-full"></div>
                    </div>

                    {loading ? (
                      <div className="h-96 bg-slate-50 animate-pulse rounded-2xl"></div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                        {DAYS.map(day => (
                          <div key={day} className="space-y-4">
                            <div className={`text-center py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-sm
                              ${day === today ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                              {DAYS_MAP[day]}
                            </div>
                            <div className="space-y-2.5">
                              {childEntries.filter(e => e.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime)).map((e, idx) => (
                                <div key={idx} className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-amber-200 hover:shadow-xl hover:shadow-amber-900/5 transition-all group">
                                  <div className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1.5">{e.startTime}</div>
                                  <h5 className="font-black text-slate-900 text-xs leading-tight group-hover:text-amber-600 transition-colors uppercase">{e.subjectId?.name}</h5>
                                  <div className="mt-2 pt-2 border-t border-slate-50">
                                    <span className="text-xs font-black text-slate-300 uppercase tracking-tighter">CLASSE {e.classId?.name}</span>
                                  </div>
                                </div>
                              ))}
                              {childEntries.filter(e => e.dayOfWeek === day).length === 0 && (
                                <div className="py-10 text-center text-slate-100 text-2xl font-black select-none pointer-events-none uppercase">
                                  Free
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}


      </div>
    </DashboardLayout>
  );
}
