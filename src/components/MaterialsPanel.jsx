import './MaterialsPanel.css';

export default function MaterialsPanel({ materials = [], totalCards = 0 }) {
  return (
    <div className="materials-panel">
      <h3 className="mp-title">📎 Materials</h3>
      {materials.length === 0 ? (
        <p className="mp-empty">No materials uploaded yet. Upload a PDF to generate flashcards.</p>
      ) : (
        <div className="mp-list">
          {materials.map((mat) => (
            <div key={mat.id} className="mp-item">
              <div className="mp-icon">📄</div>
              <div className="mp-info">
                <span className="mp-name">{mat.name}</span>
                <span className="mp-date">
                  {new Date(mat.uploadedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                  {mat.cardCount > 0 && ` · ${mat.cardCount} cards`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mp-section">
        <h4 className="mp-section-title">Quick Stats</h4>
        <div className="mp-stat-row">
          <span>Total Materials</span>
          <strong>{materials.length}</strong>
        </div>
        <div className="mp-stat-row">
          <span>Total Cards</span>
          <strong>{totalCards}</strong>
        </div>
      </div>
    </div>
  );
}
