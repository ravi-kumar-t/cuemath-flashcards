import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { FlashcardProvider, useFlashcards } from '../context/FlashcardContext';

// Helper component to render context values and expose dispatch
function TestHarness() {
  const ctx = useFlashcards();
  return (
    <div>
      <div data-testid="box1-count">{ctx.box1Cards.length}</div>
      <div data-testid="box2-count">{ctx.box2Cards.length}</div>
      <div data-testid="box3-count">{ctx.box3Cards.length}</div>
      <div data-testid="mastery">{ctx.masteryPercent}</div>
      {ctx.state.cards.map((c) => (
        <div key={c.id} data-testid={`card-${c.id}`} data-box={c.box}>
          {c.question}
        </div>
      ))}
    </div>
  );
}

// We need a wrapper that gives us access to dispatch
let testDispatch = null;
function DispatchCapture() {
  const { dispatch } = useFlashcards();
  testDispatch = dispatch;
  return null;
}

function renderWithProvider() {
  return render(
    <FlashcardProvider>
      <DispatchCapture />
      <TestHarness />
    </FlashcardProvider>
  );
}

describe('Leitner System Logic', () => {
  beforeEach(() => {
    localStorage.clear();
    testDispatch = null;
  });

  it('should add a card to Box 1 by default', () => {
    renderWithProvider();

    act(() => {
      testDispatch({
        type: 'ADD_CARDS',
        payload: [{ question: 'What is 2+2?', answer: '4', concept_category: 'Math' }],
      });
    });

    expect(screen.getByTestId('box1-count').textContent).toBe('1');
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument();
  });

  it('should move a card from Box 1 to Box 2 when "Got it" is called', () => {
    // Seed a card in Box 1
    const seedState = {
      cards: [{ id: 'card-got-it', question: 'Capital of France?', answer: 'Paris', concept_category: 'Geo', box: 1, createdAt: 1 }],
    };
    localStorage.setItem('cuemath-flashcards-state', JSON.stringify(seedState));

    renderWithProvider();

    // Verify card starts in Box 1
    expect(screen.getByTestId('box1-count').textContent).toBe('1');
    expect(screen.getByTestId('box2-count').textContent).toBe('0');

    // Simulate "Got it" → move to Box 2
    act(() => {
      testDispatch({ type: 'MOVE_CARD', payload: { cardId: 'card-got-it', targetBox: 2 } });
    });

    expect(screen.getByTestId('box1-count').textContent).toBe('0');
    expect(screen.getByTestId('box2-count').textContent).toBe('1');
    expect(screen.getByTestId('card-card-got-it').dataset.box).toBe('2');
  });

  it('should move a card back to Box 1 when "Struggling" is called', () => {
    const seedState = {
      cards: [{ id: 'card-struggle', question: 'What is H2O?', answer: 'Water', concept_category: 'Science', box: 2, createdAt: 1 }],
    };
    localStorage.setItem('cuemath-flashcards-state', JSON.stringify(seedState));

    renderWithProvider();

    // Verify starts in Box 2
    expect(screen.getByTestId('box2-count').textContent).toBe('1');

    // Simulate "Struggling" → back to Box 1
    act(() => {
      testDispatch({ type: 'MOVE_CARD', payload: { cardId: 'card-struggle', targetBox: 1 } });
    });

    expect(screen.getByTestId('box1-count').textContent).toBe('1');
    expect(screen.getByTestId('box2-count').textContent).toBe('0');
    expect(screen.getByTestId('card-card-struggle').dataset.box).toBe('1');
  });

  it('should not move a card beyond Box 3', () => {
    const seedState = {
      cards: [{ id: 'card-max', question: 'Pi?', answer: '3.14', concept_category: 'Math', box: 3, createdAt: 1 }],
    };
    localStorage.setItem('cuemath-flashcards-state', JSON.stringify(seedState));

    renderWithProvider();

    // Try to move to Box 4 — should clamp to 3
    act(() => {
      testDispatch({ type: 'MOVE_CARD', payload: { cardId: 'card-max', targetBox: 4 } });
    });

    expect(screen.getByTestId('box3-count').textContent).toBe('1');
    expect(screen.getByTestId('card-card-max').dataset.box).toBe('3');
  });

  it('should calculate mastery percentage correctly', () => {
    const seedState = {
      cards: [
        { id: 'c1', question: 'Q1', answer: 'A1', concept_category: 'X', box: 3, createdAt: 1 },
        { id: 'c2', question: 'Q2', answer: 'A2', concept_category: 'X', box: 3, createdAt: 1 },
        { id: 'c3', question: 'Q3', answer: 'A3', concept_category: 'X', box: 1, createdAt: 1 },
        { id: 'c4', question: 'Q4', answer: 'A4', concept_category: 'X', box: 2, createdAt: 1 },
      ],
    };
    localStorage.setItem('cuemath-flashcards-state', JSON.stringify(seedState));

    renderWithProvider();

    // 2 of 4 in Box 3 = 50%
    expect(screen.getByTestId('mastery').textContent).toBe('50');
  });
});
