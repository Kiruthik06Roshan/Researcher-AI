import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, Star, Zap, HelpCircle, Lightbulb, Target, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react';

// Enhanced dropdown options with more variety
const INTERESTS = [
    'Artificial Intelligence & Machine Learning',
    'Environment & Climate Change',
    'Healthcare & Medicine',
    'Technology & Innovation',
    'Education & Learning',
    'Social Good & Community',
    'Business & Economics',
    'Science & Research',
    'Other (Custom)'
];

const DATA_TYPES = [
    'Numerical Data & Statistics',
    'Images & Computer Vision',
    'Text & Natural Language',
    'Audio & Speech',
    'Video & Multimedia',
    'Hardware & IoT Sensors',
    'Mixed/Multi-modal Data',
    'Other (Custom)'
];

const LEVELS = [
    'Complete Beginner',
    'Some Programming Experience',
    'Intermediate Researcher',
    'Advanced/Expert'
];

export const BeginnerMode = ({ gemini, onBack }) => {
    const [step, setStep] = useState('input'); // input | loading | results | project-selection | roadmap-loading | roadmap
    const [formData, setFormData] = useState({
        interest: INTERESTS[0],
        type: DATA_TYPES[0],
        level: LEVELS[0],
        customInterest: '',
        customType: ''
    });
    const [results, setResults] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [roadmap, setRoadmap] = useState(null);

    // Check if "Other" is selected
    const isCustomInterest = formData.interest === 'Other (Custom)';
    const isCustomType = formData.type === 'Other (Custom)';

    const handleSearch = async () => {
        const finalInterest = isCustomInterest ? formData.customInterest : formData.interest;
        const finalType = isCustomType ? formData.customType : formData.type;

        if (isCustomInterest && !formData.customInterest.trim()) {
            alert('Please enter your custom interest area');
            return;
        }
        if (isCustomType && !formData.customType.trim()) {
            alert('Please enter your custom data type');
            return;
        }

        setStep('loading');
        try {
            const data = await gemini.getBeginnerSuggestions({
                interest: finalInterest,
                type: finalType,
                level: formData.level
            });
            setResults(data);
            setStep('results');
        } catch (e) {
            alert("AI Error: " + e.message);
            setStep('input');
        }
    };

    const handleProjectSelect = async (project) => {
        setSelectedProject(project);
        setStep('roadmap-loading');

        const finalInterest = isCustomInterest ? formData.customInterest : formData.interest;
        const finalType = isCustomType ? formData.customType : formData.type;

        try {
            const roadmapData = await gemini.getProjectRoadmap({
                project: project.name,
                interest: finalInterest,
                dataType: finalType,
                level: formData.level
            });
            setRoadmap(roadmapData);
            setStep('roadmap');
        } catch (e) {
            alert("AI Error: " + e.message);
            setStep('project-selection');
        }
    };

    const handleSwitchProject = () => {
        setSelectedProject(null);
        setRoadmap(null);
        setStep('project-selection');
    };

    const handleStartOver = () => {
        setResults(null);
        setSelectedProject(null);
        setRoadmap(null);
        setStep('input');
    };

    // LOADING SCREEN
    if (step === 'loading') {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div className="glass-panel" style={{ padding: '60px', display: 'inline-block' }}>
                    <Sparkles className="icon-glow" size={64} color="var(--primary-neon)" style={{ animation: 'spin 3s linear infinite' }} />
                    <h2 style={{ marginTop: '24px' }}>Consulting the Research Archives...</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Analyzing {isCustomInterest ? formData.customInterest : formData.interest} + {isCustomType ? formData.customType : formData.type} opportunities...
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
                        This may take a few moments...
                    </p>
                </div>
                <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ROADMAP LOADING SCREEN
    if (step === 'roadmap-loading') {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '100px' }}>
                <div className="glass-panel" style={{ padding: '60px', display: 'inline-block' }}>
                    <Target className="icon-glow" size={64} color="var(--primary-neon)" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
                    <h2 style={{ marginTop: '24px' }}>Crafting Your Personal Roadmap...</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        Building a mentor-guided path for: <b>{selectedProject?.name}</b>
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '12px' }}>
                        Preparing 6 phases of guided learning...
                    </p>
                </div>
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            </div>
        );
    }

    // ROADMAP DISPLAY
    if (step === 'roadmap' && roadmap && selectedProject) {
        return (
            <div className="container" style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <button onClick={handleSwitchProject} className="btn-secondary">
                        <RefreshCw size={16} style={{ marginRight: '8px' }} />
                        Switch Project
                    </button>
                    <button onClick={handleStartOver} className="btn-secondary">
                        &larr; Start Over
                    </button>
                </div>

                <div className="glass-panel" style={{ padding: '40px', marginBottom: '32px', background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.1) 0%, rgba(189, 0, 255, 0.1) 100%)' }}>
                    <h1 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Target size={36} color="var(--primary-neon)" />
                        Your Project Roadmap
                    </h1>
                    <h2 style={{ color: 'var(--primary-neon)', marginBottom: '16px' }}>{selectedProject.name}</h2>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                        {roadmap.overview}
                    </p>
                </div>

                {/* Phases */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {roadmap.phases.map((phase, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '32px', borderLeft: '4px solid var(--primary-neon)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: 'var(--primary-neon)',
                                    color: '#000',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    fontSize: '1.2rem',
                                    flexShrink: 0
                                }}>
                                    {idx + 1}
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{phase.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{phase.objective}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '24px' }}>
                                <h4 style={{ color: 'var(--primary-neon)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BookOpen size={18} /> What to Learn & Do
                                </h4>
                                <p style={{ lineHeight: '1.7', marginBottom: '16px' }}>{phase.whatToDo}</p>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ color: 'var(--secondary-neon)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Lightbulb size={18} /> Mentor Guidance
                                </h4>
                                <div style={{ background: 'rgba(189, 0, 255, 0.05)', padding: '16px', borderRadius: '8px', borderLeft: '3px solid var(--secondary-neon)' }}>
                                    <p style={{ lineHeight: '1.7', fontStyle: 'italic' }}>{phase.mentorGuidance}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <CheckCircle size={18} /> How You Know You're Done
                                </h4>
                                <p style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>{phase.outcome}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Final Encouragement */}
                <div style={{ marginTop: '60px', padding: '40px', background: 'linear-gradient(135deg, rgba(0, 242, 255, 0.1) 0%, rgba(189, 0, 255, 0.1) 100%)', borderRadius: '16px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
                    <TrendingUp size={48} color="var(--primary-neon)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '12px' }}>You're Ready to Begin!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', maxWidth: '700px', margin: '0 auto' }}>
                        Remember: Learning takes time, and that is completely normal. Focus on understanding each phase before moving to the next.
                        You can always come back and switch projects if you want to explore something different.
                    </p>
                </div>
            </div>
        );
    }

    // PROJECT SELECTION SCREEN
    if (step === 'project-selection' && results) {
        const displayInterest = isCustomInterest ? formData.customInterest : formData.interest;
        const displayType = isCustomType ? formData.customType : formData.type;

        // Flatten all project directions from all domains
        const allProjects = results.domains.flatMap(domain =>
            domain.directions.map(direction => ({
                name: direction,
                domain: domain.name,
                friendly: domain.friendly
            }))
        );

        return (
            <div className="container" style={{ marginTop: '40px' }}>
                <button onClick={() => setStep('results')} className="btn-secondary" style={{ marginBottom: '24px' }}>
                    &larr; Back to Suggestions
                </button>

                <h1 style={{ marginBottom: '12px' }}>Choose Your Project</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '1.1rem' }}>
                    Select one project to get a detailed, mentor-guided roadmap. Don't worry - you can always switch later!
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                    {allProjects.map((project, idx) => (
                        <div
                            key={idx}
                            onClick={() => handleProjectSelect(project)}
                            className="glass-panel"
                            style={{
                                padding: '24px',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                borderLeft: `4px solid ${project.friendly ? 'var(--primary-neon)' : 'var(--secondary-neon)'}`,
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 242, 255, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            {project.friendly && (
                                <span style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    background: 'rgba(0, 242, 255, 0.1)',
                                    color: 'var(--primary-neon)',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600
                                }}>
                                    ✨ Beginner
                                </span>
                            )}
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', paddingRight: '80px' }}>{project.name}</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From: {project.domain}</p>
                            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-neon)', fontSize: '0.9rem' }}>
                                <ArrowRight size={16} />
                                Click to get roadmap
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '40px', padding: '24px', background: 'rgba(0, 242, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 242, 255, 0.2)', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        <b>Not sure yet?</b> Go back to review the domain suggestions, or start over to try different criteria.
                    </p>
                </div>
            </div>
        );
    }

    // RESULTS SCREEN (Domain Suggestions)
    if (step === 'results' && results) {
        const displayInterest = isCustomInterest ? formData.customInterest : formData.interest;
        const displayType = isCustomType ? formData.customType : formData.type;

        return (
            <div className="container" style={{ marginTop: '40px' }}>
                <button onClick={() => setStep('input')} className="btn-secondary" style={{ marginBottom: '24px' }}>
                    &larr; Search Again
                </button>

                <h1 style={{ marginBottom: '8px' }}>Your Personalized Research Pathways</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    Curated based on your interest in <b>{displayInterest}</b> and <b>{displayType}</b> at <b>{formData.level}</b> level.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {results.domains.map((domain, idx) => (
                        <div key={idx} className="glass-panel" style={{ padding: '32px', borderLeft: `4px solid ${domain.friendly ? 'var(--primary-neon)' : 'var(--secondary-neon)'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                                <h2 style={{ color: 'var(--primary-neon)' }}>{domain.name}</h2>
                                {domain.friendly && (
                                    <span style={{ background: 'rgba(0, 242, 255, 0.1)', color: 'var(--primary-neon)', padding: '6px 16px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                        ✨ Beginner Friendly
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
                                            <span key={i} style={{ border: '1px solid var(--border-glass)', padding: '6px 14px', borderRadius: '6px', fontSize: '0.9rem', background: 'rgba(0, 242, 255, 0.05)' }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Star size={16} /> Suggested Entry Projects
                                    </h4>
                                    <ul style={{ paddingLeft: '20px', color: 'var(--text-primary)' }}>
                                        {domain.directions.map((dir, i) => (
                                            <li key={i} style={{ marginBottom: '10px', lineHeight: '1.5' }}>{dir}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '60px', textAlign: 'center' }}>
                    <button
                        className="btn-primary"
                        onClick={() => setStep('project-selection')}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px 32px',
                            fontSize: '1.1rem'
                        }}
                    >
                        <Target size={24} />
                        Choose a Project & Get Roadmap
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        );
    }

    // INPUT SCREEN
    return (
        <div className="container" style={{ marginTop: '60px', maxWidth: '900px' }}>
            <button onClick={onBack} className="btn-secondary" style={{ marginBottom: '24px' }}>
                &larr; Back to Modes
            </button>

            <div className="glass-panel" style={{ padding: '48px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ marginBottom: '12px', fontSize: '2.5rem' }}>
                        <BookOpen style={{ display: 'inline', marginRight: '12px', verticalAlign: 'middle' }} size={40} />
                        Find Your Research Domain
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                        Answer a few questions to discover personalized research pathways tailored to your interests and skill level.
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '28px' }}>
                    {/* Interest Area */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '500' }}>
                            <Star size={18} color="var(--primary-neon)" />
                            What area interests you most?
                        </label>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Select the field you're passionate about exploring
                        </p>
                        <select
                            value={formData.interest}
                            onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {INTERESTS.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>

                        {isCustomInterest && (
                            <input
                                type="text"
                                placeholder="Enter your custom interest area..."
                                value={formData.customInterest}
                                onChange={(e) => setFormData({ ...formData, customInterest: e.target.value })}
                                style={{
                                    marginTop: '12px',
                                    width: '100%',
                                    padding: '12px',
                                    background: 'var(--bg-space-light)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        )}
                    </div>

                    {/* Data Type */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '500' }}>
                            <Zap size={18} color="var(--secondary-neon)" />
                            What type of data do you prefer working with?
                        </label>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Choose the data format that excites you
                        </p>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {DATA_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>

                        {isCustomType && (
                            <input
                                type="text"
                                placeholder="Enter your custom data type..."
                                value={formData.customType}
                                onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                                style={{
                                    marginTop: '12px',
                                    width: '100%',
                                    padding: '12px',
                                    background: 'var(--bg-space-light)',
                                    border: '1px solid var(--border-glass)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                        )}
                    </div>

                    {/* Skill Level */}
                    <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--text-primary)', fontWeight: '500' }}>
                            <HelpCircle size={18} color="var(--primary-neon)" />
                            What's your current skill level?
                        </label>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                            Be honest - we'll match you with appropriate projects
                        </p>
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            style={{ width: '100%' }}
                        >
                            {LEVELS.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                    </div>

                    <button
                        className="btn-primary"
                        onClick={handleSearch}
                        style={{
                            marginTop: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            padding: '16px',
                            fontSize: '1.1rem'
                        }}
                    >
                        <Sparkles size={24} />
                        Generate My Research Pathways
                        <ArrowRight size={20} />
                    </button>
                </div>

                <div style={{ marginTop: '32px', padding: '20px', background: 'rgba(0, 242, 255, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 242, 255, 0.2)' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <Lightbulb size={20} color="var(--primary-neon)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>
                            <b style={{ color: 'var(--primary-neon)' }}>Pro Tip:</b> Don't see your exact interest? Select "Other (Custom)" to enter your own specific area of research!
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};
