import React, { useState } from 'react';

export default function AgeSelector({ onAgeSubmit }) {
  const [age, setAge] = useState(45);
  const [confirmed, setConfirmed] = useState(false);

  const displayAge = age >= 60 ? '60+' : age;
  const ageCategory = age < 30 ? 'Young' : age < 60 ? 'Adult' : 'Senior';
  const modeLabel = age >= 60 ? 'Simplicity Mode will be enabled' : 'Full features unlocked';

  const handleSubmit = () => {
    setConfirmed(true);
    setTimeout(() => onAgeSubmit(age >= 60 ? 60 : age), 400);
  };

  return (
    <div className="age-selector-card">
      <header className="card-head">
        <div>
          <p className="eyebrow">Getting Started</p>
          <h2>Tell us your age</h2>
          <p className="muted">We'll customize the interface to match your preferences.</p>
        </div>
      </header>

      <div className="age-form">
        <div className="age-display">
          <span className="age-number">{displayAge}</span>
          <span className="age-category">{ageCategory}</span>
        </div>

        <div className="slider-container">
          <input
            type="range"
            min="18"
            max="60"
            value={Math.min(age, 60)}
            onChange={(e) => setAge(Number(e.target.value))}
            className="age-slider"
          />
          <div className="slider-labels">
            <span>18</span>
            <span>39</span>
            <span>60+</span>
          </div>
        </div>

        <div className={`mode-indicator ${age >= 60 ? 'simplified' : 'full'}`}>
          <span className="mode-icon">{age >= 60 ? '✓' : '⚡'}</span>
          <p>{modeLabel}</p>
        </div>

        {age >= 60 && (
          <div className="simplicity-note">
            <strong>Simplicity Mode</strong> focuses on essential metrics and actions. You'll have a mode switcher at the top to try advanced features whenever you like!
          </div>
        )}

        <button
          className={`btn-primary btn-large ${confirmed ? 'btn-confirmed' : ''}`}
          onClick={handleSubmit}
        >
          {confirmed ? '✓ Confirmed' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
