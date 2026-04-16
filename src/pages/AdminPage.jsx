import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllWorkshops, deleteWorkshop, adminLogout } from '../utils/storage';
import { getWebinarStatus } from '../utils/timeUtils';

export default function AdminPage() {
  const [workshops, setWorkshops] = useState([]);
  const [copySuccess, setCopySuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setWorkshops(getAllWorkshops());
  }, []);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this workshop?')) {
      deleteWorkshop(id);
      setWorkshops(getAllWorkshops());
    }
  };

  const copyToClipboard = (slug) => {
    const url = `${window.location.origin}/${slug}/join`;
    navigator.clipboard.writeText(url);
    setCopySuccess(slug);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'live': return 'var(--accent-green)';
      case 'countdown': return 'var(--accent-blue)';
      case 'ended': return 'var(--accent-red)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <div className="admin-dashboard">
      <nav className="admin-nav">
        <div className="admin-nav__brand">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none">
            <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Workshop Studio
        </div>
        <div className="admin-nav__actions">
          <button onClick={() => navigate('/admin/create')} className="btn-primary">
            + Create New Workshop
          </button>
          <button onClick={handleLogout} className="btn-ghost">
            Logout
          </button>
        </div>
      </nav>

      <main className="admin-content">
        <header className="admin-header">
          <h1>My Workshops</h1>
          <p>You have {workshops.length} workshops configured.</p>
        </header>

        {workshops.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📁</div>
            <h2>No workshops yet</h2>
            <p>Ready to start? Create your first automated workshop link below.</p>
            <button onClick={() => navigate('/admin/create')} className="btn-primary">
              Get Started
            </button>
          </div>
        ) : (
          <div className="workshop-grid">
            {workshops.map((w) => {
              const status = getWebinarStatus(w.startTime, w.durationMinutes);
              const isLive = status === 'live';
              
              return (
                <div className="workshop-card" key={w.id}>
                  <div className="workshop-card__status">
                    <span 
                      className="status-dot" 
                      style={{ background: getStatusColor(status), boxShadow: `0 0 10px ${getStatusColor(status)}` }}
                    />
                    {status.toUpperCase()}
                  </div>
                  
                  <div className="workshop-card__main">
                    <h3>{w.title}</h3>
                    <div className="workshop-card__meta">
                      <span>📅 {new Date(w.startTime).toLocaleDateString()}</span>
                      <span>⏰ {new Date(w.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="workshop-card__slug">
                      /{w.slug}/join
                    </div>
                  </div>

                  <div className="workshop-card__footer">
                    <button 
                      onClick={() => copyToClipboard(w.slug)}
                      className="btn-action"
                    >
                      {copySuccess === w.slug ? 'Copied!' : 'Copy Link'}
                    </button>
                    <button 
                      onClick={() => navigate(`/${w.slug}/join`)}
                      className="btn-action"
                    >
                      Preview
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/edit/${w.id}`)}
                      className="btn-action"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(w.id)}
                      className="btn-action btn-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
