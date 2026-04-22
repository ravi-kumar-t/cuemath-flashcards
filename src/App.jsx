import { useState } from 'react';
import { useFlashcards } from './context/FlashcardContext';
import LeitnerDashboard from './components/LeitnerDashboard';
import CreateSetModal from './components/CreateSetModal';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import './App.css';

export default function App() {
  const { state, dispatch } = useFlashcards();
  const [activeSetId, setActiveSetId] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'workspace', 'set'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [tempName, setTempName] = useState('');

  const handleStartOnboarding = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      localStorage.setItem('userName', tempName.trim());
      setUserName(tempName.trim());
    }
  };

  const activeSet = state.studySets.find(s => s.id === activeSetId) || null;

  const handleCreateSet = (name, description) => {
    dispatch({ type: 'CREATE_SET', payload: { name, description } });
    setShowCreateModal(false);
  };

  const handleDeleteSet = (setId) => {
    if (confirm('Delete this entire study set? This cannot be undone.')) {
      dispatch({ type: 'DELETE_SET', payload: setId });
      if (activeSetId === setId) {
        setActiveSetId(null);
        setActiveView('workspace');
      }
    }
  };

  const handleNavigate = (viewId, setId = null) => {
    setActiveView(viewId);
    if (viewId === 'dashboard' || viewId === 'workspace') {
      setActiveSetId(null);
    } else if (viewId === 'set' && setId) {
      setActiveSetId(setId);
    }
  };

  // If activeSetId is set, ensure activeView is 'set'
  const currentView = activeSetId ? 'set' : activeView;

  return (
    <div className="app-layout">
      <Sidebar
        activeView={currentView}
        onNavigate={handleNavigate}
        onAddCards={() => setShowCreateModal(true)}
      />

      <div className="main-area">
        <TopBar />
        <LeitnerDashboard
          activeView={currentView}
          activeSetId={activeSetId}
          userName={userName}
          onOpenSet={(setId) => handleNavigate('set', setId)}
          onNavigate={handleNavigate}
          onCreateSet={() => setShowCreateModal(true)}
          onDeleteSet={handleDeleteSet}
        />
      </div>

      {/* Onboarding Modal */}
      {!userName && (
        <div className="modal-overlay onboarding-overlay">
          <div className="onboarding-modal" onClick={(e) => e.stopPropagation()}>
            <div className="onboarding-icon">🧠</div>
            <h2 className="onboarding-title">Welcome to your Second Brain</h2>
            <p className="onboarding-subtitle">What is your name?</p>
            
            <form onSubmit={handleStartOnboarding} className="onboarding-form">
              <input 
                type="text" 
                placeholder="Enter your name" 
                autoFocus
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="onboarding-input"
              />
              <button type="submit" className="btn btn-primary btn-lg w-full">
                Start Studying
              </button>
            </form>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateSetModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateSet}
        />
      )}
    </div>
  );
}
