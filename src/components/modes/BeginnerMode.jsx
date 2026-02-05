import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, Star, Zap } from 'lucide-react';

const INTERESTS = ['Environment', 'Healthcare', 'Technology', 'Education', 'Social Good'];
const DATA_TYPES = ['Data', 'Images', 'Text', 'Hardware'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const BeginnerMode = ({ gemini, onBack }) => {
    const [step, setStep] = useState('input'); // input | loading | results
    const [formData, setFormData] = useState({ interest: INTERESTS[0], type: DATA_TYPES[0], level: LEVELS[0] });
    const [results, setResults] = useState(null);

    const handleSearch = async () => {
        setStep('loading');
        try {
            const data = await gemini.getBeginnerSuggestions(formData);
            setResults(data);
            setStep('results');
        } catch (e) {
            alert("AI Error: " + e.message);
            setStep('input');
        }
    };

    if (step === 'loading') {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div className="glass-panel" style={{ padding: '60px', display: 'inline-block' }}>
                    <Sparkles className="icon-glow" size={64} color="var(--primary-neon)" style={{ animation: 'spin 3s linear infinite' }} />
                    <h2 style={{ marginTop: '24px' }}>Consulting the Archives...</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Analyzing {formData.interest} + {formData.type} opportunities...</p>
                </div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (step === 'results' && results) {
        return (
            <div className="container" style={{ marginTop: '40px' }}>
                <button onClick={() => setStep('input')} className="btn-secondary" style={{ marginBottom: '24px' }}>
                    &larr; Search Again
                </button>

                <h1 style={{ marginBottom: '8px' }}>Your Research Pathways</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    Curated based on your interest in <b>{formData.interest}</b> and <b>{formData.type}</b>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {results.domains.map((domain, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '32px', borderLeft: `4px solid ${domain.friendly ? 'var(--primary-neon)' : 'var(--secondary-neon)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <h2 style={{ color: 'var(--primary-neon)' }}>{domain.name}</h2>
                                {domain.friendly && (
                                    <span style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary-neon)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                        Beginner Friendly
                                    </span>
                                )}
                            </div>

                            <p style={{ margin: '16px 0', fontSize: '1.1rem', lineHeight: '1.6' }}>{domain.description}</p>

                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '24px' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Zap size={16} /> Required Skills
                                    </h4>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {domain.skills.map((skill, i) => (
                                            <span key={i} style={{ border: '1px solid var(--border-glass)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9rem' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Star size={16} /> Suggested Projects
                                    </h4>
                                    <ul style={{ paddingLeft: '20px', color: 'var(--text-primary)' }}>
                                        {domain.directions.map((dir, i) => (
                                            <li key={i} style={{ marginBottom: '8px' }}>{dir}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '60px', padding: '32px', background: 'var(--bg-space-light)', borderRadius: '16px' }}>
                    <h3>Next Suggested Action</h3>
                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                        Choose one of the project directions above. Start by searching for "Dataset for [Project Name]" on Kaggle or Google Scholar.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: '60px', maxWidth: '800px' }}>
            <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '24px' }}>
                &larr; Back to Modes
            </button>

            <div className="glass-panel" style={{ padding: '40px' }}>
                <h1 style={{ marginBottom: '32px' }}>Find Your Domain</h1>

                <div style={{ display: 'grid', gap: '24px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Interest Area</label>
                        <select value={formData.interest} onChange={(e) => setFormData({ ...formData, interest: e.target.value })}>
                            {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Preferred Data Type</label>
                        <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                            {DATA_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Skill Level</label>
                        <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })}>
                            {LEVELS.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>

                    <button className="btn-primary" onClick={handleSearch} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <Sparkles size={20} />
                        Generate Suggestions
                    </button>
                </div>
            </div>
        </div>
    );
};
