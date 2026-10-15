const RATINGS_KEY = 'fit5032.ratings.v1'
const ACCOUNTS_KEY = 'fit5032.accounts.v1'

function activeUserIds() {
  const savedAccounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
  return new Set(Array.isArray(savedAccounts) ? savedAccounts.map((account) => account.id) : [])
}

function readRatings() {
  const value = JSON.parse(localStorage.getItem(RATINGS_KEY) || '[]')
  if (!Array.isArray(value)) throw new Error('Saved ratings could not be read.')
  const users = activeUserIds()
  const validRatings = value.filter((rating) => users.has(rating.userId))
  if (validRatings.length !== value.length) {
    localStorage.setItem(RATINGS_KEY, JSON.stringify(validRatings))
  }
  return validRatings
}

export function getRatingSummary(itemId) {
  const ratings = readRatings().filter((rating) => rating.itemId === itemId)
  const total = ratings.reduce((sum, rating) => sum + rating.score, 0)
  return {
    average: ratings.length ? Number((total / ratings.length).toFixed(1)) : 0,
    count: ratings.length,
  }
}

export function getUserRating(itemId, userId) {
  return (
    readRatings().find((rating) => rating.itemId === itemId && rating.userId === userId)?.score ?? 0
  )
}

export function saveRating(itemId, userId, score) {
  if (!userId) throw new Error('You must be logged in to submit a rating.')
  if (!Number.isInteger(score) || score < 1 || score > 5) {
    throw new Error('Please choose a rating from 1 to 5.')
  }

  const ratings = readRatings()
  const existing = ratings.find((rating) => rating.itemId === itemId && rating.userId === userId)
  if (existing) existing.score = score
  else ratings.push({ itemId, userId, score })
  localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings))
}

export function removeRatingsForUser(userId) {
  const remaining = readRatings().filter((rating) => rating.userId !== userId)
  localStorage.setItem(RATINGS_KEY, JSON.stringify(remaining))
}
