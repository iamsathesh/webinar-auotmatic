import { useEffect, useRef, useState } from 'react';
import { getAvatarColor, getInitials, formatChatTime } from '../utils/timeUtils';

/**
 * Collapsible chat panel.
 * Desktop: slides in/out from right side.
 * Mobile: bottom sheet that slides up/down.
 * User messages are local-only — other users never see them.
 */
export default function ChatPanel({ messages, onSendMessage, isOpen, onToggle, unreadCount }) {
  const messagesEndRef = useRef(null);
  const [inputValue, setInputValue] = useState('');

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage('You', inputValue.trim());
    setInputValue('');
  };

  return (
    <>
      {/* Floating chat toggle pill — visible when chat is closed */}
      {!isOpen && (
        <button className="chat-toggle-pill" onClick={onToggle} id="chat-toggle-pill">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Chat
          {unreadCount > 0 && (
            <span className="chat-toggle-pill__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      )}

      {/* Mobile backdrop overlay */}
      {isOpen && <div className="chat-backdrop" onClick={onToggle} />}

      {/* The actual chat panel */}
      <div className={`chat-panel ${isOpen ? 'chat-panel--open' : 'chat-panel--closed'}`} id="chat-panel">
        {/* Header */}
        <div className="chat-panel__header">
          <div className="chat-panel__header-left">
            <span className="chat-panel__live-dot" />
            <h3>Live Chat</h3>
            <span className="chat-panel__count">{messages.length}</span>
          </div>
          <button className="chat-panel__close-btn" onClick={onToggle} aria-label="Close chat">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chat-panel__messages" id="chat-messages">
          {messages.length === 0 && (
            <div className="chat-panel__empty">
              Chat messages will appear as the session progresses...
            </div>
          )}

          {messages.map((msg) => (
            <div className={`chat-msg ${msg.isUser ? 'chat-msg--user' : ''}`} key={msg.id} id={`msg-${msg.id}`}>
              <div
                className="chat-msg__avatar"
                style={{ background: getAvatarColor(msg.name) }}
              >
                {getInitials(msg.name)}
              </div>
              <div className="chat-msg__body">
                <div className="chat-msg__name">
                  {msg.name}
                  {msg.isUser && <span className="chat-msg__you-badge">YOU</span>}
                </div>
                <div className="chat-msg__text">{msg.message}</div>
                <div className="chat-msg__time">{formatChatTime(msg.time)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form className="chat-panel__input-area" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-panel__input"
            id="chat-input"
            placeholder="Type a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            maxLength={200}
            autoComplete="off"
          />
          <button type="submit" className="chat-panel__send-btn" id="chat-send-btn" aria-label="Send message">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
