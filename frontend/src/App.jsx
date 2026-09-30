import React, { useState, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { CollegeProvider } from './context/CollegeContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import TimetablePage from './pages/TimetablePage';
import FacultyManagement from './pages/FacultyManagement';
import DepartmentManagement from './pages/DepartmentManagement';
import AbsenceManagement from './pages/AbsenceManagement';
import SmartSubstitutePage from './pages/SmartSubstitutePage';
import SubstitutionsList from './pages/SubstitutionsList';
import AttendancePage from './pages/AttendancePage';
import ExcelUploadPage from './pages/ExcelUploadPage';
import ReportsPage from './pages/ReportsPage';

const AppLayout = () => {
  const { user } = useContext(AuthContext);
  const [currentDept, setCurrentDept] = useState('B.Sc. IT');
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar currentDept={currentDept} onDeptChange={setCurrentDept} />
        <main className="page-body">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/faculty-dashboard" element={<ProtectedRoute allowedRoles={['FACULTY', 'ADMIN']}><FacultyDashboard /></ProtectedRoute>} />
            <Route path="/timetable" element={<ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}><TimetablePage currentDept={currentDept} onDeptChange={setCurrentDept} /></ProtectedRoute>} />
            <Route path="/faculty" element={<ProtectedRoute allowedRoles={['ADMIN']}><FacultyManagement /></ProtectedRoute>} />
            <Route path="/departments" element={<ProtectedRoute allowedRoles={['ADMIN']}><DepartmentManagement /></ProtectedRoute>} />
            <Route path="/absence" element={<ProtectedRoute allowedRoles={['ADMIN']}><AbsenceManagement /></ProtectedRoute>} />
            <Route path="/smart-substitute" element={<ProtectedRoute allowedRoles={['ADMIN']}><SmartSubstitutePage /></ProtectedRoute>} />
            <Route path="/substitutions" element={<ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}><SubstitutionsList /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute allowedRoles={['ADMIN', 'FACULTY']}><AttendancePage /></ProtectedRoute>} />
            <Route path="/excel-import" element={<ProtectedRoute allowedRoles={['ADMIN']}><ExcelUploadPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsPage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to={user.role === 'ADMIN' ? '/dashboard' : '/faculty-dashboard'} replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CollegeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </CollegeProvider>
    </AuthProvider>
  );
};

export default App;
