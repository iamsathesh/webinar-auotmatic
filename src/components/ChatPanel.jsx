import { useEffect, useRef, useState } from 'react';
import { getAvatarColor, getInitials, formatChatTime } from '../utils/timeUtils';

/**
 * Chat panel with fake messages synced to video time + user input area.
 */
export default function ChatPanel({ messages, hasNewMessage, onSendMessage }) {
  const messagesEndRef = useRef(null);
  const [inputValue, setInputValue] = useState('');

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSendMessage('You', inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="chat-panel" id="chat-panel">
      <div className="chat-panel__header">
        <h3>💬 Live Chat</h3>
        <span>{messages.length} messages</span>
      </div>

      <div className="chat-panel__messages" id="chat-messages">
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-muted)',
            fontSize: 'var(--font-size-sm)',
          }}>
            Chat messages will appear as the session progresses...
          </div>
        )}

        {messages.map((msg) => (
          <div className="chat-message" key={msg.id} id={`msg-${msg.id}`}>
            <div
              className="chat-message__avatar"
              style={{ background: getAvatarColor(msg.name) }}
            >
              {getInitials(msg.name)}
            </div>
            <div className="chat-message__content">
              <div className="chat-message__name">
                {msg.name}
                {msg.isUser && (
                  <span style={{
                    marginLeft: 6,
                    fontSize: '0.6rem',
                    background: 'var(--accent-blue)',
                    color: 'white',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                  }}>
                    YOU
                  </span>
                )}
              </div>
              <div className="chat-message__text">{msg.message}</div>
              <div className="chat-message__time">{formatChatTime(msg.time)}</div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-panel__input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-panel__input"
          id="chat-input"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          maxLength={200}
        />
        <button type="submit" className="chat-panel__send-btn" id="chat-send-btn" aria-label="Send message">
          <svg viewBox="0 0 24 24">
            <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
