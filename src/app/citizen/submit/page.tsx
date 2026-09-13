'use client'

import { useState } from 'react'
import { VOICE_SUBMISSION_DEMO } from '@/lib/mockData'
import Link from 'next/link'
import styles from './page.module.css'

type Step = 'input' | 'processing' | 'review' | 'success'

export default function SubmitChallenge() {
  const [step, setStep] = useState<Step>('input')
  const [inputType, setInputType] = useState<'voice' | 'text'>('voice')
  const [language, setLanguage] = useState('hi')
  
  // Simulated recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  
  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false)
      // Simulate moving to processing after recording stops
      setStep('processing')
      setTimeout(() => {
        setStep('review')
      }, 3000)
    } else {
      setIsRecording(true)
      // In a real app, we'd use MediaRecorder here
    }
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep('processing')
    setTimeout(() => {
      setStep('review')
    }, 2000)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Submit a Challenge</h1>
        <p className={styles.subtitle}>Report a civic issue in your own language. Our AI will automatically categorize and route it.</p>
      </div>

      {/* Step Indicator */}
      <div className={styles.progressArea}>
        <div className="step-indicator">
          <div className="step-node">
            <div className={`step-circle ${step === 'input' ? 'active' : 'completed'}`}>1</div>
            <div className={`step-label ${step === 'input' ? 'active' : 'completed'}`}>Record / Type</div>
            <div className={`step-line ${step !== 'input' ? 'completed' : ''}`} />
          </div>
          <div className="step-node">
            <div className={`step-circle ${step === 'processing' ? 'active' : step === 'review' || step === 'success' ? 'completed' : ''}`}>2</div>
            <div className={`step-label ${step === 'processing' ? 'active' : step === 'review' || step === 'success' ? 'completed' : ''}`}>AI Review</div>
            <div className={`step-line ${step === 'review' || step === 'success' ? 'completed' : ''}`} />
          </div>
          <div className="step-node">
            <div className={`step-circle ${step === 'review' ? 'active' : step === 'success' ? 'completed' : ''}`}>3</div>
            <div className={`step-label ${step === 'review' ? 'active' : step === 'success' ? 'completed' : ''}`}>Confirm</div>
          </div>
        </div>
      </div>

      <div className={styles.formContainer}>
        {step === 'input' && (
          <div className="card fade-in">
            <div className="card-body">
              <div className={styles.inputTabs}>
                <button 
                  className={`${styles.tabBtn} ${inputType === 'voice' ? styles.activeTab : ''}`}
                  onClick={() => setInputType('voice')}
                >
                  Voice Note (Vernacular)
                </button>
                <button 
                  className={`${styles.tabBtn} ${inputType === 'text' ? styles.activeTab : ''}`}
                  onClick={() => setInputType('text')}
                >
                  Text Submission
                </button>
              </div>

              {inputType === 'voice' ? (
                <div className={styles.voiceSection}>
                  <div className="form-group" style={{ maxWidth: '300px', margin: '0 auto 2rem' }}>
                    <label className="form-label text-center block">Select your language</label>
                    <select 
                      className="form-select" 
                      value={language} 
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {VOICE_SUBMISSION_DEMO.languages.map(l => (
                        <option key={l.code} value={l.code}>{l.nativeLabel} ({l.label})</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.recorderArea}>
                    <button 
                      className={`${styles.recordBtn} ${isRecording ? styles.recording : ''}`}
                      onClick={handleRecordToggle}
                    >
                      {isRecording ? <span className={styles.stopIcon} /> : <span className={styles.micIcon} />}
                    </button>
                    <p className={styles.recordStatus}>
                      {isRecording ? 'Listening... Tap to stop' : 'Tap to start recording'}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleTextSubmit}>
                   <div className="form-group">
                      <label className="form-label">Describe the issue</label>
                      <textarea 
                        className="form-textarea" 
                        placeholder="Please provide details about the problem, location, and impact..."
                        required
                      />
                   </div>
                   <div className="form-group">
                      <label className="form-label">Attach Photos (Optional)</label>
                      <input type="file" className="form-input" multiple accept="image/*" />
                   </div>
                   <button type="submit" className="btn btn-primary w-100 block text-center mt-4">Submit for AI Review</button>
                </form>
              )}
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="card fade-in">
            <div className="card-body">
               <div className={styles.processingState}>
                  <div className={styles.spinner} />
                  <h3 className="text-lg font-semibold text-cf-800 mb-2">Transcribing & Translating...</h3>
                  <p className="text-sm text-secondary text-center">Bhashini API is processing your vernacular audio into a structured problem statement.</p>
               </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="card fade-in">
             <div className="card-header bg-warm-50">
               <h3 className="text-base font-semibold">Confirm AI Structured Details</h3>
             </div>
             <div className="card-body">
                <div className={styles.reviewGrid}>
                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">Original Transcript</span>
                      <p className="text-sm italic border-l-2 border-ai-300 pl-3 py-1">"{VOICE_SUBMISSION_DEMO.mockTranscription.raw}"</p>
                   </div>
                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">Generated Title</span>
                      <p className="text-base font-semibold text-cf-800">{VOICE_SUBMISSION_DEMO.mockTranscription.structuredOutput.title}</p>
                   </div>
                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">Generated Description</span>
                      <p className="text-sm">{VOICE_SUBMISSION_DEMO.mockTranscription.structuredOutput.description}</p>
                   </div>
                   
                   <div className={styles.reviewRow}>
                      <div className={styles.reviewItem}>
                         <span className="text-xs text-secondary block mb-1">Domain Category</span>
                         <span className="tag tag-accent">{VOICE_SUBMISSION_DEMO.mockTranscription.structuredOutput.category}</span>
                      </div>
                      <div className={styles.reviewItem}>
                         <span className="text-xs text-secondary block mb-1">Detected Urgency</span>
                         <span className="badge badge-verification">{VOICE_SUBMISSION_DEMO.mockTranscription.structuredOutput.urgency}</span>
                      </div>
                   </div>
                   
                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">Location</span>
                      <div className="flex gap-2 items-center">
                         <span className={styles.geoIcon} />
                         <span className="text-sm">{VOICE_SUBMISSION_DEMO.mockTranscription.structuredOutput.location}</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="card-footer flex justify-between gap-3">
                <button className="btn btn-outline btn-sm" onClick={() => setStep('input')}>Retake / Edit</button>
                <button className="btn btn-primary btn-sm" onClick={() => setStep('success')}>Confirm & Submit</button>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="card fade-in">
             <div className="card-body">
                <div className="empty-state">
                   <div className="empty-state-mark" style={{ borderColor: 'var(--ai-500)', color: 'var(--ai-600)' }}>✓</div>
                   <h5 className="text-xl text-cf-800 font-display">Challenge Submitted</h5>
                   <p className="text-sm text-secondary mb-6 max-w-md mx-auto">Your challenge has been successfully recorded and is now undergoing semantic deduplication before being routed to a partner institution.</p>
                   <Link href="/citizen" className="btn btn-primary">Return to Dashboard</Link>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
