<template>
  <div class="container py-5">
    <div class="card p-4 mx-auto" style="max-width: 500px">
      <h1 class="text-center mb-4">Register</h1>

      <div class="mb-3">
        <label for="registerUsername" class="form-label"> Username </label>

        <input id="registerUsername" v-model="username" type="text" class="form-control" />
      </div>

      <div class="mb-3">
        <label for="registerEmail" class="form-label"> Email </label>

        <input id="registerEmail" v-model="email" type="text" class="form-control" />
      </div>

      <div class="mb-3">
        <label for="registerPassword" class="form-label"> Password </label>

        <input id="registerPassword" v-model="password" type="password" class="form-control" />
      </div>

      <div v-if="errorMessage" class="text-danger mb-3">
        {{ errorMessage }}
      </div>

      <div v-if="successMessage" class="text-success mb-3">
        {{ successMessage }}
      </div>

      <button class="btn btn-success w-100" @click="register">Register</button>

      <button class="btn btn-link w-100 mt-2" @click="$emit('back-login')">Back to Login</button>
    </div>

    <div class="card p-4 mx-auto mt-5" style="max-width: 700px">
      <h2 class="text-center mb-4">Registered Users</h2>

      <p v-if="users.length === 0" class="text-center text-muted">No registered users.</p>

      <div v-for="(user, index) in users" :key="index" class="border rounded p-3 mb-3">
        <div class="row align-items-center mb-3">
          <div class="col">
            <strong>Username:</strong>

            <span v-if="editingField !== `${index}-username`">
              {{ user.username }}
            </span>

            <input v-else v-model="editValue" type="text" class="form-control mt-2" />
          </div>

          <div class="col-auto">
            <button
              class="btn btn-outline-primary btn-sm"
              @click="editOrSave(index, 'username', user.username)"
            >
              {{ editingField === `${index}-username` ? 'Save' : 'Edit' }}
            </button>
          </div>
        </div>

        <div class="row align-items-center mb-3">
          <div class="col">
            <strong>Email:</strong>

            <span v-if="editingField !== `${index}-email`">
              {{ user.email }}
            </span>

            <input v-else v-model="editValue" type="text" class="form-control mt-2" />
          </div>

          <div class="col-auto">
            <button
              class="btn btn-outline-primary btn-sm"
              @click="editOrSave(index, 'email', user.email)"
            >
              {{ editingField === `${index}-email` ? 'Save' : 'Edit' }}
            </button>
          </div>
        </div>

        <div class="row align-items-center mb-3">
          <div class="col">
            <strong>Password:</strong>

            <span v-if="editingField !== `${index}-password`">
              {{ user.password }}
            </span>

            <input v-else v-model="editValue" type="text" class="form-control mt-2" />
          </div>

          <div class="col-auto">
            <button
              class="btn btn-outline-primary btn-sm"
              @click="editOrSave(index, 'password', user.password)"
            >
              {{ editingField === `${index}-password` ? 'Save' : 'Edit' }}
            </button>
          </div>
        </div>

        <div v-if="editError && editingUserIndex === index" class="text-danger mb-3">
          {{ editError }}
        </div>

        <button class="btn btn-danger" @click="deleteUser(index)">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    required: true,
  },
})

const emit = defineEmits(['register-user', 'update-user', 'delete-user', 'back-login'])

const username = ref('')
const email = ref('')
const password = ref('')

const errorMessage = ref('')
const successMessage = ref('')

const editingField = ref('')
const editingUserIndex = ref(null)
const editValue = ref('')
const editError = ref('')

const register = () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (username.value.trim() === '') {
    errorMessage.value = 'Username is required.'
    return
  }

  if (email.value.trim() === '') {
    errorMessage.value = 'Email is required.'
    return
  }

  if (password.value === '') {
    errorMessage.value = 'Password is required.'
    return
  }

  if (username.value.trim().length < 3) {
    errorMessage.value = 'Username must be at least 3 characters.'
    return
  }

  const existingUser = props.users.find((user) => user.username === username.value.trim())

  if (existingUser) {
    errorMessage.value = 'Username already exists.'
    return
  }

  if (!email.value.includes('@')) {
    errorMessage.value = 'Email must contain @.'
    return
  }

  if (!email.value.endsWith('.com')) {
    errorMessage.value = 'Email must end with .com.'
    return
  }

  const atIndex = email.value.indexOf('@')
  const comIndex = email.value.lastIndexOf('.com')

  if (comIndex <= atIndex + 1) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }

  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters.'
    return
  }

  if (!/[A-Z]/.test(password.value)) {
    errorMessage.value = 'Password must contain an uppercase letter.'
    return
  }

  if (!/[a-z]/.test(password.value)) {
    errorMessage.value = 'Password must contain a lowercase letter.'
    return
  }

  if (!/[0-9]/.test(password.value)) {
    errorMessage.value = 'Password must contain a number.'
    return
  }

  if (!/[^A-Za-z0-9]/.test(password.value)) {
    errorMessage.value = 'Password must contain a symbol.'
    return
  }

  const newUser = {
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value,
  }

  emit('register-user', newUser)

  successMessage.value = 'Registration successful.'

  username.value = ''
  email.value = ''
  password.value = ''
}

const editOrSave = (index, field, originalValue) => {
  const fieldID = `${index}-${field}`

  editError.value = ''

  if (editingField.value !== fieldID) {
    editingField.value = fieldID
    editingUserIndex.value = index
    editValue.value = originalValue
    return
  }

  if (field === 'username') {
    if (editValue.value.trim() === '') {
      editError.value = 'Username is required.'
      return
    }

    if (editValue.value.trim().length < 3) {
      editError.value = 'Username must be at least 3 characters.'
      return
    }

    const duplicateUsername = props.users.some(
      (user, userIndex) => userIndex !== index && user.username === editValue.value.trim(),
    )

    if (duplicateUsername) {
      editError.value = 'Username already exists.'
      return
    }

    editValue.value = editValue.value.trim()
  }

  if (field === 'email') {
    if (editValue.value.trim() === '') {
      editError.value = 'Email is required.'
      return
    }

    if (!editValue.value.includes('@')) {
      editError.value = 'Email must contain @.'
      return
    }

    if (!editValue.value.endsWith('.com')) {
      editError.value = 'Email must end with .com.'
      return
    }

    editValue.value = editValue.value.trim()
  }

  if (field === 'password') {
    if (editValue.value === '') {
      editError.value = 'Password is required.'
      return
    }

    if (editValue.value.length < 6) {
      editError.value = 'Password must be at least 6 characters.'
      return
    }

    if (!/[A-Z]/.test(editValue.value)) {
      editError.value = 'Password must contain an uppercase letter.'
      return
    }

    if (!/[a-z]/.test(editValue.value)) {
      editError.value = 'Password must contain a lowercase letter.'
      return
    }

    if (!/[0-9]/.test(editValue.value)) {
      editError.value = 'Password must contain a number.'
      return
    }

    if (!/[^A-Za-z0-9]/.test(editValue.value)) {
      editError.value = 'Password must contain a symbol.'
      return
    }
  }

  emit('update-user', {
    index: index,
    field: field,
    value: editValue.value,
  })

  editingField.value = ''
  editingUserIndex.value = null
  editValue.value = ''
  editError.value = ''
}

const deleteUser = (index) => {
  emit('delete-user', index)

  editingField.value = ''
  editingUserIndex.value = null
  editValue.value = ''
  editError.value = ''
}
</script>
