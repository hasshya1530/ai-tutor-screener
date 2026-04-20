import { useState } from 'react'

export default function TextAnswer({ onSubmit, loading }) {
    const [answer, setAnswer] = useState('')

    return (
        <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                Step 2 — Type Your Answer
            </h2>
            <textarea
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your answer to the selected question here. Be as detailed as possible — the AI evaluates depth, clarity, and teaching approach..."
                rows={6}
                style={{
                    width: '100%', padding: '1rem',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10, color: '#e2e8f0',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
                    lineHeight: 1.6, resize: 'vertical', outline: 'none',
                    transition: 'border 0.2s'
                }}
                onFocus={e => e.target.style.border = '1px solid rgba(79,70,229,0.6)'}
                onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: answer.length < 20 ? '#ef4444' : '#22c55e' }}>
                    {answer.length} characters {answer.length < 20 ? '(write more)' : '✓'}
                </span>
                <button
                    onClick={() => onSubmit(answer)}
                    disabled={loading || answer.length < 20}
                    style={{
                        padding: '0.75rem 2rem',
                        background: loading || answer.length < 20
                            ? 'rgba(79,70,229,0.3)'
                            : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        border: 'none', borderRadius: 10,
                        color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                        cursor: loading || answer.length < 20 ? 'not-allowed' : 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'all 0.2s',
                        boxShadow: loading || answer.length < 20 ? 'none' : '0 4px 20px rgba(79,70,229,0.4)'
                    }}
                >
                    {loading ? '⏳ Evaluating...' : '🚀 Evaluate Answer'}
                </button>
            </div>
        </div>
    )
}