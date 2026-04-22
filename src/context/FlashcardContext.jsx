import { createContext, useContext, useReducer, useEffect, useRef, useMemo } from 'react';

const FlashcardContext = createContext(null);
const STORAGE_KEY = 'cuemath-flashcards-state';

const initialState = {
  studySets: [],
};

function loadSavedState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration: if old flat cards[] exist, wrap them into a default set
      if (parsed.cards && parsed.cards.length > 0 && (!parsed.studySets || parsed.studySets.length === 0)) {
        const categories = [...new Set(parsed.cards.map(c => c.concept_category || 'General'))];
        const setName = categories.length === 1 ? categories[0] : 'My Flashcards';
        return {
          studySets: [{
            id: `set-migrated-${Date.now()}`,
            name: setName,
            description: 'Migrated from previous version',
            cards: parsed.cards,
            materials: parsed.materials || [],
            createdAt: Date.now(),
            lastStudied: Date.now(),
          }],
        };
      }
      return { ...initialState, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to load saved state:', e);
  }
  return initialState;
}

function flashcardReducer(state, action) {
  switch (action.type) {
    case 'CREATE_SET': {
      const newSet = {
        id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: action.payload.name,
        description: action.payload.description || '',
        cards: [],
        materials: [],
        createdAt: Date.now(),
        lastStudied: Date.now(),
      };
      return { ...state, studySets: [...state.studySets, newSet] };
    }

    case 'UPDATE_SET': {
      const { setId, updates } = action.payload;
      return {
        ...state,
        studySets: state.studySets.map(s =>
          s.id === setId ? { ...s, ...updates } : s
        ),
      };
    }

    case 'DELETE_SET':
      return {
        ...state,
        studySets: state.studySets.filter(s => s.id !== action.payload),
      };

    case 'ADD_CARDS_TO_SET': {
      const { setId, cards } = action.payload;
      return {
        ...state,
        studySets: state.studySets.map(s => {
          if (s.id !== setId) return s;
          const newCards = cards.map((card, i) => ({
            id: `card-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
            question: card.question,
            answer: card.answer,
            concept_category: card.concept_category || 'General',
            box: 1,
            createdAt: Date.now(),
          }));
          return { ...s, cards: [...s.cards, ...newCards] };
        }),
      };
    }

    case 'ADD_MATERIAL_TO_SET': {
      const { setId, name, cardCount } = action.payload;
      const mat = { id: `mat-${Date.now()}`, name, uploadedAt: Date.now(), cardCount };
      return {
        ...state,
        studySets: state.studySets.map(s =>
          s.id === setId ? { ...s, materials: [...s.materials, mat] } : s
        ),
      };
    }

    case 'ADD_QUIZ_TO_SET': {
      const { setId, quizQuestions } = action.payload;
      return {
        ...state,
        studySets: state.studySets.map(s =>
          s.id === setId ? { ...s, quiz: quizQuestions } : s
        ),
      };
    }

    case 'MOVE_CARD': {
      const { setId, cardId, targetBox } = action.payload;
      return {
        ...state,
        studySets: state.studySets.map(s => {
          if (s.id !== setId) return s;
          return {
            ...s,
            cards: s.cards.map(card =>
              card.id === cardId
                ? { ...card, box: Math.max(1, Math.min(3, targetBox)) }
                : card
            ),
            lastStudied: Date.now(),
          };
        }),
      };
    }

    case 'DELETE_CARD': {
      const { setId, cardId } = action.payload;
      return {
        ...state,
        studySets: state.studySets.map(s =>
          s.id === setId ? { ...s, cards: s.cards.filter(c => c.id !== cardId) } : s
        ),
      };
    }

    case 'RESET_SET_PROGRESS': {
      return {
        ...state,
        studySets: state.studySets.map(s =>
          s.id === action.payload
            ? { ...s, cards: s.cards.map(c => ({ ...c, box: 1 })) }
            : s
        ),
      };
    }

    case 'RESET_ALL':
      return { ...initialState };

    default:
      return state;
  }
}

export function FlashcardProvider({ children }) {
  const [state, dispatch] = useReducer(flashcardReducer, null, loadSavedState);
  const hasHydrated = useRef(false);

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

  const value = { state, dispatch };

  return (
    <FlashcardContext.Provider value={value}>
      {children}
    </FlashcardContext.Provider>
  );
}

// Helper to compute derived stats for a single set
export function useSetStats(studySet) {
  return useMemo(() => {
    if (!studySet) return { total: 0, box1: 0, box2: 0, box3: 0, mastery: 0, modules: [], weakCards: [] };
    const cards = studySet.cards || [];
    const box1 = cards.filter(c => c.box === 1);
    const box2 = cards.filter(c => c.box === 2);
    const box3 = cards.filter(c => c.box === 3);
    const mastery = cards.length > 0 ? Math.round((box3.length / cards.length) * 100) : 0;

    const modMap = {};
    cards.forEach(card => {
      const cat = card.concept_category || 'General';
      if (!modMap[cat]) modMap[cat] = { name: cat, cards: [], box1: 0, box2: 0, box3: 0 };
      modMap[cat].cards.push(card);
      if (card.box === 1) modMap[cat].box1++;
      else if (card.box === 2) modMap[cat].box2++;
      else modMap[cat].box3++;
    });

    return {
      total: cards.length,
      box1: box1.length, box1Cards: box1,
      box2: box2.length, box2Cards: box2,
      box3: box3.length, box3Cards: box3,
      mastery,
      modules: Object.values(modMap),
      weakCards: box1,
    };
  }, [studySet]);
}

export function useFlashcards() {
  const ctx = useContext(FlashcardContext);
  if (!ctx) throw new Error('useFlashcards must be used within FlashcardProvider');
  return ctx;
}
