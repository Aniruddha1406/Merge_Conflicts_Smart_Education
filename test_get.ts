import { getAllChallenges } from './src/app/actions/challenges'

async function test() {
  console.log("Fetching all challenges...")
  const start = Date.now()
  const res = await getAllChallenges()
  console.log(`Fetched ${res.length} challenges in ${Date.now() - start}ms`)
}
test().catch(console.error)
