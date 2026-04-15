import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Hook that manages fake chat messages based on current video time.
 * Returns visible messages + user messages.
 */
export function useFakeChat(chatMessages, currentVideoTime) {
  const [userMessages, setUserMessages] = useState([]);
  const prevCountRef = useRef(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const messages = useMemo(() => {
    return (chatMessages || []).filter(m => m.time <= currentVideoTime);
  }, [chatMessages, currentVideoTime]);

  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      requestAnimationFrame(() => {
        setHasNewMessage(true);
        // Reset after a brief moment
        setTimeout(() => setHasNewMessage(false), 500);
      });
    }
    prevCountRef.current = messages.length;
  }, [messages.length]);

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
    ...messages.map((m, i) => ({ ...m, id: `chat-${i}` })),
    ...userMessages,
  ].sort((a, b) => a.time - b.time);

  return { messages: allMessages, hasNewMessage, addUserMessage };
}
