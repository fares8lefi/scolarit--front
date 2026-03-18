import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_ROUTES = {
  ADMIN: '/admin',
  TEACHER: '/teacher',
  PARENT: '/parent',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Identifiants incorrects');
      }

      login(data.user, data.token);
      navigate(ROLE_ROUTES[data.user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdff] relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-50 rounded-full blur-[120px] opacity-70 animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[100px] opacity-60 pointer-events-none" />
      
      <div className="relative w-full max-w-[480px] mx-4 py-12 z-10">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-[1.25rem] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/30 rotate-3 transition-transform hover:rotate-0">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 21V3m0 18l-9-9m9 9l9-9" />
                </svg>
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter">EduSchedule</span>
           </div>
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Système de gestion académique</h2>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-100 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.06)] p-10 md:p-12 animate-in zoom-in-95 duration-500">
          <header className="mb-10 text-center">
            <h3 className="text-3xl font-black text-slate-900 mb-2">Bon retour !</h3>
            <p className="text-slate-400 font-bold text-sm tracking-tight">Veuillez renseigner vos identifiants pour accéder à votre espace de travail.</p>
          </header>

          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black uppercase tracking-wider flex items-center gap-3 animate-shake">
              <span className="text-xl">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-slate-800 text-xs font-black uppercase tracking-widest ml-1">Email professionnel</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange} required
                placeholder="nom@etablissement.com"
                className="w-full px-6 py-4.5 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="block text-slate-800 text-xs font-black uppercase tracking-widest">Mot de passe</label>
                <a href="#" className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-700 transition">Oublié ?</a>
              </div>
              <input
                type="password" name="password" value={form.password} onChange={handleChange} required
                placeholder="••••••••"
                className="w-full px-6 py-4.5 rounded-2xl bg-slate-50 border-2 border-slate-50 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 focus:bg-white transition-all font-bold"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="group relative w-full py-5 rounded-[1.5rem] bg-slate-950 text-white font-black shadow-2xl shadow-slate-900/20 active:scale-95 transition-all overflow-hidden flex items-center justify-center gap-3 text-lg mt-4"
            >
              <div className="absolute inset-0 bg-indigo-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none"></div>
              {loading ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="relative z-10">AUTHENTIFICATION...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">SE CONNECTER</span>
                  <span className="relative z-10 text-2xl leading-none group-hover:translate-x-1 transition-transform">➔</span>
                </>
              )}
            </button>
          </form>

          <footer className="mt-12 pt-8 border-t border-slate-50 flex flex-col items-center">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Besoin d'un compte ?</span>
            <Link to="/signup" className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-50 text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all">
              Utiliser un code d'invitation 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </footer>
        </div>

        {/* System Status / Trust Badges */}
        <div className="mt-10 flex items-center justify-center gap-8 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Serveur opérationnel</span>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">V. 2.0.4</span>
           </div>
        </div>
      </div>
    </div>
  );
}
