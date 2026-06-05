import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';

import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import OneToOneRegistrationPage from './pages/OneToOneRegistrationPage';
import FamilyRegistrationPage from './pages/FamilyRegistrationPage';
import PointsTablePage from './pages/PointsTablePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "'Lato', sans-serif",
            fontSize: '0.9rem',
          },
          success: {
            style: { background: '#2d2d2d', color: '#fff' },
            iconTheme: { primary: '#c9a84c', secondary: '#fff' },
          },
          error: {
            style: { background: '#d13b2a', color: '#fff' },
            iconTheme: { primary: '#fff', secondary: '#d13b2a' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/one-to-one" element={<OneToOneRegistrationPage />} />
        <Route path="/register/family" element={<FamilyRegistrationPage />} />
        <Route path="/points-table" element={<PointsTablePage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
