import { useFlashcards } from '../context/FlashcardContext';
import './Header.css';

export default function Header({ onOpenIngestion }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-brand">
          <div className="header-logo">
            <span className="logo-icon">⚡</span>
          </div>
          <div>
            <h1 className="header-title">
              <span className="gradient-text">Cuemath</span> Flashcards
            </h1>
            <p className="header-subtitle">Learn smarter with spaced repetition</p>
          </div>
        </div>

        <div className="header-actions">
          <button
            id="add-cards-btn"
            className="btn btn-primary"
            onClick={onOpenIngestion}
          >
            <span className="btn-icon">＋</span>
            Add Cards
          </button>
        </div>
      </div>
    </header>
  );
}
