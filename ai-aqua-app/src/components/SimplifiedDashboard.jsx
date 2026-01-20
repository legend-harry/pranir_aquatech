import React, { useMemo } from 'react';
import { successScore } from '../ai/aiEngine.js';

export default function SimplifiedDashboard({ ponds, role }) {
  const score = successScore(ponds);

  const essentialPonds = useMemo(() => {
    return [...ponds].sort((a, b) => (b.ammonia > 0.5 ? 1 : 0) - (a.ammonia > 0.5 ? 1 : 0)).slice(0, 2);
  }, [ponds]);

  return (
    <div className="card card-large">
      <header className="card-head">
        <div>
          <p className="eyebrow">Your Ponds</p>
          <h2>Today's Overview</h2>
        </div>
        <div className="pill">{score}% Healthy</div>
      </header>

      <div className="grid2-simple">
        {essentialPonds.map((p) => (
          <div key={p.id} className="pond-simple">
            <div className="pond-name">{p.name}</div>
            <div className="pond-large-metric">
              <span className="metric-label">Status</span>
              <span className={`metric-badge ${p.ammonia > 0.5 ? 'warning' : 'good'}`}>
                {p.ammonia > 0.5 ? '⚠ Needs care' : '✓ All good'}
              </span>
            </div>
            <div className="simple-metrics">
              <div>
                <span className="metric-label">Survival</span>
                <span className="metric-large">{Math.round(p.survival * 100)}%</span>
              </div>
              <div>
                <span className="metric-label">Temperature</span>
                <span className="metric-large">{p.temperature}°C</span>
              </div>
            </div>
            {p.ammonia > 0.5 && (
              <div className="action-prompt">
                <strong>Next action:</strong> Plan water exchange and reduce feed
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="simple-actions">
        <button className="btn-primary btn-large">Log Daily Data</button>
        <button className="btn-secondary btn-large">View Alerts</button>
      </div>
    </div>
  );
}
