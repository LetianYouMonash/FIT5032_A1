
<template>
  <div class="auth-page">
    <div class="container py-5">
      <div class="auth-layout">

        <!-- Left: Introduction -->
        <section class="intro-panel" aria-labelledby="intro-title">
          <div class="brand">
            <span aria-hidden="true">🌿</span>
            Recycling Application
          </div>

          <div class="intro-content">
            <div class="intro-icon" aria-hidden="true">♻️</div>

            <h2 id="intro-title" class="display-6 fw-bold mb-3">
              A Greener Future Starts Here
            </h2>

            <p class="intro-description">
              Learn how to recycle smarter, find collection
              locations, and make a positive impact on
              the environment.
            </p>

            <div class="benefits mt-4">
              <p>✓ Explore recycling resources</p>
              <p>✓ Find recycling collection points</p>
              <p>✓ Learn sustainable living habits</p>
            </div>
          </div>

          <p class="intro-footer mb-0">
            Small actions. Big impact.
          </p>
        </section>

        <!-- Right: Login / Register -->
        <section class="form-panel" aria-labelledby="auth-title">
          <div class="auth-card">
            <div class="text-center mb-4">
              <div class="form-icon" aria-hidden="true">
                {{ registering ? '🌱' : '👋' }}
              </div>

              <h1 id="auth-title" class="h2 fw-bold mb-2">
                {{ registering ? 'Create an Account' : 'Welcome Back' }}
              </h1>

              <p class="text-secondary mb-0">
                {{
                  registering
                    ? 'Join us and start your recycling journey.'
                    : 'Sign in to continue your recycling journey.'
                }}
              </p>
            </div>

            <form novalidate @submit.prevent="submit">
              <p
                v-if="!firebaseConfigured"
                class="alert alert-warning"
                role="status"
              >
                Account access has not been configured yet.
              </p>

              <p
                class="visually-hidden"
                role="status"
                aria-live="polite"
              >
                {{
                  registering
                    ? 'Firebase registration mode'
                    : 'Firebase login mode'
                }}
              </p>

              <fieldset :disabled="pending || !firebaseConfigured">
                <legend class="visually-hidden">
                  {{
                    registering
                      ? 'Firebase registration details'
                      : 'Firebase login details'
                  }}
                </legend>

                <!-- Email -->
                <div class="mb-3">
                  <label for="firebase-email" class="form-label fw-semibold">
                    Email Address
                  </label>

                  <input
                    id="firebase-email"
                    v-model="email"
                    class="form-control form-control-lg"
                    type="email"
                    placeholder="Enter your email address"
                    autocomplete="username"
                    maxlength="254"
                    required
                    :aria-invalid="invalidField === 'email'"
                    :aria-describedby="
                      invalidField === 'email'
                        ? 'firebase-error'
                        : undefined
                    "
                  />
                </div>

                <!-- Password -->
                <div class="mb-3">
                  <label
                    for="firebase-password"
                    class="form-label fw-semibold"
                  >
                    Password
                  </label>

                  <input
                    id="firebase-password"
                    v-model="password"
                    class="form-control form-control-lg"
                    type="password"
                    placeholder="Enter your password"
                    :autocomplete="
                      registering ? 'new-password' : 'current-password'
                    "
                    maxlength="128"
                    required
                    :aria-invalid="invalidField === 'password'"
                    :aria-describedby="passwordDescription"
                  />

                  <p
                    v-if="registering"
                    id="firebase-password-help"
                    class="small text-muted mt-2 mb-0"
                  >
                    At least 6 characters, with uppercase,
                    lowercase, a number and a symbol.
                  </p>
                </div>

                <button
                  type="submit"
                  class="btn btn-success btn-lg w-100 mt-2"
                >
                  {{
                    pending
                      ? 'Please wait...'
                      : registering
                        ? 'Register and Sign In'
                        : 'Log In'
                  }}
                </button>
              </fieldset>

              <!-- Error Message -->
              <p
                v-if="error"
                id="firebase-error"
                class="alert alert-danger mt-3"
                role="alert"
              >
                {{ error }}
              </p>

              <p
                v-if="pending"
                class="visually-hidden"
                role="status"
              >
                Processing Firebase authentication, please wait.
              </p>

              <!-- Toggle Login / Register -->
              <div class="auth-switch text-center mt-4">
                <p class="text-secondary mb-1">
                  {{
                    registering
                      ? 'Already have an account?'
                      : "Don't have an account?"
                  }}
                </p>

                <button
                  type="button"
                  class="btn btn-link fw-semibold"
                  :disabled="pending"
                  @click="toggle"
                >
                  {{ registering ? 'Log In' : 'Create an Account' }}
                </button>
              </div>
            </form>

            <div class="security-note mt-4">
              <span aria-hidden="true">🔒</span>
              Secure account access powered by Firebase Authentication.
            </div>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  firebaseConfigured,
  firebaseLogin,
  firebaseError,
} from './firebaseAuth.js'
import { validateRegistration } from './validation.js'

const emit = defineEmits(['login-success'])

const email = ref('')
const password = ref('')
const registering = ref(false)
const pending = ref(false)
const error = ref('')
const invalidField = ref('')

const passwordDescription = computed(() => {
  const ids = []

  if (registering.value) {
    ids.push('firebase-password-help')
  }

  if (invalidField.value === 'password') {
    ids.push('firebase-error')
  }

  return ids.length ? ids.join(' ') : undefined
})

function toggle() {
  registering.value = !registering.value
  password.value = ''
  error.value = ''
  invalidField.value = ''
}

async function submit() {
  if (pending.value || !firebaseConfigured) return

  error.value = ''
  invalidField.value = ''

  if (!email.value.trim()) {
    error.value = 'Email is required.'
    invalidField.value = 'email'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
    error.value = 'Please enter a valid email address.'
    invalidField.value = 'email'
    return
  }

  if (!password.value) {
    error.value = 'Password is required.'
    invalidField.value = 'password'
    return
  }

  if (registering.value) {
    const validationError = validateRegistration({
      username: 'firebase_user',
      email: email.value,
      password: password.value,
    })

    if (validationError) {
      error.value = validationError

      if (
        validationError.startsWith('Email') ||
        validationError === 'Please enter a valid email address.'
      ) {
        invalidField.value = 'email'
      } else if (validationError.startsWith('Password')) {
        invalidField.value = 'password'
      }

      return
    }
  }

  pending.value = true

  try {
    const user = await firebaseLogin(
      email.value,
      password.value,
      registering.value
    )

    password.value = ''
    emit('login-success', user)
  } catch (cause) {
    error.value = firebaseError(cause)
  } finally {
    pending.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f8faf9;
  display: flex;
  align-items: center;
}

.auth-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 620px;
  background: #ffffff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
}

/* Left introduction panel */
.intro-panel {
  background: linear-gradient(145deg, #e1f3e5, #c8e9d0);
  padding: 45px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand {
  font-size: 1.15rem;
  font-weight: 700;
  color: #166534;
}

.intro-content {
  padding: 35px 0;
}

.intro-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.intro-content h2 {
  color: #14532d;
  line-height: 1.2;
}

.intro-description {
  font-size: 1.05rem;
  color: #365c45;
  line-height: 1.8;
}

.benefits p {
  color: #166534;
  font-weight: 500;
  margin-bottom: 14px;
}

.intro-footer {
  color: #166534;
  font-weight: 600;
}

/* Right form panel */
.form-panel {
  padding: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 420px;
}

.form-icon {
  font-size: 2.8rem;
  margin-bottom: 12px;
}

.form-control {
  border-radius: 10px;
  border: 1px solid #cedbd2;
}

.form-control:focus {
  border-color: #198754;
  box-shadow: 0 0 0 0.2rem rgba(25, 135, 84, 0.15);
}

.btn-success {
  border-radius: 10px;
  font-weight: 600;
  padding: 12px;
}

.auth-switch .btn-link {
  color: #166534;
  text-decoration: none;
}

.auth-switch .btn-link:hover {
  text-decoration: underline;
}

.security-note {
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  text-align: center;
  color: #64748b;
  font-size: 0.85rem;
}

/* Tablet and mobile */
@media (max-width: 991px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .intro-panel {
    padding: 30px;
  }

  .intro-content {
    padding: 20px 0;
  }

  .intro-icon {
    font-size: 3.5rem;
    margin-bottom: 10px;
  }

  .form-panel {
    padding: 35px 25px;
  }
}

@media (max-width: 576px) {
  .auth-page .container {
    padding-left: 12px;
    padding-right: 12px;
  }

  .intro-panel {
    padding: 25px;
  }

  .intro-content h2 {
    font-size: 1.7rem;
  }

  .intro-description {
    font-size: 0.95rem;
  }

  .form-panel {
    padding: 30px 20px;
  }

  .auth-layout {
    border-radius: 14px;
  }
}
</style>
