import React, { useState, useEffect } from 'react';
import Day1Verification from './components/Day1Verification';
import Day2Packing from './components/Day2Packing';
import Day3Vibe from './components/Day3Vibe';
import Day4Reveal from './components/Day4Reveal';
import DebugPanel from './components/DebugPanel';
import WaxSealEnvelope from './components/WaxSealEnvelope';
import CountdownTimer from './components/CountdownTimer';
import { Sun, Calendar, ShieldCheck, Heart } from 'lucide-react';

const DEFAULT_CONFIG = {
  birthday: '27.06',
  vipName: 'ענבר',
  anniversaryDate: '03.02',
  weddingDate: '06.09',
  ozAge: '27',
  kidsCount: '4',
  spotifyLink: 'https://open.spotify.com/playlist/4oeFhEp5ioDlhJSUxDdp1e'
};

export default function App() {
  // Track opened envelopes per day
  const [envelopeOpenedDay, setEnvelopeOpenedDay] = useState(() => {
    return {
      1: localStorage.getItem('birthday_envelope_opened_day_1') === 'true',
      2: localStorage.getItem('birthday_envelope_opened_day_2') === 'true',
      3: localStorage.getItem('birthday_envelope_opened_day_3') === 'true',
      4: localStorage.getItem('birthday_envelope_opened_day_4') === 'true'
    };
  });

  // Config state (Target answers for the puzzles)
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('birthday_app_config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  // Simulated Day state: 'auto' (real date) or 1, 2, 3, 4
  const [simulatedDay, setSimulatedDay] = useState(() => {
    const saved = localStorage.getItem('birthday_simulated_day');
    return saved ? (saved === 'auto' ? 'auto' : parseInt(saved, 10)) : 'auto';
  });

  // Completion statuses
  const [day1Completed, setDay1Completed] = useState(() => {
    return localStorage.getItem('birthday_day1_completed') === 'true';
  });
  const [day2Completed, setDay2Completed] = useState(() => {
    return localStorage.getItem('birthday_day2_completed') === 'true';
  });
  const [day4Completed, setDay4Completed] = useState(() => {
    return localStorage.getItem('birthday_day4_completed') === 'true';
  });

  // Calculate actual day of the week:
  // Sunday (0) -> Day 1, Monday (1) -> Day 2, Tuesday (2) -> Day 3, Wednesday (3) & beyond -> Day 4
  const getCalendarDay = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    if (dayOfWeek === 0) return 1; // Sunday
    if (dayOfWeek === 1) return 2; // Monday
    if (dayOfWeek === 2) return 3; // Tuesday
    return 4; // Wednesday, Thursday, Friday, Saturday
  };

  const activeDay = simulatedDay === 'auto' ? getCalendarDay() : simulatedDay;

  // Persist simulated day override
  useEffect(() => {
    localStorage.setItem('birthday_simulated_day', simulatedDay);
  }, [simulatedDay]);

  const handleDay1Complete = (status) => {
    setDay1Completed(status);
    localStorage.setItem('birthday_day1_completed', String(status));
  };

  const handleDay2Complete = (status) => {
    setDay2Completed(status);
    localStorage.setItem('birthday_day2_completed', String(status));
  };

  const handleDay4Complete = (status) => {
    setDay4Completed(status);
    localStorage.setItem('birthday_day4_completed', String(status));
  };

  const resetState = () => {
    localStorage.removeItem('birthday_day1_completed');
    localStorage.removeItem('birthday_day2_completed');
    localStorage.removeItem('birthday_day4_completed');
    localStorage.removeItem('birthday_packing_checklist');
    localStorage.removeItem('birthday_day3_game_completed');
    localStorage.removeItem('birthday_destination_revealed');
    localStorage.removeItem('birthday_her_self_compliment');
    localStorage.removeItem('birthday_envelope_opened');
    localStorage.removeItem('birthday_envelope_opened_day_1');
    localStorage.removeItem('birthday_envelope_opened_day_2');
    localStorage.removeItem('birthday_envelope_opened_day_3');
    localStorage.removeItem('birthday_envelope_opened_day_4');
    setDay1Completed(false);
    setDay2Completed(false);
    setDay4Completed(false);
    setEnvelopeOpenedDay({ 1: false, 2: false, 3: false, 4: false });
    // Reload to refresh active states in mounted components
    window.location.reload();
  };

  // Render components dynamically based on active day
  const renderActiveDayComponent = () => {
    switch (activeDay) {
      case 1:
        return (
          <Day1Verification
            config={config}
            onComplete={handleDay1Complete}
            isCompleted={day1Completed}
          />
        );
      case 2:
        return (
          <Day2Packing
            onComplete={handleDay2Complete}
            isCompleted={day2Completed}
          />
        );
      case 3:
        return <Day3Vibe config={config} />;
      case 4:
        return (
          <Day4Reveal
            config={config}
            onComplete={handleDay4Complete}
            isCompleted={day4Completed}
          />
        );
      default:
        return (
          <Day1Verification
            config={config}
            onComplete={handleDay1Complete}
            isCompleted={day1Completed}
          />
        );
    }
  };

  const daysInfo = [
    { num: 1, name: "אימות זהות", dayHeb: "יום 1", icon: "🔑" },
    { num: 2, name: "משימת אריזה", dayHeb: "יום 2", icon: "🧳" },
    { num: 3, name: "בניית האווירה", dayHeb: "יום 3", icon: "🎧" },
    { num: 4, name: "הכספת והחשיפה", dayHeb: "יום 4", icon: "✈️" },
  ];

  return (
    <div className="app-wrapper">
      {/* Background ambient sun effects */}
      <div className="sun-glow-bg bg-sun-top"></div>
      <div className="sun-glow-bg bg-sun-bottom"></div>

      {/* Occasional background plane — no spoilers, just vibe ✈️ */}
      <div className="bg-plane" aria-hidden="true">✈️</div>

      {/* Sunbeam Sparkles */}
      <div className="sparkles-container">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="sparkle"
            style={{
              left: `${(i * 8.3) + Math.random() * 4}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${10 + Math.random() * 8}s`,
              transform: `scale(${0.3 + Math.random() * 0.7})`
            }}
          />
        ))}
      </div>

      <header className="app-header glass-card" dir="rtl">
        <div className="header-logo-container">
          <Sun className="header-sun-icon animate-spin-slow" size={28} />
          <h1 className="header-title">חגיגות יום הולדת מסווגות</h1>
        </div>
        <p className="header-subtitle">שבוע חגיגות מיוחד בשבילך ❤️</p>
      </header>

      <CountdownTimer />

      <main className="main-content">
        {/* Day Switcher Tab Bar */}
        <div className="timeline-container glass-card" dir="rtl">
          {daysInfo.map((day) => {
            const isPassed = day.num < activeDay;
            const isActive = day.num === activeDay;
            return (
              <div
                key={day.num}
                className={`timeline-step ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                onClick={() => setSimulatedDay(day.num)}
                title={`עבור ל${day.name}`}
              >
                <div className="step-icon-wrapper">
                  <span className="step-emoji">{day.icon}</span>
                  {isPassed && <span className="step-check-badge">✓</span>}
                </div>
                <div className="step-label">
                  <span className="step-day">{day.dayHeb}</span>
                  <span className="step-name">{day.name}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Stage Card Container */}
        <div className="active-card-container glass-card">
          {renderActiveDayComponent()}
        </div>
      </main>

      <footer className="app-footer">
        <p>נבנה באהבה על ידי עוז • {new Date().getFullYear()}</p>
      </footer>

      {/* Animated Ocean Waves Footer */}
      <div className="ocean-waves">
        <svg className="waves" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto" style={{ width: '100%', height: '100%' }}>
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
          </defs>
          <g className="parallax-waves">
            <use href="#gentle-wave" x="48" y="0" />
            <use href="#gentle-wave" x="48" y="3" />
            <use href="#gentle-wave" x="48" y="5" />
            <use href="#gentle-wave" x="48" y="7" />
          </g>
        </svg>
      </div>

      {/* Admin Panel (Hidden control panel for Oz) */}
      <DebugPanel
        config={config}
        setConfig={setConfig}
        simulatedDay={simulatedDay}
        setSimulatedDay={setSimulatedDay}
        resetState={resetState}
        envelopeOpenedDay={envelopeOpenedDay}
        setEnvelopeOpenedDay={setEnvelopeOpenedDay}
        day1Completed={day1Completed}
        setDay1Completed={handleDay1Complete}
        day2Completed={day2Completed}
        setDay2Completed={handleDay2Complete}
        day4Completed={day4Completed}
        setDay4Completed={handleDay4Complete}
      />

      {/* 3D Wax Seal Envelope Overlay per active day */}
      {!envelopeOpenedDay[activeDay] && (
        <WaxSealEnvelope
          day={activeDay}
          onOpen={() => {
            const updated = { ...envelopeOpenedDay, [activeDay]: true };
            setEnvelopeOpenedDay(updated);
            localStorage.setItem(`birthday_envelope_opened_day_${activeDay}`, 'true');
          }}
        />
      )}
    </div>
  );
}
