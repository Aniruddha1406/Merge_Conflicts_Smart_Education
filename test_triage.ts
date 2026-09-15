import { classifyChallenge } from './src/lib/services/aiService'

const tests = [
  // Should be ADMINISTRATIVE
  { text: 'The streetlight near our school has not worked for two weeks.', expected: 'ADMINISTRATIVE_ISSUE' },
  { text: 'Garbage collection has not happened in our colony for 3 weeks. There is a lot of mess.', expected: 'ADMINISTRATIVE_ISSUE' },
  { text: 'Our ration card is missing and we are not getting food grains from the PDS shop.', expected: 'ADMINISTRATIVE_ISSUE' },
  // Should be INNOVATION
  { text: 'Can we build a low-cost solar-powered smart streetlight system for villages?', expected: 'INNOVATION_CHALLENGE' },
  { text: 'Farmers cannot detect crop disease before the plants are badly damaged. We need early warning.', expected: 'INNOVATION_CHALLENGE' },
  { text: 'Patients travel 30 km to get basic diagnostic tests in a government hospital.', expected: 'INNOVATION_CHALLENGE' },
  { text: 'Students do not have reliable internet for online learning. We need a low-cost solution.', expected: 'INNOVATION_CHALLENGE' },
  { text: 'Water contamination detection is needed using low-cost sensors in our village borewell.', expected: 'INNOVATION_CHALLENGE' },
]

async function main() {
  let pass = 0
  for (const t of tests) {
    const c = await classifyChallenge(t.text, 'en')
    const ok = c.triageType === t.expected
    console.log(`${ok ? '✅' : '❌'} [${t.expected}] Got: ${c.triageType}`)
    console.log(`   Domain: ${c.category} | Conf: ${c.confidence.toFixed(2)}`)
    console.log(`   Text: "${t.text.slice(0, 70)}"`)
    console.log()
    if (ok) pass++
  }
  console.log(`\n${pass}/${tests.length} tests passed`)
}
main().catch(console.error)
