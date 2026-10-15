<template>
  <div class="container d-flex align-items-center justify-content-center min-vh-100">
    <form class="card p-4 w-100" style="max-width: 440px" @submit.prevent="submit">
      <h1 class="h3">{{ registering ? 'Create Firebase account' : 'Firebase login' }}</h1>
      <p>Sign in with your email and password.</p>
      <p v-if="!firebaseConfigured" class="alert alert-warning" role="status">
        Firebase login has not been configured yet. Local login is still available.
      </p>
      <fieldset :disabled="pending || !firebaseConfigured">
        <label for="firebase-email" class="form-label">Email</label>
        <input
          id="firebase-email"
          v-model="email"
          class="form-control mb-3"
          type="email"
          autocomplete="username"
          maxlength="254"
          required
        />
        <label for="firebase-password" class="form-label">Password</label>
        <input
          id="firebase-password"
          v-model="password"
          class="form-control mb-3"
          type="password"
          :autocomplete="registering ? 'new-password' : 'current-password'"
          maxlength="128"
          required
        />
        <p v-if="registering" class="small text-muted">
          At least 6 characters, with uppercase, lowercase, a number and a symbol.
        </p>
        <button type="submit" class="btn btn-primary w-100">
          {{ pending ? 'Please wait...' : registering ? 'Register and sign in' : 'Log in' }}
        </button>
      </fieldset>
      <p v-if="error" class="text-danger mt-3" role="alert">{{ error }}</p>
      <button type="button" class="btn btn-link mt-2" :disabled="pending" @click="toggle">
        {{ registering ? 'Already registered? Log in' : 'Create an account' }}
      </button>
      <button
        type="button"
        class="btn btn-outline-secondary"
        :disabled="pending"
        @click="$emit('back')"
      >
        Back to local login
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { firebaseConfigured, firebaseLogin, firebaseError } from './firebaseAuth.js'
import { validateRegistration } from './validation.js'
const emit = defineEmits(['back', 'login-success'])
const email = ref('')
const password = ref('')
const registering = ref(false)
const pending = ref(false)
const error = ref('')
function toggle() {
  registering.value = !registering.value
  password.value = ''
  error.value = ''
}
async function submit() {
  if (pending.value || !firebaseConfigured) return
  error.value = ''
  if (registering.value) {
    // Email is the external account identifier; no local username is created.
    error.value = validateRegistration({
      username: 'firebase_user',
      email: email.value,
      password: password.value,
    })
    if (error.value) return
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
