import { useState, useEffect, useCallback } from 'react';

export function useTimer(defaultTime = 25 * 60) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('studyTimer_timeLeft');
    return saved !== null ? parseInt(saved, 10) : defaultTime;
  });
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(() => {
    const saved = localStorage.getItem('studyTimer_totalTime');
    return saved !== null ? parseInt(saved, 10) : defaultTime;
  });

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const next = prev - 1;
          localStorage.setItem('studyTimer_timeLeft', next.toString());
          return next;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const resetTimer = useCallback((newTime) => {
    const time = newTime || totalTime;
    setIsActive(false);
    setTimeLeft(time);
    if (newTime) {
      setTotalTime(newTime);
      localStorage.setItem('studyTimer_totalTime', newTime.toString());
    }
    localStorage.setItem('studyTimer_timeLeft', time.toString());
  }, [totalTime]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    totalTime,
    isActive,
    toggleTimer,
    resetTimer,
    formatTime,
    displayMins: Math.ceil(timeLeft / 60)
  };
}
