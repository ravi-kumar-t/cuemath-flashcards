import { useState } from 'react';
import { useFlashcards } from '../context/FlashcardContext';
import StudyModal from './StudyModal';
import './LeitnerDashboard.css';

const BOX_CONFIG = [
  { id: 1, title: 'Learning', emoji: '📖', description: 'New cards to study', colorClass: 'box-orange' },
  { id: 2, title: 'Reviewing', emoji: '🔄', description: 'Getting better at these', colorClass: 'box-emerald' },
  { id: 3, title: 'Mastered', emoji: '⭐', description: 'You know these well!', colorClass: 'box-violet' },
];

export default function LeitnerSystemView({ studySet, onOpenIngestion }) {
  const [studyBox, setStudyBox] = useState(null);
  const cards = studySet?.cards || [];
  const totalCards = cards.length;

  const getBoxCards = (boxId) => cards.filter(c => c.box === boxId);

  if (totalCards === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🎴</div>
        <h2 className="empty-title">No flashcards yet</h2>
        <p className="empty-desc">Upload material to generate cards.</p>
        <button className="btn btn-primary btn-lg" onClick={onOpenIngestion}>＋ Create Cards</button>
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
            const boxCards = getBoxCards(box.id);
            const hasCards = boxCards.length > 0;
            return (
              <button
                key={box.id}
                className={`leitner-box ${box.colorClass} ${hasCards ? 'has-cards' : 'empty'}`}
                onClick={() => hasCards && setStudyBox(box.id)}
                disabled={!hasCards}
              >
                <div className="box-glow" />
                <div className="box-header">
                  <span className="box-emoji">{box.emoji}</span>
                  <span className="box-badge">{boxCards.length}</span>
                </div>
                <h3 className="box-title">Box {box.id}</h3>
                <p className="box-name">{box.title}</p>
                <p className="box-desc">{box.description}</p>
              </button>
            );
          })}
        </div>
      </div>
      {studyBox && (
        <StudyModal
          boxId={studyBox}
          cards={getBoxCards(studyBox)}
          setId={studySet.id}
          onClose={() => setStudyBox(null)}
        />
      )}
    </>
  );
}
