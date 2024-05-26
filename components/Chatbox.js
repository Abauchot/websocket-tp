// components/Chatbox.js
import { useState, useEffect, useRef } from 'react';

export default function Chatbox({ username, socket, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });
    }

    return () => {
      if (socket) {
        socket.off('receiveMessage');
      }
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = { user: username, text: message };
      socket.emit('sendMessage', newMessage);
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessage('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div>
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.user}: </strong>{msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message"
        style={{ color: 'black' }}
      />
      <button onClick={handleSendMessage}>Send</button>
      <button onClick={onLogout}>Se déconnecter</button>
      <style jsx>{`
        .chat-box {
          border: 1px solid #ccc;
          padding: 10px;
          width: 300px;
          height: 200px;
          overflow-y: scroll;
        }
      `}</style>
    </div>
  );
}
