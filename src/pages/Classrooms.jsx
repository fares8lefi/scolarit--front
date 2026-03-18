import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Tableau de bord', icon: '🏠', href: '/admin' },
  { label: 'Utilisateurs', icon: '👥', href: '/users' },
  { label: 'Réclamations', icon: '📩', href: '/admin/reclamations' },
  { label: 'Classes', icon: '🎓', href: '/classes' },
  { label: 'Matières', icon: '📖', href: '/subjects' },
  { label: 'Salles', icon: '🏫', href: '/classrooms', active: true },
  { label: 'Emploi du temps', icon: '📅', href: '/entries' },
  { label: 'Inviter un utilisateur', icon: '👤', href: '/invite' },
];

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', building: '', capacity: '' });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/timetable/classrooms');
      const data = await res.json();
      setClassrooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClassrooms(); }, []);

  const openModal = (room = null) => {
    setError('');
    if (room) {
      setEditingId(room._id);
      setForm({ name: room.name, building: room.building, capacity: room.capacity });
    } else {
      setEditingId(null);
      setForm({ name: '', building: '', capacity: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const url = editingId ? `/api/timetable/classrooms/${editingId}` : '/api/timetable/classrooms';
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
      setForm({ name: '', building: '', capacity: '' });
      setEditingId(null);
      fetchClassrooms();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette salle ?")) return;
    try {
      const res = await apiFetch(`/api/timetable/classrooms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchClassrooms();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <DashboardLayout navItems={NAV} role="ADMIN" roleLabel="Administrateur" roleColor="violet">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Header with Background Accent */}
        <header className="relative p-8 md:p-12 bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-[10px] font-black uppercase tracking-widest mb-4 border border-cyan-100">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                Infrastructures
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Gestion des <br />
                <span className="text-cyan-600 whitespace-nowrap">Locaux</span> 🏫
              </h1>
              <p className="text-slate-500 font-medium mt-4 max-w-lg leading-relaxed">
                Gérez l'inventaire des salles de cours, laboratoires et espaces communs de l'établissement pour optimiser l'occupation.
              </p>
            </div>
            
            <button
              onClick={() => openModal()}
              className="group relative px-8 py-4 rounded-2xl bg-slate-900 text-white font-extrabold shadow-2xl shadow-slate-900/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-0 bg-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
              <span className="relative z-10 text-xl">➕</span>
              <span className="relative z-10">Nouvelle Salle</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-44 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
        ) : classrooms.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[3rem] p-20 text-center flex flex-col items-center">
            <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-5xl mb-6 grayscale opacity-30">🏫</div>
            <h3 className="text-2xl font-black text-slate-800 mb-3">Aucune salle répertoriée</h3>
            <p className="text-slate-500 max-w-md font-medium leading-relaxed">
              Votre inventaire est vide. Ajoutez les premières salles de cours pour commencer la planification.
            </p>
            <button onClick={() => openModal()} className="mt-8 text-cyan-600 font-black flex items-center gap-2 hover:gap-3 transition-all">
              Ajouter un local ➔
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classrooms.map((room) => (
              <div key={room._id} className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-cyan-900/5 hover:border-cyan-200 transition-all duration-500 overflow-hidden">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-3xl shadow-inner border border-cyan-100 group-hover:scale-110 transition-transform duration-500">
                      🏫
                    </div>
                    <span className="px-3 py-1 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black border border-slate-200 tracking-widest uppercase">
                      ZONE {room.building}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-slate-800 group-hover:text-cyan-600 transition-colors uppercase mb-2 leading-tight">
                    {room.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    {room.capacity} PLACES DISPONIBLES
                  </div>

                  {/* Room Map Placeholder / Decorative Element */}
                  <div className="mt-8 grid grid-cols-4 gap-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
                    {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-6 bg-slate-100 rounded-lg"></div>)}
                  </div>

                  <div className="mt-10 flex gap-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    <button onClick={() => openModal(room)} className="flex-1 py-4 rounded-2xl bg-slate-50 text-slate-600 hover:bg-cyan-50 hover:text-cyan-600 border border-slate-100 hover:border-cyan-200 flex items-center justify-center gap-2 font-black text-xs transition-all active:scale-95">
                      MODIFIER
                    </button>
                    <button onClick={() => handleDelete(room._id)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-500 hover:text-white transition-all active:scale-95">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Détails de la salle" : "Nouvelle infrastructure"}>
          <form onSubmit={handleSubmit} className="space-y-6 px-1">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Nom du local</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Salle 101, Labo..."
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white transition-all font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Bâtiment / Zone</label>
                <input
                  type="text" required value={form.building}
                  onChange={(e) => setForm({ ...form, building: e.target.value })}
                  placeholder="Ex: Bât. A"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white transition-all font-black uppercase tracking-widest font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Capacité (Assis)</label>
                <div className="relative">
                  <input
                    type="number" required min="1" value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                    placeholder="30"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-100 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 focus:bg-white transition-all font-bold"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold uppercase text-[10px] tracking-tighter">PLACES</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-5 mt-4 rounded-[1.5rem] bg-slate-900 hover:bg-cyan-600 text-white font-black shadow-xl shadow-slate-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 text-lg"
            >
              {editingId ? "Mettre à jour le local" : "Ajouter à l'inventaire"}
              <span className="text-2xl leading-none">➔</span>
            </button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
