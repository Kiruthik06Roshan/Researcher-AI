import React, { useState } from 'react';
import { Sparkles, ArrowRight, BookOpen, Star, Zap, HelpCircle, Lightbulb, Target, CheckCircle, AlertCircle, TrendingUp, RefreshCw, Eye, X } from 'lucide-react';

// Enhanced dropdown options with more variety
const INTERESTS = [
    'Artificial Intelligence & Machine Learning',
    'Web Development',
    'Cybersecurity',
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

const DOMAIN_DATA = {
    'Artificial Intelligence & Machine Learning': [
        {
            name: 'Time Series Forecasting',
            description: 'Analyze historical patterns to predict future trends in sequential data like stocks, weather, or energy consumption.',
            skills: ['Python', 'Statistics', 'Pandas', 'ARIMA/LSTM'],
            projects: [
                { name: 'Stock Market Trend Predictor', description: 'Predict price movements using historical data.', skills: ['Python', 'Pandas', 'Statsmodels'] },
                { name: 'Energy Consumption Forecast', description: 'Analyze power usage patterns for urban planning.', skills: ['Python', 'Matplotlib', 'LSTM'] }
            ]
        },
        {
            name: 'Anomaly Detection',
            description: 'Identify unusual patterns that do not conform to expected behavior, critical for fraud detection and system health.',
            skills: ['Machine Learning', 'Data Cleaning', 'Scikit-learn', 'PyOD'],
            projects: [
                { name: 'Credit Card Fraud Detector', description: 'Spot fraudulent transactions in real-time.', skills: ['Scikit-learn', 'Imbalanced Data', 'Logistical Regression'] },
                { name: 'Server Health Monitor', description: 'Identify unusual server behavior before failures occur.', skills: ['Anomaly Detection', 'Grafana', 'ElasticSearch'] }
            ]
        },
        {
            name: 'Predictive Modeling',
            description: 'Build mathematical models to predict outcomes based on diverse input variables and historical relationships.',
            skills: ['Regressions', 'Decision Trees', 'Feature Engineering', 'XGBoost'],
            projects: [
                { name: 'Housing Price Estimator', description: 'Predict real estate values based on local features.', skills: ['Regression', 'NumPy', 'Visualization'] },
                { name: 'Patient Outcome Predictor', description: 'Estimate recovery times based on clinical data.', skills: ['Health Informatics', 'XGBoost', 'Feature Engineering'] }
            ]
        }
    ],
    'Web Development': [
        {
            name: 'Frontend Architecture',
            description: 'Design and build scalable, performant user interfaces using modern frameworks and design patterns.',
            skills: ['React', 'Next.js', 'TypeScript', 'Performance Optimization'],
            projects: [
                { name: 'Component Library Creator', description: 'Build a reusable UI system for large-scale apps.', skills: ['Storybook', 'Tailwind', 'Accessibility'] },
                { name: 'SaaS Dashboard', description: 'Build a complex data-driven admin panel.', skills: ['React Query', 'Charts.js', 'Dynamic Layouts'] }
            ]
        },
        {
            name: 'Backend Scalability',
            description: 'Develop robust server-side systems capable of handling millions of requests and massive data sets.',
            skills: ['Node.js', 'Go', 'Microservices', 'Redis'],
            projects: [
                { name: 'Real-time Chat Engine', description: 'Build a low-latency messaging system.', skills: ['WebSockets', 'Socket.io', 'Redis'] },
                { name: 'High-Throughput API', description: 'Optimize REST/GraphQL endpoints for scale.', skills: ['Load Balancing', 'Caching', 'Database Indexing'] }
            ]
        },
        {
            name: 'State Management',
            description: 'Master complex data flows and synchronization across large distributed web applications.',
            skills: ['Redux', 'Zustand', 'Context API', 'Server State'],
            projects: [
                { name: 'E-commerce Cart Logic', description: 'Handle complex persistent state across sessions.', skills: ['Redux Toolkit', 'Local Storage', 'Synching'] },
                { name: 'Collaborative Editor', description: 'Manage real-time state sync between multiple users.', skills: ['Yjs', 'CRDTs', 'State Machines'] }
            ]
        }
    ],
    'Cybersecurity': [
        {
            name: 'Network Defense',
            description: 'Protect institutional computer networks from unauthorized access and malicious activity.',
            skills: ['Networking', 'Firewalls', 'IDS/IPS', 'Wireshark'],
            projects: [
                { name: 'Intrusion Detection System', description: 'Build a tool to flag suspicious network traffic.', skills: ['Python', 'Packet Analysis', 'Snort'] },
                { name: 'VPN Gateway Architect', description: 'Secure remote access points for distributed teams.', skills: ['OpenVPN', 'Encryption', 'Routing'] }
            ]
        },
        {
            name: 'Cryptography',
            description: 'Master the mathematical foundations and practical implementations of secure communication.',
            skills: ['RSA/AES', 'Hashing', 'Zero-Knowledge Proofs', 'Blockchain'],
            projects: [
                { name: 'Secure File Vault', description: 'Build an end-to-end encrypted storage solution.', skills: ['Web Crypto API', 'Key Management', 'Salting'] },
                { name: 'Digital Signature Tool', description: 'Verify document authenticity using public-key crypto.', skills: ['OpenSSL', 'X.509', 'PKI'] }
            ]
        },
        {
            name: 'Ethical Hacking',
            description: 'Proactively identify and patch vulnerabilities by thinking like an adversary.',
            skills: ['Metasploit', 'SQL Injection', 'Penetration Testing', 'Nmap'],
            projects: [
                { name: 'Vulnerability Scanner', description: 'Automate security checks on web applications.', skills: ['OWASP Zap', 'Python', 'Scripting'] },
                { name: 'Bug Bounty Toolkit', description: 'Assemble a set of tools for systematic exploit hunting.', skills: ['Burp Suite', 'Fuzzing', 'Social Engineering'] }
            ]
        }
    ]
};

const DEFAULT_PATHWAYS = [
    {
        name: 'General Data Analysis',
        description: 'Explore and visualize data to uncover insights and drive decision making.',
        skills: ['Python', 'SQL', 'Tableau/PowerBI', 'Statistics'],
        projects: [
            { name: 'Public Dataset Explorer', description: 'Uncover trends in open health or climate data.', skills: ['Pandas', 'Plotly', 'Data Cleaning'] },
            { name: 'Survey Result Analyzer', description: 'Extract meaningful conclusions from large scale feedback.', skills: ['SciPy', 'Qualitative Analysis', 'Matplotlib'] }
        ]
    },
    {
        name: 'Technical Research',
        description: 'Deep dive into emerging technologies and their societal or industrial impact.',
        skills: ['Literature Review', 'Comparative Analysis', 'Writing', 'Prototyping'],
        projects: [
            { name: 'Ethics in Tech Paper', description: 'Analyze the impact of AI on privacy or labor.', skills: ['Critical Thinking', 'Research Bias', 'Citations'] },
            { name: 'Next-Gen Tech Survey', description: 'Compare competing technologies in a specific niche.', skills: ['Taxonomy', 'Market Analysis', 'Synthesis'] }
        ]
    },
    {
        name: 'Innovation & Design',
        description: 'Apply human-centered design principles to solve complex technological problems.',
        skills: ['UI/UX', 'Prototyping', 'User Interviews', 'Figma'],
        projects: [
            { name: 'Accessibility Audit', description: 'Redesign a service to be usable by everyone.', skills: ['WCAG', 'User Testing', 'Inclusivity'] },
            { name: 'IoT Prototype Design', description: 'Conceptualize a physical-digital solution for community issues.', skills: ['Sketching', 'User Journeys', 'Constraints'] }
        ]
    }
];

const CORE_PROJECTS = [
    {
        name: 'Sentiment Analysis Bot',
        description: 'Classify the emotional tone of text data to understand public opinion or customer feedback.',
        skills: ['Python', 'NLP', 'NLTK', 'TextBlob']
    },
    {
        name: 'Plant Disease Classifier',
        description: 'Use image recognition to identify diseases in crops from smartphone photos.',
        skills: ['Computer Vision', 'PyTorch/TensorFlow', 'Image Processing']
    },
    {
        name: 'Traffic Flow Optimizer',
        description: 'Analyze and predict traffic congestion to suggest optimal signal timings or routes.',
        skills: ['Simulation', 'Graph Theory', 'Data Analysis']
    },
    {
        name: 'Personalized Movie Recommender',
        description: 'Build a recommendation engine based on user preferences and viewing history.',
        skills: ['Collaborative Filtering', 'Pandas', 'Matrix Factorization']
    },
    {
        name: 'Autonomous Drone Pathfinding',
        description: 'Simulate pathfinding algorithms for drones navigating complex 3D environments.',
        skills: ['Algorithms', 'Geometry', 'Physics Simulation']
    },
    {
        name: 'Air Quality Impact Study',
        description: 'Analyze correlation between industrial activity and local air quality indices.',
        skills: ['Data Visualization', 'Environmental Science', 'Statistics']
    }
];

export const BeginnerMode = ({ gemini, onBack }) => {
    const [step, setStep] = useState('input'); // input | loading | dashboard | roadmap-loading | roadmap
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProject, setModalProject] = useState(null);

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
            setStep('dashboard');
        } catch (e) {
            console.error(e);
            setStep('dashboard'); // Fallback to dashboard for consistency
        }
    };

    const handleViewProject = (project) => {
        setModalProject(project);
        setIsModalOpen(true);
    };

    const handleProjectSelect = async (project) => {
        setIsModalOpen(false);
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
            setStep('dashboard');
        }
    };

    const handleSwitchProject = () => {
        setSelectedProject(null);
        setRoadmap(null);
        setStep('dashboard');
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

    // DASHBOARD (FLAT ARCHITECTURE)
    if (step === 'dashboard') {
        const displayInterest = isCustomInterest ? formData.customInterest : formData.interest;

        // 1. DYNAMIC PATHWAYS: Use AI results if available, otherwise fallback to hardcoded data
        const currentPathways = results?.domains?.map(d => ({
            name: d.name,
            description: d.description,
            projects: (d.directions || []).map(dir => ({
                name: dir,
                description: `A specialized research project focused on ${dir} within the ${d.name} domain.`,
                skills: d.skills || []
            }))
        })) || DOMAIN_DATA[displayInterest] || DEFAULT_PATHWAYS;

        // 2. DYNAMIC CORE LIBRARY: Extract all "directions" from the AI results to fill the 6 slots
        const dynamicCoreProjects = results?.domains?.flatMap(domain =>
            (domain.directions || []).map(direction => ({
                name: direction,
                description: `A specialized beginner project in the field of ${domain.name} focusing on ${direction}.`,
                skills: domain.skills || []
            }))
        ).slice(0, 6) || CORE_PROJECTS;

        return (
            <div className="dashboard-bg">
                <style>{`
                    .dashboard-bg {
                        background: radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0A0A0B 100%);
                        min-height: 100vh;
                        padding: 40px 24px;
                        color: var(--text-primary);
                    }
                    .glass-card {
                        background: rgba(255, 255, 255, 0.03);
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 16px;
                        padding: 24px;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }
                    .glass-card:hover {
                        border-color: rgba(0, 242, 255, 0.4);
                        box-shadow: 0 0 20px rgba(0, 242, 255, 0.15);
                        transform: translateY(-4px);
                    }
                    .badge-gold {
                        display: flex;
                        align-items: center;
                        gap: 4px;
                        background: rgba(255, 215, 0, 0.1);
                        color: #FFD700;
                        padding: 4px 10px;
                        border-radius: 8px;
                        font-size: 0.75rem;
                        font-weight: 600;
                    }
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        background: rgba(0, 0, 0, 0.8);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 1000;
                        backdrop-filter: blur(8px);
                    }
                    .glass-modal {
                        background: rgba(10, 10, 11, 0.9);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        max-width: 600px;
                        width: 90%;
                        padding: 40px;
                        border-radius: 24px;
                        position: relative;
                        box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
                    }
                    .pill-badge {
                        background: rgba(0, 242, 255, 0.1);
                        color: var(--primary-neon);
                        padding: 6px 14px;
                        border-radius: 20px;
                        font-size: 0.85rem;
                        border: 1px solid rgba(0, 242, 255, 0.2);
                    }
                    .section-header {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        margin-bottom: 24px;
                        font-size: 1.5rem;
                    }
                    .card-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 12px;
                    }
                    .card-header h3 {
                        font-size: 1.1rem;
                        max-width: 80%;
                    }
                    .card-desc {
                        color: var(--text-muted);
                        font-size: 0.85rem;
                        line-height: 1.5;
                        margin-bottom: 20px;
                    }
                `}</style>

                <div className="container">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <button onClick={handleStartOver} className="btn-secondary" style={{ marginBottom: '16px' }}>
                                &larr; Back to Search
                            </button>
                            <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>Research Dashboard</h1>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Primary Pathways for <b>{displayInterest}</b>
                            </p>
                        </div>
                        <div className="glass-panel" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="badge-gold">
                                <Star size={14} fill="#FFD700" />
                                <span>Beginner Tier</span>
                            </div>
                        </div>
                    </div>

                    {/* Section A: Primary Research Pathways */}
                    <div style={{ marginBottom: '60px' }}>
                        <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Zap color="var(--primary-neon)" /> Primary Research Pathways
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {currentPathways.map((path, idx) => (
                                <div key={idx} className="glass-card">
                                    <h3 style={{ color: 'var(--primary-neon)', marginBottom: '12px' }}>{path.name}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>{path.description}</p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {(path.projects || []).map((proj, pIdx) => (
                                            <div key={pIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                                <span style={{ fontSize: '0.9rem' }}>{proj.name}</span>
                                                <button
                                                    onClick={() => handleViewProject(proj)}
                                                    style={{ background: 'none', border: 'none', color: 'var(--primary-neon)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                >
                                                    <Eye size={16} /> View
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section B: Core Project Library */}
                    <div>
                        <h2 className="section-header">
                            <BookOpen color="var(--secondary-neon)" /> Core Project Library
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {dynamicCoreProjects.map((project, idx) => (
                                <div key={idx} className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div>
                                        <div className="card-header">
                                            <h3>{project.name}</h3>
                                            <div className="badge-gold">
                                                <Star size={10} fill="#FFD700" />
                                            </div>
                                        </div>
                                        <p className="card-desc">
                                            {project.description.length > 80 ? project.description.substring(0, 80) + '...' : project.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleViewProject(project)}
                                        className="btn-secondary"
                                        style={{ marginTop: 'auto', width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <Eye size={16} /> View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MODAL */}
                {isModalOpen && modalProject && (
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                        <div className="glass-modal" onClick={e => e.stopPropagation()}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>

                            <div style={{ marginBottom: '32px' }}>
                                <div className="badge-gold" style={{ width: 'fit-content', marginBottom: '12px' }}>
                                    <Star size={14} fill="#FFD700" />
                                    <span>Beginner Friendly Project</span>
                                </div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>{modalProject.name}</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7' }}>
                                    {modalProject.description}
                                </p>
                            </div>

                            <div style={{ marginBottom: '40px' }}>
                                <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Required Skills</h4>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    {(modalProject.skills || []).map((skill, sIdx) => (
                                        <span key={sIdx} className="pill-badge">{skill}</span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => handleProjectSelect(modalProject)}
                                className="btn-primary"
                                style={{ width: '100%', padding: '18px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                            >
                                <ArrowRight size={20} />
                                Get My Research Roadmap
                            </button>
                        </div>
                    </div>
                )}
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
