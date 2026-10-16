const ITEM = 'recycling-reuse-information'
function ratingService(db, auth) {
  const rows = db.collection('applicationRatings')
  const marker = uid => db.collection('deletedRatingAccounts').doc(uid)
  async function removeUser(uid) {
    await marker(uid).set({ deleted: true })
    const snapshot = await rows.where('userId', '==', uid).get()
    for (let i = 0; i < snapshot.docs.length; i += 400) {
      const batch = db.batch()
      snapshot.docs.slice(i, i + 400).forEach(doc => batch.delete(doc.ref))
      await batch.commit()
    }
  }
  async function summary(uid) {
    const snapshot = await rows.where('itemId', '==', ITEM).get()
    const ids = [...new Set(snapshot.docs.map(doc => doc.data().userId))]
    const existing = new Set()
    for (let i = 0; i < ids.length; i += 100) {
      const result = await auth.getUsers(ids.slice(i, i + 100).map(uid => ({ uid })))
      result.users.forEach(user => existing.add(user.uid))
    }
    const valid = snapshot.docs.map(doc => doc.data()).filter(row =>
      existing.has(row.userId) && Number.isInteger(row.score) && row.score >= 1 && row.score <= 5)
    // Also clean up accounts deleted directly in the Firebase console.
    for (const id of ids.filter(id => !existing.has(id))) await removeUser(id)
    return {
      count: valid.length,
      average: valid.length ? Number((valid.reduce((sum, row) => sum + row.score, 0) / valid.length).toFixed(1)) : 0,
      userScore: valid.find(row => row.userId === uid)?.score || 0,
    }
  }
  async function save(uid, score) {
    if (!Number.isInteger(score) || score < 1 || score > 5) {
      const error = new Error('Please choose a whole-number rating from 1 to 5.')
      error.status = 400
      throw error
    }
    await db.runTransaction(async transaction => {
      const deleted = await transaction.get(marker(uid))
      if (deleted.exists) {
        const error = new Error('This account has been deleted.')
        error.status = 401
        throw error
      }
      transaction.set(rows.doc(Buffer.from(uid).toString('base64url')), {
        itemId: ITEM, userId: uid, score,
      })
    })
    // A deletion during submission must not leave an orphaned rating.
    try { await auth.getUser(uid) } catch (error) {
      if (error.code === 'auth/user-not-found') await removeUser(uid)
      throw error
    }
  }
  return { summary, save, removeUser }
}
function ratingHandler(auth, ratings) {
  return async (request, response) => {
    if (new URL(request.url, 'http://localhost').pathname !== '/api/ratings') return false
    const reply = (status, body) => {
      response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
      response.end(JSON.stringify(body))
      return true
    }
    try {
      const token = /^Bearer ([^\s]+)$/.exec(request.headers.authorization || '')?.[1]
      if (!token || token.length > 8192) return reply(401, { message: 'Please sign in again.' })
      let user
      try { user = await auth.verifyIdToken(token, true) }
      catch { return reply(401, { message: 'Please sign in again.' }) }
      if (request.method === 'PUT') {
        if (request.headers['content-type']?.split(';')[0] !== 'application/json')
          return reply(415, { message: 'Use application/json.' })
        let body = request.body
        if (body === undefined) {
          const chunks = []
          let size = 0
          for await (const chunk of request) {
            size += chunk.length
            if (size > 1024) return reply(413, { message: 'Rating request is too large.' })
            chunks.push(chunk)
          }
          try { body = JSON.parse(Buffer.concat(chunks).toString()) }
          catch { return reply(400, { message: 'Invalid JSON.' }) }
        }
        if (Buffer.byteLength(JSON.stringify(body)) > 1024)
          return reply(413, { message: 'Rating request is too large.' })
        await ratings.save(user.uid, body?.score)
      } else if (request.method !== 'GET') {
        return reply(405, { message: 'Use GET or PUT for ratings.' })
      }
      return reply(200, await ratings.summary(user.uid))
    } catch (error) {
      return reply(error.status || 503, {
        message: error.status ? error.message : 'Cloud ratings are unavailable. Please try again.',
      })
    }
  }
}
module.exports = { ratingService, ratingHandler }
