
<template>
  <main class="container py-5">
    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <div>
        <h1>My Profile</h1>
        <p class="text-muted mb-0">
          View and manage your account information and security details.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-primary"
        @click="$emit('back-home')"
      >
        Back to Home
      </button>
    </div>

    <template v-if="currentUser">
      <!-- Profile Overview -->
      <section class="mb-4" aria-labelledby="profile-overview-title">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex flex-wrap align-items-center gap-4">
              <div
                class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center flex-shrink-0"
                style="width: 80px; height: 80px; font-size: 2rem"
                role="img"
                :aria-label="`Profile avatar for ${displayName}`"
              >
                {{ initials }}
              </div>

              <div class="flex-grow-1">
                <h2 id="profile-overview-title" class="h3 mb-1">
                  {{ displayName }}
                </h2>

                <p class="text-muted mb-2 text-break">
                  {{ displayEmail }}
                </p>

                <div class="d-flex flex-wrap gap-2">
                  <span
                    class="badge"
                    :class="
                      isAdmin
                        ? 'text-bg-danger'
                        : 'text-bg-secondary'
                    "
                  >
                    {{ displayRole }}
                  </span>

                  <span class="badge text-bg-success">
                    Signed In
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Account Information -->
      <section class="mb-4" aria-labelledby="account-info-title">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 id="account-info-title" class="h4 mb-4">
              Account Information
            </h2>

            <dl class="row mb-0">
              <dt class="col-sm-4 mb-2">Username</dt>
              <dd class="col-sm-8 mb-3">{{ displayName }}</dd>

              <dt class="col-sm-4 mb-2">Email Address</dt>
              <dd class="col-sm-8 mb-3 text-break">
                {{ displayEmail }}
              </dd>

              <dt class="col-sm-4 mb-2">Account Role</dt>
              <dd class="col-sm-8 mb-3">
                <span
                  class="badge"
                  :class="
                    isAdmin
                      ? 'text-bg-danger'
                      : 'text-bg-secondary'
                  "
                >
                  {{ displayRole }}
                </span>
              </dd>

              <dt class="col-sm-4 mb-2">
                Authentication Provider
              </dt>
              <dd class="col-sm-8 mb-3">
                {{ providerName }}
              </dd>

              <dt class="col-sm-4 mb-2">Account Status</dt>
              <dd class="col-sm-8">
                <span class="text-success fw-semibold">
                  Active Session
                </span>
              </dd>
            </dl>
          </div>
        </div>
      </section>

      <!-- Edit Username -->
      <section class="mb-4" aria-labelledby="edit-username-title">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 id="edit-username-title" class="h4 mb-3">
              Edit Username
            </h2>

            <form @submit.prevent="saveUsername">
              <div class="mb-3">
                <label for="newUsername" class="form-label">
                  New Username
                </label>

                <input
                  id="newUsername"
                  v-model="usernameInput"
                  type="text"
                  class="form-control"
                  minlength="2"
                  maxlength="50"
                  autocomplete="nickname"
                  required
                  :disabled="busy || !isFirebaseUser"
                />

                <div class="form-text">
                  Username must contain 2–50 characters.
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-success"
                :disabled="busy || !isFirebaseUser"
              >
                {{ busy === 'username' ? 'Saving...' : 'Save Username' }}
              </button>
            </form>

            <div
              v-if="usernameMessage"
              class="alert mt-3 mb-0"
              :class="usernameError ? 'alert-danger' : 'alert-success'"
              :role="usernameError ? 'alert' : 'status'"
            >
              {{ usernameMessage }}
            </div>
          </div>
        </div>
      </section>

      <!-- Change Email -->
      <section class="mb-4" aria-labelledby="change-email-title">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 id="change-email-title" class="h4 mb-3">
              Change Email Address
            </h2>

            <p class="text-muted">
              Enter your new email address and current password.
              You must verify the new email address before the change takes effect.
            </p>

            <form @submit.prevent="saveEmail">
              <div class="mb-3">
                <label for="currentEmail" class="form-label">
                  Current Email
                </label>

                <input
                  id="currentEmail"
                  :value="displayEmail"
                  type="text"
                  class="form-control"
                  readonly
                />
              </div>

              <div class="mb-3">
                <label for="newEmail" class="form-label">
                  New Email Address
                </label>

                <input
                  id="newEmail"
                  v-model="newEmail"
                  type="email"
                  class="form-control"
                  autocomplete="email"
                  required
                  :disabled="busy || !isFirebaseUser"
                />
              </div>

              <div class="mb-3">
                <label for="emailPassword" class="form-label">
                  Current Password
                </label>

                <input
                  id="emailPassword"
                  v-model="emailPassword"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                  :disabled="busy || !isFirebaseUser"
                />
              </div>

              <button
                type="submit"
                class="btn btn-success"
                :disabled="busy || !isFirebaseUser"
              >
                {{ busy === 'email' ? 'Sending...' : 'Send Verification Email' }}
              </button>
            </form>

            <div
              v-if="emailMessage"
              class="alert mt-3 mb-0"
              :class="emailError ? 'alert-danger' : 'alert-success'"
              :role="emailError ? 'alert' : 'status'"
            >
              {{ emailMessage }}
            </div>
          </div>
        </div>
      </section>

      <!-- Change Password -->
      <section class="mb-4" aria-labelledby="change-password-title">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 id="change-password-title" class="h4 mb-3">
              Change Password
            </h2>

            <form @submit.prevent="savePassword">
              <div class="mb-3">
                <label for="currentPassword" class="form-label">
                  Current Password
                </label>

                <input
                  id="currentPassword"
                  v-model="currentPassword"
                  type="password"
                  class="form-control"
                  autocomplete="current-password"
                  required
                  :disabled="busy || !isFirebaseUser"
                />
              </div>

              <div class="mb-3">
                <label for="newPassword" class="form-label">
                  New Password
                </label>

                <input
                  id="newPassword"
                  v-model="newPassword"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  minlength="8"
                  required
                  :disabled="busy || !isFirebaseUser"
                />

                <div class="form-text">
                  Use at least 8 characters.
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label">
                  Confirm New Password
                </label>

                <input
                  id="confirmPassword"
                  v-model="confirmPassword"
                  type="password"
                  class="form-control"
                  autocomplete="new-password"
                  minlength="8"
                  required
                  :disabled="busy || !isFirebaseUser"
                />
              </div>

              <button
                type="submit"
                class="btn btn-success"
                :disabled="busy || !isFirebaseUser"
              >
                {{ busy === 'password' ? 'Updating...' : 'Update Password' }}
              </button>
            </form>

            <div
              v-if="passwordMessage"
              class="alert mt-3 mb-0"
              :class="passwordError ? 'alert-danger' : 'alert-success'"
              :role="passwordError ? 'alert' : 'status'"
            >
              {{ passwordMessage }}
            </div>
          </div>
        </div>
      </section>

      <!-- Profile Completeness -->
      <section class="mb-4" aria-labelledby="completion-title">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 id="completion-title" class="h4 mb-3">
              Profile Completeness
            </h2>

            <div class="d-flex justify-content-between mb-2">
              <span>Basic account information</span>
              <strong>{{ completionPercentage }}%</strong>
            </div>

            <div
              class="progress"
              role="progressbar"
              :aria-valuenow="completionPercentage"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="Basic profile completeness"
              style="height: 12px"
            >
              <div
                class="progress-bar bg-success"
                :style="{ width: `${completionPercentage}%` }"
              ></div>
            </div>

            <p class="text-muted small mt-3 mb-0">
              This indicator is based on your username and email
              address being available. It does not measure account
              security or email verification.
            </p>
          </div>
        </div>
      </section>

      <!-- Account Security -->
      <section class="mb-4" aria-labelledby="security-title">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <h2 id="security-title" class="h4 mb-3">
              Account Security
            </h2>

            <div class="d-flex align-items-start gap-3">
              <div class="fs-2" aria-hidden="true">
                🔒
              </div>

              <div>
                <h3 class="h5">
                  Authentication Method
                </h3>

                <p class="mb-2">
                  Your account is using
                  <strong>{{ providerName }}</strong>.
                </p>

                <template v-if="isFirebaseUser">
                  <p class="text-muted mb-3">
                    Firebase Authentication manages your sign-in
                    session. Sensitive account changes require
                    authentication.
                  </p>

                  <a
                    href="https://firebase.google.com/docs/auth"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-outline-primary btn-sm"
                  >
                    Learn About Firebase Authentication
                    <span aria-hidden="true">↗</span>
                  </a>
                </template>

                <template v-else>
                  <p class="text-muted mb-0">
                    This account uses the application's local
                    authentication system. Profile editing is
                    currently available only for Firebase accounts.
                  </p>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Privacy Notice -->
      <section aria-labelledby="privacy-title">
        <div class="alert alert-info">
          <h2 id="privacy-title" class="h5">
            Privacy Reminder
          </h2>

          <p class="mb-0">
            Keep your account credentials private and always
            sign out when using a shared or public device.
          </p>
        </div>
      </section>
    </template>

    <!-- No Logged-In User -->
    <section
      v-else
      class="card text-center shadow-sm"
      aria-labelledby="no-profile-title"
    >
      <div class="card-body p-5">
        <div class="fs-1 mb-3" aria-hidden="true">
          👤
        </div>

        <h2 id="no-profile-title" class="h4">
          No Profile Available
        </h2>

        <p class="text-muted mb-0">
          Please sign in to view your account information.
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import {
  firebaseUpdateUsername,
  firebaseUpdateEmail,
  firebaseUpdatePassword,
  firebaseError,
} from './firebaseAuth.js'

const props = defineProps({
  currentUser: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['back-home', 'profile-updated'])

const usernameInput = ref('')
const newEmail = ref('')
const emailPassword = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const busy = ref('')

const usernameMessage = ref('')
const emailMessage = ref('')
const passwordMessage = ref('')

const usernameError = ref(false)
const emailError = ref(false)
const passwordError = ref(false)

watch(
  () => props.currentUser?.username,
  (username) => {
    usernameInput.value = username || ''
  },
  { immediate: true }
)

const displayName = computed(() => {
  const username = props.currentUser?.username

  return username && String(username).trim()
    ? String(username).trim()
    : 'Unknown User'
})

const displayEmail = computed(() => {
  const email = props.currentUser?.email

  return email && String(email).trim()
    ? String(email).trim()
    : 'Not provided'
})

const displayRole = computed(() => {
  const role = props.currentUser?.role

  return role && String(role).trim()
    ? String(role).trim()
    : 'User'
})

const isAdmin = computed(
  () => String(props.currentUser?.role ?? '').toLowerCase() === 'admin'
)

const isFirebaseUser = computed(
  () => props.currentUser?.provider === 'firebase'
)

const providerName = computed(() =>
  isFirebaseUser.value
    ? 'Firebase Authentication'
    : 'Local Account'
)

const initials = computed(() => {
  const username = props.currentUser?.username

  if (!username || !String(username).trim()) {
    return '?'
  }

  const parts = String(username)
    .trim()
    .split(/\s+/)

  if (parts.length >= 2) {
    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase()
  }

  return parts[0].slice(0, 2).toUpperCase()
})

const completionPercentage = computed(() => {
  if (!props.currentUser) return 0

  const fields = [
    props.currentUser.username,
    props.currentUser.email,
  ]

  const completedFields = fields.filter(
    (value) => value != null && String(value).trim() !== ''
  ).length

  return Math.round((completedFields / fields.length) * 100)
})

async function saveUsername() {
  usernameMessage.value = ''
  usernameError.value = false

  const username = usernameInput.value.trim()

  if (username === props.currentUser?.username) {
    usernameMessage.value = 'Username has not changed.'
    return
  }

  busy.value = 'username'

  try {
    const updatedUser = await firebaseUpdateUsername(username)

    emit('profile-updated', updatedUser)

    usernameMessage.value = 'Username updated successfully.'
  } catch (error) {
    usernameError.value = true
    usernameMessage.value = firebaseError(error)
  } finally {
    busy.value = ''
  }
}

async function saveEmail() {
  emailMessage.value = ''
  emailError.value = false
  busy.value = 'email'

  try {
    emailMessage.value = await firebaseUpdateEmail(
      newEmail.value,
      emailPassword.value
    )

    emailPassword.value = ''
  } catch (error) {
    emailError.value = true
    emailMessage.value = firebaseError(error)
  } finally {
    busy.value = ''
  }
}

async function savePassword() {
  passwordMessage.value = ''
  passwordError.value = false

  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = true
    passwordMessage.value = 'New passwords do not match.'
    return
  }

  busy.value = 'password'

  try {
    passwordMessage.value = await firebaseUpdatePassword(
      currentPassword.value,
      newPassword.value
    )

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    passwordError.value = true
    passwordMessage.value = firebaseError(error)
  } finally {
    busy.value = ''
  }
}
</script>
