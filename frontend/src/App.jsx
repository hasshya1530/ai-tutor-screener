import { useState, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import QuestionSelector from './components/QuestionSelector'
import TextAnswer from './components/TextAnswer'
import AudioUploader from './components/AudioUploader'
import EvaluationResult from './components/EvaluationResult'
import AddQuestion from './components/AddQuestion'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || ''

export default function App() {
  const [questions, setQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [activeTab, setActiveTab] = useState('text')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    // Check backend health
    axios.get(`${BACKEND_URL}/health`)
      .then(() => setBackendStatus('online'))
      .catch(() => setBackendStatus('offline'))

    // Load questions
    axios.get(`${BACKEND_URL}/questions`)
      .then(res => {
        setQuestions(res.data.questions)
        setSelectedQuestion(res.data.questions[0])
      })
      .catch(() => toast.error('Could not load questions from backend'))
  }, [])

  const handleTextSubmit = async (answer) => {
    if (!selectedQuestion) return
    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('answer', answer)
      formData.append('question_id', selectedQuestion.id)
      const res = await axios.post(`${BACKEND_URL}/evaluate-text`, formData)
      setResult(res.data)
    } catch (err) {
      toast.error('Evaluation failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleAudioSubmit = async (audioBlob, filename) => {
    if (!selectedQuestion) return
    setLoading(true)
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, filename)
      formData.append('question_id', selectedQuestion.id)
      const res = await axios.post(`${BACKEND_URL}/evaluate`, formData)
      setResult(res.data)
    } catch (err) {
      toast.error('Audio evaluation failed. Try text mode.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' }}>
      <Toaster position="top-right" />

      {/* ── HEADER ── */}
      <header style={{
        borderBottom: '1px solid rgba(79,70,229,0.3)',
        padding: '1.2rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(15,15,26,0.8)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem'
          }}>🎓</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#fff' }}>AI Tutor Screener</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Powered by Llama 3 + Whisper</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: backendStatus === 'online' ? '#22c55e' : backendStatus === 'offline' ? '#ef4444' : '#f59e0b',
            boxShadow: backendStatus === 'online' ? '0 0 8px #22c55e' : 'none'
          }} />
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            {backendStatus === 'online' ? 'Backend Online' : backendStatus === 'offline' ? 'Backend Offline' : 'Checking...'}
          </span>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #818cf8, #c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem'
          }}>
            Screen Tutors with AI
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
            Answer an interview question by voice or text. Get instant AI evaluation with detailed feedback.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { step: '01', label: 'Pick a Question', icon: '📋' },
            { step: '02', label: 'Submit Your Answer', icon: '🎙️' },
            { step: '03', label: 'Get AI Feedback', icon: '📊' },
          ].map(({ step, label, icon }) => (
            <div key={step} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '1rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{icon}</div>
              <div style={{ fontSize: '0.65rem', color: '#4f46e5', fontWeight: 700, letterSpacing: 2 }}>STEP {step}</div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500, marginTop: '0.2rem' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Add Custom Question */}
        <AddQuestion
          onQuestionAdded={(newQ) => {
            setQuestions(prev => [...prev, newQ])
            setSelectedQuestion(newQ)
            setResult(null)
          }}
        />

        {/* Question Selector */}
        <QuestionSelector
          questions={questions}
          selected={selectedQuestion}
          onSelect={(q) => { setSelectedQuestion(q); setResult(null) }}
        />

        {/* Answer Input Tabs */}
        {selectedQuestion && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16,
            overflow: 'hidden',
            marginTop: '1.5rem'
          }}>
            {/* Tab Buttons */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {[
                { id: 'text', label: '⌨️  Type Answer' },
                { id: 'audio', label: '🎙️  Upload Audio' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setResult(null) }}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    background: activeTab === tab.id
                      ? 'linear-gradient(135deg, rgba(79,70,229,0.2), rgba(124,58,237,0.2))'
                      : 'transparent',
                    color: activeTab === tab.id ? '#818cf8' : '#64748b',
                    borderBottom: activeTab === tab.id ? '2px solid #4f46e5' : '2px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '1.5rem' }}>
              {activeTab === 'text'
                ? <TextAnswer onSubmit={handleTextSubmit} loading={loading} />
                : <AudioUploader onSubmit={handleAudioSubmit} loading={loading} />
              }
            </div>
          </div>
        )}

        {/* Results */}
        {loading && (
          <div style={{
            textAlign: 'center', padding: '3rem',
            background: 'rgba(79,70,229,0.05)',
            border: '1px solid rgba(79,70,229,0.2)',
            borderRadius: 16, marginTop: '1.5rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
            <div style={{ color: '#818cf8', fontWeight: 600, fontSize: '1.1rem' }}>
              AI is evaluating your answer...
            </div>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              This takes 5-10 seconds
            </div>
            <div style={{
              width: 200, height: 4,
              background: 'rgba(79,70,229,0.2)',
              borderRadius: 2, margin: '1.5rem auto 0',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', width: '40%',
                background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                borderRadius: 2,
                animation: 'slide 1.5s ease-in-out infinite'
              }} />
            </div>
            <style>{`@keyframes slide { 0%{transform:translateX(-100%)} 100%{transform:translateX(600%)} }`}</style>
          </div>
        )}

        {result && !loading && <EvaluationResult result={result} />}

      </main>
    </div>
  )
}