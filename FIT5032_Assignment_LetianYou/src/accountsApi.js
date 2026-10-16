import { firebaseToken } from './firebaseAuth.js'

async function request(path, method = 'GET') {
  const token = await firebaseToken()
  let response
  try {
    const url = new URL(path, window.location.origin)
    url.searchParams.set('_request', crypto.randomUUID())
    response = await fetch(url, {
      cache: 'no-store',
      method,
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20000),
    })
  } catch {
    throw new Error('The account service is unavailable. Please try again later.')
  }
  let data
  try {
    data = await response.json()
  } catch {
    throw new Error(`Unable to load accounts (HTTP ${response.status}; unexpected response). Please refresh and try again.`)
  }
  if (!response.ok) throw new Error(data.message || 'Unable to manage accounts.')
  return data
}

export async function getAccounts() {
  const accounts = []
  let pageToken
  do {
    const data = await request(
      '/api/accounts' + (pageToken ? '?pageToken=' + encodeURIComponent(pageToken) : ''),
    )
    accounts.push(...data.users)
    pageToken = data.pageToken
  } while (pageToken)
  return accounts
}

export async function deleteAccount(uid) {
  await request('/api/accounts/' + encodeURIComponent(uid), 'DELETE')
}
