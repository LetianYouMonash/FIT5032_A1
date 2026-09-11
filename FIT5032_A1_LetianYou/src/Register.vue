<template>
  <div class="container py-5">
    <div class="card p-4 mx-auto" style="max-width: 500px">
      <h1 class="text-center mb-4">Register</h1>

      <div class="mb-3">
        <label for="registerUsername" class="form-label"> Username </label>

        <input
          id="registerUsername"
          v-model="username"
          type="text"
          maxlength="30"
          autocomplete="username"
          class="form-control"
        />
      </div>

      <div class="mb-3">
        <label for="registerEmail" class="form-label"> Email </label>

        <input
          id="registerEmail"
          v-model="email"
          type="email"
          maxlength="254"
          autocomplete="email"
          class="form-control"
        />
      </div>

      <div class="mb-3">
        <label for="registerPassword" class="form-label"> Password </label>

        <input
          id="registerPassword"
          v-model="password"
          type="password"
          maxlength="128"
          autocomplete="new-password"
          class="form-control"
        />
      </div>

      <div v-if="errorMessage" class="text-danger mb-3">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="text-success mb-3">
        {{ successMessage }}
      </div>

      <button class="btn btn-success w-100" :disabled="pending" @click="register">
        {{ pending ? 'Registering...' : 'Register' }}
      </button>

      <button class="btn btn-link w-100 mt-2" :disabled="pending" @click="$emit('back-login')">
        Back to Login
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { validateRegistration } from './validation.js'

const props = defineProps({
  registerAccount: { type: Function, required: true },
})

defineEmits(['back-login'])

const username = ref('')
const email = ref('')
const password = ref('')

const errorMessage = ref('')
const successMessage = ref('')

const pending = ref(false)

const register = async () => {
  if (pending.value) return
  errorMessage.value = ''
  successMessage.value = ''

  const validationError = validateRegistration({
    username: username.value,
    email: email.value,
    password: password.value,
  })
  if (validationError) {
    errorMessage.value = validationError
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
    successMessage.value = 'Registration successful. You can now log in.'
    username.value = ''
    email.value = ''
    password.value = ''
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    pending.value = false
  }
}
</script>
