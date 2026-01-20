import React, { useMemo } from 'react';
import { roleBasedView, successScore, comparePerformance } from '../ai/aiEngine.js';

export default function Dashboard({ ponds, role }) {
  const view = roleBasedView(role);
  const score = successScore(ponds);
  const comparisons = comparePerformance(ponds);

  const prioritized = useMemo(() => {
    const hour = new Date().getHours();
    const isMorning = hour < 12;
    return [...ponds].sort((a, b) => {
      const alertA = a.ammonia > 0.5 ? 1 : 0;
      const alertB = b.ammonia > 0.5 ? 1 : 0;
      const phaseBoost = (p) => (p.phase === 'operation' ? 1 : 0) + (isMorning ? (p.phase === 'stocking' ? 1 : 0) : 0);
      return (alertB + phaseBoost(b)) - (alertA + phaseBoost(a));
    });
  }, [ponds]);

  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Intelligent Dashboard</p>
          <h2>Focus Mode</h2>
          <p className="muted">Dynamic layout based on phase, alerts, and time of day.</p>
        </div>
        <div className="pill">Success score: {score}%</div>
      </header>

      <div className="grid3">
        {prioritized.map((p) => (
          <div key={p.id} className="pond-card">
            <div className="pond-head">
              <strong>{p.name}</strong>
              <span className={`tag ${p.ammonia > 0.5 ? 'tag-critical' : 'tag-good'}`}>
                {p.ammonia > 0.5 ? 'Attention' : 'Stable'}
              </span>
            </div>
            <p className="muted">Phase: {p.phase} • Day {p.day}</p>
            <div className="metric-row">
              <span>FCR</span>
              <strong>{p.fcr.toFixed(2)}</strong>
            </div>
            <div className="metric-row">
              <span>Survival</span>
              <strong>{Math.round(p.survival * 100)}%</strong>
            </div>
            <div className="metric-row">
              <span>DO</span>
              <strong>{p.dissolvedOxygen.toFixed(1)} mg/L</strong>
            </div>
            <div className="metric-row">
              <span>Ammonia</span>
              <strong>{p.ammonia.toFixed(2)} ppm</strong>
            </div>
            <div className="muted">What to do next: {p.ammonia > 0.5 ? 'Plan water exchange; reduce feed' : 'Log parameters'}</div>
          </div>
        ))}
      </div>

      <div className="grid3">
        {comparisons.map((c) => (
          <div key={c.pondId} className="bubble-note">
            <strong>{c.pondId}</strong> {c.delta}: {c.insight}
          </div>
        ))}
      </div>

      <div className="pill info">View mode for {role}: {view.join(', ')}</div>
    </div>
  );
}
