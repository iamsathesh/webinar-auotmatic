import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAdminLoggedIn } from './utils/storage';
import AdminLogin from './pages/AdminLogin';
import AdminPage from './pages/AdminPage';
import WorkshopForm from './pages/WorkshopForm';
import WorkshopPage from './pages/WorkshopPage';
import InvalidLinkPage from './pages/InvalidLinkPage';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  return isAdminLoggedIn() ? children : <Navigate to="/studio-admin/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Workshop Routes ── */}
        <Route path="/:slug/join" element={<WorkshopPage />} />

        {/* ── Hidden Admin Routes ── */}
        <Route path="/studio-admin/login" element={<AdminLogin />} />
        <Route path="/studio-admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
        <Route path="/studio-admin/create" element={<ProtectedRoute><WorkshopForm /></ProtectedRoute>} />
        <Route path="/studio-admin/edit/:id" element={<ProtectedRoute><WorkshopForm /></ProtectedRoute>} />

        {/* ── Everything else → Branded error page ── */}
        <Route path="/" element={<InvalidLinkPage />} />
        <Route path="/:slug" element={<InvalidLinkPage />} />
        <Route path="*" element={<InvalidLinkPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
