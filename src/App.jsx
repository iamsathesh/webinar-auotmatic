import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from './utils/storage';
import AdminLogin from './pages/AdminLogin';
import AdminPage from './pages/AdminPage';
import WorkshopForm from './pages/WorkshopForm';
import WorkshopPage from './pages/WorkshopPage';

// Simple protected route wrapper
const ProtectedRoute = ({ children }) => {
  return isAdminLoggedIn() ? children : <Navigate to="/admin/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Workshop Link: workshop.expertisoracademy.com/:slug/join */}
        <Route path="/:slug/join" element={<WorkshopPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/create" 
          element={
            <ProtectedRoute>
              <WorkshopForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit/:id" 
          element={
            <ProtectedRoute>
              <WorkshopForm />
            </ProtectedRoute>
          } 
        />

        {/* Global Redirects */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/webinar" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
