import { useState } from 'react';
import './CreateSetModal.css';

export default function CreateSetModal({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim(), desc.trim());
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content csm-modal" onClick={e => e.stopPropagation()}>
        <div className="csm-header">
          <h2>Create Study Set</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="csm-body">
          <div className="csm-field">
            <label className="csm-label">Set Name</label>
            <input
              className="csm-input"
              placeholder="e.g. Git Commands, Physics Ch.5…"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="csm-field">
            <label className="csm-label">Description <span className="optional">(optional)</span></label>
            <textarea
              className="csm-input"
              placeholder="What will you study in this set?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-lg csm-submit"
            disabled={!name.trim()}
          >
            ✨ Create Set
          </button>
        </form>
      </div>
    </div>
  );
}
