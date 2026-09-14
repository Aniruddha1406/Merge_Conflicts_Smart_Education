// src/app/api/upload/route.ts
// File upload API — LOCAL DEMO STORAGE
// Saves files to .sicp-data/uploads/ and records metadata in challenge_evidence table.
// In production, replace with S3/GCS upload.

import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { generateId, evidenceRepo, now } from '@/lib/db'

const UPLOAD_DIR = path.join(process.cwd(), '.sicp-data', 'uploads')

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'audio/mpeg': 'audio',
  'audio/webm': 'audio',
  'audio/wav': 'audio',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
}

const MAX_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const challengeId = formData.get('challengeId') as string | null
    const userId = formData.get('userId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate type
    const fileType = ALLOWED_TYPES[file.type]
    if (!fileType) {
      return NextResponse.json(
        { error: `File type ${file.type} is not allowed. Accepted: images, video, audio, PDF, DOC.` },
        { status: 400 }
      )
    }

    // Validate size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds 50MB limit.` },
        { status: 400 }
      )
    }

    // Create upload directory
    const evidenceId = generateId('EV')
    const subDir = challengeId || 'pending'
    const dir = path.join(UPLOAD_DIR, subDir)
    await mkdir(dir, { recursive: true })

    // Safe filename
    const ext = path.extname(file.name) || '.bin'
    const safeName = `${evidenceId}${ext}`
    const filePath = path.join(dir, safeName)
    const storagePath = `${subDir}/${safeName}`

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Record in DB
    evidenceRepo.insert({
      id: evidenceId,
      challenge_id: challengeId || 'PENDING',
      file_type: fileType,
      file_name: file.name,
      file_url: `/api/uploads/${storagePath}`,
      storage_path: storagePath,
      file_size: file.size,
      uploaded_by_id: userId || null,
      uploaded_at: now(),
    })

    return NextResponse.json({
      success: true,
      evidenceId,
      url: `/api/uploads/${storagePath}`,
      storagePath,
      fileName: file.name,
      fileType,
      fileSize: file.size,
      storageLabel: 'LOCAL_DEMO_STORAGE',
    })
  } catch (err) {
    console.error('[upload]', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
