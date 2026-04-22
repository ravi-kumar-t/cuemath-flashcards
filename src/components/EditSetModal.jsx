import { useState } from 'react';
import './EditSetModal.css';

export default function EditSetModal({ studySet, onClose, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState(studySet.name);
  const [description, setDescription] = useState(studySet.description || '');
  const [visibility, setVisibility] = useState(studySet.visibility || 'public');

  const handleSave = () => {
    onUpdate({
      name,
      description,
      visibility,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="edit-set-modal" onClick={(e) => e.stopPropagation()}>
        <div className="esm-header">
          <h2 className="esm-title">Edit Study Set</h2>
          <button className="esm-close" onClick={onClose}>✕</button>
        </div>

        <div className="esm-tabs">
          <button 
            className={`esm-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`esm-tab ${activeTab === 'theme' ? 'active' : ''}`}
            onClick={() => setActiveTab('theme')}
          >
            Theme
          </button>
        </div>

        <div className="esm-body">
          {activeTab === 'general' ? (
            <div className="esm-content animate-fade-in">
              <div className="esm-field">
                <label className="esm-label">Study Set Picture</label>
                <div className="esm-thumbnail-edit">
                  <div className="esm-thumbnail-preview">
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <button className="btn btn-secondary btn-sm">Upload Picture</button>
                </div>
              </div>

              <div className="esm-field">
                <label className="esm-label">Study Set Name</label>
                <input 
                  type="text" 
                  className="esm-input" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="esm-field">
                <label className="esm-label">Study Set Description</label>
                <textarea 
                  className="esm-textarea" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this set about?"
                />
              </div>

              <div className="esm-field">
                <label className="esm-label">Visibility</label>
                <div className="esm-visibility-grid">
                  <div 
                    className={`esm-vis-card ${visibility === 'private' ? 'selected' : ''}`}
                    onClick={() => setVisibility('private')}
                  >
                    <div className="vis-icon">🔒</div>
                    <div className="vis-info">
                      <span className="vis-title">Private</span>
                      <span className="vis-desc">Only you can see this set</span>
                    </div>
                  </div>
                  <div 
                    className={`esm-vis-card ${visibility === 'public' ? 'selected' : ''}`}
                    onClick={() => setVisibility('public')}
                  >
                    <div className="vis-icon">🌐</div>
                    <div className="vis-info">
                      <span className="vis-title">Public</span>
                      <span className="vis-desc">Visible to everyone</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="esm-danger-zone">
                <div className="dz-header">
                  <span className="dz-icon">⚠️</span>
                  <span className="dz-title">Danger Zone</span>
                </div>
                <div className="dz-body">
                  <p className="dz-text">Once you delete a study set, there is no going back. Please be certain.</p>
                  <button className="btn btn-danger" onClick={onDelete}>
                    Delete Study Set
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="esm-content animate-fade-in">
              <p className="esm-placeholder">Theme customization coming soon!</p>
            </div>
          )}
        </div>

        <div className="esm-footer">
          <button className="btn btn-text" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
