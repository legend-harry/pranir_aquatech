import React, { useState } from 'react';

const canned = [
  {
    q: 'Why is my feed conversion ratio high?',
    a: 'Likely causes: overfeeding, low DO reducing appetite, or poor feed quality. Reduce feed 5% and run aerators during feeding windows.',
  },
  {
    q: 'What should I do about this dead shrimp I found?',
    a: 'Remove immediately, check ammonia and DO, and inspect nearby shrimp for lethargy. Consider 10% water exchange.',
  },
  {
    q: 'Show me ponds that need attention today',
    a: 'A1: ammonia trending up; C2: DO dip expected at 2 PM. Focus there first.',
  },
];

export default function ChatAssistant() {
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi! Ask me about feed, water quality, or today’s priorities.' },
  ]);
  const [input, setInput] = useState('');

  const send = (text) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { from: 'user', text }]);
    const match = canned.find((c) => text.toLowerCase().includes(c.q.toLowerCase().slice(0, 12)));
    const reply = match ? match.a : "Here's a quick checklist: test DO, test ammonia, log feed, review alerts.";
    setTimeout(() => setMessages((m) => [...m, { from: 'ai', text: reply }]), 400);
    setInput('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  const voiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input not supported in this browser.');
      return;
    }
    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      send(transcript);
    };
    recog.start();
  };

  return (
    <div className="card chat">
      <header className="card-head">
        <div>
          <p className="eyebrow">Conversational AI</p>
          <h3>Ask anything, anywhere</h3>
          <p className="muted">Unified assistant with voice input for field use.</p>
        </div>
        <button className="ghost" onClick={voiceInput}>🎤 Voice</button>
      </header>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={m.from === 'ai' ? 'bubble ai' : 'bubble user'}>
            {m.text}
          </div>
        ))}
      </div>
      <form className="chat-input" onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about feed, water quality, or tasks..."
        />
        <button type="submit" className="primary">Send</button>
      </form>
    </div>
  );
}
