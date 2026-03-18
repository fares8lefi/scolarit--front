import { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Mon planning', icon: '📅', href: '/teacher' },
  { label: 'Mes classes', icon: '🎓', href: '/teacher/classes', active: true },
  { label: 'Mes matières', icon: '📖', href: '/teacher/subjects' },
  { label: 'Réclamations', icon: '📩', href: '/teacher/reclamations' },
];

export default function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      apiFetch(`/api/timetable/teacher/${user.id}/classes`)
        .then(r => r.json())
        .then(data => {
          setClasses(Array.isArray(data) ? data : []);
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mes <span className="text-emerald-600">Classes</span></h1>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Liste des groupes d'élèves sous votre responsabilité</p>
          </div>
          <div className="w-16 h-1 bg-emerald-100 rounded-full hidden md:block"></div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
            <span className="text-7xl block mb-6 grayscale opacity-20">🎓</span>
            <h3 className="text-2xl font-black text-slate-800">Aucune classe</h3>
            <p className="text-slate-400 font-bold mt-2">Vous n'êtes assigné à aucune classe pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((c) => (
              <div key={c._id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 hover:border-emerald-200 transition-all duration-500 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-[3rem] -translate-y-2 translate-x-2 group-hover:bg-emerald-100 transition-colors"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-3xl shadow-inner border border-emerald-100 group-hover:scale-110 transition-transform mb-6">
                    🎓
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 group-hover:text-emerald-600 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Niveau : {c.level}</p>
                  
                  <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                     <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{c.capacity || 0}</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Capacité</span>
                     </div>
                     <div className="w-px h-6 bg-slate-100"></div>
                     <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">Actif</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">Statut</span>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
