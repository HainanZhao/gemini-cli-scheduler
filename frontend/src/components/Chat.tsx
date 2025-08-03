
import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import '../../src/styles/Chat.css'; // Import a CSS file for styling

interface Message {
  type: 'user' | 'gemini';
  text: string;
}

const Chat: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!prompt.trim()) {
      setError('Prompt cannot be empty.');
      return;
    }

    const userMessage: Message = { type: 'user', text: prompt };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', { prompt });
      const geminiMessage: Message = { type: 'gemini', text: res.data.response };
      setMessages((prevMessages) => [...prevMessages, geminiMessage]);
    } catch (err) {
      setError('Error communicating with the server. Please try again.');
      console.error(err);
      const errorMessage: Message = { type: 'gemini', text: 'Error: Could not get a response.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <h2>Gemini Chat</h2>
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.type}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-message gemini loading">
            <p>Loading...</p>
          </div>
        )}
        {error && <p className="chat-error">{error}</p>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt"
          rows={3}
          className="chat-textarea"
          disabled={loading}
        />
        <button type="submit" className="chat-send-button" disabled={loading || !prompt.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
