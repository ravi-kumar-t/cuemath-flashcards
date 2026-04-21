import { useState } from 'react';
import Header from './components/Header';
import MasteryBar from './components/MasteryBar';
import LeitnerDashboard from './components/LeitnerDashboard';
import TextIngestion from './components/TextIngestion';
import './App.css';

export default function App() {
  const [showIngestion, setShowIngestion] = useState(false);

  return (
    <div className="app">
      <Header
        onOpenIngestion={() => setShowIngestion(true)}
      />

      <MasteryBar />

      <main className="app-main">
        <LeitnerDashboard onOpenIngestion={() => setShowIngestion(true)} />
      </main>

      <footer className="app-footer">
        <p>Built with ❤️ for the <span className="gradient-text">Cuemath</span> Build Challenge</p>
      </footer>

      {showIngestion && (
        <TextIngestion onClose={() => setShowIngestion(false)} />
      )}
    </div>
  );
}
