import React, { useState, useEffect } from 'react';
import { Sparkles, Cake } from 'lucide-react';

const FLIGHT_DATE   = new Date(2026, 5, 24, 19, 10, 0, 0); // 24 Jun 2026 19:10
const BIRTHDAY_DATE = new Date(2026, 5, 27,  0,  0, 0, 0); // 27 Jun 2026 00:00

function pad(n) { return String(n).padStart(2, '0'); }

function calcTimeLeft(target) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function CountdownTimer() {
  // Single tick counter — forces a re-render every second.
  // Time values are computed fresh on each render, never stored in state.
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const flightTime   = calcTimeLeft(FLIGHT_DATE);
  const birthdayTime = calcTimeLeft(BIRTHDAY_DATE);

  const flightUnits = flightTime ? [
    { label: 'ימים',  value: flightTime.days },
    { label: 'שעות',  value: flightTime.hours },
    { label: 'דקות',  value: flightTime.minutes },
    { label: 'שניות', value: flightTime.seconds },
  ] : [];

  const bdayUnits = birthdayTime ? [
    { label: 'ימים',  value: birthdayTime.days },
    { label: 'שעות',  value: birthdayTime.hours },
    { label: 'דקות',  value: birthdayTime.minutes },
    { label: 'שניות', value: birthdayTime.seconds },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '650px', margin: '0 auto', marginBottom: '1rem', boxSizing: 'border-box' }}>

      {/* Surprise / flight countdown */}
      <div className="countdown-wrapper glass-card" dir="rtl">
        {!flightTime ? (
          <>
            <Sparkles size={24} className="countdown-sparkle-icon launched-icon" />
            <span className="countdown-launched-text">ההפתעה כאן! ✈️🎉</span>
          </>
        ) : (
          <>
            <div className="countdown-header">
              <Sparkles size={18} className="countdown-sparkle-icon" />
              <span className="countdown-label">זמן להפתעה ✨</span>
            </div>
            <div className="countdown-units">
              {flightUnits.map(({ label, value }, i) => (
                <React.Fragment key={label}>
                  <div className="countdown-unit">
                    <span className="countdown-digit">{pad(value)}</span>
                    <span className="countdown-unit-label">{label}</span>
                  </div>
                  {i < flightUnits.length - 1 && <span className="countdown-sep">:</span>}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Birthday countdown — coral tint */}
      <div
        className="countdown-wrapper glass-card"
        dir="rtl"
        style={{ background: 'rgba(231,111,81,0.06)', borderColor: 'rgba(231,111,81,0.2)' }}
      >
        {!birthdayTime ? (
          <>
            <Cake size={24} className="countdown-sparkle-icon launched-icon" style={{ color: 'var(--color-coral)' }} />
            <span className="countdown-launched-text" style={{ color: 'var(--color-coral)' }}>יום הולדת שמח ענבר! 🎂🎉</span>
          </>
        ) : (
          <>
            <div className="countdown-header">
              <Cake size={18} style={{ color: 'var(--color-coral)', flexShrink: 0 }} />
              <span className="countdown-label" style={{ color: 'var(--color-coral)' }}>יום הולדת 27.06 🎂</span>
            </div>
            <div className="countdown-units">
              {bdayUnits.map(({ label, value }, i) => (
                <React.Fragment key={label}>
                  <div className="countdown-unit">
                    <span className="countdown-digit" style={{ color: 'var(--color-coral)' }}>{pad(value)}</span>
                    <span className="countdown-unit-label">{label}</span>
                  </div>
                  {i < bdayUnits.length - 1 && (
                    <span className="countdown-sep" style={{ color: 'var(--color-coral)' }}>:</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}
