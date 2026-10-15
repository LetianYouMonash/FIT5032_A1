import { initializeApp } from 'firebase/app'
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}
export const firebaseConfigured = Object.values(config).every(
  (value) => typeof value === 'string' && value.trim(),
)
let auth
let ready

async function service() {
  if (!firebaseConfigured) throw new Error('Firebase login has not been configured yet.')
  if (!auth) auth = getAuth(initializeApp(config, 'fit5032-external'))
  if (!ready) {
    ready = setPersistence(auth, browserSessionPersistence).catch((error) => {
      ready = undefined
      throw error
    })
  }
  await ready
  return auth
}

function profile(user) {
  // External users are ordinary users. Local storage never grants cloud admin privileges.
  return user
    ? {
        id: user.uid,
        username: user.displayName || user.email,
        email: user.email,
        role: 'user',
        provider: 'firebase',
      }
    : null
}

export function firebaseError(error) {
  const messages = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/email-already-in-use': 'This email is already registered. Please log in.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Please choose a stronger password.',
    'auth/password-does-not-meet-requirements':
      'The password does not meet the account password policy.',
    'auth/network-request-failed':
      'Cannot connect to Firebase. Check your connection and try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/operation-not-allowed': 'Email/password login is not enabled for this Firebase project.',
    'auth/invalid-api-key': 'Firebase configuration is invalid.',
    'auth/user-disabled': 'This account has been disabled.',
  }
  return messages[error?.code] || 'Firebase authentication is unavailable. Please try again.'
}

export async function firebaseLogin(email, password, registering = false) {
  const client = await service()
  const action = registering ? createUserWithEmailAndPassword : signInWithEmailAndPassword
  const result = await action(client, email.trim(), password)
  return profile(result.user)
}

export async function firebaseLogout() {
  if (auth) await signOut(auth)
}

export async function observeFirebase(callback, onError) {
  if (!firebaseConfigured) {
    callback(null)
    return () => {}
  }
  const client = await service()
  return onAuthStateChanged(client, (user) => callback(profile(user)), onError)
}

// Ratings are stored in this browser and separated by Firebase project.
export function firebaseRatingStore() {
  const key = `fit5032.firebase-ratings.${config.projectId}.v1`
  const read = () => {
    const rows = JSON.parse(localStorage.getItem(key) || '[]')
    if (!Array.isArray(rows)) throw new Error('Saved ratings could not be read.')
    return rows.filter(
      (row) =>
        row &&
        typeof row.userId === 'string' &&
        Number.isInteger(row.score) &&
        row.score >= 1 &&
        row.score <= 5,
    )
  }
  return {
    getRatingSummary(itemId) {
      const rows = read().filter((row) => row.itemId === itemId)
      return {
        count: rows.length,
        average: rows.length
          ? Number((rows.reduce((sum, row) => sum + row.score, 0) / rows.length).toFixed(1))
          : 0,
      }
    },
    getUserRating(itemId, userId) {
      return read().find((row) => row.itemId === itemId && row.userId === userId)?.score || 0
    },
    saveRating(itemId, userId, score) {
      if (!auth?.currentUser || auth.currentUser.uid !== userId)
        throw new Error('Please log in before rating.')
      if (!Number.isInteger(score) || score < 1 || score > 5)
        throw new Error('Please choose a rating from 1 to 5.')
      const rows = read().filter((row) => !(row.itemId === itemId && row.userId === userId))
      rows.push({ itemId, userId, score })
      localStorage.setItem(key, JSON.stringify(rows))
    },
  }
}
