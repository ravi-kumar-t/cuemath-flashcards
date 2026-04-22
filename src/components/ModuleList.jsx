import './ModuleList.css';

export default function ModuleList({ modules, onStudyModule }) {
  if (modules.length === 0) {
    return (
      <div className="modules-empty-minimalist">
        <p>No modules yet. Upload a PDF to get started.</p>
      </div>
    );
  }

  return (
    <div className="module-rows-minimalist">
      {modules.map((mod) => {
        const total = mod.cards.length;
        const mastered = mod.box3;
        const progress = total > 0 ? Math.round((mastered / total) * 100) : 0;

        return (
          <div key={mod.name} className="module-progress-row" onClick={() => onStudyModule(mod)}>
            <div className="mpr-info">
              <span className="mpr-name">{mod.name}</span>
              <span className="mpr-count">{total} cards</span>
            </div>
            
            <div className="mpr-progress-container">
              <div className="mpr-progress-track">
                <div className="mpr-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="mpr-progress-text">{progress}%</span>
            </div>

            <button className="mpr-dive-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
