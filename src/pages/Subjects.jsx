import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Tableau de bord', icon: '🏠', href: '/admin' },
  { label: 'Utilisateurs', icon: '👥', href: '/users' },
  { label: 'Réclamations', icon: '📩', href: '/admin/reclamations' },
  { label: 'Classes', icon: '🎓', href: '/classes' },
  { label: 'Matières', icon: '📖', href: '/subjects', active: true },
  { label: 'Salles', icon: '🏫', href: '/classrooms' },
  { label: 'Emploi du temps', icon: '📅', href: '/entries' },
  { label: 'Inviter un utilisateur', icon: '👤', href: '/invite' },
];

const COLORS = [
  { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600', icon: '📘' },
  { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600', icon: '📙' },
  { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600', icon: '📗' },
  { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600', icon: '📕' },
  { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600', icon: '📓' },
  { bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600', icon: '📔' },
];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', code: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/timetable/subjects');
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubjects(); }, []);

  const openModal = (sub = null) => {
    setError('');
    if (sub) {
      setEditingId(sub._id);
      setForm({ name: sub.name, code: sub.code });
    } else {
      setEditingId(null);
      setForm({ name: '', code: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingId ? `/api/timetable/subjects/${editingId}` : '/api/timetable/subjects';
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
      setForm({ name: '', code: '' });
      setEditingId(null);
      fetchSubjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) return;
    try {
      const res = await apiFetch(`/api/timetable/subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchSubjects();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout navItems={NAV} role="ADMIN" roleLabel="Administrateur" roleColor="violet">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Header with Background Accent */}
        <header className="relative p-8 md:p-12 bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-4 border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Catalogue Académique
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Matières et <br />
                <span className="text-blue-600 whitespace-nowrap">Disciplines</span> 📖
              </h1>
              <p className="text-slate-500 font-medium mt-4 max-w-lg leading-relaxed">
                Configurez les matières enseignées dans l'établissement. Ce catalogue sert de base pour la création des emplois du temps.
              </p>
            </div>
            
            <button
              onClick={() => openModal()}
              className="group relative px-8 py-4 rounded-2xl bg-slate-900 text-white font-extrabold shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
              <span className="relative z-10 text-xl">➕</span>
              <span className="relative z-10">Nouvelle Matière</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
        ) : subjects.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[3rem] p-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl mb-6 grayscale opacity-30">📖</div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Aucune matière trouvée</h3>
            <p className="text-slate-500 max-w-md font-medium leading-relaxed">
              Votre catalogue est vide. Ajoutez vos premières matières pour commencer à organiser les cours.
            </p>
            <button onClick={() => openModal()} className="mt-8 text-blue-600 font-black flex items-center gap-2 hover:gap-3 transition-all">
              Créer la première matière ➔
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((sub, idx) => {
              const color = COLORS[idx % COLORS.length];
              return (
                <div key={sub._id} className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-500 overflow-hidden">
                  {/* Decorative Background Icon */}
                  <div className="absolute -right-6 -bottom-6 text-9xl opacity-5 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 pointer-events-none grayscale">
                    {color.icon}
                  </div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center text-3xl shadow-inner border ${color.border} group-hover:scale-110 transition-transform duration-500`}>
                        {color.icon}
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black font-mono border border-slate-200 tracking-widest uppercase">
                        {sub.code}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-600 transition-colors mb-2 line-clamp-1 leading-tight">
                      {sub.name}
                    </h3>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-8">
                      ID: {sub._id.substring(18)}
                    </p>

                    <div className="mt-auto flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      <button onClick={() => openModal(sub)} className="flex-1 py-3.5 rounded-2xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-100 hover:border-blue-200 flex items-center justify-center gap-2 font-black text-xs transition-all active:scale-95">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        MODIFIER
                      </button>
                      <button onClick={() => handleDelete(sub._id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Modifier la matière" : "Ajouter une matière"}>
          <form onSubmit={handleSubmit} className="space-y-6 px-1">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 animate-shake">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Nom de la discipline</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Mathématiques, Science..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Code Matière (Unique)</label>
              <input
                type="text" required value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Ex: MATH-001"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-black uppercase tracking-widest font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-5 mt-4 rounded-[1.5rem] bg-slate-900 hover:bg-blue-600 text-white font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {editingId ? "Actualiser les informations" : "Confirmer la création"}
              <span className="text-2xl leading-none">➔</span>
            </button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
