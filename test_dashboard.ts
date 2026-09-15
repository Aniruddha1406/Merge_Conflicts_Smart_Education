import { getDashboardData } from './src/app/actions/challenges'
import { getAllProjects } from './src/app/actions/projects'

async function test() {
  console.log("Fetching dashboard data...")
  const start = Date.now()
  try {
    const s = await getDashboardData()
    console.log("Stats fetched:", s)
    const p = await getAllProjects()
    console.log("Projects fetched:", p.length)
  } catch(e) {
    console.error(e)
  }
}
test().catch(console.error)
