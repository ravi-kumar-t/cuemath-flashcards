import { useEffect, useState } from 'react';
import './UploadProcessingModal.css';

export default function UploadProcessingModal({ status, progress, error, onClose, onConfirm }) {
  // status: 'extracting', 'generating', 'complete', 'error'
  
  return (
    <div className="modal-overlay">
      <div className="modal-content upm-modal" onClick={e => e.stopPropagation()}>
        <div className="upm-header">
          <h2>Processing Material</h2>
          {error && <button className="close-btn" onClick={onClose}>✕</button>}
        </div>
        
        <div className="upm-body">
          {error ? (
            <div className="upm-error">
              <span className="upm-error-icon">⚠</span>
              <p>{error}</p>
              <button className="btn btn-ghost mt-4" onClick={onClose}>Close</button>
            </div>
          ) : status === 'complete' ? (
            <div className="upm-success">
              <div className="upm-success-icon">🎉</div>
              <h3>Flashcards Generated!</h3>
              <p>Your study material has been processed successfully.</p>
              <button className="btn btn-success btn-lg mt-4" onClick={onConfirm}>
                Review Flashcards
              </button>
            </div>
          ) : (
            <div className="upm-progress-container">
              <div className="upm-status-text">
                {status === 'extracting' && 'Extracting text from PDF...'}
                {status === 'generating' && 'AI is generating flashcards...'}
              </div>
              <div className="upm-progress-bar">
                <div className="upm-progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="upm-progress-pct">{progress}%</div>
              <p className="upm-hint">This may take a minute depending on the size of the material.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
