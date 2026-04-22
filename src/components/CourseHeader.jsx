import { useFlashcards } from '../context/FlashcardContext';
import './CourseHeader.css';

export default function CourseHeader() {
  const { state, masteryPercent, totalCards, box3Cards } = useFlashcards();

  return (
    <div className="course-header">
      <div className="ch-info">
        <h1 className="ch-title">{state.deckName || 'My Flashcards'}</h1>
        {totalCards > 0 && (
          <p className="ch-subtitle">{totalCards} cards · {box3Cards.length} mastered</p>
        )}
      </div>
      {totalCards > 0 && (
        <div className="ch-progress">
          <div className="ch-progress-row">
            <span className="ch-progress-label">Mastery Progress</span>
            <span className="ch-progress-pct">{masteryPercent}% complete</span>
          </div>
          <div className="ch-track">
            <div className="ch-fill" style={{ width: `${masteryPercent}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
