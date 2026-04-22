import { useFlashcards } from '../context/FlashcardContext';
import './Sidebar.css';

export default function Sidebar({ activeView, onNavigate, onAddCards }) {
  const { state } = useFlashcards();
  const totalCards = state.studySets.reduce((sum, set) => sum + (set.cards?.length || 0), 0);

  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Home' },
    { id: 'workspace', icon: '📚', label: 'My Sets', tooltip: 'View all your study sets' },
    { id: 'calendar', icon: '📅', label: 'Calendar' },
    { id: 'miniapps', icon: '🧩', label: 'Mini Apps' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo">⚡</div>
        <div>
          <div className="sidebar-title">Cuemath</div>
          <div className="sidebar-sub">Flashcards</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-link ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
            title={item.tooltip || ''}
          >
            <span className="sl-icon">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button className="btn btn-primary sidebar-add-btn" onClick={onAddCards}>
          ＋ Add Cards
        </button>
        <div className="sidebar-stat">
          {totalCards} cards total
        </div>
      </div>
    </aside>
  );
}
