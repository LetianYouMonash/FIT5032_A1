<template>
  <div class="container text-center mt-5">
    <h1>This is Learn page</h1>

    <button
      class="btn btn-primary mt-4"
      @click="$emit('back-home')"
    >
      Back to Home
    </button>
  </div>
</template>

<script setup>
defineEmits(['back-home'])
</script>