import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', invitationCode: '', password: '', confirm: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: form.email, 
          invitationCode: form.invitationCode, 
          password: form.password, 
          phone: form.phone 
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Échec de l\'activation');
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdff] relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-emerald-50/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="z-10 text-center bg-white border border-slate-100 rounded-[3rem] p-16 max-w-lg mx-4 shadow-2xl shadow-emerald-900/5 animate-in zoom-in-95 duration-700">
        <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-5xl mb-10 mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
          ✨
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Bienvenue à bord !</h2>
        <p className="text-slate-400 font-bold leading-relaxed mb-8">Votre compte est activé. Préparez-vous à une expérience organisationnelle simplifiée.</p>
        <div className="flex items-center justify-center gap-3">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Redirection automatique...</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdff] relative overflow-hidden font-sans py-20 px-4">
      {/* Background Ornaments */}
      <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-orange-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-70 pointer-events-none" />

      <div className="relative w-full max-w-[540px] z-10">
        <div className="text-center mb-10">
           <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-[1.25rem] bg-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/30 -rotate-3 transition-transform hover:rotate-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter">EduSchedule</span>
           </div>
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Activation de compte</h2>
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] p-8 md:p-12 animate-in slide-in-from-bottom-6 duration-500">
          <header className="mb-10 text-center">
            <h3 className="text-3xl font-black text-slate-900 mb-3">Rejoindre l'équipe</h3>
            <p className="text-slate-400 font-bold text-sm">Utilisez le code reçu par email pour configurer votre accès personnel.</p>
          </header>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider flex items-center gap-3 animate-shake">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Email Invitation</label>
                 <input
                   type="email" name="email" value={form.email} onChange={handleChange} required
                   placeholder="votre@email.fr"
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-bold"
                 />
               </div>
               <div className="space-y-2">
                 <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Code (6 chiffres)</label>
                 <input
                   type="text" name="invitationCode" value={form.invitationCode} onChange={handleChange} required
                   placeholder="000000"
                   className="w-full px-6 py-4 rounded-2xl bg-orange-50 border-2 border-orange-100 text-orange-600 placeholder:text-orange-300 focus:outline-none focus:border-orange-500 focus:bg-white transition-all font-black uppercase tracking-[0.4em] text-center text-xl shadow-inner shadow-orange-900/5"
                 />
               </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Numéro de téléphone (Optionnel)</label>
              <input
                type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+33 6 00 00 00 00"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-950 focus:bg-white transition-all font-bold"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Mot de passe</label>
                 <input
                   type="password" name="password" value={form.password} onChange={handleChange} required
                   placeholder="••••••••"
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-950 focus:bg-white transition-all font-bold"
                 />
               </div>
               <div className="space-y-2">
                 <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Confirmation</label>
                 <input
                   type="password" name="confirm" value={form.confirm} onChange={handleChange} required
                   placeholder="••••••••"
                   className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-950 focus:bg-white transition-all font-bold"
                 />
               </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="group relative w-full py-5 rounded-[1.5rem] bg-slate-950 text-white font-black shadow-2xl shadow-slate-900/20 active:scale-95 transition-all overflow-hidden flex items-center justify-center gap-3 text-lg mt-6"
            >
               <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
               {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="relative z-10">ACTIVATION...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10 uppercase tracking-widest">Activer mon espace</span>
                  <span className="relative z-10 text-2xl leading-none group-hover:translate-x-1 transition-transform">➔</span>
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center">
             <Link to="/login" className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] transition-all">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               Déjà un compte ? Se connecter
             </Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
