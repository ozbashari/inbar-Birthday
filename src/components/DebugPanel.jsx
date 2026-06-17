import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Settings } from 'lucide-react';

const DAYS = [
  { value: 1, label: '1', sub: '21.06' },
  { value: 2, label: '2', sub: '22.06' },
  { value: 3, label: '3', sub: '23.06' },
  { value: 4, label: '4', sub: '24.06' },
];

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
  const [open, setOpen] = useState(false);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    localStorage.setItem('birthday_app_config', JSON.stringify(newConfig));
  };

  return (
    <>
      {/* Floating side toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1000,
          background: 'rgba(15,23,42,0.75)',
          color: '#fff',
          border: 'none',
          borderRadius: '0 8px 8px 0',
          padding: '10px 6px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          backdropFilter: 'blur(8px)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
        }}
        title="לוח בקרה"
      >
        <Settings size={14} />
        {open ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Side panel */}
      {open && (
        <div
          dir="rtl"
          style={{
            position: 'fixed',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 999,
            background: 'rgba(15,23,42,0.92)',
            backdropFilter: 'blur(12px)',
            borderRadius: '0 16px 16px 0',
            padding: '1rem 1rem 1rem 0.75rem',
            paddingLeft: '2rem',
            boxShadow: '4px 0 24px rgba(0,0,0,0.25)',
            minWidth: '200px',
            color: '#fff',
            fontFamily: 'var(--font-primary)',
          }}
        >
          {/* Day switcher */}
          <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.6rem 0', textAlign: 'right' }}>
            יום פעיל
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => setSimulatedDay('auto')}
              style={{
                gridColumn: '1 / -1',
                padding: '0.45rem',
                borderRadius: '8px',
                border: simulatedDay === 'auto' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.15)',
                background: simulatedDay === 'auto' ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.07)',
                color: '#fff',
                fontFamily: 'var(--font-primary)',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              אוטומטי (לפי תאריך)
            </button>
            {DAYS.map(d => (
              <button
                key={d.value}
                onClick={() => setSimulatedDay(d.value)}
                style={{
                  padding: '0.5rem 0.25rem',
                  borderRadius: '8px',
                  border: simulatedDay === d.value ? '2px solid #fb923c' : '1px solid rgba(255,255,255,0.15)',
                  background: simulatedDay === d.value ? 'rgba(251,146,60,0.25)' : 'rgba(255,255,255,0.07)',
                  color: '#fff',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                }}
              >
                <span>יום {d.label}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{d.sub}</span>
              </button>
            ))}
          </div>

          {/* Completion toggles */}
          <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem 0', textAlign: 'right' }}>
            סטטוס ימים
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '0.75rem' }}>
            {[
              { label: 'יום 1', val: day1Completed, set: setDay1Completed },
              { label: 'יום 2', val: day2Completed, set: setDay2Completed },
              { label: 'יום 4', val: day4Completed, set: setDay4Completed },
            ].map(({ label, val, set }) => (
              <button
                key={label}
                onClick={() => set(!val)}
                style={{
                  padding: '0.35rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: val ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)',
                  color: '#fff',
                  fontFamily: 'var(--font-primary)',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  textAlign: 'right',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>{val ? '✓ הושלם' : '— לא הושלם'}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Envelope toggles */}
          <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.5rem 0', textAlign: 'right' }}>
            מעטפות
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.3rem', marginBottom: '0.75rem' }}>
            {[1, 2, 3, 4].map(d => {
              const isOpenEnv = envelopeOpenedDay[d];
              return (
                <button
                  key={d}
                  onClick={() => {
                    const next = { ...envelopeOpenedDay, [d]: !isOpenEnv };
                    setEnvelopeOpenedDay(next);
                    localStorage.setItem(`birthday_envelope_opened_day_${d}`, String(!isOpenEnv));
                  }}
                  style={{
                    padding: '0.35rem 0.25rem',
                    borderRadius: '6px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: isOpenEnv ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.07)',
                    color: '#fff',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  {d} {isOpenEnv ? '🔓' : '✉️'}
                </button>
              );
            })}
          </div>

          {/* Reset */}
          <button
            onClick={resetState}
            style={{
              width: '100%',
              padding: '0.45rem',
              borderRadius: '8px',
              border: '1px solid rgba(239,68,68,0.4)',
              background: 'rgba(239,68,68,0.15)',
              color: '#fca5a5',
              fontFamily: 'var(--font-primary)',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
            }}
          >
            <RotateCcw size={13} />
            אפס הכל
          </button>
        </div>
      )}
    </>
  );
}
