import React from 'react';
import { bestPracticeSuggestions, successScore } from '../ai/aiEngine.js';

export default function SuccessScore({ ponds }) {
  const score = successScore(ponds);
  const suggestions = bestPracticeSuggestions(ponds).slice(0, 3);
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Predictive Success Scoring</p>
          <h3>Today’s outlook</h3>
          <p className="muted">Success probability with confidence-boosting steps.</p>
        </div>
        <div className="pill">{score}% optimal</div>
      </header>
      <div className="grid3">
        {suggestions.map((s, i) => (
          <div key={i} className="bubble-note">
            <strong>{s.title}</strong>
            <p className="muted">{s.detail}</p>
            <small className="muted">{s.costBenefit}</small>
          </div>
        ))}
      </div>
    </div>
  );
}
