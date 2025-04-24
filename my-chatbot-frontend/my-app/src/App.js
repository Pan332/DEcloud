import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Pixel art agent images
import agentNeutral from './assets/agent-neutral.png';
import agentHappy from './assets/agent-happy.png';
import agentConfused from './assets/agent-confused.png';
import agentThinking from './assets/agent-thinking.png';
import agentBad from './assets/agent-bad.png';
import agentthankyou from './assets/agent-thankyou.png';

const PixelArtChat = () => {
  const [messages, setMessages] = useState([ 
    { text: "Welcome to your pixel art interview! How can I help you today?", sender: 'bot' } 
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [role, setRole] = useState('Frontend Developer');
  const [agentExpression, setAgentExpression] = useState('neutral');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [sentimentData, setSentimentData] = useState(null);

  const agentExpressions = {
    neutral: agentNeutral,
    happy: agentHappy,
    confused: agentConfused,
    thinking: agentThinking,
    bad: agentBad,
    thankyou: agentthankyou
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text, sender, type = '') => {
    setMessages(prev => [...prev, { text, sender, type }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
  
    addMessage(inputMessage, 'user');
    setInputMessage('');
    setIsLoading(true);
    setAgentExpression('thinking');
  
    try {
      const history = messages.map(msg =>
        `${msg.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`
      ).join('\n');
  
      const response = await fetch('http://localhost:4001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: inputMessage, 
          role,
          history,
        }),
      });
  
      const data = await response.json();
      const botResponse = data.response;
      console.log('Sending to sentiment API:', { text: botResponse });
  
      const sentimentRes = await fetch('http://localhost:5001/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: botResponse }),
      });
  
      if (!sentimentRes.ok) {
        const errorText = await sentimentRes.text();
        console.error('Sentiment response error:', errorText);
        throw new Error('Sentiment API error');
      }
  
      const sentimentData = await sentimentRes.json();
      console.log('Sending to sentiment API:', { text: sentimentData});
      if (sentimentData.sentiment === 'positive') {
        setAgentExpression('happy');
      } else if (sentimentData.sentiment === 'negative') {
        setAgentExpression('bad');
      } else {
        setAgentExpression('neutral');
      }
  
      addMessage(botResponse, 'bot');
    } catch (error) {
      console.error('Error:', error);
      addMessage("Sorry, I encountered an error. Please try again.", 'bot', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWrapUp = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setAgentExpression('thinking');

    try {
      const history = messages.map(msg => 
        `${msg.sender === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`
      ).join('\n');

      const response = await fetch('http://localhost:4001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: '__WRAP_UP__',
          role,
          history 
        }),
        
      });
      const data = await response.json();
      const botResponse = data.response;
      console.log('Sending to sentiment API:', { text: botResponse });
  
      const sentimentRes = await fetch('http://localhost:5001/api/sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: botResponse }),
      });
  
      if (!sentimentRes.ok) {
        const errorText = await sentimentRes.text();
        console.error('Sentiment response error:', errorText);
        throw new Error('Sentiment API error');
      }
  
      const sentimentData = await sentimentRes.json();
      console.log('Sending to sentiment API:', { text: sentimentData});
      if (sentimentData.sentiment === 'positive') {
        setAgentExpression('happy');
      } else if (sentimentData.sentiment === 'negative') {
        setAgentExpression('bad');
      } else {
        setAgentExpression('neutral');
      }
      addMessage(data.response, 'bot');
    } catch (error) {
      console.error('Error:', error);
      addMessage("Failed to wrap up the interview.", 'bot', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async () => {
    if (!inputMessage.trim()) {
      addMessage("⚠️ Please enter your feedback before submitting.", 'bot', 'error');
      return;
    }
    if (isLoading) return;

    setIsLoading(true);
    setAgentExpression('thankyou');

    try {
      const response = await fetch('http://localhost:3002/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: inputMessage, role }),
      });

      const data = await response.json();

      if (response.ok) {
        addMessage("✅ Thank you for your feedback!", 'bot', 'success');
        setInputMessage('');
      } else {
        addMessage(`❌ Failed to submit: ${data.error || 'Unknown error'}`, 'bot', 'error');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      addMessage("❌ Network error - please try again later.", 'bot', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pixel-chat-container">
      <div className="chat-history-container">
        <div className="role-selector">
          <h2 className="pixel-header">Pixel Interviewer</h2>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="pixel-select"
            disabled={isLoading}
          >
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Data Scientist">Data Scientist</option>
            <option value="UX Designer">UX Designer</option>
            <option value="Software Engineer">Software Engineer</option>
            <option value="Data Engineer">Data Engineer</option>
            <option value="DevOps">DevOps</option>
            <option value="DevOps">Cybersecurity</option>
          </select>
        </div>

        <div className="chat-history">
          {messages.map((msg, i) => (
            <div key={i} className={`message ${msg.sender} ${msg.type || ''}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && (
            <div className="message bot">
              <div className="typing-indicator">
                <span>•</span>
                <span>•</span>
                <span>•</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="pixel-scene">
        <img
          src={agentExpressions[agentExpression]}
          alt="Pixel Art Agent"
          className="pixel-agent"
        />
      </div>

      <div className="chat-ui">
        <form onSubmit={handleSubmit} className="input-area">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="pixel-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="pixel-button"
            disabled={isLoading}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </form>

        <div className="bottom-buttons">
          <button 
            type="button" 
            onClick={handleFeedback} 
            className="pixel-button red-button"
            disabled={isLoading}
          >
            Submit Feedback
          </button>
          <button 
            type="button" 
            onClick={handleWrapUp} 
            className="pixel-button red-button"
            disabled={isLoading}
          >
            Finish Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PixelArtChat;
