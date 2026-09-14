// src/app/api/uploads/[...path]/route.ts
// Static file server for uploaded files — LOCAL DEMO STORAGE
// Serves files from .sicp-data/uploads/

import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), '.sicp-data', 'uploads')

const MIME_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params
    const filePath = path.join(UPLOAD_DIR, ...resolvedParams.path)

    // Security: prevent directory traversal
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    if (!existsSync(resolved)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const buffer = await readFile(resolved)
    const ext = path.extname(resolved).toLowerCase()
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('[uploads]', err)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
