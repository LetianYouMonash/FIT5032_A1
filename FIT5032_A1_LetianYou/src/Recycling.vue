<template>
  <div class="container text-center mt-5">
    <h1>This is Recycling & Reuse page</h1>

    <RatingCard
      :current-user="currentUser"
      :get-rating-summary="getRatingSummary"
      :get-user-rating="getUserRating"
      :save-rating="saveRating"
    />

    <button class="btn btn-primary mt-4" @click="$emit('back-home')">Back to Home</button>
  </div>
</template>

<script setup>
import RatingCard from './RatingCard.vue'

defineProps({
  currentUser: { type: Object, required: true },
  getRatingSummary: { type: Function, required: true },
  getUserRating: { type: Function, required: true },
  saveRating: { type: Function, required: true },
})

defineEmits(['back-home'])
</script>
