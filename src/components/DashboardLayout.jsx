import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children, navItems, role, roleLabel, roleColor }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const colorMap = {
    violet: {
      bg: 'bg-slate-50',
      sidebar: 'bg-white',
      accent: 'bg-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      activeText: 'text-blue-700',
      activeBg: 'bg-blue-50 border-l-4 border-blue-600',
      icon: 'text-blue-600',
      shadow: 'shadow-blue-500/30'
    },
    emerald: {
      bg: 'bg-slate-50',
      sidebar: 'bg-white',
      accent: 'bg-teal-600',
      badge: 'bg-teal-50 text-teal-700 border-teal-200',
      activeText: 'text-teal-700',
      activeBg: 'bg-teal-50 border-l-4 border-teal-600',
      icon: 'text-teal-600',
      shadow: 'shadow-teal-500/30'
    },
    amber: {
      bg: 'bg-slate-50',
      sidebar: 'bg-white',
      accent: 'bg-orange-500',
      badge: 'bg-orange-50 text-orange-700 border-orange-200',
      activeText: 'text-orange-700',
      activeBg: 'bg-orange-50 border-l-4 border-orange-500',
      icon: 'text-orange-500',
      shadow: 'shadow-orange-500/30'
    },
  };

  const c = colorMap[roleColor] || colorMap.violet;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className={`w-10 h-10 rounded-2xl ${c.accent} flex items-center justify-center shadow-md ${c.shadow}`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <span className="text-slate-800 font-bold text-xl tracking-tight">EduSchedule</span>
      </div>

      {/* Role badge */}
      <div className={`px-4 py-2 rounded-xl border text-xs font-bold tracking-wider uppercase ${c.badge} mb-8 shadow-sm flex items-center justify-center gap-2`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        {roleLabel}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1.5">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">Menu Principal</div>
        {navItems.map(item => {
          const isActive = item.active || (item.href !== '#' && location.pathname === item.href);
          return (
            <Link key={item.label} to={item.href} onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                ${isActive ? c.activeBg + ' ' + c.activeText : 'text-slate-600 border-l-4 border-transparent hover:text-slate-900 hover:bg-slate-50'}`}>
              <span className={`text-xl ${isActive ? c.icon : 'text-slate-400'}`}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + logout */}
      <div className="pt-6 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className={`w-10 h-10 rounded-full ${c.accent} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
            {user?.firstName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-slate-800 text-sm font-bold truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm font-semibold transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${c.bg} flex font-sans`}>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-72 ${c.sidebar} border-r border-slate-200 p-6 shadow-sm z-30 sticky top-0 h-screen`}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 ${c.sidebar} border-r border-slate-200 p-6 z-50 transform transition-transform duration-300 md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div className={`w-8 h-8 rounded-lg ${c.accent} flex items-center justify-center shadow-sm`}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-slate-800 font-bold tracking-tight">EduSchedule</span>
          </div>
          <button onClick={handleLogout} className="text-slate-500 p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 p-4 md:p-10 lg:p-12 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
