
<template>
  <main class="container py-5">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1>Recycling Learning Centre</h1>
        <p class="text-muted mb-0">
          Learn how to reduce waste and recycle correctly.
        </p>
      </div>
    </div>

    <!-- Introduction -->
    <section class="mb-5" aria-labelledby="intro-title">
      <div class="card bg-light border-0">
        <div class="card-body p-4">
          <h2 id="intro-title" class="h4">
            Why Is Recycling Important?
          </h2>

          <p>
            Recycling helps conserve natural resources, reduce landfill
            waste and support a more sustainable environment.
          </p>

          <p class="mb-0">
            Correct waste separation is essential because contaminated
            recycling can make valuable materials harder to recover.
            Explore the categories below and test your knowledge.
          </p>
        </div>
      </div>
    </section>

    <!-- Recycling Categories -->
    <section class="mb-5" aria-labelledby="categories-title">
      <h2 id="categories-title" class="h3 mb-3">
        Recycling Categories
      </h2>

      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6">
          <label for="categorySearch" class="form-label">
            Search Recycling Information
          </label>

          <input
            id="categorySearch"
            v-model="searchQuery"
            type="search"
            class="form-control"
            placeholder="Search paper, plastic, batteries..."
          />
        </div>

        <div class="col-12 col-md-6">
          <label for="categoryFilter" class="form-label">
            Filter by Category
          </label>

          <select
            id="categoryFilter"
            v-model="selectedCategory"
            class="form-select"
          >
            <option value="all">All Categories</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.title }}
            </option>
          </select>
        </div>
      </div>

      <p class="text-muted" role="status" aria-live="polite">
        Showing {{ filteredCategories.length }} of
        {{ categories.length }} categories
      </p>

      <div class="row g-4">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <article class="card h-100 shadow-sm">
            <div class="card-body">
              <div class="fs-1 mb-3" aria-hidden="true">
                {{ category.icon }}
              </div>

              <h3 class="h5">{{ category.title }}</h3>

              <p>{{ category.description }}</p>

              <h4 class="h6">Examples</h4>
              <p>{{ category.examples.join(', ') }}</p>

              <div class="alert alert-info mb-0">
                <strong>Recycling Tip:</strong>
                {{ category.tip }}
              </div>
            </div>
          </article>
        </div>
      </div>

      <p
        v-if="filteredCategories.length === 0"
        class="text-center text-muted py-4"
      >
        No matching categories found.
      </p>
    </section>

    <!-- Recycling Tips -->
    <section class="mb-5" aria-labelledby="tips-title">
      <h2 id="tips-title" class="h3 mb-3">
        Everyday Recycling Tips
      </h2>

      <div class="row g-3">
        <div
          v-for="(tip, index) in recyclingTips"
          :key="index"
          class="col-12 col-md-6"
        >
          <div class="card h-100">
            <div class="card-body">
              <h3 class="h5">{{ tip.title }}</h3>
              <p class="mb-0">{{ tip.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quiz -->
    <section class="mb-4" aria-labelledby="quiz-title">
      <h2 id="quiz-title" class="h3 mb-2">
        Test Your Recycling Knowledge
      </h2>

      <p class="text-muted">
        Answer the following questions to check what you have learned.
      </p>

      <form @submit.prevent="submitQuiz">
        <fieldset
          v-for="(question, questionIndex) in quizQuestions"
          :key="question.id"
          class="card mb-3"
          :disabled="quizSubmitted"
        >
          <div class="card-body">
            <legend class="h5 float-none w-auto mb-3">
              Question {{ questionIndex + 1 }}:
              {{ question.question }}
            </legend>

            <div
              v-for="(option, optionIndex) in question.options"
              :key="optionIndex"
              class="form-check mb-2"
            >
              <input
                :id="`question-${question.id}-option-${optionIndex}`"
                v-model="answers[question.id]"
                class="form-check-input"
                type="radio"
                :name="`question-${question.id}`"
                :value="optionIndex"
                :required="answers[question.id] === undefined"
              />

              <label
                class="form-check-label"
                :for="`question-${question.id}-option-${optionIndex}`"
              >
                {{ option }}
              </label>
            </div>

            <div
              v-if="quizSubmitted"
              class="alert mt-3 mb-0"
              :class="
                answers[question.id] === question.correctAnswer
                  ? 'alert-success'
                  : 'alert-warning'
              "
            >
              <strong>
                {{
                  answers[question.id] === question.correctAnswer
                    ? 'Correct!'
                    : 'Incorrect.'
                }}
              </strong>

              <p class="mb-0 mt-1">
                {{ question.explanation }}
              </p>
            </div>
          </div>
        </fieldset>

        <div class="d-flex flex-wrap gap-2">
          <button
            v-if="!quizSubmitted"
            type="submit"
            class="btn btn-success"
          >
            Submit Answers
          </button>

          <button
            v-else
            type="button"
            class="btn btn-outline-primary"
            @click="resetQuiz"
          >
            Try Again
          </button>
        </div>
      </form>

      <div
        v-if="quizSubmitted"
        class="alert alert-primary mt-4"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <h3 class="h5">Your Quiz Result</h3>

        <p class="fs-4 fw-bold mb-2">
          {{ quizScore }} / {{ quizQuestions.length }}
        </p>

        <p class="mb-0">
          {{ resultMessage }}
        </p>
      </div>
    </section>

    <footer class="border-top pt-3 mt-5">
      <p class="text-muted small mb-0">
        Note: Recycling rules vary between Australian councils.
        Always check your local council's waste collection guidelines.
      </p>
    </footer>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

defineEmits(['back-home'])

const searchQuery = ref('')
const selectedCategory = ref('all')

const categories = [
  {
    id: 'paper',
    title: 'Paper and Cardboard',
    icon: '📦',
    description:
      'Clean paper and cardboard can often be processed into new paper products.',
    examples: [
      'Newspapers',
      'Office paper',
      'Cardboard boxes',
      'Paper packaging',
    ],
    tip:
      'Flatten cardboard boxes and keep paper free from food contamination.',
  },
  {
    id: 'plastic',
    title: 'Plastic Packaging',
    icon: '♻️',
    description:
      'Some rigid plastic containers are accepted in household recycling collections.',
    examples: [
      'Plastic bottles',
      'Milk containers',
      'Rigid food containers',
    ],
    tip:
      'Empty containers before recycling. Check local rules for accepted plastics.',
  },
  {
    id: 'glass',
    title: 'Glass',
    icon: '🍾',
    description:
      'Glass bottles and jars can be recycled where accepted by local collection services.',
    examples: [
      'Glass bottles',
      'Food jars',
      'Drink containers',
    ],
    tip:
      'Keep ceramics, mirrors and drinking glasses out of regular glass recycling unless specifically accepted.',
  },
  {
    id: 'metal',
    title: 'Metal',
    icon: '🥫',
    description:
      'Many aluminium and steel food and drink containers are recyclable.',
    examples: [
      'Aluminium cans',
      'Steel food tins',
      'Metal packaging',
    ],
    tip:
      'Empty food and drink containers and follow your council guidelines.',
  },
  {
    id: 'organic',
    title: 'Food and Garden Organics',
    icon: '🌱',
    description:
      'Organic waste can be composted or collected through suitable organics services.',
    examples: [
      'Fruit scraps',
      'Vegetable scraps',
      'Leaves',
      'Grass clippings',
    ],
    tip:
      'Only place food scraps in your FOGO bin if your council accepts them.',
  },
  {
    id: 'ewaste',
    title: 'E-Waste and Batteries',
    icon: '🔋',
    description:
      'Electronic waste and batteries require dedicated collection and recycling services.',
    examples: [
      'Mobile phones',
      'Computers',
      'Household batteries',
      'Chargers',
    ],
    tip:
      'Never place loose batteries in household recycling bins. Use an approved battery collection point.',
  },
]

const filteredCategories = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return categories.filter((category) => {
    const matchesCategory =
      selectedCategory.value === 'all' ||
      category.id === selectedCategory.value

    const searchableText = [
      category.title,
      category.description,
      category.tip,
      ...category.examples,
    ]
      .join(' ')
      .toLowerCase()

    return matchesCategory && searchableText.includes(query)
  })
})

const recyclingTips = [
  {
    title: 'Reduce Before Recycling',
    description:
      'Choose reusable products and avoid unnecessary packaging whenever possible.',
  },
  {
    title: 'Keep Recycling Loose',
    description:
      'Place accepted recyclable items loose in your recycling bin rather than inside plastic bags.',
  },
  {
    title: 'Check Local Collection Rules',
    description:
      'Accepted materials differ between councils. Follow your local waste collection instructions.',
  },
  {
    title: 'Reuse and Repair',
    description:
      'Donate, repair or reuse suitable items before considering disposal.',
  },
]

const quizQuestions = [
  {
    id: 1,
    question:
      'Where should household batteries usually be taken for recycling?',
    options: [
      'Household recycling bin',
      'Approved battery collection point',
      'Food and garden organics bin',
    ],
    correctAnswer: 1,
    explanation:
      'Batteries can create fire risks in waste collection systems and should be taken to an approved collection point.',
  },
  {
    id: 2,
    question:
      'What should you do with cardboard boxes before recycling?',
    options: [
      'Flatten them',
      'Fill them with food scraps',
      'Wrap them in plastic bags',
    ],
    correctAnswer: 0,
    explanation:
      'Flattening cardboard saves space and makes collection more efficient.',
  },
  {
    id: 3,
    question:
      'Why should food-contaminated packaging be handled carefully?',
    options: [
      'It always improves recycling quality',
      'It can contaminate recyclable materials',
      'It turns into metal',
    ],
    correctAnswer: 1,
    explanation:
      'Food contamination can reduce the quality of recyclable materials and make recovery more difficult.',
  },
  {
    id: 4,
    question:
      'What is the best approach before throwing away a usable item?',
    options: [
      'Always place it in landfill',
      'Burn it',
      'Consider repairing, reusing or donating it',
    ],
    correctAnswer: 2,
    explanation:
      'Extending the life of usable products helps reduce waste and conserve resources.',
  },
  {
    id: 5,
    question:
      'Which source should you check for local household recycling rules?',
    options: [
      'Your local council',
      'An unrelated social media comment',
      'A random packaging colour',
    ],
    correctAnswer: 0,
    explanation:
      'Local councils provide information about the materials accepted by their collection services.',
  },
]

const answers = reactive({})
const quizSubmitted = ref(false)

const quizScore = computed(() =>
  quizQuestions.reduce(
    (score, question) =>
      score + (answers[question.id] === question.correctAnswer ? 1 : 0),
    0
  )
)

const resultMessage = computed(() => {
  if (quizScore.value === quizQuestions.length) {
    return 'Excellent! You have a strong understanding of recycling.'
  }

  if (quizScore.value >= 3) {
    return 'Good work! Review the explanations to improve your knowledge.'
  }

  return 'Keep learning! Review the categories and try the quiz again.'
})

function submitQuiz() {
  const allAnswered = quizQuestions.every(
    (question) => answers[question.id] !== undefined
  )

  if (!allAnswered) return

  quizSubmitted.value = true
}

function resetQuiz() {
  Object.keys(answers).forEach((key) => {
    delete answers[key]
  })

  quizSubmitted.value = false
}
</script>
