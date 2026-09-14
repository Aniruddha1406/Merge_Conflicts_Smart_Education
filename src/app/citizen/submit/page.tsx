'use client'

import { useState, useEffect, useRef } from 'react'
import { VOICE_SUBMISSION_DEMO } from '@/lib/mockData'
import { useAuth } from '@/lib/authContext'
import { previewSubmission, submitChallenge } from '@/app/actions/challenges'
import Link from 'next/link'
import styles from './page.module.css'

type Step = 'input' | 'processing' | 'review' | 'success'

const VOICE_PRESETS: Record<string, { label: string; text: string }> = {
  water: {
    label: 'Drinking Water Contamination',
    text: 'हमारे गाँव मंदर में कुएँ और हैंडपम्प में पानी का रंग लाल हो गया है और ज़हरीला रसायन आ रहा है। गाँव के लोग और बच्चे बीमार पड़ रहे हैं।',
  },
  health: {
    label: 'Primary Health Center Deficiency',
    text: 'हमारे प्राथमिक स्वास्थ्य केंद्र में डॉक्टर उपलब्ध नहीं रहते और जीवन रक्षक दवाइयों तथा वैक्सीन के लिए कोल्ड स्टोरेज की व्यवस्था नहीं है।',
  },
  agriculture: {
    label: 'Soil Erosion & Micro-Irrigation',
    text: 'हमारे खेत में मिट्टी का भारी कटाव हो रहा है और धान की फसल की सिंचाई के लिए ड्रिप इरिगेशन की सख्त आवश्यकता है।',
  },
  education: {
    label: 'School Digital Divide',
    text: 'हमारे गाँव के सरकारी उच्च विद्यालय में कंप्यूटर लैब नहीं है और बच्चों के पास ऑनलाइन डिजिटल पढ़ाई की कोई सुविधा नहीं है।',
  },
}

export default function SubmitChallenge() {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('input')
  const [inputType, setInputType] = useState<'voice' | 'text'>('voice')
  const [language, setLanguage] = useState('hi')
  const [rawText, setRawText] = useState('')
  const [district, setDistrict] = useState('Ranchi')
  const [block, setBlock] = useState('')
  const [village, setVillage] = useState('')
  const [lat, setLat] = useState<number | null>(null)
  const [lng, setLng] = useState<number | null>(null)
  const [locationStatus, setLocationStatus] = useState<string>('')
  const [reporterType, setReporterType] = useState('citizen')
  const [files, setFiles] = useState<File[]>([])  // multiple evidence files
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({}) // per-file status
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([])  // successfully uploaded IDs

  // State for AI processing result
  const [previewData, setPreviewData] = useState<{
    classification: any
    similar: any[]
  } | null>(null)
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [transcriptLive, setTranscriptLive] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const recognitionRef = useRef<any>(null)
  const isRecordingRef = useRef<boolean>(false)

  // Initialize Web Speech API if supported by browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'

        recognition.onresult = (event: any) => {
          let currentTranscript = ''
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          setTranscriptLive(currentTranscript)
          setRawText(currentTranscript)
        }

        recognition.onend = () => {
          if (isRecordingRef.current) {
            try { recognition.start() } catch {}
          }
        }

        recognition.onerror = (event: any) => {
          if (event.error === 'no-speech' && isRecordingRef.current) {
            return
          }
          setIsRecording(false)
          isRecordingRef.current = false
        }

        recognitionRef.current = recognition
      }
    }
  }, [language])

  const handleRecordToggle = async () => {
    if (isRecording) {
      setIsRecording(false)
      isRecordingRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch {}
      }

      const textToUse = rawText.trim() || VOICE_PRESETS.water.text
      setRawText(textToUse)
      setStep('processing')

      const res = await previewSubmission(textToUse, language)
      setPreviewData(res)
      setStep('review')
    } else {
      setTranscriptLive('')
      setRawText('')
      setIsRecording(true)
      isRecordingRef.current = true
      if (recognitionRef.current) {
        try { recognitionRef.current.start() } catch {}
      }
    }
  }

  const handlePresetSelect = (presetKey: string) => {
    const preset = VOICE_PRESETS[presetKey]
    if (preset) {
      setRawText(preset.text)
      setTranscriptLive(preset.text)
    }
  }

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawText.trim()) return

    setStep('processing')
    const res = await previewSubmission(rawText, language)
    setPreviewData(res)
    setStep('review')
  }

  const handleConfirmSubmit = async () => {
    if (!previewData) return
    setIsSubmitting(true)
    setSubmitError(null)
    const successIds: string[] = []

    // Upload all files sequentially, show per-file status inline (no alert)
    for (const f of files) {
      setUploadStatuses(prev => ({ ...prev, [f.name]: 'uploading' }))
      const formData = new FormData()
      formData.append('file', f)
      formData.append('userId', user?.id || 'U-CITIZEN-001')
      formData.append('lat', lat != null ? String(lat) : '')
      formData.append('lng', lng != null ? String(lng) : '')
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()
        if (data.success && data.evidenceId) {
          successIds.push(data.evidenceId)
          setUploadStatuses(prev => ({ ...prev, [f.name]: 'success' }))
        } else {
          setUploadStatuses(prev => ({ ...prev, [f.name]: 'error' }))
          console.error('[upload]', f.name, data.error)
        }
      } catch (e) {
        setUploadStatuses(prev => ({ ...prev, [f.name]: 'error' }))
        console.error('[upload]', f.name, e)
      }
    }
    setUploadedFileIds(successIds)

    const result = await submitChallenge({
      title: previewData.classification.problemStatement || rawText.slice(0, 60),
      description: rawText,
      domain: previewData.classification.recommendedDomain || 'General',
      district: district,
      block: block || undefined,
      village: village || undefined,
      lat: lat ?? undefined,
      lng: lng ?? undefined,
      reporterType: reporterType,
      submittedById: user?.id || 'U-CITIZEN-001',
      submittedByName: user?.name || 'Citizen User',
      language: language,
      fileIds: successIds.length > 0 ? successIds : undefined,
    })

    setIsSubmitting(false)
    if (result.success && result.challengeId) {
      setSubmittedId(result.challengeId)
      setStep('success')
    } else {
      setSubmitError(result.error || 'Submission failed. Please check inputs and try again.')
    }
  }

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.')
      return
    }
    setLocationStatus('Locating...')
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLat(position.coords.latitude)
        setLng(position.coords.longitude)
        setLocationStatus('Location acquired.')
        
        // Optional: Basic reverse geocoding via free nominatim API
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=10`)
          if (res.ok) {
            const data = await res.json()
            if (data.address) {
              if (data.address.state_district || data.address.county) {
                const dist = (data.address.state_district || data.address.county).replace(' District', '')
                setDistrict(dist)
              }
            }
          }
        } catch (e) {
          // ignore
        }
      },
      () => {
        setLocationStatus('Unable to retrieve your location.')
      }
    )
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

              <div className="form-group">
                <label className="form-label">Reporter Type</label>
                <select className="form-select" value={reporterType} onChange={e => setReporterType(e.target.value)}>
                  <option value="citizen">Citizen</option>
                  <option value="gram_panchayat">Gram Panchayat Rep</option>
                  <option value="ngo">NGO</option>
                  <option value="govt_official">Govt Official</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
                <label className="form-label">Location (District/Block/Village)</label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, minWidth: '150px' }}
                    placeholder="District"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, minWidth: '150px' }}
                    placeholder="Block (Optional)"
                    value={block}
                    onChange={e => setBlock(e.target.value)}
                  />
                  <input
                    type="text"
                    className="form-input"
                    style={{ flex: 1, minWidth: '150px' }}
                    placeholder="Village/Panchayat"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={fetchLocation}>
                    📍 Use Current Location
                  </button>
                  {locationStatus && <span className="text-xs text-secondary">{locationStatus}</span>}
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Attach Evidence (Photo/Document)</label>
                <input type="file" className="form-input" onChange={e => setFile(e.target.files?.[0] || null)} />
                <span className="form-hint">Supports Images, PDFs, Docs up to 50MB</span>
              </div>

              {inputType === 'voice' ? (
                <div className={styles.voiceSection}>
                  <div className="form-group" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
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
                      {isRecording ? 'Listening... Speak into your microphone and tap to stop' : 'Tap to start voice recording'}
                    </p>
                  </div>

                  {/* Live Transcription or Voice Presets */}
                  <div style={{ marginTop: '1.5rem', background: '#F9F8F6', padding: '1rem', borderRadius: '8px', border: '1px solid #E5E0D8' }}>
                    <label className="text-xs text-secondary block mb-1">Speech Transcription / Voice Note Text:</label>
                    <textarea
                      className="form-textarea"
                      rows={3}
                      value={rawText}
                      onChange={e => setRawText(e.target.value)}
                      placeholder="Your voice note will appear here... Or click a sample prompt below."
                    />
                    
                    <div style={{ marginTop: '0.75rem' }}>
                      <span className="text-xs text-secondary block mb-1">Sample Vernacular Prompts:</span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {Object.entries(VOICE_PRESETS).map(([key, val]) => (
                          <button
                            key={key}
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.75rem' }}
                            onClick={() => handlePresetSelect(key)}
                          >
                            {val.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleTextSubmit}>
                   <div className="form-group">
                      <label className="form-label">Describe the issue</label>
                      <textarea 
                        className="form-textarea" 
                        placeholder="Please provide details about the problem, location, and impact..."
                        value={rawText}
                        onChange={e => setRawText(e.target.value)}
                        required
                        rows={4}
                      />
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
                  <h3 className="text-lg font-semibold text-cf-800 mb-2">Analyzing & Categorizing...</h3>
                  <p className="text-sm text-secondary text-center">Local Rule-Based Classifier is structuring your problem statement and checking for duplicates.</p>
               </div>
            </div>
          </div>
        )}

        {step === 'review' && previewData && (
          <div className="card fade-in">
             <div className="card-header bg-warm-50">
               <h3 className="text-base font-semibold">Confirm AI Structured Details</h3>
             </div>
             <div className="card-body">
                <div className={styles.reviewGrid}>
                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">Original Text</span>
                      <p className="text-sm italic border-l-2 border-ai-300 pl-3 py-1">"{rawText}"</p>
                   </div>
                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">Generated Problem Statement</span>
                      <p className="text-base font-semibold text-cf-800">{previewData.classification.problemStatement}</p>
                   </div>

                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">AI Triage Classification</span>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className={`badge ${previewData.classification.triageType === 'INNOVATION_CHALLENGE' ? 'badge-assigned' : 'badge-submitted'}`} style={{ fontWeight: 600 }}>
                          {previewData.classification.triageType === 'INNOVATION_CHALLENGE' ? 'R&D INNOVATION CHALLENGE' : 'ADMINISTRATIVE MAINTENANCE'}
                        </span>
                        <span className="text-xs text-secondary">
                          {previewData.classification.triageType === 'INNOVATION_CHALLENGE'
                            ? 'Routed for Higher Education Institution prototyping and research'
                            : 'Routed to direct municipal administrative resolution'}
                        </span>
                      </div>
                   </div>

                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">Extracted Technical Core & Engineering Discipline</span>
                      <p className="text-sm font-semibold text-cf-800" style={{ background: '#F8F6F0', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                        {previewData.classification.technicalCore}
                      </p>
                      <span className="text-xs text-secondary mt-1 block">Target Field: <strong>{previewData.classification.targetAcademicField}</strong></span>
                   </div>
                   
                   <div className={styles.reviewRow} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className={styles.reviewItem}>
                         <span className="text-xs text-secondary block mb-1">Domain Category</span>
                         <span className="tag tag-accent">{previewData.classification.category}</span>
                      </div>
                      <div className={styles.reviewItem}>
                         <span className="text-xs text-secondary block mb-1">Priority</span>
                         <span className="badge badge-assigned">{previewData.classification.priority}</span>
                      </div>
                      <div className={styles.reviewItem}>
                         <span className="text-xs text-secondary block mb-1">Urgency Score</span>
                         <span className="badge badge-verification font-semibold">{previewData.classification.urgencyScore}/100</span>
                      </div>
                   </div>

                   {previewData.classification.keywords?.length > 0 && (
                     <div className={styles.reviewItem}>
                       <span className="text-xs text-secondary block mb-1">AI Extracted Keywords</span>
                       <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                         {previewData.classification.keywords.map((kw: string, i: number) => (
                           <span key={i} className="tag" style={{ background: '#F0EBE1', fontSize: '0.75rem' }}>#{kw}</span>
                         ))}
                       </div>
                     </div>
                   )}
                   
                   <div className={styles.reviewItem}>
                      <span className="text-xs text-secondary block mb-1">Location</span>
                      <div className="flex gap-2 items-center">
                         <span className={styles.geoIcon} />
                         <span className="text-sm font-medium">{district}{village ? `, ${village}` : ''}</span>
                      </div>
                   </div>

                   {/* Duplicate Check Warning */}
                   {previewData.similar && previewData.similar.length > 0 && (
                     <div style={{ marginTop: '1rem', padding: '1rem', background: '#FFF8E7', borderRadius: '8px', border: '1px solid #FFE099' }}>
                       <h4 style={{ color: '#996600', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                         Similar Challenges Found ({previewData.similar.length})
                       </h4>
                       <p className="text-xs text-secondary mb-2">
                         Other citizens have reported similar issues. Endorsing an existing challenge increases its urgency score and speeds up resolution.
                       </p>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                         {previewData.similar.map((sim: any) => (
                           <div key={sim.challengeId || sim.challenge?.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                             <div>
                               <p className="text-xs font-semibold text-cf-800">{sim.title || sim.challenge?.title}</p>
                               <span className="text-xs text-secondary">{sim.district || sim.challenge?.district} • {Math.round(sim.similarity * 100)}% similarity</span>
                             </div>
                             <Link href={`/citizen/community?id=${sim.challengeId || sim.challenge?.id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>
                               Endorse This Instead
                             </Link>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
             </div>

             {/* Evidence Upload Section */}
             <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
               <p className="text-xs font-semibold text-secondary" style={{ marginBottom: '0.5rem' }}>
                 Attach Evidence (optional, max 5 files)
               </p>
               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                 <button type="button" className="btn btn-secondary btn-sm" onClick={() => cameraInputRef.current?.click()}>
                   Take Photo (Mobile Camera)
                 </button>
                 <button type="button" className="btn btn-outline btn-sm" onClick={() => fileInputRef.current?.click()} disabled={files.length >= 5}>
                   Upload from Device
                 </button>
               </div>
               {/* Camera input: capture="environment" opens rear camera on mobile */}
               <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }}
                 onChange={e => {
                   const f = e.target.files?.[0]
                   if (f && files.length < 5 && !files.find(x => x.name === f.name)) setFiles(prev => [...prev, f])
                   e.target.value = ''
                 }}
               />
               {/* Desktop file picker */}
               <input ref={fileInputRef} type="file" accept="image/*,video/mp4,audio/mpeg,application/pdf" multiple style={{ display: 'none' }}
                 onChange={e => {
                   const nf = Array.from(e.target.files || []).filter(f => !files.find(x => x.name === f.name))
                   setFiles(prev => [...prev, ...nf].slice(0, 5))
                   e.target.value = ''
                 }}
               />
               {files.length > 0 && (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
                   {files.map(f => {
                     const st = uploadStatuses[f.name] || 'idle'
                     return (
                       <div key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.35rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                         <span style={{ flex: 1, fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                         <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{(f.size / 1024).toFixed(0)}KB</span>
                         {st === 'idle' && <span className="badge badge-submitted" style={{ fontSize: '0.65rem' }}>Ready</span>}
                         {st === 'uploading' && <span className="badge badge-review" style={{ fontSize: '0.65rem' }}>Uploading</span>}
                         {st === 'success' && <span className="badge badge-resolved" style={{ fontSize: '0.65rem' }}>Uploaded OK</span>}
                         {st === 'error' && <span className="badge" style={{ background: '#FEE2E2', color: '#B91C1C', fontSize: '0.65rem' }}>Upload Failed</span>}
                         {st === 'idle' && (
                           <button type="button" onClick={() => setFiles(prev => prev.filter(x => x.name !== f.name))}
                             style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '0 2px', fontSize: '0.85rem' }}>x</button>
                         )}
                       </div>
                     )
                   })}
                 </div>
               )}
               <p className="text-xs text-tertiary" style={{ marginTop: '0.5rem' }}>
                 GPS: {lat != null
                   ? `Coordinates (${lat.toFixed(4)}, ${lng?.toFixed(4)}) will be attached to evidence`
                   : 'Not captured. Click "Use Current Location" above to geo-tag.'}
               </p>
             </div>

             <div className="card-footer flex justify-between gap-3" style={{ flexWrap: 'wrap' }}>
               <button className="btn btn-outline btn-sm" onClick={() => setStep('input')}>Edit / Back</button>
               <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
                 {submitError && (
                   <p style={{ fontSize: '0.8rem', color: '#B91C1C', margin: 0 }}>Error: {submitError}</p>
                 )}
                 <button className="btn btn-primary btn-sm" disabled={isSubmitting} onClick={handleConfirmSubmit}>
                   {isSubmitting ? 'Uploading & Saving...' : 'Confirm & Submit Challenge'}
                 </button>
               </div>
             </div>
          </div>
        )}

        {step === 'success' && (
          <div className="card fade-in">
             <div className="card-body">
                <div className="empty-state">
                   <div className="empty-state-mark" style={{ borderColor: 'var(--ai-500)', color: 'var(--ai-600)' }}>OK</div>
                   <h5 className="text-xl text-cf-800 font-display">Challenge Submitted!</h5>
                   <p className="text-sm font-semibold text-secondary mb-1">ID: {submittedId}</p>
                   <p className="text-sm text-secondary mb-6 max-w-md mx-auto">
                     Your challenge has been saved to the database and submitted for government review and university routing.
                   </p>
                   <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                     <Link href="/citizen/my-submissions" className="btn btn-primary">Track My Submissions</Link>
                     <button className="btn btn-outline" onClick={() => { setStep('input'); setRawText(''); setPreviewData(null) }}>Submit Another</button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}

