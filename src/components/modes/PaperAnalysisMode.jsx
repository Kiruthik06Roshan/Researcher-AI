import React, { useState } from 'react';
import { readPdfText } from '../../utils/pdfLoader';
import { Upload, FileText, CheckCircle, Loader2, AlertTriangle, Map, Zap } from 'lucide-react';

export const PaperAnalysisMode = ({ gemini, onBack }) => {
    const [files, setFiles] = useState([]);
    const [status, setStatus] = useState('upload'); // upload | processing | results
    const [logs, setLogs] = useState([]);
    const [finalResult, setFinalResult] = useState(null);

    const addLog = (msg) => setLogs(prev => [...prev, msg]);

    const handleFileUpload = (e) => {
        const uploaded = Array.from(e.target.files);
        setFiles(prev => [...prev, ...uploaded]);
    };

    const startAnalysis = async () => {
        if (files.length < 2) return alert("Please upload at least 2 papers for comparison.");

        setStatus('processing');
        setLogs([]);
        addLog("Initializing Research Engine...");

        try {
            // Step 1: Analyze each paper
            const paperAnalyses = [];
            for (const file of files) {
                addLog(`Reading content: ${file.name}...`);
                const text = await readPdfText(file);

                addLog(`Analyzing structure & claims: ${file.name}...`);
                const analysis = await gemini.analyzePaper(text, file.name);
                paperAnalyses.push(analysis);
                addLog(`Analysis complete: ${file.name} `);
            }

            // Step 2: Synthesize
            addLog("Detecting cross-paper conflicts...");
            addLog("Identifying common assumptions...");
            addLog("Synthesizing research directions...");

            const synthesis = await gemini.synthesizeResearch(paperAnalyses);

            setFinalResult({ papers: paperAnalyses, ...synthesis });
            setStatus('results');
        } catch (e) {
            console.error("Full error:", e);
            addLog(`ERROR: ${e.message || e.toString()}`);
            alert(`Analysis Failed: ${e.message || "Unknown error"}. Check console for details.`);
            setStatus('upload');
        }
    };

    if (status === 'processing') {
        return (
            <div className="container" style={{ marginTop: '60px', maxWidth: '800px', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '32px' }}>AI Research Engine Active</h2>
                <div className="glass-panel" style={{ padding: '32px', textAlign: 'left', minHeight: '300px', fontFamily: 'monospace' }}>
                    {logs.map((log, i) => (
                        <div key={i} style={{ marginBottom: '8px', color: log.includes('ERROR') ? 'red' : 'var(--primary-neon)' }}>
                            &gt; {log}
                        </div>
                    ))}
                    <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <Loader2 className="spin" size={16} /> Processing...
                    </div>
                </div>
                <style>{`.spin { animation: spin 2s linear infinite; } `}</style>
            </div>
        );
    }

    if (status === 'results' && finalResult) {
        return (
            <div className="container" style={{ marginTop: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <button onClick={() => setStatus('upload')} className="btn-secondary">&larr; New Analysis</button>
                    <h1>Analysis Report</h1>
                </div>

                {/* 1. Individual Paper Analysis Details */}
                <h2 style={{ marginBottom: '24px' }}>Detailed Paper Analysis</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '60px' }}>
                    {finalResult.papers.map((p, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--primary-neon)' }}>{p.filename}</h3>
                            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                <strong>Type:</strong> {p.type}
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '8px' }}>Author Claims</h4>
                                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {p.claims?.author_claims?.slice(0, 3).map((c, j) => (
                                        <li key={j} style={{ marginBottom: '12px' }}>
                                            <div>{typeof c === 'string' ? c : c.claim}</div>
                                            {typeof c === 'object' && c.evidence && (
                                                <div style={{
                                                    fontSize: '0.8rem',
                                                    color: 'var(--primary-neon)',
                                                    marginTop: '6px',
                                                    paddingLeft: '12px',
                                                    borderLeft: '2px solid var(--primary-neon)',
                                                    fontStyle: 'italic'
                                                }}>
                                                    📍 {c.evidence}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '8px' }}>Limitations</h4>
                                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                    {p.limitations?.map((l, k) => (
                                        <li key={k} style={{ marginBottom: '12px' }}>
                                            <span style={{ color: 'var(--secondary-neon)', fontWeight: 'bold' }}>{l.cause}:</span> {l.impact}
                                            {l.evidence && (
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: 'var(--primary-neon)',
                                                    marginTop: '6px',
                                                    paddingLeft: '12px',
                                                    borderLeft: '2px solid var(--primary-neon)',
                                                    fontStyle: 'italic'
                                                }}>
                                                    📍 {l.evidence}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 2. Synthesis: Conflicts & Assumptions */}
                <h2 style={{ marginBottom: '24px' }}>Synthesis & Gaps</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                    <div className="glass-panel" style={{ padding: '24px', borderColor: 'rgba(189, 0, 255, 0.3)' }}>
                        <h3 style={{ color: 'var(--secondary-neon)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <AlertTriangle size={20} /> Detected Conflicts
                        </h3>
                        <ul style={{ paddingLeft: '20px', marginTop: '16px' }}>
                            {finalResult.conflicts.map((c, i) => <li key={i} style={{ marginBottom: '8px' }}>{c}</li>)}
                        </ul>
                    </div>

                    <div className="glass-panel" style={{ padding: '24px', borderColor: 'rgba(0, 242, 255, 0.3)' }}>
                        <h3 style={{ color: 'var(--primary-neon)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CheckCircle size={20} /> Common Assumptions
                        </h3>
                        <ul style={{ paddingLeft: '20px', marginTop: '16px' }}>
                            {finalResult.common_assumptions.map((c, i) => <li key={i} style={{ marginBottom: '8px' }}>{c}</li>)}
                        </ul>
                    </div>
                </div>

                {/* 3. Research Gap */}
                <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px', background: 'linear-gradient(180deg, rgba(20,20,30,0.8) 0%, rgba(30,30,50,0.8) 100%)' }}>
                    <h2 style={{ marginBottom: '16px' }}>Identified Research Gap</h2>
                    <p style={{ fontSize: '1.2rem', lineHeight: '1.6' }}>{finalResult.gap}</p>
                </div>

                {/* 4. Directions */}
                <h2 style={{ marginBottom: '24px' }}>Recommended Directions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '60px' }}>
                    {finalResult.directions?.map((dir, i) => (
                        <div key={i} className="glass-panel" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <h3 style={{ fontSize: '1.3rem' }}>{dir.title}</h3>
                                <span style={{
                                    background: dir.difficulty === 'Beginning' ? 'rgba(0,255,0,0.1)' : 'rgba(255,100,0,0.1)',
                                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.8rem'
                                }}>{dir.difficulty}</span>
                            </div>
                            <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>{dir.value}</p>
                        </div>
                    ))}
                </div>

                {/* 5. Roadmap */}
                <div className="glass-panel" style={{ padding: '40px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--primary-neon)' }}>
                        <Map /> Research Roadmap: {finalResult.roadmap.title}
                    </h2>

                    <div style={{ marginTop: '32px' }}>
                        {finalResult.roadmap.steps.map((step, i) => (
                            <div key={i} style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-neon)', color: '#000',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0
                                }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Phase {i + 1}</h4>
                                    <p>{step}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(255,0,0,0.1)', borderRadius: '12px' }}>
                        <h4>Expected Challenges</h4>
                        <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
                            {finalResult.roadmap.challenges.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                    </div>
                </div>

                <div style={{ marginTop: '60px', padding: '32px', background: 'var(--bg-space-light)', borderRadius: '16px' }}>
                    <h3>Next Suggested Action</h3>
                    <p style={{ marginTop: '8px', color: 'var(--text-secondary)' }}>
                        Download the referenced papers for the "Common Assumptions" and verify if they hold true for your specific environment constraints.
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

            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '24px' }}>Upload Your Papers</h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
                    Select 2-3 PDF research papers to identify gaps, conflicts, and new directions.
                </p>

                <div style={{
                    border: '2px dashed var(--border-glass)', borderRadius: '16px', padding: '60px',
                    cursor: 'pointer', transition: '0.3s'
                }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-neon)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                    onClick={() => document.getElementById('fileInput').click()}
                >
                    <Upload size={48} color="var(--primary-neon)" style={{ marginBottom: '16px' }} />
                    <h3>Click to Upload PDFs</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{files.length > 0 ? `${files.length} files selected` : "Drag files here or click"}</p>
                </div>
                <input id="fileInput" type="file" multiple accept=".pdf" style={{ display: 'none' }} onChange={handleFileUpload} />

                {files.length > 0 && (
                    <div style={{ marginTop: '24px', textAlign: 'left' }}>
                        <h4 style={{ marginBottom: '12px' }}>Selected Files:</h4>
                        {files.map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', background: 'var(--bg-space-light)', borderRadius: '8px', marginBottom: '8px' }}>
                                <FileText size={16} /> {f.name}
                            </div>
                        ))}

                        <button className="btn-primary" style={{ width: '100%', marginTop: '24px' }} onClick={startAnalysis}>
                            <Zap style={{ marginRight: '8px' }} /> Analyze & Find Gaps
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
