<template>
  <div class="container d-flex justify-content-center align-items-center min-vh-100">
    <div class="card p-4 w-100" style="max-width: 400px">
      <h1 class="text-center mb-4">Login</h1>

      <div class="mb-3">
        <label for="loginUsername" class="form-label"> Username </label>

        <input id="loginUsername" v-model="username" type="text" class="form-control" />
      </div>

      <div class="mb-3">
        <label for="loginPassword" class="form-label"> Password </label>

        <input id="loginPassword" v-model="password" type="password" class="form-control" />
      </div>

      <div v-if="errorMessage" class="text-danger mb-3">
        {{ errorMessage }}
      </div>

      <div class="d-flex gap-2">
        <button class="btn btn-primary flex-fill" :disabled="pending" @click="login">
          {{ pending ? 'Logging in...' : 'Login' }}
        </button>

        <button class="btn btn-secondary flex-fill" :disabled="pending" @click="$emit('register')">
          Register
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  authenticate: { type: Function, required: true },
})

const emit = defineEmits(['register', 'login-success'])

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
    const user = await props.authenticate(username.value.trim(), password.value)
    emit('login-success', user)
    username.value = ''
    password.value = ''
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    pending.value = false
  }
}
</script>
