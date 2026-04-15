import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import WebinarPage from './pages/WebinarPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/webinar" element={<WebinarPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
