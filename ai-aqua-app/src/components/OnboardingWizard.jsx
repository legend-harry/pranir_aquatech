import React, { useState } from 'react';
import { inferOnboardingProfile } from '../ai/aiEngine.js';

const roles = [
  { id: 'owner', label: 'Owner' },
  { id: 'manager', label: 'Manager' },
  { id: 'worker', label: 'Worker' },
];

const goals = [
  { id: 'Cost reduction', label: 'Cost reduction' },
  { id: 'Yield improvement', label: 'Yield improvement' },
  { id: 'Water quality', label: 'Water quality' },
];

const experiences = [
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ role: '', goal: '', experience: '', pondCount: '' });
  const [profile, setProfile] = useState(null);

  const next = () => setStep((s) => Math.min(4, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const finish = () => {
    const inferred = inferOnboardingProfile(form);
    setProfile(inferred);
    onComplete?.(inferred);
  };

  return (
    <div className="card">
      <header className="card-head">
        <div>
          <p className="eyebrow">AI-Powered Onboarding</p>
          <h2>Welcome Assistant</h2>
          <p className="muted">Personalized setup based on your role, goals, and scale.</p>
        </div>
        <div className="pill">Step {step} / 4</div>
      </header>

      {step === 1 && (
        <div className="grid2">
          <div>
            <h4>Your role</h4>
            <p className="muted">We tailor guidance to how you work.</p>
          </div>
          <div className="chip-row">
            {roles.map((r) => (
              <button
                key={r.id}
                className={form.role === r.id ? 'chip chip-active' : 'chip'}
                onClick={() => update('role', r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid2">
          <div>
            <h4>Main goal</h4>
            <p className="muted">We will prioritize features that move this metric.</p>
          </div>
          <div className="chip-row">
            {goals.map((g) => (
              <button
                key={g.id}
                className={form.goal === g.id ? 'chip chip-active' : 'chip'}
                onClick={() => update('goal', g.id)}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="grid2">
          <div>
            <h4>Experience level</h4>
            <p className="muted">We use progressive disclosure to match comfort.</p>
          </div>
          <div className="chip-row">
            {experiences.map((e) => (
              <button
                key={e.id}
                className={form.experience === e.id ? 'chip chip-active' : 'chip'}
                onClick={() => update('experience', e.id)}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="grid2">
          <div>
            <h4>How many ponds?</h4>
            <p className="muted">We adjust batching and alerts to your scale.</p>
          </div>
          <div>
            <input
              type="number"
              min="1"
              placeholder="e.g., 6"
              value={form.pondCount}
              onChange={(e) => update('pondCount', e.target.value)}
            />
          </div>
        </div>
      )}

      <footer className="card-foot">
        <div className="btn-row">
          <button className="ghost" onClick={back} disabled={step === 1}>Back</button>
          {step < 4 && (
            <button className="primary" onClick={next} disabled={!form.role && step === 1}>
              Next
            </button>
          )}
          {step === 4 && (
            <button className="primary" onClick={finish} disabled={!form.pondCount}>Finish</button>
          )}
        </div>
        {profile && (
          <div className="pill success">
            Ready for {profile.persona} mode • {profile.recommendedFeatures.join(', ')}
          </div>
        )}
      </footer>
    </div>
  );
}
