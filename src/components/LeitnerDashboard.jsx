import { useState } from 'react';
import { useFlashcards } from '../context/FlashcardContext';
import StudyModal from './StudyModal';
import './LeitnerDashboard.css';

const BOX_CONFIG = [
  {
    id: 1,
    title: 'Learning',
    emoji: '📖',
    description: 'New cards to study',
    colorClass: 'box-orange',
  },
  {
    id: 2,
    title: 'Reviewing',
    emoji: '🔄',
    description: 'Getting better at these',
    colorClass: 'box-violet',
  },
  {
    id: 3,
    title: 'Mastered',
    emoji: '⭐',
    description: 'You know these well!',
    colorClass: 'box-emerald',
  },
];

export default function LeitnerDashboard({ onOpenIngestion }) {
  const { box1Cards, box2Cards, box3Cards, totalCards } = useFlashcards();
  const [studyBox, setStudyBox] = useState(null);

  const getBoxCards = (boxId) => {
    if (boxId === 1) return box1Cards;
    if (boxId === 2) return box2Cards;
    return box3Cards;
  };

  if (totalCards === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎴</div>
        <h2 className="empty-title">No flashcards yet</h2>
        <p className="empty-desc">
          Paste study material and let AI generate flashcards, or create them manually.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onOpenIngestion}>
          ＋ Create Your First Cards
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="leitner-dashboard">
        <div className="leitner-header">
          <h2 className="leitner-title">Leitner System</h2>
          <p className="leitner-desc">Click a box to start studying its cards</p>
        </div>

        <div className="leitner-boxes">
          {BOX_CONFIG.map((box) => {
            const cards = getBoxCards(box.id);
            const hasCards = cards.length > 0;
            return (
              <button
                key={box.id}
                id={`leitner-box-${box.id}`}
                className={`leitner-box ${box.colorClass} ${hasCards ? 'has-cards' : 'empty'}`}
                onClick={() => hasCards && setStudyBox(box.id)}
                disabled={!hasCards}
              >
                <div className="box-glow" />
                <div className="box-header">
                  <span className="box-emoji">{box.emoji}</span>
                  <span className="box-badge">{cards.length}</span>
                </div>
                <h3 className="box-title">Box {box.id}</h3>
                <p className="box-name">{box.title}</p>
                <p className="box-desc">{box.description}</p>

                {hasCards && (
                  <div className="box-card-stack">
                    {cards.slice(0, 3).map((card, i) => (
                      <div
                        key={card.id}
                        className="mini-card"
                        style={{
                          transform: `translateY(${i * -4}px) scale(${1 - i * 0.03})`,
                          opacity: 1 - i * 0.2,
                          zIndex: 3 - i,
                        }}
                      >
                        <span className="mini-card-text">{card.question}</span>
                      </div>
                    ))}
                  </div>
                )}

                {hasCards && (
                  <div className="box-cta">
                    Study Now →
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {studyBox && (
        <StudyModal
          boxId={studyBox}
          cards={getBoxCards(studyBox)}
          onClose={() => setStudyBox(null)}
        />
      )}
    </>
  );
}
