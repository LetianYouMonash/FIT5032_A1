
<template>
  <div class="container py-5">
    <div class="card p-4 mx-auto" style="max-width: 500px">
      <h1 class="text-center mb-4">Register</h1>

      <p class="text-muted">
        All fields are required.
      </p>

      <form novalidate @submit.prevent="register">
        <div class="mb-3">
          <label for="registerUsername" class="form-label">
            Username <span aria-hidden="true">*</span>
          </label>

          <input
            id="registerUsername"
            v-model="username"
            type="text"
            maxlength="30"
            autocomplete="username"
            class="form-control"
            required
            :aria-invalid="invalidField === 'username'"
            :aria-describedby="
              invalidField === 'username'
                ? 'registerError'
                : undefined
            "
          />
        </div>

        <div class="mb-3">
          <label for="registerEmail" class="form-label">
            Email <span aria-hidden="true">*</span>
          </label>

          <input
            id="registerEmail"
            v-model="email"
            type="email"
            maxlength="254"
            autocomplete="email"
            class="form-control"
            required
            :aria-invalid="invalidField === 'email'"
            :aria-describedby="
              invalidField === 'email'
                ? 'registerError'
                : undefined
            "
          />
        </div>

        <div class="mb-3">
          <label for="registerPassword" class="form-label">
            Password <span aria-hidden="true">*</span>
          </label>

          <input
            id="registerPassword"
            v-model="password"
            type="password"
            maxlength="128"
            autocomplete="new-password"
            class="form-control"
            required
            :aria-invalid="invalidField === 'password'"
            :aria-describedby="
              invalidField === 'password'
                ? 'registerError'
                : undefined
            "
          />
        </div>

        <div
          v-if="errorMessage"
          id="registerError"
          class="text-danger mb-3"
          role="alert"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="successMessage"
          class="text-success mb-3"
          role="status"
        >
          {{ successMessage }}
        </div>

        <p
          v-if="pending"
          class="visually-hidden"
          role="status"
        >
          Registering your account, please wait.
        </p>

        <button
          type="submit"
          class="btn btn-success w-100"
          :disabled="pending"
        >
          {{ pending ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <button
        type="button"
        class="btn btn-link w-100 mt-2"
        :disabled="pending"
        @click="$emit('back-login')"
      >
        Back to Login
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { validateRegistration } from './validation.js'

const props = defineProps({
  registerAccount: {
    type: Function,
    required: true,
  },
})

defineEmits(['back-login'])

const username = ref('')
const email = ref('')
const password = ref('')

const errorMessage = ref('')
const successMessage = ref('')
const invalidField = ref('')
const pending = ref(false)

const getInvalidField = (message) => {
  if (message.startsWith('Username')) {
    return 'username'
  }

  if (
    message.startsWith('Email') ||
    message === 'Please enter a valid email address.'
  ) {
    return 'email'
  }

  if (message.startsWith('Password')) {
    return 'password'
  }

  return ''
}

const register = async () => {
  if (pending.value) return

  errorMessage.value = ''
  successMessage.value = ''
  invalidField.value = ''

  const validationError = validateRegistration({
    username: username.value,
    email: email.value,
    password: password.value,
  })

  if (validationError) {
    errorMessage.value = validationError
    invalidField.value = getInvalidField(validationError)
    return
  }

  const newUser = {
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value,
  }

  pending.value = true

  try {
    await props.registerAccount(newUser)

    successMessage.value =
      'Registration successful. You can now log in.'

    username.value = ''
    email.value = ''
    password.value = ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.'
  } finally {
    pending.value = false
  }
}
</script>
