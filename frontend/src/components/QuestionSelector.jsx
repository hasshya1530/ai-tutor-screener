export default function QuestionSelector({ questions, selected, onSelect }) {
    const difficultyColor = { Easy: '#22c55e', Medium: '#f59e0b', Hard: '#ef4444' }

    return (
        <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                Step 1 — Choose a Question
            </h2>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
                {questions.map(q => (
                    <div
                        key={q.id}
                        onClick={() => onSelect(q)}
                        style={{
                            padding: '1.2rem 1.5rem',
                            borderRadius: 12,
                            border: selected?.id === q.id
                                ? '1px solid rgba(79,70,229,0.6)'
                                : '1px solid rgba(255,255,255,0.07)',
                            background: selected?.id === q.id
                                ? 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))'
                                : 'rgba(255,255,255,0.03)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '1rem',
                        }}
                    >
                        <div style={{
                            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                            background: selected?.id === q.id
                                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                                : 'rgba(255,255,255,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.9rem',
                            color: selected?.id === q.id ? '#fff' : '#64748b'
                        }}>
                            Q{q.id}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#818cf8' }}>{q.subject}</span>
                                <span style={{
                                    fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.5rem',
                                    borderRadius: 20, background: `${difficultyColor[q.difficulty]}20`,
                                    color: difficultyColor[q.difficulty]
                                }}>{q.difficulty}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>{q.question}</p>
                        </div>
                        {selected?.id === q.id && (
                            <div style={{ color: '#4f46e5', fontSize: '1.2rem', flexShrink: 0 }}>✓</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}