<template>
  <div class="container d-flex align-items-center justify-content-center min-vh-100">
    <form class="card p-4 w-100" style="max-width: 440px" novalidate @submit.prevent="submit">
      <h1 class="h3">
        {{ registering ? 'Create an account' : 'Log in' }}
      </h1>

      <p>Sign in with your email and password.</p>

      <p v-if="!firebaseConfigured" class="alert alert-warning" role="status">
        Account access has not been configured yet.
      </p>

      <p class="visually-hidden" role="status" aria-live="polite">
        {{ registering ? 'Firebase registration mode' : 'Firebase login mode' }}
      </p>

      <fieldset :disabled="pending || !firebaseConfigured">
        <legend class="visually-hidden">
          {{ registering ? 'Firebase registration details' : 'Firebase login details' }}
        </legend>

        <label for="firebase-email" class="form-label"> Email </label>

        <input
          id="firebase-email"
          v-model="email"
          class="form-control mb-3"
          type="email"
          autocomplete="username"
          maxlength="254"
          required
          :aria-invalid="invalidField === 'email'"
          :aria-describedby="invalidField === 'email' ? 'firebase-error' : undefined"
        />

        <label for="firebase-password" class="form-label"> Password </label>

        <input
          id="firebase-password"
          v-model="password"
          class="form-control mb-3"
          type="password"
          :autocomplete="registering ? 'new-password' : 'current-password'"
          maxlength="128"
          required
          :aria-invalid="invalidField === 'password'"
          :aria-describedby="passwordDescription"
        />

        <p v-if="registering" id="firebase-password-help" class="small text-muted">
          At least 6 characters, with uppercase, lowercase, a number and a symbol.
        </p>

        <button type="submit" class="btn btn-primary w-100">
          {{ pending ? 'Please wait...' : registering ? 'Register and sign in' : 'Log in' }}
        </button>
      </fieldset>

      <p v-if="error" id="firebase-error" class="text-danger mt-3" role="alert">
        {{ error }}
      </p>

      <p v-if="pending" class="visually-hidden" role="status">
        Processing Firebase authentication, please wait.
      </p>

      <button type="button" class="btn btn-link mt-2" :disabled="pending" @click="toggle">
        {{ registering ? 'Already registered? Log in' : 'Create an account' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { firebaseConfigured, firebaseLogin, firebaseError } from './firebaseAuth.js'
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
    // Email is the external account identifier; no local username is created.
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
    const user = await firebaseLogin(email.value, password.value, registering.value)

    password.value = ''
    emit('login-success', user)
  } catch (cause) {
    error.value = firebaseError(cause)
  } finally {
    pending.value = false
  }
}
</script>
