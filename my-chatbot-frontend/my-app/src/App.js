import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [role, setRole] = useState('Frontend Developer');
  const messagesEndRef = useRef(null);

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!inputMessage.trim()) return;

    addMessage(inputMessage, 'user');

    try {
      const response = await fetch('http://localhost:4001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputMessage, role }),
      });

      const data = await response.json();
      addMessage(data.response || 'No response from server.', 'bot');
    } catch (error) {
      console.error('Error:', error);
      addMessage('Error: Unable to communicate with the server.', 'bot');
    }

    setInputMessage('');
  };

  const handleWrapUp = async () => {
    try {
      const response = await fetch('http://localhost:4001/api/chat', {
      const history = messages
        .map((msg) => `${msg.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`)
        .join('\n');
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: '__WRAP_UP__', role, history }),
      });

      const data = await response.json();
      addMessage(data.response || 'No response from server.', 'bot');
    } catch (error) {
      console.error('Error:', error);
      addMessage('Error: Could not finish the interview.', 'bot');
    }
  };

  const handleFeedback = async () => {
    if (!inputMessage.trim()) {
      alert('Please enter your feedback.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: inputMessage, role }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Feedback submitted successfully!');
        setInputMessage('');
      } else {
        alert(`❌ Failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      alert('❌ Error: Could not send feedback.');
    }
  };

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  return (
    <div className="App">
      <div className="chat-window">
        <h2 className="header">Mock Interview Chatbot</h2>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="role-dropdown">
          <option value="Frontend Developer">Frontend Developer</option>
          <option value="Backend Developer">Backend Developer</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="UX Designer">UX Designer</option>
        </select>

        <ul className="messages-list">
          {messages.map((msg, i) => (
            <li key={i} className={`message ${msg.sender}`}>
              {msg.text}
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>

        <form onSubmit={handleSubmit} className="input-area">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Your response or feedback..."
          />
          <button type="submit">Send</button>
          <button type="button" onClick={handleWrapUp} className="wrap-up-button">
            Finish Interview
          </button>
        </form>

        <div className="bottom-buttons">
          <button type="button" onClick={handleFeedback} className="wrap-up-button red-button">
            Submit Feedback
          </button>
          <button type="button" onClick={handleWrapUp} className="wrap-up-button red-button">
            Finish Interview
          </button>

        </div>

      </div>
    </div>
  );
}

export default App;
