import React, { useState } from 'react';
import { readPdfText } from '../../utils/pdfLoader';
import { ArrowLeft, Upload, FileText, CheckCircle, AlertCircle, Download, FileType } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const JOURNALS = [
    { id: 'ieee', name: 'IEEE', description: 'Technical, two-column format, numbered citations [1].' },
    { id: 'acm', name: 'ACM', description: 'Computing research, numbered citations, clear sectioning.' },
    { id: 'nature', name: 'Nature', description: 'Scientific, multidisciplinary, methods at the end.' },
    { id: 'apa', name: 'APA', description: 'Social sciences, double-spaced, author-date citations.' },
    { id: 'springer', name: 'Springer', description: 'Computer science, single column, specific header styles.' }
];

export const PaperFormattingMode = ({ gemini, onBack }) => {
    const [step, setStep] = useState(1); // 1: Upload, 2: Select Journal, 3: Processing, 4: Result
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [error, setError] = useState(null);
    const [htmlOutput, setHtmlOutput] = useState('');

    const handleFileUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        if (uploadedFile.type !== 'application/pdf' && uploadedFile.type !== 'text/plain') {
            setError('Please upload a PDF or TXT file.');
            return;
        }

        setFile(uploadedFile);
        setError(null);
        
        try {
            let text = '';
            if (uploadedFile.type === 'application/pdf') {
                text = await readPdfText(uploadedFile);
            } else {
                text = await uploadedFile.text();
            }
            setFileContent(text);
            setStep(2);
        } catch (err) {
            console.error(err);
            setError('Failed to read file.');
        }
    };

    const handleFormat = async (journalId) => {
        const journal = JOURNALS.find(j => j.id === journalId);
        setSelectedJournal(journal);
        setStep(3);

        try {
            // Returns raw HTML string now
            const result = await gemini.formatPaper(fileContent, journal.name);
            setHtmlOutput(result);
            setStep(4);
        } catch (err) {
            console.error("Formatting error:", err);
            setError("Failed to format paper. Please try again.");
            setStep(2);
        }
    };

    const downloadPDF = () => {
        const element = document.getElementById('paper-preview');
        // Configure for better PDF rendering of the HTML
        const opt = {
            margin: [10, 10, 10, 10], // top, left, bottom, right
            filename: `${selectedJournal.id}_paper_formatted.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2, 
                useCORS: true,
                letterRendering: true 
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save();
    };

    return (
        <div className="mode-container slide-in">
            <button onClick={onBack} className="back-button">
                <ArrowLeft size={20} /> Back to Menu
            </button>

            <header className="mode-header">
                <h1>Paper Formatter</h1>
                <p>Upload your draft and let AI restructure it for your target journal.</p>
            </header>

            <div className="glass-panel" style={{ maxWidth: step === 4 ? '1200px' : '800px', margin: '0 auto', minHeight: '400px' }}>
                {step === 1 && (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <div style={{ 
                            border: '2px dashed var(--border-glass)', 
                            borderRadius: '16px', 
                            padding: '60px',
                            cursor: 'pointer',
                            position: 'relative'
                        }}>
                            <input 
                                type="file" 
                                onChange={handleFileUpload} 
                                accept=".pdf,.txt"
                                style={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    width: '100%', 
                                    height: '100%', 
                                    opacity: 0, 
                                    cursor: 'pointer' 
                                }} 
                            />
                            <Upload size={48} color="var(--primary-neon)" style={{ marginBottom: '16px' }} />
                            <h3>Drop your paper here</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Supports PDF or TXT</p>
                        </div>
                        {error && <div style={{ color: '#ff4444', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><AlertCircle size={16}/>{error}</div>}
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <h3 style={{ marginBottom: '24px' }}>Select Target Journal</h3>
                        <div className="grid-list">
                            {JOURNALS.map(journal => (
                                <div 
                                    key={journal.id} 
                                    className="list-item"
                                    onClick={() => handleFormat(journal.id)}
                                    style={{ cursor: 'pointer', padding: '20px', border: '1px solid var(--border-glass)', borderRadius: '12px', marginBottom: '12px' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <strong>{journal.name}</strong>
                                        <FileType size={20} color="var(--primary-neon)" />
                                    </div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{journal.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ textAlign: 'center', padding: '60px' }}>
                        <div className="loading-spinner" style={{ width: '48px', height: '48px', border: '4px solid var(--primary-neon)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 24px' }}></div>
                        <h3>Formatting for {selectedJournal?.name}...</h3>
                        <p>This may take a minute.</p>
                    </div>
                )}

                {step === 4 && htmlOutput && (
                    <div>
                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{display:'flex', alignItems: 'center', gap: '8px' }}>
                                <CheckCircle color="#0f0" /> Preview
                            </h3>
                            <button className="primary-button" onClick={downloadPDF}>
                                <Download size={16} /> Download PDF
                            </button>
                        </div>

                        {/* 
                            Paper Preview Area
                            We render the raw HTML from the API directly.
                            Ideally, we should sanitize this in a real production app.
                            For now, we trust the LLM output in this local tool context.
                        */}
                        <div 
                            id="paper-preview" 
                            className="paper-preview-container"
                            style={{ 
                                background: 'white', 
                                color: 'black', 
                                padding: '40px', 
                                borderRadius: '4px',
                                overflowX: 'hidden'
                            }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
