const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

const SYSTEM_PROMPT = `You are an expert Cuemath teacher who creates high-quality flashcards for students. 

Given study material, generate 8-12 flashcards. Each card must:
- Test a SINGLE, clear concept
- Have a concise, well-phrased question
- Have a clear, accurate answer (1-3 sentences max)
- Be categorized into a concept_category

Return ONLY a valid JSON array with no markdown formatting, no code fences. Each object must have exactly these fields:
- "question": string
- "answer": string  
- "concept_category": string

Example format:
[{"question":"What is photosynthesis?","answer":"Photosynthesis is the process by which plants convert sunlight, water, and CO₂ into glucose and oxygen.","concept_category":"Biology"}]`;

const QUIZ_PROMPT = `You are an expert Cuemath teacher who creates challenging multiple-choice quizzes.

Given study material, generate 5-8 multiple-choice questions. Each question must:
- Test a specific concept clearly
- Have 4 plausible options (distractors)
- Have exactly one correct answer
- Be categorized into a concept_category

Return ONLY a valid JSON array with no markdown formatting. Each object must have:
- "question": string
- "options": [string, string, string, string]
- "correctAnswer": string (must be one of the 4 options)
- "concept_category": string
- "originalCardId": string (the ID of the card this question is based on)
`;

function getApiKey() {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
}

export async function generateFlashcards(text) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file.');
  }

  if (!text || text.trim().length < 20) {
    throw new Error('Please paste at least a paragraph of study material.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${SYSTEM_PROMPT}\n\nStudy Material:\n${text}` }
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || `API error: ${response.status}`;
    throw new Error(msg);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('No response received from Gemini. Please try again.');
  }

  // Strip any markdown code fences if present
  const cleaned = rawText.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const cards = JSON.parse(cleaned);
    if (!Array.isArray(cards) || cards.length === 0) {
      throw new Error('Invalid response format');
    }
    // Validate each card
    return cards
      .filter((c) => c.question && c.answer)
      .map((c) => ({
        question: String(c.question).trim(),
        answer: String(c.answer).trim(),
        concept_category: String(c.concept_category || 'General').trim(),
      }));
  } catch (parseErr) {
    throw new Error('Failed to parse AI response. Please try again with different text.');
  }
}

export async function generateQuiz(text) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${QUIZ_PROMPT}\n\nStudy Material:\n${text}` }]
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate quiz from API.');
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const cleaned = rawText.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const quiz = JSON.parse(cleaned);
    return quiz.map(q => ({
      ...q,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    }));
  } catch (e) {
    throw new Error('Failed to parse quiz response.');
  }
}

export async function generateQuizFromCards(cards) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Gemini API key is not configured.');

  const cardsJson = JSON.stringify(cards.map(c => ({ id: c.id, q: c.question, a: c.answer, cat: c.concept_category })));
  
  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: `${QUIZ_PROMPT}\n\nFlashcards Data:\n${cardsJson}` }]
      }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
    }),
  });

  if (!response.ok) throw new Error('Failed to generate quiz from cards.');

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  const cleaned = rawText.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    const quiz = JSON.parse(cleaned);
    return quiz.map(q => ({
      ...q,
      id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    }));
  } catch (e) {
    throw new Error('Failed to parse quiz response.');
  }
}

export function isApiKeyConfigured() {
  return Boolean(getApiKey());
}
