<template>
  <div class="container text-center mt-5">
    <h1>This is Profile page</h1>

    <div v-if="currentUser" class="card mx-auto mt-4 p-3" style="max-width: 400px">
      <p>Username: {{ currentUser.username }}</p>

      <p>Email: {{ currentUser.email }}</p>

      <p class="mb-0">Password: {{ currentUser.password }}</p>
    </div>

    <button class="btn btn-primary mt-4" @click="$emit('back-home')">Back to Home</button>
  </div>
</template>

<script setup>
defineProps({
  currentUser: {
    type: Object,
    default: null,
  },
})

defineEmits(['back-home'])
</script>
