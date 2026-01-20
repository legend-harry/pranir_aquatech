import React from 'react';
import { whatsNext } from '../ai/aiEngine.js';

export default function WhatsNext({ ponds }) {
  const prompts = whatsNext(ponds);
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Predictive Guidance</p>
          <h3>"What’s next" prompts</h3>
          <p className="muted">Context-aware next steps at decision points.</p>
        </div>
      </header>
      <div className="grid2">
        {prompts.map((p) => (
          <div key={p.pondId} className="bubble-note">
            <strong>{p.pondId}</strong>
            <ul className="list">
              {p.actions.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
