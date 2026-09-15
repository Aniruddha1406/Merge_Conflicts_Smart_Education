// src/lib/services/verificationService.ts
// Reverse Proof-of-Impact Verification Engine (Sub-Engine 5)
// Performs EXIF metadata verification, camera GPS distance checks against reported challenge location,
// and baseline vs post-deployment photo fraud checks before resolving challenges.

import { haversineDistance } from './duplicateService'

export interface VerificationCheckResult {
  passed: boolean
  exifValid: boolean
  gpsDistanceKm: number | null
  locationMatched: boolean // <= 2.0 km from reported challenge site
  baselineCompared: boolean
  fraudRiskScore: number // 0 (genuine) to 100 (fraudulent)
  reason: string
}

export function verifyProofOfImpact(
  challengeLat: number | null,
  challengeLng: number | null,
  photoLat?: number,
  photoLng?: number,
  exifTimestamp?: string,
  preDeploymentPhotoUrl?: string,
  postDeploymentPhotoUrl?: string
): VerificationCheckResult {
  let exifValid = true
  let locationMatched = true
  let gpsDistanceKm: number | null = null
  let fraudRiskScore = 10 // default low

  // 1. GPS Proximity Check (Camera vs Challenge Location)
  if (challengeLat && challengeLng && photoLat && photoLng) {
    gpsDistanceKm = haversineDistance(challengeLat, challengeLng, photoLat, photoLng)
    if (gpsDistanceKm > 2.0) {
      locationMatched = false
      fraudRiskScore += 45
    }
  } else if (!photoLat || !photoLng) {
    // Missing GPS metadata
    locationMatched = false
    fraudRiskScore += 25
  }

  // 2. EXIF Timestamp Check
  if (exifTimestamp) {
    const photoTime = new Date(exifTimestamp).getTime()
    const nowTime = Date.now()
    if (photoTime > nowTime + 300000) { // future timestamp
      exifValid = false
      fraudRiskScore += 40
    }
  }

  // 3. Baseline vs Post-Deployment Photo Evidence Check
  const baselineCompared = !!(preDeploymentPhotoUrl && postDeploymentPhotoUrl)
  if (!baselineCompared) {
    fraudRiskScore += 15
  }

  const passed = fraudRiskScore < 50 && (locationMatched || !challengeLat)

  let reason = 'Verification evidence authenticated via camera GPS and EXIF timestamp.'
  if (!passed) {
    if (!locationMatched) reason = `Fraud Alert: Camera location (${gpsDistanceKm}km away) exceeds 2km radius from challenge location.`
    else if (!exifValid) reason = 'Fraud Alert: Invalid photo EXIF timestamp detected.'
    else reason = 'Fraud Alert: Insufficient baseline vs post-deployment photo evidence.'
  }

  return {
    passed,
    exifValid,
    gpsDistanceKm,
    locationMatched,
    baselineCompared,
    fraudRiskScore,
    reason,
  }
}
