import { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const FlashcardContext = createContext(null);

const STORAGE_KEY = 'cuemath-flashcards-state';

const initialState = {
  cards: [],
};

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load saved state:', e);
  }
  return initialState;
}

function flashcardReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload };

    case 'ADD_CARDS': {
      const newCards = action.payload.map((card, i) => ({
        id: `card-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        question: card.question,
        answer: card.answer,
        concept_category: card.concept_category || 'General',
        box: 1,
        createdAt: Date.now(),
      }));
      return { ...state, cards: [...state.cards, ...newCards] };
    }

    case 'MOVE_CARD': {
      const { cardId, targetBox } = action.payload;
      return {
        ...state,
        cards: state.cards.map((card) =>
          card.id === cardId
            ? { ...card, box: Math.max(1, Math.min(3, targetBox)) }
            : card
        ),
      };
    }

    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter((card) => card.id !== action.payload),
      };

    case 'RESET_ALL':
      return { ...state, cards: [] };

    case 'RESET_PROGRESS':
      return {
        ...state,
        cards: state.cards.map((card) => ({ ...card, box: 1 })),
      };

    default:
      return state;
  }
}

export function FlashcardProvider({ children }) {
  const [state, dispatch] = useReducer(flashcardReducer, null, loadSavedState);
  const hasHydrated = useRef(false);

  // Persist to localStorage on every state change (skip first render)
  useEffect(() => {
    if (!hasHydrated.current) {
      hasHydrated.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [state]);

  // Derived values
  const totalCards = state.cards.length;
  const box1Cards = state.cards.filter((c) => c.box === 1);
  const box2Cards = state.cards.filter((c) => c.box === 2);
  const box3Cards = state.cards.filter((c) => c.box === 3);
  const masteryPercent = totalCards > 0 ? Math.round((box3Cards.length / totalCards) * 100) : 0;

  const value = {
    state,
    dispatch,
    totalCards,
    box1Cards,
    box2Cards,
    box3Cards,
    masteryPercent,
  };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

export function useFlashcards() {
  const ctx = useContext(FlashcardContext);
  if (!ctx) throw new Error('useFlashcards must be used within FlashcardProvider');
  return ctx;
}
