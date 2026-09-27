const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(__dirname, '.sicp-data/sicp.db'));

const now = new Date().toISOString();

const generateId = () => 'CH-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 900000 + 100000);

const challenges = [
  {
    title: 'Lack of Cold Storage for Tomato Farmers',
    desc: 'Farmers in Pithoria are forced to sell tomatoes at distressed prices due to lack of cold storage. Tons of produce rot during summer. Need a low-cost, off-grid cooling solution.',
    domain: 'Agriculture', district: 'Ranchi', keywords: 'farming,cold storage,tomatoes,spoilage,solar'
  },
  {
    title: 'Frequent Elephant Intrusions in Villages',
    desc: 'Wild elephants from the Dalma sanctuary frequently destroy crops and huts in nearby villages. Traditional methods are failing. We need an early warning system or non-harmful deterrent.',
    domain: 'Environment', district: 'East Singhbhum', keywords: 'elephants,wildlife,crops,warning system,deterrent'
  },
  {
    title: 'Arsenic Contamination in Tubewells',
    desc: 'Recent tests showed high arsenic levels in drinking water tubewells in Sahibganj. Skin lesions are becoming common. We need affordable household filters.',
    domain: 'Water', district: 'Sahibganj', keywords: 'arsenic,water,contamination,tubewells,filters'
  },
  {
    title: 'Poor Connectivity During Monsoons',
    desc: 'The temporary bridge over South Koel river washes away every monsoon, cutting off 5 villages from the block headquarters. Students cannot reach school for months.',
    domain: 'Infrastructure', district: 'Gumla', keywords: 'bridge,monsoon,river,connectivity,students'
  }
];

const insert = db.prepare(`
  INSERT INTO challenges (
    id, title, description, domain, district, reporter_type,
    submitted_by_id, submitted_by_name, submitted_at, status,
    endorsements, urgency_score, ai_category, ai_keywords, validated_at, updated_at
  ) VALUES (
    ?, ?, ?, ?, ?, 'citizen',
    'U-CITIZEN-001', 'Priya Mahato', ?, 'Validated',
    ?, ?, ?, ?, ?, ?
  )
`);

for (const c of challenges) {
  insert.run(
    generateId(), c.title, c.desc, c.domain, c.district,
    now, Math.floor(Math.random() * 50 + 50), Math.floor(Math.random() * 20 + 80),
    c.domain, c.keywords, now, now
  );
}

console.log('Inserted challenges');
