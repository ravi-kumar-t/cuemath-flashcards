import { useState } from 'react';
import './StudyTimer.css';

export default function StudyTimer({ timerProps, onClose }) {
  const { timeLeft, totalTime, isActive, toggleTimer, resetTimer, formatTime } = timerProps;

  return (
    <div className="timer-popover animate-scale-in">
      <div className="timer-popover-header">
        <h3 className="tp-title">Study Timer</h3>
        <div className="tp-header-actions">
          <button className="tp-icon-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></button>
          <button className="tp-icon-btn" onClick={onClose}>✕</button>
        </div>
      </div>

      <div className="timer-display-section">
        <div className="tp-clock">{formatTime(timeLeft)}</div>
        <div className="tp-mode">FOCUS</div>
      </div>

      <div className="timer-presets">
        {[10, 25, 50].map(mins => (
          <button 
            key={mins}
            className={`tp-preset-btn ${totalTime === mins * 60 ? 'active' : ''}`}
            onClick={() => resetTimer(mins * 60)}
          >
            {mins}m
          </button>
        ))}
      </div>

      <button 
        className={`tp-primary-btn ${isActive ? 'pause' : 'start'}`}
        onClick={toggleTimer}
      >
        {isActive ? 'Pause Timer' : 'Start Timer'}
      </button>
    </div>
  );
}
