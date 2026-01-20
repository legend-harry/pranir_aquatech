import React from 'react';
import { predictiveAlerts } from '../ai/aiEngine.js';

export default function AlertCenter({ ponds, weather }) {
  const anticipatory = predictiveAlerts(ponds, weather);
  const grouped = anticipatory.reduce((acc, a) => {
    acc[a.severity] = acc[a.severity] || [];
    acc[a.severity].push(a);
    return acc;
  }, {});

  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Intelligent Alerts</p>
          <h3>Tiered, actionable, fatigue-aware</h3>
          <p className="muted">Anticipatory alerts with clear actions and follow-ups.</p>
        </div>
      </header>
      <div className="grid3">
        {Object.entries(grouped).map(([severity, list]) => (
          <div key={severity} className="pond-card">
            <div className="pond-head">
              <strong>{severity.toUpperCase()}</strong>
              <span className={`tag ${severity === 'critical' ? 'tag-critical' : 'tag-info'}`}>{list.length} alerts</span>
            </div>
            <ul className="list">
              {list.map((a) => (
                <li key={a.pondId}>
                  <strong>{a.pondId}</strong> — {a.message}
                  <div className="muted">ETA {a.eta} • Follow-up scheduled</div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
