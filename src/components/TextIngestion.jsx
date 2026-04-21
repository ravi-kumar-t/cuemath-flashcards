import { useState } from 'react';
import { useFlashcards } from '../context/FlashcardContext';
import { generateFlashcards, isApiKeyConfigured } from '../services/gemini';
import './TextIngestion.css';

export default function TextIngestion({ onClose }) {
  const { dispatch } = useFlashcards();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [mode, setMode] = useState(isApiKeyConfigured() ? 'ai' : 'manual');

  // Manual card form
  const [manualQ, setManualQ] = useState('');
  const [manualA, setManualA] = useState('');
  const [manualCat, setManualCat] = useState('');

  const handleGenerate = async () => {
    setError('');
    setLoading(true);
    try {
      const cards = await generateFlashcards(text);
      setPreview(cards);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPreview = () => {
    dispatch({ type: 'ADD_CARDS', payload: preview });
    setPreview(null);
    setText('');
    onClose();
  };

  const handleAddManual = () => {
    if (!manualQ.trim() || !manualA.trim()) {
      setError('Please fill in both question and answer.');
      return;
    }
    dispatch({
      type: 'ADD_CARDS',
      payload: [
        {
          question: manualQ.trim(),
          answer: manualA.trim(),
          concept_category: manualCat.trim() || 'General',
        },
      ],
    });
    setManualQ('');
    setManualA('');
    setManualCat('');
    setError('');
  };

  // Preview screen
  if (preview) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content ingestion-modal" onClick={(e) => e.stopPropagation()}>
          <div className="ingestion-header">
            <h2>Preview Generated Cards</h2>
            <p className="ingestion-subtitle">{preview.length} cards ready to add</p>
          </div>
          <div className="preview-list">
            {preview.map((card, i) => (
              <div key={i} className="preview-card" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="preview-card-header">
                  <span className="preview-num">#{i + 1}</span>
                  <span className="badge badge-category">{card.concept_category}</span>
                </div>
                <p className="preview-q"><strong>Q:</strong> {card.question}</p>
                <p className="preview-a"><strong>A:</strong> {card.answer}</p>
              </div>
            ))}
          </div>
          <div className="ingestion-actions">
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>
              ← Back
            </button>
            <button className="btn btn-success btn-lg" onClick={handleConfirmPreview}>
              ✓ Add {preview.length} Cards
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ingestion-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ingestion-header">
          <h2>Add New Flashcards</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Mode Tabs */}
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'ai' ? 'active' : ''}`}
            onClick={() => { setMode('ai'); setError(''); }}
          >
            🤖 AI Generate
          </button>
          <button
            className={`mode-tab ${mode === 'manual' ? 'active' : ''}`}
            onClick={() => { setMode('manual'); setError(''); }}
          >
            ✏️ Manual
          </button>
        </div>

        {error && (
          <div className="ingestion-error">
            <span>⚠</span> {error}
          </div>
        )}

        {mode === 'ai' ? (
          <div className="ingestion-body">
            <label className="ingestion-label">Paste your study material below</label>
            <textarea
              id="study-text-input"
              className="ingestion-textarea"
              placeholder="Paste any text — notes, textbook passages, articles…&#10;&#10;The AI teacher will generate high-quality flashcards from this content."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
            />
            <div className="char-count">{text.length} characters</div>

            <button
              id="generate-btn"
              className="btn btn-primary btn-lg generate-btn"
              onClick={handleGenerate}
              disabled={loading || text.trim().length < 20}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Generating…
                </>
              ) : (
                <>✨ Generate Flashcards</>
              )}
            </button>

            {!isApiKeyConfigured() && (
              <p className="api-hint">
                💡 Set <code>VITE_GEMINI_API_KEY</code> in your <strong>.env</strong> file to enable AI generation.
              </p>
            )}
          </div>
        ) : (
          <div className="ingestion-body">
            <div className="manual-field">
              <label className="ingestion-label">Question</label>
              <textarea
                id="manual-question"
                className="ingestion-input"
                placeholder="e.g. What is the Pythagorean theorem?"
                value={manualQ}
                onChange={(e) => setManualQ(e.target.value)}
                rows={2}
              />
            </div>
            <div className="manual-field">
              <label className="ingestion-label">Answer</label>
              <textarea
                id="manual-answer"
                className="ingestion-input"
                placeholder="e.g. a² + b² = c² for right triangles"
                value={manualA}
                onChange={(e) => setManualA(e.target.value)}
                rows={2}
              />
            </div>
            <div className="manual-field">
              <label className="ingestion-label">Category <span className="optional">(optional)</span></label>
              <input
                id="manual-category"
                className="ingestion-input"
                placeholder="e.g. Geometry"
                value={manualCat}
                onChange={(e) => setManualCat(e.target.value)}
              />
            </div>
            <button
              id="add-manual-btn"
              className="btn btn-primary btn-lg generate-btn"
              onClick={handleAddManual}
            >
              ＋ Add Card
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
