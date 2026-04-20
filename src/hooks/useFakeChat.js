import { useState, useEffect, useRef, useMemo } from 'react';

/**
 * Hook that manages fake chat messages based on current video time.
 * User messages are stored in local React state only — complete isolation.
 * User A never sees User B's messages. Only fake/admin messages are universal.
 */
export function useFakeChat(chatMessages, currentVideoTime) {
  const [userMessages, setUserMessages] = useState([]);
  const prevCountRef = useRef(0);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const fakeMessages = useMemo(() => {
    return (chatMessages || []).filter(m => m.time <= currentVideoTime);
  }, [chatMessages, currentVideoTime]);

  useEffect(() => {
    if (fakeMessages.length > prevCountRef.current) {
      setHasNewMessage(true);
      setTimeout(() => setHasNewMessage(false), 500);
    }
    prevCountRef.current = fakeMessages.length;
  }, [fakeMessages.length]);

  const addUserMessage = (name, message) => {
    setUserMessages(prev => [
      ...prev,
      {
        time: currentVideoTime,
        name,
        message,
        isUser: true,
        id: `user-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      },
    ]);
  };

  // Merge fake + user messages, sorted by time
  const allMessages = [
    ...fakeMessages.map((m, i) => ({ ...m, id: `chat-${i}` })),
    ...userMessages,
  ].sort((a, b) => a.time - b.time);

  return { messages: allMessages, hasNewMessage, addUserMessage };
}
