# ⚡ Cuemath Flashcard Learning Engine

> **Submission for the Cuemath Build Challenge**
> A production-ready, AI-powered flashcard app built with React + Vite, featuring the Leitner spaced-repetition system for effective learning.

🔗 **Live Demo:** [Deployed on Vercel](https://cuemath-flashcards.vercel.app)

---

## 🧩 The Problem

Students struggle to retain what they study. Passive re-reading is the most common — and least effective — study method. Research shows that **active recall + spaced repetition** dramatically improves long-term retention, but most students don't have access to a structured system that implements these principles.

The challenge: build a **Flashcard Learning Engine** that makes spaced repetition simple, visual, and delightful.

---

## 💡 The Solution

### Leitner Spaced-Repetition System

This app implements the **3-Box Leitner System** — a proven, research-backed learning method:

| Box | Name | Logic |
|-----|------|-------|
| 📖 Box 1 | **Learning** | All new cards start here. Study these most frequently. |
| 🔄 Box 2 | **Reviewing** | Cards you got right once. Review less frequently. |
| ⭐ Box 3 | **Mastered** | Cards you know well. Congratulations! |

**How cards move:**
- ✅ **"Got it"** → Card advances to the next box (Box 1 → 2 → 3)
- ❌ **"Struggling"** → Card drops back to Box 1 immediately

### Key Features

- **🤖 AI-Powered Card Generation** — Paste any study material and Gemini AI generates high-quality flashcards with questions, answers, and concept categories
- **📦 Visual Leitner Dashboard** — Three distinct, color-coded boxes show exactly where each card is in your learning journey
- **📊 Mastery Progress Bar** — Real-time percentage of cards in Box 3 with motivational messages
- **🎴 3D Flip Cards** — Smooth CSS 3D animations for an engaging study experience
- **✏️ Manual Card Creation** — Add cards manually when you don't need AI
- **💾 Persistent Progress** — All progress saved to localStorage; survives browser refresh
- **📱 Fully Responsive** — Works on desktop, tablet, and mobile
- **🎨 Premium Dark UI** — Glassmorphism, gradient accents, micro-animations

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + Vite 8 |
| Styling | Vanilla CSS (custom properties, keyframes) |
| AI | Google Gemini 2.5 Flash Lite API |
| State | React Context + useReducer |
| Persistence | localStorage |
| Testing | Vitest + React Testing Library |
| Deployment | Vercel |

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/ravi-kumar-t/cuemath-flashcards.git
cd cuemath-flashcards

# Install
npm install

# Add your Gemini API key
echo "VITE_GEMINI_API_KEY=your-key-here" > .env

# Run
npm run dev
```

Get a free Gemini API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

---

## 🧪 Testing

```bash
npm test
```

**5 tests covering core Leitner logic:**
- ✅ Cards are added to Box 1 by default
- ✅ "Got it" moves a card from Box 1 → Box 2
- ✅ "Struggling" sends a card back to Box 1
- ✅ Cards cannot move beyond Box 3 (clamped)
- ✅ Mastery percentage calculates correctly

---

## ⚖️ Key Trade-offs & Design Decisions

### 1. Security: Vercel Environment Variables
The Gemini API key is **never hardcoded** in source code. It's read from `import.meta.env.VITE_GEMINI_API_KEY`, which is:
- Set via a `.env` file locally (gitignored)
- Set via **Vercel Environment Variables** in production
- Never exposed in the Git repository

### 2. Client-Side Only (No Backend)
Chose a **fully client-side architecture** for simplicity and zero hosting costs. Trade-off: the API key is embedded in the production bundle (standard for Vite apps). For a production app, a serverless API route would proxy the Gemini calls.

### 3. localStorage Over a Database
Used `localStorage` for persistence because:
- Zero setup, no backend required
- Instant read/write
- Perfect for a single-user learning tool
- Trade-off: data is device-local, not synced across devices

### 4. 3-Box Leitner (Simplified)
The classic Leitner system uses 5+ boxes with timed review intervals. We simplified to 3 boxes with immediate feedback to keep the UX intuitive for the challenge scope. The architecture supports easy extension to more boxes.

### 5. Vanilla CSS Over Tailwind
Chose vanilla CSS with custom properties for:
- Zero dependency overhead
- Full animation control (3D flips, gradient pulses, shimmer)
- Smaller bundle size
- Trade-off: more verbose than utility classes

---

## 📁 Project Structure

```
cuemath-flashcards/
├── index.html              # Entry point with Google Fonts + SEO
├── .env                    # API key (gitignored)
├── .gitignore              # Excludes .env, node_modules, dist
├── package.json
├── vite.config.js          # Vite + Vitest config
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx            # React entry with FlashcardProvider
    ├── App.jsx             # Top-level layout
    ├── App.css
    ├── index.css           # Design system (tokens, animations)
    ├── context/
    │   └── FlashcardContext.jsx  # State + localStorage persistence
    ├── components/
    │   ├── Header.jsx      # App branding
    │   ├── MasteryBar.jsx  # Progress bar (% mastered)
    │   ├── LeitnerDashboard.jsx  # 3 Leitner boxes
    │   ├── FlashCard.jsx   # 3D flip card
    │   ├── StudyModal.jsx  # Study session flow
    │   └── TextIngestion.jsx     # AI + manual card creation
    ├── services/
    │   └── gemini.js       # Gemini API integration
    └── test/
        ├── setup.js
        └── Leitner.test.jsx  # Leitner logic tests
```

---

## 👤 Author

**Ravi Kumar T** — Built for the Cuemath Build Challenge 2026

---

*"The best way to learn is to teach yourself — one flashcard at a time."*
