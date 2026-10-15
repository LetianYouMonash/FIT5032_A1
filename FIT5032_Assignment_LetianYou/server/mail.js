export const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024

export class MailError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function validateMail(value) {
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
    !/^[A-Za-z0-9][A-Za-z0-9 _().-]{0,119}\.(pdf|txt|png|jpe?g)$/i.test(attachment.filename)
  ) {
    throw new MailError(400, 'Choose a PDF, TXT, PNG or JPG file with a simple English filename.')
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
    png: bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    jpg: bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    jpeg: bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255,
    txt: !bytes.includes(0) && Buffer.from(bytes.toString('utf8'), 'utf8').equals(bytes),
  }
  if (!matches[extension])
    throw new MailError(400, 'The file content does not match its extension.')
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

export async function sendMail(mail, config, request = fetch) {
  let response
  try {
    response = await request('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: mail.to }] }],
        from: { email: config.from },
        subject: mail.subject,
        content: [{ type: 'text/plain', value: mail.message }],
        attachments: [mail.attachment],
      }),
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new MailError(
      504,
      'The mail service did not respond. Check your inbox before trying again.',
    )
  }
  if (response.status !== 202) {
    throw new MailError(
      502,
      'The mail service rejected the request. Check the sender configuration and service limits.',
    )
  }
}
