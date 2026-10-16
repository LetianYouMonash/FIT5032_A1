
<template>
  <main class="container py-5">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div>
        <h1>Environmental News Centre</h1>
        <p class="text-muted mb-0">
          Explore environmental news, sustainability and recycling developments.
        </p>
      </div>
    </div>

    <section class="mb-4" aria-labelledby="news-intro">
      <div class="card bg-light border-0">
        <div class="card-body p-4">
          <h2 id="news-intro" class="h4">
            Stay Informed, Make a Difference
          </h2>
          <p class="mb-0">
            Discover selected articles about environmental protection,
            waste reduction, clean energy and sustainable living.
            Each article links to its original publisher.
          </p>
        </div>
      </div>
    </section>

    <section aria-labelledby="latest-news-title">
      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 id="latest-news-title" class="h3 mb-0">
          Environmental News
        </h2>
        <span class="badge text-bg-secondary">
          Curated Articles
        </span>
      </div>

      <div class="row g-3 mb-3">
        <div class="col-12 col-lg-5">
          <label for="newsSearch" class="form-label">
            Search News
          </label>
          <input
            id="newsSearch"
            v-model="searchQuery"
            type="search"
            class="form-control"
            placeholder="Search headlines, topics or summaries..."
          />
        </div>

        <div class="col-12 col-md-6 col-lg-4">
          <label for="newsCategory" class="form-label">
            Filter by Category
          </label>
          <select
            id="newsCategory"
            v-model="selectedCategory"
            class="form-select"
          >
            <option value="all">All Categories</option>
            <option
              v-for="category in categories"
              :key="category"
              :value="category"
            >
              {{ category }}
            </option>
          </select>
        </div>

        <div class="col-12 col-md-6 col-lg-3">
          <label for="newsSort" class="form-label">
            Sort by Date
          </label>
          <select
            id="newsSort"
            v-model="sortOrder"
            class="form-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <p
          class="text-muted mb-0"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          Showing {{ startRow }}–{{ endRow }} of
          {{ filteredNews.length }} articles
        </p>

        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          @click="resetFilters"
        >
          Reset Filters
        </button>
      </div>

      <div class="row g-4">
        <div
          v-for="article in paginatedNews"
          :key="article.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <article class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <div class="mb-3">
                <span class="badge text-bg-success">
                  {{ article.category }}
                </span>
              </div>

              <h3 class="h5">
                {{ article.title }}
              </h3>

              <p class="small text-muted mb-3">
                <span>{{ article.source }}</span>
                <span aria-hidden="true"> · </span>
                <time :datetime="article.date">
                  {{ formatDate(article.date) }}
                </time>
              </p>

              <p>{{ article.summary }}</p>

              <div class="mt-auto pt-2">
                <a
                  :href="article.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="btn btn-outline-primary"
                  :aria-label="`Read full article: ${article.title} (opens in a new tab)`"
                >
                  Read Full Article
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>

      <div
        v-if="filteredNews.length === 0"
        class="text-center py-5"
        role="status"
      >
        <h3 class="h5">No matching articles found</h3>
        <p class="text-muted">
          Try another keyword or select a different category.
        </p>
        <button
          type="button"
          class="btn btn-outline-primary"
          @click="resetFilters"
        >
          Clear Filters
        </button>
      </div>

      <nav
        v-if="totalPages > 1"
        class="mt-4"
        aria-label="News pagination"
      >
        <ul class="pagination justify-content-center flex-wrap">
          <li
            class="page-item"
            :class="{ disabled: currentPage === 1 }"
          >
            <button
              type="button"
              class="page-link"
              :disabled="currentPage === 1"
              @click="currentPage--"
            >
              Previous
            </button>
          </li>

          <li
            v-for="page in totalPages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button
              type="button"
              class="page-link"
              :aria-current="currentPage === page ? 'page' : undefined"
              :aria-label="`Go to page ${page}`"
              @click="currentPage = page"
            >
              {{ page }}
            </button>
          </li>

          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <button
              type="button"
              class="page-link"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
            >
              Next
            </button>
          </li>
        </ul>
      </nav>
    </section>

    <section class="mt-5" aria-labelledby="news-resources-title">
      <div class="card">
        <div class="card-body">
          <h2 id="news-resources-title" class="h4">
            Explore More Environmental News
          </h2>
          <p>
            Visit these publishers for more recent environmental reporting.
          </p>

          <div class="d-flex flex-wrap gap-2">
            <a
              href="https://www.theguardian.com/environment"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline-success"
            >
              The Guardian Environment
              <span aria-hidden="true">↗</span>
            </a>

            <a
              href="https://www.abc.net.au/news/topic/environment"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-outline-success"
            >
              ABC Environment
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>

    <footer class="border-top pt-3 mt-5">
      <p class="text-muted small mb-0">
        Articles are selected from external news publishers.
        Publication dates refer to the original articles.
        This collection is not a live news feed.
      </p>
    </footer>
  </main>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

defineEmits(['back-home'])

const searchQuery = ref('')
const selectedCategory = ref('all')
const sortOrder = ref('newest')
const currentPage = ref(1)
const pageSize = 3

const articles = [
  {
    id: 1,
    title:
      'Four years after the promises of Cop15, our biodiversity targets are slipping away',
    category: 'Biodiversity',
    source: 'The Guardian',
    date: '2026-10-14',
    summary:
      'An analysis of global biodiversity commitments and the challenges countries face in meeting their conservation targets.',
    url:
      'https://www.theguardian.com/environment/2026/oct/14/four-years-after-the-promises-of-cop15-our-biodiversity-targets-are-slipping-away',
  },
  {
    id: 2,
    title:
      "It's not glamorous: the volunteers counting flushed wet wipes on the banks of the Thames",
    category: 'Pollution',
    source: 'The Guardian',
    date: '2026-10-13',
    summary:
      'Volunteers monitor wet-wipe pollution along the River Thames, helping researchers understand plastic waste in waterways.',
    url:
      'https://www.theguardian.com/environment/2026/oct/13/volunteers-flushed-plastic-wet-wipes-river-thames',
  },
  {
    id: 3,
    title:
      "Our place in the sun: Australia's uptake of solar panels is already through the roof. How much higher could it get?",
    category: 'Renewable Energy',
    source: 'The Guardian',
    date: '2026-10-11',
    summary:
      'A look at the expansion of rooftop solar across Australia and the opportunities for further clean energy adoption.',
    url:
      'https://www.theguardian.com/environment/2026/oct/11/australia-solar-panels-uptake-record-through-roof',
  },
  {
    id: 4,
    title:
      "Don't go the extra mile: is local food better for the environment?",
    category: 'Sustainable Living',
    source: 'The Guardian',
    date: '2026-10-10',
    summary:
      'An examination of food-related environmental impacts, including transport, production, packaging and food waste.',
    url:
      'https://www.theguardian.com/australia-news/2026/oct/10/support-local-food-producers-environment',
  },
  {
    id: 5,
    title:
      "Amazing piece of technology: solar traffic controller for apartments takes top Australian design award",
    category: 'Renewable Energy',
    source: 'The Guardian',
    date: '2026-10-09',
    summary:
      'An Australian innovation helps apartment residents share rooftop solar power, expanding access to renewable energy.',
    url:
      'https://www.theguardian.com/environment/2026/oct/09/amazing-piece-of-technology-solar-traffic-controller-for-apartments-takes-top-australian-design-award',
  },
  {
    id: 6,
    title:
      "Cop31 host urges wealthy countries to spend much more on climate than defence",
    category: 'Climate Change',
    source: 'The Guardian',
    date: '2026-10-09',
    summary:
      'International climate discussions focus on financing, adaptation and the challenges of global cooperation.',
    url:
      'https://www.theguardian.com/environment/2026/oct/09/cop31-host-wealthy-countries-climate-crisis-spending-defence-nato',
  },
]

const categories = [...new Set(articles.map((article) => article.category))].sort()

const filteredNews = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const result = articles.filter((article) => {
    const matchesCategory =
      selectedCategory.value === 'all' ||
      article.category === selectedCategory.value

    const searchableText = [
      article.title,
      article.summary,
      article.category,
      article.source,
    ]
      .join(' ')
      .toLowerCase()

    return matchesCategory && searchableText.includes(query)
  })

  return [...result].sort((a, b) => {
    const comparison = a.date.localeCompare(b.date)

    return sortOrder.value === 'newest'
      ? -comparison
      : comparison
  })
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredNews.value.length / pageSize))
)

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredNews.value.slice(start, start + pageSize)
})

const startRow = computed(() =>
  filteredNews.value.length === 0
    ? 0
    : (currentPage.value - 1) * pageSize + 1
)

const endRow = computed(() =>
  Math.min(currentPage.value * pageSize, filteredNews.value.length)
)

watch([searchQuery, selectedCategory, sortOrder], () => {
  currentPage.value = 1
})

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  sortOrder.value = 'newest'
  currentPage.value = 1
}

function formatDate(date) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
</script>
