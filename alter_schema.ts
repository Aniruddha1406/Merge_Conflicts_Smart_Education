import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), '.sicp-data', 'sicp.db')
const db = new Database(DB_PATH)

try {
  db.prepare('ALTER TABLE challenges ADD COLUMN block TEXT').run()
  console.log('Added block column.')
} catch (err: any) {
  if (err.message.includes('duplicate column')) {
    console.log('block column already exists.')
  } else {
    console.error('Error adding block column:', err.message)
  }
}

try {
  db.prepare("ALTER TABLE challenges ADD COLUMN reporter_type TEXT DEFAULT 'citizen'").run()
  console.log('Added reporter_type column.')
} catch (err: any) {
  if (err.message.includes('duplicate column')) {
    console.log('reporter_type column already exists.')
  } else {
    console.error('Error adding reporter_type column:', err.message)
  }
}

console.log('Done altering schema.')
db.close()
