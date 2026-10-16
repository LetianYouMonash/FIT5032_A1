
<template>
  <div class="email-page">
    <div class="container py-5">

      <!-- Page Header -->
      <header class="page-header mb-4">
        <div class="row align-items-center g-4">
          <div class="col-lg-8">
            <span class="section-label">
              🌿 RESOURCE SHARING CENTRE
            </span>

            <h1 class="display-6 fw-bold mt-3 mb-3">
              Share Knowledge.
              <span class="text-success">Inspire Change.</span>
            </h1>

            <p class="lead text-secondary mb-0">
              Share useful recycling guides, photos, and documents
              with friends, classmates, and your community.
            </p>
          </div>

          <div class="col-lg-4 text-center">
            <div class="header-icon" aria-hidden="true">
              ✉️
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="row g-4">

        <!-- Email Form -->
        <div class="col-12 col-lg-7">
          <section class="content-card" aria-labelledby="send-title">
            <div class="card-heading">
              <div class="heading-icon" aria-hidden="true">📧</div>

              <div>
                <h2 id="send-title" class="h4 fw-bold mb-1">
                  Send a Resource
                </h2>

                <p class="text-secondary mb-0">
                  Share an environmental resource by email.
                </p>
              </div>
            </div>

            <div
              v-if="!canSend"
              class="alert alert-info mt-4"
              role="status"
            >
              Please log out and sign in with Firebase to send email.
              Local accounts cannot use this service.
            </div>

            <form class="mt-4" @submit.prevent="submit">
              <fieldset :disabled="pending || !canSend">
                <legend class="visually-hidden">
                  Email resource details
                </legend>

                <!-- Recipient -->
                <div class="mb-3">
                  <label for="email-to" class="form-label fw-semibold">
                    Recipient Email
                  </label>

                  <input
                    id="email-to"
                    v-model="to"
                    class="form-control form-control-lg"
                    type="email"
                    placeholder="example@email.com"
                    maxlength="254"
                    autocomplete="email"
                    required
                  />
                </div>

                <!-- Subject -->
                <div class="mb-3">
                  <label for="email-subject" class="form-label fw-semibold">
                    Subject
                  </label>

                  <input
                    id="email-subject"
                    v-model="subject"
                    class="form-control form-control-lg"
                    type="text"
                    placeholder="Recycling resource"
                    maxlength="150"
                    required
                  />
                </div>

                <!-- Message -->
                <div class="mb-3">
                  <label for="email-message" class="form-label fw-semibold">
                    Message
                  </label>

                  <textarea
                    id="email-message"
                    v-model="message"
                    class="form-control"
                    rows="6"
                    maxlength="5000"
                    placeholder="Write your message here..."
                    required
                  ></textarea>
                </div>

                <!-- Attachment -->
                <div class="attachment-box mb-4">
                  <label for="email-file" class="form-label fw-semibold">
                    📎 Attach a Resource
                  </label>

                  <input
                    id="email-file"
                    ref="fileInput"
                    class="form-control"
                    type="file"
                    accept=".pdf,.txt,.png,.jpg,.jpeg"
                    :aria-invalid="attachmentError ? 'true' : undefined"
                    :aria-describedby="
                      attachmentError
                        ? 'attachment-help email-error'
                        : 'attachment-help'
                    "
                    required
                    @change="selectFile"
                  />

                  <p id="attachment-help" class="form-text mb-0">
                    One PDF, TXT, PNG or JPG file, up to 2 MB.
                    Use an English filename.
                  </p>

                  <p
                    v-if="file"
                    class="selected-file mt-2 mb-0"
                  >
                    Selected: {{ file.name }}
                  </p>
                </div>

                <button
                  type="submit"
                  class="btn btn-success btn-lg w-100"
                >
                  {{ pending ? 'Sending...' : 'Send Resource →' }}
                </button>

                <p
                  v-if="pending"
                  class="text-muted mt-3 mb-0"
                  role="status"
                  aria-live="polite"
                >
                  Sending your email. Please wait.
                </p>
              </fieldset>
            </form>

            <!-- Feedback -->
            <p
              v-if="error"
              id="email-error"
              class="alert alert-danger mt-3"
              role="alert"
            >
              {{ error }}
            </p>

            <p
              v-if="success"
              class="alert alert-success mt-3"
              role="status"
            >
              {{ success }}
            </p>
          </section>
        </div>

        <!-- Sidebar -->
        <div class="col-12 col-lg-5">
          <div class="sidebar-stack">

            <!-- Suggested Resources -->
            <section
              class="content-card"
              aria-labelledby="suggestions-title"
            >
              <h2 id="suggestions-title" class="h5 fw-bold mb-3">
                💡 Suggested Resources
              </h2>

              <p class="text-secondary">
                Not sure what to share? Here are some ideas.
              </p>

              <div class="resource-item">
                <div class="resource-icon" aria-hidden="true">♻️</div>
                <div>
                  <h3 class="h6 fw-bold mb-1">
                    Recycling Basics
                  </h3>
                  <p class="small text-secondary mb-0">
                    Help others understand recycling categories
                    and common mistakes.
                  </p>
                </div>
              </div>

              <div class="resource-item">
                <div class="resource-icon" aria-hidden="true">🌱</div>
                <div>
                  <h3 class="h6 fw-bold mb-1">
                    Sustainable Living Tips
                  </h3>
                  <p class="small text-secondary mb-0">
                    Share practical ways to reduce waste
                    and reuse everyday items.
                  </p>
                </div>
              </div>

              <div class="resource-item">
                <div class="resource-icon" aria-hidden="true">📍</div>
                <div>
                  <h3 class="h6 fw-bold mb-1">
                    Recycling Locations
                  </h3>
                  <p class="small text-secondary mb-0">
                    Help friends discover nearby
                    recycling collection points.
                  </p>
                </div>
              </div>

              <button
                type="button"
                class="btn btn-outline-success w-100 mt-3"
                :disabled="pending"
                @click="useSuggestedMessage"
              >
                Use Suggested Message
              </button>
            </section>

            <!-- Attachment Guide -->
            <section
              class="content-card"
              aria-labelledby="attachment-guide-title"
            >
              <h2
                id="attachment-guide-title"
                class="h5 fw-bold mb-3"
              >
                📎 Attachment Guide
              </h2>

              <p class="text-secondary">
                You can attach one resource to your email.
              </p>

              <div class="guide-row">
                <span>Accepted formats</span>
                <strong>PDF, TXT, PNG, JPG</strong>
              </div>

              <div class="guide-row">
                <span>Maximum file size</span>
                <strong>2 MB</strong>
              </div>

              <div class="guide-row">
                <span>Number of files</span>
                <strong>1</strong>
              </div>

              <p class="small text-secondary mt-3 mb-0">
                Make sure you have permission to share
                any documents or images you attach.
              </p>
            </section>

            <!-- Sustainability Message -->
            <section class="green-note">
              <h2 class="h5 fw-bold mb-2">
                🌍 Why Share?
              </h2>

              <p class="mb-0">
                Sharing reliable recycling information
                helps more people make informed
                environmental choices.
              </p>
            </section>

          </div>
        </div>
      </div>

      <!-- Back Button -->
      <div class="mt-4">
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="pending"
          @click="$emit('back-home')"
        >
          ← Back to Home
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { firebaseToken } from './firebaseAuth.js'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true,
  },
})

defineEmits(['back-home'])

const canSend = computed(
  () => props.currentUser.provider === 'firebase'
)

const to = ref('')
const subject = ref('')
const message = ref('')
const file = ref(null)
const fileInput = ref(null)
const pending = ref(false)
const error = ref('')
const success = ref('')
const attachmentError = ref(false)

// Fill in an example recycling resource message.
function useSuggestedMessage() {
  if (pending.value) return

  subject.value = 'Useful Recycling Resources'

  message.value =
    'Hello,\n\n' +
    'I would like to share some useful recycling information with you.\n\n' +
    'Recycling correctly can help reduce waste and protect the environment. ' +
    'You can learn more about recycling categories, sustainable habits, ' +
    'and local collection points through recycling education resources.\n\n' +
    'Please see the attached resource for more information.\n\n' +
    'Best regards'

  error.value = ''
  success.value = ''
}

function selectFile(event) {
  file.value = event.target.files?.[0] || null

  error.value = ''
  success.value = ''
  attachmentError.value = false

  if (
    file.value &&
    (!file.value.size || file.value.size > 2 * 1024 * 1024)
  ) {
    error.value = 'Choose a non-empty file no larger than 2 MB.'
    attachmentError.value = true
    file.value = null
    event.target.value = ''
  }
}

function encodeFile(attachment) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () =>
      resolve(String(reader.result).split(',')[1])

    reader.onerror = () =>
      reject(
        new Error(
          'Unable to read the attachment. Please select it again.'
        )
      )

    reader.readAsDataURL(attachment)
  })
}

async function submit() {
  if (pending.value || !canSend.value) return

  error.value = ''
  success.value = ''
  attachmentError.value = false

  if (!subject.value.trim() || !message.value.trim() || !file.value) {
    error.value =
      'Enter a subject and message, and select an attachment.'

    attachmentError.value = !file.value
    return
  }

  if (
    !/^[A-Za-z0-9][A-Za-z0-9 _().-]{0,119}\.(pdf|txt|png|jpe?g)$/i.test(
      file.value.name
    )
  ) {
    error.value =
      'Choose a PDF, TXT, PNG or JPG file with a simple English filename.'

    attachmentError.value = true
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
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: to.value.trim(),
          subject: subject.value,
          message: message.value,
          attachment: {
            filename: file.value.name,
            content,
          },
        }),
        signal: AbortSignal.timeout(25000),
      })
    } catch {
      throw new Error(
        'The email request could not be completed. Check your inbox before trying again.'
      )
    }

    let result

    try {
      result = await response.json()
    } catch {
      throw new Error(
        'The email service is unavailable. Please contact the site administrator.'
      )
    }

    if (response.status !== 202) {
      throw new Error(result.message || 'Unable to send email.')
    }

    success.value = result.message
    subject.value = ''
    message.value = ''
    file.value = null
    attachmentError.value = false

    if (fileInput.value) {
      fileInput.value.value = ''
    }
  } catch (cause) {
    error.value = cause?.code?.startsWith('auth/')
      ? 'Please sign in with Firebase again.'
      : cause?.message || 'Unable to send email.'

    if (
      cause?.message ===
      'Unable to read the attachment. Please select it again.'
    ) {
      attachmentError.value = true
    }
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.email-page {
  min-height: 100vh;
  background: #f8faf9;
}

.page-header {
  background: linear-gradient(135deg, #e8f5e9, #ffffff);
  border: 1px solid #d9eadb;
  border-radius: 20px;
  padding: 45px;
}

.section-label {
  color: #166534;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 1px;
}

.header-icon {
  width: 170px;
  height: 170px;
  margin: 0 auto;
  border-radius: 50%;
  background: #dff2e3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 5rem;
}

.content-card {
  background: #ffffff;
  border: 1px solid #e2e8e5;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 15px;
}

.heading-icon {
  width: 55px;
  height: 55px;
  background: #e8f5e9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.7rem;
  flex-shrink: 0;
}

.form-control {
  border-radius: 10px;
  border-color: #cedbd2;
}

.form-control:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.15);
}

.attachment-box {
  padding: 20px;
  background: #f3f9f4;
  border: 1px dashed #9fc8a7;
  border-radius: 12px;
}

.selected-file {
  color: #166534;
  font-size: 0.9rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.btn-success {
  border-radius: 10px;
  font-weight: 600;
}

.sidebar-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.resource-item {
  display: flex;
  gap: 14px;
  padding: 15px 0;
  border-bottom: 1px solid #e5e7eb;
}

.resource-icon {
  width: 44px;
  height: 44px;
  background: #e8f5e9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  flex-shrink: 0;
}

.guide-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.9rem;
}

.guide-row strong {
  text-align: right;
}

.green-note {
  padding: 25px;
  background: #e8f5e9;
  border: 1px solid #d0e9d4;
  border-radius: 16px;
  color: #14532d;
}

@media (max-width: 768px) {
  .page-header {
    padding: 30px 24px;
  }

  .header-icon {
    width: 120px;
    height: 120px;
    font-size: 3.5rem;
  }

  .content-card {
    padding: 22px;
  }

  .guide-row {
    flex-wrap: wrap;
  }
}
</style>
