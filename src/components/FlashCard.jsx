import { useState, useEffect } from 'react';
import './FlashCard.css';

export default function FlashCard({ card, onFlip, isFlipped: externalFlipped }) {
  const [flipped, setFlipped] = useState(false);

  // Sync with external state if provided
  useEffect(() => {
    if (externalFlipped !== undefined) {
      setFlipped(externalFlipped);
    }
  }, [externalFlipped]);

  const handleFlip = () => {
    const nextFlipped = !flipped;
    setFlipped(nextFlipped);
    onFlip?.(nextFlipped);
  };

  return (
    <div className="flashcard-wrapper">
      <div
        className={`flashcard ${flipped ? 'flipped' : ''}`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === ' ' && handleFlip()}
      >
        {/* Front - Question */}
        <div className="flashcard-face flashcard-front">
          <div className="card-category-badge">
            {card.concept_category}
          </div>
          <div className="card-content">
            <span className="card-label">Question</span>
            <p className="card-text">{card.question}</p>
          </div>
          <div className="card-hint">
            <span>Tap to reveal answer</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
          </div>
        </div>

        {/* Back - Answer */}
        <div className="flashcard-face flashcard-back">
          <div className="card-category-badge">
            {card.concept_category}
          </div>
          <div className="card-content">
            <span className="card-label">Answer</span>
            <p className="card-text">{card.answer}</p>
          </div>
          <div className="card-hint">
            <span>Tap to see question</span>
          </div>
        </div>
      </div>
    </div>
  );
}
