import React from 'react';

// Color Palette for Analysis
const COLORS = {
    bg: 'rgba(17, 24, 39, 0.8)', // Dark Slate
    border: 'rgba(255, 255, 255, 0.08)',
    textMain: '#f3f4f6', // Bright Gray
    textMuted: '#9ca3af', // Cool Gray
    primary: '#818cf8', // Indigo
    accent: '#a78bfa', // Violet
    good: '#10b981', // Emerald
    fair: '#f59e0b', // Amber
    poor: '#ef4444' // Red
};

// Map metric keys to readable labels and icons
const METRIC_CONFIG = {
    simplicity: { label: 'Simplicity', icon: '💡' },
    warmth: { label: 'Warmth', icon: '☀️' },
    patience: { label: 'Patience', icon: '⏳' },
    clarity: { label: 'Clarity', icon: '📢' },
};

export default function EvaluationResult({ result }) {
    // Destructure the new analytical schema from backend/evaluator.py
    const { score, metrics, evidence_quotes, strengths, improvements, verdict } = result.evaluation;

    const getStatusColor = (v) => {
        if (v === 'Shortlisted') return COLORS.good;
        if (v === 'Maybe') return COLORS.fair;
        return COLORS.poor;
    };

    const getMetricColor = (val) => {
        if (val >= 8) return COLORS.good;
        if (val >= 5) return COLORS.fair;
        return COLORS.poor;
    };

    return (
        <div style={{
            marginTop: '2.5rem',
            padding: '2rem',
            background: COLORS.bg,
            borderRadius: '20px',
            border: `1px solid ${getStatusColor(verdict)}33`,
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)',
            color: COLORS.textMain,
            fontFamily: 'Inter, sans-serif'
        }}>

            {/* ── HEADER & VERDICT ── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Tutor Readiness Report</h2>
                    <p style={{ margin: '0.2rem 0 0', color: COLORS.textMuted, fontSize: '0.9rem' }}>Comprehensive pedagogical analysis by AI</p>
                </div>
                <div style={{
                    padding: '0.6rem 1.2rem',
                    borderRadius: '50px',
                    background: `${getStatusColor(verdict)}15`,
                    color: getStatusColor(verdict),
                    fontWeight: 700,
                    border: `1px solid ${getStatusColor(verdict)}44`,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.8rem',
                    boxShadow: `0 0 10px ${getStatusColor(verdict)}22`
                }}>
                    {verdict}
                </div>
            </div>

            {/* ── ANALYTICAL METRICS GRID ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem'
            }}>
                {Object.entries(metrics).map(([key, val]) => {
                    const config = METRIC_CONFIG[key] || { label: key.toUpperCase(), icon: '📊' };
                    return (
                        <div key={key} style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: '16px',
                            padding: '1.25rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'all 0.3s ease'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{config.icon}</div>
                            <div style={{
                                fontSize: '0.7rem',
                                color: COLORS.textMuted,
                                textTransform: 'uppercase',
                                letterSpacing: '1.5px',
                                fontWeight: 600,
                                marginBottom: '0.5rem'
                            }}>
                                {config.label}
                            </div>
                            <div style={{
                                fontSize: '2rem',
                                fontWeight: 800,
                                color: getMetricColor(val),
                                textShadow: `0 0 10px ${getMetricColor(val)}33`
                            }}>
                                {val}<span style={{ fontSize: '1rem', color: COLORS.textMuted, fontWeight: 500 }}>/10</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <hr style={{ border: 'none', borderTop: `1px solid ${COLORS.border}`, margin: '2rem 0' }} />

            {/* ── QUALITATIVE FEEDBACK ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                    <h4 style={{ color: COLORS.good, marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700 }}>🌟 Key Pedagogical Strengths</h4>
                    <p style={{ color: COLORS.textMain, fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{strengths}</p>
                </div>

                <div style={{ background: 'rgba(239, 68, 68, 0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <h4 style={{ color: '#f87171', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: 700 }}>🛠️ Recommendations for Improvement</h4>
                    <p style={{ color: COLORS.textMain, fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{improvements}</p>
                </div>
            </div>

            {/* ── EVIDENCE ANALYSIS ── */}
            {evidence_quotes && evidence_quotes.length > 0 && (
                <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: `1px solid ${COLORS.border}`
                }}>
                    <h4 style={{ color: COLORS.primary, marginBottom: '1.25rem', fontSize: '1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>💬 Evidence & Transcript Analysis</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {evidence_quotes.map((quote, i) => (
                            <div key={i} style={{
                                fontStyle: 'italic',
                                color: COLORS.textMuted,
                                padding: '1rem 1.2rem',
                                background: 'rgba(79, 70, 229, 0.04)',
                                borderRadius: '12px',
                                borderLeft: `4px solid ${COLORS.primary}`,
                                fontSize: '0.9rem',
                                lineHeight: '1.5'
                            }}>
                                "{quote}"
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: COLORS.textMuted, marginTop: '1rem', textAlign: 'center' }}>
                        Quotes extracted directly from the candidate transcript to support dimension scores.
                    </p>
                </div>
            )}
        </div>
    );
}