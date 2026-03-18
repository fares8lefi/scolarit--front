export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Premium Blur Overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 border border-slate-100">
        
        {/* Header Section */}
        <div className="px-8 py-8 border-b border-slate-50 flex items-center justify-between relative">
          <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50"></div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">{title}</h3>
            <div className="w-12 h-1 bg-indigo-600 rounded-full mt-1"></div>
          </div>

          <button 
            onClick={onClose} 
            className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-300 active:scale-95"
          >
            <svg className="w-6 h-6 rotate-0 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content Area */}
        <div className="p-8 md:p-10 overflow-y-auto max-h-[80vh] custom-scrollbar">
          {children}
        </div>

        {/* Optional Footer Accent */}
        <div className="h-2 bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-500 opacity-20"></div>
      </div>
    </div>
  );
}
