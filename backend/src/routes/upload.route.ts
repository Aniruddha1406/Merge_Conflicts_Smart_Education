import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { generateId, evidenceRepo, now } from '../db/index';

const router = Router();
const UPLOAD_DIR = path.join(process.cwd(), '.sicp-data', 'uploads');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'audio/mpeg': 'audio',
  'audio/mp3': 'audio',
  'audio/webm': 'audio',
  'audio/wav': 'audio',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'text/plain': 'document',
  'application/octet-stream': 'document', // fallback for unknown binary
};

function detectFileType(mimetype: string, filename: string): string | null {
  if (ALLOWED_TYPES[mimetype]) return ALLOWED_TYPES[mimetype];
  
  // Try to detect from extension
  const ext = path.extname(filename).toLowerCase();
  const extMap: Record<string, string> = {
    '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image', '.webp': 'image',
    '.mp4': 'video', '.webm': 'video', '.mov': 'video',
    '.mp3': 'audio', '.wav': 'audio', '.ogg': 'audio',
    '.pdf': 'document', '.doc': 'document', '.docx': 'document',
    '.xls': 'document', '.xlsx': 'document', '.txt': 'document',
  };
  return extMap[ext] || null;
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const challengeId = req.body.challengeId as string | undefined;
    const userId = req.body.userId as string | undefined;

    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const fileType = detectFileType(file.mimetype, file.originalname);
    if (!fileType) {
      return res.status(400).json({ 
        error: `File type not allowed. Accepted: images (JPG, PNG, WebP), video (MP4), audio (MP3, WAV), documents (PDF, DOC, DOCX).` 
      });
    }

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const evidenceId = generateId('EV');
    const subDir = challengeId || 'pending';
    const dir = path.join(UPLOAD_DIR, subDir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '.bin';
    const safeName = `${evidenceId}${ext}`;
    const filePath = path.join(dir, safeName);
    const storagePath = `${subDir}/${safeName}`;

    fs.writeFileSync(filePath, file.buffer);

    // Best-effort DB insert — don't fail the upload if DB insert fails
    try {
      const { getDb } = require('../db/index');
      const db = getDb();
      db.prepare(`
        INSERT OR IGNORE INTO challenge_evidence 
          (id, challenge_id, file_type, file_name, file_url, storage_path, file_size, uploaded_by_id, uploaded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        evidenceId,
        challengeId || null,      // NULL is fine now — challenge_id is nullable
        fileType,
        file.originalname,
        `/api/uploads/${storagePath}`,
        storagePath,
        file.size,
        userId || null,
        new Date().toISOString()
      );
    } catch (dbErr) {
      console.warn('[upload] DB insert skipped:', (dbErr as Error).message);
    }

    res.json({
      success: true,
      evidenceId,
      url: `/api/uploads/${storagePath}`,
      storagePath,
      fileName: file.originalname,
      fileType,
      fileSize: file.size,
      storageLabel: 'LOCAL_STORAGE',
    });
  } catch (err) {
    console.error('[upload]', err);
    res.status(500).json({ error: 'Upload failed. Please try again.' });
  }
});

// Serve uploaded files
router.get('/files/:subdir/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.subdir, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

export default router;
