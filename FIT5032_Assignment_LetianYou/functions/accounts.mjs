function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(body))
}

export function accountHandler(auth, ratings) {
  return async (request, response) => {
    const url = new URL(request.url, 'http://localhost')
    if (url.pathname !== '/api/accounts' && !url.pathname.startsWith('/api/accounts/')) return false
    const fail = (status, message) => {
      json(response, status, { message })
      return true
    }
    if (!auth) return fail(503, 'Cloud account management is not configured.')
    const token = /^Bearer ([^\s]+)$/.exec(request.headers.authorization || '')?.[1]
    if (!token || token.length > 8192) return fail(401, 'Please sign in again.')
    let caller
    try {
      caller = await auth.verifyIdToken(token, true)
    } catch (error) {
      if (
        [
          'auth/id-token-expired',
          'auth/id-token-revoked',
          'auth/invalid-id-token',
          'auth/argument-error',
          'auth/invalid-argument',
          'auth/user-disabled',
          'auth/user-not-found',
        ].includes(error.code)
      )
        return fail(401, 'Please sign in again.')
      return fail(503, 'Cloud account management is unavailable. Check the server credentials.')
    }
    if (caller.admin !== true) return fail(403, 'Administrator access is required.')
    try {
      const current = await auth.getUser(caller.uid)
      if (current.disabled || current.customClaims?.admin !== true)
        return fail(403, 'Administrator access is required.')
      if (url.pathname === '/api/accounts') {
        if (request.method !== 'GET') return fail(405, 'Use GET to list accounts.')
        const pageToken = url.searchParams.get('pageToken') || undefined
        if (pageToken && pageToken.length > 2048) return fail(400, 'Invalid page token.')
        const result = await auth.listUsers(1000, pageToken)
        json(response, 200, {
          users: result.users.map((user) => ({
            id: user.uid,
            username: user.displayName || user.email || user.uid,
            email: user.email || '',
            role: user.customClaims?.admin === true ? 'admin' : 'user',
          })),
          pageToken: result.pageToken,
        })
        return true
      }
      if (request.method !== 'DELETE') return fail(405, 'Use DELETE to remove an account.')
      const uid = decodeURIComponent(url.pathname.slice('/api/accounts/'.length))
      if (!uid || uid.length > 128 || uid.includes('/'))
        return fail(400, 'Invalid account identifier.')
      const target = await auth.getUser(uid)
      if (uid === caller.uid || target.customClaims?.admin === true)
        return fail(403, 'Administrator accounts cannot be deleted.')
      await ratings.removeUser(uid)
      await auth.deleteUser(uid)
      json(response, 200, { message: 'Account deleted.' })
    } catch (error) {
      if (error.code === 'auth/user-not-found') return fail(404, 'Account not found.')
      if (error.code === 'auth/invalid-page-token' || error instanceof URIError)
        return fail(400, 'Invalid account request.')
      return fail(
        503,
        'Unable to manage cloud accounts. Check the server credentials and try again.',
      )
    }
    return true
  }
}
