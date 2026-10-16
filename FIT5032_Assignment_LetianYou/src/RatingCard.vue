
<template>
  <section
    class="card mx-auto mt-4 p-4 text-start"
    style="max-width: 600px"
    aria-labelledby="rating-title"
  >
    <h2 id="rating-title" class="h4">
      Rate this information
    </h2>

    <p class="text-muted">
      Recycling &amp; Reuse information
    </p>

    <div
      class="mb-3"
      role="group"
      aria-label="Choose a rating from 1 to 5 stars"
    >
      <button
        v-for="score in scores"
        :key="score"
        type="button"
        class="btn me-2 mb-2"
        :class="
          selectedScore === score
            ? 'btn-success'
            : 'btn-outline-success'
        "
        :aria-label="`${score} out of 5 stars`"
        :aria-pressed="selectedScore === score"
        :disabled="saving || loading"
        @click="selectRating(score)"
      >
        {{ score }}
        <span aria-hidden="true">★</span>
      </button>
    </div>

    <p
      v-if="errorMessage"
      class="text-danger"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <p
      v-if="successMessage"
      class="text-success"
      role="status"
    >
      {{ successMessage }}
    </p>

    <button
      type="button"
      class="btn btn-primary"
      :disabled="!selectedScore || saving || loading"
      @click="submitRating"
    >
      Submit rating
    </button>

    <hr />

    <p v-if="loading" role="status">Loading cloud ratings...</p>
    <p v-if="summary" class="mb-0" aria-live="polite" aria-atomic="true">
      Average rating:
      <strong>
        {{
          summary.average
            ? `${summary.average} / 5`
            : 'No ratings yet'
        }}
      </strong>

      <span v-if="summary.count">
        ({{ summary.count }}
        {{ summary.count === 1 ? 'rating' : 'ratings' }})
      </span>
    </p>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true,
  },
  getRatingSummary: {
    type: Function,
    required: true,
  },
  saveRating: {
    type: Function,
    required: true,
  },
})

const itemId = 'recycling-reuse-information'
const scores = [1, 2, 3, 4, 5]

const summary = ref(null)
const selectedScore = ref(0)
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(true)
const saving = ref(false)
let disposed = false
let timer
let refreshing = false

async function refresh(initial = false) {
  if (refreshing || saving.value) return
  refreshing = true
  try {
    const data = await props.getRatingSummary(itemId)
    if (!disposed) {
      summary.value = data
      if (initial) selectedScore.value = data.userScore
      errorMessage.value = ''
    }
  } catch (error) {
    if (!disposed) {
      summary.value = null
      errorMessage.value = error.message
    }
  } finally {
    refreshing = false
    if (!disposed) loading.value = false
  }
}
const selectRating = score => {
  selectedScore.value = score
  errorMessage.value = ''
  successMessage.value = ''
}
async function submitRating() {
  if (saving.value || refreshing) return
  saving.value = true
  errorMessage.value = ''
  successMessage.value = ''
  try {
    const data = await props.saveRating(itemId, props.currentUser.id, selectedScore.value)
    if (!disposed) {
      summary.value = data
      successMessage.value = 'Your rating has been saved.'
    }
  } catch (error) {
    if (!disposed) errorMessage.value = error.message
  } finally {
    if (!disposed) saving.value = false
  }
}
const onFocus = () => refresh()
onMounted(() => {
  refresh(true)
  timer = setInterval(() => refresh(), 15000)
  window.addEventListener('focus', onFocus)
})
onUnmounted(() => {
  disposed = true
  clearInterval(timer)
  window.removeEventListener('focus', onFocus)
})
</script>
