import { useState } from 'react';
import { useFlashcards } from '../context/FlashcardContext';
import { testApiKey } from '../services/gemini';
import './ApiKeyModal.css';

export default function ApiKeyModal({ onClose }) {
  const { state, dispatch } = useFlashcards();
  const [key, setKey] = useState(state.apiKey);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    dispatch({ type: 'SET_API_KEY', payload: key.trim() });
    onClose();
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const ok = await testApiKey(key.trim());
    setTestResult(ok ? 'success' : 'fail');
    setTesting(false);
  };

  const maskKey = (k) => {
    if (k.length <= 8) return '•'.repeat(k.length);
    return k.slice(0, 4) + '•'.repeat(k.length - 8) + k.slice(-4);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content apikey-modal" onClick={(e) => e.stopPropagation()}>
        <div className="apikey-header">
          <h2>⚙️ Settings</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="apikey-body">
          <div className="apikey-section">
            <label className="apikey-label">Gemini API Key</label>
            <p className="apikey-desc">
              Required for AI flashcard generation. Get one free at{' '}
              <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="apikey-link">
                Google AI Studio →
              </a>
            </p>
            <div className="apikey-input-row">
              <input
                id="api-key-input"
                type="password"
                className="apikey-input"
                placeholder="Paste your API key here…"
                value={key}
                onChange={(e) => { setKey(e.target.value); setTestResult(null); }}
              />
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleTest}
                disabled={!key.trim() || testing}
              >
                {testing ? '…' : 'Test'}
              </button>
            </div>
            {testResult === 'success' && (
              <p className="test-result test-success">✓ API key is valid!</p>
            )}
            {testResult === 'fail' && (
              <p className="test-result test-fail">✗ Invalid API key. Please check and try again.</p>
            )}
          </div>

          <div className="apikey-section">
            <label className="apikey-label">Danger Zone</label>
            <div className="danger-actions">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  dispatch({ type: 'RESET_PROGRESS' });
                  onClose();
                }}
              >
                🔄 Reset Progress
              </button>
              <button
                className="btn btn-ghost btn-sm danger-btn"
                onClick={() => {
                  if (confirm('Delete ALL cards? This cannot be undone.')) {
                    dispatch({ type: 'RESET_ALL' });
                    onClose();
                  }
                }}
              >
                🗑 Delete All Cards
              </button>
            </div>
          </div>
        </div>

        <div className="apikey-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
