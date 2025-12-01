import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CandidatureForm from './pages/CandidatureForm';
import CandidatureDetail from './pages/CandidatureDetail1';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Colors from './pages/Colors';

function App() {
  const { user, isLoading } = useAuth();

  // Ne pas afficher Navbar pendant le chargement initial
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      {user && <Navbar />}
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidatures/new"
          element={
            <ProtectedRoute>
              <CandidatureForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidatures/:id"
          element={
            <ProtectedRoute>
              <CandidatureDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidatures/:id/edit"
          element={
            <ProtectedRoute>
              <CandidatureForm />
            </ProtectedRoute>
          }
        />
        <Route path="/colors" element={<Colors />} />
      </Routes>
    </>
  );
}

export default App;