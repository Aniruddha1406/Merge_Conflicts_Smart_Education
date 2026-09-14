import { getChallengesByUser } from './src/app/actions/challenges'

async function test() {
  console.log("Fetching for U-CITIZEN-001...")
  const res = await getChallengesByUser('U-CITIZEN-001')
  console.log(`Found ${res.length} challenges.`)
}
test().catch(console.error)
