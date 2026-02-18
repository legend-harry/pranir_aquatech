import React from 'react';
import { comparePerformance } from '../ai/aiEngine.js';

export default function ReportInsights({ ponds }) {
  const comparisons = comparePerformance(ponds);
  const summary = `AI summary: ${comparisons.length} ponds compared; top performer ${comparisons[0]?.pondId || 'N/A'}.`;
  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Automated Insights</p>
          <h3>Executive summaries & schedules</h3>
          <p className="muted">Auto-generated reports, comparisons, and scheduling.</p>
        </div>
        <button className="ghost">Schedule weekly</button>
      </header>
      <div className="bubble-note">
        <strong>{summary}</strong>
        <p className="muted">Comparison insights and pattern detection without manual requests.</p>
      </div>
      <div className="grid3">
        {comparisons.map((c) => (
          <div key={c.pondId} className="pond-card">
            <div className="pond-head"><strong>{c.pondId}</strong></div>
            <p className="muted">{c.delta}</p>
            <p>{c.insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
