// Browser-local coursework demo. Server-side authentication is needed for deployment.
import { removeRatingsForUser } from './ratings.js'
import { validateRegistration } from './validation.js'

const ACCOUNTS_KEY = 'fit5032.accounts.v1'
const SESSION_KEY = 'fit5032.session.v1'
const iterations = 600000

function accounts() {
  const value = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]')
  if (!Array.isArray(value)) throw new Error('Saved accounts could not be read.')
  let changed = false
  value.forEach((user, index) => {
    if (!user.role) {
      user.role = index === 0 ? 'admin' : 'user'
      changed = true
    }
  })
  if (changed) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(value))
  return value
}

function publicUser(user) {
  return { id: user.id, username: user.username, email: user.email, role: user.role }
}

async function derivePassword(password, salt) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new Uint8Array(salt), iterations, hash: 'SHA-256' },
    key,
    256,
  )
  return Array.from(new Uint8Array(bits), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function registerAccount({ username, email, password }) {
  username = username.trim()
  const validationError = validateRegistration({ username, email, password })
  if (validationError) throw new Error(validationError)
  const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)))
  const passwordHash = await derivePassword(password, salt)
  try {
    const users = accounts()
    if (users.some((user) => user.username === username)) {
      throw new Error('Username already exists.')
    }
    users.push({
      id: crypto.randomUUID(),
      username,
      email: email.trim(),
      role: users.length === 0 ? 'admin' : 'user',
      salt,
      passwordHash,
    })
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(users))
  } catch (error) {
    if (error.message === 'Username already exists.') throw error
    throw new Error('Unable to save your account. Check browser storage and try again.')
  }
}

export async function authenticate(username, password) {
  let user
  try {
    user = accounts().find((account) => account.username === username.trim())
  } catch {
    throw new Error('Unable to read saved accounts. Check browser storage and try again.')
  }
  if (!user || (await derivePassword(password, user.salt)) !== user.passwordHash) {
    throw new Error('Incorrect username or password.')
  }
  try {
    sessionStorage.setItem(SESSION_KEY, user.id)
  } catch {
    throw new Error('Unable to start a session. Allow browser storage and try again.')
  }
  return publicUser(user)
}

export function restoreSession() {
  try {
    const id = sessionStorage.getItem(SESSION_KEY)
    const user = accounts().find((account) => account.id === id)
    return user ? publicUser(user) : null
  } catch {
    return null
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function getAccounts() {
  return accounts().map(publicUser)
}

export function deleteAccount(id) {
  const users = accounts()
  const index = users.findIndex((user) => user.id === id)
  if (index === -1) throw new Error('Account not found.')
  if (users[index].role === 'admin') throw new Error('The administrator account cannot be deleted.')
  const deletedUserId = users[index].id
  users.splice(index, 1)
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(users))
  removeRatingsForUser(deletedUserId)
}
