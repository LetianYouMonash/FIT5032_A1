<template>
  <main class="container py-5" style="max-width: 720px">
    <h1>Email a resource</h1>
    <p>Share a recycling guide, photo or document by email.</p>
    <p v-if="!canSend" class="alert alert-info">
      Please log out and sign in with Firebase to send email. Local accounts cannot use this
      service.
    </p>
    <form @submit.prevent="submit">
      <fieldset :disabled="pending || !canSend">
        <div class="mb-3">
          <label for="email-to" class="form-label">Recipient email</label>
          <input
            id="email-to"
            v-model="to"
            class="form-control"
            type="email"
            maxlength="254"
            required
          />
        </div>
        <div class="mb-3">
          <label for="email-subject" class="form-label">Subject</label>
          <input
            id="email-subject"
            v-model="subject"
            class="form-control"
            maxlength="150"
            required
          />
        </div>
        <div class="mb-3">
          <label for="email-message" class="form-label">Message</label>
          <textarea
            id="email-message"
            v-model="message"
            class="form-control"
            rows="5"
            maxlength="5000"
            required
          ></textarea>
        </div>
        <div class="mb-3">
          <label for="email-file" class="form-label">Attachment</label>
          <input
            id="email-file"
            ref="fileInput"
            class="form-control"
            type="file"
            accept=".pdf,.txt,.png,.jpg,.jpeg"
            aria-describedby="attachment-help"
            required
            @change="selectFile"
          />
          <p id="attachment-help" class="form-text">
            One PDF, TXT, PNG or JPG file, up to 2 MB. Use an English filename.
          </p>
        </div>
        <button class="btn btn-primary" type="submit">
          {{ pending ? 'Sending...' : 'Send email' }}
        </button>
      </fieldset>
    </form>
    <p v-if="error" class="alert alert-danger mt-3" role="alert">{{ error }}</p>
    <p v-if="success" class="alert alert-success mt-3" role="status">{{ success }}</p>
    <button class="btn btn-outline-secondary mt-3" :disabled="pending" @click="$emit('back-home')">
      Back to Home
    </button>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { firebaseToken } from './firebaseAuth.js'

const props = defineProps({ currentUser: { type: Object, required: true } })
defineEmits(['back-home'])
const canSend = computed(() => props.currentUser.provider === 'firebase')
const to = ref('')
const subject = ref('')
const message = ref('')
const file = ref(null)
const fileInput = ref(null)
const pending = ref(false)
const error = ref('')
const success = ref('')

function selectFile(event) {
  file.value = event.target.files?.[0] || null
  error.value = ''
  success.value = ''
  if (file.value && (!file.value.size || file.value.size > 2 * 1024 * 1024)) {
    error.value = 'Choose a non-empty file no larger than 2 MB.'
    file.value = null
    event.target.value = ''
  }
}

function encodeFile(attachment) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = () =>
      reject(new Error('Unable to read the attachment. Please select it again.'))
    reader.readAsDataURL(attachment)
  })
}

async function submit() {
  if (pending.value || !canSend.value) return
  error.value = ''
  success.value = ''
  if (!subject.value.trim() || !message.value.trim() || !file.value) {
    error.value = 'Enter a subject and message, and select an attachment.'
    return
  }
  if (!/^[A-Za-z0-9][A-Za-z0-9 _().-]{0,119}\.(pdf|txt|png|jpe?g)$/i.test(file.value.name)) {
    error.value = 'Choose a PDF, TXT, PNG or JPG file with a simple English filename.'
    return
  }
  pending.value = true
  try {
    const token = await firebaseToken()
    const content = await encodeFile(file.value)
    let response
    try {
      response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          to: to.value.trim(),
          subject: subject.value,
          message: message.value,
          attachment: { filename: file.value.name, content },
        }),
        signal: AbortSignal.timeout(25000),
      })
    } catch {
      throw new Error(
        'The email request could not be completed. Check your inbox before trying again.',
      )
    }
    let result
    try {
      result = await response.json()
    } catch {
      throw new Error('The email service is unavailable. Please contact the site administrator.')
    }
    if (response.status !== 202) throw new Error(result.message || 'Unable to send email.')
    success.value = result.message
    subject.value = ''
    message.value = ''
    file.value = null
    fileInput.value.value = ''
  } catch (cause) {
    error.value = cause.code?.startsWith('auth/')
      ? 'Please sign in with Firebase again.'
      : cause.message
  } finally {
    pending.value = false
  }
}
</script>
