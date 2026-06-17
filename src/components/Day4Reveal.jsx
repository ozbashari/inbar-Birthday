import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { Lock, Unlock, AlertCircle, PlaneTakeoff, Ticket, ChevronLeft, ChevronRight } from 'lucide-react';
import { playClick, playTick, playChime, playFail, playScratch, playPrint } from '../utils/audio';

const TARGET_SAFE_CODE = [2, 7, 0, 6];

export default function Day4Reveal({ config, onComplete, isCompleted }) {
  // subStages: 1 (safe dial), 2 (vault questions), 3 (scratch card), 4 (seat selector), 5 (final printed boarding pass)
  const [subStage, setSubStage] = useState(() => {
    if (isCompleted) return 5;
    return 1;
  });

  const [answers, setAnswers] = useState({
    anniversary: '',
    wedding: '',
    age: '',
    kids: ''
  });
  const [errors, setErrors] = useState({});

  // Safe Dial States
  const [currentDialDigit, setCurrentDialDigit] = useState(0);
  const [enteredDialDigits, setEnteredDialDigits] = useState([]);
  const [safeError, setSafeError] = useState('');

  // Scratch card states
  const [scratchGrid, setScratchGrid] = useState(Array(9).fill(false));
  const [scratchedCount, setScratchedCount] = useState(0);

  // Seat selection states
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isCompleted) {
      setSubStage(5);
    }
  }, [isCompleted]);

  // Accepts / . - or spaces as separators: 15/08, 15.08, 15-08, 1508 all match
  const normalize = (str) => {
    if (!str) return '';
    return str.trim().replace(/[/.\-\s]/g, '').replace(/[^0-9a-zA-Zא-ת]/g, '').toLowerCase();
  };

  // Stage 2: Check Vault Questions
  const handleVaultUnlock = (e) => {
    e.preventDefault();
    const newErrors = {};

    const normAnniversary = normalize(answers.anniversary);
    const targetAnniversary = normalize(config.anniversaryDate);
    if (normAnniversary !== targetAnniversary) {
      newErrors.anniversary = 'תאריך לא נכון 🤔';
    }

    const normWedding = normalize(answers.wedding);
    const targetWedding = normalize(config.weddingDate);
    if (normWedding !== targetWedding) {
      newErrors.wedding = 'תאריך חתונה לא נכון 👰‍♀️🤵‍♂️';
    }

    const normAge = normalize(answers.age);
    const targetAge = normalize(config.ozAge);
    if (normAge !== targetAge) {
      newErrors.age = 'הוא מרגיש צעיר יותר, אבל זה לא הגיל... 😜';
    }

    const normKids = normalize(answers.kids);
    const targetKids = normalize(config.kidsCount);
    if (normKids !== targetKids) {
      newErrors.kids = 'כמעט! נסו מספר אחר... 👶';
    }

    if (Object.keys(newErrors).length === 0) {
      playChime();
      setSubStage(3);
    } else {
      playFail();
      setErrors(newErrors);
    }
  };

  // Stage 1: Safe Dial Combination lock
  const rotateDial = (direction) => {
    playTick();
    setSafeError('');
    if (direction === 'next') {
      setCurrentDialDigit((prev) => (prev + 1) % 10);
    } else {
      setCurrentDialDigit((prev) => (prev - 1 + 10) % 10);
    }
  };

  const enterSafeDigit = () => {
    const expectedDigit = TARGET_SAFE_CODE[enteredDialDigits.length];
    
    if (currentDialDigit === expectedDigit) {
      playChime();
      const nextDigits = [...enteredDialDigits, currentDialDigit];
      setEnteredDialDigits(nextDigits);
      setCurrentDialDigit(0);

      if (nextDigits.length === TARGET_SAFE_CODE.length) {
        setTimeout(() => {
          setSubStage(2);
          playChime();
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }, 500);
      }
    } else {
      playFail();
      setSafeError('קוד שגוי! המנעול ננעל מחדש, התחילי מהתחלה 🔒');
      setEnteredDialDigits([]);
      setCurrentDialDigit(0);
    }
  };

  // Stage 3: Scratch Card
  const handleScratch = (idx) => {
    if (scratchGrid[idx]) return;

    playScratch();
    const nextGrid = [...scratchGrid];
    nextGrid[idx] = true;
    setScratchGrid(nextGrid);
    
    const count = nextGrid.filter(Boolean).length;
    setScratchedCount(count);

    if (count >= 6) {
      playChime();
      setTimeout(() => {
        setSubStage(4);
      }, 1000);
    }
  };

  // Stage 4: Airplane seat selection
  const selectSeat = (seatId) => {
    if (seatId === '1A') {
      playClick();
      setSelectedSeat(seatId);
    }
  };

  const handlePrintStart = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    playPrint(3.8);

    setTimeout(() => {
      setIsPrinting(false);
      setSubStage(5);
      onComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 7000);
    }, 3800);
  };

  // Seating layout renderer (shared between selectors)
  const renderSeatingCabin = () => {
    return (
      <div
        className="aircraft-cabin glass-card-nested"
        style={{
          width: '100%',
          maxWidth: '280px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-navy-muted)', marginBottom: '1rem' }}>קאבינת מחלקת עסקים VIP</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => selectSeat('1A')}
              style={{
                flex: '1',
                padding: '0.6rem 0.25rem',
                borderRadius: '8px',
                border: selectedSeat === '1A' ? '2px solid var(--color-success)' : '2px dashed var(--color-coral)',
                background: selectedSeat === '1A' ? 'rgba(16,185,129,0.15)' : 'rgba(255,126,103,0.1)',
                fontFamily: 'var(--font-primary)',
                fontSize: '0.75rem',
                fontWeight: '800',
                color: selectedSeat === '1A' ? '#047857' : 'var(--color-coral)',
                cursor: 'pointer',
                animation: selectedSeat === '1A' ? 'none' : 'pulse-slow 2s infinite'
              }}
            >
              {selectedSeat === '1A' ? 'ענבר VIP ✅' : 'פנוי: 1A 💺'}
            </button>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-navy-muted)', width: '30px', textAlign: 'center' }}>שורה 1</div>
            <div style={{ flex: '1', padding: '0.6rem 0.25rem', borderRadius: '8px', border: '1px solid rgba(15,23,42,0.15)', background: 'rgba(125,211,252,0.15)', fontSize: '0.75rem', fontWeight: '800', color: '#0284c7', textAlign: 'center' }}>עוז: 1B 💺</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', opacity: '0.5' }}>
            <div style={{ flex: '1', padding: '0.6rem 0.25rem', borderRadius: '8px', background: '#cbd5e1', fontSize: '0.7rem', fontWeight: '700', textAlign: 'center' }}>תפוס ❌</div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-navy-muted)', width: '30px', textAlign: 'center' }}>שורה 2</div>
            <div style={{ flex: '1', padding: '0.6rem 0.25rem', borderRadius: '8px', background: '#cbd5e1', fontSize: '0.7rem', fontWeight: '700', textAlign: 'center' }}>תפוס ❌</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', opacity: '0.5' }}>
            <div style={{ flex: '1', padding: '0.6rem 0.25rem', borderRadius: '8px', background: '#cbd5e1', fontSize: '0.7rem', fontWeight: '700', textAlign: 'center' }}>תפוס ❌</div>
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-navy-muted)', width: '30px', textAlign: 'center' }}>שורה 3</div>
            <div style={{ flex: '1', padding: '0.6rem 0.25rem', borderRadius: '8px', background: '#cbd5e1', fontSize: '0.7rem', fontWeight: '700', textAlign: 'center' }}>תפוס ❌</div>
          </div>
        </div>
      </div>
    );
  };

  // Seating and window frame
  const renderAircraftSelectionFrame = () => {
    return (
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', width: '100%', margin: '1rem 0' }}>
        <div className="aircraft-window">
          <div className="scrolling-clouds"></div>
          {selectedSeat === '1A' && <div className="sun-in-window"></div>}
        </div>
        {renderSeatingCabin()}
      </div>
    );
  };

  // Seating Boarding Pass Ticket layout
  const renderBoardingPassLayout = () => {
    return (
      <div className="boarding-pass glass-card-nested">
        <div className="bp-header">
          <div className="bp-logo">
            <Ticket size={24} className="bp-icon-logo" />
            <span>ISRAIR · 6H-585</span>
          </div>
          <span className="bp-class">VIP PASSENGER ✈️</span>
        </div>

        <div className="bp-body">
          <div className="bp-left">
            <div className="bp-row">
              <div className="bp-col">
                <span className="bp-label">שם הנוסעת / PASSENGER NAME</span>
                <span className="bp-val text-large" style={{ display: 'block', textAlign: 'right', direction: 'rtl', unicodeBidi: 'embed' }}>
                  {config.vipName || 'ענבר'} 💖
                </span>
              </div>
            </div>
            <div className="bp-row airport-codes">
              <div className="bp-col text-right">
                <span className="airport-city">תל אביב</span>
                <span className="airport-code text-accent">TLV</span>
              </div>
              <div className="bp-plane-route">
                <div className="route-line"></div>
                <PlaneTakeoff size={24} className="route-plane" />
              </div>
              <div className="bp-col text-left">
                <span className="airport-city">לרנקה</span>
                <span className="airport-code text-accent">LCA</span>
              </div>
            </div>
            <div className="bp-details-grid">
              <div className="bp-col">
                <span className="bp-label">טיסה / FLIGHT</span>
                <span className="bp-val">6H-585</span>
              </div>
              <div className="bp-col">
                <span className="bp-label">מושב / SEAT</span>
                <span className="bp-val">1A (VIP)</span>
              </div>
              <div className="bp-col">
                <span className="bp-label">טרמינל / TERM.</span>
                <span className="bp-val">T3</span>
              </div>
              <div className="bp-col">
                <span className="bp-label">המראה / DEP.</span>
                <span className="bp-val">19:10</span>
              </div>
              <div className="bp-col">
                <span className="bp-label">נחיתה / ARR.</span>
                <span className="bp-val">20:15</span>
              </div>
              <div className="bp-col">
                <span className="bp-label">תאריך / DATE</span>
                <span className="bp-val">24.06.26</span>
              </div>
            </div>
          </div>
          <div className="bp-separator">
            <div className="circle-notch top"></div>
            <div className="dashed-line"></div>
            <div className="circle-notch bottom"></div>
          </div>
          <div className="bp-right">
            <div className="bp-col mb-4">
              <span className="bp-label">נוסעת / PASSENGER</span>
              <span className="bp-val text-medium" style={{ textAlign: 'right', direction: 'rtl' }}>
                {config.vipName || 'ענבר'}
              </span>
            </div>
            <div className="bp-col mb-4">
              <span className="bp-label">יעד / DESTINATION</span>
              <span className="bp-val text-medium text-accent">LCA · CYPRUS 🇨🇾</span>
            </div>
            <div className="bp-col mb-4">
              <span className="bp-label">המראה / DEPARTURE</span>
              <span className="bp-val">19:10</span>
            </div>
            <div className="bp-col mb-4">
              <span className="bp-label">הזמנה / BOOKING</span>
              <span className="bp-val">4601600</span>
            </div>
            <div className="bp-barcode">
              <div className="barcode-line w-2"></div>
              <div className="barcode-line w-4"></div>
              <div className="barcode-line w-1"></div>
              <div className="barcode-line w-3"></div>
              <div className="barcode-line w-2"></div>
              <div className="barcode-line w-5"></div>
              <div className="barcode-line w-1"></div>
              <div className="barcode-line w-2"></div>
              <div className="barcode-line w-4"></div>
              <div className="barcode-line w-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card-content fade-in" dir="rtl">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={150}
          recycle={false}
        />
      )}

      {/* Substage Indicator */}
      {subStage < 5 && !isPrinting && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-navy-muted)' }}>
          <span 
            style={{ color: subStage === 1 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(1)}
          >חוגת קוד 🔐</span>
          <span>•</span>
          <span 
            style={{ color: subStage === 2 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(2)}
          >שאלון 📝</span>
          <span>•</span>
          <span 
            style={{ color: subStage === 3 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(3)}
          >כרטיס גירוד 🎫</span>
          <span>•</span>
          <span 
            style={{ color: subStage === 4 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(4)}
          >מושבים ✈️</span>
        </div>
      )}

      <div className="icon-wrapper reveal-glow">
        {subStage === 5 ? (
          <Unlock size={48} className="icon-success animate-pulse" />
        ) : (
          <Lock size={48} className="icon-danger animate-pulse" />
        )}
      </div>

      <h2 className="section-title">
        {subStage === 5 ? 'החשיפה הגדולה! ✈️💖' : 'פיצוח הכספת הסודית'}
      </h2>

      {/* Stage 4.1: Safe Combination Dial */}
      {subStage === 1 && (
        <div className="safe-dial-wrapper fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="section-description text-center">
            לפנייך מנעול כספת קוד. סובבי את החוגה לקוד יום ההולדת שלך (2-7-0-6) והזיני את הספרות לפי הסדר כדי לפתוח את שלבי הכספת.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.5rem', direction: 'ltr' }}>
            {[0, 1, 2, 3].map((idx) => {
              const hasDigit = enteredDialDigits[idx] !== undefined;
              return (
                <div
                  key={idx}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    border: '2px solid rgba(2, 132, 199, 0.2)',
                    background: hasDigit ? 'rgba(13, 148, 136, 0.15)' : 'rgba(2, 132, 199, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    color: hasDigit ? 'var(--color-success)' : 'rgba(2, 132, 199, 0.4)',
                    boxShadow: 'inset 0 2px 4px rgba(29, 53, 87, 0.05)'
                  }}
                >
                  {hasDigit ? enteredDialDigits[idx] : '_'}
                </div>
              );
            })}
          </div>

          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0' }}>
            <div
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '50%',
                border: '4px double var(--color-sky)',
                background: 'radial-gradient(circle, #38bdf8 0%, #0284c7 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '900',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(2, 132, 199, 0.25), inset 0 2px 5px rgba(255, 255, 255, 0.3)',
                transform: `rotate(${currentDialDigit * 36}deg)`,
                transition: 'transform 0.2s ease-out'
              }}
            >
              <div style={{ transform: `rotate(-${currentDialDigit * 36}deg)` }}>
                {currentDialDigit}
              </div>
            </div>
            <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '14px', background: 'var(--color-coral)', borderRadius: '2px' }}></div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem', justifyContent: 'center', width: '100%', maxWidth: '280px' }}>
            <button
              onClick={() => rotateDial('prev')}
              className="action-btn"
              style={{ flex: 1, padding: '0.6rem', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.2)', color: 'var(--color-sky)', maxWidth: '60px', boxShadow: 'none' }}
            >
              <ChevronRight size={22} />
            </button>
            <button
              onClick={enterSafeDigit}
              className="action-btn"
              style={{ flex: 2, padding: '0.6rem', fontSize: '0.95rem' }}
            >
              הזן ספרה 🔓
            </button>
            <button
              onClick={() => rotateDial('next')}
              className="action-btn"
              style={{ flex: 1, padding: '0.6rem', background: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.2)', color: 'var(--color-sky)', maxWidth: '60px', boxShadow: 'none' }}
            >
              <ChevronLeft size={22} />
            </button>
          </div>

          {safeError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: '700', marginTop: '1rem' }}>
              <AlertCircle size={14} />
              <span>{safeError}</span>
            </div>
          )}
        </div>
      )}

      {/* Stage 4.2: Vault Questions */}
      {subStage === 2 && (
        <>
          <p className="section-description text-center">
            חוגת הקוד פוצחה בהצלחה! כעת, כדי לפתוח את שלבי הכספת ולחשוף את היעד הסודי, עני נכון על 4 השאלות הבאות:
          </p>
          <form onSubmit={handleVaultUnlock} className="vault-form">
            <div className="form-grid">
              <div className="form-field">
                <label className="field-label">מתי התאריך שבו אנחנו חוגגים את ההיכרות שלנו?</label>
                <input
                  type="text"
                  value={answers.anniversary}
                  onChange={(e) => {
                    setAnswers({ ...answers, anniversary: e.target.value });
                    setErrors({ ...errors, anniversary: '' });
                  }}
                  className={`styled-input ${errors.anniversary ? 'input-error' : ''}`}
                  placeholder="לדוגמה: 15/08"
                />
                {errors.anniversary && (
                  <span className="field-error"><AlertCircle size={14} />{errors.anniversary}</span>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">מתי התאריך של החתונה שלנו?</label>
                <input
                  type="text"
                  value={answers.wedding}
                  onChange={(e) => {
                    setAnswers({ ...answers, wedding: e.target.value });
                    setErrors({ ...errors, wedding: '' });
                  }}
                  className={`styled-input ${errors.wedding ? 'input-error' : ''}`}
                  placeholder="לדוגמה: 06/09"
                />
                {errors.wedding && (
                  <span className="field-error"><AlertCircle size={14} />{errors.wedding}</span>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">באיזה גיל עוז?</label>
                <input
                  type="text"
                  value={answers.age}
                  onChange={(e) => {
                    setAnswers({ ...answers, age: e.target.value });
                    setErrors({ ...errors, age: '' });
                  }}
                  className={`styled-input ${errors.age ? 'input-error' : ''}`}
                  placeholder="הגיל של עוז במספרים"
                />
                {errors.age && (
                  <span className="field-error"><AlertCircle size={14} />{errors.age}</span>
                )}
              </div>

              <div className="form-field">
                <label className="field-label">כמה ילדים היינו רוצים?</label>
                <input
                  type="text"
                  value={answers.kids}
                  onChange={(e) => {
                    setAnswers({ ...answers, kids: e.target.value });
                    setErrors({ ...errors, kids: '' });
                  }}
                  className={`styled-input ${errors.kids ? 'input-error' : ''}`}
                  placeholder="במספרים..."
                />
                {errors.kids && (
                  <span className="field-error"><AlertCircle size={14} />{errors.kids}</span>
                )}
              </div>
            </div>

            <button type="submit" className="action-btn unlock-btn">
              אמת תשובות 🔐
            </button>
          </form>
        </>
      )}

      {/* Stage 4.3: Scratch Card */}
      {subStage === 3 && (
        <div className="scratch-card-wrapper fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="section-description text-center">
            הכספת נפתחה! כעת גרדי את כרטיס המזל של יום ההולדת כדי לגלות לאיזה יעד אנחנו טסים! ✈️🏝️
          </p>

          <div
            style={{
              position: 'relative',
              width: '240px',
              height: '160px',
              borderRadius: '16px',
              border: '2px solid rgba(2, 132, 199, 0.25)',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
              boxShadow: '0 8px 25px rgba(2, 132, 199, 0.08)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '1rem 0'
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-navy-muted)' }}>יעד הטיסה:</span>
            <span style={{ fontSize: '2.2rem', fontWeight: '900', color: 'var(--color-coral)', letterSpacing: '0.05em' }}>קפריסין (LCA)</span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--color-navy)' }}>לרנקה 🏖️🇨🇾</span>

            {scratchedCount < 6 && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: '102',
                    fontSize: '1rem',
                    fontWeight: '800',
                    color: '#78350f',
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.85)',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  גרדי לחשיפה! ✨
                </div>
                <div
                  className="scratch-overlay"
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gridTemplateRows: 'repeat(3, 1fr)',
                    zIndex: '100'
                  }}
                >
                  {scratchGrid.map((scratched, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => handleScratch(idx)}
                      onTouchStart={() => handleScratch(idx)}
                      style={{
                        background: 'linear-gradient(135deg, #fcd34d 0%, #f59e0b 50%, #d97706 100%)',
                        border: '1px solid rgba(255, 255, 255, 0.35)',
                        opacity: scratched ? 0 : 1,
                        transform: scratched ? 'scale(0.8)' : 'scale(1)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        pointerEvents: scratched ? 'none' : 'auto'
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Stage 4.4: Aircraft Seat Selection */}
      {subStage === 4 && !isPrinting && (
        <div className="seat-selector-wrapper fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="section-description text-center">
            היעד הוא קפריסין! 🇨🇾 כעת, בחרי את המושב שלך בטיסה ה-VIP שלכם. מושב 1B כבר שמור לעוז.
          </p>

          {renderAircraftSelectionFrame()}

          {selectedSeat && (
            <div className="fade-in" style={{ marginTop: '1.5rem', textAlign: 'center', width: '100%', maxWidth: '280px' }}>
              <button
                onClick={handlePrintStart}
                className="action-btn animate-pulse-slow"
                style={{ width: '100%' }}
              >
                הדפיסי כרטיס טיסה! 🖨️🎫
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stage 4.4.5: Printing Ticket in progress */}
      {isPrinting && (
        <div className="printing-progress-wrapper fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2rem 0' }}>
          <h2 className="section-title animate-pulse-slow" style={{ color: 'var(--color-coral)' }}>מנפיק כרטיס עלייה למטוס... 🖨️</h2>
          <p className="section-description text-center">כרטיס ה-VIP שלך נמצא כעת בתהליך הדפסה מכני. המתיני לסיום.</p>
          
          <div style={{ width: '100%', maxWidth: '440px', overflow: 'hidden', padding: '1rem 0' }}>
            <div className="ticket-printer-slot"></div>
            <div className="boarding-pass-printout">
              {renderBoardingPassLayout()}
            </div>
          </div>
        </div>
      )}

      {/* Stage 4.5: Boarding Pass & Greeter printed */}
      {subStage === 5 && !isPrinting && (
        <div className="boarding-pass-wrapper slide-up">
          {/* Auto-play "בחוף של טרפטוני" by שלומי שבת */}
          <iframe
            key="song-autoplay"
            src="https://www.youtube.com/embed/KGk2BOsVpno?autoplay=1&rel=0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              position: 'absolute',
              width: '1px',
              height: '1px',
              opacity: 0,
              pointerEvents: 'none'
            }}
            title="בחוף של טרפטוני - שלומי שבת"
          />

          {renderBoardingPassLayout()}

          {/* Download real boarding passes */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/4601600-SARUSI%20INBAR%20MS.pdf"
              download="כרטיס-טיסה-ענבר.pdf"
              className="action-btn"
              style={{ fontSize: '0.85rem', textDecoration: 'none', padding: '0.55rem 1rem' }}
            >
              הכרטיס של ענבר 🎫
            </a>
            <a
              href="/4601600-BASHARI%20OZ%20MR.pdf"
              download="כרטיס-טיסה-עוז.pdf"
              className="action-btn"
              style={{ fontSize: '0.85rem', textDecoration: 'none', padding: '0.55rem 1rem', background: 'var(--color-sky)' }}
            >
              הכרטיס של עוז 🎫
            </a>
          </div>

          <div className="birthday-greeting-card fade-in">
            <h3>מזל טוב אהובה שלי! ❤️</h3>
            <p>
              ארזת כבר הכל? כי ביום רביעי בשעה 19:10 אנחנו ממריאים לחופשה מטורפת בקפריסין!
              מחכה כבר לחגוג איתך כמו שמגיע לך. 🇨🇾🏖️
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
