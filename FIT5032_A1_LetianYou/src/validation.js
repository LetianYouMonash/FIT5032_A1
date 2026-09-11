export function validateRegistration({ username, email, password }) {
  const cleanUsername = username.trim()
  const cleanEmail = email.trim()

  if (!cleanUsername) return 'Username is required.'
  if (!cleanEmail) return 'Email is required.'
  if (!password) return 'Password is required.'
  if (!/^[A-Za-z0-9_]{3,30}$/.test(cleanUsername)) {
    return 'Username must be 3–30 characters using letters, numbers, or underscores.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(cleanEmail)) {
    return 'Please enter a valid email address.'
  }
  if (password.length < 6) return 'Password must be at least 6 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must contain an uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Password must contain a lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain a number.'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain a symbol.'
  return ''
}
