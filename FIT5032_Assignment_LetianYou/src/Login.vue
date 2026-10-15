
<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card p-4 w-100" style="max-width: 400px">
      <h1 class="text-center mb-4">Login</h1>
      <p class="text-muted text-center">Local account</p>

      <form novalidate @submit.prevent="login">
        <div class="mb-3">
          <label for="loginUsername" class="form-label">
            Username <span aria-hidden="true">*</span>
          </label>

          <input
            id="loginUsername"
            v-model="username"
            type="text"
            maxlength="30"
            autocomplete="username"
            class="form-control"
            :aria-invalid="Boolean(errorMessage && !username.trim())"
            :aria-describedby="errorMessage ? 'loginError' : undefined"
            required
          />
        </div>

        <div class="mb-3">
          <label for="loginPassword" class="form-label">
            Password <span aria-hidden="true">*</span>
          </label>

          <input
            id="loginPassword"
            v-model="password"
            type="password"
            maxlength="128"
            autocomplete="current-password"
            class="form-control"
            :aria-invalid="Boolean(errorMessage && !password.trim())"
            :aria-describedby="errorMessage ? 'loginError' : undefined"
            required
          />
        </div>

        <div
          v-if="errorMessage"
          id="loginError"
          class="text-danger mb-3"
          role="alert"
        >
          {{ errorMessage }}
        </div>

        <p v-if="pending" class="visually-hidden" role="status">
          Logging in, please wait.
        </p>

        <div class="d-flex gap-2">
          <button
            type="submit"
            class="btn btn-primary flex-fill"
            :disabled="pending"
          >
            {{ pending ? 'Logging in...' : 'Login' }}
          </button>

          <button
            type="button"
            class="btn btn-secondary flex-fill"
            :disabled="pending"
            @click="$emit('register')"
          >
            Register
          </button>
        </div>
      </form>

      <button
        type="button"
        class="btn btn-outline-primary mt-3"
        :disabled="pending"
        @click="$emit('firebase')"
      >
        Sign in with Firebase
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  authenticate: { type: Function, required: true },
})

const emit = defineEmits(['register', 'login-success', 'firebase'])

const username = ref('')
const password = ref('')
const errorMessage = ref('')
const pending = ref(false)

const login = async () => {
  if (pending.value) return

  errorMessage.value = ''

  if (username.value.trim() === '' && password.value.trim() === '') {
    errorMessage.value = 'Username and password are required.'
    return
  }

  if (username.value.trim() === '') {
    errorMessage.value = 'Username is required.'
    return
  }

  if (password.value.trim() === '') {
    errorMessage.value = 'Password is required.'
    return
  }

  pending.value = true

  try {
    const user = await props.authenticate(
      username.value.trim(),
      password.value
    )

    emit('login-success', user)

    username.value = ''
    password.value = ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Login failed. Please try again.'
  } finally {
    pending.value = false
  }
}
</script>
