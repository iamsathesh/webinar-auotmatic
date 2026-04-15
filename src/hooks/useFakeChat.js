import { useState, useEffect, useRef } from 'react';

/**
 * Hook that manages fake chat messages based on current video time.
 * Returns visible messages + user messages.
 */
export function useFakeChat(chatMessages, currentVideoTime) {
  const [visibleMessages, setVisibleMessages] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const prevCountRef = useRef(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  useEffect(() => {
    if (!chatMessages || chatMessages.length === 0) return;

    const nowVisible = chatMessages.filter(msg => currentVideoTime >= msg.time);

    if (nowVisible.length !== prevCountRef.current) {
      if (nowVisible.length > prevCountRef.current) {
        setHasNewMessage(true);
        // Reset after a brief moment
        setTimeout(() => setHasNewMessage(false), 500);
      }
      prevCountRef.current = nowVisible.length;
      setVisibleMessages(nowVisible);
    }
  }, [chatMessages, currentVideoTime]);

  const addUserMessage = (name, message) => {
    setUserMessages(prev => [
      ...prev,
      {
        time: currentVideoTime,
        name,
        message,
        isUser: true,
        id: `user-${Date.now()}`,
      },
    ]);
  };

  // Merge and sort all messages
  const allMessages = [
    ...visibleMessages.map((m, i) => ({ ...m, id: `chat-${i}` })),
    ...userMessages,
  ].sort((a, b) => a.time - b.time);

  return { messages: allMessages, hasNewMessage, addUserMessage };
}
