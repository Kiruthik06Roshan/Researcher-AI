import React, { useState } from 'react';
import { readPdfText } from '../../utils/pdfLoader';
import { Upload, FileText, Loader2, ArrowLeft, Compass, Target, Workflow, Calculator, Sparkles, BarChart3, Image, Link2, Key } from 'lucide-react';

export const PaperSummarizationMode = ({ gemini, onBack }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState(null);

    const handleFileUpload = (e) => {
        const uploadedFile = e.target.files[0];
        if (uploadedFile && uploadedFile.type === 'application/pdf') {
            setFile(uploadedFile);
            setError(null);
            setSummary(null);
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const generateSummary = async () => {
        if (!file) {
            setError('Please upload a PDF file first.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Read PDF text
            const text = await readPdfText(file);

            // Generate explanation using Gemini API
            const result = await gemini.summarizePaper(text, file.name);
            setSummary(result);
        } catch (err) {
            console.error('Explanation generation error:', err);
            setError(err.message || 'Failed to generate explanation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ marginTop: '40px', maxWidth: '900px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'transparent',
                        border: '1px solid var(--border-glass)',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: 'var(--text-primary)',
                        transition: '0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary-neon)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Compass size={32} color="#ff6b9d" />
                        Paper Explanation
                    </h1>
                    <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
                        Deep technical understanding without evaluation or critique
                    </p>
                </div>
            </div>

            {/* Upload Section */}
            {!summary && (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                    <Upload size={48} color="#ff6b9d" style={{ margin: '0 auto 24px' }} />
                    <h2 style={{ marginBottom: '16px' }}>Upload Your Research Paper</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                        Upload a PDF research paper to get a comprehensive, technical explanation
                    </p>

                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                        id="pdf-upload"
                    />
                    <label
                        htmlFor="pdf-upload"
                        style={{
                            display: 'inline-block',
                            padding: '12px 32px',
                            background: 'linear-gradient(135deg, #ff6b9d, #c44569)',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: '0.2s',
                            marginBottom: '16px'
                        }}
                    >
                        Choose PDF File
                    </label>

                    {file && (
                        <div style={{ marginTop: '24px' }}>
                            <div
                                className="glass-panel"
                                style={{
                                    padding: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: 'rgba(255, 107, 157, 0.1)',
                                    border: '1px solid rgba(255, 107, 157, 0.3)'
                                }}
                            >
                                <FileText size={24} color="#ff6b9d" />
                                <span style={{ flex: 1, textAlign: 'left' }}>{file.name}</span>
                            </div>

                            <button
                                onClick={generateSummary}
                                disabled={loading}
                                style={{
                                    marginTop: '24px',
                                    padding: '12px 48px',
                                    background: loading ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #ff6b9d, #c44569)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    margin: '24px auto 0'
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={20} className="spin" />
                                        Generating Explanation...
                                    </>
                                ) : (
                                    'Generate Explanation'
                                )}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div
                            style={{
                                marginTop: '24px',
                                padding: '16px',
                                background: 'rgba(255, 0, 0, 0.1)',
                                border: '1px solid rgba(255, 0, 0, 0.3)',
                                borderRadius: '8px',
                                color: '#ff6b6b'
                            }}
                        >
                            {error}
                        </div>
                    )}
                </div>
            )}

            {/* Explanation Display */}
            {summary && (
                <div style={{ marginBottom: '40px' }}>
                    {/* File Info */}
                    <div
                        className="glass-panel"
                        style={{
                            padding: '16px',
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FileText size={24} color="#ff6b9d" />
                            <span style={{ fontWeight: 600 }}>{summary.filename}</span>
                        </div>
                        <button
                            onClick={() => {
                                setSummary(null);
                                setFile(null);
                            }}
                            style={{
                                padding: '8px 16px',
                                background: 'transparent',
                                border: '1px solid var(--border-glass)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                color: 'var(--text-primary)',
                                transition: '0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#ff6b9d'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                        >
                            Explain Another Paper
                        </button>
                    </div>

                    {/* Section 1: Conceptual Orientation */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Compass size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>Conceptual Orientation</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                            {summary.conceptualOrientation}
                        </p>
                    </div>

                    {/* Section 2: Problem Definition */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Target size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>Problem Definition & Motivation</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                            {summary.problemDefinition}
                        </p>
                    </div>

                    {/* Section 3: Methodology */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Workflow size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>Methodology Explained Step-by-Step</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                            {summary.methodology}
                        </p>
                    </div>

                    {/* Section 4: Mathematical Formulation */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Calculator size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>Mathematical Formulation</h2>
                        </div>
                        <div style={{
                            color: 'var(--text-secondary)',
                            lineHeight: '1.8',
                            fontSize: '1.05rem',
                            whiteSpace: 'pre-line',
                            fontFamily: summary.mathematicalFormulation?.includes('No mathematical') ? 'inherit' : 'monospace, Consolas',
                            background: summary.mathematicalFormulation?.includes('No mathematical') ? 'transparent' : 'rgba(255, 107, 157, 0.05)',
                            padding: summary.mathematicalFormulation?.includes('No mathematical') ? '0' : '16px',
                            borderRadius: '8px'
                        }}>
                            {summary.mathematicalFormulation}
                        </div>
                    </div>

                    {/* Section 5: Novelty */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Sparkles size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>What Is Novel in This Work</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                            {summary.novelty}
                        </p>
                    </div>

                    {/* Section 6: Results */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <BarChart3 size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>Results & Observations Explained</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                            {summary.results}
                        </p>
                    </div>

                    {/* Section 7: Visual Interpretation */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Image size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>Visual Interpretation</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                            {summary.visualInterpretation}
                        </p>
                    </div>

                    {/* Section 8: End-to-End Summary */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Link2 size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>End-to-End Understanding Summary</h2>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                            {summary.endToEndSummary}
                        </p>
                    </div>

                    {/* Section 9: Key Takeaways */}
                    <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <Key size={28} color="#ff6b9d" />
                            <h2 style={{ margin: 0 }}>Key Takeaways for the Reader</h2>
                        </div>
                        <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', paddingLeft: '24px' }}>
                            {summary.keyTakeaways && summary.keyTakeaways.map((takeaway, index) => (
                                <li key={index} style={{ marginBottom: '12px' }}>{takeaway}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Info Note */}
                    <div
                        style={{
                            padding: '16px',
                            background: 'rgba(255, 107, 157, 0.1)',
                            border: '1px solid rgba(255, 107, 157, 0.3)',
                            borderRadius: '8px',
                            color: 'var(--text-secondary)',
                            fontSize: '0.95rem',
                            textAlign: 'center'
                        }}
                    >
                        💡 This is a deep explanation system. For critical evaluation, research gaps, and limitations analysis, use <strong>Paper Analysis Mode</strong>.
                    </div>
                </div>
            )}
        </div>
    );
};
