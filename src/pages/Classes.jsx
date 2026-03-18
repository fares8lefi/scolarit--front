import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Tableau de bord', icon: '🏠', href: '/admin' },
  { label: 'Utilisateurs', icon: '👥', href: '/users' },
  { label: 'Réclamations', icon: '📩', href: '/admin/reclamations' },
  { label: 'Classes', icon: '🎓', href: '/classes', active: true },
  { label: 'Matières', icon: '📖', href: '/subjects' },
  { label: 'Salles', icon: '🏫', href: '/classrooms' },
  { label: 'Emploi du temps', icon: '📅', href: '/entries' },
  { label: 'Inviter un utilisateur', icon: '👤', href: '/invite' },
];

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', level: '', capacity: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/timetable/classes');
      const data = await res.json();
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const openModal = (cls = null) => {
    setError('');
    if (cls) {
      setEditingId(cls._id);
      setForm({ name: cls.name, level: cls.level, capacity: cls.capacity });
    } else {
      setEditingId(null);
      setForm({ name: '', level: '', capacity: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingId ? `/api/timetable/classes/${editingId}` : '/api/timetable/classes';
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(form),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      }
      
      setIsModalOpen(false);
      setForm({ name: '', level: '', capacity: '' });
      setEditingId(null);
      fetchClasses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return;
    try {
      const res = await apiFetch(`/api/timetable/classes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchClasses();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout navItems={NAV} role="ADMIN" roleLabel="Administrateur" roleColor="violet">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Header with High-end Card */}
        <header className="relative p-8 md:p-12 bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-4 border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Structure Scolaite
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Gestion des <br />
                <span className="text-indigo-600 whitespace-nowrap">Classes</span> 🎓
              </h1>
              <p className="text-slate-500 font-medium mt-4 max-w-lg leading-relaxed">
                Organisez les groupes d'élèves par niveaux et capacités. Définissez les structures qui accueilleront les enseignements.
              </p>
            </div>
            
            <button
              onClick={() => openModal()}
              className="group relative px-8 py-4 rounded-2xl bg-slate-900 text-white font-extrabold shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
              <span className="relative z-10 text-xl">➕</span>
              <span className="relative z-10">Nouvelle Classe</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
        ) : classes.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[3rem] p-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl mb-6 grayscale opacity-30">🎓</div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Aucune classe répertoriée</h3>
            <p className="text-slate-500 max-w-md font-medium leading-relaxed">
              La liste est vide. Créez votre première classe pour commencer à inscrire des élèves et planifier des cours.
            </p>
            <button onClick={() => openModal()} className="mt-8 text-indigo-600 font-black flex items-center gap-2 hover:gap-3 transition-all">
              Ajouter une classe ➔
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls) => (
              <div key={cls._id} className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-900/5 hover:border-indigo-200 transition-all duration-500 overflow-hidden">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl shadow-inner border border-indigo-100 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
                      🎓
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/20">
                        NIVEAU : {cls.level}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-3xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors uppercase leading-none tracking-tight mb-2">
                    {cls.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200"></div>)}
                    </div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                      {cls.capacity} ÉLÈVES MAX
                    </p>
                  </div>

                  {/* Progress Bar / Visual Placeholder for capacity usage */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden">
                    <div className="h-full bg-indigo-500 w-2/3 group-hover:w-3/4 transition-all duration-1000"></div>
                  </div>

                  <div className="mt-10 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button onClick={() => openModal(cls)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-100 hover:border-indigo-200 flex items-center justify-center gap-2 font-black text-xs transition-all active:scale-95">
                      MODIFIER
                    </button>
                    <button onClick={() => handleDelete(cls._id)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Modifier la classe" : "Ajouter une classe"}>
          <form onSubmit={handleSubmit} className="space-y-6 px-1">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Nom (ex: 3ème A)</label>
                <input
                  type="text" required value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="3ème A"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold uppercase tracking-tight"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Niveau (ex: Collège)</label>
                <input
                  type="text" required value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  placeholder="Collège"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Capacité maximale d'élèves</label>
              <div className="relative">
                <input
                  type="number" required min="1" value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  placeholder="30"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-black text-xl"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold uppercase tracking-widest pointer-events-none">élèves</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-5 mt-4 rounded-[1.5rem] bg-slate-900 hover:bg-indigo-600 text-white font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {editingId ? "Actualiser la classe" : "Finaliser l'inscription"}
              <span className="text-2xl leading-none">➔</span>
            </button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
