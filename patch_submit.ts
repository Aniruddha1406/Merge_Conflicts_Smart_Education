import fs from 'fs'

const file = 'src/app/citizen/submit/page.tsx'
let content = fs.readFileSync(file, 'utf-8')

// Find and replace the old footer section
const oldFooter = `                </div>
             </div>
             <div className="card-footer flex justify-between gap-3">
                <button className="btn btn-outline btn-sm" onClick={() => setStep('input')}>Edit / Back</button>
                <button className="btn btn-primary btn-sm" disabled={isSubmitting || isUploading} onClick={handleConfirmSubmit}>
                  {isUploading ? 'Uploading Evidence...' : isSubmitting ? 'Saving to Database...' : 'Confirm & Submit Challenge'}
                </button>
             </div>
          </div>
        )}`

const newFooter = `                </div>
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
                   ? \`Coordinates (\${lat.toFixed(4)}, \${lng?.toFixed(4)}) will be attached to evidence\`
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
        )}`

if (content.includes(oldFooter)) {
  content = content.replace(oldFooter, newFooter)
  fs.writeFileSync(file, content, 'utf-8')
  console.log('REPLACED OK')
} else {
  // Debug: print the actual character codes around line 522
  const lines = content.split('\n')
  console.log('NOT FOUND. Lines 519-529:')
  lines.slice(518, 530).forEach((l, i) => console.log(518 + i, JSON.stringify(l)))
}
