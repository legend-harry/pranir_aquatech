import React, { useState, useCallback } from 'react';
import SignUpPage from './components/SignUpPage.jsx';
import AgeSelector from './components/AgeSelector.jsx';
import OnboardingWizard from './components/OnboardingWizard.jsx';
import SimplifiedDashboard from './components/SimplifiedDashboard.jsx';
import Dashboard from './components/Dashboard.jsx';
import WhatsNext from './components/WhatsNext.jsx';
import AlertCenter from './components/AlertCenter.jsx';
import ParameterInsights from './components/ParameterInsights.jsx';
import KnowledgeSurface from './components/KnowledgeSurface.jsx';
import SmartForms from './components/SmartForms.jsx';
import ChatAssistant from './components/ChatAssistant.jsx';
import { ponds as mockPonds, weatherToday } from './data/mockData.js';

export default function App() {
  const [stage, setStage] = useState('signup'); // signup -> age -> onboarding -> app
  const [age, setAge] = useState(null);
  const [role, setRole] = useState('manager');
  const [ponds] = useState(mockPonds);
  const [userPreferredMode, setUserPreferredMode] = useState(null); // null = auto, 'simplified' = force simplified, 'full' = force full
  
  // Determine if simplified: auto-detection if no user preference, else use preference
  let isSimplified = age && age >= 60;
  if (userPreferredMode === 'simplified') isSimplified = true;
  if (userPreferredMode === 'full') isSimplified = false;

  const handleSignUp = useCallback(() => {
    setStage('age');
  }, []);

  const handleAgeSubmit = useCallback((selectedAge) => {
    setAge(selectedAge);
    setStage('onboarding');
  }, []);

  const handleOnboardingComplete = useCallback((profile) => {
    setRole(profile.persona === 'field' ? 'worker' : 'manager');
    setStage('app');
  }, []);

  if (stage === 'signup') {
    return <SignUpPage onSignUp={handleSignUp} />;
  }

  if (stage === 'age') {
    return <AgeSelector onAgeSubmit={handleAgeSubmit} />;
  }

  if (stage === 'onboarding') {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`page ${isSimplified ? 'simplified-mode' : 'full-mode'}`}>
      <header className="topbar">
        <div>
          <p className="eyebrow">Pranir Aqua AI Console</p>
          <h1>Farm Management</h1>
          <p className="muted">{isSimplified ? 'Simplicity Mode' : 'Full AI Guidance'}</p>
        </div>
        <div className="topbar-actions">
          <div className="mode-switcher">
            <button 
              className={`mode-btn ${!isSimplified ? 'mode-btn-active' : ''}`}
              onClick={() => setUserPreferredMode(userPreferredMode === 'full' ? null : 'full')}
              title="Full features with AI guidance"
            >
              ⚡ Full
            </button>
            <button 
              className={`mode-btn ${isSimplified ? 'mode-btn-active' : ''}`}
              onClick={() => setUserPreferredMode(userPreferredMode === 'simplified' ? null : 'simplified')}
              title="Simplified view with essential controls"
            >
              ✓ Simple
            </button>
          </div>
          <div className="chip-row">
            {!isSimplified && ['owner', 'manager', 'worker'].map((r) => (
              <button key={r} className={role === r ? 'chip chip-active' : 'chip'} onClick={() => setRole(r)}>
                {r}
              </button>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => setStage('signup')}>Sign Out</button>
        </div>
      </header>

      <main className="stack">
        {isSimplified ? (
          <>
            <SimplifiedDashboard ponds={ponds} role={role} />
            <SmartForms />
            <ChatAssistant />
            <KnowledgeSurface ponds={ponds} />
          </>
        ) : (
          <>
            <Dashboard ponds={ponds} role={role} />
            <WhatsNext ponds={ponds} />
            <AlertCenter ponds={ponds} weather={weatherToday} />
            <ParameterInsights ponds={ponds} />
            <KnowledgeSurface ponds={ponds} />
            <SmartForms />
            <ChatAssistant />
          </>
        )}
      </main>
    </div>
  );
}
