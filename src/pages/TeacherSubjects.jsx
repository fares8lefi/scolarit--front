import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Mon planning', icon: '📅', href: '/teacher' },
  { label: 'Mes classes', icon: '🎓', href: '/teacher/classes' },
  { label: 'Mes matières', icon: '📖', href: '/teacher/subjects', active: true },
  { label: 'Réclamations', icon: '📩', href: '/teacher/reclamations' },
];

const COLORS = [
    { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: '📘' },
    { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', icon: '📙' },
    { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', icon: '📗' },
    { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', icon: '📕' },
  ];

export default function TeacherSubjects() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      // Extraction from entries since no specific endpoint was provided for subjects
      apiFetch(`/api/timetable/teacher/${user.id}/entries`)
        .then(r => r.json())
        .then(data => {
          const entries = Array.isArray(data) ? data : [];
          const uniqueSubjects = [];
          const seenIds = new Set();

          entries.forEach(e => {
            if (e.subjectId && !seenIds.has(e.subjectId._id)) {
              seenIds.add(e.subjectId._id);
              uniqueSubjects.push(e.subjectId);
            }
          });

          setSubjects(uniqueSubjects);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <DashboardLayout navItems={NAV} role="TEACHER" roleLabel="Enseignant" roleColor="emerald">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mes <span className="text-emerald-600">Matières</span></h1>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Disciplines que vous enseignez dans l'établissement</p>
          </div>
          <div className="w-16 h-1 bg-emerald-100 rounded-full hidden md:block"></div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
            <span className="text-7xl block mb-6 grayscale opacity-20">📖</span>
            <h3 className="text-2xl font-black text-slate-800">Aucune matière</h3>
            <p className="text-slate-400 font-bold mt-2">Aucune discipline n'est actuellement liée à votre profil.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((s, idx) => {
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={s._id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 hover:border-emerald-200 transition-all duration-500 overflow-hidden relative">
                  <div className={`absolute top-0 right-0 w-24 h-24 ${color.bg} rounded-bl-[3rem] -translate-y-2 translate-x-2 transition-transform duration-500 group-hover:scale-110`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center text-3xl shadow-inner border ${color.border} group-hover:scale-110 transition-transform mb-6`}>
                      {color.icon}
                    </div>
                    
                    <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">
                      {s.name}
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Code : {s.code}</p>
                    
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Affecté à votre planning</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
