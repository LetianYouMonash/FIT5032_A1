import { initializeApp } from 'firebase/app'
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  onIdTokenChanged,
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

async function profile(user) {
  const token = user ? await user.getIdTokenResult() : null
  return user
    ? {
        id: user.uid,
        username: user.displayName || user.email,
        email: user.email,
        role: token.claims.admin === true ? 'admin' : 'user',
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

export async function firebaseToken() {
  const client = await service()
  if (!client.currentUser) throw new Error('Please sign in again.')
  return client.currentUser.getIdToken()
}

export async function observeFirebase(callback, onError) {
  if (!firebaseConfigured) {
    callback(null)
    return () => {}
  }
  const client = await service()
  let active = true
  let version = 0
  const stop = onIdTokenChanged(
    client,
    async (user) => {
      const request = ++version
      try {
        const value = await profile(user)
        if (active && request === version) callback(value)
      } catch (error) {
        if (active && request === version) {
          callback(null)
          onError?.(error)
        }
      }
    },
    onError,
  )
  return () => {
    active = false
    stop()
  }
}

