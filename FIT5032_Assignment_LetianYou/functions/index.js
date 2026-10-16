
const { onRequest } = require('firebase-functions/v2/https')
const { defineSecret } = require('firebase-functions/params')
const { initializeApp } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const logger = require('firebase-functions/logger')

initializeApp()

const SENDGRID_API_KEY = defineSecret('SENDGRID_API_KEY')
const SENDGRID_FROM_EMAIL = defineSecret('SENDGRID_FROM_EMAIL')

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024
const MAX_BODY_BYTES = 3 * 1024 * 1024
const HOUR_MS = 60 * 60 * 1000

// These limits apply to each running function instance.
// A shared database is required for global rate limiting.
const attempts = new Map()
let total = { start: Date.now(), count: 0 }

class MailError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function validateMail(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new MailError(400, 'Please provide an email and attachment.')
  }

  const { to, subject, message, attachment } = value

  if (
    typeof to !== 'string' ||
    to.length > 254 ||
    !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(to.trim())
  ) {
    throw new MailError(400, 'Please enter one valid recipient email address.')
  }

  if (
    typeof subject !== 'string' ||
    !subject.trim() ||
    subject.length > 150 ||
    /[\r\n\x00]/.test(subject)
  ) {
    throw new MailError(400, 'Enter a subject of up to 150 characters on one line.')
  }

  if (
    typeof message !== 'string' ||
    !message.trim() ||
    message.length > 5000 ||
    message.includes('\0')
  ) {
    throw new MailError(400, 'Enter a message of up to 5,000 characters.')
  }

  if (
    !attachment ||
    typeof attachment.filename !== 'string' ||
    !/^[A-Za-z0-9][A-Za-z0-9 _().-]{0,119}\.(pdf|txt|png|jpe?g)$/i.test(
      attachment.filename
    )
  ) {
    throw new MailError(
      400,
      'Choose a PDF, TXT, PNG or JPG file with a simple English filename.'
    )
  }

  const content = attachment.content

  if (
    typeof content !== 'string' ||
    !content.length ||
    content.length > Math.ceil(MAX_ATTACHMENT_BYTES / 3) * 4 ||
    content.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(content)
  ) {
    throw new MailError(400, 'The attachment is invalid or exceeds 2 MB.')
  }

  const bytes = Buffer.from(content, 'base64')

  if (
    !bytes.length ||
    bytes.length > MAX_ATTACHMENT_BYTES ||
    bytes.toString('base64') !== content
  ) {
    throw new MailError(400, 'The attachment is invalid or exceeds 2 MB.')
  }

  const extension = attachment.filename.split('.').at(-1).toLowerCase()

  const types = {
    pdf: 'application/pdf',
    txt: 'text/plain',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
  }

  const matches = {
    pdf: bytes.subarray(0, 5).toString('ascii') === '%PDF-',
    png: bytes.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    ),
    jpg: bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    jpeg: bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    txt:
      !bytes.includes(0) &&
      Buffer.from(bytes.toString('utf8'), 'utf8').equals(bytes),
  }

  if (!matches[extension]) {
    throw new MailError(400, 'The file content does not match its extension.')
  }

  return {
    to: to.trim(),
    subject: subject.trim(),
    message: message.trim(),
    attachment: {
      filename: attachment.filename,
      content,
      type: types[extension],
      disposition: 'attachment',
    },
  }
}

function checkRateLimit(uid) {
  const now = Date.now()

  for (const [id, entry] of attempts) {
    if (now - entry.start >= HOUR_MS) attempts.delete(id)
  }

  if (now - total.start >= HOUR_MS) {
    total = { start: now, count: 0 }
  }

  let previous = attempts.get(uid)

  if (previous && now - previous.start >= HOUR_MS) {
    attempts.delete(uid)
    previous = undefined
  }

  if (
    total.count >= 30 ||
    (previous && (previous.count >= 5 || now - previous.last < 60000))
  ) {
    throw new MailError(
      429,
      'Email limit reached. Wait at least one minute; each account can make five attempts per hour.'
    )
  }

  attempts.set(uid, {
    start: previous?.start ?? now,
    last: now,
    count: (previous?.count ?? 0) + 1,
  })

  total.count += 1
}

async function sendMail(mail) {
  let response

  try {
    response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: mail.to }] }],
        from: { email: SENDGRID_FROM_EMAIL.value() },
        subject: mail.subject,
        content: [{ type: 'text/plain', value: mail.message }],
        attachments: [mail.attachment],
      }),
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new MailError(
      504,
      'The mail service did not respond. Check your inbox before trying again.'
    )
  }

  if (response.status !== 202) {
    logger.error('SendGrid rejected the email request', {
      status: response.status,
    })

    throw new MailError(
      502,
      'The mail service rejected the request. Check the sender configuration and service limits.'
    )
  }
}

exports.sendEmail = onRequest(
  {
    region: 'australia-southeast1',
    maxInstances: 2,
    concurrency: 1,
    timeoutSeconds: 30,
    memory: '256MiB',
    invoker: 'public',
    secrets: [SENDGRID_API_KEY, SENDGRID_FROM_EMAIL],
  },
  async (request, response) => {
    response.set('Cache-Control', 'no-store')
    response.set('Content-Type', 'application/json')

    try {
      if (request.method !== 'POST') {
        throw new MailError(405, 'Use POST to send email.')
      }

      if (!request.path.endsWith('/api/email') &&
          request.path !== '/' &&
          request.path !== '/api/email') {
        throw new MailError(404, 'Not found.')
      }

      if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
        throw new MailError(415, 'The request must use application/json.')
      }

      const bodySize = Buffer.byteLength(JSON.stringify(request.body ?? {}))

      if (
        Number(request.headers['content-length']) > MAX_BODY_BYTES ||
        bodySize > MAX_BODY_BYTES
      ) {
        throw new MailError(413, 'The request exceeds the attachment size limit.')
      }

      const match = /^Bearer ([^\s]+)$/.exec(
        request.headers.authorization || ''
      )

      if (!match || match[1].length > 8192) {
        throw new MailError(401, 'Please sign in with Firebase to send email.')
      }

      let user

      try {
        user = await getAuth().verifyIdToken(match[1], true)
      } catch {
        throw new MailError(
          401,
          'Your session could not be verified. Please sign in again.'
        )
      }

      if (!user?.uid) {
        throw new MailError(401, 'Please sign in again.')
      }

      const mail = validateMail(request.body)

      checkRateLimit(user.uid)

      await sendMail(mail)

      response.status(202).json({
        message:
          'Your email was accepted for delivery. Check the recipient inbox and spam folder.',
      })
    } catch (error) {
      if (!(error instanceof MailError)) {
        logger.error('Unexpected mail function error', {
          message: error?.message,
        })
      }

      response.status(error instanceof MailError ? error.status : 500).json({
        message:
          error instanceof MailError
            ? error.message
            : 'Unable to send email. Please try again later.',
      })
    }
  }
)

const { getFirestore } = require('firebase-admin/firestore')
const { ratingService, ratingHandler } = require('./ratings.cjs')
const cloudRatings = ratingService(getFirestore('letianyou'), getAuth())
exports.accountApi = onRequest(
  { region: 'australia-southeast1', maxInstances: 2, timeoutSeconds: 60 },
  async (request, response) => {
    const { accountHandler } = await import('./accounts.mjs')
    if (await ratingHandler(getAuth(), cloudRatings)(request, response)) return
    if (await accountHandler(getAuth(), cloudRatings)(request, response)) return
    response.status(404).json({ message: 'Not found.' })
  },
)
