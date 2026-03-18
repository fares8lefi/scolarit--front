import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Tableau de bord', icon: '🏠', href: '/admin' },
  { label: 'Utilisateurs', icon: '👥', href: '/users' },
  { label: 'Réclamations', icon: '📩', href: '/admin/reclamations', active: true },
  { label: 'Classes', icon: '🎓', href: '/classes' },
  { label: 'Matières', icon: '📖', href: '/subjects' },
  { label: 'Salles', icon: '🏫', href: '/classrooms' },
  { label: 'Emploi du temps', icon: '📅', href: '/entries' },
  { label: 'Inviter un utilisateur', icon: '👤', href: '/invite' },
];

export default function AdminReclamations() {
  const [reclamations, setReclamations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRec, setSelectedRec] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: 'RESOLVED', adminComment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const fetchAllReclamations = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/reclamations/all');
      const data = await res.json();
      setReclamations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReclamations();
  }, []);

  const openUpdateModal = (rec) => {
    setSelectedRec(rec);
    setUpdateForm({
      status: rec.status,
      adminComment: rec.adminComment || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiFetch(`/api/reclamations/update/${selectedRec._id}`, {
        method: 'PUT',
        body: JSON.stringify(updateForm),
      });
      if (!res.ok) throw new Error('Échec de la mise à jour');
      
      setIsModalOpen(false);
      fetchAllReclamations();
    } catch (err) {
      alert(err.message);
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

  const filteredReclamations = filterStatus === 'ALL' 
    ? reclamations 
    : reclamations.filter(r => r.status === filterStatus);

  return (
    <DashboardLayout navItems={NAV} role="ADMIN" roleLabel="Gouvernance" roleColor="violet">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Centre de <span className="text-blue-600">Réclamations</span></h1>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Gestion des demandes et litiges enseignants</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm">
            {['ALL', 'PENDING', 'RESOLVED', 'REJECTED'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${filterStatus === s ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                {s === 'ALL' ? 'Tous' : s}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
        ) : filteredReclamations.length === 0 ? (
          <div className="bg-white border border-slate-100 border-dashed rounded-[4rem] p-32 text-center">
             <span className="text-8xl block mb-6 grayscale opacity-10">🛡️</span>
             <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Tout est en ordre</h3>
             <p className="text-slate-400 font-bold mt-2">Aucune réclamation ne nécessite votre attention pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReclamations.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).map((rec) => (
              <div key={rec._id} className="group bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${getStatusStyle(rec.status).split(' ')[1].replace('text-', 'bg-')}`}></div>
                
                <div className="flex-1 space-y-3">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black shadow-lg">
                        {rec.teacherId?.lastName?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <p className="text-slate-900 font-black text-lg uppercase tracking-tight">{rec.teacherId?.firstName} {rec.teacherId?.lastName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enseignant • {new Date(rec.createdAt).toLocaleDateString()}</p>
                      </div>
                   </div>
                   <div className="pt-4">
                      <h4 className="text-xl font-black text-slate-800 uppercase mb-2 group-hover:text-blue-600 transition-colors">{rec.subject}</h4>
                      <p className="text-slate-500 font-medium leading-relaxed line-clamp-2">{rec.description}</p>
                   </div>
                </div>

                <div className="flex flex-col items-center lg:items-end gap-3 min-w-[200px]">
                   <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(rec.status)}`}>
                      {rec.status}
                   </span>
                   <button onClick={() => openUpdateModal(rec)}
                     className="px-6 py-3 rounded-2xl bg-slate-50 text-slate-900 font-black text-[10px] uppercase tracking-widest border border-slate-100 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all active:scale-95 shadow-sm">
                     Traiter la demande ➔
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Traitement de la demande">
          {selectedRec && (
            <form onSubmit={handleUpdate} className="space-y-8 px-1">
               <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Détails originaux</p>
                  <h4 className="font-black text-slate-900 text-lg uppercase mb-2">{selectedRec.subject}</h4>
                  <p className="text-slate-600 font-medium italic text-sm leading-relaxed">"{selectedRec.description}"</p>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Décision Administrative</label>
                  <div className="flex gap-4">
                     {['PENDING', 'RESOLVED', 'REJECTED'].map(s => (
                        <button key={s} type="button" onClick={() => setUpdateForm({...updateForm, status: s})}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all
                            ${updateForm.status === s ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'}`}>
                           {s}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Commentaires / Feedback</label>
                  <textarea rows="4" value={updateForm.adminComment} onChange={(e) => setUpdateForm({...updateForm, adminComment: e.target.value})} placeholder="Expliquez votre décision à l'enseignant..."
                    className="w-full px-6 py-4 rounded-3xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold resize-none shadow-inner" />
               </div>

               <button type="submit" disabled={submitting}
                 className="w-full py-6 mt-4 rounded-[2.5rem] bg-blue-600 text-white font-black shadow-2xl shadow-blue-900/10 active:scale-95 transition-all uppercase tracking-widest text-lg">
                 {submitting ? 'MISE À JOUR...' : 'VALIDER LA RÉPONSE ➔'}
               </button>
            </form>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
