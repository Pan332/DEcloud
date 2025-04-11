import React, { useState, useEffect, useRef } from 'react';
import './App.css'; // Import your updated CSS

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to the latest message when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Submit the user message
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (inputMessage.trim()) {
      addMessage(inputMessage, 'user');
      try {
        const response = await fetch('http://localhost:3000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: inputMessage }),
        });

        if (!response.ok) {
          throw new Error('Failed to communicate with server');
        }

        const data = await response.json();
        console.log(data);

        if (data.response) {
          addMessage(data.response, 'bot');
        } else {
          addMessage('Error: No response from the server.', 'bot');
        }
      } catch (error) {
        console.error('Error:', error);
        addMessage('Error: Unable to communicate with the server.', 'bot');
      }
      setInputMessage(''); // Clear input field
    }
  };

  // Helper function to add a message
  const addMessage = (text, sender) => {
    setMessages((prevMessages) => [...prevMessages, { text, sender }]);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  // Upload the selected file (PDF)
  const handleFileUpload = async () => {
    if (!selectedFile) {
      addMessage('Please select a file to upload.', 'bot');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      if (data.url) {
        addMessage(`File uploaded successfully! Access it [here](${data.url}).`, 'bot');
      } else {
        addMessage('Error: No response from the server.', 'bot');
      }
    } catch (error) {
      console.error('Error:', error);
      addMessage('Error: Unable to upload the file.', 'bot');
    }

    setSelectedFile(null); // Clear the selected file
  };

  return (
    <div className="App">
      <div className="chat-window">
        <ul className="messages-list">
          {messages.map((message, index) => (
            <li key={index} className={`message ${message.sender}`}>
              {message.text}
            </li>
          ))}
          <div ref={messagesEndRef} />
        </ul>
        <form onSubmit={handleSubmit} className="input-area">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
          />
          <button type="submit">Send</button>
        </form>
        <div className="file-upload-area">
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Upload PDF</button>
        </div>
      </div>
    </div>
  );
}

export default App;
