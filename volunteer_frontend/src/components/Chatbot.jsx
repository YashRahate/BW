import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      content: 'Hi! I\'m your beach cleanup assistant. Ask me about upcoming events, what to bring, safety tips, or anything related to beach conservation! 🏖️'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I couldn\'t process your request. Please try again.' }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I\'m having trouble connecting. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What should I bring to a cleanup?",
    "When is the next event?",
    "How do I register for events?",
    "What are safety protocols?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: '24px', right: '24px',
            backgroundColor: '#2563eb', color: 'white',
            padding: '12px', borderRadius: '9999px',
            border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            cursor: 'pointer', zIndex: 1000
          }}
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px',
          width: '384px', height: '500px',
          backgroundColor: 'white', borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          display: 'flex', flexDirection: 'column', zIndex: 1000
        }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#2563eb', color: 'white',
            padding: '12px 16px', borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px', display: 'flex',
            justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MessageCircle size={20} />
              <span style={{ fontWeight: 600 }}>Beach Cleanup Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'transparent', border: 'none',
                color: 'white', cursor: 'pointer', padding: '4px'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '16px', display: 'flex',
            flexDirection: 'column', gap: '16px'
          }}>
            {messages.map((msg, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '12px',
                  borderRadius: '8px',
                  backgroundColor: msg.role === 'user' ? '#2563eb' : '#f3f4f6',
                  color: msg.role === 'user' ? 'white' : '#111827',
                  fontSize: '14px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ backgroundColor: '#f3f4f6', padding: '12px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '9999px', animation: 'bounce 1s infinite' }} />
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '9999px', animation: 'bounce 1s infinite 0.1s' }} />
                  <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '9999px', animation: 'bounce 1s infinite 0.2s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div style={{
              padding: '12px', borderTop: '1px solid #e5e7eb',
              fontSize: '12px', color: '#6b7280'
            }}>
              <p style={{ marginBottom: '8px' }}>Quick questions:</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    style={{
                      fontSize: '12px', backgroundColor: '#f3f4f6',
                      padding: '4px 8px', borderRadius: '9999px',
                      border: 'none', cursor: 'pointer'
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about beach cleanups..."
                rows={1}
                disabled={isLoading}
                style={{
                  flex: 1, padding: '8px',
                  borderRadius: '8px', border: '1px solid #d1d5db',
                  resize: 'none', fontSize: '14px',
                  outline: 'none'
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                style={{
                  backgroundColor: !inputMessage.trim() || isLoading ? '#d1d5db' : '#2563eb',
                  color: 'white', padding: '8px',
                  borderRadius: '8px', border: 'none',
                  cursor: !inputMessage.trim() || isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
