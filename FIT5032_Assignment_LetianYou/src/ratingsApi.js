import { firebaseToken } from './firebaseAuth.js'

async function request(score) {
  const token = await firebaseToken()
  let response
  try {
    const url = new URL('/api/ratings', window.location.origin)
    url.searchParams.set('_request', crypto.randomUUID())
    response = await fetch(url, {
      cache: 'no-store',
      method: score === undefined ? 'GET' : 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: score === undefined ? undefined : JSON.stringify({ score }),
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new Error('Cloud ratings are unavailable. Please try again.')
  }
  let data
  try { data = await response.json() }
  catch { throw new Error(`Unable to load ratings (HTTP ${response.status}; unexpected response). Please refresh and try again.`) }
  if (!response.ok) throw new Error(data.message || 'Unable to load ratings.')
  return data
}
export const ratingService = {
  getRatingSummary: () => request(),
  saveRating: (_itemId, _userId, score) => request(score),
}
