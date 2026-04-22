import { useState } from 'react';
import StudyTimer from './StudyTimer';
import { useTimer } from '../hooks/useTimer';
import './TopBar.css';

export default function TopBar() {
  const [showTimer, setShowTimer] = useState(false);
  const timerProps = useTimer();

  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <div className="tb-left"></div>
        <div className="tb-right">
          <div className="timer-trigger-container">
            <button 
              className={`timer-trigger ${timerProps.isActive ? 'active' : ''}`}
              onClick={() => setShowTimer(!showTimer)}
            >
              <span className="tt-icon">⏱️</span>
              <span className="tt-time">{timerProps.displayMins}m</span>
            </button>

            {showTimer && (
              <StudyTimer 
                timerProps={timerProps} 
                onClose={() => setShowTimer(false)} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
