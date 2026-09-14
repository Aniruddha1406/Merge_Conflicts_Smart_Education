import Database from 'better-sqlite3'
import path from 'path'

const DB_PATH = path.join(process.cwd(), '.sicp-data', 'sicp.db')
const db = new Database(DB_PATH)

const columns = [
  'ai_category TEXT',
  'ai_subcategory TEXT',
  'ai_priority TEXT',
  'ai_keywords TEXT',
  'ai_technical_core TEXT',
  'ai_academic_field TEXT',
  'ai_confidence REAL',
  'ai_triage TEXT'
]

for (const colDef of columns) {
  const colName = colDef.split(' ')[0]
  try {
    db.prepare(`ALTER TABLE challenges ADD COLUMN ${colDef}`).run()
    console.log(`Added ${colName} column.`)
  } catch (err: any) {
    if (err.message.includes('duplicate column')) {
      console.log(`${colName} column already exists.`)
    } else {
      console.error(`Error adding ${colName} column:`, err.message)
    }
  }
}

console.log('Done altering schema.')
db.close()
