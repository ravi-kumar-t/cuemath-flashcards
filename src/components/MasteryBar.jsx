import { useFlashcards } from '../context/FlashcardContext';
import './MasteryBar.css';

export default function MasteryBar() {
  const { masteryPercent, totalCards, box3Cards } = useFlashcards();

  if (totalCards === 0) return null;

  const getMessage = () => {
    if (masteryPercent === 100) return "🏆 You've mastered everything! Amazing!";
    if (masteryPercent >= 75) return "🔥 You're on fire! Almost there!";
    if (masteryPercent >= 50) return "💪 Great progress! Keep pushing!";
    if (masteryPercent >= 25) return "🌱 Growing stronger! Keep going!";
    return "🚀 Let's start mastering these cards!";
  };

  return (
    <div className="mastery-bar-wrapper">
      <div className="mastery-bar-container">
        <div className="mastery-info">
          <div className="mastery-label">
            <span className="mastery-title">Mastery Progress</span>
            <span className="mastery-count">{box3Cards.length} of {totalCards} cards mastered</span>
          </div>
          <span className="mastery-percent">{masteryPercent}%</span>
        </div>
        <div className="mastery-track">
          <div
            className="mastery-fill"
            style={{ width: `${masteryPercent}%` }}
          >
            {masteryPercent > 5 && <div className="mastery-glow" />}
          </div>
        </div>
        <p className="mastery-message">{getMessage()}</p>
      </div>
    </div>
  );
}
