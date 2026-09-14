import Database from 'better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), '.sicp-data', 'sicp.db')
const db = new Database(dbPath)

function addColumn(table: string, column: string, type: string) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
    console.log(`Added ${column} to ${table}`)
  } catch (err: any) {
    if (err.message.includes('duplicate column name')) {
      console.log(`Column ${column} already exists in ${table}`)
    } else {
      console.error(`Error adding ${column}:`, err)
    }
  }
}

addColumn('challenge_evidence', 'storage_path', 'TEXT')
addColumn('challenge_evidence', 'file_size', 'INTEGER DEFAULT 0')
addColumn('challenge_evidence', 'uploaded_by_id', 'TEXT')

console.log('Migration for challenge_evidence complete.')
