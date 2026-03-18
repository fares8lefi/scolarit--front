import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { apiFetch } from '../api/api';

const NAV = [
  { label: 'Tableau de bord', icon: '🏠', href: '/admin' },
  { label: 'Utilisateurs', icon: '👥', href: '/users' },
  { label: 'Réclamations', icon: '📩', href: '/admin/reclamations' },
  { label: 'Classes', icon: '🎓', href: '/classes' },
  { label: 'Matières', icon: '📖', href: '/subjects' },
  { label: 'Salles', icon: '🏫', href: '/classrooms' },
  { label: 'Emploi du temps', icon: '📅', href: '/entries' },
  { label: 'Inviter un utilisateur', icon: '👤', href: '/invite', active: true },
];

export default function InviteUser() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', role: 'PARENT', phone: '', classId: '', children: []
  });
  
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    apiFetch('/api/timetable/classes')
      .then(res => res.json())
      .then(data => setClasses(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

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

  const handleChildChange = (index, field, value) => {
    const newChildren = [...form.children];
    newChildren[index][field] = value;
    setForm(f => ({ ...f, children: newChildren }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      const payload = { ...form };
      if (payload.role !== 'PARENT') delete payload.children;
      if (payload.role === 'PARENT') {
        delete payload.classId;
      } else if (payload.role === 'ADMIN' || !payload.classId) {
        delete payload.classId;
      }

      const res = await apiFetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de l\'envoi');

      setSuccess('Invitation envoyée avec succès');
      setForm({ firstName: '', lastName: '', email: '', role: 'PARENT', phone: '', classId: '', children: [] });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={NAV} role="ADMIN" roleLabel="Gouvernance" roleColor="violet">
      <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
        
        {/* Modern Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expansion du <span className="text-indigo-600">Personnel</span></h1>
            <p className="text-slate-500 font-medium mt-1 uppercase tracking-widest text-[10px]">Générer des invitations sécurisées</p>
          </div>
          <div className="w-16 h-1 w-16 bg-indigo-100 rounded-full hidden md:block"></div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Info Side */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-900/20 relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                <h3 className="text-2xl font-black mb-6 tracking-tight leading-tight">Protocole d'Invitation</h3>
                <ul className="space-y-6 text-indigo-100/90 text-sm font-bold">
                   <li className="flex gap-4">
                      <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs shrink-0">1</span>
                      Remplissez les informations essentielles du futur utilisateur.
                   </li>
                   <li className="flex gap-4">
                      <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs shrink-0">2</span>
                      Choisissez son rôle pour définir ses permissions.
                   </li>
                   <li className="flex gap-4">
                      <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-xs shrink-0">3</span>
                      L'utilisateur recevra un email pour activer son compte.
                   </li>
                </ul>
                <div className="mt-12 pt-8 border-t border-white/10">
                   <p className="text-[10px] uppercase font-black tracking-widest text-indigo-200">Sécurité active</p>
                   <p className="text-xs font-medium mt-2 leading-relaxed opacity-60 italic">Les codes d'invitation sont à usage unique et strictement personnels.</p>
                </div>
             </div>
          </div>

          {/* Form Side */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[3.5rem] p-8 md:p-14 shadow-sm relative overflow-hidden">
             
             {success && (
               <div className="mb-10 p-8 rounded-[2rem] bg-emerald-50 border border-emerald-100 text-center animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-3xl mb-4 mx-auto shadow-lg shadow-emerald-500/20">✨</div>
                   <h4 className="text-emerald-900 font-black text-xl mb-2">Invitation Envoyée</h4>
                   <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest mt-2 italic">L'utilisateur peut maintenant activer son compte via l'email reçu.</p>
                </div>
             )}

             {error && (
               <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-widest flex items-center gap-3 animate-shake">
                 <span className="text-xl">⚠️</span> {error}
               </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Configuration du Rôle</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { v: 'PARENT', l: 'Parent', i: '👨‍👩‍👦' },
                      { v: 'TEACHER', l: 'Proféssionel', i: '👨‍🏫' },
                      { v: 'ADMIN', l: 'Gestionnaire', i: '🛡️' }
                    ].map(r => (
                      <button key={r.v} type="button" onClick={() => setForm({...form, role: r.v})}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                          ${form.role === r.v ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-lg shadow-indigo-900/5' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-slate-200'}`}>
                        <span className={`text-2xl ${form.role === r.v ? '' : 'grayscale opacity-30 animate-none'}`}>{r.i}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">{r.l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Prénom</label>
                    <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Ex: Jean"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Nom de famille</label>
                    <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Ex: Dupont"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email de Contact</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="nom@etablissement.com"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold" />
                </div>

                {/* PARENT: Nested Multi-Children Form */}
                {form.role === 'PARENT' && (
                  <div className="space-y-6 pt-8 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                    <div className="flex justify-between items-center px-4 py-2 bg-indigo-50/50 rounded-xl border border-indigo-50">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Enfants inscrits</span>
                      <button type="button" onClick={addChild} className="text-[9px] font-black text-white bg-indigo-600 px-4 py-2 rounded-lg hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
                        Ajouter
                      </button>
                    </div>

                    <div className="space-y-4">
                      {form.children.map((child, idx) => (
                        <div key={idx} className="flex gap-4 p-5 bg-slate-50/50 rounded-[2rem] border-2 border-slate-100 relative group animate-in slide-in-from-bottom-2">
                           <button type="button" onClick={() => removeChild(idx)} className="absolute -top-2 -right-2 w-8 h-8 rounded-xl bg-white text-rose-500 shadow-xl border border-rose-50 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all active:scale-90">✕</button>
                           <div className="flex-[2]">
                             <input type="text" value={child.name} onChange={(e) => handleChildChange(idx, 'name', e.target.value)} required placeholder="Nom complet de l'enfant"
                               className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-black text-slate-800 placeholder:text-slate-300 shadow-sm" />
                           </div>
                           <div className="flex-1">
                             <select value={child.classId} onChange={(e) => handleChildChange(idx, 'classId', e.target.value)} required
                               className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-widest shadow-sm cursor-pointer appearance-none">
                               {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                             </select>
                           </div>
                        </div>
                      ))}
                      {form.children.length === 0 && (
                        <div className="p-12 border-2 border-dashed border-slate-50 rounded-[2.5rem] flex flex-col items-center opacity-40">
                          <span className="text-3xl mb-2">🎈</span>
                          <span className="text-[10px] font-black uppercase tracking-widest">Indiquez au moins un enfant</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {form.role === 'TEACHER' && (
                  <div className="space-y-4 pt-8 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Classe Principale (Optionnel)</label>
                    <select name="classId" value={form.classId} onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-black appearance-none cursor-pointer">
                      <option value="">Aucune classe assignée</option>
                      {classes.map(c => <option key={c._id} value={c._id}>{c.name} ({c.level})</option>)}
                    </select>
                  </div>
                )}

                <div className="pt-8 space-y-2">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Mobile professionnel</label>
                   <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+33 6 00 00 00 00"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-bold" />
                </div>

                <button type="submit" disabled={loading}
                  className="group relative w-full py-6 mt-10 rounded-[2.5rem] bg-slate-950 text-white font-black shadow-2xl shadow-indigo-900/20 active:scale-95 transition-all overflow-hidden flex items-center justify-center gap-4 text-xl"
                >
                  <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  {loading ? (
                    <span className="relative z-10 animate-pulse">TRAITEMENT SÉCURISÉ...</span>
                  ) : (
                    <>
                      <span className="relative z-10">LANCER L'INVITATION</span>
                      <span className="relative z-10 text-2xl group-hover:translate-x-2 transition-transform">➔</span>
                    </>
                  )}
                </button>
             </form>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
