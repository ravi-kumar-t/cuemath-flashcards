import { useMemo, useState, useRef } from 'react';
import { useFlashcards } from '../context/FlashcardContext';
import { trackActivity } from '../services/activityTracker';
import ActivityHeatmap from './ActivityHeatmap';
import './HomeDashboard.css';

// Helper for "time ago"
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Never';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// Helper for absolute date format
function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });
}

export default function HomeDashboard({ sets, viewMode = 'HOME', userName, onOpenSet, onViewAll, onCreateSet, onDeleteSet }) {
  const { dispatch } = useFlashcards();
  const [searchQuery, setSearchQuery] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const homeFileInputRef = useRef(null);

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  // Filtered sets based on search
  const filteredSets = useMemo(() => {
    if (!searchQuery.trim()) return sets;
    const query = searchQuery.toLowerCase();
    return sets.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.description && s.description.toLowerCase().includes(query))
    );
  }, [sets, searchQuery]);

  // Aggregate and filter materials
  const displayMaterials = useMemo(() => {
    let mats = [];
    sets.forEach(set => {
      if (set.materials) {
        set.materials.forEach(m => {
          mats.push({ ...m, setId: set.id, setName: set.name });
        });
      }
    });
    
    if (materialFilter !== 'all') {
      mats = mats.filter(m => m.setId === materialFilter);
    }
    
    return mats.sort((a, b) => b.uploadedAt - a.uploadedAt);
  }, [sets, materialFilter]);

  const isWorkspace = viewMode === 'MY_SETS';
  const isEmpty = sets.length === 0 && !isWorkspace;

  const handleHomeUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    // Simulate 2s processing
    setTimeout(() => {
      const newSetId = `set-${Date.now()}`;
      const fileName = file.name;
      
      // 1. Create a new study set for this upload
      dispatch({
        type: 'CREATE_SET',
        payload: { 
          id: newSetId, 
          name: fileName.split('.')[0] || 'New Study Set',
          description: `Generated from ${fileName}`
        }
      });

      // 2. Add the material to the new set
      dispatch({
        type: 'ADD_MATERIAL_TO_SET',
        payload: { setId: newSetId, name: fileName, cardCount: 0 }
      });

      setIsProcessing(false);
      trackActivity();
      onOpenSet(newSetId);
    }, 2000);
  };

  return (
    <div className="home">
      <main className="home-main">
        
        <header className={`home-header ${!isWorkspace ? 'centered-header' : ''}`}>
          <div className="workspace-header-content">
            <h1 className="home-greeting">
              {isWorkspace ? 'My Sets Workspace' : `${getGreeting()}, ${userName || 'Friend'}`}
            </h1>
            <p className="workspace-subtitle">
              {isWorkspace ? 'Manage and browse your study collections' : 'Which study set are you working on today?'}
            </p>
          </div>
          
          {isWorkspace && (
            <div className="home-search workspace-search-top">
              <span className="hs-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search study sets..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </header>

        {!isWorkspace && <ActivityHeatmap />}

        {isEmpty ? (
          <div className="upload-center">
            <div className={`main-upload-box ${isProcessing ? 'processing' : ''}`} onClick={() => !isProcessing && homeFileInputRef.current?.click()}>
              {isProcessing ? (
                <div className="upm-progress-container">
                  <div className="upm-status-text">Analyzing your documents...</div>
                  <div className="upm-progress-bar">
                    <div className="upm-progress-fill" style={{ width: '60%' }}></div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="ub-icons">📄 📁 📤</div>
                  <h2 className="ub-title">Upload any files from Class</h2>
                  <p className="ub-subtitle">Click to upload or drag and drop files</p>
                  
                  <div className="category-grid">
                    <div className="cat-btn"><span className="cat-icon">📊</span> Powerpoints</div>
                    <div className="cat-btn highlight"><span className="cat-icon">📕</span> PDF Documents</div>
                    <div className="cat-btn"><span className="cat-icon">🔊</span> Audio</div>
                    <div className="cat-btn"><span className="cat-icon">🎬</span> Video</div>
                    <div className="cat-btn"><span className="cat-icon">📝</span> Quizlet</div>
                    <div className="cat-btn"><span className="cat-icon">📺</span> YouTube</div>
                  </div>
                </>
              )}
              <input 
                type="file" 
                ref={homeFileInputRef} 
                style={{ display: 'none' }} 
                accept=".pdf"
                onChange={handleHomeUpload}
              />
            </div>

            <div className="secondary-upload-cards">
              <div className="upload-card blue-card">
                <div className="uc-icon">🤝</div>
                <div className="uc-info">
                  <h3 className="uc-title">Ask your friends</h3>
                  <p className="uc-text">Study together and share your notes.</p>
                </div>
                <button className="btn-copy">Copy Link</button>
              </div>
              
              <div className="upload-card pink-card">
                <div className="uc-icon">🎙️</div>
                <div className="uc-info">
                  <h3 className="uc-title">Live lecture</h3>
                  <p className="uc-text">Record your lecture in real-time.</p>
                </div>
                <button className="btn-record">Start Recording</button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* --- SECTION 1: STUDY SETS --- */}
            <section className="home-section">
              <div className="home-section-header">
                <div>
                  <h2 className="home-section-title">{isWorkspace ? 'All Collections' : 'Jump back in'}</h2>
                </div>
                {!isWorkspace && (
                  <div className="home-section-actions">
                    <button className="btn-text" onClick={onViewAll}>View all</button>
                    <button className="btn-text highlight" onClick={onCreateSet}>
                      Create new
                    </button>
                  </div>
                )}
              </div>

              <div className="jump-back-in-grid">
                {/* Create Placeholder (only in workspace, if no search) */}
                {isWorkspace && !searchQuery && (
                  <div className="set-card-compact create-card" onClick={onCreateSet}>
                    <div className="scc-icon">＋</div>
                    <div className="scc-info">
                      <span className="scc-title">Create Study Set</span>
                      <span className="scc-sub">Build a new collection</span>
                    </div>
                  </div>
                )}

                {filteredSets.map((set) => {
                  const total = set.cards?.length || 0;
                  const mastered = set.cards?.filter(c => c.box === 3).length || 0;
                  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
                  
                  return (
                    <div key={set.id} className="set-card-compact" onClick={() => onOpenSet(set.id)}>
                      <div className="scc-top">
                        <div className="scc-icon">📖</div>
                        <div className="scc-info">
                          <span className="scc-title">{set.name}</span>
                          <span className="scc-time">Last Studied: {formatTimeAgo(set.lastStudied)}</span>
                        </div>
                        <button
                          className="scc-delete"
                          onClick={(e) => { e.stopPropagation(); onDeleteSet(set.id); }}
                        >✕</button>
                      </div>

                      <div className="scc-bottom-meta">
                        <span className="scc-count">{set.materials?.length || 0} materials</span>
                      </div>

                      <div className="scc-progress">
                        <div className="scc-progress-bar">
                          <div className="scc-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="scc-pct">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* --- SECTION 2: YOUR MATERIALS (Only on Home) --- */}
            {!isWorkspace && (
              <section className="home-section mt-12">
                <div className="home-section-header">
                  <div>
                    <h2 className="home-section-title">Your materials</h2>
                  </div>
                  <div className="home-section-actions">
                    <select 
                      className="filter-dropdown"
                      value={materialFilter}
                      onChange={(e) => setMaterialFilter(e.target.value)}
                    >
                      <option value="all">All study sets</option>
                      {sets.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {displayMaterials.length === 0 ? (
                  <div className="materials-empty">
                    No materials found.
                  </div>
                ) : (
                  <div className="materials-grid-modern">
                    {displayMaterials.map((mat) => {
                      const isPdf = mat.name.toLowerCase().endsWith('.pdf');
                      return (
                        <div key={mat.id} className="doc-card" onClick={() => onOpenSet(mat.setId)}>
                          <div className={`doc-icon ${isPdf ? 'pdf' : ''}`}>
                            {isPdf ? 'PDF' : 'DOC'}
                          </div>
                          <div className="doc-details">
                            <p className="doc-name">{mat.name}</p>
                            <p className="doc-date">{formatDate(mat.uploadedAt)} · {mat.setName}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
