import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import InviteUser from './pages/InviteUser';
import AdminDashboard from './pages/AdminDashboard';
import AdminReclamations from './pages/AdminReclamations';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherClasses from './pages/TeacherClasses';
import TeacherSubjects from './pages/TeacherSubjects';
import TeacherReclamations from './pages/TeacherReclamations';
import HomeParentDashboard from './pages/HomeParentDashboard';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import Classrooms from './pages/Classrooms';
import Entries from './pages/Entries';
import Users from './pages/Users';

function PrivateRoute({ children, allowedRole }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user.role === 'TEACHER') return <Navigate to="/teacher" replace />;
  if (user.role === 'PARENT') return <Navigate to="/parent" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes */}
          <Route path="/users" element={<PrivateRoute allowedRole="ADMIN"><Users /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute allowedRole="ADMIN"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/reclamations" element={<PrivateRoute allowedRole="ADMIN"><AdminReclamations /></PrivateRoute>} />
          <Route path="/classes" element={<PrivateRoute allowedRole="ADMIN"><Classes /></PrivateRoute>} />
          <Route path="/subjects" element={<PrivateRoute allowedRole="ADMIN"><Subjects /></PrivateRoute>} />
          <Route path="/classrooms" element={<PrivateRoute allowedRole="ADMIN"><Classrooms /></PrivateRoute>} />
          <Route path="/entries" element={<PrivateRoute allowedRole="ADMIN"><Entries /></PrivateRoute>} />
          <Route path="/invite" element={<PrivateRoute allowedRole="ADMIN"><InviteUser /></PrivateRoute>} />
          
          {/* Teacher Routes */}
          <Route path="/teacher" element={<PrivateRoute allowedRole="TEACHER"><TeacherDashboard /></PrivateRoute>} />
          <Route path="/teacher/classes" element={<PrivateRoute allowedRole="TEACHER"><TeacherClasses /></PrivateRoute>} />
          <Route path="/teacher/subjects" element={<PrivateRoute allowedRole="TEACHER"><TeacherSubjects /></PrivateRoute>} />
          <Route path="/teacher/reclamations" element={<PrivateRoute allowedRole="TEACHER"><TeacherReclamations /></PrivateRoute>} />
          
          {/* Parent Routes */}
          <Route path="/parent" element={<PrivateRoute allowedRole="PARENT"><HomeParentDashboard /></PrivateRoute>} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
