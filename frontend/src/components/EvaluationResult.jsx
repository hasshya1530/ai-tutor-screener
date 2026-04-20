export default function EvaluationResult({ result }) {
    const { evaluation, transcript, question } = result
    const verdictConfig = {
        Shortlisted: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', emoji: '🏆' },
        Maybe: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', emoji: '🤔' },
        Rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', emoji: '❌' },
        Error: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', emoji: '⚠️' },
    }
    const ratingColor = { Poor: '#ef4444', Fair: '#f59e0b', Good: '#22c55e', Excellent: '#818cf8' }
    const verdict = verdictConfig[evaluation.verdict] || verdictConfig.Error
    const scorePercent = (evaluation.score / 10) * 100

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                Step 3 — Your Results
            </h2>

            {/* Error */}
            {evaluation.error && (
                <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, marginBottom: '1rem', color: '#fca5a5', fontSize: '0.9rem' }}>
                    ⚠️ {evaluation.error}
                </div>
            )}

            {/* Score + Verdict Hero */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'
            }}>
                {/* Score */}
                <div style={{
                    padding: '1.5rem', borderRadius: 16, textAlign: 'center',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)'
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: 1, marginBottom: '0.5rem' }}>SCORE</div>
                    <div style={{ fontSize: '3rem', fontWeight: 800, background: 'linear-gradient(135deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {evaluation.score}<span style={{ fontSize: '1.2rem', color: '#64748b', WebkitTextFillColor: '#64748b' }}>/10</span>
                    </div>
                    {/* Score bar */}
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, marginTop: '1rem', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%', width: `${scorePercent}%`,
                            background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                            borderRadius: 3, transition: 'width 1s ease'
                        }} />
                    </div>
                </div>

                {/* Verdict */}
                <div style={{
                    padding: '1.5rem', borderRadius: 16, textAlign: 'center',
                    background: verdict.bg, border: `1px solid ${verdict.border}`
                }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, letterSpacing: 1, marginBottom: '0.5rem' }}>VERDICT</div>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>{verdict.emoji}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: verdict.color }}>{evaluation.verdict}</div>
                </div>
            </div>

            {/* Ratings */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem'
            }}>
                {[
                    { label: 'Subject Knowledge', value: evaluation.subject_knowledge },
                    { label: 'Communication', value: evaluation.communication_clarity },
                    { label: 'Teaching Approach', value: evaluation.teaching_approach },
                ].map(({ label, value }) => (
                    <div key={label} style={{
                        padding: '1rem', borderRadius: 12, textAlign: 'center',
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)'
                    }}>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>{label.toUpperCase()}</div>
                        <div style={{ fontWeight: 700, color: ratingColor[value] || '#94a3b8', fontSize: '1rem' }}>{value}</div>
                    </div>
                ))}
            </div>

            {/* Strengths & Improvements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ padding: '1.2rem', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', marginBottom: '0.5rem' }}>✅ STRENGTH</div>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>{evaluation.strengths}</p>
                </div>
                <div style={{ padding: '1.2rem', borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem' }}>📈 IMPROVE</div>
                    <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>{evaluation.improvements}</p>
                </div>
            </div>

            {/* Transcript */}
            {transcript && (
                <div style={{ padding: '1.2rem', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>📝 YOUR ANSWER</div>
                    <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.6, fontStyle: 'italic' }}>"{transcript}"</p>
                </div>
            )}
        </div>
    )
}