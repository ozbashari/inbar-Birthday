import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, CheckCircle2, Circle, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { playClick, playPop, playChime, playFail } from '../utils/audio';

const PACKING_ITEMS = [
  { id: 'swimwear',       emoji: '👙', text: 'בגדי ים',               subtext: 'חשוב מאוד!',        color: '#fce7f3', border: '#f9a8d4' },
  { id: 'sunscreen',      emoji: '🕶️', text: 'משקפי שמש וקרם הגנה', subtext: 'הגנה מהשמש',        color: '#fef9c3', border: '#fde047' },
  { id: 'evening_clothes',emoji: '👗', text: 'בגדים קלילים לערב',    subtext: 'לצאת ולהסתפר',      color: '#ede9fe', border: '#c4b5fd' },
  { id: 'charger_book',   emoji: '📚', text: 'מטען וספר',             subtext: 'לא לשכוח!',          color: '#dcfce7', border: '#86efac' }
];

// 🦆 Duck is special — catches it gives 2 points!
const EMOJIS = ['👙', '🕶️', '👗', '📚', '🦆'];

const PACKING_QUIZ = [
  {
    question: 'מה אסור לשכוח לארוז לחופשה בחו"ל?',
    options: ['מזרן 🛏️', 'מטרייה ☔', 'דרכון ✈️', 'אוסף הספרים 📚'],
    correct: 2
  },
  {
    question: 'כמה ימים לפני הטיסה כדאי להתחיל לארוז?',
    options: ['חודש מראש 😅', 'שבוע לפחות 📅', 'יום לפני ⏰', 'ביום הטיסה 😬'],
    correct: 1
  },
  {
    question: 'מה חייב להיות בתיק החוף?',
    options: ['מחשב נייד 💻', 'קרם הגנה + אוזניות 🎧☀️', 'כלי עבודה 🔧', 'מחברת תרגילים 📓'],
    correct: 1
  }
];

// Shadow match items
const SHADOW_ITEMS = [
  { id: 'swim', emoji: '👙', name: 'בגד ים' },
  { id: 'glass', emoji: '🕶️', name: 'משקפי שמש' },
  { id: 'dress', emoji: '👗', name: 'בגדים קלילים' },
  { id: 'book', emoji: '📚', name: 'ספר קריאה' }
];

export default function Day2Packing({ onComplete, isCompleted }) {
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('birthday_packing_checklist');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  // Sub-stages: 1 (checklist), 2 (catching game), 3 (packing quiz), 4 (shadow match), 5 (completed)
  const [subStage, setSubStage] = useState(() => {
    if (isCompleted) return 5;
    return 1;
  });

  const [score, setScore] = useState(0);

  // Catching game physics states
  const [suitcaseX, setSuitcaseX] = useState(160);
  const [fallingItem, setFallingItem] = useState({ x: 140, y: 0, emoji: '👙' });
  const [gamePlaying, setGamePlaying] = useState(false);
  const [duckCaught, setDuckCaught] = useState(false);

  // Quiz states
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizError, setQuizError] = useState('');

  // Shadow match states
  const [shuffledSilhouettes, setShuffledSilhouettes] = useState([]);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);

  const containerRef = useRef(null);
  const requestRef = useRef(null);

  useEffect(() => {
    if (isCompleted) {
      setSubStage(5);
    } else if (subStage === 4) {
      const shuffled = [...SHADOW_ITEMS]
        .map((item) => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => item);
      setShuffledSilhouettes(shuffled);
    }
  }, [isCompleted, subStage]);

  const toggleItem = (id) => {
    if (subStage > 1) return;
    playPop();
    const updated = {
      ...checkedItems,
      [id]: !checkedItems[id]
    };
    setCheckedItems(updated);
    localStorage.setItem('birthday_packing_checklist', JSON.stringify(updated));

    const allChecked = PACKING_ITEMS.every(item => updated[item.id]);
    if (allChecked) {
      if (isCompleted) {
        setSubStage(5);
      } else {
        setTimeout(() => {
          setSubStage(2);
          playChime();
        }, 300);
      }
    }
  };

  const startGame = () => {
    playClick();
    setScore(0);
    setDuckCaught(false);
    setSuitcaseX(160);
    resetFallingItem();
    setGamePlaying(true);
  };

  const resetFallingItem = () => {
    const randomX = Math.floor(Math.random() * 260) + 10;
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setFallingItem({ x: randomX, y: 0, emoji: randomEmoji });
  };

  // Game physics animation loop
  useEffect(() => {
    if (!gamePlaying) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const updateGame = () => {
      setFallingItem((prev) => {
        const speed = 2.5;
        const nextY = prev.y + speed;

        if (nextY >= 210 && prev.y < 210) {
          const itemCenter = prev.x + 10;
          const suitcaseMin = suitcaseX - 40;
          const suitcaseMax = suitcaseX + 40;

          if (itemCenter >= suitcaseMin && itemCenter <= suitcaseMax) {
            // Duck = bonus 2 points! 🦆
            const points = prev.emoji === '🦆' ? 2 : 1;
            if (prev.emoji === '🦆') setDuckCaught(true);

            const newScore = score + points;
            setScore(newScore);
            playPop();

            if (newScore >= 10) {
              setGamePlaying(false);
              setTimeout(() => {
                setSubStage(3);
                playChime();
              }, 400);
              return prev;
            }

            setTimeout(resetFallingItem, 50);
            return { ...prev, y: 230 };
          }
        }

        if (nextY > 250) {
          setTimeout(resetFallingItem, 50);
          return { ...prev, y: 260 };
        }

        return { ...prev, y: nextY };
      });

      requestRef.current = requestAnimationFrame(updateGame);
    };

    requestRef.current = requestAnimationFrame(updateGame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [gamePlaying, suitcaseX, score]);

  const handleTouchMove = (e) => {
    if (!containerRef.current || !gamePlaying) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const clampedX = Math.max(40, Math.min(rect.width - 40, x));
    setSuitcaseX(clampedX);
  };

  const moveLeft = () => {
    playPop();
    setSuitcaseX(prev => Math.max(40, prev - 35));
  };

  const moveRight = () => {
    playPop();
    setSuitcaseX(prev => Math.min(280, prev + 35));
  };

  const handleQuizAnswer = (optIdx) => {
    setQuizSelected(optIdx);
    setQuizError('');
    const correct = PACKING_QUIZ[quizIndex].correct;
    if (optIdx === correct) {
      playChime();
      setTimeout(() => {
        setQuizSelected(null);
        if (quizIndex + 1 < PACKING_QUIZ.length) {
          setQuizIndex(quizIndex + 1);
        } else {
          setSubStage(4);
          playChime();
        }
      }, 800);
    } else {
      playFail();
      setTimeout(() => {
        setQuizError('לא בדיוק... נסי שוב! 😄');
        setQuizSelected(null);
      }, 500);
    }
  };

  const handleEmojiSelect = (item) => {
    if (matchedIds.includes(item.id)) return;
    playClick();
    setSelectedEmoji(item);
  };

  const handleSilhouetteSelect = (item) => {
    if (!selectedEmoji) return;

    if (selectedEmoji.id === item.id) {
      const nextMatched = [...matchedIds, item.id];
      setMatchedIds(nextMatched);
      setSelectedEmoji(null);
      playChime();

      if (nextMatched.length === SHADOW_ITEMS.length) {
        setTimeout(() => {
          setSubStage(5);
          onComplete(true);
        }, 800);
      }
    } else {
      playFail();
      setSelectedEmoji(null);
    }
  };

  return (
    <div className="card-content fade-in" dir="rtl">
      {/* Substage Indicator */}
      {subStage < 5 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-navy-muted)', flexWrap: 'wrap' }}>
          <span
            style={{ color: subStage === 1 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(1)}
          >רשימת ציוד 📋</span>
          <span>•</span>
          <span
            style={{ color: subStage === 2 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(2)}
          >תפיסת בגדים 🧳</span>
          <span>•</span>
          <span
            style={{ color: subStage === 3 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(3)}
          >חידון אריזה 🧠</span>
          <span>•</span>
          <span
            style={{ color: subStage === 4 ? 'var(--color-coral)' : 'inherit', cursor: 'pointer' }}
            onClick={() => setSubStage(4)}
          >התאמת צלליות 👤</span>
        </div>
      )}

      <div className="icon-wrapper secondary-glow">
        <Briefcase size={48} className="icon-secondary animate-pulse" />
      </div>

      {/* Stage 2.1: Checklist */}
      {subStage === 1 && (
        <>
          <h2 className="section-title">משימת האריזה 🧳</h2>
          <p className="section-description">
            סמני כל פריט שארזת כדי להמשיך לשלב הבא!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
            {PACKING_ITEMS.map((item) => {
              const isChecked = !!checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.9rem 1.1rem',
                    borderRadius: '14px',
                    background: isChecked ? item.color : '#ffffff',
                    border: `2px solid ${isChecked ? item.border : 'rgba(15,23,42,0.08)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: isChecked ? `0 4px 12px ${item.border}55` : '0 2px 6px rgba(15,23,42,0.04)',
                    transform: isChecked ? 'scale(1.02)' : 'scale(1)',
                    userSelect: 'none'
                  }}
                >
                  {/* Emoji icon */}
                  <div style={{
                    fontSize: '2rem',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    background: isChecked ? 'rgba(255,255,255,0.7)' : 'rgba(15,23,42,0.04)',
                    flexShrink: 0,
                    transition: 'transform 0.3s ease',
                    transform: isChecked ? 'rotate(-8deg) scale(1.15)' : 'none'
                  }}>
                    {item.emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{
                      fontSize: '0.95rem',
                      fontWeight: '800',
                      color: 'var(--color-navy)',
                      textDecoration: isChecked ? 'line-through' : 'none',
                      opacity: isChecked ? 0.6 : 1,
                      transition: 'all 0.2s'
                    }}>
                      {item.text}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-navy-muted)', fontWeight: '600' }}>
                      {item.subtext}
                    </div>
                  </div>

                  {/* Check indicator */}
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    border: isChecked ? `2px solid ${item.border}` : '2px solid rgba(15,23,42,0.15)',
                    background: isChecked ? item.border : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    transform: isChecked ? 'scale(1.1)' : 'scale(1)'
                  }}>
                    {isChecked && (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', justifyContent: 'center' }}>
            {PACKING_ITEMS.map((item) => (
              <div key={item.id} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: checkedItems[item.id] ? 'var(--color-success)' : 'rgba(15,23,42,0.15)',
                transition: 'background 0.3s ease'
              }} />
            ))}
          </div>
        </>
      )}

      {/* Stage 2.2: Catching Game */}
      {subStage === 2 && (
        <div className="game-wrapper fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title">משחק אריזת המזוודה! 🧳</h2>
          <p className="section-description">
            הזיזי את המזוודה ותפסי פריטים. תפסי ברווז? 🦆 זה שווה <strong>2 נקודות</strong>!
          </p>

          {duckCaught && (
            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#92400e', background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '8px', padding: '0.3rem 0.75rem', marginBottom: '0.5rem' }}>
              🦆 הברווז שלנו נתפס! בונוס x2 💛
            </div>
          )}

          <div
            ref={containerRef}
            onMouseMove={handleTouchMove}
            onTouchMove={handleTouchMove}
            className="game-container-box"
            style={{
              width: '320px',
              height: '260px',
              background: 'linear-gradient(180deg, #bae6fd 0%, #0284c7 100%)',
              border: '4px solid var(--color-sky)',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'none',
              touchAction: 'none'
            }}
          >
            {gamePlaying ? (
              <>
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '15px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  color: 'var(--color-navy)',
                  padding: '2px 10px',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  fontWeight: '800',
                  zIndex: '10'
                }}>
                  {score} / 10 נקודות
                </div>

                <div
                  style={{
                    position: 'absolute',
                    left: `${fallingItem.x}px`,
                    top: `${fallingItem.y}px`,
                    fontSize: '2rem',
                    pointerEvents: 'none',
                    lineHeight: '1',
                    transition: 'left 0.1s ease-out',
                    filter: fallingItem.emoji === '🦆'
                      ? 'drop-shadow(0 0 12px gold)'
                      : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.65))',
                    animation: 'spin-slow 4s linear infinite'
                  }}
                >
                  {fallingItem.emoji}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    left: `${suitcaseX - 35}px`,
                    top: '205px',
                    fontSize: '3.2rem',
                    width: '70px',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    lineHeight: '1',
                    filter: 'drop-shadow(0 0 10px var(--color-sky))'
                  }}
                >
                  💼
                </div>
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <span style={{ fontSize: '3rem' }}>🧳✈️🏝️</span>
                <button onClick={startGame} className="action-btn" style={{ maxWidth: '160px' }}>
                  שחקי עכשיו!
                </button>
              </div>
            )}
          </div>

          {gamePlaying && (
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', justifyContent: 'center', width: '100%' }}>
              <button onClick={moveLeft} className="action-btn" style={{ maxWidth: '70px', padding: '0.5rem', background: 'var(--color-sky)', color: '#ffffff', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)' }}>
                <ArrowRight size={24} />
              </button>
              <button onClick={moveRight} className="action-btn" style={{ maxWidth: '70px', padding: '0.5rem', background: 'var(--color-sky)', color: '#ffffff', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.2)' }}>
                <ArrowLeft size={24} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Stage 2.3: Packing Quiz */}
      {subStage === 3 && (
        <div className="trivia-wrapper fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title">חידון אריזה חכמה 🧠</h2>
          <p className="section-description text-center">
            שלב 3 מתוך 4! ענה על שאלות האריזה כדי לפצח את שילוב הכספת.
          </p>

          <div className="glass-card-nested" style={{ width: '100%', maxWidth: '380px', boxSizing: 'border-box', textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--color-coral)' }}>
              שאלה {quizIndex + 1} מתוך {PACKING_QUIZ.length}
            </span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', margin: '0 0 0.5rem 0', color: 'var(--color-navy)', lineHeight: '1.4' }}>
              {PACKING_QUIZ[quizIndex].question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PACKING_QUIZ[quizIndex].options.map((option, idx) => {
                const isSelected = quizSelected === idx;
                const isCorrect = PACKING_QUIZ[quizIndex].correct === idx;

                let btnBackground = '#fff';
                let btnBorder = '1px solid rgba(15,23,42,0.1)';
                if (isSelected) {
                  btnBackground = isCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
                  btnBorder = isCorrect ? '2px solid var(--color-success)' : '2px solid var(--color-danger)';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleQuizAnswer(idx)}
                    disabled={quizSelected !== null}
                    style={{
                      padding: '0.85rem 1rem',
                      background: btnBackground,
                      border: btnBorder,
                      borderRadius: '10px',
                      fontFamily: 'var(--font-primary)',
                      fontSize: '0.95rem',
                      fontWeight: '700',
                      color: 'var(--color-navy)',
                      cursor: quizSelected !== null ? 'default' : 'pointer',
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

            {quizError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-danger)', fontSize: '0.8rem', fontWeight: '700', marginTop: '0.25rem' }}>
                <AlertCircle size={14} />
                <span>{quizError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage 2.4: Shadow Silhouette Match with beach bag packing styling */}
      {subStage === 4 && (
        <div className="shadow-game-wrapper fade-in" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h2 className="section-title">סידור תיק חוף לקפריסין 🏖️</h2>
          <p className="section-description">
            המזוודה מוכנה! כעת סדרי את תיק החוף שלך. התאימי בין כל פריט מימין לצללית שלו משמאל.
          </p>

          <div className="scanner-panel beach-bag-panel" style={{ padding: '1.5rem', width: '100%', maxWidth: '360px', boxSizing: 'border-box' }}>
            <div className="scan-radar-grid beach-sand-grid"></div>
            <div className="scan-beam sun-beam"></div>

            <div style={{ display: 'flex', gap: '1.5rem', width: '100%', justifyContent: 'center', position: 'relative', zIndex: '1' }}>
              {/* Left Column: Silhouettes */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: '1' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-navy)', textAlign: 'center' }}>צלליות פריטים</span>
                {shuffledSilhouettes.map((item) => {
                  const isMatched = matchedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSilhouetteSelect(item)}
                      className={`xray-item ${isMatched ? 'matched' : ''}`}
                      style={{
                        padding: '0.6rem',
                        background: isMatched ? 'rgba(13, 148, 136, 0.12)' : 'rgba(255, 255, 255, 0.75)',
                        border: isMatched ? '2px solid var(--color-success)' : '1px solid rgba(2, 132, 199, 0.2)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '46px',
                        cursor: isMatched ? 'default' : (selectedEmoji ? 'pointer' : 'default'),
                        transition: 'all 0.2s ease',
                        fontSize: '1.8rem',
                        boxShadow: isMatched ? '0 0 10px rgba(16,185,129,0.2)' : 'none'
                      }}
                    >
                      <span
                        style={{
                          filter: isMatched ? 'none' : 'grayscale(0.3) opacity(0.25)',
                          opacity: 1
                        }}
                      >
                        {item.emoji}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Colored items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: '1' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--color-navy)', textAlign: 'center' }}>פריטי הלבוש</span>
                {SHADOW_ITEMS.map((item) => {
                  const isSelected = selectedEmoji?.id === item.id;
                  const isMatched = matchedIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleEmojiSelect(item)}
                      className={`xray-item ${isMatched ? 'matched' : ''}`}
                      style={{
                        padding: '0.6rem',
                        background: isMatched
                          ? 'rgba(13, 148, 136, 0.08)'
                          : (isSelected ? 'rgba(2, 132, 199, 0.08)' : 'rgba(255, 255, 255, 0.8)'),
                        border: isMatched
                          ? '1.5px solid rgba(13, 148, 136, 0.3)'
                          : (isSelected ? '2px solid var(--color-sky)' : '1px solid rgba(2, 132, 199, 0.15)'),
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        minHeight: '46px',
                        cursor: isMatched ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '1.2rem',
                        boxShadow: isSelected ? '0 0 10px rgba(251,113,133,0.3)' : 'none'
                      }}
                    >
                      <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-navy)', fontWeight: '800' }}>
                        {item.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {matchedIds.length > 0 && (
            <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--color-success)', marginTop: '0.75rem' }}>
              התאמת התיק הושלמה: {matchedIds.length} / {SHADOW_ITEMS.length} 🏖️
            </div>
          )}
        </div>
      )}

      {/* Stage 2.5: Completed view with secret Passport reveal */}
      {subStage === 5 && (
        <div className="success-container fade-in">
          <div className="success-badge green-glow">
            <span>המזוודה מוכנה ומאובטחת! 🎒✨</span>
          </div>
          <h2 className="success-title">נחשפה משימה סודית ✈️</h2>

          <div className="mission-card" style={{ borderColor: 'var(--color-coral)', background: 'rgba(255, 126, 103, 0.05)', margin: '1rem 0' }}>
            <span className="mission-badge">המשימה השנייה שלך:</span>
            <p className="mission-instruction">
              להכין את המזוודה והדרכון שלך! 🧳✈️
            </p>
          </div>

          <p className="success-text font-semibold" style={{ marginTop: '0.5rem' }}>
            המזוודה מוכנה והיעד עדיין מסווג.
          </p>
          <p className="next-day-notice">נתראה מחר. 🌅</p>
        </div>
      )}
    </div>
  );
}
