import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWorkshopById, saveWorkshop, DEFAULT_CHAT_MESSAGES } from '../utils/storage';

export default function WorkshopForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    durationMinutes: 60,
    ctaText: 'Join the Program Now',
    ctaTimeSeconds: 300,
    ctaLink: '',
    chatMessagesJson: JSON.stringify(DEFAULT_CHAT_MESSAGES, null, 2)
  });

  useEffect(() => {
    if (isEdit) {
      const existing = getWorkshopById(id);
      if (existing) {
        setFormData({
          ...existing,
          startTime: new Date(existing.startTime).toISOString().slice(0, 16),
          chatMessagesJson: JSON.stringify(existing.chatMessages || [], null, 2)
        });
      }
    }
  }, [id, isEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let chatMessages = [];
    try {
      chatMessages = JSON.parse(formData.chatMessagesJson);
    } catch {
      alert('Invalid JSON in chat messages field.');
      return;
    }

    const workshop = {
      ...formData,
      id: isEdit ? id : undefined,
      startTime: new Date(formData.startTime).toISOString(),
      chatMessages
    };
    
    // Clean up temporary field
    delete workshop.chatMessagesJson;

    saveWorkshop(workshop);
    navigate('/admin');
  };

  return (
    <div className="admin-form-page">
      <div className="admin-form-container">
        <header className="form-header">
          <button onClick={() => navigate('/admin')} className="btn-back">← Back to Dashboard</button>
          <h1>{isEdit ? 'Edit Workshop' : 'Create New Workshop'}</h1>
        </header>

        <form onSubmit={handleSubmit} className="premium-form">
          <div className="form-row">
            <div className="form-group flex-2">
              <label>Workshop Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="e.g. Video Editing Masterclass"
                required
              />
            </div>
            <div className="form-group flex-1">
              <label>Duration (Minutes)</label>
              <input 
                type="number" 
                value={formData.durationMinutes}
                onChange={e => setFormData({...formData, durationMinutes: parseInt(e.target.value)})}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>YouTube or Vimeo URL</label>
            <input 
              type="text" 
              value={formData.videoUrl}
              onChange={e => setFormData({...formData, videoUrl: e.target.value})}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time</label>
              <input 
                type="datetime-local" 
                value={formData.startTime}
                onChange={e => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
          </div>

          <hr className="form-separator" />
          <h3>Call to Action (CTA)</h3>
          
          <div className="form-row">
            <div className="form-group">
              <label>CTA Button Text</label>
              <input 
                type="text" 
                value={formData.ctaText}
                onChange={e => setFormData({...formData, ctaText: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Display Time (Seconds into video)</label>
              <input 
                type="number" 
                value={formData.ctaTimeSeconds}
                onChange={e => setFormData({...formData, ctaTimeSeconds: parseInt(e.target.value)})}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>CTA Link (Enrollment Link)</label>
            <input 
              type="url" 
              value={formData.ctaLink}
              onChange={e => setFormData({...formData, ctaLink: e.target.value})}
              placeholder="https://expertisoracademy.com/checkout"
            />
          </div>

          <hr className="form-separator" />
          <h3>Fake Chat Configuration (JSON)</h3>
          <div className="form-group">
            <textarea 
              rows="10"
              value={formData.chatMessagesJson}
              onChange={e => setFormData({...formData, chatMessagesJson: e.target.value})}
              spellCheck="false"
            />
            <p className="field-hint">Format: {"[ { \"time\": 5, \"name\": \"User\", \"message\": \"Hello\" } ]"}</p>
          </div>

          <div className="form-footer">
            <button type="button" onClick={() => navigate('/admin')} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {isEdit ? 'Save Changes' : 'Create Workshop Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
