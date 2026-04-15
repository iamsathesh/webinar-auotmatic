import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveSession, getSession, getDefaultSession } from '../utils/storage';

const DEFAULT_CHAT = [
  { "time": 5, "name": "Rahul Sharma", "message": "Hey everyone! Excited for this session 🙌" },
  { "time": 15, "name": "Priya Mehta", "message": "Finally joined, been waiting for this!" },
  { "time": 30, "name": "Ankit Verma", "message": "Can everyone hear the audio clearly?" },
  { "time": 45, "name": "Sneha Reddy", "message": "Yes audio is perfect" },
  { "time": 60, "name": "Karan Singh", "message": "Which topic are we covering first?" },
  { "time": 80, "name": "Deepika Patel", "message": "This is going to be amazing! 🎉" },
  { "time": 100, "name": "Vikram Joshi", "message": "I have been struggling with this for months" },
  { "time": 120, "name": "Rahul Sharma", "message": "This is really useful information" },
  { "time": 150, "name": "Meera Nair", "message": "Can you share the slides later?" },
  { "time": 180, "name": "Arjun Das", "message": "Great explanation! Very clear 👍" },
  { "time": 210, "name": "Priya Mehta", "message": "I had this exact problem last week" },
  { "time": 240, "name": "Rohan Gupta", "message": "This makes so much more sense now" },
  { "time": 270, "name": "Anjali Kumar", "message": "Is there a community group we can join?" },
  { "time": 300, "name": "Siddharth Rao", "message": "Mind blown 🤯 Never thought of it this way" },
  { "time": 340, "name": "Neha Agarwal", "message": "Taking notes furiously lol" },
  { "time": 380, "name": "Karan Singh", "message": "This is worth every minute" },
  { "time": 420, "name": "Pooja Iyer", "message": "Can you repeat that last point?" },
  { "time": 470, "name": "Rahul Sharma", "message": "Bookmarking this for sure" },
  { "time": 520, "name": "Deepika Patel", "message": "My team needs to see this" },
  { "time": 580, "name": "Vikram Joshi", "message": "How do we get access to the resources?" },
  { "time": 640, "name": "Amit Tiwari", "message": "Just joined! What did I miss?" },
  { "time": 700, "name": "Sneha Reddy", "message": "This is the best webinar I've attended this year" },
  { "time": 760, "name": "Arjun Das", "message": "Will there be a recording available?" },
  { "time": 830, "name": "Meera Nair", "message": "I'm applying this tomorrow at work 💪" },
  { "time": 900, "name": "Priya Mehta", "message": "Everyone should share this with their network" },
  { "time": 980, "name": "Rohan Gupta", "message": "The practical examples are so helpful" },
  { "time": 1060, "name": "Anjali Kumar", "message": "Thank you for making this so clear!" },
  { "time": 1150, "name": "Siddharth Rao", "message": "Is there a certification after this?" },
  { "time": 1250, "name": "Neha Agarwal", "message": "I've been looking for exactly this kind of training" },
  { "time": 1350, "name": "Karan Singh", "message": "How much is the full course?" },
  { "time": 1450, "name": "Pooja Iyer", "message": "Shut up and take my money 😂" },
  { "time": 1560, "name": "Deepika Patel", "message": "Is there an early bird discount?" },
  { "time": 1680, "name": "Vikram Joshi", "message": "I'm definitely enrolling!" },
  { "time": 1800, "name": "Rahul Sharma", "message": "Thank you so much for this amazing session! 🙏" },
  { "time": 1920, "name": "Amit Tiwari", "message": "Best investment I'll make this year" },
  { "time": 2100, "name": "Sneha Reddy", "message": "Just enrolled! Can't wait to start 🚀" },
  { "time": 2400, "name": "Arjun Das", "message": "Everyone seems to be enrolling, I better hurry!" },
  { "time": 2700, "name": "Priya Mehta", "message": "The offer is live! Check the button below 👇" },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState(() => {
    const existing = getSession();
    if (existing) {
      return {
        title: existing.title || '',
        vimeoVideoId: existing.vimeoVideoId || '',
        startTime: existing.startTime ? existing.startTime.slice(0, 16) : '',
        durationMinutes: existing.durationMinutes || 60,
        ctaText: existing.ctaText || 'Enroll Now for ₹15,000',
        ctaTimeSeconds: existing.ctaTimeSeconds || 2700,
        ctaLink: existing.ctaLink || '',
        chatJson: JSON.stringify(existing.chatMessages || DEFAULT_CHAT, null, 2),
      };
    }

    const defaults = getDefaultSession();
    return {
      title: defaults.title,
      vimeoVideoId: defaults.vimeoVideoId,
      startTime: defaults.startTime.slice(0, 16),
      durationMinutes: defaults.durationMinutes,
      ctaText: defaults.ctaText,
      ctaTimeSeconds: defaults.ctaTimeSeconds,
      ctaLink: defaults.ctaLink,
      chatJson: JSON.stringify(DEFAULT_CHAT, null, 2),
    };
  });

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate
    if (!form.title.trim()) {
      showToast('Please enter a webinar title', true);
      return;
    }
    if (!form.vimeoVideoId.trim()) {
      showToast('Please enter a video URL or ID', true);
      return;
    }
    if (!form.startTime) {
      showToast('Please set a start time', true);
      return;
    }

    let chatMessages = [];
    try {
      chatMessages = JSON.parse(form.chatJson);
      if (!Array.isArray(chatMessages)) throw new Error('Not an array');
    } catch {
      showToast('Invalid chat JSON format', true);
      return;
    }

    // Pass raw input — VideoPlayer auto-detects YouTube vs Vimeo
    const session = {
      title: form.title.trim(),
      vimeoVideoId: form.vimeoVideoId.trim(),
      startTime: new Date(form.startTime).toISOString(),
      durationMinutes: parseInt(form.durationMinutes) || 60,
      ctaText: form.ctaText.trim() || 'Enroll Now',
      ctaTimeSeconds: parseInt(form.ctaTimeSeconds) || 2700,
      ctaLink: form.ctaLink.trim() || '#',
      chatMessages,
    };

    const success = saveSession(session);
    if (success) {
      showToast('Session saved successfully! Redirecting...');
      setTimeout(() => navigate('/webinar'), 1200);
    } else {
      showToast('Failed to save session', true);
    }
  };

  const handlePreview = () => {
    // Quick-save with start time = now for immediate preview
    let chatMessages = [];
    try {
      chatMessages = JSON.parse(form.chatJson);
    } catch {
      chatMessages = DEFAULT_CHAT;
    }

    const session = {
      title: form.title.trim() || 'Preview Webinar',
      vimeoVideoId: form.vimeoVideoId.trim() || '76979871',
      startTime: new Date().toISOString(),
      durationMinutes: parseInt(form.durationMinutes) || 60,
      ctaText: form.ctaText.trim() || 'Enroll Now',
      ctaTimeSeconds: parseInt(form.ctaTimeSeconds) || 2700,
      ctaLink: form.ctaLink.trim() || '#',
      chatMessages,
    };

    saveSession(session);
    navigate('/webinar');
  };

  const showToast = (message, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="admin-page" id="admin-page">
      {toast && (
        <div className={`toast ${toast.isError ? 'toast--error' : ''}`} id="toast">
          {toast.message}
        </div>
      )}

      <div className="admin-page__header">
        <div className="admin-page__logo">
          <div className="admin-page__logo-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M23 7l-7 5 7 5V7z" fill="white"/>
              <rect x="1" y="5" width="15" height="14" rx="2" fill="white"/>
            </svg>
          </div>
          Webinar Studio
        </div>
        <p className="admin-page__description">
          Configure your fake live webinar session
        </p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit} id="admin-form">
        {/* Basic Info */}
        <div className="admin-form__card">
          <h3 className="admin-form__card-title">
            <svg viewBox="0 0 24 24">
              <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z" fill="currentColor"/>
            </svg>
            Basic Information
          </h3>

          <div className="form-group">
            <label htmlFor="title">Webinar Title</label>
            <input
              type="text"
              id="title"
              value={form.title}
              onChange={handleChange('title')}
              placeholder="e.g. Master Digital Marketing in 2026"
            />
          </div>

          <div className="form-group">
            <label htmlFor="vimeoVideoId">Video URL or ID (YouTube / Vimeo)</label>
            <input
              type="text"
              id="vimeoVideoId"
              value={form.vimeoVideoId}
              onChange={handleChange('vimeoVideoId')}
              placeholder="e.g. https://youtu.be/ATIht_sFrZ4 or https://vimeo.com/76979871"
            />
            <p className="form-group__hint">
              Paste a YouTube URL, Vimeo URL, or video ID. Both platforms are supported.
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="admin-form__card">
          <h3 className="admin-form__card-title">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            Schedule
          </h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startTime">Start Time</label>
              <input
                type="datetime-local"
                id="startTime"
                value={form.startTime}
                onChange={handleChange('startTime')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="durationMinutes">Duration (minutes)</label>
              <input
                type="number"
                id="durationMinutes"
                value={form.durationMinutes}
                onChange={handleChange('durationMinutes')}
                min="1"
                max="480"
                placeholder="60"
              />
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="admin-form__card">
          <h3 className="admin-form__card-title">
            <svg viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor"/>
            </svg>
            Call to Action
          </h3>

          <div className="form-group">
            <label htmlFor="ctaText">CTA Button Text</label>
            <input
              type="text"
              id="ctaText"
              value={form.ctaText}
              onChange={handleChange('ctaText')}
              placeholder="e.g. Enroll Now for ₹15,000"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="ctaTimeSeconds">Appear After (seconds)</label>
              <input
                type="number"
                id="ctaTimeSeconds"
                value={form.ctaTimeSeconds}
                onChange={handleChange('ctaTimeSeconds')}
                min="0"
                placeholder="2700"
              />
              <p className="form-group__hint">
                CTA appears after this many seconds of video playback (e.g. 2700 = 45 min)
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="ctaLink">CTA Link URL</label>
              <input
                type="text"
                id="ctaLink"
                value={form.ctaLink}
                onChange={handleChange('ctaLink')}
                placeholder="https://your-course.com/enroll"
              />
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="admin-form__card">
          <h3 className="admin-form__card-title">
            <svg viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" fill="currentColor"/>
            </svg>
            Chat Messages
          </h3>

          <div className="form-group">
            <label htmlFor="chatJson">Chat JSON</label>
            <textarea
              id="chatJson"
              value={form.chatJson}
              onChange={handleChange('chatJson')}
              placeholder='[{ "time": 120, "name": "Rahul", "message": "This is useful" }]'
              rows={12}
            />
            <p className="form-group__hint">
              JSON array. Each message has "time" (seconds), "name", and "message" fields.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="admin-form__actions">
          <button type="button" className="btn btn--secondary" onClick={handlePreview} id="btn-preview">
            ▶ Preview Now
          </button>
          <button type="submit" className="btn btn--primary" id="btn-save">
            💾 Save & Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
