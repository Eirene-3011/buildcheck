import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectEntry from './pages/ProjectEntry';
import InspectionWizard from './pages/InspectionWizard';
import Reports from './pages/Reports';
import ViolationReports from './pages/ViolationReports';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="projects/new" element={<ProjectEntry />} />
        <Route path="inspection" element={<InspectionWizard />} />
        <Route path="reports" element={<Reports />} />
        <Route path="violations" element={<ViolationReports />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
