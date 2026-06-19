import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { AppLayout } from '../components/layout/AppLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Resources from '../pages/Resources';
import Projects from '../pages/Projects';
import AllocationBoardPage from '../pages/AllocationBoardPage';
import Forecasting from '../pages/Forecasting';
import Budget from '../pages/Budget';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';

function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route
            path="resources"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Resources />
              </ProtectedRoute>
            }
          />
          <Route
            path="projects"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Projects />
              </ProtectedRoute>
            }
          />
          <Route path="allocation-board" element={<AllocationBoardPage />} />
          <Route
            path="forecasting"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Forecasting />
              </ProtectedRoute>
            }
          />
          <Route
            path="budget"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Budget />
              </ProtectedRoute>
            }
          />
          <Route path="reports" element={<Reports />} />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
