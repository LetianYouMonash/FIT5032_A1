import { createServer } from 'node:http'
import { pathToFileURL } from 'node:url'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { MailError, validateMail, sendMail } from './mail.js'
import { accountHandler } from './accounts.js'

const MAX_BODY_BYTES = 3 * 1024 * 1024

function respond(response, status, message) {
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify({ message }))
}

async function readBody(request) {
  const chunks = []
  let length = 0
  for await (const chunk of request) {
    length += chunk.length
    if (length > MAX_BODY_BYTES)
      throw new MailError(413, 'The request exceeds the attachment size limit.')
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new MailError(400, 'The request must contain valid JSON.')
  }
}

export function createMailServer({
  config,
  verifyToken,
  deliver = sendMail,
  now = Date.now,
  handleAccounts,
}) {
  const attempts = new Map()
  let total = { start: now(), count: 0 }
  const hour = 60 * 60 * 1000

  return createServer(
    { requestTimeout: 30000, headersTimeout: 10000 },
    async (request, response) => {
      try {
        if (handleAccounts && (await handleAccounts(request, response))) return
        if (request.url !== '/api/email') throw new MailError(404, 'Not found.')
        if (request.method !== 'POST') throw new MailError(405, 'Use POST to send email.')
        if (!config.projectId || !config.apiKey || !config.from) {
          throw new MailError(
            503,
            'Email is not configured. Please contact the site administrator.',
          )
        }
        if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
          throw new MailError(415, 'The request must use application/json.')
        }
        if (Number(request.headers['content-length']) > MAX_BODY_BYTES) {
          throw new MailError(413, 'The request exceeds the attachment size limit.')
        }
        const match = /^Bearer ([^\s]+)$/.exec(request.headers.authorization || '')
        if (!match || match[1].length > 8192)
          throw new MailError(401, 'Please sign in with Firebase to send email.')
        let user
        try {
          user = await verifyToken(match[1])
        } catch {
          throw new MailError(401, 'Your session could not be verified. Please sign in again.')
        }
        if (!user?.uid) throw new MailError(401, 'Please sign in again.')

        const timestamp = now()
        for (const [uid, entry] of attempts) {
          if (timestamp - entry.start >= hour) attempts.delete(uid)
        }
        if (timestamp - total.start >= hour) total = { start: timestamp, count: 0 }
        const previous = attempts.get(user.uid)
        if (
          total.count >= 30 ||
          (previous && (previous.count >= 5 || timestamp - previous.last < 60000))
        ) {
          throw new MailError(
            429,
            'Email limit reached. Wait at least one minute; each account can make five attempts per hour.',
          )
        }

        const mail = validateMail(await readBody(request))
        // Recheck after reading the body so concurrent requests cannot bypass the limit.
        const current = attempts.get(user.uid)
        if (
          total.count >= 30 ||
          (current && (current.count >= 5 || now() - current.last < 60000))
        ) {
          throw new MailError(429, 'Email limit reached. Please try again later.')
        }
        attempts.set(user.uid, {
          start: current?.start ?? now(),
          last: now(),
          count: (current?.count ?? 0) + 1,
        })
        total.count += 1
        await deliver(mail, config)
        respond(
          response,
          202,
          'Your email was accepted for delivery. Check the recipient inbox and spam folder.',
        )
      } catch (error) {
        if (!response.headersSent && !response.destroyed) {
          respond(
            response,
            error instanceof MailError ? error.status : 500,
            error instanceof MailError
              ? error.message
              : 'Unable to send email. Please try again later.',
          )
        }
      }
    },
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    apiKey: process.env.SENDGRID_API_KEY,
    from: process.env.SENDGRID_FROM_EMAIL,
  }
  const auth = config.projectId ? getAuth(initializeApp({ projectId: config.projectId })) : null
  const server = createMailServer({
    config,
    verifyToken: (token) => auth.verifyIdToken(token),
    handleAccounts: accountHandler(auth),
  })
  const port = Number(process.env.PORT || 3001)
  const host = process.env.HOST || '127.0.0.1'
  server.listen(port, host, () => console.info(`Mail API listening on http://${host}:${port}`))
  server.on('error', (error) => {
    console.error(`Mail API failed to start (${error.code}).`)
    process.exitCode = 1
  })
}
