import React, { useState } from 'react';
import { Settings, X, RotateCcw } from 'lucide-react';

export default function DebugPanel({
  config,
  setConfig,
  simulatedDay,
  setSimulatedDay,
  resetState,
  envelopeOpenedDay,
  setEnvelopeOpenedDay,
  day1Completed,
  setDay1Completed,
  day2Completed,
  setDay2Completed,
  day4Completed,
  setDay4Completed
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem('birthday_app_config', JSON.stringify(newConfig));
  };

  return (
    <div className="debug-panel-container">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`debug-toggle-btn ${isOpen ? 'open' : ''}`}
        title="לוח בקרה למנהל (עוז)"
      >
        {isOpen ? <X size={20} /> : <Settings size={20} />}
      </button>

      {/* Panel Body */}
      {isOpen && (
        <div className="debug-panel glass-card text-right" dir="rtl" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
          <h3 className="debug-title">⚙️ לוח בקרה לעוז (Debug)</h3>
          <p className="debug-subtitle">שלוט ביום הפעיל ובערכי הבדיקה של החידות.</p>

          {/* Section 1: Day Override */}
          <div className="debug-section">
            <label className="debug-label">היום הפעיל באתר:</label>
            <div className="debug-day-selector">
              <button
                className={`debug-day-btn ${simulatedDay === 'auto' ? 'active' : ''}`}
                onClick={() => setSimulatedDay('auto')}
              >
                אוטומטי
              </button>
              <button
                className={`debug-day-btn ${simulatedDay === 1 ? 'active' : ''}`}
                onClick={() => setSimulatedDay(1)}
              >
                יום 1 (אימות)
              </button>
              <button
                className={`debug-day-btn ${simulatedDay === 2 ? 'active' : ''}`}
                onClick={() => setSimulatedDay(2)}
              >
                יום 2 (אריזה)
              </button>
              <button
                className={`debug-day-btn ${simulatedDay === 3 ? 'active' : ''}`}
                onClick={() => setSimulatedDay(3)}
              >
                יום 3 (אווירה)
              </button>
              <button
                className={`debug-day-btn ${simulatedDay === 4 ? 'active' : ''}`}
                onClick={() => setSimulatedDay(4)}
              >
                יום 4 (כספת)
              </button>
            </div>
          </div>

          {/* Section 1.5: Stage Completion Toggles */}
          <div className="debug-section">
            <label className="debug-label">סטטוס השלמת ימים/משחקים:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.4rem' }}>
              <button
                className={`debug-day-btn ${day1Completed ? 'active' : ''}`}
                onClick={() => setDay1Completed(!day1Completed)}
                style={{ fontSize: '0.75rem', padding: '4px' }}
              >
                יום 1 (אימות): {day1Completed ? '✓ הושלם' : '❌ לא הושלם'}
              </button>
              <button
                className={`debug-day-btn ${day2Completed ? 'active' : ''}`}
                onClick={() => setDay2Completed(!day2Completed)}
                style={{ fontSize: '0.75rem', padding: '4px' }}
              >
                יום 2 (אריזה): {day2Completed ? '✓ הושלם' : '❌ לא הושלם'}
              </button>
              <button
                className={`debug-day-btn ${localStorage.getItem('birthday_day3_game_completed') === 'true' ? 'active' : ''}`}
                onClick={() => {
                  const current = localStorage.getItem('birthday_day3_game_completed') === 'true';
                  localStorage.setItem('birthday_day3_game_completed', String(!current));
                  window.location.reload(); // Reload to refresh the vibe stage
                }}
                style={{ fontSize: '0.75rem', padding: '4px' }}
              >
                יום 3 (אווירה): {localStorage.getItem('birthday_day3_game_completed') === 'true' ? '✓ הושלם' : '❌ לא הושלם'}
              </button>
              <button
                className={`debug-day-btn ${day4Completed ? 'active' : ''}`}
                onClick={() => setDay4Completed(!day4Completed)}
                style={{ fontSize: '0.75rem', padding: '4px' }}
              >
                יום 4 (חשיפה): {day4Completed ? '✓ הושלם' : '❌ לא הושלם'}
              </button>
            </div>
          </div>

          {/* Section 1.6: Envelope Reset Toggles */}
          <div className="debug-section">
            <label className="debug-label">מצב מעטפות יומיות (פתיחה):</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem', marginTop: '0.4rem' }}>
              {[1, 2, 3, 4].map((d) => {
                const isOpen = envelopeOpenedDay[d];
                return (
                  <button
                    key={d}
                    className={`debug-day-btn ${isOpen ? 'active' : ''}`}
                    onClick={() => {
                      const nextOpened = { ...envelopeOpenedDay, [d]: !isOpen };
                      setEnvelopeOpenedDay(nextOpened);
                      localStorage.setItem(`birthday_envelope_opened_day_${d}`, String(!isOpen));
                    }}
                    style={{ fontSize: '0.72rem', padding: '4px 2px' }}
                    title={`קליק לשינוי מצב המעטפה של יום ${d}`}
                  >
                    מכתב {d}: {isOpen ? '🔓' : '✉️'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Configurable Answers */}
          <div className="debug-section">
            <label className="debug-label">תשובות נכונות לחידות:</label>
            
            <div className="debug-field">
              <span className="debug-field-title">יום הולדת (יום א׳):</span>
              <input
                type="text"
                value={config.birthday}
                onChange={(e) => handleConfigChange('birthday', e.target.value)}
                className="debug-input"
                placeholder="לדוגמה: 20/06"
              />
            </div>

            <div className="debug-field">
              <span className="debug-field-title">שם הנוסעת (VIP):</span>
              <input
                type="text"
                value={config.vipName}
                onChange={(e) => handleConfigChange('vipName', e.target.value)}
                className="debug-input"
                placeholder="שם על כרטיס הטיסה"
              />
            </div>

            <div className="debug-field">
              <span className="debug-field-title">יום היכרות (יום ד׳ שאלון):</span>
              <input
                type="text"
                value={config.anniversaryDate}
                onChange={(e) => handleConfigChange('anniversaryDate', e.target.value)}
                className="debug-input"
                placeholder="לדוגמה: 03/02"
              />
            </div>

            <div className="debug-field">
              <span className="debug-field-title">תאריך חתונה (יום ד׳ שאלון):</span>
              <input
                type="text"
                value={config.weddingDate}
                onChange={(e) => handleConfigChange('weddingDate', e.target.value)}
                className="debug-input"
                placeholder="לדוגמה: 06/09"
              />
            </div>

            <div className="debug-field">
              <span className="debug-field-title">הגיל של עוז:</span>
              <input
                type="text"
                value={config.ozAge}
                onChange={(e) => handleConfigChange('ozAge', e.target.value)}
                className="debug-input"
                placeholder="לדוגמה: 27"
              />
            </div>

            <div className="debug-field">
              <span className="debug-field-title">מספר ילדים מבוקש:</span>
              <input
                type="text"
                value={config.kidsCount}
                onChange={(e) => handleConfigChange('kidsCount', e.target.value)}
                className="debug-input"
                placeholder="לדוגמה: 4"
              />
            </div>

            <div className="debug-field">
              <span className="debug-field-title">קישור ספוטיפיי (יום ג׳):</span>
              <input
                type="text"
                value={config.spotifyLink}
                onChange={(e) => handleConfigChange('spotifyLink', e.target.value)}
                className="debug-input"
                placeholder="כתובת פלייליסט"
              />
            </div>
          </div>

          {/* Section 2.5: Love note written by her */}
          {localStorage.getItem('birthday_her_self_compliment') && (
            <div className="debug-section" style={{ background: 'rgba(231, 111, 81, 0.08)', borderRadius: '8px', padding: '8px', marginBottom: '0.75rem' }}>
              <label className="debug-label" style={{ color: 'var(--color-coral)', margin: '0' }}>💖 מה היא כתבה על עצמה:</label>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 0 0', fontWeight: '800', fontStyle: 'italic', color: 'var(--color-navy)' }}>
                "{localStorage.getItem('birthday_her_self_compliment')}"
              </p>
            </div>
          )}

          {/* Section 3: Reset */}
          <div className="debug-footer" style={{ borderTop: '1px solid rgba(231, 111, 81, 0.1)', paddingTop: '0.75rem', marginTop: '0.75rem' }}>
            <button onClick={resetState} className="debug-reset-btn">
              <RotateCcw size={16} />
              <span>אפס את כל התקדמות המשתמשת</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
