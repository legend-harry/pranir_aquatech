import React from 'react';
import { knowledgeMatches } from '../ai/aiEngine.js';

export default function KnowledgeSurface({ ponds }) {
  const matches = knowledgeMatches(ponds);
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Proactive Knowledge</p>
          <h3>Context-aware tips</h3>
          <p className="muted">Articles surface automatically when conditions warrant.</p>
        </div>
      </header>
      <div className="grid2">
        {matches.map((m) => (
          <div key={m.id} className="bubble-note">
            <strong>{m.title}</strong>
            <p className="muted">{m.summary}</p>
          </div>
        ))}
        {matches.length === 0 && <p className="muted">No triggered content right now.</p>}
      </div>
    </div>
  );
}
