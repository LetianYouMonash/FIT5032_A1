<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1>Administrator</h1>
        <p class="text-muted mb-0">Manage registered accounts.</p>
      </div>
      <button class="btn btn-primary" @click="$emit('back-home')">Back to Home</button>
    </div>

    <div v-if="message" class="alert" :class="messageType" role="alert">{{ message }}</div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-striped align-middle mb-0">
          <caption class="visually-hidden">
            Registered user accounts
          </caption>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="account in accounts" :key="account.id">
              <td>{{ account.username }}</td>
              <td>{{ account.email }}</td>
              <td>
                <span
                  class="badge"
                  :class="account.role === 'admin' ? 'text-bg-danger' : 'text-bg-secondary'"
                  >{{ account.role }}</span
                >
              </td>
              <td>
                <button
                  v-if="account.role !== 'admin'"
                  class="btn btn-outline-danger btn-sm"
                  @click="remove(account.id)"
                >
                  Delete
                </button>
                <span v-else class="text-muted">Protected</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  getAccounts: { type: Function, required: true },
  deleteAccount: { type: Function, required: true },
})

defineEmits(['back-home'])

const accounts = ref(props.getAccounts())
const message = ref('')
const messageType = ref('alert-success')

const remove = (id) => {
  message.value = ''
  try {
    props.deleteAccount(id)
    accounts.value = props.getAccounts()
    message.value = 'Account deleted.'
  } catch (error) {
    messageType.value = 'alert-danger'
    message.value = error.message
  }
}
</script>
