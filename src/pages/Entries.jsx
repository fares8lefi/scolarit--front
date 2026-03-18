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
  { label: 'Salles', icon: '🏫', href: '/classrooms' },
  { label: 'Emploi du temps', icon: '📅', href: '/entries', active: true },
  { label: 'Inviter un utilisateur', icon: '👤', href: '/invite' },
];

const DAYS = [
  { value: 'Monday', label: 'Lundi' },
  { value: 'Tuesday', label: 'Mardi' },
  { value: 'Wednesday', label: 'Mercredi' },
  { value: 'Thursday', label: 'Jeudi' },
  { value: 'Friday', label: 'Vendredi' },
  { value: 'Saturday', label: 'Samedi' },
];

const COLORS = ['indigo', 'blue', 'cyan', 'rose', 'amber', 'emerald'];

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const [availableClassrooms, setAvailableClassrooms] = useState([]);
  const [isRoomAvailable, setIsRoomAvailable] = useState(true);
  const [isSearchingAvailable, setIsSearchingAvailable] = useState(false);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [filterDay, setFilterDay] = useState('All');
  const [viewMode, setViewMode] = useState('TABLE'); // TABLE or GRID

  const [form, setForm] = useState({
    dayOfWeek: 'Monday',
    startTime: '08:00',
    endTime: '10:00',
    classId: '',
    subjectId: '',
    teacherId: '',
    classroomId: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesRes, classesRes, subjectsRes, classroomsRes, teachersRes] = await Promise.all([
        apiFetch('/api/timetable/entries'),
        apiFetch('/api/timetable/classes'),
        apiFetch('/api/timetable/subjects'),
        apiFetch('/api/timetable/classrooms'),
        apiFetch('/api/users/getUsers?role=TEACHER')
      ]);

      const safeParse = async (res) => {
        if (!res) return [];
        try {
          const data = await res.json();
          return data;
        } catch (err) {
          console.error('Failed to parse response', err);
          return [];
        }
      };

      const [entriesData, classesData, subjectsData, classroomsData, teachersData] = await Promise.all([
        safeParse(entriesRes),
        safeParse(classesRes),
        safeParse(subjectsRes),
        safeParse(classroomsRes),
        safeParse(teachersRes)
      ]);

      setEntries(Array.isArray(entriesData) ? entriesData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      
      if (!editingId && classesData[0]) {
        setForm(f => ({
          ...f,
          classId: classesData[0]?._id,
          subjectId: subjectsData[0]?._id,
          teacherId: teachersData[0]?._id,
          classroomId: classroomsData[0]?._id
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkRoomAvailability = async () => {
    if (!form.dayOfWeek || !form.startTime || !form.endTime) return;
    setIsSearchingAvailable(true);
    try {
      const resAll = await apiFetch(`/api/timetable/availability?dayOfWeek=${form.dayOfWeek}&startTime=${form.startTime}&endTime=${form.endTime}`);
      const availableRooms = await resAll.json();
      setAvailableClassrooms(Array.isArray(availableRooms) ? availableRooms : []);

      if (form.classroomId) {
        const resOne = await apiFetch(`/api/timetable/availability?dayOfWeek=${form.dayOfWeek}&startTime=${form.startTime}&endTime=${form.endTime}&classroomId=${form.classroomId}`);
        const data = await resOne.json();
        setIsRoomAvailable(data.available);
      }
    } catch (err) {
      console.error("Availability check failed", err);
    } finally {
      setIsSearchingAvailable(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  
  useEffect(() => {
    if (isModalOpen) checkRoomAvailability();
  }, [form.dayOfWeek, form.startTime, form.endTime, form.classroomId, isModalOpen]);

  const openModal = (entry = null) => {
    setError('');
    setShowOnlyAvailable(false);
    if (entry) {
      setEditingId(entry._id);
      setForm({
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        classId: entry.classId?._id || '',
        subjectId: entry.subjectId?._id || '',
        teacherId: entry.teacherId?._id || '',
        classroomId: entry.classroomId?._id || ''
      });
    } else {
      setEditingId(null);
      setForm({
        dayOfWeek: filterDay === 'All' ? 'Monday' : filterDay,
        startTime: '08:00',
        endTime: '10:00',
        classId: classes[0]?._id || '',
        subjectId: subjects[0]?._id || '',
        teacherId: teachers[0]?._id || '',
        classroomId: classrooms[0]?._id || ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRoomAvailable && !window.confirm("Attention : Cette salle est déjà occupée sur ce créneau. Forcer l'enregistrement ?")) return;
    setError('');
    try {
      const url = editingId ? `/api/timetable/entries/${editingId}` : '/api/timetable/entries';
      const method = editingId ? 'PUT' : 'POST';

      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(form),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur lors de l\'enregistrement');
      
      setIsModalOpen(false);
      setEditingId(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) return;
    try {
      const res = await apiFetch(`/api/timetable/entries/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredEntries = filterDay === 'All' ? entries : entries.filter(e => e.dayOfWeek === filterDay);

  return (
    <DashboardLayout navItems={NAV} role="ADMIN" roleLabel="Gouvernance" roleColor="violet">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
        
        {/* Modern Header Section */}
        <header className="relative p-10 md:p-14 bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest mb-6 border border-indigo-100">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Architecture Académique
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase">
                Emploi du <span className="text-indigo-600">Temps</span> 📅
              </h1>
              <p className="text-slate-500 font-bold mt-4 max-w-lg leading-relaxed">
                Supervision et planification des flux d'enseignement. Vous gérez actuellement <span className="text-slate-900">{entries.length} créneaux</span> hebdomadaires.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              {/* View Switcher */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                <button onClick={() => setViewMode('TABLE')}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'TABLE' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>
                  Liste
                </button>
                <button onClick={() => setViewMode('GRID')}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'GRID' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-800'}`}>
                  Calendrier
                </button>
              </div>

              <button
                onClick={() => openModal()}
                className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-black shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
              >
                 <span>➕</span> NOUVEAU CRÉNEAU
              </button>
            </div>
          </div>
        </header>

        {/* Filters bar for Day Selection (Table mode) */}
        {viewMode === 'TABLE' && (
          <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
            <button 
              onClick={() => setFilterDay('All')}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterDay === 'All' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              Tous les jours
            </button>
            {DAYS.map(day => (
              <button 
                key={day.value}
                onClick={() => setFilterDay(day.value)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterDay === day.value ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                {day.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100"></div>)}
          </div>
        ) : viewMode === 'TABLE' ? (
          /* Table View */
          <div className="bg-white border border-slate-200 rounded-[3rem] shadow-sm overflow-hidden overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                  <th className="px-10 py-6 text-center">Jour</th>
                  <th className="px-10 py-6">Horaire</th>
                  <th className="px-10 py-6">Discipline & Classe</th>
                  <th className="px-10 py-6">Intervenant</th>
                  <th className="px-10 py-6">Local</th>
                  <th className="px-10 py-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEntries.sort((a,b) => {
                  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  if (a.dayOfWeek !== b.dayOfWeek) return dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek);
                  return a.startTime.localeCompare(b.startTime);
                }).map((entry) => (
                  <tr key={entry._id} className="hover:bg-indigo-50/20 transition-all group">
                    <td className="px-10 py-6">
                      <div className={`mx-auto w-24 py-1.5 rounded-xl text-[9px] font-black text-center uppercase tracking-widest border border-slate-100 ${entry.dayOfWeek === DAYS[new Date().getDay()-1]?.value ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}>
                        {DAYS.find(d => d.value === entry.dayOfWeek)?.label}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-900 font-black text-sm">{entry.startTime}</span>
                        <span className="text-slate-200 font-black">➔</span>
                        <span className="text-slate-400 font-bold text-xs">{entry.endTime}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex flex-col gap-1">
                          <span className="text-slate-900 font-black uppercase text-sm">{entry.subjectId?.name}</span>
                          <span className="text-[10px] font-black text-indigo-500 tracking-tighter uppercase">GROUPE {entry.classId?.name}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                             {entry.teacherId?.lastName?.charAt(0)}
                          </div>
                          <span className="text-slate-700 font-bold text-sm">Prof. {entry.teacherId?.lastName}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-100 uppercase">
                          🏫 {entry.classroomId?.name}
                       </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button onClick={() => openModal(entry)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(entry._id)} className="p-3 rounded-xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* High-end Weekly Grid view */
          <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm overflow-x-auto custom-scrollbar">
            <div className="grid grid-cols-6 gap-6 min-w-[1200px]">
              {DAYS.map((day, dIdx) => {
                const dayEntries = entries.filter(e => e.dayOfWeek === day.value).sort((a,b) => a.startTime.localeCompare(b.startTime));
                return (
                  <div key={day.value} className="flex flex-col gap-6">
                    <div className={`py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.25em] text-center border shadow-sm
                      ${day.value === DAYS[new Date().getDay()-1]?.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-600/20' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                      {day.label}
                    </div>
                    <div className="space-y-4 flex-1">
                      {dayEntries.length === 0 ? (
                        <div className="py-20 text-center rounded-[2.5rem] border-2 border-dashed border-slate-50">
                           <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Aucun cours</span>
                        </div>
                      ) : (
                        dayEntries.map((e, eIdx) => {
                          const colorClass = COLORS[eIdx % COLORS.length];
                          return (
                            <div key={e._id} onClick={() => openModal(e)} className={`group p-6 rounded-[2rem] border bg-white cursor-pointer hover:shadow-2xl transition-all duration-500 relative overflow-hidden h-44 flex flex-col justify-between
                              hover:border-${colorClass}-400 border-slate-100`}>
                               <div className={`absolute top-0 right-0 w-12 h-12 bg-${colorClass}-50 rounded-bl-[2rem] opacity-0 group-hover:opacity-100 transition-all`}></div>
                               <div>
                                  <div className="flex justify-between items-start mb-4">
                                     <span className={`text-[10px] font-black text-${colorClass}-600 tracking-tighter`}>{e.startTime} - {e.endTime}</span>
                                     <div className={`w-2 h-2 rounded-full bg-${colorClass}-500 shadow-sm`}></div>
                                  </div>
                                  <h4 className="font-black text-slate-900 text-sm leading-tight uppercase group-hover:text-indigo-600 transition-all">{e.subjectId?.name}</h4>
                               </div>
                               <div className="space-y-2 pt-4 border-t border-slate-50">
                                  <div className="flex items-center justify-between">
                                     <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{e.classId?.name}</span>
                                     <span className="text-[8px] font-bold text-slate-300"> Salle {e.classroomId?.name}</span>
                                  </div>
                                  <p className="text-[8px] font-bold text-slate-500 uppercase overflow-hidden truncate">Prof. {e.teacherId?.lastName}</p>
                               </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal for Addition/Edition */}
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Modification du créneau" : "Nouveau cours"}>
           <form onSubmit={handleSubmit} className="space-y-8 px-1">
             {error && <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest animate-shake"><span className="text-lg">⚠️</span> {error}</div>}
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Jour de session</label>
                   <select value={form.dayOfWeek} onChange={(e) => setForm({...form, dayOfWeek: e.target.value})}
                     className="w-full px-6 py-5 rounded-[1.8rem] bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-black cursor-pointer appearance-none">
                     {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Début</label>
                      <input type="time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})}
                        className="w-full px-5 py-5 rounded-[1.8rem] bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-black" />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Fin</label>
                      <input type="time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})}
                        className="w-full px-5 py-5 rounded-[1.8rem] bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-black" />
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Matière</label>
                   <select value={form.subjectId} onChange={(e) => setForm({...form, subjectId: e.target.value})}
                     className="w-full px-6 py-5 rounded-[1.8rem] bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-black cursor-pointer appearance-none">
                     {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                   </select>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Classe</label>
                   <select value={form.classId} onChange={(e) => setForm({...form, classId: e.target.value})}
                     className="w-full px-6 py-5 rounded-[1.8rem] bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-black cursor-pointer appearance-none">
                     {classes.map(c => <option key={c._id} value={c._id}>{c.name} • {c.level}</option>)}
                   </select>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Enseignant</label>
                   <select value={form.teacherId} onChange={(e) => setForm({...form, teacherId: e.target.value})}
                     className="w-full px-6 py-5 rounded-[1.8rem] bg-slate-50 border-2 border-slate-50 text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all font-black cursor-pointer appearance-none">
                     {teachers.map(t => <option key={t._id} value={t._id}>Prof. {t.lastName} {t.firstName}</option>)}
                   </select>
                </div>
                
                {/* Advanced Classroom Selector with Availability */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Lieu / Salle</label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={showOnlyAvailable} onChange={e => setShowOnlyAvailable(e.target.checked)} className="rounded-lg border-slate-200 text-indigo-600 focus:ring-indigo-500" />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">Libres</span>
                    </label>
                  </div>
                  
                  <div className="relative">
                    <select value={form.classroomId} onChange={(e) => setForm({ ...form, classroomId: e.target.value })}
                      className={`w-full px-6 py-5 rounded-[1.8rem] bg-slate-50 border-2 transition-all font-black cursor-pointer appearance-none
                        ${!isRoomAvailable ? 'border-rose-100 bg-rose-50/20 text-rose-700' : 'border-slate-50 text-slate-900 focus:border-indigo-600 focus:bg-white'}`}>
                      {(showOnlyAvailable ? classrooms.filter(r => availableClassrooms.some(ar => ar._id === r._id)) : classrooms).map(r => {
                        const isFree = availableClassrooms.some(ar => ar._id === r._id);
                        return (
                          <option key={r._id} value={r._id}>
                             {r.name} {isFree ? '✔' : '❌'}
                          </option>
                        );
                      })}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none scale-90">
                      {isSearchingAvailable ? (
                        <div className="w-5 h-5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
                      ) : !isRoomAvailable ? (
                        <span className="px-3 py-1 bg-rose-500 text-white rounded-lg font-black text-[8px] animate-shake uppercase">Indisponible</span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg font-black text-[8px] uppercase">Disponible</span>
                      )}
                    </div>
                  </div>
                </div>
             </div>

             <button type="submit"
               className="w-full py-6 mt-4 rounded-[2rem] bg-slate-950 text-white font-black shadow-2xl active:scale-95 transition-all text-lg uppercase tracking-widest flex items-center justify-center gap-4">
                <span>{editingId ? 'ACTUALISER LES MODIFICATIONS' : 'PLANIFIER CE COURS'}</span>
                <span className="text-2xl leading-none">➔</span>
             </button>
           </form>
        </Modal>

      </div>
    </DashboardLayout>
  );
}
