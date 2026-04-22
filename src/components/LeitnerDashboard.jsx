import { useFlashcards } from '../context/FlashcardContext';
import HomeDashboard from './HomeDashboard';
import SetView from './SetView';

export default function LeitnerDashboard({ activeView, activeSetId, userName, onOpenSet, onCreateSet, onDeleteSet, onNavigate }) {
  const { state } = useFlashcards();
  
  const activeSet = state.studySets.find(s => s.id === activeSetId) || null;

  if (activeView === 'dashboard' || activeView === 'workspace') {
    return (
      <HomeDashboard 
        sets={state.studySets} 
        viewMode={activeView === 'workspace' ? 'MY_SETS' : 'HOME'}
        userName={userName}
        onOpenSet={onOpenSet}
        onViewAll={() => onNavigate('workspace')}
        onCreateSet={onCreateSet}
        onDeleteSet={onDeleteSet}
      />
    );
  }

  if (activeSet) {
    return (
      <div className="workspace-single-set">
        <SetView 
          studySet={activeSet} 
          onBack={() => onOpenSet(null)} 
        />
      </div>
    );
  }

  return null;
}
