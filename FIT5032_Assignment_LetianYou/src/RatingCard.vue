
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
      :disabled="!selectedScore"
      @click="submitRating"
    >
      Submit rating
    </button>

    <hr />

    <p class="mb-0" aria-live="polite" aria-atomic="true">
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
import { ref } from 'vue'

const props = defineProps({
  currentUser: {
    type: Object,
    required: true,
  },
  getRatingSummary: {
    type: Function,
    required: true,
  },
  getUserRating: {
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

const summary = ref(props.getRatingSummary(itemId))

const selectedScore = ref(
  props.getUserRating(itemId, props.currentUser.id)
)

const errorMessage = ref('')
const successMessage = ref('')

const selectRating = (score) => {
  selectedScore.value = score
  errorMessage.value = ''
  successMessage.value = ''
}

const submitRating = () => {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    props.saveRating(
      itemId,
      props.currentUser.id,
      selectedScore.value
    )

    summary.value = props.getRatingSummary(itemId)

    successMessage.value = 'Your rating has been saved.'
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Unable to save your rating. Please try again.'
  }
}
</script>
