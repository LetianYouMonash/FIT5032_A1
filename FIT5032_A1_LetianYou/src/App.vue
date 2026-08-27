<template>
  <div class="container mt-5">
    <h1>User Information</h1>

    <form @submit.prevent="validateForm">
      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input id="username" v-model="username" type="text" class="form-control" />
        <div v-if="usernameError" class="text-danger">
          {{ usernameError }}
        </div>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input id="email" v-model="email" type="text" class="form-control" />
        <div v-if="emailError" class="text-danger">
          {{ emailError }}
        </div>
      </div>

      <button type="submit" class="btn btn-primary">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const username = ref('')
const email = ref('')

const usernameError = ref('')
const emailError = ref('')

const validateForm = () => {
  usernameError.value = ''
  emailError.value = ''

  if (username.value.trim() === '') {
    usernameError.value = 'Username is required.'
  }

  if (!email.value.includes('@')) {
    emailError.value = 'Please enter a valid email address.'
  }
}
</script>
