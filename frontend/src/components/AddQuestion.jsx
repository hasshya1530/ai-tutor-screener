import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

export default function AddQuestion({ onQuestionAdded }) {
    const [open, setOpen] = useState(false)
    const [subject, setSubject] = useState('')
    const [question, setQuestion] = useState('')
    const [difficulty, setDifficulty] = useState('Medium')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!subject.trim() || question.trim().length < 20) {
            toast.error('Fill in all fields. Question must be at least 20 characters.')
            return
        }

        setLoading(true)
        try {
            const formData = new FormData()
            formData.append('subject', subject)
            formData.append('question', question)
            formData.append('difficulty', difficulty)

            const res = await axios.post(`${BACKEND_URL}/questions/add`, formData)
            toast.success('Question added!')
            onQuestionAdded(res.data.question)
            setSubject('')
            setQuestion('')
            setDifficulty('Medium')
            setOpen(false)
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to add question')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ marginBottom: '1.5rem' }}>

            {/* Toggle Button */}
            <button
                onClick={() => setOpen(!open)}
                style={{
                    padding: '0.6rem 1.2rem',
                    background: open
                        ? 'rgba(79,70,229,0.2)'
                        : 'transparent',
                    border: '1px solid rgba(79,70,229,0.4)',
                    borderRadius: 8, color: '#818cf8',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600, fontSize: '0.85rem',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
            >
                {open ? '✕ Cancel' : '＋ Add Custom Question'}
            </button>

            {/* Form */}
            {open && (
                <div style={{
                    marginTop: '1rem',
                    padding: '1.5rem',
                    background: 'rgba(79,70,229,0.05)',
                    border: '1px solid rgba(79,70,229,0.2)',
                    borderRadius: 12
                }}>
                    <h3 style={{ color: '#818cf8', fontWeight: 700, marginBottom: '1.2rem', fontSize: '0.95rem' }}>
                        ➕ Add a Custom Interview Question
                    </h3>

                    {/* Subject + Difficulty row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                SUBJECT
                            </label>
                            <input
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="e.g. Mathematics, English..."
                                style={{
                                    width: '100%', padding: '0.7rem 1rem',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8, color: '#e2e8f0',
                                    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                                DIFFICULTY
                            </label>
                            <select
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value)}
                                style={{
                                    width: '100%', padding: '0.7rem 1rem',
                                    background: '#1e1e2e',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 8, color: '#e2e8f0',
                                    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                                    outline: 'none', cursor: 'pointer'
                                }}
                            >
                                <option value="Easy">🟢 Easy</option>
                                <option value="Medium">🟡 Medium</option>
                                <option value="Hard">🔴 Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* Question textarea */}
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '0.4rem' }}>
                            QUESTION
                        </label>
                        <textarea
                            value={question}
                            onChange={e => setQuestion(e.target.value)}
                            placeholder="Write your interview question here. Be specific about what you want the tutor to demonstrate..."
                            rows={4}
                            style={{
                                width: '100%', padding: '0.8rem 1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8, color: '#e2e8f0',
                                fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                                lineHeight: 1.5, resize: 'vertical', outline: 'none'
                            }}
                        />
                        <div style={{ fontSize: '0.75rem', color: question.length < 20 ? '#ef4444' : '#22c55e', marginTop: '0.3rem' }}>
                            {question.length} characters {question.length < 20 ? `(need ${20 - question.length} more)` : '✓'}
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        style={{
                            padding: '0.75rem 2rem',
                            background: loading
                                ? 'rgba(79,70,229,0.3)'
                                : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            border: 'none', borderRadius: 8,
                            color: '#fff', fontWeight: 700,
                            fontFamily: 'Inter, sans-serif',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '0.9rem',
                            boxShadow: loading ? 'none' : '0 4px 15px rgba(79,70,229,0.4)'
                        }}
                    >
                        {loading ? '⏳ Adding...' : '✅ Add Question'}
                    </button>
                </div>
            )}
        </div>
    )
}