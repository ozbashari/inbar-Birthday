import React, { useState, useEffect } from 'react';
import { Sun, CloudSun, Music, Compass, AlertCircle } from 'lucide-react';
import { playClick, playChime, playFail } from '../utils/audio';

const CARD_SYMBOLS = [
  '✈️', '🏖️', '🍹', '🌴', '🦆', '🌊', '🐚', '🌺',
  '✈️', '🏖️', '🍹', '🌴', '🦆', '🌊', '🐚', '🌺'
];

const TRIVIA_QUESTIONS = [
  {
    question: 'איזה זמר/להקה היו בהופעה הראשונה שהלכנו אליה יחד?',
    options: ['טונה 🎵', 'הפרויקט של עידן רייכל 🎶', 'נקסט 🎤', 'אסף אמדורסקי 🎸'],
    correct: 0  // טונה
  },
  {
    question: 'באיזה יעד הייתה חופשת החוף הראשונה שלנו?',
    options: ['ספרד 🇪🇸', 'כריתים 🇬🇷', 'בודפסט 🏛️', 'קולומביה 🌺'],
    correct: 0  // ספרד
  },
  {
    question: 'איפה הכי בא לנו לשמוע את פלייליסט הקיץ החדש שלנו?',
    options: ['על חוף הים עם בירה קרה 🏖️🍺', 'במרפסת בשעות השקיעה 🌅', 'בנסיעה ארוכה אל הלא נודע ✈️'],
    correct: 0
  }
];

export default function Day3Vibe({ config }) {
  const [subStage, setSubStage] = useState(() => {
    const isDone = localStorage.getItem('birthday_day3_game_completed') === 'true';
    return isDone ? 3 : 1;
  });

  const [cards, setCards] = useState([]);
  const [flippedIndices, setFlippedIndices] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState([]);

  const [triviaIndex, setTriviaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [triviaError, setTriviaError] = useState('');

  useEffect(() => {
    if (subStage === 1) {
      const shuffled = [...CARD_SYMBOLS]
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      setCards(shuffled);
    }
  }, [subStage]);

  const handleCardClick = (index) => {
    if (flippedIndices.length >= 2 || flippedIndices.includes(index) || matchedIndices.includes(index)) {
      return;
    }

    playClick();
    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const firstIndex = newFlipped[0];
      const secondIndex = newFlipped[1];

      if (cards[firstIndex] === cards[secondIndex]) {
        const newMatched = [...matchedIndices, firstIndex, secondIndex];
        setMatchedIndices(newMatched);
        setFlippedIndices([]);
        playChime();

        if (newMatched.length === cards.length) {
          setTimeout(() => {
            setSubStage(2);
            playChime();
          }, 800);
        }
      } else {
        setTimeout(() => {
          setFlippedIndices([]);
          playFail();
        }, 1000);
      }
    }
  };

  const handleTriviaAnswer = (optionIdx) => {
    setSelectedOption(optionIdx);
    setTriviaError('');

    const correctIdx = TRIVIA_QUESTIONS[triviaIndex].correct;
    if (optionIdx === correctIdx) {
      playChime();
      setTimeout(() => {
        setSelectedOption(null);
        if (triviaIndex + 1 < TRIVIA_QUESTIONS.length) {
          setTriviaIndex(triviaIndex + 1);
        } else {
          setSubStage(3);
          localStorage.setItem('birthday_day3_game_completed', 'true');
          playChime();
        }
      }, 800);
    } else {
      playFail();
      setTimeout(() => {
        setTriviaError('אופס! נסי שוב, אני בטוח שאת יודעת... 😉');
        setSelectedOption(null);
      }, 500);
    }
  };

  return (
    <div className="card-content fade-in" dir="rtl">
      {/* Substage Indicator */}
      {subStage < 3 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-navy-muted)' }}>
          <span 
            style={{ color: subStage === 1 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(1)}
          >משחק זיכרון 🏖️</span>
          <span>•</span>
          <span 
            style={{ color: subStage === 2 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(2)}
          >חידון מוזיקלי 🎵</span>
        </div>
      )}

      <div className="icon-wrapper accent-glow">
        <Compass size={48} className="icon-accent animate-spin-slow" />
      </div>

      <h2 className="section-title">בניית האווירה</h2>

      {/* Stage 3.1: Memory matching */}
      {subStage === 1 && (
        <div className="game-wrapper fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <p className="section-description text-center">
            ההתרגשות בשיאה! כדי להתחיל לבנות את האווירה לחופשה, פתרי את משחק הזיכרון הקייצי הקצר.
          </p>

          <div
            className="memory-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              width: '100%',
              maxWidth: '320px',
              margin: '1rem 0',
              perspective: '800px'
            }}
          >
            {cards.map((symbol, idx) => {
              const isFlipped = flippedIndices.includes(idx) || matchedIndices.includes(idx);
              const isMatched = matchedIndices.includes(idx);

              return (
                <div
                  key={idx}
                  onClick={() => handleCardClick(idx)}
                  className={`memory-card ${isFlipped ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
                  style={{
                    aspectRatio: '1',
                    background: isFlipped
                      ? '#fff'
                      : 'linear-gradient(135deg, var(--color-coral) 0%, #ff5e62 100%)',
                    border: isFlipped
                      ? '2px solid var(--color-sky)'
                      : '2px solid rgba(255,255,255,0.45)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isFlipped ? '1.8rem' : '0rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(15,23,42,0.08)',
                    transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s, border-color 0.3s',
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)'
                  }}
                >
                  <span style={{ transform: isFlipped ? 'rotateY(180deg)' : 'none', pointerEvents: 'none' }}>
                    {isFlipped ? symbol : '❓'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stage 3.2: Music Trivia */}
      {subStage === 2 && (
        <div className="trivia-wrapper fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="section-description text-center">
            משחק הזיכרון פוצח! כעת, בואי נראה כמה את מכירה את הזיכרונות המוזיקליים שלנו.
          </p>

          <div className="glass-card-nested" style={{ width: '100%', maxWidth: '380px', boxSizing: 'border-box', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-coral)' }}>שאלה {triviaIndex + 1} מתוך {TRIVIA_QUESTIONS.length}</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--color-navy)', lineHeight: '1.4' }}>
              {TRIVIA_QUESTIONS[triviaIndex].question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {TRIVIA_QUESTIONS[triviaIndex].options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = TRIVIA_QUESTIONS[triviaIndex].correct === idx;
                
                let btnBackground = '#fff';
                let btnBorder = '1px solid rgba(15,23,42,0.1)';
                if (isSelected) {
                  btnBackground = isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                  btnBorder = isCorrect ? '2px solid var(--color-success)' : '2px solid var(--color-danger)';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleTriviaAnswer(idx)}
                    disabled={selectedOption !== null}
                    style={{
                      padding: '0.85rem 1rem',
                      background: btnBackground,
                      border: btnBorder,
                      borderRadius: '10px',
                      fontFamily: 'var(--font-primary)',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      color: 'var(--color-navy)',
                      cursor: 'pointer',
                      textAlign: 'right',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {triviaError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: '700', marginTop: '0.25rem' }}>
                <AlertCircle size={14} />
                <span>{triviaError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage 3.3: Final Unlocked Vibe view */}
      {subStage === 3 && (
        <div className="unlocked-vibe-content fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div className="success-badge">שעשועון מוזיקלי הושלם! 🎵✨</div>
          <p className="section-description text-center">
            הנה פרטי מזג האוויר וקישור לפלייליסט הטיסה המיוחד שהכנתי במיוחד בשבילך:
          </p>

          <div className="weather-widget glass-card-nested">
            <div className="weather-header">
              <span className="weather-title">מזג אוויר ביעד</span>
              <span className="weather-status-badge">סודי בהחלט</span>
            </div>
            <div className="weather-body">
              <div className="weather-temp-container">
                <span className="weather-temp">28°C</span>
                <span className="weather-desc">שמש חמימה ☀️</span>
              </div>
              <div className="weather-icon-container">
                <div className="sun-glow-effect"></div>
                <CloudSun size={64} className="weather-icon animate-bounce-slow" />
              </div>
            </div>
            <div className="weather-footer">
              <span>יעד מסווג</span>
              <span>•</span>
              <span>רוח קלילה</span>
            </div>
          </div>

          <div className="takeoff-banner">
            <p className="takeoff-text">
              מחר ב-<strong>19:10</strong> אנחנו ממריאים! ✈️
            </p>
            <p className="takeoff-subtext">
              הנה משהו להכניס אותך לאווירה כבר מעכשיו...
            </p>
          </div>

          <a
            href={config.spotifyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="spotify-btn-container"
          >
            <button className="spotify-btn animate-pulse-slow">
              <Music size={22} className="spotify-icon" />
              <span>להאזנה לפלייליסט בספוטיפיי</span>
            </button>
          </a>
        </div>
      )}
    </div>
  );
}
