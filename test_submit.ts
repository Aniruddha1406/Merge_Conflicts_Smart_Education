import { submitChallenge } from './src/app/actions/challenges'

async function testSubmit() {
  const result = await submitChallenge({
    title: "Flood problem.",
    description: "Flood problem.",
    domain: "Water & Sanitation",
    district: "Ranchi",
    reporterType: "citizen",
    submittedById: "U-CITIZEN-001",
    submittedByName: "Test User",
    language: "en"
  })
  console.log("Result:", result)
}

testSubmit().catch(console.error)
