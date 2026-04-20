import React from 'react';

// Color Palette for Analysis
const COLORS = {
    bg: 'rgba(17, 24, 39, 0.9)',
    border: 'rgba(255, 255, 255, 0.08)',
    textMain: '#f3f4f6',
    textMuted: '#9ca3af',
    primary: '#818cf8',
    accent: '#a78bfa',
    good: '#10b981',
    fair: '#f59e0b',
    poor: '#ef4444'
};

const METRIC_CONFIG = {
    simplicity: { label: 'Simplicity', icon: '💡' },
    warmth: { label: 'Warmth', icon: '☀️' },
    patience: { label: 'Patience', icon: '⏳' },
    clarity: { label: 'Clarity', icon: '📢' },
};

export default function EvaluationResult({ result }) {
    // Destructure base evaluation and the new 1% polish fields
    const { evaluation, next_step, tone_analysis } = result;
    const { metrics, evidence_quotes, strengths, improvements, verdict } = evaluation;

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
            borderRadius: '24px',
            border: `1px solid ${getStatusColor(verdict)}44`,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            color: COLORS.textMain,
            fontFamily: 'Inter, sans-serif',
            backdropFilter: 'blur(12px)'
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
                    border: `1px solid ${getStatusColor(verdict)}66`,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontSize: '0.8rem'
                }}>
                    {verdict}
                </div>
            </div>

            {/* ── STRATEGIC INSIGHTS (The Final 1%) ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(129, 140, 248, 0.1), rgba(167, 139, 250, 0.05))',
                    border: '1px dashed rgba(129, 140, 248, 0.3)'
                }}>
                    <div style={{ fontSize: '0.7rem', color: COLORS.accent, fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        🤖 Recommended Follow-up
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff', fontStyle: 'italic' }}>
                        "{next_step}"
                    </p>
                </div>
                <div style={{
                    padding: '1rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))',
                    border: '1px dashed rgba(16, 185, 129, 0.3)'
                }}>
                    <div style={{ fontSize: '0.7rem', color: COLORS.good, fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        🎤 Tone & Sentiment Analysis
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#fff' }}>
                        {tone_analysis}
                    </p>
                </div>
            </div>

            {/* ── ANALYTICAL METRICS GRID ── */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {Object.entries(metrics).map(([key, val]) => {
                    const config = METRIC_CONFIG[key] || { label: key.toUpperCase(), icon: '📊' };
                    return (
                        <div key={key} style={{
                            background: 'rgba(255,255,255,0.03)',
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: '16px',
                            padding: '1.25rem',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.4rem', marginBottom: '0.4rem' }}>{config.icon}</div>
                            <div style={{ fontSize: '0.65rem', color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                {config.label}
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: getMetricColor(val) }}>
                                {val}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── QUALITATIVE FEEDBACK ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(34, 197, 94, 0.04)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                    <h4 style={{ color: COLORS.good, marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>🌟 Key Strengths</h4>
                    <p style={{ color: COLORS.textMain, fontSize: '0.9rem', lineHeight: '1.5' }}>{strengths}</p>
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.04)', padding: '1.2rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                    <h4 style={{ color: '#f87171', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 700 }}>🛠️ Improvements</h4>
                    <p style={{ color: COLORS.textMain, fontSize: '0.9rem', lineHeight: '1.5' }}>{improvements}</p>
                </div>
            </div>

            {/* ── EVIDENCE ANALYSIS ── */}
            {evidence_quotes && evidence_quotes.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${COLORS.border}` }}>
                    <h4 style={{ color: COLORS.primary, marginBottom: '1rem', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase' }}>💬 Evidence Quotes</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {evidence_quotes.map((quote, i) => (
                            <div key={i} style={{
                                fontStyle: 'italic',
                                color: COLORS.textMuted,
                                paddingLeft: '1rem',
                                borderLeft: `3px solid ${COLORS.primary}`,
                                fontSize: '0.85rem'
                            }}>
                                "{quote}"
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}