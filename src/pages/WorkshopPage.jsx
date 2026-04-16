import { useParams, useNavigate } from 'react-router-dom';
import { useWebinarSession } from '../hooks/useWebinarSession';

import TopBar from '../components/TopBar';
import VideoPlayer from '../components/VideoPlayer';
import ChatPanel from '../components/ChatPanel';
import CTAButton from '../components/CTAButton';
import CountdownPage from '../components/CountdownPage';
import SessionEnded from '../components/SessionEnded';
import { useFakeChat } from '../hooks/useFakeChat';

export default function WorkshopPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { session, status, elapsedSeconds, secondsUntilStart } = useWebinarSession(slug);

  // Sync fake chat messages with video time
  const { messages, sendMessage } = useFakeChat(
    status === 'live' ? session?.chatMessages : [],
    elapsedSeconds
  );

  if (status === 'loading') {
    return (
      <div className="status-screen">
        <div className="loader"></div>
        <p>Loading session...</p>
      </div>
    );
  }

  if (status === 'no-session') {
    return (
      <div className="status-screen">
        <div className="error-icon">⚠️</div>
        <h1>Workshop Not Found</h1>
        <p>The link you followed seems to be invalid or the workshop has been removed.</p>
        <button onClick={() => navigate('/')} className="btn-primary" style={{ marginTop: 20 }}>
          Back to Home
        </button>
      </div>
    );
  }

  // Handle different webinar states
  if (status === 'countdown') {
    return <CountdownPage title={session?.title} secondsUntilStart={secondsUntilStart} />;
  }

  if (status === 'ended') {
    return <SessionEnded title={session?.title} />;
  }

  // --- LIVE STATE ---
  const isCTAVisible = elapsedSeconds >= (session?.ctaTimeSeconds || 0);

  return (
    <div className="webinar-layout" id="webinar-viewport">
      <TopBar title={session?.title} />
      
      <main className="webinar-main-content">
        <div className="video-section">
          <VideoPlayer 
            vimeoVideoId={session?.videoUrl} 
            elapsedSeconds={elapsedSeconds} 
            onTimeUpdate={() => {}} // Time is controlled by the hook now
          />
          <CTAButton 
            visible={isCTAVisible} 
            text={session?.ctaText} 
            link={session?.ctaLink} 
          />
        </div>
        
        <aside className="chat-section">
          <ChatPanel 
            messages={messages} 
            onSendMessage={sendMessage} 
          />
        </aside>
      </main>
    </div>
  );
}
