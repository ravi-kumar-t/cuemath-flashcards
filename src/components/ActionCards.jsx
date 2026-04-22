import './ActionCards.css';

export default function ActionCards({ totalCards, weakCards, onStudyNow, onFlashcards, onReviewWeak }) {

  const cards = [
    {
      id: 'study',
      icon: '▶',
      title: 'Study Now',
      desc: 'Review all cards in a session',
      color: 'action-orange',
      onClick: onStudyNow,
      disabled: totalCards === 0,
    },
    {
      id: 'leitner',
      icon: '📦',
      title: 'Leitner Boxes',
      desc: 'View your 3-box system',
      color: 'action-violet',
      onClick: onFlashcards,
      disabled: totalCards === 0,
    },
    {
      id: 'weak',
      icon: '🔄',
      title: 'Review Weak Areas',
      desc: `${weakCards?.length || 0} cards need practice`,
      color: 'action-rose',
      onClick: onReviewWeak,
      disabled: !weakCards || weakCards.length === 0,
    },
  ];

  return (
    <div className="action-cards">
      {cards.map((card) => (
        <button
          key={card.id}
          className={`action-card ${card.color}`}
          onClick={card.onClick}
          disabled={card.disabled}
        >
          <span className="ac-icon">{card.icon}</span>
          <div className="ac-text">
            <span className="ac-title">{card.title}</span>
            <span className="ac-desc">{card.desc}</span>
          </div>
          <span className="ac-arrow">→</span>
        </button>
      ))}
    </div>
  );
}
