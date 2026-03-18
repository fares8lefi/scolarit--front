import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Mon planning', icon: '📅', href: '/teacher' },
  { label: 'Mes classes', icon: '🎓', href: '/teacher/classes' },
  { label: 'Mes matières', icon: '📖', href: '/teacher/subjects' },
  { label: 'Réclamations', icon: '📩', href: '/teacher/reclamations', active: true },
];

export default function TeacherReclamations() {
  const { user } = useAuth();
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchReclamations = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/reclamations/teacher/${user.id}`);
      const data = await res.json();
      setReclamations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchReclamations();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/reclamations/create', {
        method: 'POST',
        body: JSON.stringify({ ...form, teacherId: user.id }),
      });
      if (!res.ok) throw new Error('Erreur lors de l’envoi');
      
      setSuccess(true);
      setForm({ subject: '', description: '' });
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccess(false);
        fetchReclamations();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'REJECTED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <DashboardLayout navItems={NAV} role="TEACHER" roleLabel="Enseignant" roleColor="emerald">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Mes <span className="text-teal-600">Réclamations</span></h1>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Historique et suivi de vos demandes</p>
          </div>
          <button onClick={() => setIsModalOpen(true)}
            className="group relative px-8 py-4 rounded-2xl bg-slate-900 text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden shadow-xl shadow-slate-900/10">
            <div className="absolute inset-0 bg-teal-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10 text-xl">📩</span>
            <span className="relative z-10">Nouvelle Demande</span>
          </button>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
        ) : reclamations.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3.5rem] p-24 text-center">
            <span className="text-8xl block mb-6 grayscale opacity-10">📬</span>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Boîte vide</h3>
            <p className="text-slate-400 font-bold mt-2">Vous n'avez envoyé aucune réclamation pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reclamations.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((rec) => (
              <div key={rec._id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-teal-900/5 transition-all duration-500 overflow-hidden relative">
                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(rec.status)}`}>
                        {rec.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Posté le {new Date(rec.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{rec.subject}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{rec.description}</p>
                  </div>
                  
                  {rec.adminComment && (
                    <div className="lg:w-1/3 bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative">
                      <span className="absolute -top-3 -left-3 text-2xl">💬</span>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Réponse de l'admin</p>
                      <p className="text-slate-700 font-bold italic text-sm leading-relaxed">{rec.adminComment}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Réclamation">
          {success ? (
            <div className="py-12 text-center animate-in zoom-in-95">
              <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-4xl mb-6 mx-auto shadow-xl shadow-emerald-500/20">✔</div>
              <h4 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Transmission Réussie</h4>
              <p className="text-slate-500 font-bold">Votre demande est en cours de traitement par l'administration.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 px-1">
              {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest animate-shake">⚠️ {error}</div>}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Sujet de la demande</label>
                <input type="text" required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} placeholder="Ex: Problème d'emploi du temps, Matériel manquant..."
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-bold" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Description détaillée</label>
                <textarea rows="5" required value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Veuillez expliquer votre problème avec précision..."
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-teal-600 focus:bg-white transition-all font-bold resize-none" />
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-6 mt-6 rounded-[2rem] bg-slate-950 text-white font-black shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4 text-xl">
                {submitting ? 'ENVOI EN COURS...' : 'TRANSMETTRE LA DEMANDE ➔'}
              </button>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
