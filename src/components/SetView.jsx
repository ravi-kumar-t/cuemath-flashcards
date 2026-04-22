import { useState, useRef, useEffect } from 'react';
import { useFlashcards, useSetStats } from '../context/FlashcardContext';
import { extractTextFromPdf } from '../services/pdfExtractor';
import ModuleList from './ModuleList';
import MaterialsPanel from './MaterialsPanel';
import LeitnerSystemView from './LeitnerSystemView';
import StudyModal from './StudyModal';
import QuizModal from './QuizModal';
import MasteryBar from './MasteryBar';
import UploadProcessingModal from './UploadProcessingModal';
import EditSetModal from './EditSetModal';
import { generateFlashcards, generateQuiz, generateQuizFromCards } from '../services/gemini';
import { trackActivity } from '../services/activityTracker';
import './SetView.css';

export default function SetView({ studySet, onBack }) {
  const { dispatch } = useFlashcards();
  const stats = useSetStats(studySet);
  const fileInputRef = useRef(null);

  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' | 'leitner'
  const [studyCards, setStudyCards] = useState(null);
  const [studyTitle, setStudyTitle] = useState('');

  // Upload Processing State
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [generatedCards, setGeneratedCards] = useState([]);
  const [generatedQuiz, setGeneratedQuiz] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizGenerating, setQuizGenerating] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-open upload for new sets
  useEffect(() => {
    if (studySet && studySet.isNew && studySet.materials.length === 0) {
      // Small delay to ensure the UI is ready
      const timer = setTimeout(() => {
        fileInputRef.current?.click();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [studySet.id]); // Only run when entering a new set

  const handleStudyModule = (mod) => {
    setStudyCards([...mod.cards]);
    setStudyTitle(`Module: ${mod.name}`);
  };

  const openUploadModal = () => {
    console.log('Opening upload for set:', studySet.id);
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file.');
      setUploadStatus('error');
      return;
    }

    setUploadError('');
    setUploadStatus('extracting');
    setUploadProgress(10);

    try {
      const extractedText = await extractTextFromPdf(file);
      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error('Could not extract enough text from this PDF.');
      }
      setUploadProgress(40);

      setUploadStatus('generating');
      let p = 40;
      const interval = setInterval(() => {
        p += Math.random() * 5;
        if (p > 95) p = 95;
        setUploadProgress(Math.floor(p));
      }, 500);

      const cards = await generateFlashcards(extractedText);
      const quiz = await generateQuiz(extractedText);
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadStatus('complete');
      setGeneratedCards(cards);
      setGeneratedQuiz(quiz);
      
      dispatch({
        type: 'ADD_MATERIAL_TO_SET',
        payload: { setId: studySet.id, name: file.name, cardCount: cards.length },
      });

    } catch (err) {
      setUploadError(err.message);
      setUploadStatus('error');
    }
  };

  const handleConfirmUpload = () => {
    dispatch({
      type: 'ADD_CARDS_TO_SET',
      payload: { setId: studySet.id, cards: generatedCards },
    });
    dispatch({
      type: 'ADD_QUIZ_TO_SET',
      payload: { setId: studySet.id, quizQuestions: generatedQuiz },
    });
    setUploadStatus(null);
    setGeneratedCards([]);
    setGeneratedQuiz([]);
    trackActivity();
  };

  const handleQuizClick = async () => {
    if (studySet.quiz && studySet.quiz.length > 0) {
      setShowQuiz(true);
      return;
    }

    // If quiz is missing, try to generate it from current cards
    if (studySet.cards.length < 3) {
      alert("Please add at least 3 cards before taking a quiz.");
      return;
    }

    setQuizGenerating(true);
    try {
      const quiz = await generateQuizFromCards(studySet.cards);
      dispatch({
        type: 'ADD_QUIZ_TO_SET',
        payload: { setId: studySet.id, quizQuestions: quiz }
      });
      setShowQuiz(true);
    } catch (err) {
      alert("Failed to generate quiz: " + err.message);
    } finally {
      setQuizGenerating(false);
    }
  };

  const handleUpdateSet = (updates) => {
    dispatch({
      type: 'UPDATE_SET',
      payload: { setId: studySet.id, updates }
    });
  };

  const handleDeleteSet = () => {
    if (confirm('Are you sure you want to delete this study set? This action cannot be undone.')) {
      dispatch({ type: 'DELETE_SET', payload: studySet.id });
      onBack(); // Go back to home
    }
  };

  return (
    <div className="set-view-modern">
      {/* Getting Started Overlay for New Sets */}
      {studySet.isNew && studySet.materials.length === 0 && (
        <div className="new-set-overlay animate-fade-in">
          <div className="nso-content">
            <div className="nso-icon">🚀</div>
            <h2 className="nso-title">Your Second Brain is ready</h2>
            <p className="nso-text">Upload a PDF or paste your notes to generate flashcards and quizzes instantly.</p>
            <div className="nso-actions">
              <button 
                className="btn btn-primary btn-lg" 
                onClick={openUploadModal}
              >
                Upload Materials
              </button>
            </div>
            <p className="nso-hint">Accepts .pdf files · AI-powered generation</p>
          </div>
        </div>
      )}

      {/* Hidden File Input for Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf"
        style={{ display: 'none' }}
      />

      {/* Success Toast */}
      {showSuccess && (
        <div className="success-toast animate-slide-in">
          <div className="st-icon">✅</div>
          <div className="st-content">
            <span className="st-title">Set created!</span>
            <span className="st-text">Now upload your PDF or notes to get started.</span>
          </div>
          <button className="st-close" onClick={() => setShowSuccess(false)}>✕</button>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="sv-modern-header">
        <div className="svm-header-container">
          <div className="svm-thumbnail-box">
            <button 
              className="svm-edit-badge" 
              title="Edit Set"
              onClick={() => setShowEditModal(true)}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
            </button>
            <div className="svm-icon-container">
              <span className="svm-icon-text">{studySet.name.slice(0, 2).toUpperCase()}</span>
            </div>
          </div>
          
          <div className="svm-header-details">
            <button className="svm-breadcrumb" onClick={onBack}>
              ← Back to home
            </button>
            <h1 className="svm-set-title">{studySet.name}</h1>
            
            <div className="svm-stats-row">
              <span className="svm-stats-text">
                {stats.mastery}% complete · {stats.box3} of {stats.total} topics
              </span>
              <div className="svm-mastery-bar-container">
                <div className="svm-mastery-bar-fill" style={{ width: `${stats.mastery}%` }} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="sv-modern-body">
        <div className="svm-main-content">
          {activeView === 'dashboard' ? (
            <div className="svm-dashboard-content">
              {/* Activity Grid */}
              <div className="activity-grid">
                <div className="activity-card" onClick={() => setActiveView('leitner')}>
                  <div className="ac-icon-box blue">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  </div>
                  <div className="ac-info">
                    <h3 className="ac-title">Flashcards</h3>
                    <p className="ac-desc">Review {stats.total} terms</p>
                  </div>
                </div>

                <div 
                  className={`activity-card ${quizGenerating ? 'loading' : ''}`} 
                  onClick={handleQuizClick}
                >
                  <div className="ac-icon-box orange">
                    {quizGenerating ? (
                      <div className="spinner-small" />
                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    )}
                  </div>
                  <div className="ac-info">
                    <h3 className="ac-title">QuizFetch</h3>
                    <p className="ac-desc">
                      {quizGenerating ? 'Generating...' : `${studySet.quiz?.length || 0} questions ready`}
                    </p>
                  </div>
                </div>

                <div className="activity-card">
                  <div className="ac-icon-box emerald">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <div className="ac-info">
                    <h3 className="ac-title">Tutor Session</h3>
                    <p className="ac-desc">AI-powered guidance</p>
                  </div>
                </div>

                <div className="activity-card">
                  <div className="ac-icon-box violet">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  </div>
                  <div className="ac-info">
                    <h3 className="ac-title">Chat</h3>
                    <p className="ac-desc">Ask anything about this set</p>
                  </div>
                </div>
              </div>

              {/* Module Progress Section */}
              <div className="module-progress-section">
                <h2 className="mps-title">Module Progress</h2>
                <ModuleList
                  modules={stats.modules}
                  onStudyModule={handleStudyModule}
                />
              </div>
            </div>
          ) : (
            <div className="svm-leitner-view">
              <button className="svm-back-sub" onClick={() => setActiveView('dashboard')}>
                ← Back to Overview
              </button>
              <LeitnerSystemView 
                studySet={studySet} 
                onOpenIngestion={openUploadModal} 
              />
            </div>
          )}
        </div>

        <aside className="svm-sidebar">
          {/* Study Mode Selector */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">⚡ Study Mode</h3>
            <div className="study-mode-selector">
              <select className="mode-select">
                <option>Spaced Repetition (Leitner)</option>
                <option>Active Recall Quiz</option>
                <option>Focus Mode</option>
              </select>
            </div>
          </div>

          {/* Add Syllabus CTA */}
          <div className="sidebar-section">
            <div className="syllabus-cta">
              <div className="scta-icon">🎓</div>
              <div className="scta-text">
                <h4>Add your syllabus</h4>
                <p>Align study sets with your course goals.</p>
              </div>
              <button className="scta-btn">Upload Syllabus</button>
            </div>
          </div>

          <MaterialsPanel materials={studySet.materials} totalCards={stats.total} />
          
          <button 
            className="sidebar-upload-btn"
            onClick={openUploadModal}
          >
            ＋ Add Materials
          </button>
        </aside>
      </div>

      {/* --- MODALS --- */}
      {studyCards && studyCards.length > 0 && (
        <StudyModal
          boxId={0}
          cards={studyCards}
          title={studyTitle}
          setId={studySet.id}
          onClose={() => { setStudyCards(null); setStudyTitle(''); }}
        />
      )}

      {showQuiz && studySet.quiz && (
        <QuizModal
          quizData={studySet.quiz}
          title={`${studySet.name} Quiz`}
          setId={studySet.id}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {uploadStatus && (
        <UploadProcessingModal
          status={uploadStatus}
          progress={uploadProgress}
          error={uploadError}
          onClose={() => { setUploadStatus(null); setUploadError(''); }}
          onConfirm={handleConfirmUpload}
        />
      )}

      {showEditModal && (
        <EditSetModal
          studySet={studySet}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdateSet}
          onDelete={handleDeleteSet}
        />
      )}
    </div>
  );
}
