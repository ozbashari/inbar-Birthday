import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Key, CalendarCheck, Heart, Briefcase, FileText } from 'lucide-react';
import { playClick, playTick, playChime, playFail } from '../utils/audio';

const WHEEL_COMPLIMENTS = [
  { short: "החיוך שלך 😍", full: "החיוך הכי יפה בעולם 😍" },
  { short: "הטוב לב 💖", full: "הטוב לב והנשמה הטהורה שלך 💖" },
  { short: "החוכמה 🧠", full: "החוכמה והשנינות שלך 🧠" },
  { short: "החיבוק החם 🤗", full: "החיבוק הכי חם ומנחם 🤗" },
  { short: "ההומור שלך 😂", full: "היכולת שלך להצחיק אותי תמיד 😂" },
  { short: "העיניים 👀✨", full: "העיניים המהפנטות שלך 👀✨" }
];

// Items inside suitcases for Day 1 Stage 4
const SUITCASE_ITEMS = [
  { id: 1, content: '🧦 גרביים משומשות... איכס!', isHeart: false },
  { id: 2, content: '🍌 בננה ישנה ומעוכה!', isHeart: false },
  { id: 3, content: '🦆 הברווז הגומי הצהוב שלנו!', isHeart: false },
  { id: 4, content: '❤️ מצאת את הלב שלי! ❤️', isHeart: true },
  { id: 5, content: '🔌 כבל מטען קרוע!', isHeart: false },
  { id: 6, content: '👒 כובע קש ישן!', isHeart: false },
  { id: 7, content: '🧴 בקבוק שמפו ריק!', isHeart: false },
  { id: 8, content: '🪥 מברשת שיניים כחולה!', isHeart: false },
  { id: 9, content: '📖 ספר מתח ישן ורטוב!', isHeart: false }
];

export default function Day1Verification({ config, onComplete, isCompleted }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');
  
  // Sub-stages: 1 (birthday form), 2 (compliment wheel), 3 (self-compliment input), 4 (suitcase hunt), 5 (completed view)
  const [subStage, setSubStage] = useState(() => {
    if (isCompleted) return 5;
    return 1;
  });

  // Wheel states
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCompliment, setSelectedCompliment] = useState('');

  // Self compliment states
  const [selfCompliment, setSelfCompliment] = useState('');
  const [selfComplimentError, setSelfComplimentError] = useState('');

  // Suitcase hunt states
  const [suitcases, setSuitcases] = useState([]);
  const [openedSuitcases, setOpenedSuitcases] = useState([]);
  const [foundHeart, setFoundHeart] = useState(false);
  const [foundNonHeart, setFoundNonHeart] = useState(0);
  const [duckFound, setDuckFound] = useState(false);
  const [duckMoment, setDuckMoment] = useState(false);

  useEffect(() => {
    if (isCompleted) {
      setSubStage(5);
    } else if (subStage === 1) {
      // Shuffle suitcase items
      const shuffled = [...SUITCASE_ITEMS]
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);
      setSuitcases(shuffled);
    }
  }, [isCompleted]);

  // Accepts any separator: 27/06, 27.06, 27-06, 2706 — all normalize to "2706"
  const cleanDate = (str) => {
    return str.trim().replace(/[/.\-\s]/g, '').replace(/[^0-9]/g, '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanInput = cleanDate(inputValue);
    const cleanTarget = cleanDate(config.birthday);

    if (cleanInput && cleanInput === cleanTarget) {
      setError('');
      playChime();
      if (isCompleted) {
        setSubStage(5);
      } else {
        setSubStage(2);
      }
    } else {
      playFail();
      setError('זהות לא אומתה. תאריך לא נכון, נסי שוב... 🤫');
    }
  };

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    playClick();

    const randomIndex = Math.floor(Math.random() * WHEEL_COMPLIMENTS.length);
    const sliceDegrees = 360 / WHEEL_COMPLIMENTS.length;
    const baseRotation = (270 - (randomIndex * sliceDegrees + sliceDegrees / 2) + 360) % 360;
    const degrees = 360 * 5 + baseRotation;
    setWheelRotation(degrees);

    // Schedule ticking sounds with parabolic slowdown
    for (let i = 0; i < 18; i++) {
      setTimeout(() => {
        playTick();
      }, i * i * 9.5 + i * 50); // fits exactly under 3500ms
    }

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedCompliment(WHEEL_COMPLIMENTS[randomIndex].full);
      playChime();
    }, 3500);
  };

  const goToSelfCompliment = () => {
    playClick();
    setSubStage(3);
  };

  const handleSelfComplimentSubmit = (e) => {
    e.preventDefault();
    if (!selfCompliment.trim() || selfCompliment.trim().length < 3) {
      playFail();
      setSelfComplimentError('אל תתביישי, רשמי משהו קטן ומפרגן על עצמך... 😉');
      return;
    }
    playChime();
    localStorage.setItem('birthday_her_self_compliment', selfCompliment.trim());
    setSubStage(4);
  };

  const handleSuitcaseClick = (index) => {
    if (openedSuitcases.includes(index)) return;
    // Don't allow reopening heart if already found
    if (foundHeart && suitcases[index].isHeart) return;

    const nextOpened = [...openedSuitcases, index];
    setOpenedSuitcases(nextOpened);

    if (suitcases[index].isHeart) {
      setFoundHeart(true);
      playChime();
    } else {
      const isDuck = suitcases[index].id === 3;
      if (isDuck) {
        setDuckFound(true);
        setDuckMoment(true);
        setTimeout(() => setDuckMoment(false), 3200);
      }
      setFoundNonHeart(prev => prev + 1);
      playClick();
    }
  };

  const completeDay1 = () => {
    playClick();
    setSubStage(5);
    onComplete(true);
  };

  return (
    <div className="card-content fade-in" dir="rtl">
      {/* Substage Indicator */}
      {subStage < 5 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-navy-muted)' }}>
          <span 
            style={{ color: subStage === 1 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(1)}
          >אימות תאריך 🔑</span>
          <span>•</span>
          <span 
            style={{ color: subStage === 2 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(2)}
          >גלגל המחמאות 🌀</span>
          <span>•</span>
          <span 
            style={{ color: subStage === 3 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(3)}
          >פרגון עצמי ✍️</span>
          <span>•</span>
          <span 
            style={{ color: subStage === 4 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(4)}
          >חיפוש במזוודה 🧳</span>
        </div>
      )}

      <div className="icon-wrapper primary-glow">
        {subStage === 5 ? (
          <ShieldCheck size={48} className="icon-success animate-bounce-slow" />
        ) : subStage === 4 ? (
          <Briefcase size={48} className="icon-secondary animate-pulse" />
        ) : subStage === 3 ? (
          <FileText size={48} className="icon-primary animate-pulse" />
        ) : subStage === 2 ? (
          <Heart size={48} className="icon-accent animate-pulse" />
        ) : (
          <Key size={48} className="icon-primary animate-pulse" />
        )}
      </div>

      {/* Stage 1.1: Verification Form */}
      {subStage === 1 && (
        <form onSubmit={handleSubmit} className="verification-form">
          <h2 className="section-title">אימות זהות סודית</h2>
          <p className="section-description">
            כדי לאמת את זהותך ולהתחיל בחגיגות, מהו תאריך יום ההולדת שלך?
          </p>

          <div className="input-group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError('');
              }}
              className="styled-input text-center"
              placeholder="לדוגמה: 15/03"
              autoFocus
            />
          </div>

          {error && (
            <div className="error-message fade-in">
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="action-btn">
            אמת זהות
          </button>
        </form>
      )}

      {/* Stage 1.2: Compliment Wheel */}
      {subStage === 2 && (
        <div className="wheel-game-wrapper fade-in" style={{ width: '100%' }}>
          <h2 className="section-title">גלגל המחמאות של עוז 🎡</h2>
          <p className="section-description">
            הזהות אומתה! אך לפני שנעבור לשלב הבא, סובבי את הגלגל כדי לגלות מה הדבר שהכי ממיס אותי בך היום.
          </p>

          <div className="wheel-container">
            <div className="wheel-pointer"></div>
            <div
              className="wheel-outer"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: wheelRotation === 0 ? 'none' : 'transform 3.5s cubic-bezier(0.1, 0.8, 0.1, 1)',
                margin: '0 auto'
              }}
            >
              <div className="wheel-inner-pin"></div>
              <div className="wheel-labels">
                {WHEEL_COMPLIMENTS.map((item, i) => (
                  <div
                    key={i}
                    className="wheel-label-item"
                    style={{
                      transform: `rotate(${i * 60 + 30}deg) translate(0%, -50%)`,
                      transformOrigin: '0% 50%',
                      left: '50%',
                      top: '50%',
                      paddingLeft: '45px',
                      position: 'absolute',
                      width: '120px',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      color: '#0f172a',
                      textAlign: 'left',
                      boxSizing: 'border-box'
                    }}
                  >
                    <span>{item.short}</span>
                  </div>
                ))}
              </div>
            </div>

            {!selectedCompliment ? (
              <button
                onClick={spinWheel}
                disabled={isSpinning}
                className="action-btn spin-btn mt-6"
              >
                {isSpinning ? 'מסתובב...' : 'סובבי את הגלגל! 🌀'}
              </button>
            ) : (
              <div className="compliment-result-card fade-in" style={{ margin: '1.5rem auto' }}>
                <span className="success-badge">זכית במחמאה:</span>
                <p className="compliment-text">{selectedCompliment}</p>
                <button
                  onClick={goToSelfCompliment}
                  className="action-btn mt-4"
                >
                  המשך למשחק הבא 💖
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage 1.3: Her Self Compliment Form */}
      {subStage === 3 && (
        <form onSubmit={handleSelfComplimentSubmit} className="verification-form fade-in">
          <h2 className="section-title">עכשיו תורך! 💖✍️</h2>
          <p className="section-description">
            קיבלת מחמאה ממני, עכשיו תורך לפרגן לעצמך! רשמי דבר אחד שאת הכי אוהבת בעצמך, או מחמאה שמגיעה לך היום:
          </p>

          <div className="input-group" style={{ width: '100%' }}>
            <input
              type="text"
              value={selfCompliment}
              onChange={(e) => {
                setSelfCompliment(e.target.value);
                setSelfComplimentError('');
              }}
              className={`styled-input ${selfComplimentError ? 'input-error' : ''}`}
              placeholder="אני אוהבת בעצמי ש..."
              autoFocus
            />
          </div>

          {selfComplimentError && (
            <div className="error-message fade-in">
              <ShieldAlert size={16} />
              <span>{selfComplimentError}</span>
            </div>
          )}

          <button type="submit" className="action-btn mt-4" style={{ minWidth: '160px' }}>
            שלחי מחמאה ✨
          </button>
        </form>
      )}

      {/* Stage 1.4: Suitcase Hunt */}
      {subStage === 4 && (
        <div className="suitcase-game-wrapper fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title">איפה הלב שלי? 🧳🔎</h2>
          <p className="section-description">
            פתחי את המזוודות ומצאי את הלב של עוז! 💌
          </p>

          <div
            className="suitcase-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              width: '100%',
              maxWidth: '280px',
              margin: '1rem 0'
            }}
          >
            {suitcases.map((item, idx) => {
              const isOpen = openedSuitcases.includes(idx);
              const isWin = item.isHeart;

              return (
                <div
                  key={idx}
                  onClick={() => handleSuitcaseClick(idx)}
                  className={`suitcase-card-item ${isOpen ? 'open' : ''}`}
                >
                  {/* Card Front (Closed Suitcase) */}
                  <div className="suitcase-card-inner suitcase-card-front">
                    <span style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🧳</span>
                  </div>

                  {/* Card Back (Revealed content) */}
                  <div className={`suitcase-card-inner suitcase-card-back ${isWin ? 'win' : ''} ${item.id === 3 && isOpen ? 'duck-win' : ''}`}>
                    <span style={{ fontSize: isWin ? '1.15rem' : item.id === 3 ? '1rem' : '0.8rem', fontWeight: '800', color: isWin ? 'var(--color-navy)' : item.id === 3 ? '#92400e' : 'var(--color-navy)' }}>
                      {item.content}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {foundHeart && foundNonHeart < 4 && (
            <div className="suitcase-victory-card fade-in" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <span className="success-badge">הלב נמצא! ❤️</span>
              <p style={{ fontSize: '0.9rem', fontWeight: '700', margin: '0.5rem 0', color: 'var(--color-navy-muted)' }}>
                יפה! עכשיו המשיכי לפתוח עוד מזוודות... 🧳
              </p>
            </div>
          )}

          {foundHeart && foundNonHeart >= 4 && (
            <div className="suitcase-victory-card fade-in" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <span className="success-badge">הלב נמצא! ❤️</span>
              <p style={{ fontSize: '0.95rem', fontWeight: '700', margin: '0.5rem 0' }}>מצאת את הלב שלי! ועכשיו את מוכנה לקבל את משימת היום.</p>
              <button
                onClick={completeDay1}
                className="action-btn mt-2"
              >
                חשפי את המשימה! 🔓
              </button>
            </div>
          )}
        </div>
      )}

      {/* Duck Moment Overlay — pops up when the rubber duck is found */}
      {duckMoment && (
        <div
          onClick={() => setDuckMoment(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(254, 243, 199, 0.96)',
            zIndex: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.25rem',
            cursor: 'pointer',
            animation: 'fade-in 0.3s ease'
          }}
        >
          <div style={{ fontSize: '7rem', animation: 'bounce-slow 0.7s ease infinite alternate' }}>🦆</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#92400e', margin: 0, textAlign: 'center' }}>
            הברווז הצהוב שלנו!! 💛
          </h2>
          <p style={{ fontSize: '1rem', fontWeight: '700', color: '#b45309', margin: 0, textAlign: 'center', maxWidth: '260px', lineHeight: '1.5' }}>
            כמובן שהוא מסתתר במזוודה 🛁<br />חייב לקחת אותו לחופשה!
          </p>
          <span style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: '600', marginTop: '0.5rem' }}>לחצי להמשיך</span>
        </div>
      )}

      {/* Stage 1.5: Final Completed screen */}
      {subStage === 5 && (
        <div className="success-container fade-in">
          <div className="success-badge">
            <CalendarCheck size={20} />
            <span>הזהות אומתה והלב נמצא</span>
          </div>
          <h2 className="success-title">ברוכה הבאה לשבוע שלך! 🎉</h2>
          <p className="success-text">
            זהות אומתה והכל מוכן להתחלה.
          </p>
          <div className="mission-card">
            <span className="mission-badge">המשימה הראשונה שלך:</span>
            <p className="mission-instruction">
              לפנות את הלו"ז מרביעי בבוקר ועד יום ראשון.
            </p>
          </div>
          <p className="next-day-notice">נתראה כאן מחר ב-08:00. 🕒</p>
        </div>
      )}
    </div>
  );
}
