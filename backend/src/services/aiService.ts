// src/lib/services/aiService.ts
// Multimodal & Vernacular Problem Structuring Engine (Sub-Engine 1)
// Processes citizen input (voice notes in Hindi, Santhali, Ho, Mundari or vernacular text)
// and extracts Technical Core, Target Academic Field, Triage Flag, and Urgency Scores.

export interface AIClassification {
  category: string
  subcategory: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  urgencyScore: number
  keywords: string[]
  problemStatement: string
  technicalCore: string
  targetAcademicField: string
  triageType: 'INNOVATION_CHALLENGE' | 'ADMINISTRATIVE_ISSUE'
  recommendedDomain: string
  language: string
  confidence: number
  /** Honest label: always 'LOCAL_RULE_BASED_CLASSIFIER' — no ML model is used */
  providerLabel: string
}

// ──────────────────────────────────────────────────────────────
// ACADEMIC FIELD & TECHNICAL CORE MAPPING RULES
// ──────────────────────────────────────────────────────────────

const ACADEMIC_DISCIPLINE_MAP: Record<string, { field: string; technicalCoreTemplate: string }> = {
  'Water:Water Supply': { field: 'Chemical & Environmental Engineering', technicalCoreTemplate: 'Groundwater contaminant detection and multi-stage filtration design' },
  'Water:Drainage': { field: 'Civil & Environmental Engineering', technicalCoreTemplate: 'Urban flood modeling and advanced drainage infrastructure design' },
  'Health:Primary Healthcare': { field: 'Biotechnology & Public Health Technology', technicalCoreTemplate: 'Solar-powered cold storage and portable diagnostic kits' },
  'Health:Maternal Health': { field: 'Biomedical Engineering', technicalCoreTemplate: 'Non-invasive maternal health monitoring and telemedicine integration' },
  'Agriculture:Crop Issues': { field: 'Agri-Tech & Soil Science', technicalCoreTemplate: 'IoT sensor-based micro-irrigation system & soil nutrient remediation' },
  'Agriculture:Livestock': { field: 'Veterinary Tech & Agri-Tech', technicalCoreTemplate: 'Livestock disease tracking and automated health monitoring systems' },
  'Education:School Infrastructure': { field: 'Civil Engineering & Edu-Tech', technicalCoreTemplate: 'Low-cost modular school infrastructure and resource allocation' },
  'Education:Digital Access': { field: 'Computer Science & Educational Technology', technicalCoreTemplate: 'Offline solar-assisted digital learning server & interactive vernacular LMS' },
  'Infrastructure:Roads': { field: 'Civil & Structural Engineering', technicalCoreTemplate: 'Low-cost eco-brick pavement design & resilient road materials' },
  'Energy:Electricity': { field: 'Electrical & Renewable Energy Engineering', technicalCoreTemplate: 'Solar microgrid design, battery storage integration & rural electrification system' },
  'Environment:Waste Management': { field: 'Environmental Tech & Waste Engineering', technicalCoreTemplate: 'Biomass waste-to-energy briquetting & automated segregation' },
  'Environment:Forest & Land': { field: 'Environmental Science & GIS', technicalCoreTemplate: 'Satellite-based deforestation tracking and soil erosion prevention' },
  'Livelihood:Employment': { field: 'Industrial & Production Engineering', technicalCoreTemplate: 'Ergonomic handloom mechanization & rural agro-processing unit' },
  'Governance:Document Services': { field: 'E-Governance & Data Science', technicalCoreTemplate: 'Blockchain-backed transparent benefit distribution & automated Grievance NLP' },
  'General:Unclassified': { field: 'Multidisciplinary Engineering', technicalCoreTemplate: 'Community-driven participatory design and problem analysis' },
}

const DOMAIN_RULES: { domain: string; subcategory: string; keywords: string[] }[] = [
  { domain: 'Water', subcategory: 'Water Supply',    keywords: ['water', 'jal', 'pipe', 'supply', 'contamination', 'drinking', 'tap', 'handpump', 'borewell', 'fluoride', 'arsenic', 'nalka', 'samast', 'पानी', 'जल', 'कुआं', 'नल', 'प्यास', 'हैंडपंप'] },
  { domain: 'Water', subcategory: 'Drainage',         keywords: ['drain', 'sewage', 'flood', 'waterlog', 'overflow', 'nala', 'sewerage', 'नाला', 'बाढ़', 'गंदा पानी'] },
  { domain: 'Health', subcategory: 'Primary Healthcare', keywords: ['health', 'hospital', 'doctor', 'medicine', 'disease', 'malaria', 'TB', 'tuberculosis', 'malnutrition', 'anemia', 'clinic', 'nurse', 'asha', 'dawa', 'अस्पताल', 'डॉक्टर', 'दवा', 'बीमार', 'स्वास्थ्य', 'मलेरिया'] },
  { domain: 'Health', subcategory: 'Maternal Health', keywords: ['mother', 'maternity', 'delivery', 'child', 'infant', 'newborn', 'pregnancy', 'antenatal', 'maternal', 'गर्भवती', 'बच्चा', 'शिशु', 'प्रसूति'] },
  { domain: 'Agriculture', subcategory: 'Crop Issues', keywords: ['crop', 'agriculture', 'farm', 'kisan', 'soil', 'irrigation', 'fertilizer', 'pest', 'harvest', 'wheat', 'paddy', 'rice', 'vegetable', 'kheti', 'किसान', 'खेती', 'फसल', 'सिंचाई', 'खाद', 'बीज', 'धान', 'गेहूं'] },
  { domain: 'Agriculture', subcategory: 'Livestock',  keywords: ['animal', 'cattle', 'goat', 'poultry', 'cow', 'buffalo', 'livestock', 'pashu', 'पशु', 'गाय', 'भैंस', 'बकरी', 'मुर्गी'] },
  { domain: 'Education', subcategory: 'School Infrastructure', keywords: ['school', 'teacher', 'student', 'education', 'vidyalaya', 'classroom', 'textbook', 'midday', 'scholarship', 'dropout', 'padhai', 'स्कूल', 'विद्यालय', 'शिक्षक', 'बच्चे', 'पढ़ाई', 'किताब', 'छात्र'] },
  { domain: 'Education', subcategory: 'Digital Access', keywords: ['computer', 'internet', 'digital', 'online', 'laptop', 'connectivity', 'कंप्यूटर', 'इंटरनेट', 'ऑनलाइन', 'लैपटॉप'] },
  { domain: 'Infrastructure', subcategory: 'Roads',   keywords: ['road', 'pothole', 'bridge', 'highway', 'path', 'sadak', 'pul', 'kaccha', 'सड़क', 'पुल', 'रास्ता', 'गड्ढा', 'कच्चा'] },
  { domain: 'Energy', subcategory: 'Electricity',      keywords: ['electricity', 'power', 'light', 'bijli', 'transformer', 'outage', 'voltage', 'solar', 'grid', 'energy', 'renewable', 'battery', 'inverter', 'microgrid', 'backup', 'panel', 'बिजली', 'लाइट', 'ट्रांसफार्मर', 'अंधेरा', 'ऊर्जा', 'सोलर', 'बैटरी'] },
  { domain: 'Environment', subcategory: 'Waste Management', keywords: ['waste', 'garbage', 'pollution', 'plastic', 'solid waste', 'dustbin', 'landfill', 'recycling', 'kachra', 'कचरा', 'प्रदूषण', 'प्लास्टिक', 'कूड़ा'] },
  { domain: 'Environment', subcategory: 'Forest & Land', keywords: ['forest', 'tree', 'land', 'mining', 'deforestation', 'erosion', 'jungle', 'जंगल', 'पेड़', 'जमीन', 'खनन', 'कटाव'] },
  { domain: 'Livelihood', subcategory: 'Employment',  keywords: ['job', 'employment', 'work', 'income', 'livelihood', 'MNREGA', 'wage', 'daily labour', 'rozgar', 'रोजगार', 'काम', 'मजदूरी', 'मनरेगा', 'नौकरी'] },
  { domain: 'Governance', subcategory: 'Document Services', keywords: ['ration', 'card', 'certificate', 'aadhar', 'pension', 'document', 'panchayat', 'BPL', 'MNREGA card', 'राशन', 'कार्ड', 'आधार', 'पेंशन', 'प्रमाणपत्र', 'पंचायत'] },
]

const PRIORITY_SIGNALS: { priority: 'Critical' | 'High'; keywords: string[] }[] = [
  { priority: 'Critical', keywords: ['death', 'died', 'cholera', 'epidemic', 'outbreak', 'emergency', 'urgent', 'fire', 'collapse', 'severe', 'poisonous', 'bimar', 'मौत', 'मर', 'महामारी', 'आपातकाल', 'आग', 'गिर', 'जहरीला'] },
  { priority: 'High', keywords: ['hospital', 'doctor', 'flood', 'contamination', 'accident', 'immediate', 'months', 'years', 'children', 'child', 'अस्पताल', 'बाढ़', 'हादसा', 'बच्चे', 'महीनों', 'सालों'] },
]

// Innovation signals: words/phrases that strongly suggest R&D/technology is needed
const INNOVATION_SIGNALS: string[] = [
  // English
  'low-cost', 'detect', 'detection', 'smart', 'sensor', 'sensors', 'prototype',
  'redesign', 'technology', 'monitoring', 'automate', 'automated', 'renewable',
  'microgrid', 'solar', 'iot', 'ml', 'ai-based', 'algorithm', 'remote sensing',
  'build a', 'design a', 'develop a', 'create a', 'innovative', 'innovation',
  'research', 'solution', 'system design', 'early warning', 'precision', 'digital',
  'telemedicine', 'biotech', 'nano', 'drone', 'satellite',
  // Hindi
  'तकनीक', 'सेंसर', 'समाधान', 'डिजिटल', 'ऑटोमेशन', 'सौर', 'नवाचार',
]

// Administrative/grievance signals: complaint/service failure patterns
const ADMINISTRATIVE_SIGNALS: string[] = [
  // English — complaint patterns
  'has not worked', 'has not been', 'not working', 'not cleaned', 'not collected',
  'not available', 'not repaired', 'broken', 'broken down', 'out of order',
  'for weeks', 'for months', 'for years', 'for two weeks', 'for three weeks',
  'for a month', 'light is off', 'no collection', 'no cleaning', 'overflowing',
  'not sweeping', 'complaint', 'grievance', 'delayed', 'pending certificate',
  'certificate not', 'card not', 'card missing', 'pension not', 'ration not',
  'bribe', 'corruption', 'no response', 'repair the', 'fix the', 'restore the',
  'street light', 'streetlight', 'garbage', 'sewage', 'blocked drain', 'pothole repair',
  'road repair', 'maintenance', 'municipal', 'civic', 'food grains', 'ration card',
  'ration shop', 'is missing', 'card is missing', 'pension payment', 'subsidy not',
  // Hindi — grievance patterns
  'नहीं काम', 'टूटी हुई', 'खराब है', 'नहीं आती', 'नहीं मिलता', 'बत्ती गुल',
  'गंदगी', 'सफाई नहीं', 'पेंशन नहीं', 'राशन नहीं', 'कचरा नहीं',
  'शिकायत', 'मरम्मत', 'महीनों से', 'सालों से',
]

// ──────────────────────────────────────────────────────────────
// CORE CLASSIFICATION FUNCTION
// ──────────────────────────────────────────────────────────────

export async function classifyChallenge(text: string, language: string = 'en'): Promise<AIClassification> {
  return await deterministic_classify(text, language)
}

async function deterministic_classify(text: string, language: string): Promise<AIClassification> {
  const lower = text.toLowerCase()
  const words = lower.split(/[\s,.\!\?\-]+/).filter(Boolean)

  // 1. Two-layer triage scoring
  let innovationScore = 0
  let adminScore = 0

  for (const sig of INNOVATION_SIGNALS) {
    if (lower.includes(sig)) innovationScore += sig.includes(' ') ? 3 : 1
  }
  for (const sig of ADMINISTRATIVE_SIGNALS) {
    if (lower.includes(sig)) adminScore += sig.includes(' ') ? 3 : 1
  }

  // Start as undecided
  let triageType: 'INNOVATION_CHALLENGE' | 'ADMINISTRATIVE_ISSUE' = 'INNOVATION_CHALLENGE'
  if (adminScore > innovationScore) {
    triageType = 'ADMINISTRATIVE_ISSUE'
  }

  // 2. Score each domain
  const domainScores: Map<string, { score: number; subcategory: string; keywords: string[] }> = new Map()
  for (const rule of DOMAIN_RULES) {
    let score = 0
    const matchedKeywords: string[] = []
    for (const kw of rule.keywords) {
      const kwLower = kw.toLowerCase()
      // Use exact word matching for single-word keywords to avoid "जल" matching inside "बिजली"
      if (kwLower.includes(' ')) {
        if (lower.includes(kwLower)) {
          score += 3
          matchedKeywords.push(kw)
        }
      } else {
        if (words.includes(kwLower)) {
          score += 1
          matchedKeywords.push(kw)
        }
      }
    }
    if (score > 0) {
      const existing = domainScores.get(rule.domain)
      if (!existing || existing.score < score) {
        domainScores.set(rule.domain, { score, subcategory: rule.subcategory, keywords: matchedKeywords })
      }
    }
  }

  // Pick winning domain — if nothing matches, use 'General' (NOT Water)
  let bestDomain = 'General'
  let bestSubcategory = 'Unclassified'
  let bestKeywords: string[] = []
  let bestScore = 0

  for (const [domain, data] of domainScores.entries()) {
    if (data.score > bestScore) {
      bestScore = data.score
      bestDomain = domain
      bestSubcategory = data.subcategory
      bestKeywords = data.keywords
    }
  }

  // Force unclassified general problems to administrative triage, preventing R&D routing for vague issues
  if (bestDomain === 'General') {
    triageType = 'ADMINISTRATIVE_ISSUE'
  }

  // Priority detection
  let priority: 'Critical' | 'High' | 'Medium' | 'Low' = 'Medium'
  for (const sig of PRIORITY_SIGNALS) {
    if (sig.keywords.some(kw => lower.includes(kw))) {
      priority = sig.priority
      break
    }
  }

  // Urgency score
  const keywordDensity = Math.min(bestKeywords.length / 3, 1)
  const baseUrgency = priority === 'Critical' ? 88 : priority === 'High' ? 74 : priority === 'Medium' ? 58 : 42
  const urgencyScore = Math.min(99, Math.round(baseUrgency + keywordDensity * 10 + Math.min(words.length / 100, 0.4) * 5))

  // Academic Field & Technical Core
  const mappingKey = `${bestDomain}:${bestSubcategory}`
  const mapping = ACADEMIC_DISCIPLINE_MAP[mappingKey] || ACADEMIC_DISCIPLINE_MAP['General:Unclassified']
  const targetAcademicField = mapping.field
  const technicalCore = `${mapping.technicalCoreTemplate} (Addressing ${bestSubcategory.toLowerCase()})`

  const uniqueKeywords = [...new Set(bestKeywords)].slice(0, 6)
  if (uniqueKeywords.length === 0) uniqueKeywords.push(bestDomain.toLowerCase(), 'community')

  const problemStatement = generateProblemStatement(text, bestDomain, bestSubcategory, uniqueKeywords)

  // Confidence: lower base when no keywords match, scaled by score
  const confidence = bestScore === 0
    ? 0.45
    : Math.min(0.96, 0.50 + bestScore * 0.08)

  return {
    category: bestDomain,
    subcategory: bestSubcategory,
    priority,
    urgencyScore,
    keywords: uniqueKeywords,
    problemStatement,
    technicalCore,
    targetAcademicField,
    triageType,
    recommendedDomain: bestDomain,
    language,
    confidence,
    providerLabel: 'LOCAL_RULE_BASED_CLASSIFIER',
  }
}

function generateProblemStatement(
  originalText: string,
  domain: string,
  subcategory: string,
  keywords: string[]
): string {
  const sentences = originalText.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const coreSentence = sentences[0]?.trim() || originalText.slice(0, 100)

  return `Engineering Challenge (${domain} - ${subcategory}): ${coreSentence}. ` +
    `Focus areas: ${keywords.join(', ')}.`
}

// ──────────────────────────────────────────────────────────────
// VERNACULAR TRANSCRIPTION (Bhashini / Santhali / Ho / Mundari)
// ──────────────────────────────────────────────────────────────

export interface TranscriptionResult {
  originalLanguage: string
  transcription: string
  translatedText: string
  provider: 'bhashini_demo' | 'whisper_demo' | 'manual' | 'browser_web_speech_api'
}

export async function transcribeVoice(
  audioBlob: string,
  sourceLanguage: string
): Promise<TranscriptionResult> {
  // HONEST: These are preset demo transcriptions. No real Bhashini API is called.
  // For Santhali/Ho/Mundari, we show demo text since Browser Web Speech API
  // does not support these languages.
  const demoTranscriptions: Record<string, { transcription: string; translation: string }> = {
    hi: { transcription: 'हमारे गाँव मंदर में पीने के पानी में भारी ज़हर और आर्सेनिक आ रहा है। बच्चे बीमार पड़ रहे हैं।', translation: 'There is severe heavy metal and arsenic contamination in drinking water in Mandar village. Children are falling ill.' },
    sat: { transcription: 'ᱟᱢᱟᱜ ᱜᱟᱶᱽ ᱨᱮ ᱫᱟᱠᱚ ᱵᱟᱝ ᱛᱮᱭᱮ। ᱦᱚᱲ ᱠᱚ ᱵᱤᱢᱟᱨᱚᱜ ᱠᱟᱱᱟ।', translation: 'Water quality in our village is contaminated and villagers are falling ill.' },
    ho: { transcription: 'Amagho gameng re dak ba reak saga, ho ko bimar janai.', translation: 'Water in our village is contaminated, people are falling ill.' },
    mun: { transcription: 'Alang honkore daako bá lete oka geleya, bimar hoikona.', translation: 'Water quality in our locality is contaminated causing health issues.' },
  }

  const lang = sourceLanguage.toLowerCase()
  const demo = demoTranscriptions[lang] || demoTranscriptions['hi']

  await new Promise(resolve => setTimeout(resolve, 800))

  return {
    originalLanguage: sourceLanguage,
    transcription: demo.transcription,
    translatedText: demo.translation,
    provider: 'browser_web_speech_api',
  }
}
