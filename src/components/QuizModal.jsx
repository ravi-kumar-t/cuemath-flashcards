import { useState, useEffect, useCallback } from 'react';
import { useFlashcards } from '../context/FlashcardContext';
import { trackActivity } from '../services/activityTracker';
import './QuizModal.css';

export default function QuizModal({ quizData, title, setId, onClose }) {
  const { dispatch } = useFlashcards();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState([]);
  const [showDemotion, setShowDemotion] = useState(false);

  const currentQuestion = quizData[currentIndex];

  // Timer logic
  useEffect(() => {
    if (completed) return;
    const timer = setInterval(() => {
      setTimeLeft(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [completed]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    } else {
      // Demote to Box 1 if mapped to a flashcard
      if (currentQuestion.originalCardId && setId) {
        dispatch({
          type: 'MOVE_CARD',
          payload: { setId, cardId: currentQuestion.originalCardId, targetBox: 1 }
        });
        setShowDemotion(true);
        setTimeout(() => setShowDemotion(false), 2000);
      }
    }

    setResults(prev => [...prev, {
      question: currentQuestion.question,
      selected: option,
      correct: currentQuestion.correctAnswer,
      isCorrect
    }]);
  };

  const handleNext = () => {
    if (currentIndex >= quizData.length - 1) {
      setCompleted(true);
      trackActivity();
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  };

  if (completed) {
    const percentage = Math.round((score / quizData.length) * 100);
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="quiz-modal-content session-complete" onClick={(e) => e.stopPropagation()}>
          <div className="complete-icon">{percentage >= 70 ? '🏆' : '📚'}</div>
          <h2 className="complete-title">Quiz Complete!</h2>
          <p className="complete-subtitle">Mastery Summary</p>
          
          <div className="quiz-final-stats">
            <div className="qf-stat">
              <span className="qf-label">Final Score</span>
              <span className="qf-value">{percentage}%</span>
            </div>
            <div className="qf-stat">
              <span className="qf-label">Time Taken</span>
              <span className="qf-value">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="quiz-review-list">
            {results.map((res, i) => (
              <div key={i} className={`review-item ${res.isCorrect ? 'correct' : 'incorrect'}`}>
                <span className="ri-icon">{res.isCorrect ? '✓' : '✗'}</span>
                <p className="ri-text">{res.question}</p>
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-lg" onClick={onClose}>
            Review Weak Modules
          </button>
        </div>
      </div>
    );
  }

  const currentScorePct = currentIndex === 0 ? 0 : Math.round((score / currentIndex) * 100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="quiz-header">
          <div className="qh-left">
            <span className="qh-progress">Question {currentIndex + 1} of {quizData.length}</span>
            <h2 className="qh-title">{title || 'QuizFetch Assessment'}</h2>
          </div>
          <div className="qh-right">
            <div className="qh-stat-box">
              <span className="qh-stat-label">Timer</span>
              <span className="qh-stat-value">{formatTime(timeLeft)}</span>
            </div>
            <div className="qh-stat-box">
              <span className="qh-stat-label">Score</span>
              <span className="qh-stat-value">{currentScorePct}%</span>
            </div>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="quiz-progress-track">
          <div className="quiz-progress-fill" style={{ width: `${((currentIndex + 1) / quizData.length) * 100}%` }} />
        </div>

        <div className="quiz-body">
          {showDemotion && (
            <div className="demotion-indicator animate-bounce-in">
              <span className="di-icon">📦</span>
              <span className="di-text">Moved to Box 1</span>
            </div>
          )}
          <div className="quiz-question-card">
            <span className="qq-label">Concept: {currentQuestion.concept_category}</span>
            <p className="qq-text">{currentQuestion.question}</p>
          </div>

          <div className="quiz-options-grid">
            {currentQuestion.options.map((opt, i) => {
              const label = String.fromCharCode(65 + i); // A, B, C, D
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentQuestion.correctAnswer;
              let statusClass = '';
              if (isAnswered) {
                if (isCorrect) statusClass = 'correct';
                else if (isSelected) statusClass = 'incorrect';
              }

              return (
                <button
                  key={i}
                  className={`quiz-option-btn ${statusClass} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                >
                  <span className="qo-label">{label}</span>
                  <span className="qo-text">{opt}</span>
                </button>
              );
            })}
            <button
              className={`quiz-option-btn opt-unknown ${selectedOption === 'unknown' ? 'selected' : ''} ${isAnswered && selectedOption === 'unknown' ? 'incorrect' : ''}`}
              onClick={() => handleSelectOption('unknown')}
              disabled={isAnswered}
            >
              <span className="qo-label">E</span>
              <span className="qo-text">I don't know</span>
            </button>
          </div>
        </div>

        <div className="quiz-footer">
          {isAnswered && (
            <button className="btn btn-primary btn-next animate-in" onClick={handleNext}>
              {currentIndex >= quizData.length - 1 ? 'Finish Quiz' : 'Next Question'} →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
