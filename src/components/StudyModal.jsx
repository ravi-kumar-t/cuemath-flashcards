import { useState, useCallback } from 'react';
import { useFlashcards } from '../context/FlashcardContext';
import FlashCard from './FlashCard';
import './StudyModal.css';

export default function StudyModal({ boxId, cards, onClose }) {
  const { dispatch } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animClass, setAnimClass] = useState('');
  const [sessionStats, setSessionStats] = useState({ gotIt: 0, struggling: 0 });
  const [completed, setCompleted] = useState(false);

  const boxNames = { 1: 'Learning', 2: 'Reviewing', 3: 'Mastered' };
  const currentCard = cards[currentIndex];

  // Guard: if deck is empty or index went out of bounds, show completion
  if (!currentCard && !completed) {
    if (!completed) setCompleted(true);
    return null;
  }

  const advance = useCallback(() => {
    if (currentIndex >= cards.length - 1) {
      setCompleted(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, cards.length]);

  const handleGotIt = () => {
    if (animating) return;
    setAnimating(true);
    setAnimClass('slide-out-right');
    setSessionStats((s) => ({ ...s, gotIt: s.gotIt + 1 }));
    const targetBox = Math.min(currentCard.box + 1, 3);
    dispatch({ type: 'MOVE_CARD', payload: { cardId: currentCard.id, targetBox } });
    setTimeout(() => {
      setAnimClass('');
      setAnimating(false);
      advance();
    }, 350);
  };

  const handleStruggling = () => {
    if (animating) return;
    setAnimating(true);
    setAnimClass('slide-out-left');
    setSessionStats((s) => ({ ...s, struggling: s.struggling + 1 }));
    dispatch({ type: 'MOVE_CARD', payload: { cardId: currentCard.id, targetBox: 1 } });
    setTimeout(() => {
      setAnimClass('');
      setAnimating(false);
      advance();
    }, 350);
  };

  if (completed) {
    const total = sessionStats.gotIt + sessionStats.struggling;
    const pct = total > 0 ? Math.round((sessionStats.gotIt / total) * 100) : 0;
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="study-modal-content session-complete" onClick={(e) => e.stopPropagation()}>
          <div className="complete-icon">🎉</div>
          <h2 className="complete-title">Session Complete!</h2>
          <p className="complete-subtitle">Here's how you did:</p>
          <div className="session-stats">
            <div className="stat-item stat-success">
              <span className="stat-value">{sessionStats.gotIt}</span>
              <span className="stat-label">Got it ✓</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item stat-danger">
              <span className="stat-value">{sessionStats.struggling}</span>
              <span className="stat-label">Struggling ✗</span>
            </div>
          </div>
          <div className="session-accuracy">
            <span>Accuracy</span>
            <strong className="gradient-text-emerald">{pct}%</strong>
          </div>
          <button className="btn btn-primary btn-lg" onClick={onClose}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="study-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="study-header">
          <div>
            <h2 className="study-title">Box {boxId}: {boxNames[boxId]}</h2>
            <p className="study-counter">Card {currentIndex + 1} of {cards.length}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="study-progress-track">
          <div className="study-progress-fill" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
        </div>
        <div className={`study-card-area ${animClass}`}>
          <FlashCard key={currentCard.id} card={currentCard} onGotIt={handleGotIt} onStruggling={handleStruggling} />
        </div>
      </div>
    </div>
  );
}
