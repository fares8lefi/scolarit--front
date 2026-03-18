import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';
import { useNavigate } from 'react-router-dom';

const NAV = [
  { label: 'Mon planning', icon: '📅', href: '/teacher', active: true },
  { label: 'Mes classes', icon: '🎓', href: '/teacher/classes' },
  { label: 'Mes matières', icon: '📖', href: '/teacher/subjects' },
  { label: 'Réclamations', icon: '📩', href: '/teacher/reclamations' },
];

const DAYS_MAP = { Monday: 'Lundi', Tuesday: 'Mardi', Wednesday: 'Mercredi', Thursday: 'Jeudi', Friday: 'Vendredi', Saturday: 'Samedi' };
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState({ classes: 0, subjects: 0, hours: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        apiFetch(`/api/timetable/teacher/${user.id}/entries`),
        apiFetch(`/api/timetable/teacher/${user.id}/classes`)
      ])
      .then(async ([entriesRes, classesRes]) => {
        const entriesData = await entriesRes.json();
        const classesData = await classesRes.json();
        
        const validEntries = Array.isArray(entriesData) ? entriesData : [];
        const validClasses = Array.isArray(classesData) ? classesData : [];
        
        setEntries(validEntries);
        
        // Calculate subjects from entries
        const uniqueSubjects = new Set(validEntries.map(e => e.subjectId?._id)).size;
        
        setStats({
          classes: validClasses.length,
          subjects: uniqueSubjects,
          hours: validEntries.length
        });
        
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [user]);

  const today = DAYS[new Date().getDay() - 1] || 'Monday';
  const todayEntries = entries.filter(e => e.dayOfWeek === today);

  return (
    <DashboardLayout navItems={NAV} role="TEACHER" roleLabel="Enseignant" roleColor="emerald">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
        
        <header className="relative p-8 md:p-12 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-[10px] font-black uppercase tracking-widest mb-4 border border-teal-100">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                Espace Enseignant
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                Ravi de vous voir,<br />
                <span className="text-teal-600">Prof. {user?.lastName}</span> 👋
              </h1>
              <p className="text-slate-500 font-bold mt-4 max-w-lg leading-relaxed text-sm">
                Voici votre planning hebdomadaire. Vous avez <span className="text-slate-900">{stats.hours} cours</span> prévus cette semaine avec <span className="text-slate-900">{stats.classes} classes</span> différentes.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
               <button onClick={() => navigate('/teacher/reclamations')} 
                className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-[10px] flex items-center gap-3">
                  <span>📩</span> Réclamation
               </button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-inner flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Classes Actives</p>
              <p className="text-4xl font-black text-teal-600 tracking-tighter">{stats.classes}</p>
            </div>
            <span className="text-4xl grayscale opacity-10 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">🎓</span>
          </div>
          <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-inner flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Matières Enseignées</p>
              <p className="text-4xl font-black text-emerald-600 tracking-tighter">{stats.subjects}</p>
            </div>
            <span className="text-4xl grayscale opacity-10 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">📖</span>
          </div>
          <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-inner flex items-center justify-between group hover:border-emerald-200 transition-all">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Horaire</p>
              <p className="text-4xl font-black text-slate-900 tracking-tighter">{stats.hours} <span className="text-xs text-slate-300">Unités</span></p>
            </div>
            <span className="text-4xl grayscale opacity-10 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">⏱️</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-teal-900/20 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div>
              
              <h2 className="text-2xl font-black mb-10 flex items-center gap-4 relative z-10">
                <span className="text-3xl">🎯</span>
                <div>
                  Aujourd'hui
                  <span className="block text-[10px] font-black text-teal-400 uppercase tracking-widest mt-1">{DAYS_MAP[today]}</span>
                </div>
              </h2>
              
              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-3xl"></div>)}
                </div>
              ) : todayEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-14 bg-white/5 rounded-[3rem] border border-white/10 border-dashed text-center">
                  <span className="text-6xl mb-8 grayscale opacity-40">☕</span>
                  <p className="font-black text-xl uppercase italic">Pause active</p>
                  <p className="text-teal-200/40 text-xs mt-3 leading-relaxed">Aucun cours n'est programmé sur votre session d'aujourd'hui.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {todayEntries.map((e, i) => (
                    <div key={i} className="group relative bg-white/5 hover:bg-white/10 border border-white/10 rounded-[2rem] p-6 transition-all duration-500 overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-500 opacity-0 group-hover:opacity-100 transition-all"></div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                          <span className="text-teal-400 font-black text-xl tracking-tighter">{e.startTime}</span>
                          <span className="text-[10px] font-black text-teal-400/30 uppercase">{e.endTime}</span>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl bg-teal-500/20 text-teal-300 text-[9px] font-black border border-teal-500/10 uppercase tracking-widest">
                          {e.classId?.name}
                        </span>
                      </div>
                      <h3 className="font-black text-xl mb-3 leading-tight uppercase group-hover:text-teal-400 transition-colors">{e.subjectId?.name}</h3>
                      <div className="flex items-center gap-2 text-[10px] text-white/40 font-black uppercase tracking-widest">
                        <span className="text-teal-500/60">S-</span> {e.classroomId?.name || 'VIRTUAL'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm h-full relative overflow-hidden">
              <div className="flex items-center justify-between mb-12 relative z-10">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">
                   Planning <span className="text-teal-600">Académique</span>
                </h2>
                <div className="flex gap-2">
                   <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                   <div className="w-2 h-2 rounded-full bg-teal-200"></div>
                   <div className="w-2 h-2 rounded-full bg-teal-100"></div>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-5 gap-6 h-[500px]">
                   {[1, 2, 3, 4, 5].map(i => <div key={i} className="bg-slate-50 animate-pulse rounded-3xl"></div>)}
                </div>
              ) : (
                <div className="overflow-x-auto relative z-10 pb-4 custom-scrollbar">
                  <div className="grid grid-cols-5 gap-6 min-w-[900px]">
                    {DAYS.map(day => {
                      const dayEntries = entries.filter(e => e.dayOfWeek === day).sort((a,b) => a.startTime.localeCompare(b.startTime));
                      const isToday = day === today;
                      
                      return (
                        <div key={day} className="flex flex-col h-full">
                          <div className={`px-4 py-3 rounded-2xl mb-6 text-center font-black text-[10px] uppercase tracking-[0.2em] transition-all
                            ${isToday ? 'bg-teal-600 text-white shadow-xl shadow-teal-600/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                            {DAYS_MAP[day]}
                          </div>
                          <div className="flex-1 space-y-4">
                            {dayEntries.length === 0 ? (
                              <div className="h-40 flex flex-col items-center justify-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-100 p-4 opacity-40">
                                <span className="text-xs font-black text-slate-300 uppercase tracking-widest">Libre</span>
                              </div>
                            ) : (
                              dayEntries.map((e, i) => (
                                <div key={i} className="group bg-white border border-slate-100 shadow-sm rounded-[1.8rem] p-5 hover:border-teal-400 hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 cursor-pointer relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-8 h-8 bg-teal-50 rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-all"></div>
                                  <div className="flex flex-col gap-3 relative z-10">
                                    <span className="text-[11px] font-black text-teal-600 tracking-tighter">
                                      {e.startTime} - {e.endTime}
                                    </span>
                                    <p className="font-black text-slate-800 text-xs leading-snug uppercase group-hover:text-teal-600 transition-colors">{e.subjectId?.name}</p>
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                      <span className="text-[9px] font-black text-slate-400 tracking-widest uppercase">{e.classId?.name}</span>
                                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">S-{e.classroomId?.name}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
