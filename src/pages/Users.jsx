import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import Modal from '../components/Modal';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Tableau de bord', icon: '🏠', href: '/admin' },
  { label: 'Utilisateurs', icon: '👥', href: '/users', active: true },
  { label: 'Réclamations', icon: '📩', href: '/admin/reclamations' },
  { label: 'Classes', icon: '🎓', href: '/classes' },
  { label: 'Matières', icon: '📖', href: '/subjects' },
  { label: 'Salles', icon: '🏫', href: '/classrooms' },
  { label: 'Emploi du temps', icon: '📅', href: '/entries' },
  { label: 'Inviter un utilisateur', icon: '👤', href: '/invite' },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', role: 'PARENT', phone: '', classId: '', children: []
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, classesRes, parentsRes] = await Promise.all([
        apiFetch('/api/users/getUsers'),
        apiFetch('/api/timetable/classes'),
        apiFetch('/api/users/parentsWithChildren')
      ]);
      const [usersData, classesData] = await Promise.all([
        usersRes.json(),
        classesRes.json()
      ]);
      let parentsData = [];
      try {
        if (parentsRes.ok) {
          parentsData = await parentsRes.json();
        }
      } catch (e) {
        console.error("Error parsing parents data:", e);
      }

      const mergedUsers = (Array.isArray(usersData) ? usersData : []).map(u => {
        if (u.role === 'PARENT') {
          const parentInfo = (Array.isArray(parentsData) ? parentsData : []).find(p => 
            p.parentId === u._id || (p.parentId && u._id && p.parentId.toString() === u._id.toString())
          );
          if (parentInfo && parentInfo.children) {
            return { ...u, enrichedChildren: parentInfo.children };
          }
        }
        return u;
      });

      setUsers(mergedUsers);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (err) {
      console.error("Error in fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openModal = (user = null) => {
    setError('');
    if (user) {
      setEditingId(user._id);
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: user.role || 'PARENT',
        phone: user.phone || '',
        classId: user.classId?._id || user.classId || '',
        children: user.children?.map(c => ({ name: c.name, classId: c.classId?._id || c.classId })) || []
      });
      setIsModalOpen(true);
    }
  };

  const handleChildChange = (index, field, value) => {
    const newChildren = [...form.children];
    newChildren[index][field] = value;
    setForm(f => ({ ...f, children: newChildren }));
  };

  const addChild = () => {
    setForm(f => ({
      ...f,
      children: [...f.children, { name: '', classId: classes.length > 0 ? classes[0]._id : '' }]
    }));
  };

  const removeChild = (index) => {
    setForm(f => ({
      ...f,
      children: f.children.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form };
      if (payload.role !== 'PARENT') delete payload.children;
      if (payload.role === 'ADMIN' || !payload.classId || payload.role === 'PARENT') delete payload.classId;

      const res = await apiFetch(`/api/users/updateUser/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Échec de la modification');
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Action critique : Supprimer cet utilisateur ?")) return;
    try {
       const res = await apiFetch(`/api/users/deleteUser/${id}`, { method: 'DELETE' });
       if (!res.ok) throw new Error('Erreur lors de la suppression');
       fetchData();
    } catch (err) {
       alert(err.message);
    }
  };

  const filteredUsers = (filterRole === 'ALL' ? users : users.filter(u => u.role === filterRole))
    .sort((a, b) => (a.lastName || "").localeCompare(b.lastName || ""));

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    teachers: users.filter(u => u.role === 'TEACHER').length,
    parents: users.filter(u => u.role === 'PARENT').length,
  };

  return (
    <DashboardLayout navItems={NAV} role="ADMIN" roleLabel="Administrateur" roleColor="violet">
      <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Header with Stats Overview */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase">Gestion des <span className="text-blue-600">Utilisateurs</span></h1>
            <p className="text-slate-400 font-bold text-sm tracking-widest uppercase mb-10">Supervision du personnel et des familles</p>
            
            <div className="flex flex-wrap gap-8">
               <div className="flex flex-col">
                  <span className="text-4xl font-black text-slate-800 tracking-tighter">{stats.total}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</span>
               </div>
               <div className="w-px h-10 bg-slate-100 self-center hidden sm:block"></div>
               <div className="flex flex-col">
                  <span className="text-4xl font-black text-blue-600 tracking-tighter">{stats.admins}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admins</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-4xl font-black text-emerald-500 tracking-tighter">{stats.teachers}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Profs</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-4xl font-black text-orange-500 tracking-tighter">{stats.parents}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parents</span>
               </div>
            </div>
          </div>

          <Link to="/invite" className="group relative px-10 py-5 rounded-2xl bg-slate-900 text-white font-black hover:scale-105 active:scale-95 transition-all flex items-center gap-3 overflow-hidden shadow-2xl shadow-slate-900/20">
             <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
             <span className="relative z-10 uppercase tracking-widest text-xs">Inviter un membre</span>
             <span className="relative z-10 text-xl">➔</span>
          </Link>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 py-2">
           <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-2">Filtrer par rôle :</span>
           {['ALL', 'ADMIN', 'TEACHER', 'PARENT'].map(role => (
              <button 
                key={role}
                onClick={() => setFilterRole(role)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                  ${filterRole === role ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
              >
                {role === 'ALL' ? 'Tous' : role}
              </button>
           ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-[2rem] border border-slate-100"></div>)}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
             <span className="text-7xl block mb-6 grayscale opacity-20">📂</span>
             <h3 className="text-2xl font-black text-slate-800">Aucun résultat</h3>
             <p className="text-slate-400 font-bold mt-2">Aucun utilisateur ne correspond à votre sélection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <div key={user._id} className="group bg-white border border-slate-100 rounded-[2.5rem] p-6 pr-10 shadow-sm hover:shadow-2xl hover:shadow-slate-200/40 hover:border-slate-200 transition-all duration-500 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden">
                {/* Visual Accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 
                  ${user.role === 'ADMIN' ? 'bg-blue-600' : user.role === 'TEACHER' ? 'bg-emerald-500' : 'bg-orange-500'}`}></div>

                {/* Avatar & Basic Info */}
                <div className="flex items-center gap-6 flex-1 min-w-[280px]">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black border-2
                    ${user.role === 'ADMIN' ? 'bg-blue-50 text-blue-600 border-blue-100' : user.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                   </div>
                   <div>
                       <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{user.firstName} {user.lastName}</h3>
                        {user.status === 'INVITED' && (
                          <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                            Invitation Pendante
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-slate-400 font-bold text-xs lowercase">{user.email}</p>
                        {user.phone && <p className="text-slate-300 font-bold text-xs uppercase tracking-tighter">℡ {user.phone}</p>}
                      </div>
                   </div>
                </div>

                {/* Role Badge */}
                <div className="flex-1 text-center lg:text-left">
                   <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border 
                    ${user.role === 'ADMIN' ? 'bg-blue-50 text-blue-600 border-blue-100' : user.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                      {user.role}
                   </span>
                </div>

                {/* Relationship / Context */}
                <div className="flex-1 flex flex-col items-center lg:items-start min-w-[200px]">
                   {user.role === 'PARENT' ? (
                      <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                         {(user.enrichedChildren || user.children)?.length > 0 ? (user.enrichedChildren || user.children).map((c, i) => (
                            <div key={i} className="flex flex-col bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                               <span className="text-[10px] font-black text-slate-800 uppercase">{c.name}</span>
                               <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Classe : {c.class || c.classId?.name || '—'}</span>
                            </div>
                         )) : <span className="text-slate-300 italic text-[10px] font-bold uppercase tracking-widest">Aucun enfant lié</span>}
                      </div>
                   ) : user.classId ? (
                      <div className="flex items-center gap-3">
                         <span className="text-xl">🎓</span>
                         <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-800 uppercase">Classe {user.classId?.name}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.classId?.level}</span>
                         </div>
                      </div>
                   ) : <span className="text-slate-200 text-xs font-black uppercase tracking-widest">—</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                   <button onClick={() => openModal(user)} className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 border border-slate-100 transition-all active:scale-95 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </button>
                   <button onClick={() => handleDelete(user._id)} className="p-3.5 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 border border-slate-100 transition-all active:scale-95 shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Profil Utilisateur">
          <form onSubmit={handleSubmit} className="space-y-8 px-1">
            {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-black flex items-center gap-3 animate-shake"><span className="text-xl">⚠️</span> {error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Prénom</label>
                <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Nom de famille</label>
                <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" />
              </div>
              <div className="space-y-2">
                <label className="block text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Téléphone</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold" />
              </div>
            </div>

            <div className="space-y-2">
               <label className="block text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Affectation de Rôle</label>
               <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100 font-bold text-xs">
                  {['PARENT', 'TEACHER', 'ADMIN'].map(r => (
                    <button key={r} type="button" onClick={() => setForm({...form, role: r})} 
                      className={`flex-1 py-3 rounded-xl transition-all ${form.role === r ? 'bg-white shadow-md text-blue-600 scale-[1.02]' : 'text-slate-400 hover:text-slate-600'}`}>
                      {r}
                    </button>
                  ))}
               </div>
            </div>

            {form.role === 'TEACHER' && (
              <div className="space-y-2 animate-in slide-in-from-top-4">
                <label className="block text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Classe Responsable</label>
                <select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all font-bold cursor-pointer appearance-none">
                  <option value="">Aucune classe</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.level})</option>)}
                </select>
              </div>
            )}

            {form.role === 'PARENT' && (
              <div className="space-y-6 pt-6 border-t border-slate-50 animate-in slide-in-from-top-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enfants rattachés</span>
                  <button type="button" onClick={addChild} className="px-5 py-2 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    ➕ Ajouter
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {form.children.map((child, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                      <button type="button" onClick={() => removeChild(idx)} className="absolute -top-2 -right-2 w-7 h-7 bg-rose-500 text-white rounded-xl flex items-center justify-center text-xs shadow-lg shadow-rose-900/20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">✕</button>
                      <input type="text" value={child.name} onChange={(e) => handleChildChange(idx, 'name', e.target.value)} required placeholder="Nom complet de l'enfant"
                        className="flex-[2] px-4 py-3 rounded-xl bg-white border border-slate-100 font-bold text-sm shadow-sm" />
                      <select value={child.classId} onChange={(e) => handleChildChange(idx, 'classId', e.target.value)} required
                        className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-100 font-bold text-sm shadow-sm cursor-pointer">
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button type="submit"
              className="w-full py-5 mt-6 rounded-[2rem] bg-blue-600 hover:bg-slate-950 text-white font-black shadow-2xl shadow-blue-600/20 active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3"
            >
              Sauvegarder les modifications ➔
            </button>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
