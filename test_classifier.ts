import { classifyChallenge } from './src/lib/services/aiService'

const testCases = [
  { text: "There is severe heavy metal and arsenic contamination in drinking water in Mandar village. Children are falling ill." },
  { text: "We need a soil testing lab and modern drip irrigation techniques because drought is ruining our crops." },
  { text: "There are no computers or internet at our school. Students cannot learn digital skills." },
  { text: "The local health center has no doctors and the vaccine storage fridge is broken." },
  { text: "Frequent power cuts are destroying local businesses. We need a solar micro-grid installed." }
]

async function run() {
  console.log("Running E2E Classifier Test for All Domains...\n")
  for (const tc of testCases) {
    const res = await classifyChallenge(tc.text)
    console.log(`Text: "${tc.text}"`)
    console.log(`=> Domain: ${res.recommendedDomain}`)
    console.log(`=> Triage: ${res.triageType}`)
    console.log(`=> Tech Core: ${res.technicalCore}`)
    console.log(`=> Keywords: ${res.keywords.join(', ')}`)
    console.log("--------------------------------------------------")
  }
}

run().catch(console.error)
