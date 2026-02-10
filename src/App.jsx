import React, { useState, useEffect } from 'react';
import { GeminiService } from './services/gemini';
import { BookOpen, FileText, Sparkles, Settings, Compass } from 'lucide-react';
import { BeginnerMode } from './components/modes/BeginnerMode';
import { PaperAnalysisMode } from './components/modes/PaperAnalysisMode';
import { PaperSummarizationMode } from './components/modes/PaperSummarizationMode';
import { CoreNavigator } from './components/CoreNavigator/CoreNavigator';
import './App.css';

const ModeSelector = ({ onSelect }) => {
  return (
    <div className="container" style={{ marginTop: '80px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '16px', textShadow: '0 0 20px rgba(0,242,255,0.3)' }}>
        Choose Your Path
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '60px' }}>
        Select a mode to begin your research journey.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Beginner Mode Card */}
        <div className="glass-panel" style={{ padding: '40px', cursor: 'pointer', transition: '0.3s' }}
          onClick={() => onSelect('beginner')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-neon)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
        >
          <BookOpen size={48} color="var(--primary-neon)" style={{ marginBottom: '24px' }} />
          <h2>Beginner Mode</h2>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            I am new and need guidance on where to start.
          </p>
        </div>

        {/* Paper Analysis Mode Card */}
        <div className="glass-panel" style={{ padding: '40px', cursor: 'pointer', transition: '0.3s' }}
          onClick={() => onSelect('analysis')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--secondary-neon)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
        >
          <FileText size={48} color="var(--secondary-neon)" style={{ marginBottom: '24px' }} />
          <h2>Paper Analysis</h2>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            I have papers and need to find a research gap.
          </p>
        </div>

        {/* Paper Summarization Mode Card */}
        <div className="glass-panel" style={{ padding: '40px', cursor: 'pointer', transition: '0.3s' }}
          onClick={() => onSelect('summarization')}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff6b9d'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
        >
          <Compass size={48} color="#ff6b9d" style={{ marginBottom: '24px' }} />
          <h2>Paper Explanation</h2>
          <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>
            I want to deeply understand a paper's methodology and concepts.
          </p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [gemini] = useState(new GeminiService()); // Always active, no key needed
  const [mode, setMode] = useState(null);

  return (
    <div>
      <nav style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setMode(null)}>
          <Sparkles size={24} color="var(--primary-neon)" />
          <span style={{ fontWeight: 600, fontSize: '1.2rem' }}>ResearchAI</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          {/* Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f0', boxShadow: '0 0 5px #0f0' }}></div>
            connected
          </div>
        </div>
      </nav>

      {!mode && <ModeSelector onSelect={setMode} />}

      {mode === 'beginner' && (
        <BeginnerMode
          gemini={gemini}
          onBack={() => setMode(null)}
        />
      )}

      {mode === 'analysis' && (
        <PaperAnalysisMode
          gemini={gemini}
          onBack={() => setMode(null)}
        />
      )}

      {mode === 'summarization' && (
        <PaperSummarizationMode
          gemini={gemini}
          onBack={() => setMode(null)}
        />
      )}

      <CoreNavigator />
    </div>
  );
}

export default App;
