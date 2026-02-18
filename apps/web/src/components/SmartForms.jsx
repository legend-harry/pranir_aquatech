import React, { useState } from 'react';

export default function SmartForms() {
  const [feed, setFeed] = useState('');
  const [ponds, setPonds] = useState(['A1']);
  const [feedback, setFeedback] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const amount = Number(feed);
    if (amount > 120) {
      setFeedback('You are about to log unusually high feeding — confirm and check FCR.');
    } else {
      setFeedback('Logged. Applied to: ' + ponds.join(', '));
    }
  };

  const togglePond = (id) => {
    setPonds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Smart Form Assistance</p>
          <h3>AI companion for data entry</h3>
          <p className="muted">Explains why fields matter, prevents errors, supports batch entry.</p>
        </div>
      </header>
      <form onSubmit={submit} className="form">
        <label>Feeding (kg) <span className="muted">AI checks for outliers</span></label>
        <input value={feed} onChange={(e) => setFeed(e.target.value)} placeholder="e.g., 95" required />

        <label>Apply to ponds</label>
        <div className="chip-row">
          {['A1', 'B3', 'C2'].map((id) => (
            <button
              key={id}
              type="button"
              className={ponds.includes(id) ? 'chip chip-active' : 'chip'}
              onClick={() => togglePond(id)}
            >
              {id}
            </button>
          ))}
        </div>

        <p className="muted">Why this matters: consistent feed logs improve FCR accuracy and alert quality.</p>
        <div className="btn-row">
          <button className="primary" type="submit">Save</button>
          <button className="ghost" type="button" onClick={() => setFeedback('Apply same parameters to all ponds today?')}>Suggest batch</button>
        </div>
        {feedback && <div className="alert soft">{feedback}</div>}
      </form>
    </div>
  );
}
