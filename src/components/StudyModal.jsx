import { useState, useCallback, useEffect } from 'react';
import { useFlashcards } from '../context/FlashcardContext';
import FlashCard from './FlashCard';
import './StudyModal.css';

export default function StudyModal({ boxId, cards, title, setId, onClose }) {
  const { dispatch } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animClass, setAnimClass] = useState('');
  const [sessionStats, setSessionStats] = useState({ mastered: 0, reviewing: 0, learning: 0 });
  const [completed, setCompleted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  const boxNames = { 1: 'Learning', 2: 'Reviewing', 3: 'Mastered' };
  const currentCard = cards[currentIndex];

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

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

  const handleConfidence = (targetBox) => {
    if (animating) return;
    setAnimating(true);

    if (targetBox === 1) {
      setAnimClass('slide-out-left');
      setSessionStats((s) => ({ ...s, learning: s.learning + 1 }));
    } else if (targetBox === 2) {
      setAnimClass('slide-out-right');
      setSessionStats((s) => ({ ...s, reviewing: s.reviewing + 1 }));
    } else {
      setAnimClass('slide-out-right');
      setSessionStats((s) => ({ ...s, mastered: s.mastered + 1 }));
    }

    dispatch({ type: 'MOVE_CARD', payload: { setId, cardId: currentCard.id, targetBox } });

    setTimeout(() => {
      setAnimClass('');
      setAnimating(false);
      advance();
    }, 350);
  };

  if (completed) {
    const total = sessionStats.mastered + sessionStats.reviewing + sessionStats.learning;
    const confidenceScore = total > 0
      ? Math.round(((sessionStats.mastered * 3 + sessionStats.reviewing * 2 + sessionStats.learning * 1) / (total * 3)) * 100)
      : 0;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="study-modal-content session-complete" onClick={(e) => e.stopPropagation()}>
          <div className="complete-icon">🎉</div>
          <h2 className="complete-title">Session Complete!</h2>
          <p className="complete-subtitle">Here's how you did:</p>
          <div className="session-stats three-stats">
            <div className="stat-item stat-danger">
              <span className="stat-value">{sessionStats.learning}</span>
              <span className="stat-label">❓ Learning</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item stat-warning">
              <span className="stat-value">{sessionStats.reviewing}</span>
              <span className="stat-label">👍 Reviewing</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item stat-success">
              <span className="stat-value">{sessionStats.mastered}</span>
              <span className="stat-label">🔥 Mastered</span>
            </div>
          </div>
          <div className="session-accuracy">
            <span>Confidence Score</span>
            <strong className="gradient-text-emerald">{confidenceScore}%</strong>
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
            <h2 className="study-title">{title || (boxId > 0 ? `Box ${boxId}: ${boxNames[boxId]}` : 'Study Session')}</h2>
            <p className="study-counter">Card {currentIndex + 1} of {cards.length}</p>
          </div>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <div className="study-progress-track">
          <div className="study-progress-fill" style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }} />
        </div>
        
        <div className={`study-card-area ${animClass}`}>
          <FlashCard 
            key={currentCard.id} 
            card={currentCard} 
            isFlipped={isFlipped}
            onFlip={setIsFlipped}
          />
        </div>

        {isFlipped && (
          <div className="study-actions-fixed">
            <button
              className="conf-btn conf-low"
              onClick={() => handleConfidence(1)}
            >
              <span className="conf-icon">❓</span>
              <span className="conf-label">Not Very Confident</span>
            </button>
            <button
              className="conf-btn conf-mid"
              onClick={() => handleConfidence(2)}
            >
              <span className="conf-icon">👍</span>
              <span className="conf-label">Somewhat Confident</span>
            </button>
            <button
              className="conf-btn conf-high"
              onClick={() => handleConfidence(3)}
            >
              <span className="conf-icon">🔥</span>
              <span className="conf-label">Very Confident</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
