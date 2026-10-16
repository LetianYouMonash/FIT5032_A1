import { initializeApp, deleteApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const email = process.argv[2]
if (!email || !process.env.FIREBASE_PROJECT_ID || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error(
    'Set FIREBASE_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS, then run npm run admin:grant -- email@example.com.',
  )
  process.exitCode = 1
} else {
  const app = initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID })
  try {
    const auth = getAuth(app)
    const user = await auth.getUserByEmail(email)
    if (user.disabled) throw new Error('Disabled accounts cannot be granted administrator access.')
    await auth.setCustomUserClaims(user.uid, { ...user.customClaims, admin: true })
    console.info(
      `Administrator access granted to ${user.email} (UID: ${user.uid}). Sign out and sign in again.`,
    )
  } catch (error) {
    console.error(
      'Unable to grant administrator access. Check the email, project and service account permissions. Code: ' +
        (error.code || 'configuration-error'),
    )
    process.exitCode = 1
  } finally {
    await deleteApp(app)
  }
}
