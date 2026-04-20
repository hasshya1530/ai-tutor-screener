import { useState } from 'react'

export default function AudioUploader({ onSubmit, loading }) {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(null)

    const handleFile = (e) => {
        const f = e.target.files[0]
        if (!f) return
        setFile(f)
        setPreview(URL.createObjectURL(f))
    }

    return (
        <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#94a3b8', marginBottom: '1rem', letterSpacing: 1, textTransform: 'uppercase' }}>
                Step 2 — Upload Audio
            </h2>
            <div
                onClick={() => document.getElementById('audio-input').click()}
                style={{
                    border: '2px dashed rgba(79,70,229,0.4)',
                    borderRadius: 12, padding: '2.5rem',
                    textAlign: 'center', cursor: 'pointer',
                    background: 'rgba(79,70,229,0.05)',
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(79,70,229,0.8)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(79,70,229,0.4)'}
            >
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🎙️</div>
                <div style={{ fontWeight: 600, color: '#cbd5e1', marginBottom: '0.3rem' }}>
                    {file ? file.name : 'Click to upload audio'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>WAV, MP3, M4A, OGG supported</div>
                <input
                    id="audio-input"
                    type="file"
                    accept=".wav,.mp3,.m4a,.ogg,.webm,.flac"
                    onChange={handleFile}
                    style={{ display: 'none' }}
                />
            </div>

            {preview && (
                <audio controls src={preview} style={{ width: '100%', marginTop: '1rem', borderRadius: 8 }} />
            )}

            <button
                onClick={() => file && onSubmit(file, file.name)}
                disabled={!file || loading}
                style={{
                    width: '100%', marginTop: '1rem',
                    padding: '0.85rem',
                    background: !file || loading
                        ? 'rgba(79,70,229,0.3)'
                        : 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                    border: 'none', borderRadius: 10,
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    cursor: !file || loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    boxShadow: !file || loading ? 'none' : '0 4px 20px rgba(79,70,229,0.4)'
                }}
            >
                {loading ? '⏳ Transcribing & Evaluating...' : '🚀 Transcribe & Evaluate'}
            </button>
        </div>
    )
}