import React from 'react';
import { parameterTrends } from '../ai/aiEngine.js';

export default function ParameterInsights({ ponds }) {
  const insights = parameterTrends(ponds);
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Automated Parameter Analysis</p>
          <h3>Trends & anomalies</h3>
          <p className="muted">Auto-highlight issues, predict 24h trajectories, suggest missing logs.</p>
        </div>
      </header>
      <div className="grid3">
        {insights.map((i) => (
          <div key={i.pondId} className="pond-card">
            <div className="pond-head">
              <strong>{i.pondId}</strong>
            </div>
            <div className="list">
              {i.predictions.map((p) => (
                <div key={p.metric} className="metric-row">
                  <span>{p.metric} in {p.horizon}</span>
                  <strong>{p.value}</strong>
                  <small className="muted">{p.note}</small>
                </div>
              ))}
            </div>
            {i.anomalies.length > 0 && (
              <div className="alert soft">{i.anomalies.join(', ')}</div>
            )}
            <div className="muted">Auto-log suggestion: add {i.missingLogs.join(', ')} today.</div>
          </div>
        ))}
      </div>
    </div>
  );
}
