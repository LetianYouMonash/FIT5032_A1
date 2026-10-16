
<template>
  <a class="skip-link" href="#main-content"> Skip to main content </a>

  <p v-if="sessionError" class="alert alert-warning m-3" role="alert">
    {{ sessionError }}
  </p>

  <p class="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
    {{ pageAnnouncement }}
  </p>

  <main id="main-content" ref="mainElement" tabindex="-1">
    <p v-if="loadingSession" class="container py-5" role="status">
      Checking your session...
    </p>

    <FirebaseLogin
      v-else-if="currentPage === 'login'"
      @login-success="loginSuccess"
    />

    <Home
      v-else-if="currentUser && currentPage === 'home'"
      :is-admin="currentUser?.role === 'admin'"
      @change-page="changePage"
      @back-login="backToLogin"
    />

    <Recycling
      v-else-if="currentUser && currentPage === 'recycling'"
      :current-user="currentUser"
      :get-rating-summary="ratingService.getRatingSummary"
      :save-rating="ratingService.saveRating"
      @back-home="currentPage = 'home'"
    />

    <Map
      v-else-if="currentUser && currentPage === 'map'"
      @back-home="currentPage = 'home'"
    />

    <Learn
      v-else-if="currentUser && currentPage === 'learn'"
      @back-home="currentPage = 'home'"
    />

    <News
      v-else-if="currentUser && currentPage === 'news'"
      @back-home="currentPage = 'home'"
    />

    <Email
      v-else-if="currentUser && currentPage === 'email'"
      :current-user="currentUser"
      @back-home="currentPage = 'home'"
    />

    <Profile
      v-else-if="currentUser && currentPage === 'profile'"
      :current-user="currentUser"
      @profile-updated="handleProfileUpdated"
      @back-home="currentPage = 'home'"
    />

    <Admin
      v-else-if="currentUser?.role === 'admin' && currentPage === 'admin'"
      :get-accounts="getAccounts"
      :delete-account="deleteAccount"
      @back-home="currentPage = 'home'"
    />
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

import FirebaseLogin from './FirebaseLogin.vue'

import {
  observeFirebase,
  firebaseLogout,
  firebaseError,
} from './firebaseAuth.js'

import { getAccounts, deleteAccount } from './accountsApi.js'
import { ratingService } from './ratingsApi.js'

import Home from './Home.vue'
import Recycling from './Recycling.vue'
import Map from './Map.vue'
import Learn from './Learn.vue'
import News from './News.vue'
import Email from './Email.vue'
import Profile from './Profile.vue'
import Admin from './Admin.vue'

const currentUser = ref(null)
const currentPage = ref('login')
const loadingSession = ref(true)
const sessionError = ref('')
const mainElement = ref(null)
const pageAnnouncement = ref('')

const pageNames = {
  login: 'Login',
  home: 'Home',
  recycling: 'Recycling',
  map: 'Recycling Location Map',
  learn: 'Learn',
  news: 'News',
  email: 'Email',
  profile: 'Profile',
  admin: 'Admin',
}

let unsubscribe
let disposed = false

watch(
  [currentPage, loadingSession],
  async ([page, loading], [previousPage, previousLoading]) => {
    if (loading) {
      document.title = 'Loading | Recycling Application'
      return
    }

    document.title = `${pageNames[page] || 'Home'} | Recycling Application`

    pageAnnouncement.value = `${pageNames[page] || 'Home'} page loaded`

    if (page !== previousPage && !previousLoading) {
      await nextTick()

      if (!disposed) {
        mainElement.value?.focus({ preventScroll: true })
      }
    }
  },
  { immediate: true, flush: 'post' },
)

onMounted(async () => {
  try {
    const stop = await observeFirebase(
      (user) => {
        if (user) {
          // Keep the current page when the same user's token refreshes.
          if (currentUser.value?.id === user.id) {
            currentUser.value = user
            sessionError.value = ''
          } else {
            loginSuccess(user)
          }
        } else {
          currentUser.value = null
          currentPage.value = 'login'
        }

        loadingSession.value = false
      },
      (error) => {
        sessionError.value = firebaseError(error)
        loadingSession.value = false
      },
    )

    if (disposed) {
      stop()
    } else {
      unsubscribe = stop
    }
  } catch (error) {
    sessionError.value = firebaseError(error)
    loadingSession.value = false
  }
})

onUnmounted(() => {
  disposed = true
  unsubscribe?.()
})

const loginSuccess = (user) => {
  sessionError.value = ''
  currentUser.value = user
  currentPage.value = 'home'
}

// Sync updated Firebase profile data without leaving the Profile page.
const handleProfileUpdated = (updatedUser) => {
  if (
    updatedUser &&
    currentUser.value?.id === updatedUser.id
  ) {
    currentUser.value = updatedUser
  }
}

const changePage = (page) => {
  const publicPages = [
    'home',
    'recycling',
    'map',
    'learn',
    'news',
    'profile',
    'email',
  ]

  const allowed =
    publicPages.includes(page) ||
    (page === 'admin' && currentUser.value?.role === 'admin')

  currentPage.value =
    currentUser.value && allowed
      ? page
      : currentUser.value
        ? 'home'
        : 'login'
}

const backToLogin = async () => {
  try {
    if (currentUser.value?.provider === 'firebase') {
      await firebaseLogout()
    }

    currentUser.value = null
    currentPage.value = 'login'
    sessionError.value = ''
  } catch (error) {
    sessionError.value = firebaseError(error)
  }
}
</script>

<style>
.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 9999;
  padding: 12px 18px;
  background: #ffffff;
  color: #111827;
  border: 3px solid #111827;
  border-radius: 6px;
  font-weight: 700;
  text-decoration: none;
  transform: translateY(-180%);
}

.skip-link:focus,
.skip-link:focus-visible {
  transform: translateY(0);
}

#main-content:focus {
  outline: none;
}

:where(button, a, input, select, textarea, [tabindex]):focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
