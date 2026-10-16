<template>
  <p v-if="pending" class="container mt-3" role="status">Updating accounts...</p>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h1>Administrator</h1>
        <p class="text-muted mb-0">Manage registered accounts.</p>
      </div>

      <button type="button" class="btn btn-primary" @click="$emit('back-home')">
        Back to Home
      </button>
    </div>

    <div
      v-if="message"
      class="alert"
      :class="messageType"
      :role="messageType === 'alert-danger' ? 'alert' : 'status'"
    >
      {{ message }}
    </div>

    <div class="card">
      <div class="card-body">
        <h2 class="h5 mb-3">User Management</h2>

        <div class="row g-2 mb-3">
          <div class="col-12 col-md-4">
            <label for="searchColumn" class="form-label"> Search Column </label>

            <select id="searchColumn" v-model="searchColumn" class="form-select">
              <option value="all">All Columns</option>
              <option value="username">Username</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
          </div>

          <div class="col-12 col-md-8">
            <label for="searchInput" class="form-label"> Search Users </label>

            <input
              id="searchInput"
              v-model="searchQuery"
              type="search"
              class="form-control"
              :placeholder="
                searchColumn === 'all' ? 'Search all columns...' : `Search by ${searchColumn}...`
              "
            />
          </div>
        </div>

        <div class="table-responsive">
          <table class="table table-striped table-hover align-middle mb-0">
            <caption class="visually-hidden">
              Registered user accounts
            </caption>

            <thead class="table-light">
              <tr>
                <th scope="col">Avatar</th>

                <th scope="col" :aria-sort="ariaSort('username')">
                  <button
                    type="button"
                    class="btn btn-link text-dark text-decoration-none fw-bold p-0"
                    @click="sortBy('username')"
                  >
                    Username {{ sortIndicator('username') }}
                  </button>
                </th>

                <th scope="col" :aria-sort="ariaSort('email')">
                  <button
                    type="button"
                    class="btn btn-link text-dark text-decoration-none fw-bold p-0"
                    @click="sortBy('email')"
                  >
                    Email {{ sortIndicator('email') }}
                  </button>
                </th>

                <th scope="col" :aria-sort="ariaSort('role')">
                  <button
                    type="button"
                    class="btn btn-link text-dark text-decoration-none fw-bold p-0"
                    @click="sortBy('role')"
                  >
                    Role {{ sortIndicator('role') }}
                  </button>
                </th>

                <th scope="col">Action</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="account in paginatedAccounts" :key="account.id">
                <td>
                  <div
                    class="rounded-circle bg-light border d-flex align-items-center justify-content-center"
                    style="width: 42px; height: 42px"
                    :aria-label="`Avatar for ${account.username}`"
                    role="img"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      aria-hidden="true"
                      class="text-secondary"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 21a8 8 0 0 1 16 0" />
                    </svg>
                  </div>
                </td>

                <td>{{ account.username }}</td>

                <td>{{ account.email }}</td>

                <td>
                  <span
                    class="badge"
                    :class="account.role === 'admin' ? 'text-bg-danger' : 'text-bg-secondary'"
                  >
                    {{ account.role }}
                  </span>
                </td>

                <td>
                  <button
                    v-if="account.role !== 'admin'"
                    type="button"
                    class="btn btn-outline-danger btn-sm"
                    :aria-label="`Delete account ${account.username}`"
                    :disabled="pending"
                    @click="remove(account.id)"
                  >
                    Delete
                  </button>

                  <span v-else class="text-muted"> Protected </span>
                </td>
              </tr>

              <tr v-if="paginatedAccounts.length === 0">
                <td colspan="5" class="text-center text-muted py-4">No matching users found.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mt-3"
        >
          <p class="text-muted mb-0" role="status" aria-live="polite" aria-atomic="true">
            Showing {{ startRow }}–{{ endRow }} of {{ filteredAccounts.length }} users
          </p>

          <nav aria-label="User table pagination">
            <ul class="pagination mb-0">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
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
                  @click="currentPage = page"
                >
                  {{ page }}
                </button>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'

const props = defineProps({
  getAccounts: {
    type: Function,
    required: true,
  },
  deleteAccount: {
    type: Function,
    required: true,
  },
})

defineEmits(['back-home'])

const accounts = ref([])
const pending = ref(false)

async function loadAccounts() {
  pending.value = true
  try {
    accounts.value = await props.getAccounts()
  } catch (error) {
    messageType.value = 'alert-danger'
    message.value = error.message
  } finally {
    pending.value = false
  }
}
onMounted(loadAccounts)

const message = ref('')
const messageType = ref('alert-success')

const searchColumn = ref('all')
const searchQuery = ref('')

const sortColumn = ref('username')
const sortDirection = ref('asc')

const currentPage = ref(1)
const pageSize = 10

const filteredAccounts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  const result = accounts.value.filter((account) => {
    if (!query) return true

    if (searchColumn.value === 'all') {
      return ['username', 'email', 'role'].some((column) =>
        String(account[column] ?? '')
          .toLowerCase()
          .includes(query),
      )
    }

    return String(account[searchColumn.value] ?? '')
      .toLowerCase()
      .includes(query)
  })

  return [...result].sort((a, b) => {
    const first = String(a[sortColumn.value] ?? '')
    const second = String(b[sortColumn.value] ?? '')

    const comparison = first.localeCompare(second, undefined, {
      sensitivity: 'base',
      numeric: true,
    })

    return sortDirection.value === 'asc' ? comparison : -comparison
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAccounts.value.length / pageSize)))

const paginatedAccounts = computed(() => {
  const start = (currentPage.value - 1) * pageSize

  return filteredAccounts.value.slice(start, start + pageSize)
})

const startRow = computed(() =>
  filteredAccounts.value.length === 0 ? 0 : (currentPage.value - 1) * pageSize + 1,
)

const endRow = computed(() => Math.min(currentPage.value * pageSize, filteredAccounts.value.length))

watch([searchQuery, searchColumn], () => {
  currentPage.value = 1
})

watch(totalPages, (pages) => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }

  currentPage.value = 1
}

const sortIndicator = (column) => {
  if (sortColumn.value !== column) return '↕'

  return sortDirection.value === 'asc' ? '↑' : '↓'
}

const ariaSort = (column) => {
  if (sortColumn.value !== column) return 'none'

  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

const remove = async (id) => {
  if (pending.value) return
  pending.value = true
  message.value = ''

  try {
    await props.deleteAccount(id)
    accounts.value = accounts.value.filter((account) => account.id !== id)

    messageType.value = 'alert-success'
    message.value = 'Account deleted.'
  } catch (error) {
    messageType.value = 'alert-danger'

    message.value = error instanceof Error ? error.message : 'Unable to delete account.'
  } finally {
    pending.value = false
  }
}
</script>
