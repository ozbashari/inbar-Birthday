import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { playChime, playClick } from '../utils/audio';

const ENVELOPE_CONTENT = {
  1: {
    title: "לענבר אהובתי 💌",
    text: "ברוכה הבאה לשבוע יום ההולדת הסודי שלך! הכנתי לך מסע קצר ואינטראקטיבי שיכין אותך לחשיפה הגדולה. בכל יום תצטרכי לפצח משימה קטנה כדי להתקדם...",
    btnText: "בואי נתחיל! 🔑"
  },
  2: {
    title: "משימת אריזה 🧳",
    text: "הגיע הזמן להתארגן! היום נבדוק שאת יודעת מה לארוז איתך לחופשה. הכנתי לך רשימה מדויקת ומשחקים קצרים כדי לוודא ששום דבר לא יישאר מאחור...",
    btnText: "בואי נארוז! 🧳"
  },
  3: {
    title: "בניית האווירה 🎧",
    text: "המוזיקה היא הנשמה של הטיול! היום ניכנס לאווירה קייצית וים-תיכונית מושלמת עם משחק זיכרון מהיר וחידון על הזיכרונות המוזיקליים שלנו...",
    btnText: "ניכנס לקצב! 🎧"
  },
  4: {
    title: "הכספת והחשיפה הגדולה ✈️",
    text: "זהו זה! הגענו ליום הגדול. כדי לפתוח את הכספת ולגלות את כרטיס הטיסה והיעד הסודי שלך, תצטרכי לענות על מספר שאלות עלינו...",
    btnText: "פתחי את הכספת! 🔓"
  }
};

export default function WaxSealEnvelope({ day = 1, onOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const content = ENVELOPE_CONTENT[day] || ENVELOPE_CONTENT[1];

  const handleSealClick = (e) => {
    e.stopPropagation();
    if (isOpen) return;
    setIsOpen(true);
    playChime();
    
    // Delay revealing the action button slightly to match paper flip animation
    setTimeout(() => {
      setIsRevealed(true);
    }, 1200);
  };

  const handleStart = () => {
    playClick();
    onOpen();
  };

  return (
    <div className="envelope-overlay" dir="rtl">
      {/* Hint text */}
      {!isOpen && (
        <p className="envelope-hint">לחצי על החותמת כדי לפתוח 💌</p>
      )}

      <div className="envelope-wrapper">
        <div className={`envelope ${isOpen ? 'open' : ''}`} onClick={handleSealClick}>
          {/* Opaque back wall — keeps letter hidden before opening */}
          <div className="envelope-back"></div>

          {/* Envelope Pocket Back */}
          <div className="envelope-pocket"></div>
          <div className="envelope-pocket-left"></div>
          <div className="envelope-pocket-right"></div>
          
          {/* Front Flap */}
          <div className="envelope-front-flap"></div>
 
          {/* Wax Seal */}
          <div className="wax-seal" onClick={handleSealClick}>
            <Heart size={18} fill="#fff" className="wax-seal-heart" />
          </div>

          {/* Letter Inside */}
          <div className="envelope-letter">
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#db2777', margin: '0 0 0.5rem 0', textAlign: 'center' }}>
              {content.title}
            </h3>
            <p style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#1e3a8a', fontWeight: '700', margin: '0', textAlign: 'center' }}>
              {content.text}
            </p>
            {isRevealed && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.85rem' }}>
                <button
                  onClick={handleStart}
                  className="action-btn fade-in"
                  style={{
                    padding: '0.45rem 1.25rem',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    maxWidth: '120px'
                  }}
                >
                  {content.btnText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
